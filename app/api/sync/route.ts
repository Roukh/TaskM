import { NextRequest, NextResponse } from 'next/server';
import { getProjectByApiKey } from '@/lib/db/queries/projects';
import { markDeprecated } from '@/lib/db/queries/nodes';
import { type NodeLabel, type EdgeRelation } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { nodes as nodesTable, edges as edgesTable } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
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
  // When true, an empty nodes array is treated as an intentional full scan
  // that found nothing, and all existing CURRENT nodes will be marked DEPRECATED.
  // When false (default), an empty scan is treated as a no-op to prevent
  // accidental mass-deprecation from a misconfigured scanner.
  allowEmptyScan: z.boolean().optional().default(false),
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

  const { branch, commitSha, nodes, edges = [], allowEmptyScan } = parsed.data;
  const projectId = project.id;

  // Prefix scanner-supplied IDs with projectId to prevent cross-project collisions.
  // Build a mapping so edges can reference the correct server-side IDs.
  const idMap = new Map(nodes.map((n) => [n.id, `${projectId}:${n.id}`]));
  const scannedIds = nodes.map((n) => `${projectId}:${n.id}`);

  // Batch upsert all scanned nodes as CURRENT in a single statement.
  // Using the Neon HTTP driver (drizzle-orm/neon-http) which does not support
  // interactive transactions — batch inserts are best-effort here.
  if (nodes.length > 0) {
    const nodeValues = nodes.map((node) => ({
      id: idMap.get(node.id)!,
      projectId,
      branch,
      label: node.label as NodeLabel,
      name: node.name,
      status: 'CURRENT' as const,
      filePath: node.filePath ?? null,
      metadata: node.metadata ?? null,
      commitSha: commitSha ?? null,
    }));
    await db.insert(nodesTable).values(nodeValues).onConflictDoUpdate({
      target: nodesTable.id,
      set: {
        label: sql`excluded.label`,
        name: sql`excluded.name`,
        status: sql`excluded.status`,
        filePath: sql`excluded.file_path`,
        metadata: sql`excluded.metadata`,
        commitSha: sql`excluded.commit_sha`,
        updatedAt: new Date(),
      },
    });
  }

  // Batch upsert all edges as CURRENT in a single statement.
  if (edges.length > 0) {
    const edgeValues = edges.map((edge) => ({
      id: `${projectId}:${edge.id}`,
      projectId,
      branch,
      sourceId: idMap.get(edge.sourceId) ?? `${projectId}:${edge.sourceId}`,
      targetId: idMap.get(edge.targetId) ?? `${projectId}:${edge.targetId}`,
      relation: edge.relation as EdgeRelation,
      status: 'CURRENT' as const,
      commitSha: commitSha ?? null,
    }));
    await db.insert(edgesTable).values(edgeValues).onConflictDoUpdate({
      target: edgesTable.id,
      set: {
        relation: sql`excluded.relation`,
        status: sql`excluded.status`,
        commitSha: sql`excluded.commit_sha`,
      },
    });
  }

  // Mark any CURRENT node not in the scanned set as DEPRECATED.
  // allowEmptyScan controls whether an empty scan triggers deprecation.
  if (scannedIds.length > 0 || allowEmptyScan) {
    await markDeprecated(projectId, branch, scannedIds);
  }

  return NextResponse.json({
    ok: true,
    synced: { nodes: nodes.length, edges: edges.length },
  });
}
