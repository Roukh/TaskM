import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getNodes, upsertPlannedNode } from '@/lib/db/queries/nodes';
import { getProject } from '@/lib/db/queries/projects';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const createSchema = z.object({
  id: z.string().optional(),
  label: z.enum(['Function', 'Component', 'Endpoint', 'DatabaseModel']),
  name: z.string().min(1),
  filePath: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  branch: z.string().optional(),
  canvasX: z.number().nullable().optional(),
  canvasY: z.number().nullable().optional(),
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
    label: z.enum(['Function', 'Component', 'Endpoint', 'DatabaseModel']).optional(),
  });
  const fp = filterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fp.success) return NextResponse.json({ error: fp.error.flatten() }, { status: 400 });
  const nodeList = await getNodes(projectId, fp.data);

  return NextResponse.json(nodeList);
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
  const id =
    parsed.data.id ??
    (parsed.data.filePath
      ? `${projectId}:${branch}:${parsed.data.filePath}:${parsed.data.name}`
      : uuid());

  const node = await upsertPlannedNode({
    id,
    projectId,
    branch,
    label: parsed.data.label,
    name: parsed.data.name,
    filePath: parsed.data.filePath ?? null,
    metadata: parsed.data.metadata ?? null,
    canvasX: parsed.data.canvasX ?? null,
    canvasY: parsed.data.canvasY ?? null,
  });

  return NextResponse.json(node, { status: 201 });
}
