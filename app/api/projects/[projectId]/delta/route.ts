import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { computeDelta } from '@/lib/db/queries/delta';
import { getProject } from '@/lib/db/queries/projects';

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
  const branch = searchParams.get('branch') ?? project.defaultBranch;

  const delta = await computeDelta(projectId, branch);
  return NextResponse.json(delta);
}
