import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs, projects } from '@/lib/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const postBodySchema = z.object({
   projectId: z.string().min(1),
   layerIndex: z.number().int().min(0).max(4),
});

const validStatuses = ['queued', 'running', 'done', 'failed'] as const;
type JobStatus = (typeof validStatuses)[number];

// POST /api/jobs — enqueue a job
export async function POST(req: NextRequest) {
   let body: unknown;
   try {
      body = await req.json();
   } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }

   const parsed = postBodySchema.safeParse(body);
   if (!parsed.success) {
      return NextResponse.json(
         { error: parsed.error.issues.map((i) => i.message).join(', ') },
         { status: 400 }
      );
   }

   const { projectId, layerIndex } = parsed.data;

   // Validate project exists
   const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

   if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   }

   // Check for existing active job for same project+layer
   const activeJobs = await db
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(
         and(
            eq(jobs.projectId, projectId),
            // layerIndex column is smallint — cast via sql is not needed; drizzle handles it
            eq(jobs.layerIndex, layerIndex),
            inArray(jobs.status, ['queued', 'running'])
         )
      )
      .limit(1);

   if (activeJobs.length > 0) {
      return NextResponse.json(
         { error: `A job for layer ${layerIndex} is already ${activeJobs[0].status}` },
         { status: 409 }
      );
   }

   const [job] = await db
      .insert(jobs)
      .values({
         projectId,
         layerIndex,
         status: 'queued',
      })
      .returning();

   return NextResponse.json({ job }, { status: 201 });
}

// GET /api/jobs?projectId=xxx&status=queued|running|done|failed
export async function GET(req: NextRequest) {
   const { searchParams } = req.nextUrl;
   const projectId = searchParams.get('projectId');
   const statusParam = searchParams.get('status');

   if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
   }

   const conditions = [eq(jobs.projectId, projectId)];

   if (statusParam !== null) {
      if (!(validStatuses as readonly string[]).includes(statusParam)) {
         return NextResponse.json(
            { error: `status must be one of: ${validStatuses.join(', ')}` },
            { status: 400 }
         );
      }
      conditions.push(eq(jobs.status, statusParam as JobStatus));
   }

   const rows = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(50);

   return NextResponse.json({ jobs: rows });
}
