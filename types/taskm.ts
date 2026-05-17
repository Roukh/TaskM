// Hardcoded layer definitions — no DB table
export const TASKM_LAYERS = [
   { index: 0, name: 'Discovery', description: 'Goals, constraints, decisions' },
   { index: 1, name: 'Infrastructure', description: 'Full stack declaration' },
   { index: 2, name: 'Frontend', description: 'Atoms, tokens, components, pages' },
   { index: 3, name: 'Backend', description: 'Data models and endpoints' },
   { index: 4, name: 'QA', description: 'Preset verification checklist' },
] as const;

export type LayerIndex = 0 | 1 | 2 | 3 | 4;
export type LayerState = 'not-started' | 'in-progress' | 'complete' | 'blocked';
export type TaskStatus = 'todo' | 'in-progress' | 'complete' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectType = 'next-app' | 'python-api' | 'ghobz-site' | 'custom';

export interface TmProject {
   id: string;
   userId: string;
   name: string;
   type: 'next-app' | 'python-api' | 'ghobz-site' | 'custom';
   state: LayerState;
   goal: string | null;
   githubRepo: string | null;
   layerLocked: Partial<Record<LayerIndex, string>>; // ISO timestamps
   createdAt: string;
   updatedAt: string;
}

export type TaskAudience = 'llm' | 'user';

export interface TmTask {
   id: string;
   projectId: string;
   layerIndex: LayerIndex;
   title: string;
   description: string | null;
   status: TaskStatus;
   priority: TaskPriority;
   audience: TaskAudience;
   createdAt: string;
}

export interface TmLog {
   id: string;
   projectId: string;
   layerIndex: LayerIndex | null;
   jobId: string | null;
   type: 'layer_start' | 'layer_complete' | 'task_done' | 'atom_written' | 'response' | 'error';
   summary: string;
   metadata: Record<string, unknown>;
   createdAt: string;
}

export interface TmStackEntry {
   id: string;
   projectId: string;
   stackCategory: 'framework' | 'db' | 'hosting' | 'auth' | 'integration';
   name: string;
   version: string | null;
   icon: string | null;
   url: string | null;
}

export interface TmSpec {
   id: string;
   projectId: string;
   category: 'goal' | 'constraint' | 'decision' | 'persona' | 'user-flow' | 'sitemap-page';
   key: string;
   value: string;
   metadata: Record<string, unknown>;
   createdAt: string;
}

export interface TmAtom {
   id: string;
   projectId: string;
   family: string;
   atomType:
      | 'button'
      | 'link'
      | 'icon'
      | 'input'
      | 'label'
      | 'badge'
      | 'image'
      | 'divider'
      | 'text';
   icon: string | null;
   size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null;
   variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | null;
   interactive: boolean;
   ariaLabel: string | null;
   lockedAt: string | null;
   props: Record<string, unknown>;
}

export interface TmBackendAtom {
   id: string;
   projectId: string;
   atomType: 'db-table' | 'db-column' | 'db-relation' | 'endpoint' | 'migration' | 'service';
   name: string;
   dbType: 'sql' | 'nosql' | 'vector' | 'kv' | null;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null;
   path: string | null;
   lockedAt: string | null;
   props: Record<string, unknown>;
   createdAt: string;
}

export interface TmChecklistItem {
   id: string;
   projectId: string;
   templateId: string | null;
   title: string;
   category: 'accessibility' | 'performance' | 'security' | 'ux' | 'code-quality';
   order: number;
   passed: boolean;
   passedAt: string | null;
   passedBy: 'agent' | 'human' | null;
}

export interface TmRule {
   id: string;
   userId: string;
   name: string;
   description: string | null;
   content: string;
   layerIndex: LayerIndex | null; // null = all layers
   createdAt: string;
   updatedAt: string;
}

export interface TmDiscoveryQuestion {
   id: string;
   order: number;
   key: string;
   question: string;
   description: string | null;
   required: boolean;
}

export interface TmDiscoveryAnswer {
   id: string;
   projectId: string;
   questionId: string;
   answer: string | null;
   answeredBy: 'agent' | 'human' | null;
   answeredAt: string | null;
   createdAt: string;
}

export interface TmRepoFile {
   id: string;
   projectId: string;
   path: string;
   type: 'file' | 'dir';
   depth: number;
   order: number;
   createdAt: string;
}

// Helper: compute layer progress from tasks
export function computeLayerProgress(
   tasks: TmTask[],
   layerIndex: LayerIndex
): { percent: number; state: LayerState } {
   const layerTasks = tasks.filter((t) => t.layerIndex === layerIndex);
   if (layerTasks.length === 0) return { percent: 0, state: 'not-started' };
   const complete = layerTasks.filter((t) => t.status === 'complete').length;
   const percent = Math.round((complete / layerTasks.length) * 100);
   const hasBlocked = layerTasks.some((t) => t.status === 'blocked');
   const hasInProgress = layerTasks.some((t) => t.status === 'in-progress');
   const state: LayerState = hasBlocked
      ? 'blocked'
      : percent === 100
        ? 'complete'
        : hasInProgress || complete > 0
          ? 'in-progress'
          : 'not-started';
   return { percent, state };
}
