export type LayerState = 'not-started' | 'in-progress' | 'complete' | 'blocked';

export type ProjectType = 'next-app' | 'python-api' | 'ghobz-site' | 'custom';

export interface TmProject {
   id: string;
   name: string;
   type: ProjectType;
   goal: string;
   state: LayerState;
   createdAt: string;
}

export interface TmLayer {
   id: string;
   projectId: string;
   index: number;
   name: string;
   description: string;
   state: LayerState;
   percentComplete: number;
}

export interface TmTask {
   id: string;
   projectId: string;
   layerId: string;
   title: string;
   description: string;
   status: 'todo' | 'in-progress' | 'complete' | 'blocked';
   priority: 'low' | 'medium' | 'high' | 'urgent';
   createdAt: string;
}

export interface TmLog {
   id: string;
   projectId: string;
   layerId?: string;
   type: 'layer_start' | 'layer_complete' | 'task_done' | 'spec_written' | 'response' | 'error';
   summary: string;
   createdAt: string;
}
