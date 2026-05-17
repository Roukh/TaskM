import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tasks } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DEV_USER_ID } from '@/lib/db/queries';

const postBodySchema = z.object({
   layerIndex: z.number().int().min(0).max(4),
   title: z.string().min(1),
   description: z.string().nullable().optional(),
   status: z.enum(['todo', 'in-progress', 'complete', 'blocked']).default('todo'),
   priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

interface RouteContext {
   params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/tasks?layerIndex=N
export async function GET(req: NextRequest, { params }: RouteContext) {
   const { projectId } = await params;
   const { searchParams } = req.nextUrl;
   const layerParam = searchParams.get('layerIndex');

   // TODO: replace DEV_USER_ID with session.user.id once auth is wired
   const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, DEV_USER_ID)))
      .limit(1);

   if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   }

   const conditions = [eq(tasks.projectId, projectId)];

   if (layerParam !== null) {
      const layerIndex = parseInt(layerParam, 10);
      if (isNaN(layerIndex) || layerIndex < 0 || layerIndex > 4) {
         return NextResponse.json(
            { error: 'layerIndex must be an integer between 0 and 4' },
            { status: 400 }
         );
      }
      conditions.push(eq(tasks.layerIndex, layerIndex));
   }

   const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions));

   return NextResponse.json({ tasks: rows });
}

// POST /api/projects/[projectId]/tasks — create a task
export async function POST(req: NextRequest, { params }: RouteContext) {
   const { projectId } = await params;

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

   // TODO: replace DEV_USER_ID with session.user.id once auth is wired
   const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, DEV_USER_ID)))
      .limit(1);

   if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
   }

   const [task] = await db
      .insert(tasks)
      .values({
         projectId,
         layerIndex: parsed.data.layerIndex,
         title: parsed.data.title,
         description: parsed.data.description ?? null,
         status: parsed.data.status,
         priority: parsed.data.priority,
      })
      .returning();

   return NextResponse.json({ task }, { status: 201 });
}
