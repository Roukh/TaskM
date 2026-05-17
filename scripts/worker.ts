/**
 * TaskM VPS Worker
 *
 * Polls the `jobs` table for queued work and executes layer agents.
 * Uses an optimistic-claim pattern (UPDATE … WHERE status='queued' RETURNING)
 * so multiple worker processes are safe without advisory locks.
 *
 * Run:  pnpm worker
 * Dev:  pnpm worker:dev
 */

import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { and, asc, eq } from 'drizzle-orm';
import * as schema from '../lib/db/schema';
import type { Job } from '../lib/db/schema';
import { WORKER_CONFIG } from './worker-config';

// ── DB client (WebSocket pool — supports real transactions) ───────────────────

function buildDb() {
   const url = process.env.DATABASE_URL;
   if (!url) throw new Error('DATABASE_URL env var is not set');
   const pool = new Pool({ connectionString: url });
   return drizzle(pool, { schema });
}

const db = buildDb();

// ── Shutdown state ────────────────────────────────────────────────────────────

let shuttingDown = false;
let currentJobId: string | null = null;

// ── Logging helpers ───────────────────────────────────────────────────────────

function workerLog(msg: string) {
   process.stdout.write(`[worker] ${new Date().toISOString()} ${msg}\n`);
}

function workerError(msg: string, err?: unknown) {
   const detail = err instanceof Error ? err.message : String(err ?? '');
   process.stderr.write(
      `[worker:error] ${new Date().toISOString()} ${msg}${detail ? ` — ${detail}` : ''}\n`
   );
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function writeLog(
   projectId: string,
   layerIndex: number,
   jobId: string,
   type: string,
   summary: string,
   metadata: Record<string, unknown> = {}
) {
   await db.insert(schema.logs).values({
      projectId,
      layerIndex,
      jobId,
      type,
      summary,
      metadata,
   });
}

// ── Job claim (optimistic) ────────────────────────────────────────────────────
//
// 1. Select the oldest queued job.
// 2. Attempt to update it to 'running' only if it is still 'queued'.
// 3. If rowsAffected === 0 another worker claimed it first — skip.

async function claimNextJob(): Promise<Job | null> {
   // Fetch the oldest queued job
   const [candidate] = await db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.status, 'queued'))
      .orderBy(asc(schema.jobs.createdAt))
      .limit(1);

   if (!candidate) return null;

   // Optimistically claim it
   const claimed = await db
      .update(schema.jobs)
      .set({ status: 'running', startedAt: new Date() })
      .where(and(eq(schema.jobs.id, candidate.id), eq(schema.jobs.status, 'queued')))
      .returning();

   return claimed[0] ?? null;
}

// ── Job execution ─────────────────────────────────────────────────────────────

async function executeJob(job: Job): Promise<void> {
   workerLog(`Executing layer ${job.layerIndex} for project ${job.projectId}`);

   // Stub: fetch all 'todo' tasks for this project+layer
   const todoTasks = await db
      .select()
      .from(schema.tasks)
      .where(
         and(
            eq(schema.tasks.projectId, job.projectId),
            eq(schema.tasks.layerIndex, job.layerIndex),
            eq(schema.tasks.status, 'todo')
         )
      );

   workerLog(`Found ${todoTasks.length} todo task(s) for layer ${job.layerIndex}`);

   // Simulate 2-second work delay
   await new Promise<void>((resolve) => setTimeout(resolve, 2000));

   // Mark tasks as in-progress and write a log per task
   for (const task of todoTasks) {
      await db
         .update(schema.tasks)
         .set({ status: 'in-progress' })
         .where(eq(schema.tasks.id, task.id));

      await writeLog(
         job.projectId,
         job.layerIndex,
         job.id,
         'task_done',
         `Agent picked up: ${task.title}`,
         { taskId: task.id }
      );
   }

   workerLog(`Layer ${job.layerIndex} execution complete for project ${job.projectId}`);
}

// ── Job lifecycle ─────────────────────────────────────────────────────────────

async function processJob(job: Job): Promise<void> {
   currentJobId = job.id;

   await writeLog(
      job.projectId,
      job.layerIndex,
      job.id,
      'layer_start',
      `Starting layer ${job.layerIndex} for project ${job.projectId}`
   );

   const timeout = new Promise<never>((_, reject) =>
      setTimeout(
         () => reject(new Error(`Job timed out after ${WORKER_CONFIG.jobTimeoutMs}ms`)),
         WORKER_CONFIG.jobTimeoutMs
      )
   );

   try {
      await Promise.race([executeJob(job), timeout]);

      await db
         .update(schema.jobs)
         .set({ status: 'done', finishedAt: new Date() })
         .where(eq(schema.jobs.id, job.id));

      await writeLog(
         job.projectId,
         job.layerIndex,
         job.id,
         'layer_complete',
         `Layer ${job.layerIndex} completed for project ${job.projectId}`
      );

      workerLog(`Job ${job.id} finished (done)`);
   } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      await db
         .update(schema.jobs)
         .set({ status: 'failed', finishedAt: new Date(), error: message })
         .where(eq(schema.jobs.id, job.id));

      await writeLog(
         job.projectId,
         job.layerIndex,
         job.id,
         'error',
         `Layer ${job.layerIndex} failed: ${message}`,
         { error: message }
      );

      workerError(`Job ${job.id} failed`, err);
   } finally {
      currentJobId = null;
   }
}

// ── Poll loop ─────────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
   if (shuttingDown) return;

   try {
      const job = await claimNextJob();

      if (job) {
         await processJob(job);
      }
   } catch (err) {
      workerError('Poll error', err);
   }

   if (!shuttingDown) {
      setTimeout(poll, WORKER_CONFIG.pollIntervalMs);
   }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function handleShutdown(signal: string): Promise<void> {
   if (shuttingDown) return;
   shuttingDown = true;

   workerLog(`Received ${signal} — shutting down gracefully`);

   if (currentJobId !== null) {
      workerLog(`Mid-job shutdown detected; marking job ${currentJobId} as failed`);
      try {
         await db
            .update(schema.jobs)
            .set({ status: 'failed', finishedAt: new Date(), error: 'Worker terminated' })
            .where(eq(schema.jobs.id, currentJobId));
      } catch (err) {
         workerError('Failed to mark in-flight job as failed during shutdown', err);
      }
   }

   process.exit(0);
}

process.on('SIGINT', () => {
   void handleShutdown('SIGINT');
});
process.on('SIGTERM', () => {
   void handleShutdown('SIGTERM');
});

// ── Entry point ───────────────────────────────────────────────────────────────

workerLog(`Worker started — poll interval ${WORKER_CONFIG.pollIntervalMs}ms`);
void poll();
