'use client';

import { tmLayers } from '@/mock-data/tm-layers';
import { TmTask } from '@/types/taskm';
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

// Placeholder tasks — will be replaced with Supabase queries
const PLACEHOLDER_TASKS: TmTask[] = [
   {
      id: '1',
      projectId: '',
      layerId: '',
      title: 'Define project type and constraints',
      description: '',
      status: 'complete',
      priority: 'high',
      createdAt: '2026-05-16',
   },
   {
      id: '2',
      projectId: '',
      layerId: '',
      title: 'Write spec rows to database',
      description: '',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2026-05-16',
   },
   {
      id: '3',
      projectId: '',
      layerId: '',
      title: 'Confirm sitemap structure with client',
      description: '',
      status: 'todo',
      priority: 'medium',
      createdAt: '2026-05-16',
   },
   {
      id: '4',
      projectId: '',
      layerId: '',
      title: 'Document design constraints',
      description: '',
      status: 'todo',
      priority: 'low',
      createdAt: '2026-05-16',
   },
];

const statusConfig: Record<
   TmTask['status'],
   { icon: React.FC<{ className?: string }>; label: string }
> = {
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
   TmTask['priority'],
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

function TaskRow({ task }: { task: TmTask }) {
   const status = statusConfig[task.status];
   const priority = priorityConfig[task.priority];
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
                  task.status === 'complete' && 'line-through text-muted-foreground'
               )}
            >
               {task.title}
            </span>
         </div>
         <span className="text-xs text-muted-foreground shrink-0">{task.createdAt}</span>
      </div>
   );
}

interface Props {
   projectId: string;
   layerId: string;
}

export default function TmLayerTasks({ projectId, layerId }: Props) {
   const layer = tmLayers.find((l) => l.id === layerId);
   const tasks = PLACEHOLDER_TASKS.map((t) => ({ ...t, projectId, layerId }));

   return (
      <div className="w-full">
         {layer && (
            <div className="px-6 py-4 border-b bg-muted/30">
               <p className="text-sm text-muted-foreground">{layer.description}</p>
            </div>
         )}
         <div className="bg-container px-6 py-1.5 text-xs flex items-center text-muted-foreground border-b sticky top-0 z-10">
            <div className="flex-1">Task</div>
            <div>Created</div>
         </div>
         <div className="w-full">
            {tasks.map((task) => (
               <TaskRow key={task.id} task={task} />
            ))}
         </div>
      </div>
   );
}
