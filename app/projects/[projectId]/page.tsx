import MainLayout from '@/components/layout/main-layout';
import TmProjectHeader from '@/components/taskm/project/tm-project-header';
import TmLayerGrid from '@/components/taskm/project/tm-layer-grid';
import { getProject, getTasks, DEV_USER_ID } from '@/lib/db/queries';
import { notFound } from 'next/navigation';

interface Props {
   params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
   const { projectId } = await params;

   // TODO: replace with session.user.id once auth is wired
   const [project, tasks] = await Promise.all([
      getProject(projectId, DEV_USER_ID),
      getTasks(projectId),
   ]);

   if (!project) notFound();

   return (
      <MainLayout header={<TmProjectHeader project={project} />}>
         <TmLayerGrid projectId={projectId} tasks={tasks} />
      </MainLayout>
   );
}
