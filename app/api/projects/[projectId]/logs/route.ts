import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logs, projects } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DEV_USER_ID } from '@/lib/db/queries';

const postBodySchema = z.object({
   layerIndex: z.number().int().min(0).max(4).nullable().optional(),
   type: z.enum([
      'layer_start',
      'layer_complete',
      'task_done',
      'atom_written',
      'response',
      'error',
   ]),
   summary: z.string().min(1),
   metadata: z.record(z.unknown()).optional(),
});

interface RouteContext {
   params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/logs?layerIndex=N — newest first
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

   const conditions = [eq(logs.projectId, projectId)];

   if (layerParam !== null) {
      const layerIndex = parseInt(layerParam, 10);
      if (isNaN(layerIndex) || layerIndex < 0 || layerIndex > 4) {
         return NextResponse.json(
            { error: 'layerIndex must be an integer between 0 and 4' },
            { status: 400 }
         );
      }
      conditions.push(eq(logs.layerIndex, layerIndex));
   }

   const rows = await db
      .select()
      .from(logs)
      .where(and(...conditions))
      .orderBy(desc(logs.createdAt));

   return NextResponse.json({ logs: rows });
}

// POST /api/projects/[projectId]/logs — append a log entry (agent use)
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

   const [log] = await db
      .insert(logs)
      .values({
         projectId,
         layerIndex: parsed.data.layerIndex ?? null,
         type: parsed.data.type,
         summary: parsed.data.summary,
         metadata: parsed.data.metadata ?? {},
      })
      .returning();

   return NextResponse.json({ log }, { status: 201 });
}
