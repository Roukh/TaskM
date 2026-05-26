import { NextRequest, NextResponse } from 'next/server';
import { getProjectByApiKey } from '@/lib/db/queries/projects';
import { upsertNode, markDeprecated } from '@/lib/db/queries/nodes';
import { upsertEdge } from '@/lib/db/queries/edges';
import { type NodeLabel, type EdgeRelation } from '@/lib/db/schema';
import { z } from 'zod';

const nodeSchema = z.object({
  id: z.string().min(1),
  label: z.enum(['Function', 'Component', 'Endpoint', 'DatabaseModel']),
  name: z.string().min(1),
  filePath: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

const edgeSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  relation: z.enum(['CALLS', 'IMPORTS', 'IMPLEMENTS', 'MUTATES']),
});

const syncSchema = z.object({
  branch: z.string().min(1),
  commitSha: z.string().nullable().optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema).optional(),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);
  const project = await getProjectByApiKey(apiKey);
  if (!project) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { branch, commitSha, nodes, edges = [] } = parsed.data;
  const projectId = project.id;

  // Upsert all scanned nodes as CURRENT
  for (const node of nodes) {
    await upsertNode({
      id: node.id,
      projectId,
      branch,
      label: node.label as NodeLabel,
      name: node.name,
      status: 'CURRENT',
      filePath: node.filePath ?? null,
      metadata: node.metadata ?? null,
      commitSha: commitSha ?? null,
    });
  }

  // Mark any CURRENT node not in the scanned set as DEPRECATED
  const scannedIds = nodes.map((n) => n.id);
  if (scannedIds.length > 0) {
    await markDeprecated(projectId, branch, scannedIds);
  }

  // Upsert edges
  for (const edge of edges) {
    await upsertEdge({
      id: edge.id,
      projectId,
      branch,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      relation: edge.relation as EdgeRelation,
      status: 'CURRENT',
      commitSha: commitSha ?? null,
    });
  }

  return NextResponse.json({
    ok: true,
    synced: { nodes: nodes.length, edges: edges.length },
  });
}
