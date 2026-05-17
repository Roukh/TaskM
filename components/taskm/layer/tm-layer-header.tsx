import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { TASKM_LAYERS, LayerIndex } from '@/types/taskm';

interface Props {
   projectId: string;
   layerIndex: LayerIndex;
   projectName: string;
}

export default function TmLayerHeader({ projectId, layerIndex, projectName }: Props) {
   const layer = TASKM_LAYERS.find((l) => l.index === layerIndex);

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
               {projectName}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">
               {layer ? `Layer ${layer.index}: ${layer.name}` : `Layer ${layerIndex}`}
            </span>
         </div>
      </div>
   );
}
