import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Project } from '@/lib/db/schema';

interface Props {
   project: Project;
}

export default function TmProjectHeader({ project }: Props) {
   return (
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
            <span className="text-sm font-medium">{project.name}</span>
         </div>
      </div>
   );
}
