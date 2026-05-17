/**
 * lib/db/seed.ts
 *
 * Idempotent seed — inserts TaskM as the first real project.
 * Re-run safely: all inserts use onConflictDoNothing().
 *
 * Run with: pnpm db:seed
 * Prerequisite: pnpm db:push must be run first (tables must exist).
 */

import { db } from './index';
import {
   user,
   projects,
   stackEntries,
   tasks,
   specs,
   qaTemplates,
   checklist,
   discoveryQuestions,
   discoveryAnswers,
} from './schema';

// ── 1. Dev user ───────────────────────────────────────────────────────────────

async function seedUser() {
   const now = new Date();
   await db
      .insert(user)
      .values({
         id: 'dev-user',
         name: 'Roukh',
         email: 'admin@ghobz.com',
         emailVerified: true,
         createdAt: now,
         updatedAt: now,
      })
      .onConflictDoNothing();
}

// ── 2. TaskM project ──────────────────────────────────────────────────────────

async function seedProject() {
   await db
      .insert(projects)
      .values({
         id: 'taskm-core',
         userId: 'dev-user',
         name: 'TaskM',
         type: 'next-app',
         state: 'in-progress',
         goal: 'Build substrate for AI-assisted software builds. Context-independent: every build artifact lives in DB. Cold agent session reads project state and executes without conversation history.',
         githubRepo: null,
         layerLocked: {},
      })
      .onConflictDoNothing();
}

// ── 3. Stack entries ──────────────────────────────────────────────────────────

async function seedStackEntries() {
   await db
      .insert(stackEntries)
      .values([
         {
            projectId: 'taskm-core',
            stackCategory: 'framework',
            name: 'Next.js 15',
            version: '15.x',
            icon: 'nextjs',
         },
         {
            projectId: 'taskm-core',
            stackCategory: 'db',
            name: 'Neon PostgreSQL',
            version: 'serverless',
            icon: 'postgres',
         },
         {
            projectId: 'taskm-core',
            stackCategory: 'auth',
            name: 'BetterAuth',
            version: 'latest',
            icon: 'shield',
         },
         {
            projectId: 'taskm-core',
            stackCategory: 'hosting',
            name: 'Vercel',
            version: null,
            icon: 'vercel',
         },
         {
            projectId: 'taskm-core',
            stackCategory: 'integration',
            name: 'GitHub OAuth',
            version: null,
            icon: 'github',
         },
         {
            projectId: 'taskm-core',
            stackCategory: 'integration',
            name: 'Anthropic Claude',
            version: null,
            icon: 'anthropic',
         },
      ])
      .onConflictDoNothing();
}

// ── 4. Tasks ──────────────────────────────────────────────────────────────────

async function seedTasks() {
   await db
      .insert(tasks)
      .values([
         // Layer 0 — Discovery
         {
            projectId: 'taskm-core',
            layerIndex: 0,
            title: 'Define project goals and non-goals',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 0,
            title: 'Document layer architecture (0-4 fixed)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 0,
            title: 'Specify agent protocol (DB as handoff)',
            status: 'complete',
            priority: 'medium',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 0,
            title: 'Document session protocol',
            status: 'in-progress',
            priority: 'medium',
         },

         // Layer 1 — Infrastructure
         {
            projectId: 'taskm-core',
            layerIndex: 1,
            title: 'Set up Neon PostgreSQL + Drizzle schema',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 1,
            title: 'Wire BetterAuth (email + GitHub OAuth)',
            status: 'in-progress',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 1,
            title: 'Connect GitHub repo to project',
            status: 'todo',
            priority: 'medium',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 1,
            title: 'Deploy to Vercel',
            status: 'todo',
            priority: 'medium',
         },

         // Layer 2 — Frontend
         {
            projectId: 'taskm-core',
            layerIndex: 2,
            title: 'Build project list view',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 2,
            title: 'Build layer grid view',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 2,
            title: 'Build layer detail view (5 tabs)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 2,
            title: 'Build new project creation modal',
            status: 'in-progress',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 2,
            title: 'Build project settings page',
            status: 'todo',
            priority: 'medium',
         },

         // Layer 3 — Backend
         {
            projectId: 'taskm-core',
            layerIndex: 3,
            title: 'Write Drizzle schema (all tables)',
            status: 'complete',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 3,
            title: 'Wire API routes (projects, tasks, logs)',
            status: 'in-progress',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 3,
            title: 'Implement VPS job worker',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 3,
            title: 'Implement agent job queue (jobs table)',
            status: 'todo',
            priority: 'high',
         },

         // Layer 4 — QA
         {
            projectId: 'taskm-core',
            layerIndex: 4,
            title: 'Auth routes protected by middleware',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 4,
            title: 'DB queries scoped to userId',
            status: 'todo',
            priority: 'high',
         },
         {
            projectId: 'taskm-core',
            layerIndex: 4,
            title: 'E2E test: login → create project → run layer',
            status: 'todo',
            priority: 'medium',
         },
      ])
      .onConflictDoNothing();
}

// ── 5. Specs ──────────────────────────────────────────────────────────────────

async function seedSpecs() {
   await db
      .insert(specs)
      .values([
         // Category: goal
         {
            projectId: 'taskm-core',
            category: 'goal',
            key: 'core-property',
            value: 'Context independence — every build artifact lives in DB. Cold agent session reads state and executes without conversation history.',
         },
         {
            projectId: 'taskm-core',
            category: 'goal',
            key: 'primary-user',
            value: 'Engineer directing AI agents to build software',
         },

         // Category: decision
         {
            projectId: 'taskm-core',
            category: 'decision',
            key: 'layer-model',
            value: '5 fixed layers (0-4): Discovery, Infrastructure, Frontend, Backend, QA. No layers table — layers are a code enum.',
         },
         {
            projectId: 'taskm-core',
            category: 'decision',
            key: 'auth-strategy',
            value: 'BetterAuth with email/password + GitHub OAuth. Cookie-based sessions.',
         },
         {
            projectId: 'taskm-core',
            category: 'decision',
            key: 'agent-handoff',
            value: 'DB is the handoff between agents. No direct agent-to-agent communication.',
         },
      ])
      .onConflictDoNothing();
}

// ── 6. QA templates + project checklist ──────────────────────────────────────

const QA_TEMPLATE_ROWS = [
   { order: 0, category: 'security', title: 'All dashboard routes protected by auth middleware' },
   { order: 1, category: 'security', title: 'DB queries scoped to authenticated userId' },
   { order: 2, category: 'security', title: 'No secrets hardcoded in source code' },
   {
      order: 3,
      category: 'performance',
      title: 'Server components fetch data directly (no client fetch waterfall)',
   },
   { order: 4, category: 'accessibility', title: 'All interactive elements have aria-labels' },
   { order: 5, category: 'ux', title: 'Empty states shown when no data exists' },
   { order: 6, category: 'code-quality', title: 'No mock-data imports remain in production code' },
   { order: 7, category: 'code-quality', title: 'TypeScript strict — no any types' },
] as const;

async function seedQaTemplates(): Promise<string[]> {
   const inserted = await db
      .insert(qaTemplates)
      .values(QA_TEMPLATE_ROWS.map((row) => ({ ...row })))
      .onConflictDoNothing()
      .returning({ id: qaTemplates.id, order: qaTemplates.order });

   // Return inserted ids ordered by order field
   return inserted.sort((a, b) => a.order - b.order).map((r) => r.id);
}

async function seedChecklist(templateIds: string[]) {
   if (templateIds.length === 0) {
      // Templates already existed — skip checklist insert to preserve idempotency
      return;
   }

   await db
      .insert(checklist)
      .values(
         templateIds.map((templateId, i) => ({
            projectId: 'taskm-core',
            templateId,
            title: QA_TEMPLATE_ROWS[i].title,
            category: QA_TEMPLATE_ROWS[i].category,
            order: QA_TEMPLATE_ROWS[i].order,
            passed: false,
         }))
      )
      .onConflictDoNothing();
}

// ── 7. Discovery questions (global template) ──────────────────────────────────

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

async function seedDiscoveryQuestions(): Promise<string[]> {
   const inserted = await db
      .insert(discoveryQuestions)
      .values(DISCOVERY_QUESTIONS.map((q) => ({ ...q })))
      .onConflictDoNothing()
      .returning({ id: discoveryQuestions.id, order: discoveryQuestions.order });
   return inserted.sort((a, b) => a.order - b.order).map((r) => r.id);
}

async function seedDiscoveryAnswers(questionIds: string[]) {
   if (questionIds.length === 0) return;
   await db
      .insert(discoveryAnswers)
      .values(
         questionIds.map((questionId) => ({
            projectId: 'taskm-core',
            questionId,
            answer: null,
            answeredBy: null,
            answeredAt: null,
         }))
      )
      .onConflictDoNothing();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
   console.log('Seeding database...');

   console.log('  → user');
   await seedUser();

   console.log('  → project: taskm-core');
   await seedProject();

   console.log('  → stack entries');
   await seedStackEntries();

   console.log('  → tasks (20)');
   await seedTasks();

   console.log('  → specs');
   await seedSpecs();

   console.log('  → qa_templates');
   const templateIds = await seedQaTemplates();

   console.log('  → checklist');
   await seedChecklist(templateIds);

   console.log('  → discovery_questions');
   const questionIds = await seedDiscoveryQuestions();

   console.log('  → discovery_answers (taskm-core)');
   await seedDiscoveryAnswers(questionIds);

   console.log('Seed complete.');
   process.exit(0);
}

main().catch((err) => {
   console.error('Seed failed:', err);
   process.exit(1);
});
