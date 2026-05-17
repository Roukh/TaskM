'use client';

import { useState, useTransition } from 'react';
import type { Component } from '@/lib/db/schema';
import { createComponent, updateComponent, deleteComponent } from '@/lib/actions/frontend';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from '@/components/ui/dialog';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
   projectId: string;
   initialComponents: Component[];
}

type CompForm = { name: string; family: string; description: string };
const EMPTY: CompForm = { name: '', family: '', description: '' };

export default function TmFrontendComponents({ projectId, initialComponents }: Props) {
   const [items, setItems] = useState<Component[]>(initialComponents);
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<Component | null>(null);
   const [form, setForm] = useState<CompForm>(EMPTY);
   const [isPending, startTransition] = useTransition();

   function openAdd() {
      setEditing(null);
      setForm(EMPTY);
      setOpen(true);
   }
   function openEdit(c: Component) {
      setEditing(c);
      setForm({ name: c.name, family: c.family ?? '', description: c.description ?? '' });
      setOpen(true);
   }

   function save() {
      startTransition(async () => {
         const payload = {
            name: form.name,
            family: form.family || null,
            description: form.description || null,
         };
         if (editing) {
            const res = await updateComponent(editing.id, payload);
            if ('component' in res)
               setItems((prev) => prev.map((c) => (c.id === res.component.id ? res.component : c)));
         } else {
            const res = await createComponent(projectId, payload);
            if ('component' in res) setItems((prev) => [...prev, res.component]);
         }
         setOpen(false);
      });
   }

   function remove(id: string) {
      startTransition(async () => {
         await deleteComponent(id);
         setItems((prev) => prev.filter((c) => c.id !== id));
      });
   }

   const byFamily = items.reduce<Record<string, Component[]>>((acc, c) => {
      const key = c.family ?? 'other';
      return { ...acc, [key]: [...(acc[key] ?? []), c] };
   }, {});
   const families = Object.keys(byFamily).sort();

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10 flex items-center justify-between">
            <span>
               {items.length} component{items.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2" onClick={openAdd}>
               <Plus className="size-3" /> Add
            </Button>
         </div>

         {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground gap-1">
               <p>No components yet.</p>
            </div>
         )}

         {families.map((family) => (
            <div key={family}>
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {family}
               </div>
               {byFamily[family]!.map((c) => (
                  <div
                     key={c.id}
                     className="flex items-start gap-4 px-6 py-3 border-b border-muted-foreground/5 hover:bg-sidebar/20 group"
                  >
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">{c.name}</span>
                           {c.family && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal">
                                 {c.family}
                              </Badge>
                           )}
                        </div>
                        {c.description && (
                           <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {c.description}
                           </p>
                        )}
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                        <Button
                           variant="ghost"
                           size="icon"
                           className="size-7"
                           onClick={() => openEdit(c)}
                        >
                           <Pencil className="size-3" />
                        </Button>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="size-7 text-destructive hover:text-destructive"
                              >
                                 <Trash2 className="size-3" />
                              </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                 <AlertDialogTitle>Delete component?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                    This removes <strong>{c.name}</strong> from all page
                                    assignments.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => remove(c.id)}>
                                    Delete
                                 </AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </div>
               ))}
            </div>
         ))}

         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle>{editing ? 'Edit component' : 'Add component'}</DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label htmlFor="cp-name">Name</Label>
                     <Input
                        id="cp-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="tm-hero-section"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="cp-family">Family</Label>
                     <Input
                        id="cp-family"
                        value={form.family}
                        onChange={(e) => setForm({ ...form, family: e.target.value })}
                        placeholder="shell, nav, hero, footer…"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="cp-desc">Description</Label>
                     <Textarea
                        id="cp-desc"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="What this component does…"
                        className="resize-none min-h-[72px]"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={save} disabled={isPending || !form.name.trim()}>
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
