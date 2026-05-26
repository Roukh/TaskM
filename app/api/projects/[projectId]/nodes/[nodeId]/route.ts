import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getNodeById, updateNodePosition, deleteNode } from '@/lib/db/queries/nodes';
import { getProject } from '@/lib/db/queries/projects';
import { z } from 'zod';

const patchSchema = z.object({
  canvasX: z.number().nullable().optional(),
  canvasY: z.number().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

type Params = { params: Promise<{ projectId: string; nodeId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, nodeId } = await params;
  const project = await getProject(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const node = await getNodeById(nodeId, projectId);
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.canvasX != null && parsed.data.canvasY != null) {
    await updateNodePosition(nodeId, parsed.data.canvasX, parsed.data.canvasY);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, nodeId } = await params;
  const project = await getProject(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const node = await getNodeById(nodeId, projectId);
  if (!node) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  if (node.status !== 'PLANNED') {
    return NextResponse.json(
      { error: 'Only PLANNED nodes can be deleted via API' },
      { status: 403 }
    );
  }

  await deleteNode(nodeId);
  return NextResponse.json({ ok: true });
}
