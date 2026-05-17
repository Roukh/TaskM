'use client';

import { Task } from '@/lib/db/schema';
import { LayerIndex } from '@/types/taskm';
import { cn } from '@/lib/utils';
import {
   Circle,
   Loader2,
   CheckCircle2,
   XCircle,
   AlertCircle,
   ChevronUp,
   ChevronDown,
   Minus,
} from 'lucide-react';

type TaskStatus = 'todo' | 'in-progress' | 'complete' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

const statusConfig: Record<TaskStatus, { icon: React.FC<{ className?: string }>; label: string }> =
   {
      'todo': {
         icon: ({ className }) => <Circle className={cn('text-muted-foreground', className)} />,
         label: 'Todo',
      },
      'in-progress': {
         icon: ({ className }) => (
            <Loader2 className={cn('text-yellow-500 animate-spin', className)} />
         ),
         label: 'In progress',
      },
      'complete': {
         icon: ({ className }) => <CheckCircle2 className={cn('text-green-500', className)} />,
         label: 'Complete',
      },
      'blocked': {
         icon: ({ className }) => <XCircle className={cn('text-red-500', className)} />,
         label: 'Blocked',
      },
   };

const priorityConfig: Record<
   TaskPriority,
   { icon: React.FC<{ className?: string }>; color: string }
> = {
   urgent: {
      icon: ({ className }) => <AlertCircle className={cn('text-red-500', className)} />,
      color: 'text-red-500',
   },
   high: {
      icon: ({ className }) => <ChevronUp className={cn('text-orange-500', className)} />,
      color: 'text-orange-500',
   },
   medium: {
      icon: ({ className }) => <Minus className={cn('text-yellow-500', className)} />,
      color: 'text-yellow-500',
   },
   low: {
      icon: ({ className }) => <ChevronDown className={cn('text-muted-foreground', className)} />,
      color: 'text-muted-foreground',
   },
};

function TaskRow({ task }: { task: Task }) {
   const taskStatus = (task.status ?? 'todo') as TaskStatus;
   const taskPriority = (task.priority ?? 'medium') as TaskPriority;
   const status = statusConfig[taskStatus];
   const priority = priorityConfig[taskPriority];
   const StatusIcon = status.icon;
   const PriorityIcon = priority.icon;

   return (
      <div className="w-full flex items-center py-2.5 px-6 border-b hover:bg-sidebar/50 border-muted-foreground/5 text-sm group">
         <div className="flex items-center gap-3 flex-1 min-w-0">
            <StatusIcon className="size-3.5 shrink-0" />
            <PriorityIcon className="size-3.5 shrink-0" />
            <span
               className={cn(
                  'truncate',
                  taskStatus === 'complete' && 'line-through text-muted-foreground'
               )}
            >
               {task.title}
            </span>
         </div>
         <span className="text-xs text-muted-foreground shrink-0">
            {task.createdAt?.toLocaleDateString() ?? ''}
         </span>
      </div>
   );
}

interface Props {
   tasks: Task[];
   layerIndex: LayerIndex;
   audience?: 'llm' | 'user';
}

export default function TmLayerTasks({ tasks, audience }: Props) {
   const visible = audience ? tasks.filter((t) => t.audience === audience) : tasks;
   const emptyHint =
      audience === 'user'
         ? 'Actions that require human input or approval appear here.'
         : 'Agents write tasks here as the layer is built.';

   if (visible.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
            <p>No {audience === 'user' ? 'user' : 'agent'} tasks yet.</p>
            <p className="text-xs">{emptyHint}</p>
         </div>
      );
   }

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs flex items-center text-muted-foreground border-b sticky top-0 z-10">
            <div className="flex-1">Task</div>
            <div>Created</div>
         </div>
         <div className="w-full">
            {visible.map((task) => (
               <TaskRow key={task.id} task={task} />
            ))}
         </div>
      </div>
   );
}
