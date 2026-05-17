'use client';

import { TASKM_LAYERS, LayerIndex, LayerState, computeLayerProgress, TmTask } from '@/types/taskm';
import { Task } from '@/lib/db/schema';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const stateConfig: Record<
   LayerState,
   { icon: React.FC<{ className?: string }>; color: string; label: string }
> = {
   'not-started': {
      icon: ({ className }) => <Circle className={cn('text-muted-foreground', className)} />,
      color: 'border-muted',
      label: 'Not started',
   },
   'in-progress': {
      icon: ({ className }) => (
         <Loader2 className={cn('text-yellow-500 animate-spin', className)} />
      ),
      color: 'border-yellow-500/40',
      label: 'In progress',
   },
   'complete': {
      icon: ({ className }) => <CheckCircle2 className={cn('text-green-500', className)} />,
      color: 'border-green-500/40',
      label: 'Complete',
   },
   'blocked': {
      icon: ({ className }) => <XCircle className={cn('text-red-500', className)} />,
      color: 'border-red-500/40',
      label: 'Blocked',
   },
};

interface LayerCardProps {
   layerIndex: LayerIndex;
   name: string;
   description: string;
   percent: number;
   state: LayerState;
   projectId: string;
}

function LayerCard({ layerIndex, name, description, percent, state, projectId }: LayerCardProps) {
   const config = stateConfig[state];
   const StateIcon = config.icon;

   return (
      <Link
         href={`/projects/${projectId}/layers/${layerIndex}`}
         className={cn(
            'flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-card/80 transition-colors',
            config.color
         )}
      >
         <div className="flex items-start justify-between gap-2">
            <div>
               <div className="text-xs text-muted-foreground font-mono mb-0.5">
                  Layer {layerIndex}
               </div>
               <div className="font-medium text-sm">{name}</div>
            </div>
            <StateIcon className="size-4 shrink-0 mt-0.5" />
         </div>
         <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
         {state !== 'not-started' && (
            <div className="flex flex-col gap-1">
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{config.label}</span>
                  <span>{percent}%</span>
               </div>
               <Progress value={percent} className="h-1" />
            </div>
         )}
         {state === 'not-started' && (
            <span className="text-xs text-muted-foreground">{config.label}</span>
         )}
      </Link>
   );
}

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

interface Props {
   projectId: string;
   tasks: Task[];
}

export default function TmLayerGrid({ projectId, tasks }: Props) {
   const tmTasks = tasks.map(toTmTask);

   return (
      <div className="p-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {TASKM_LAYERS.map((layer) => {
               const { percent, state } = computeLayerProgress(tmTasks, layer.index as LayerIndex);
               return (
                  <LayerCard
                     key={layer.index}
                     layerIndex={layer.index as LayerIndex}
                     name={layer.name}
                     description={layer.description}
                     percent={percent}
                     state={state}
                     projectId={projectId}
                  />
               );
            })}
         </div>
      </div>
   );
}
