'use client';

import { useState, useTransition } from 'react';
import type { Rule } from '@/lib/db/schema';
import { TASKM_LAYERS } from '@/types/taskm';
import { createRule, updateRule, deleteRule } from '@/lib/actions/rules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type LayerOption = '0' | '1' | '2' | '3' | '4' | 'all';

interface RuleFormState {
   name: string;
   description: string;
   content: string;
   layerIndex: LayerOption;
}

const EMPTY_FORM: RuleFormState = {
   name: '',
   description: '',
   content: '',
   layerIndex: 'all',
};

function layerLabel(layerIndex: number | null) {
   if (layerIndex === null) return 'All layers';
   return `Layer ${layerIndex}: ${TASKM_LAYERS.find((l) => l.index === layerIndex)?.name ?? ''}`;
}

function RuleDialog({
   open,
   onClose,
   initial,
   onSave,
}: {
   open: boolean;
   onClose: () => void;
   initial: RuleFormState;
   onSave: (form: RuleFormState) => void;
}) {
   const [form, setForm] = useState<RuleFormState>(initial);

   function set(key: keyof RuleFormState, value: string) {
      setForm((f) => ({ ...f, [key]: value }));
   }

   return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
         <DialogContent className="max-w-lg">
            <DialogHeader>
               <DialogTitle>{initial.name ? 'Edit rule' : 'Add rule'}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
               <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input
                     value={form.name}
                     onChange={(e) => set('name', e.target.value)}
                     placeholder="Rule name"
                     className="h-8 text-sm"
                  />
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Description (optional)</label>
                  <Input
                     value={form.description}
                     onChange={(e) => set('description', e.target.value)}
                     placeholder="Short description"
                     className="h-8 text-sm"
                  />
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Content</label>
                  <Textarea
                     value={form.content}
                     onChange={(e) => set('content', e.target.value)}
                     placeholder="The rule itself — what the agent must follow…"
                     className="text-sm min-h-[100px] resize-none"
                  />
               </div>

               <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Assign to layer</label>
                  <Select
                     value={form.layerIndex}
                     onValueChange={(v) => set('layerIndex', v as LayerOption)}
                  >
                     <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">All layers</SelectItem>
                        {TASKM_LAYERS.map((l) => (
                           <SelectItem key={l.index} value={String(l.index)}>
                              Layer {l.index}: {l.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <DialogFooter>
               <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
               </Button>
               <Button
                  size="sm"
                  disabled={!form.name.trim() || !form.content.trim()}
                  onClick={() => onSave(form)}
               >
                  Save
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}

interface Props {
   initialRules: Rule[];
}

export default function TmRulesPage({ initialRules }: Props) {
   const [rules, setRules] = useState<Rule[]>(initialRules);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editing, setEditing] = useState<Rule | null>(null);
   const [deleting, setDeleting] = useState<Rule | null>(null);
   const [isPending, startTransition] = useTransition();

   function openAdd() {
      setEditing(null);
      setDialogOpen(true);
   }

   function openEdit(rule: Rule) {
      setEditing(rule);
      setDialogOpen(true);
   }

   function closeDialog() {
      setDialogOpen(false);
      setEditing(null);
   }

   function formFromRule(rule: Rule): RuleFormState {
      return {
         name: rule.name,
         description: rule.description ?? '',
         content: rule.content,
         layerIndex: rule.layerIndex !== null ? (String(rule.layerIndex) as LayerOption) : 'all',
      };
   }

   function save(form: RuleFormState) {
      const layerIndex = form.layerIndex === 'all' ? null : parseInt(form.layerIndex, 10);
      const input = {
         name: form.name,
         description: form.description || undefined,
         content: form.content,
         layerIndex,
      };

      startTransition(async () => {
         if (editing) {
            const result = await updateRule(editing.id, input);
            if ('rule' in result) {
               setRules((prev) => prev.map((r) => (r.id === result.rule.id ? result.rule : r)));
            }
         } else {
            const result = await createRule(input);
            if ('rule' in result) {
               setRules((prev) => [...prev, result.rule]);
            }
         }
         closeDialog();
      });
   }

   function confirmDelete(rule: Rule) {
      setDeleting(rule);
   }

   function doDelete() {
      if (!deleting) return;
      const id = deleting.id;
      startTransition(async () => {
         const result = await deleteRule(id);
         if ('success' in result) {
            setRules((prev) => prev.filter((r) => r.id !== id));
         }
         setDeleting(null);
      });
   }

   return (
      <div className="w-full">
         {/* Header row */}
         <div className="bg-container px-6 py-1.5 text-xs flex items-center justify-between text-muted-foreground border-b sticky top-0 z-10">
            <span>
               {rules.length} rule{rules.length !== 1 ? 's' : ''}
            </span>
            <Button
               variant="ghost"
               size="sm"
               className="h-6 gap-1 text-xs text-muted-foreground"
               onClick={openAdd}
            >
               <Plus className="size-3" />
               Add rule
            </Button>
         </div>

         {/* Column headers */}
         <div className="grid grid-cols-[2fr_3fr_1fr_80px] gap-4 px-6 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/20">
            <span>Name</span>
            <span>Content</span>
            <span>Layer</span>
            <span />
         </div>

         {/* Rules rows */}
         {rules.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
               <p>No rules yet.</p>
               <p className="text-xs">Rules tell agents what to follow across layers.</p>
            </div>
         )}

         {rules.map((rule) => (
            <div
               key={rule.id}
               className="grid grid-cols-[2fr_3fr_1fr_80px] gap-4 px-6 py-3 text-sm border-b border-muted-foreground/5 hover:bg-sidebar/30 items-start"
            >
               <div className="min-w-0">
                  <div className="font-medium truncate">{rule.name}</div>
                  {rule.description && (
                     <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {rule.description}
                     </div>
                  )}
               </div>
               <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {rule.content}
               </div>
               <div>
                  <Badge variant="outline" className="text-xs font-normal">
                     {layerLabel(rule.layerIndex)}
                  </Badge>
               </div>
               <div className="flex items-center gap-1 justify-end">
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-7 text-muted-foreground hover:text-foreground"
                     onClick={() => openEdit(rule)}
                  >
                     <Pencil className="size-3" />
                  </Button>
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-7 text-muted-foreground hover:text-destructive"
                     onClick={() => confirmDelete(rule)}
                  >
                     <Trash2 className="size-3" />
                  </Button>
               </div>
            </div>
         ))}

         {/* Add/Edit dialog */}
         <RuleDialog
            open={dialogOpen}
            onClose={closeDialog}
            initial={editing ? formFromRule(editing) : EMPTY_FORM}
            onSave={save}
         />

         {/* Delete confirm */}
         <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete rule?</AlertDialogTitle>
                  <AlertDialogDescription>
                     &ldquo;{deleting?.name}&rdquo; will be permanently removed.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={doDelete} disabled={isPending}>
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
