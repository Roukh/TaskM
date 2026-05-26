import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getEdges, upsertPlannedEdge } from '@/lib/db/queries/edges';
import { getProject } from '@/lib/db/queries/projects';
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

  const filterSchema = z.object({
    status: z.enum(['PLANNED', 'CURRENT', 'DEPRECATED']).optional(),
    branch: z.string().optional(),
    relation: z.enum(['CALLS', 'IMPORTS', 'IMPLEMENTS', 'MUTATES']).optional(),
  });
  const fp = filterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fp.success) return NextResponse.json({ error: fp.error.flatten() }, { status: 400 });
  const edgeList = await getEdges(projectId, fp.data);

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
  const edge = await upsertPlannedEdge({
    id: uuid(),
    projectId,
    branch,
    sourceId: parsed.data.sourceId,
    targetId: parsed.data.targetId,
    relation: parsed.data.relation,
  });

  return NextResponse.json(edge, { status: 201 });
}
