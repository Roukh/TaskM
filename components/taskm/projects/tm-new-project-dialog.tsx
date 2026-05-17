'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from '@/components/ui/dialog';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createProject } from '@/lib/actions/projects';
import type { ProjectType } from '@/types/taskm';

// ── Schema (mirrors server-side schema) ───────────────────────────────────────

const formSchema = z.object({
   id: z
      .string()
      .min(3, 'ID must be at least 3 characters')
      .max(50, 'ID must be at most 50 characters')
      .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
   name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
   type: z.enum(['next-app', 'python-api', 'ghobz-site', 'custom'] as const),
   goal: z.string().max(500, 'Goal must be at most 500 characters').optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(value: string): string {
   return value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
   'next-app': 'Next.js App',
   'python-api': 'Python API',
   'ghobz-site': 'GHOBZ Site',
   'custom': 'Custom',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface TmNewProjectDialogProps {
   trigger: React.ReactNode;
}

export default function TmNewProjectDialog({ trigger }: TmNewProjectDialogProps) {
   const [open, setOpen] = useState(false);
   const [slugEdited, setSlugEdited] = useState(false);
   const router = useRouter();

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         id: '',
         name: '',
         type: 'next-app',
         goal: '',
      },
   });

   const { isSubmitting } = form.formState;

   const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         const value = e.target.value;
         form.setValue('name', value);
         // Auto-generate slug only if the user hasn't manually edited it
         if (!slugEdited) {
            form.setValue('id', slugify(value), { shouldValidate: true });
         }
      },
      [form, slugEdited]
   );

   const handleSlugChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         setSlugEdited(true);
         form.setValue('id', e.target.value, { shouldValidate: true });
      },
      [form]
   );

   const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
         setOpen(nextOpen);
         if (!nextOpen) {
            form.reset();
            setSlugEdited(false);
         }
      },
      [form]
   );

   const onSubmit = useCallback(
      async (values: FormValues) => {
         const result = await createProject(values);
         if ('error' in result) {
            toast.error(result.error);
            return;
         }
         setOpen(false);
         form.reset();
         setSlugEdited(false);
         router.push(`/projects/${result.project.id}`);
      },
      [form, router]
   );

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         {/* Wrap the trigger so it controls dialog open state */}
         <span
            role="button"
            tabIndex={0}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
            className="contents"
         >
            {trigger}
         </span>

         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>New project</DialogTitle>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  {/* Name */}
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Project name</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder="GHOBZ Realtor Site"
                                 {...field}
                                 onChange={handleNameChange}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* ID / slug */}
                  <FormField
                     control={form.control}
                     name="id"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Project ID</FormLabel>
                           <FormControl>
                              <Input
                                 placeholder="ghobz-realtor-site"
                                 {...field}
                                 onChange={handleSlugChange}
                                 className="font-mono text-sm"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Type */}
                  <FormField
                     control={form.control}
                     name="type"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Project type</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((t) => (
                                    <SelectItem key={t} value={t}>
                                       {PROJECT_TYPE_LABELS[t]}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Goal */}
                  <FormField
                     control={form.control}
                     name="goal"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>
                              Goal{' '}
                              <span className="text-muted-foreground font-normal">(optional)</span>
                           </FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Describe what this project should achieve…"
                                 className="resize-none"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <DialogFooter className="pt-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create project'}
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
