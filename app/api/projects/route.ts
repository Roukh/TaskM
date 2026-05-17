import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { DEV_USER_ID } from '@/lib/db/queries';

const postBodySchema = z.object({
   id: z.string().min(1),
   name: z.string().min(1),
   type: z.enum(['next-app', 'python-api', 'ghobz-site', 'custom']).default('custom'),
   goal: z.string().optional(),
});

// GET /api/projects — list projects for the current user
export async function GET() {
   // TODO: replace with session.user.id once auth is wired
   const rows = await db.select().from(projects).where(eq(projects.userId, DEV_USER_ID));

   return NextResponse.json({ projects: rows });
}

// POST /api/projects — create a new project
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

   const { id, name, type, goal } = parsed.data;

   // Check for duplicate id
   const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

   if (existing) {
      return NextResponse.json({ error: `Project id '${id}' already exists` }, { status: 409 });
   }

   // TODO: replace DEV_USER_ID with session.user.id once auth is wired
   const [project] = await db
      .insert(projects)
      .values({
         id,
         name,
         type,
         goal: goal ?? null,
         userId: DEV_USER_ID,
      })
      .returning();

   return NextResponse.json({ project }, { status: 201 });
}
