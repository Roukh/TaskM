import { db } from '../index';
import { nodes } from '../schema';
import { eq, and, inArray } from 'drizzle-orm';

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
  // Single query fetches all relevant nodes — eliminates the race condition
  // that exists when PLANNED, CURRENT, and DEPRECATED are queried separately.
  // The Neon HTTP driver does not support interactive transactions, so merging
  // into one SELECT is the correct consistency fix.
  const allNodes = await db
    .select()
    .from(nodes)
    .where(
      and(
        eq(nodes.projectId, projectId),
        eq(nodes.branch, branch),
        inArray(nodes.status, ['PLANNED', 'CURRENT', 'DEPRECATED'])
      )
    );

  const currentIdSet = new Set(
    allNodes.filter((n) => n.status === 'CURRENT').map((n) => n.id)
  );

  const toCreate: NodeDelta[] = allNodes
    .filter((n) => n.status === 'PLANNED' && !currentIdSet.has(n.id))
    .map((n) => ({
      node_id: n.id,
      name: n.name,
      label: n.label,
      file_path: n.filePath,
      metadata: (n.metadata as Record<string, unknown>) ?? {},
    }));

  const deleteList: NodeDelta[] = allNodes
    .filter((n) => n.status === 'DEPRECATED')
    .map((n) => ({
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
