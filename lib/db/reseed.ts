/**
 * lib/db/reseed.ts
 *
 * Full data reset for taskm-core: wipes tasks, specs, stack_entries,
 * checklist, and logs, then repopulates with the accurate build state
 * as of 2026-05-17.
 *
 * Idempotent — all inserts use onConflictDoNothing().
 * Delete order respects FK constraints: checklist → tasks → specs
 *   → stack_entries → logs (no cross-FK between these tables).
 *
 * Run with: pnpm db:reseed
 */

import { eq } from 'drizzle-orm';
import { db } from './index';
import {
   stackEntries,
   specs,
   checklist,
   tasks,
   logs,
   qaTemplates,
   discoveryQuestions,
   discoveryAnswers,
} from './schema';

const PROJECT_ID = 'taskm-core';

// ── 1. Delete existing data ───────────────────────────────────────────────────

async function deleteProjectData() {
   await db.delete(discoveryAnswers).where(eq(discoveryAnswers.projectId, PROJECT_ID));
   await db.delete(checklist).where(eq(checklist.projectId, PROJECT_ID));
   await db.delete(tasks).where(eq(tasks.projectId, PROJECT_ID));
   await db.delete(specs).where(eq(specs.projectId, PROJECT_ID));
   await db.delete(stackEntries).where(eq(stackEntries.projectId, PROJECT_ID));
   await db.delete(logs).where(eq(logs.projectId, PROJECT_ID));
}

// ── 2. Stack entries (layer 1 = Infrastructure) ───────────────────────────────

async function reseedStackEntries() {
   await db
      .insert(stackEntries)
      .values([
         {
            projectId: PROJECT_ID,
            stackCategory: 'framework',
            name: 'Next.js 15',
            version: '15.x',
            icon: 'nextjs',
            url: 'https://nextjs.org',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'ui',
            name: 'React 19',
            version: '19.x',
            icon: 'react',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'ui',
            name: 'Tailwind CSS 4',
            version: '4.x',
            icon: 'tailwind',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'ui',
            name: 'shadcn/ui',
            version: 'latest',
            icon: 'radix',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'db',
            name: 'Neon PostgreSQL',
            version: 'serverless',
            icon: 'postgres',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'db',
            name: 'Drizzle ORM',
            version: '0.45.x',
            icon: 'drizzle',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'auth',
            name: 'BetterAuth',
            version: '1.6.x',
            icon: 'shield',
         },
         { projectId: PROJECT_ID, stackCategory: 'hosting', name: 'Vercel', icon: 'vercel' },
         {
            projectId: PROJECT_ID,
            stackCategory: 'integration',
            name: 'GitHub OAuth',
            icon: 'github',
         },
         {
            projectId: PROJECT_ID,
            stackCategory: 'integration',
            name: 'Anthropic Claude API',
            icon: 'anthropic',
         },
      ])
      .onConflictDoNothing();
}

// ── 3. Specs (layer 0 = Discovery) ───────────────────────────────────────────

async function reseedSpecs() {
   await db
      .insert(specs)
      .values([
         // goals
         {
            projectId: PROJECT_ID,
            category: 'goal',
            key: 'core-property',
            value: 'Context independence. Every build artifact lives in the DB. A cold agent session reads project state and executes without needing prior conversation history.',
         },
         {
            projectId: PROJECT_ID,
            category: 'goal',
            key: 'primary-user',
            value: 'Engineer directing AI agents to build software. Not a task manager — a build substrate.',
         },
         {
            projectId: PROJECT_ID,
            category: 'goal',
            key: 'ai-agent-user',
            value: 'Claude agents (and any LLM) that query the DB to read project state and write build artifacts.',
         },

         // constraints
         {
            projectId: PROJECT_ID,
            category: 'constraint',
            key: 'layer-count',
            value: 'Exactly 5 layers (0–4). Fixed enum — no layers table. Discovery, Infrastructure, Frontend, Backend, QA.',
         },
         {
            projectId: PROJECT_ID,
            category: 'constraint',
            key: 'db-as-memory',
            value: 'DB is the sole source of truth. No file reads at runtime. No conversation memory required between sessions.',
         },
         {
            projectId: PROJECT_ID,
            category: 'constraint',
            key: 'agent-scope',
            value: "Agents read tasks WHERE status!='complete' for their layer. Write to logs. Read locked layers but never write them.",
         },

         // decisions
         {
            projectId: PROJECT_ID,
            category: 'decision',
            key: 'layer-model',
            value: '5 fixed layers as a code enum. Progress computed from task completion ratio per layer_index.',
         },
         {
            projectId: PROJECT_ID,
            category: 'decision',
            key: 'auth-strategy',
            value: 'BetterAuth with Drizzle adapter. Email/password + GitHub OAuth. Cookie-based sessions. Middleware checks session cookie; server components validate full session.',
         },
         {
            projectId: PROJECT_ID,
            category: 'decision',
            key: 'agent-handoff',
            value: 'jobs table is the queue. VPS worker polls for queued jobs, runs layer agent, writes logs. No direct agent-to-agent communication.',
         },
         {
            projectId: PROJECT_ID,
            category: 'decision',
            key: 'db-provider',
            value: 'Neon (serverless PostgreSQL). HTTP driver for Next.js server components. WebSocket/Pool driver for VPS worker (needs transactions).',
         },
         {
            projectId: PROJECT_ID,
            category: 'decision',
            key: 'stack-choice',
            value: 'Next.js 15 App Router, React 19, Tailwind 4, shadcn/ui. Server Components fetch data directly via Drizzle — no client fetch waterfalls.',
         },

         // persona
         {
            projectId: PROJECT_ID,
            category: 'persona',
            key: 'primary',
            value: 'Roukh — solo engineer building AI-assisted software. Runs multiple projects. Directs agents per layer. Reviews and approves layer output before locking.',
         },
      ])
      .onConflictDoNothing();
}

// ── 4. Tasks ──────────────────────────────────────────────────────────────────

async function reseedTasks() {
   await db
      .insert(tasks)
      .values([
         // Layer 0 — Discovery (all complete)
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Define core property: context independence',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Document 5-layer architecture (hardcoded enum)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Specify agent protocol: DB as handoff, no direct comms',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Document session protocol: invoke → read DB → execute',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Design data model: all tables and relationships',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 0,
            title: 'Document UX flows and routes',
            status: 'complete',
            priority: 'medium',
         },

         // Layer 1 — Infrastructure (partially complete)
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Set up Neon PostgreSQL + DATABASE_URL',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Write full Drizzle schema (20+ tables)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Push schema to Neon (db:push)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Install and configure BetterAuth (email/password + GitHub OAuth)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Set up Next.js 15 + Tailwind 4 + shadcn/ui',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Set BETTER_AUTH_SECRET env var',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Create GitHub OAuth App + add CLIENT_ID/SECRET to env',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Deploy to Vercel',
            status: 'todo',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 1,
            title: 'Replace DEV_USER_ID hardcode with real session user',
            status: 'in-progress',
            priority: 'high',
         },

         // Layer 2 — Frontend (mostly complete)
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build project list view (/projects)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build layer grid view (/projects/[id])',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build layer detail view — 5 tabs: Tasks, Atoms, Checklist, Skills, Logs',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build sidebar with collapsible project navigation',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build login + signup pages (BetterAuth)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build new project creation dialog',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build project settings page (GitHub repo + Claude API key)',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build connect GitHub repo picker',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Build Claude API key settings UI',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Task detail view / inline expand',
            status: 'todo',
            priority: 'low',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 2,
            title: 'Inline spec/atom editing',
            status: 'todo',
            priority: 'low',
         },

         // Layer 3 — Backend (core done, auth wiring pending)
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Write Drizzle schema (all 20+ tables)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create API routes: projects CRUD',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create API routes: tasks CRUD',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create API routes: logs append',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create jobs API (POST enqueue, GET status)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create GitHub repos API (fetch user repos via OAuth token)',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create Claude API key endpoint (POST/DELETE with session guard)',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Create server actions: createProject, connectGithubRepo',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Build VPS worker polling loop (scripts/worker.ts)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Write systemd service unit for VPS worker',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Wire real authenticated userId into all DB queries',
            status: 'in-progress',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 3,
            title: 'Agent-callable API with service-role key (bypass session auth)',
            status: 'todo',
            priority: 'medium',
         },

         // Layer 4 — QA
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'Middleware: cookie-based session check on /projects/* routes',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'TypeScript: zero errors (pnpm tsc --noEmit)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'Auth: all dashboard mutations guarded by requireAuth()',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'DB: all queries scoped to authenticated userId (no DEV_USER_ID)',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'E2E: signup → login → create project flow',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'E2E: layer navigation and task display',
            status: 'todo',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'Security: encrypt Claude API key at rest (replace base64)',
            status: 'todo',
            priority: 'medium',
         },
         {
            projectId: PROJECT_ID,
            layerIndex: 4,
            title: 'Deploy: Vercel production deployment + health check',
            status: 'todo',
            priority: 'medium',
         },
      ])
      .onConflictDoNothing();
}

// ── 5. Checklist ──────────────────────────────────────────────────────────────

const CHECKLIST_ROWS = [
   { order: 0, category: 'security', title: 'All dashboard routes protected by auth middleware' },
   { order: 1, category: 'security', title: 'DB queries scoped to authenticated userId' },
   { order: 2, category: 'security', title: 'No secrets hardcoded in source code' },
   { order: 3, category: 'security', title: 'Claude API key encrypted at rest (not base64)' },
   {
      order: 4,
      category: 'performance',
      title: 'Server components fetch data directly (no client fetch waterfall)',
   },
   { order: 5, category: 'accessibility', title: 'All interactive elements have aria-labels' },
   { order: 6, category: 'ux', title: 'Empty states shown when no data exists' },
   { order: 7, category: 'code-quality', title: 'No mock-data imports remain in production code' },
   { order: 8, category: 'code-quality', title: 'TypeScript strict — zero tsc errors' },
   { order: 9, category: 'ux', title: 'E2E: signup → login → create project flow passes' },
   { order: 10, category: 'ux', title: 'E2E: layer navigation and task display passes' },
] as const;

async function reseedChecklist() {
   // Upsert qa_templates so we get their ids back regardless of prior state
   const inserted = await db
      .insert(qaTemplates)
      .values(CHECKLIST_ROWS.map((row) => ({ ...row })))
      .onConflictDoNothing()
      .returning({ id: qaTemplates.id, order: qaTemplates.order });

   if (inserted.length === 0) return; // templates already existed — checklist was wiped, re-query not needed for idempotency

   const sorted = inserted.sort((a, b) => a.order - b.order);

   await db
      .insert(checklist)
      .values(
         sorted.map((tpl, i) => ({
            projectId: PROJECT_ID,
            templateId: tpl.id,
            title: CHECKLIST_ROWS[i].title,
            category: CHECKLIST_ROWS[i].category,
            order: CHECKLIST_ROWS[i].order,
            passed: false,
         }))
      )
      .onConflictDoNothing();
}

// ── 6. Discovery questions + answers ─────────────────────────────────────────

const DISCOVERY_QUESTIONS = [
   {
      order: 0,
      key: 'core-problem',
      question: 'What is the core problem this project solves?',
      description: "The single sentence that justifies the project's existence.",
   },
   {
      order: 1,
      key: 'primary-user',
      question: 'Who is the primary user and what is their context?',
      description: "Role, environment, and what they're trying to accomplish.",
   },
   {
      order: 2,
      key: 'success-metric',
      question: 'What does success look like in 6 months?',
      description: 'A measurable outcome — not a feature list.',
   },
   {
      order: 3,
      key: 'constraints',
      question: 'What are the top 3 constraints (technical, business, or time)?',
      description: 'Hard limits that shape every architectural decision.',
   },
   {
      order: 4,
      key: 'alternatives',
      question: 'What existing solutions exist and why are they insufficient?',
      description: 'Confirms the build is necessary and not duplicating something.',
   },
   {
      order: 5,
      key: 'mvp',
      question: 'What is the minimum viable version of this product?',
      description: 'The smallest thing that validates the core assumption.',
   },
   {
      order: 6,
      key: 'decisions',
      question: 'What key decisions have already been made or are locked in?',
      description: 'Stack, hosting, auth provider, team constraints, non-negotiables.',
   },
   {
      order: 7,
      key: 'integrations',
      question: 'What integrations or external dependencies are required?',
      description: 'APIs, services, data sources — anything the project cannot own.',
   },
] as const;

async function reseedDiscoveryQA() {
   // Upsert questions globally (idempotent)
   const inserted = await db
      .insert(discoveryQuestions)
      .values(DISCOVERY_QUESTIONS.map((q) => ({ ...q })))
      .onConflictDoNothing()
      .returning({ id: discoveryQuestions.id, order: discoveryQuestions.order });

   const sorted = inserted.sort((a, b) => a.order - b.order);

   if (sorted.length > 0) {
      await db
         .insert(discoveryAnswers)
         .values(
            sorted.map(({ id: questionId }) => ({
               projectId: PROJECT_ID,
               questionId,
               answer: null,
               answeredBy: null,
               answeredAt: null,
            }))
         )
         .onConflictDoNothing();
   }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
   console.log('Reseeding taskm-core...');

   console.log('  → deleting existing data');
   await deleteProjectData();

   console.log('  → stack entries (10)');
   await reseedStackEntries();

   console.log('  → specs (12)');
   await reseedSpecs();

   console.log('  → tasks (43)');
   await reseedTasks();

   console.log('  → checklist (11)');
   await reseedChecklist();

   console.log('  → discovery_questions + answers');
   await reseedDiscoveryQA();

   console.log('Reseed complete.');
   process.exit(0);
}

main().catch((err) => {
   console.error('Reseed failed:', err);
   process.exit(1);
});
