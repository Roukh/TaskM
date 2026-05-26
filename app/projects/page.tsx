import MainLayout from '@/components/layout/main-layout';

export const metadata = { title: 'Projects' };

export default function ProjectsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-muted-foreground">No projects yet.</p>
      </div>
    </MainLayout>
  );
}
