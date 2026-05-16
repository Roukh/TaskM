import MainLayout from '@/components/layout/main-layout';
import TmProjectsHeader from '@/components/taskm/projects/tm-projects-header';
import TmProjectsList from '@/components/taskm/projects/tm-projects-list';

export default function ProjectsPage() {
   return (
      <MainLayout header={<TmProjectsHeader />}>
         <TmProjectsList />
      </MainLayout>
   );
}
