import { db } from '../index';
import { edges, type EdgeRelation, type NodeStatus } from '../schema';
import { eq, and, or } from 'drizzle-orm';

export async function getEdgeById(edgeId: string) {
  const rows = await db
    .select()
    .from(edges)
    .where(eq(edges.id, edgeId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEdges(
  projectId: string,
  filters: { branch?: string; status?: NodeStatus; relation?: EdgeRelation } = {}
) {
  const conditions = [eq(edges.projectId, projectId)];
  if (filters.branch) conditions.push(eq(edges.branch, filters.branch));
  if (filters.status) conditions.push(eq(edges.status, filters.status));
  if (filters.relation) conditions.push(eq(edges.relation, filters.relation));

  return db
    .select()
    .from(edges)
    .where(and(...conditions))
    .orderBy(edges.createdAt);
}

export async function getEdgesForNode(nodeId: string, direction: 'out' | 'in' | 'both' = 'both') {
  if (direction === 'out') {
    return db.select().from(edges).where(eq(edges.sourceId, nodeId));
  }
  if (direction === 'in') {
    return db.select().from(edges).where(eq(edges.targetId, nodeId));
  }
  return db.select().from(edges).where(
    or(eq(edges.sourceId, nodeId), eq(edges.targetId, nodeId))
  );
}

export async function upsertEdge(data: {
  id: string;
  projectId: string;
  branch: string;
  sourceId: string;
  targetId: string;
  relation: EdgeRelation;
  status: NodeStatus;
  commitSha?: string | null;
}) {
  const rows = await db
    .insert(edges)
    .values({
      id: data.id,
      projectId: data.projectId,
      branch: data.branch,
      sourceId: data.sourceId,
      targetId: data.targetId,
      relation: data.relation,
      status: data.status,
      commitSha: data.commitSha ?? null,
    })
    .onConflictDoUpdate({
      target: edges.id,
      set: {
        relation: data.relation,
        status: data.status,
        commitSha: data.commitSha ?? null,
      },
    })
    .returning();
  return rows[0];
}

export async function deleteEdge(edgeId: string) {
  await db.delete(edges).where(eq(edges.id, edgeId));
}
