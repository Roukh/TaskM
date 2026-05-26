import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getMemriById, updateMemri, deleteMemri } from '@/lib/db/queries/memri';
import { getProject } from '@/lib/db/queries/projects';
import { z } from 'zod';

const updateSchema = z.object({
  category: z.enum(['sop', 'memory', 'issue']).optional(),
  content: z.string().min(1).optional(),
  targetNodeId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ memriId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { memriId } = await params;
  const entry = await getMemriById(memriId);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const project = await getProject(entry.projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateMemri(memriId, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { memriId } = await params;
  const entry = await getMemriById(memriId);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const project = await getProject(entry.projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await deleteMemri(memriId);
  return NextResponse.json({ ok: true });
}
