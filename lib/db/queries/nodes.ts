import { db } from '../index';
import { nodes, type NodeLabel, type NodeStatus } from '../schema';
import { eq, and, notInArray } from 'drizzle-orm';

interface NodeFilters {
  status?: NodeStatus;
  branch?: string;
  label?: NodeLabel;
}

export async function getNodes(projectId: string, filters: NodeFilters = {}) {
  const conditions = [eq(nodes.projectId, projectId)];

  if (filters.status) conditions.push(eq(nodes.status, filters.status));
  if (filters.branch) conditions.push(eq(nodes.branch, filters.branch));
  if (filters.label) conditions.push(eq(nodes.label, filters.label));

  return db
    .select()
    .from(nodes)
    .where(and(...conditions))
    .orderBy(nodes.createdAt);
}

export async function getNodeById(nodeId: string) {
  const rows = await db
    .select()
    .from(nodes)
    .where(eq(nodes.id, nodeId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertNode(data: {
  id: string;
  projectId: string;
  branch: string;
  label: NodeLabel;
  name: string;
  status: NodeStatus;
  filePath?: string | null;
  metadata?: Record<string, unknown> | null;
  commitSha?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
}) {
  const rows = await db
    .insert(nodes)
    .values({
      id: data.id,
      projectId: data.projectId,
      branch: data.branch,
      label: data.label,
      name: data.name,
      status: data.status,
      filePath: data.filePath ?? null,
      metadata: data.metadata ?? null,
      commitSha: data.commitSha ?? null,
      canvasX: data.canvasX ?? null,
      canvasY: data.canvasY ?? null,
    })
    .onConflictDoUpdate({
      target: nodes.id,
      set: {
        label: data.label,
        name: data.name,
        status: data.status,
        filePath: data.filePath ?? null,
        metadata: data.metadata ?? null,
        commitSha: data.commitSha ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return rows[0];
}

export async function updateNodePosition(
  nodeId: string,
  canvasX: number,
  canvasY: number
) {
  await db
    .update(nodes)
    .set({ canvasX, canvasY, updatedAt: new Date() })
    .where(eq(nodes.id, nodeId));
}

export async function deleteNode(nodeId: string) {
  await db.delete(nodes).where(eq(nodes.id, nodeId));
}

// Mark all CURRENT nodes for a project/branch that are NOT in the scanned set
// as DEPRECATED. Called by the sync endpoint after upserting fresh CURRENT nodes.
export async function markDeprecated(
  projectId: string,
  branch: string,
  scannedIds: string[]
) {
  if (scannedIds.length === 0) return;

  await db
    .update(nodes)
    .set({ status: 'DEPRECATED', updatedAt: new Date() })
    .where(
      and(
        eq(nodes.projectId, projectId),
        eq(nodes.branch, branch),
        eq(nodes.status, 'CURRENT'),
        notInArray(nodes.id, scannedIds)
      )
    );
}
