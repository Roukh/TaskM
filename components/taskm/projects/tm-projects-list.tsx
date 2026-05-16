'use client';

import { tmProjects } from '@/mock-data/tm-projects';
import { tmLayers } from '@/mock-data/tm-layers';
import { TmProject, LayerState } from '@/types/taskm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Box, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stateColors: Record<LayerState, string> = {
   'not-started': 'bg-muted text-muted-foreground',
   'in-progress': 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
   'complete': 'bg-green-500/15 text-green-600 dark:text-green-400',
   'blocked': 'bg-red-500/15 text-red-600 dark:text-red-400',
};

const stateLabels: Record<LayerState, string> = {
   'not-started': 'Not started',
   'in-progress': 'In progress',
   'complete': 'Complete',
   'blocked': 'Blocked',
};

function ProjectRow({ project }: { project: TmProject }) {
   const layers = tmLayers.filter((l) => l.projectId === project.id);
   const completedLayers = layers.filter((l) => l.state === 'complete').length;
   const currentLayer = layers.find((l) => l.state === 'in-progress');

   return (
      <Link
         href={`/projects/${project.id}`}
         className="w-full flex items-center py-3 px-6 border-b hover:bg-sidebar/50 border-muted-foreground/5 text-sm group"
      >
         <div className="w-[45%] flex items-center gap-2.5 min-w-0">
            <div className="inline-flex size-6 bg-muted/50 items-center justify-center rounded shrink-0">
               <Box className="size-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
               <span className="font-medium truncate">{project.name}</span>
               <span className="text-xs text-muted-foreground truncate">{project.goal}</span>
            </div>
         </div>

         <div className="w-[15%] text-muted-foreground text-xs font-mono">{project.type}</div>

         <div className="w-[20%]">
            <Badge
               variant="secondary"
               className={cn('text-xs font-normal', stateColors[project.state])}
            >
               {stateLabels[project.state]}
            </Badge>
         </div>

         <div className="w-[15%] text-xs text-muted-foreground">
            {currentLayer ? (
               <span>
                  Layer {currentLayer.index}: {currentLayer.name}
               </span>
            ) : (
               <span>
                  {completedLayers}/{layers.length} layers
               </span>
            )}
         </div>

         <div className="w-[5%] flex justify-end">
            <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
      </Link>
   );
}

export default function TmProjectsList() {
   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs flex items-center text-muted-foreground border-b sticky top-0 z-10">
            <div className="w-[45%]">Project</div>
            <div className="w-[15%]">Type</div>
            <div className="w-[20%]">State</div>
            <div className="w-[15%]">Current layer</div>
            <div className="w-[5%]" />
         </div>
         <div className="w-full">
            {tmProjects.map((project) => (
               <ProjectRow key={project.id} project={project} />
            ))}
         </div>
      </div>
   );
}
