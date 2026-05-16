import MainLayout from '@/components/layout/main-layout';
import TmLayerHeader from '@/components/taskm/layer/tm-layer-header';
import TmLayerTasks from '@/components/taskm/layer/tm-layer-tasks';

interface Props {
   params: Promise<{ projectId: string; layerId: string }>;
}

export default async function LayerTasksPage({ params }: Props) {
   const { projectId, layerId } = await params;
   return (
      <MainLayout header={<TmLayerHeader projectId={projectId} layerId={layerId} />}>
         <TmLayerTasks projectId={projectId} layerId={layerId} />
      </MainLayout>
   );
}
