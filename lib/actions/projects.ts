'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import {
   projects,
   qaTemplates,
   checklist,
   discoveryQuestions,
   discoveryAnswers,
} from '@/lib/db/schema';
import type { Project } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { ProjectType } from '@/types/taskm';

// ── Schemas ───────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
   id: z
      .string()
      .min(3, 'ID must be at least 3 characters')
      .max(50, 'ID must be at most 50 characters')
      .regex(/^[a-z0-9-]+$/, 'ID can only contain lowercase letters, numbers, and hyphens'),
   name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
   type: z.enum(['next-app', 'python-api', 'ghobz-site', 'custom'] as const),
   goal: z.string().max(500, 'Goal must be at most 500 characters').optional(),
});

const connectGithubRepoSchema = z.object({
   projectId: z.string().min(1),
   repo: z.string().regex(/^[^/]+\/[^/]+$/, 'Repo must be in owner/name format'),
});

// ── Actions ───────────────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export async function createProject(
   input: CreateProjectInput
): Promise<{ project: Project } | { error: string }> {
   const parsed = createProjectSchema.safeParse(input);
   if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
   }

   const { id, name, type, goal } = parsed.data;

   // TODO: replace with session.user.id once auth is merged
   const userId = 'dev-user';

   try {
      const [project] = await db
         .insert(projects)
         .values({
            id,
            userId,
            name,
            type: type as ProjectType,
            goal: goal ?? null,
            state: 'not-started',
         })
         .returning();

      if (!project) {
         return { error: 'Failed to create project' };
      }

      // Copy qa_templates into checklist for this new project
      const templates = await db.select().from(qaTemplates);
      if (templates.length > 0) {
         await db.insert(checklist).values(
            templates.map((tpl) => ({
               projectId: project.id,
               templateId: tpl.id,
               title: tpl.title,
               category: tpl.category,
               order: tpl.order,
               passed: false,
            }))
         );
      }

      // Create empty discovery answer rows for each global question
      const questions = await db.select().from(discoveryQuestions);
      if (questions.length > 0) {
         await db.insert(discoveryAnswers).values(
            questions.map((q) => ({
               projectId: project.id,
               questionId: q.id,
               answer: null,
               answeredBy: null,
               answeredAt: null,
            }))
         );
      }

      return { project };
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      // Check for unique-constraint violation (duplicate project ID)
      if (message.includes('duplicate key') || message.includes('unique constraint')) {
         return { error: 'A project with this ID already exists' };
      }
      return { error: message };
   }
}

export async function connectGithubRepo(input: {
   projectId: string;
   repo: string;
}): Promise<{ success: true } | { error: string }> {
   const parsed = connectGithubRepoSchema.safeParse(input);
   if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
   }

   const { projectId, repo } = parsed.data;

   try {
      const result = await db
         .update(projects)
         .set({ githubRepo: repo })
         .where(eq(projects.id, projectId))
         .returning({ id: projects.id });

      if (result.length === 0) {
         return { error: 'Project not found' };
      }

      return { success: true };
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return { error: message };
   }
}

export async function disconnectGithubRepo(
   projectId: string
): Promise<{ success: true } | { error: string }> {
   try {
      const result = await db
         .update(projects)
         .set({ githubRepo: null })
         .where(eq(projects.id, projectId))
         .returning({ id: projects.id });

      if (result.length === 0) {
         return { error: 'Project not found' };
      }

      return { success: true };
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return { error: message };
   }
}
