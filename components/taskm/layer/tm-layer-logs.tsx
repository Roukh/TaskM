'use client';

import type { Log } from '@/lib/db/schema';
import { LayerIndex, TASKM_LAYERS } from '@/types/taskm';
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

type LogType =
   | 'layer_start'
   | 'layer_complete'
   | 'task_done'
   | 'atom_written'
   | 'response'
   | 'error';

const typeConfig: Record<LogType, { icon: React.FC<{ className?: string }>; color: string }> = {
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
   atom_written: {
      icon: ({ className }) => <FileText className={cn('text-purple-500', className)} />,
      color: 'text-purple-500',
   },
   response: {
      icon: ({ className }) => <MessageSquare className={cn('text-muted-foreground', className)} />,
      color: 'text-muted-foreground',
   },
   error: {
      icon: ({ className }) => <AlertCircle className={cn('text-red-500', className)} />,
      color: 'text-red-500',
   },
};

function LogRow({ log }: { log: Log }) {
   const logType = (log.type ?? 'response') as LogType;
   const config = typeConfig[logType] ?? typeConfig.response;
   const Icon = config.icon;

   return (
      <div className="w-full flex items-start gap-4 py-3 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30">
         <Icon className="size-4 mt-0.5 shrink-0" />
         <p className="flex-1 min-w-0 text-sm leading-relaxed">{log.summary}</p>
         <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : ''}
         </span>
      </div>
   );
}

interface Props {
   logs: Log[];
   layerIndex: LayerIndex;
}

export default function TmLayerLogs({ logs, layerIndex }: Props) {
   const layer = TASKM_LAYERS.find((l) => l.index === layerIndex);

   if (logs.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
            <p>
               No logs for {layer ? `Layer ${layer.index}: ${layer.name}` : `Layer ${layerIndex}`}{' '}
               yet.
            </p>
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
