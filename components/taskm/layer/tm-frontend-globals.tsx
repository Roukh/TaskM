'use client';

import { useState, useTransition } from 'react';
import type {
   GlobalColor,
   GlobalFont,
   GlobalFontSize,
   GlobalSpacing,
   GlobalRadius,
   GlobalShadow,
} from '@/lib/db/schema';
import {
   createGlobalColor,
   updateGlobalColor,
   deleteGlobalColor,
   createGlobalFont,
   updateGlobalFont,
   deleteGlobalFont,
   createGlobalFontSize,
   updateGlobalFontSize,
   deleteGlobalFontSize,
   createGlobalSpacing,
   updateGlobalSpacing,
   deleteGlobalSpacing,
   createGlobalRadius,
   updateGlobalRadius,
   deleteGlobalRadius,
   createGlobalShadow,
   updateGlobalShadow,
   deleteGlobalShadow,
} from '@/lib/actions/frontend';
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
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
   projectId: string;
   initialColors: GlobalColor[];
   initialFonts: GlobalFont[];
   initialFontSizes: GlobalFontSize[];
   initialSpacings: GlobalSpacing[];
   initialRadii: GlobalRadius[];
   initialShadows: GlobalShadow[];
}

// ── Generic name+value section ─────────────────────────────────────────────────

type NameValue = { id: string; name: string; value: string };
type NVForm = { name: string; value: string };

function NVSection({
   title,
   items,
   onCreate,
   onUpdate,
   onDelete,
   valuePlaceholder = 'value',
   valueClass,
   prefix,
}: {
   title: string;
   items: NameValue[];
   onCreate: (form: NVForm) => void;
   onUpdate: (id: string, form: NVForm) => void;
   onDelete: (id: string) => void;
   valuePlaceholder?: string;
   valueClass?: string;
   prefix?: React.ReactNode;
}) {
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<NameValue | null>(null);
   const [form, setForm] = useState<NVForm>({ name: '', value: '' });

   function openAdd() {
      setEditing(null);
      setForm({ name: '', value: '' });
      setOpen(true);
   }
   function openEdit(item: NameValue) {
      setEditing(item);
      setForm({ name: item.name, value: item.value });
      setOpen(true);
   }

   function save() {
      if (editing) {
         onUpdate(editing.id, form);
      } else {
         onCreate(form);
      }
      setOpen(false);
   }

   return (
      <div className="w-full">
         <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>
               {title} <span className="font-normal normal-case ml-1">({items.length})</span>
            </span>
            <Button
               variant="ghost"
               size="sm"
               className="h-5 gap-1 text-xs px-1.5"
               onClick={openAdd}
            >
               <Plus className="size-3" />
            </Button>
         </div>

         {items.length === 0 && (
            <div className="px-6 py-3 text-xs text-muted-foreground italic">None yet.</div>
         )}

         {items.map((item) => (
            <div
               key={item.id}
               className="flex items-center gap-3 px-6 py-2 border-b border-muted-foreground/5 hover:bg-sidebar/20 group text-sm"
            >
               {prefix && prefix}
               <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
                  {item.name}
               </span>
               <span className={`flex-1 text-xs font-mono truncate ${valueClass ?? ''}`}>
                  {item.value}
               </span>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-6"
                     onClick={() => openEdit(item)}
                  >
                     <Pencil className="size-3" />
                  </Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="size-6 text-destructive hover:text-destructive"
                        >
                           <Trash2 className="size-3" />
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>
                              Delete {title.toLowerCase().replace(/s$/, '')}?
                           </AlertDialogTitle>
                           <AlertDialogDescription>
                              Remove <strong>{item.name}</strong>.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => onDelete(item.id)}>
                              Delete
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               </div>
            </div>
         ))}

         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm">
               <DialogHeader>
                  <DialogTitle>
                     {editing
                        ? `Edit ${title.toLowerCase().replace(/s$/, '')}`
                        : `Add ${title.toLowerCase().replace(/s$/, '')}`}
                  </DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label>Name</Label>
                     <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="name"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label>Value</Label>
                     <Input
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        placeholder={valuePlaceholder}
                        className="font-mono"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={save} disabled={!form.name.trim() || !form.value.trim()}>
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}

// ── Colors section (name + value + role) ──────────────────────────────────────

function ColorsSection({
   items: initial,
   projectId,
   isPending,
   startTransition,
}: {
   items: GlobalColor[];
   projectId: string;
   isPending: boolean;
   startTransition: (fn: () => Promise<void>) => void;
}) {
   const [items, setItems] = useState<GlobalColor[]>(initial);
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<GlobalColor | null>(null);
   const [form, setForm] = useState({ name: '', value: '', role: '' });

   function openAdd() {
      setEditing(null);
      setForm({ name: '', value: '', role: '' });
      setOpen(true);
   }
   function openEdit(c: GlobalColor) {
      setEditing(c);
      setForm({ name: c.name, value: c.value, role: c.role ?? '' });
      setOpen(true);
   }
   function remove(id: string) {
      startTransition(async () => {
         await deleteGlobalColor(id);
         setItems((prev) => prev.filter((c) => c.id !== id));
      });
   }
   function save() {
      const payload = { name: form.name, value: form.value, role: form.role || null };
      startTransition(async () => {
         if (editing) {
            const res = await updateGlobalColor(editing.id, payload);
            if ('color' in res) {
               setItems((prev) => prev.map((c) => (c.id === res.color.id ? res.color : c)));
            }
         } else {
            const res = await createGlobalColor(projectId, payload);
            if ('color' in res) {
               setItems((prev) => [...prev, res.color]);
            }
         }
         setOpen(false);
      });
   }

   return (
      <div className="w-full">
         <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>
               Colors <span className="font-normal normal-case ml-1">({items.length})</span>
            </span>
            <Button
               variant="ghost"
               size="sm"
               className="h-5 gap-1 text-xs px-1.5"
               onClick={openAdd}
            >
               <Plus className="size-3" />
            </Button>
         </div>
         {items.length === 0 && (
            <div className="px-6 py-3 text-xs text-muted-foreground italic">None yet.</div>
         )}
         {items.map((c) => (
            <div
               key={c.id}
               className="flex items-center gap-3 px-6 py-2 border-b border-muted-foreground/5 hover:bg-sidebar/20 group text-sm"
            >
               <div
                  className="size-4 rounded shrink-0 border border-muted-foreground/20"
                  style={{ background: c.value }}
               />
               <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
                  {c.name}
               </span>
               <span className="flex-1 text-xs font-mono truncate">{c.value}</span>
               {c.role && <span className="text-xs text-muted-foreground shrink-0">{c.role}</span>}
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-6"
                     onClick={() => openEdit(c)}
                  >
                     <Pencil className="size-3" />
                  </Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="size-6 text-destructive hover:text-destructive"
                        >
                           <Trash2 className="size-3" />
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>Delete color?</AlertDialogTitle>
                           <AlertDialogDescription>
                              Remove <strong>{c.name}</strong>.
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
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm">
               <DialogHeader>
                  <DialogTitle>{editing ? 'Edit color' : 'Add color'}</DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label>Name</Label>
                     <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="primary"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label>Value</Label>
                     <Input
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        placeholder="hsl(0 0% 98%)"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label>Role</Label>
                     <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="primary, background…"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     onClick={save}
                     disabled={isPending || !form.name.trim() || !form.value.trim()}
                  >
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}

// ── Fonts section (name + family + role) ──────────────────────────────────────

function FontsSection({
   items: initial,
   projectId,
   isPending,
   startTransition,
}: {
   items: GlobalFont[];
   projectId: string;
   isPending: boolean;
   startTransition: (fn: () => Promise<void>) => void;
}) {
   const [items, setItems] = useState<GlobalFont[]>(initial);
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<GlobalFont | null>(null);
   const [form, setForm] = useState({ name: '', family: '', role: '' });

   function openAdd() {
      setEditing(null);
      setForm({ name: '', family: '', role: '' });
      setOpen(true);
   }
   function openEdit(f: GlobalFont) {
      setEditing(f);
      setForm({ name: f.name, family: f.family, role: f.role ?? '' });
      setOpen(true);
   }
   function remove(id: string) {
      startTransition(async () => {
         await deleteGlobalFont(id);
         setItems((prev) => prev.filter((f) => f.id !== id));
      });
   }
   function save() {
      const payload = { name: form.name, family: form.family, role: form.role || null };
      startTransition(async () => {
         if (editing) {
            const res = await updateGlobalFont(editing.id, payload);
            if ('font' in res) {
               setItems((prev) => prev.map((f) => (f.id === res.font.id ? res.font : f)));
            }
         } else {
            const res = await createGlobalFont(projectId, payload);
            if ('font' in res) {
               setItems((prev) => [...prev, res.font]);
            }
         }
         setOpen(false);
      });
   }

   return (
      <div className="w-full">
         <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>
               Fonts <span className="font-normal normal-case ml-1">({items.length})</span>
            </span>
            <Button
               variant="ghost"
               size="sm"
               className="h-5 gap-1 text-xs px-1.5"
               onClick={openAdd}
            >
               <Plus className="size-3" />
            </Button>
         </div>
         {items.length === 0 && (
            <div className="px-6 py-3 text-xs text-muted-foreground italic">None yet.</div>
         )}
         {items.map((f) => (
            <div
               key={f.id}
               className="flex items-center gap-3 px-6 py-2 border-b border-muted-foreground/5 hover:bg-sidebar/20 group text-sm"
            >
               <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
                  {f.name}
               </span>
               <span className="flex-1 text-xs truncate" style={{ fontFamily: f.family }}>
                  {f.family}
               </span>
               {f.role && <span className="text-xs text-muted-foreground shrink-0">{f.role}</span>}
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-6"
                     onClick={() => openEdit(f)}
                  >
                     <Pencil className="size-3" />
                  </Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="size-6 text-destructive hover:text-destructive"
                        >
                           <Trash2 className="size-3" />
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>Delete font?</AlertDialogTitle>
                           <AlertDialogDescription>
                              Remove <strong>{f.name}</strong>.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => remove(f.id)}>
                              Delete
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               </div>
            </div>
         ))}
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm">
               <DialogHeader>
                  <DialogTitle>{editing ? 'Edit font' : 'Add font'}</DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label>Name</Label>
                     <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="geist-sans"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label>Family (CSS)</Label>
                     <Input
                        value={form.family}
                        onChange={(e) => setForm({ ...form, family: e.target.value })}
                        placeholder="var(--font-geist-sans)"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label>Role</Label>
                     <Input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="body, mono, heading…"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     onClick={save}
                     disabled={isPending || !form.name.trim() || !form.family.trim()}
                  >
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TmFrontendGlobals({
   projectId,
   initialColors,
   initialFonts,
   initialFontSizes,
   initialSpacings,
   initialRadii,
   initialShadows,
}: Props) {
   const [isPending, startTransition] = useTransition();

   // NV sections state
   const [fontSizes, setFontSizes] = useState<GlobalFontSize[]>(initialFontSizes);
   const [spacings, setSpacings] = useState<GlobalSpacing[]>(initialSpacings);
   const [radii, setRadii] = useState<GlobalRadius[]>(initialRadii);
   const [shadows, setShadows] = useState<GlobalShadow[]>(initialShadows);

   const totalTokens =
      initialColors.length +
      initialFonts.length +
      fontSizes.length +
      spacings.length +
      radii.length +
      shadows.length;

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10">
            {totalTokens} token{totalTokens !== 1 ? 's' : ''}
         </div>

         <ColorsSection
            items={initialColors}
            projectId={projectId}
            isPending={isPending}
            startTransition={startTransition}
         />
         <FontsSection
            items={initialFonts}
            projectId={projectId}
            isPending={isPending}
            startTransition={startTransition}
         />

         <NVSection
            title="Font Sizes"
            items={fontSizes}
            valuePlaceholder="1rem"
            onCreate={(f) =>
               startTransition(async () => {
                  const res = await createGlobalFontSize(projectId, f);
                  if ('item' in res) setFontSizes((p) => [...p, res.item]);
               })
            }
            onUpdate={(id, f) =>
               startTransition(async () => {
                  const res = await updateGlobalFontSize(id, f);
                  if ('item' in res)
                     setFontSizes((p) => p.map((s) => (s.id === res.item.id ? res.item : s)));
               })
            }
            onDelete={(id) =>
               startTransition(async () => {
                  await deleteGlobalFontSize(id);
                  setFontSizes((p) => p.filter((s) => s.id !== id));
               })
            }
         />
         <NVSection
            title="Spacings"
            items={spacings}
            valuePlaceholder="0.25rem"
            onCreate={(f) =>
               startTransition(async () => {
                  const res = await createGlobalSpacing(projectId, f);
                  if ('item' in res) setSpacings((p) => [...p, res.item]);
               })
            }
            onUpdate={(id, f) =>
               startTransition(async () => {
                  const res = await updateGlobalSpacing(id, f);
                  if ('item' in res)
                     setSpacings((p) => p.map((s) => (s.id === res.item.id ? res.item : s)));
               })
            }
            onDelete={(id) =>
               startTransition(async () => {
                  await deleteGlobalSpacing(id);
                  setSpacings((p) => p.filter((s) => s.id !== id));
               })
            }
         />
         <NVSection
            title="Radii"
            items={radii}
            valuePlaceholder="0.375rem"
            onCreate={(f) =>
               startTransition(async () => {
                  const res = await createGlobalRadius(projectId, f);
                  if ('item' in res) setRadii((p) => [...p, res.item]);
               })
            }
            onUpdate={(id, f) =>
               startTransition(async () => {
                  const res = await updateGlobalRadius(id, f);
                  if ('item' in res)
                     setRadii((p) => p.map((r) => (r.id === res.item.id ? res.item : r)));
               })
            }
            onDelete={(id) =>
               startTransition(async () => {
                  await deleteGlobalRadius(id);
                  setRadii((p) => p.filter((r) => r.id !== id));
               })
            }
         />
         <NVSection
            title="Shadows"
            items={shadows}
            valuePlaceholder="0 1px 3px hsl(0 0% 0% / 0.5)"
            onCreate={(f) =>
               startTransition(async () => {
                  const res = await createGlobalShadow(projectId, f);
                  if ('item' in res) setShadows((p) => [...p, res.item]);
               })
            }
            onUpdate={(id, f) =>
               startTransition(async () => {
                  const res = await updateGlobalShadow(id, f);
                  if ('item' in res)
                     setShadows((p) => p.map((s) => (s.id === res.item.id ? res.item : s)));
               })
            }
            onDelete={(id) =>
               startTransition(async () => {
                  await deleteGlobalShadow(id);
                  setShadows((p) => p.filter((s) => s.id !== id));
               })
            }
         />
      </div>
   );
}
