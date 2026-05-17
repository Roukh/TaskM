'use client';

import { useState, useTransition } from 'react';
import type { Page } from '@/lib/db/schema';
import { createPage, updatePage, deletePage } from '@/lib/actions/frontend';
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
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Props {
   projectId: string;
   initialPages: Page[];
}

type PageForm = { path: string; name: string; description: string };
const EMPTY: PageForm = { path: '', name: '', description: '' };

export default function TmFrontendPages({ projectId, initialPages }: Props) {
   const [items, setItems] = useState<Page[]>(initialPages);
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<Page | null>(null);
   const [form, setForm] = useState<PageForm>(EMPTY);
   const [isPending, startTransition] = useTransition();

   function openAdd() {
      setEditing(null);
      setForm(EMPTY);
      setOpen(true);
   }
   function openEdit(p: Page) {
      setEditing(p);
      setForm({ path: p.path, name: p.name, description: p.description ?? '' });
      setOpen(true);
   }

   function save() {
      startTransition(async () => {
         if (editing) {
            const res = await updatePage(editing.id, form);
            if ('page' in res)
               setItems((prev) => prev.map((p) => (p.id === res.page.id ? res.page : p)));
         } else {
            const res = await createPage(projectId, form);
            if ('page' in res) setItems((prev) => [...prev, res.page]);
         }
         setOpen(false);
      });
   }

   function remove(id: string) {
      startTransition(async () => {
         await deletePage(id);
         setItems((prev) => prev.filter((p) => p.id !== id));
      });
   }

   const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path));

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10 flex items-center justify-between">
            <span>
               {items.length} page{items.length !== 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2" onClick={openAdd}>
               <Plus className="size-3" /> Add
            </Button>
         </div>

         {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-sm text-muted-foreground gap-1">
               <p>No pages yet.</p>
               <p className="text-xs">Add pages to map the app sitemap.</p>
            </div>
         )}

         {sorted.map((p) => (
            <div
               key={p.id}
               className="flex items-start gap-4 px-6 py-3 border-b border-muted-foreground/5 hover:bg-sidebar/20 group"
            >
               <span className="font-mono text-xs text-muted-foreground w-56 shrink-0 pt-0.5 truncate">
                  {p.path}
               </span>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && (
                     <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {p.description}
                     </p>
                  )}
               </div>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button
                     variant="ghost"
                     size="icon"
                     className="size-7"
                     onClick={() => openEdit(p)}
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
                           <AlertDialogTitle>Delete page?</AlertDialogTitle>
                           <AlertDialogDescription>
                              This removes <strong>{p.name}</strong> and all its component
                              assignments.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => remove(p.id)}>
                              Delete
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               </div>
            </div>
         ))}

         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle>{editing ? 'Edit page' : 'Add page'}</DialogTitle>
               </DialogHeader>
               <div className="flex flex-col gap-4 py-2">
                  <div className="grid gap-1.5">
                     <Label htmlFor="pg-path">Path</Label>
                     <Input
                        id="pg-path"
                        value={form.path}
                        onChange={(e) => setForm({ ...form, path: e.target.value })}
                        placeholder="/about"
                        className="font-mono"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="pg-name">Name</Label>
                     <Input
                        id="pg-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="About"
                     />
                  </div>
                  <div className="grid gap-1.5">
                     <Label htmlFor="pg-desc">Description</Label>
                     <Textarea
                        id="pg-desc"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="What this page does…"
                        className="resize-none min-h-[72px]"
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                     Cancel
                  </Button>
                  <Button
                     onClick={save}
                     disabled={isPending || !form.path.trim() || !form.name.trim()}
                  >
                     {editing ? 'Save' : 'Add'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
