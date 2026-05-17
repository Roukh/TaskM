import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DEV_USER_ID } from '@/lib/db/queries';

const patchBodySchema = z.object({
   name: z.string().min(1).optional(),
   type: z.enum(['next-app', 'python-api', 'ghobz-site', 'custom']).optional(),
   goal: z.string().nullable().optional(),
   state: z.enum(['not-started', 'in-progress', 'complete', 'blocked']).optional(),
   githubRepo: z.string().nullable().optional(),
});

interface RouteContext {
   params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId] — single project + tasks
export async function GET(_req: NextRequest, { params }: RouteContext) {
   const { projectId } = await params;

   // TODO: replace DEV_USER_ID with session.user.id once auth is wired
   const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, DEV_USER_ID)))
      .limit(1);

   if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   }

   const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));

   return NextResponse.json({ project, tasks: projectTasks });
}

// PATCH /api/projects/[projectId] — update project fields
export async function PATCH(req: NextRequest, { params }: RouteContext) {
   const { projectId } = await params;

   let body: unknown;
   try {
      body = await req.json();
   } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }

   const parsed = patchBodySchema.safeParse(body);
   if (!parsed.success) {
      return NextResponse.json(
         { error: parsed.error.issues.map((i) => i.message).join(', ') },
         { status: 400 }
      );
   }

   if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
   }

   // TODO: replace DEV_USER_ID with session.user.id once auth is wired
   const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, DEV_USER_ID)))
      .limit(1);

   if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   }

   const [updated] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

   return NextResponse.json({ project: updated });
}
