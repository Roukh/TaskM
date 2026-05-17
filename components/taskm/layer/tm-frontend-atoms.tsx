'use client';

import { useState, useTransition } from 'react';
import type { Atom } from '@/lib/db/schema';
import { createAtom, updateAtom, deleteAtom } from '@/lib/actions/frontend';
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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
   projectId: string;
   initialAtoms: Atom[];
}

const ATOM_TYPES = [
   'button',
   'link',
   'icon',
   'input',
   'label',
   'badge',
   'image',
   'divider',
   'text',
] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type AtomForm = {
   family: string;
   atomType: string;
   variant: string;
   size: string;
   icon: string;
   interactive: boolean;
};
const EMPTY: AtomForm = {
   family: '',
   atomType: 'button',
   variant: '',
   size: 'md',
   icon: '',
   interactive: false,
};

export default function TmFrontendAtoms({ projectId, initialAtoms }: Props) {
   const [items, setItems] = useState<Atom[]>(initialAtoms);
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<Atom | null>(null);
   const [form, setForm] = useState<AtomForm>(EMPTY);
   const [isPending, startTransition] = useTransition();

   function openAdd() {
      setEditing(null);
      setForm(EMPTY);
      setOpen(true);
   }
   function openEdit(a: Atom) {
      setEditing(a);
      setForm({
         family: a.family,
         atomType: a.atomType,
         variant: a.variant ?? '',
         size: a.size ?? 'md',
         icon: a.icon ?? '',
         interactive: a.interactive,
      });
      setOpen(true);
   }

   function save() {
      startTransition(async () => {
         const payload = {
            family: form.family,
            atomType: form.atomType,
            variant: form.variant || null,
            size: form.size || null,
            icon: form.icon || null,
            interactive: form.interactive,
         };
         if (editing) {
            const res = await updateAtom(editing.id, payload);
            if ('atom' in res)
               setItems((prev) => prev.map((a) => (a.id === res.atom.id ? res.atom : a)));
         } else {
            const res = await createAtom(projectId, payload);
            if ('atom' in res) setItems((prev) => [...prev, res.atom]);
         }
         setOpen(false);
      });
   }

   function remove(id: string) {
      startTransition(async () => {
         await deleteAtom(id);
         setItems((prev) => prev.filter((a) => a.id !== id));
      });
   }

   const byType = items.reduce<Record<string, Atom[]>>(
      (acc, a) => ({
         ...acc,
         [a.atomType]: [...(acc[a.atomType] ?? []), a],
      }),
      {}
   );
   const knownTypes = ATOM_TYPES.filter((t) => byType[t]);
   const extraTypes = Object.keys(byType).filter(
      (t) => !ATOM_TYPES.includes(t as (typeof ATOM_TYPES)[number])
   );
   const types: string[] = [...knownTypes, ...extraTypes];

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10 flex items-center justify-between">
            <span>
               {items.length} atom{items.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2" onClick={openAdd}>
               <Plus className="size-3" /> Add
            </Button>
         </div>

         {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground gap-1">
               <p>No atoms yet.</p>
            </div>
         )}

         {types.map((type) => (
            <div key={type}>
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {type}
               </div>
               {(byType[type] ?? []).map((a) => (
                  <div
                     key={a.id}
                     className="flex items-center gap-3 px-6 py-2.5 border-b border-muted-foreground/5 hover:bg-sidebar/20 group text-sm"
                  >
                     <span className="flex-1 font-medium">{a.family}</span>
                     {a.variant && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 font-normal">
                           {a.variant}
                        </Badge>
                     )}
                     {a.size && (
                        <span className="text-xs text-muted-foreground font-mono w-6">
                           {a.size}
                        </span>
                     )}
                     {a.icon && (
                        <span className="text-xs text-muted-foreground font-mono">{a.icon}</span>
                     )}
                     {a.interactive && (
                        <span className="text-[10px] text-muted-foreground">interactive</span>
                     )}
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                        <Button
                           variant="ghost"
                           size="icon"
                           className="size-7"
                           onClick={() => openEdit(a)}
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
                                 <AlertDialogTitle>Delete atom?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                    Remove <strong>{a.family}</strong> atom.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => remove(a.id)}>
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
                  <DialogTitle>{editing ? 'Edit atom' : 'Add atom'}</DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label htmlFor="at-family">Family / name</Label>
                     <Input
                        id="at-family"
                        value={form.family}
                        onChange={(e) => setForm({ ...form, family: e.target.value })}
                        placeholder="primary-button"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="grid gap-1.5">
                        <Label>Type</Label>
                        <Select
                           value={form.atomType}
                           onValueChange={(v) => setForm({ ...form, atomType: v })}
                        >
                           <SelectTrigger>
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              {ATOM_TYPES.map((t) => (
                                 <SelectItem key={t} value={t}>
                                    {t}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="grid gap-1.5">
                        <Label>Size</Label>
                        <Select
                           value={form.size}
                           onValueChange={(v) => setForm({ ...form, size: v })}
                        >
                           <SelectTrigger>
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              {SIZES.map((s) => (
                                 <SelectItem key={s} value={s}>
                                    {s}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="grid gap-1.5">
                        <Label htmlFor="at-variant">Variant</Label>
                        <Input
                           id="at-variant"
                           value={form.variant}
                           onChange={(e) => setForm({ ...form, variant: e.target.value })}
                           placeholder="default, ghost…"
                        />
                     </div>
                     <div className="grid gap-1.5">
                        <Label htmlFor="at-icon">Icon</Label>
                        <Input
                           id="at-icon"
                           value={form.icon}
                           onChange={(e) => setForm({ ...form, icon: e.target.value })}
                           placeholder="lucide name"
                        />
                     </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                     <input
                        type="checkbox"
                        checked={form.interactive}
                        onChange={(e) => setForm({ ...form, interactive: e.target.checked })}
                        className="rounded"
                     />
                     Interactive (clickable/focusable)
                  </label>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={save} disabled={isPending || !form.family.trim()}>
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
