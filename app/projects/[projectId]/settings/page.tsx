import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import MainLayout from '@/components/layout/main-layout';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { db } from '@/lib/db';
import { projects, user } from '@/lib/db/schema';
import { auth } from '@/lib/auth/index';
import TmConnectRepo from '@/components/taskm/project/tm-connect-repo';
import { TmClaudeApiKey } from '@/components/taskm/settings/tm-claude-api-key';

interface Props {
   params: Promise<{ projectId: string }>;
}

export default async function ProjectSettingsPage({ params }: Props) {
   const { projectId } = await params;

   const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

   if (!project) {
      notFound();
   }

   const requestHeaders = await headers();
   const session = await auth.api.getSession({ headers: requestHeaders });

   let hasKey = false;
   if (session?.user?.id) {
      const [row] = await db
         .select({ claudeApiKey: user.claudeApiKey })
         .from(user)
         .where(eq(user.id, session.user.id))
         .limit(1);
      hasKey = row?.claudeApiKey != null && row.claudeApiKey.length > 0;
   }

   return (
      <MainLayout
         header={
            <div className="w-full flex flex-col items-center">
               <div className="w-full flex items-center gap-2 px-4 py-2.5 border-b">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="h-4" />
                  <Link
                     href="/projects"
                     className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                     Projects
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <Link
                     href={`/projects/${projectId}`}
                     className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                     {project.name}
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-sm font-medium">Settings</span>
               </div>
            </div>
         }
      >
         <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
            <div>
               <h1 className="text-xl font-semibold">Project Settings</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Manage configuration for <span className="font-medium">{project.name}</span>.
               </p>
            </div>

            <section className="flex flex-col gap-3">
               <div>
                  <h2 className="text-base font-medium">GitHub Repository</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                     Link a GitHub repository to enable agent-driven commits and PR automation.
                  </p>
               </div>
               <TmConnectRepo project={project} />
            </section>

            <Card>
               <CardHeader>
                  <CardTitle>AI Integration</CardTitle>
               </CardHeader>
               <CardContent>
                  <TmClaudeApiKey hasKey={hasKey} />
               </CardContent>
            </Card>
         </div>
      </MainLayout>
   );
}
