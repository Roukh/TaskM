import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getEdges, upsertEdge } from '@/lib/db/queries/edges';
import { getProject } from '@/lib/db/queries/projects';
import { type EdgeRelation } from '@/lib/db/schema';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const createSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  relation: z.enum(['CALLS', 'IMPORTS', 'IMPLEMENTS', 'MUTATES']),
  branch: z.string().optional(),
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
  const edgeList = await getEdges(projectId, {
    branch: searchParams.get('branch') ?? undefined,
    relation: (searchParams.get('relation') as EdgeRelation) ?? undefined,
    status: (searchParams.get('status') as 'PLANNED' | 'CURRENT' | 'DEPRECATED') ?? undefined,
  });

  return NextResponse.json(edgeList);
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

  const branch = parsed.data.branch ?? project.defaultBranch;
  const edge = await upsertEdge({
    id: uuid(),
    projectId,
    branch,
    sourceId: parsed.data.sourceId,
    targetId: parsed.data.targetId,
    relation: parsed.data.relation,
    status: 'PLANNED',
  });

  return NextResponse.json(edge, { status: 201 });
}
