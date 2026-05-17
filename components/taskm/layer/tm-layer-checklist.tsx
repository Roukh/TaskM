'use client';

import { useState } from 'react';
import type { Checklist } from '@/lib/db/schema';
import { LayerIndex } from '@/types/taskm';
import { cn } from '@/lib/utils';
import { CheckSquare2, Square, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Extend with a local-only flag for optimistic UI adds
type LocalItem = Checklist & { localOnly?: boolean };

function ChecklistRow({ item, onToggle }: { item: LocalItem; onToggle: (id: string) => void }) {
   return (
      <div
         className="flex items-start gap-3 py-2.5 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30 cursor-pointer"
         onClick={() => onToggle(item.id)}
      >
         {item.passed ? (
            <CheckSquare2 className="size-4 text-green-500 mt-0.5 shrink-0" />
         ) : (
            <Square className="size-4 text-muted-foreground mt-0.5 shrink-0" />
         )}
         <span
            className={cn(
               'flex-1 leading-relaxed',
               item.passed && 'line-through text-muted-foreground'
            )}
         >
            {item.title}
         </span>
         <span className="text-xs text-muted-foreground shrink-0 font-mono">{item.category}</span>
      </div>
   );
}

interface Props {
   projectId: string;
   layerIndex: LayerIndex;
   initialChecklist: Checklist[];
}

export default function TmLayerChecklist({ projectId, initialChecklist }: Props) {
   const [items, setItems] = useState<LocalItem[]>(initialChecklist);
   const [adding, setAdding] = useState(false);
   const [draft, setDraft] = useState('');

   function toggle(id: string) {
      setItems((prev) =>
         prev.map((i) =>
            i.id === id
               ? {
                    ...i,
                    passed: !i.passed,
                    passedAt: !i.passed ? new Date() : null,
                    passedBy: !i.passed ? ('human' as const) : null,
                 }
               : i
         )
      );
   }

   function addItem() {
      const trimmed = draft.trim();
      if (!trimmed) return;
      const newItem: LocalItem = {
         id: `local-${Date.now()}`,
         projectId,
         templateId: null,
         title: trimmed,
         category: 'ux',
         order: items.length,
         passed: false,
         passedAt: null,
         passedBy: null,
         localOnly: true,
      };
      setItems((prev) => [...prev, newItem]);
      setDraft('');
      setAdding(false);
   }

   const done = items.filter((i) => i.passed).length;

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs flex items-center justify-between text-muted-foreground border-b sticky top-0 z-10">
            <span>
               {done}/{items.length} complete
            </span>
            <Button
               variant="ghost"
               size="sm"
               className="h-6 gap-1 text-xs text-muted-foreground"
               onClick={() => setAdding(true)}
            >
               <Plus className="size-3" />
               Add item
            </Button>
         </div>

         <div className="w-full">
            {items.map((item) => (
               <ChecklistRow key={item.id} item={item} onToggle={toggle} />
            ))}
         </div>

         {adding && (
            <div className="flex items-center gap-2 px-6 py-3 border-b border-muted-foreground/5">
               <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter') addItem();
                     if (e.key === 'Escape') {
                        setAdding(false);
                        setDraft('');
                     }
                  }}
                  placeholder="Checklist item…"
                  className="h-8 text-sm"
               />
               <Button size="sm" className="h-8" onClick={addItem}>
                  Add
               </Button>
               <Button
                  size="sm"
                  variant="ghost"
                  className="h-8"
                  onClick={() => {
                     setAdding(false);
                     setDraft('');
                  }}
               >
                  Cancel
               </Button>
            </div>
         )}

         {items.length === 0 && !adding && (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
               <p>No checklist items yet.</p>
               <p className="text-xs">QA criteria for this project — agents verify each one.</p>
            </div>
         )}
      </div>
   );
}
