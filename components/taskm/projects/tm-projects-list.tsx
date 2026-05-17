'use client';

import { Project } from '@/lib/db/schema';
import { Task } from '@/lib/db/schema';
import { LayerState, TASKM_LAYERS, LayerIndex, computeLayerProgress, TmTask } from '@/types/taskm';
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

// Map DB Task to TmTask shape expected by computeLayerProgress
function toTmTask(t: Task): TmTask {
   return {
      id: t.id,
      projectId: t.projectId,
      layerIndex: t.layerIndex as LayerIndex,
      title: t.title,
      description: t.description ?? null,
      status: t.status as TmTask['status'],
      priority: t.priority as TmTask['priority'],
      audience: (t.audience ?? 'llm') as TmTask['audience'],
      createdAt: t.createdAt?.toISOString() ?? '',
   };
}

function ProjectRow({ project, tasks }: { project: Project; tasks: Task[] }) {
   const projectTasks = tasks.filter((t) => t.projectId === project.id).map(toTmTask);

   const layerStates = TASKM_LAYERS.map((layer) => ({
      layer,
      ...computeLayerProgress(projectTasks, layer.index as LayerIndex),
   }));
   const currentLayer = layerStates.find((l) => l.state === 'in-progress');
   const completedCount = layerStates.filter((l) => l.state === 'complete').length;

   const projectState = (project.state ?? 'not-started') as LayerState;

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
               className={cn('text-xs font-normal', stateColors[projectState])}
            >
               {stateLabels[projectState]}
            </Badge>
         </div>

         <div className="w-[15%] text-xs text-muted-foreground">
            {currentLayer ? (
               <span>
                  Layer {currentLayer.layer.index}: {currentLayer.layer.name}
               </span>
            ) : (
               <span>
                  {completedCount}/{TASKM_LAYERS.length} layers
               </span>
            )}
         </div>

         <div className="w-[5%] flex justify-end">
            <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
      </Link>
   );
}

interface Props {
   projects: Project[];
   tasks: Task[];
}

export default function TmProjectsList({ projects, tasks }: Props) {
   if (projects.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
            <p>No projects yet.</p>
            <p className="text-xs">Create your first project to get started.</p>
         </div>
      );
   }

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
            {projects.map((project) => (
               <ProjectRow key={project.id} project={project} tasks={tasks} />
            ))}
         </div>
      </div>
   );
}
