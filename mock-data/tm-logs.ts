import { TmLog } from '@/types/taskm';

export const tmLogs: TmLog[] = [
   {
      id: '1',
      projectId: 'ghobz-realtor',
      layerId: 'ghobz-realtor-l0',
      type: 'layer_complete',
      summary:
         'Layer 0 Discovery complete — spec written to DB. 12 spec rows, 1 sitemap, 3 constraints.',
      createdAt: '2026-05-14T10:22:00Z',
   },
   {
      id: '2',
      projectId: 'ghobz-realtor',
      layerId: 'ghobz-realtor-l1',
      type: 'layer_complete',
      summary:
         'Layer 1 UX & Flows complete — 4 page flows, 2 popup specs, conversion funnel documented.',
      createdAt: '2026-05-14T14:45:00Z',
   },
   {
      id: '3',
      projectId: 'ghobz-realtor',
      layerId: 'ghobz-realtor-l2',
      type: 'layer_start',
      summary:
         'Layer 2 Backend started — auth provider selected (BetterAuth), DB schema in progress.',
      createdAt: '2026-05-15T09:00:00Z',
   },
   {
      id: '4',
      projectId: 'ghobz-realtor',
      type: 'task_done',
      layerId: 'ghobz-realtor-l2',
      summary: 'Auth migration created and verified. Email/password + session cookie pattern.',
      createdAt: '2026-05-15T11:30:00Z',
   },
   {
      id: '5',
      projectId: 'taskm-core',
      layerId: 'taskm-core-l0',
      type: 'layer_complete',
      summary:
         'Layer 0 Discovery complete — TaskM future.md written, DB schema designed, MVP defined.',
      createdAt: '2026-05-16T08:00:00Z',
   },
   {
      id: '6',
      projectId: 'taskm-core',
      layerId: 'taskm-core-l1',
      type: 'layer_start',
      summary:
         'Layer 1 UX & Flows started — Circle forked as dashboard base, route structure planned.',
      createdAt: '2026-05-16T09:00:00Z',
   },
];
