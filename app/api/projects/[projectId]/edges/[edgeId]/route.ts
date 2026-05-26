import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getEdgeById, deleteEdge } from '@/lib/db/queries/edges';
import { getProject } from '@/lib/db/queries/projects';

type Params = { params: Promise<{ projectId: string; edgeId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, edgeId } = await params;
  const project = await getProject(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const edge = await getEdgeById(edgeId, projectId);
  if (!edge) {
    return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
  }

  if (edge.status !== 'PLANNED') {
    return NextResponse.json(
      { error: 'Only PLANNED edges can be deleted via API' },
      { status: 403 }
    );
  }

  await deleteEdge(edgeId);
  return NextResponse.json({ ok: true });
}
