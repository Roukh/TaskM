import MainLayout from '@/components/layout/main-layout';
import TmLogsHeader from '@/components/taskm/logs/tm-logs-header';
import TmLogsList from '@/components/taskm/logs/tm-logs-list';

interface Props {
   params: Promise<{ projectId: string }>;
}

export default async function LogsPage({ params }: Props) {
   const { projectId } = await params;
   return (
      <MainLayout header={<TmLogsHeader projectId={projectId} />}>
         <TmLogsList projectId={projectId} />
      </MainLayout>
   );
}
