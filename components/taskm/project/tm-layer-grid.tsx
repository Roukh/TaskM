'use client';

import { tmLayers } from '@/mock-data/tm-layers';
import { TmLayer, LayerState } from '@/types/taskm';
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

function LayerCard({ layer, projectId }: { layer: TmLayer; projectId: string }) {
   const config = stateConfig[layer.state];
   const StateIcon = config.icon;

   return (
      <Link
         href={`/projects/${projectId}/layers/${layer.id}`}
         className={cn(
            'flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-card/80 transition-colors',
            config.color
         )}
      >
         <div className="flex items-start justify-between gap-2">
            <div>
               <div className="text-xs text-muted-foreground font-mono mb-0.5">
                  Layer {layer.index}
               </div>
               <div className="font-medium text-sm">{layer.name}</div>
            </div>
            <StateIcon className="size-4 shrink-0 mt-0.5" />
         </div>
         <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
         {layer.state !== 'not-started' && (
            <div className="flex flex-col gap-1">
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{config.label}</span>
                  <span>{layer.percentComplete}%</span>
               </div>
               <Progress value={layer.percentComplete} className="h-1" />
            </div>
         )}
         {layer.state === 'not-started' && (
            <span className="text-xs text-muted-foreground">{config.label}</span>
         )}
      </Link>
   );
}

interface Props {
   projectId: string;
}

export default function TmLayerGrid({ projectId }: Props) {
   const layers = tmLayers
      .filter((l) => l.projectId === projectId)
      .sort((a, b) => a.index - b.index);

   if (layers.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-64 gap-3 text-sm text-muted-foreground">
            <p>No layers found for this project.</p>
            <p className="text-xs">Run taskm init to set up layers.</p>
         </div>
      );
   }

   return (
      <div className="p-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {layers.map((layer) => (
               <LayerCard key={layer.id} layer={layer} projectId={projectId} />
            ))}
         </div>
      </div>
   );
}
