import { db } from '../index';
import { nodes } from '../schema';
import { eq, and } from 'drizzle-orm';

export interface NodeDelta {
  node_id: string;
  name: string;
  label: string;
  file_path: string | null;
  metadata: Record<string, unknown>;
}

export interface EdgeDelta {
  edge_id: string;
  source_name: string;
  target_name: string;
  relation: string;
  change: 'added' | 'removed';
}

export interface ExecutionDelta {
  project_id: string;
  branch: string;
  computed_at: string;
  create: NodeDelta[];
  delete: NodeDelta[];
  refactor: EdgeDelta[];
}

export async function computeDelta(
  projectId: string,
  branch: string
): Promise<ExecutionDelta> {
  // PLANNED nodes
  const plannedNodes = await db
    .select()
    .from(nodes)
    .where(
      and(
        eq(nodes.projectId, projectId),
        eq(nodes.branch, branch),
        eq(nodes.status, 'PLANNED')
      )
    );

  // CURRENT node IDs for the same project/branch
  const currentRows = await db
    .select({ id: nodes.id })
    .from(nodes)
    .where(
      and(
        eq(nodes.projectId, projectId),
        eq(nodes.branch, branch),
        eq(nodes.status, 'CURRENT')
      )
    );

  const currentIdSet = new Set(currentRows.map((r) => r.id));

  // CREATE: PLANNED nodes with no matching CURRENT node
  const toCreate: NodeDelta[] = plannedNodes
    .filter((n) => !currentIdSet.has(n.id))
    .map((n) => ({
      node_id: n.id,
      name: n.name,
      label: n.label,
      file_path: n.filePath,
      metadata: (n.metadata as Record<string, unknown>) ?? {},
    }));

  // DELETE: DEPRECATED nodes (recently marked by scanner)
  const toDelete = await db
    .select()
    .from(nodes)
    .where(
      and(
        eq(nodes.projectId, projectId),
        eq(nodes.branch, branch),
        eq(nodes.status, 'DEPRECATED')
      )
    );

  const deleteList: NodeDelta[] = toDelete.map((n) => ({
    node_id: n.id,
    name: n.name,
    label: n.label,
    file_path: n.filePath,
    metadata: (n.metadata as Record<string, unknown>) ?? {},
  }));

  return {
    project_id: projectId,
    branch,
    computed_at: new Date().toISOString(),
    create: toCreate,
    delete: deleteList,
    refactor: [], // Edge-level refactor detection — Phase 6
  };
}
