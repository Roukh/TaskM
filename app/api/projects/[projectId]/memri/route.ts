import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getMemri, createMemri } from '@/lib/db/queries/memri';
import { getProject } from '@/lib/db/queries/projects';
import { z } from 'zod';

const createSchema = z.object({
  category: z.enum(['sop', 'memory', 'issue']),
  content: z.string().min(1),
  targetNodeId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const targetNodeId = searchParams.get('targetNodeId') ?? undefined;
  const entries = await getMemri(projectId, targetNodeId);

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await createMemri({
    projectId,
    category: parsed.data.category,
    content: parsed.data.content,
    targetNodeId: parsed.data.targetNodeId ?? null,
  });

  return NextResponse.json(entry, { status: 201 });
}
