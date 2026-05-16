import MainLayout from '@/components/layout/main-layout';
import TmProjectHeader from '@/components/taskm/project/tm-project-header';
import TmLayerGrid from '@/components/taskm/project/tm-layer-grid';

interface Props {
   params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: Props) {
   const { projectId } = await params;
   return (
      <MainLayout header={<TmProjectHeader projectId={projectId} />}>
         <TmLayerGrid projectId={projectId} />
      </MainLayout>
   );
}
