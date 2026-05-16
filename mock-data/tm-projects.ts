import { TmProject } from '@/types/taskm';

export const tmProjects: TmProject[] = [
   {
      id: 'ghobz-realtor',
      name: 'GHOBZ Realtor Site',
      type: 'ghobz-site',
      goal: 'Lead-gen landing page for a real estate agent',
      state: 'in-progress',
      createdAt: '2026-05-01',
   },
   {
      id: 'taskm-core',
      name: 'TaskM Core',
      type: 'next-app',
      goal: 'AI-assisted build substrate with DB-backed architecture',
      state: 'in-progress',
      createdAt: '2026-05-16',
   },
   {
      id: 'mnesis-api',
      name: 'MNESIS API',
      type: 'python-api',
      goal: 'Second-brain backend with branching AI instances',
      state: 'not-started',
      createdAt: '2026-05-16',
   },
];
