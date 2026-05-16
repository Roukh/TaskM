'use client';

import { tmLogs } from '@/mock-data/tm-logs';
import { tmLayers } from '@/mock-data/tm-layers';
import { TmLog } from '@/types/taskm';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
   CheckCircle2,
   PlayCircle,
   Wrench,
   FileText,
   MessageSquare,
   AlertCircle,
} from 'lucide-react';

const typeConfig: Record<TmLog['type'], { icon: React.FC<{ className?: string }>; color: string }> =
   {
      layer_start: {
         icon: ({ className }) => <PlayCircle className={cn('text-blue-500', className)} />,
         color: 'text-blue-500',
      },
      layer_complete: {
         icon: ({ className }) => <CheckCircle2 className={cn('text-green-500', className)} />,
         color: 'text-green-500',
      },
      task_done: {
         icon: ({ className }) => <Wrench className={cn('text-yellow-500', className)} />,
         color: 'text-yellow-500',
      },
      spec_written: {
         icon: ({ className }) => <FileText className={cn('text-purple-500', className)} />,
         color: 'text-purple-500',
      },
      response: {
         icon: ({ className }) => (
            <MessageSquare className={cn('text-muted-foreground', className)} />
         ),
         color: 'text-muted-foreground',
      },
      error: {
         icon: ({ className }) => <AlertCircle className={cn('text-red-500', className)} />,
         color: 'text-red-500',
      },
   };

function LogRow({ log }: { log: TmLog }) {
   const config = typeConfig[log.type];
   const Icon = config.icon;
   const layer = log.layerId ? tmLayers.find((l) => l.id === log.layerId) : null;

   return (
      <div className="w-full flex items-start gap-4 py-3 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30">
         <Icon className="size-4 mt-0.5 shrink-0" />
         <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{log.summary}</p>
            {layer && (
               <span className="text-xs text-muted-foreground mt-0.5 block">
                  Layer {layer.index}: {layer.name}
               </span>
            )}
         </div>
         <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {format(new Date(log.createdAt), 'MMM d, HH:mm')}
         </span>
      </div>
   );
}

interface Props {
   projectId: string;
}

export default function TmLogsList({ projectId }: Props) {
   const logs = tmLogs
      .filter((l) => l.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

   if (logs.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-64 gap-2 text-sm text-muted-foreground">
            <p>No logs yet for this project.</p>
            <p className="text-xs">Events are written here as the build progresses.</p>
         </div>
      );
   }

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs flex items-center text-muted-foreground border-b sticky top-0 z-10">
            <div className="w-8" />
            <div className="flex-1">Event</div>
            <div>Time</div>
         </div>
         <div className="w-full">
            {logs.map((log) => (
               <LogRow key={log.id} log={log} />
            ))}
         </div>
      </div>
   );
}
