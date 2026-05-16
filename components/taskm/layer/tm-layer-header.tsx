import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { tmProjects } from '@/mock-data/tm-projects';
import { tmLayers } from '@/mock-data/tm-layers';

interface Props {
   projectId: string;
   layerId: string;
}

export default function TmLayerHeader({ projectId, layerId }: Props) {
   const project = tmProjects.find((p) => p.id === projectId);
   const layer = tmLayers.find((l) => l.id === layerId);

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
            <Link
               href={`/projects/${projectId}`}
               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
               {project?.name ?? projectId}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">
               {layer ? `Layer ${layer.index}: ${layer.name}` : layerId}
            </span>
         </div>
      </div>
   );
}
