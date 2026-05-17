import MainLayout from '@/components/layout/main-layout';
import TmProjectsHeader from '@/components/taskm/projects/tm-projects-header';
import TmProjectsList from '@/components/taskm/projects/tm-projects-list';
import { getProjects, getTasks, DEV_USER_ID } from '@/lib/db/queries';

export default async function ProjectsPage() {
   // TODO: replace with session.user.id once auth is wired
   const projectList = await getProjects(DEV_USER_ID);

   // Fetch all tasks for all projects in parallel (needed for layer-progress badges)
   const tasksByProject = await Promise.all(projectList.map((p) => getTasks(p.id)));
   const allTasks = tasksByProject.flat();

   return (
      <MainLayout header={<TmProjectsHeader />}>
         <TmProjectsList projects={projectList} tasks={allTasks} />
      </MainLayout>
   );
}
