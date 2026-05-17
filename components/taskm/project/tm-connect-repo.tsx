'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Github, Loader2, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { connectGithubRepo, disconnectGithubRepo } from '@/lib/actions/projects';
import type { Project } from '@/lib/db/schema';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RepoSummary {
   fullName: string;
   description: string | null;
   private: boolean;
}

interface ApiResponse {
   repos: RepoSummary[];
   error?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TmConnectRepoProps {
   project: Project;
}

export default function TmConnectRepo({ project }: TmConnectRepoProps) {
   const [open, setOpen] = useState(false);
   const [repos, setRepos] = useState<RepoSummary[]>([]);
   const [loading, setLoading] = useState(true);
   const [notConnected, setNotConnected] = useState(false);
   const [pending, setPending] = useState(false);
   const [currentRepo, setCurrentRepo] = useState<string | null>(project.githubRepo ?? null);

   // Fetch repos on mount
   useEffect(() => {
      let cancelled = false;

      async function fetchRepos() {
         setLoading(true);
         try {
            const res = await fetch('/api/github/repos');
            const data: ApiResponse = (await res.json()) as ApiResponse;

            if (cancelled) return;

            if (data.error === 'GitHub not connected') {
               setNotConnected(true);
            } else if (data.error) {
               toast.error(data.error);
            } else {
               setRepos(data.repos);
            }
         } catch {
            if (!cancelled) {
               toast.error('Failed to fetch repositories');
            }
         } finally {
            if (!cancelled) setLoading(false);
         }
      }

      void fetchRepos();
      return () => {
         cancelled = true;
      };
   }, []);

   const handleSelect = useCallback(
      async (repo: string) => {
         setOpen(false);
         if (repo === currentRepo) return;

         setPending(true);
         const result = await connectGithubRepo({ projectId: project.id, repo });
         setPending(false);

         if ('error' in result) {
            toast.error(result.error);
         } else {
            setCurrentRepo(repo);
            toast.success(`Connected to ${repo}`);
         }
      },
      [currentRepo, project.id]
   );

   const handleDisconnect = useCallback(async () => {
      setPending(true);
      const result = await disconnectGithubRepo(project.id);
      setPending(false);

      if ('error' in result) {
         toast.error(result.error);
      } else {
         setCurrentRepo(null);
         toast.success('Repository disconnected');
      }
   }, [project.id]);

   // ── Not-connected state ────────────────────────────────────────────────────

   if (notConnected) {
      return (
         <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Github className="size-4 shrink-0" />
            <span>Connect GitHub in Settings to link a repository.</span>
         </div>
      );
   }

   // ── Loading state ──────────────────────────────────────────────────────────

   if (loading) {
      return (
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading repositories…</span>
         </div>
      );
   }

   // ── Main UI ────────────────────────────────────────────────────────────────

   return (
      <div className="flex flex-col gap-3">
         {/* Currently connected repo */}
         {currentRepo && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
               <div className="flex items-center gap-2 text-sm">
                  <Github className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-mono">{currentRepo}</span>
               </div>
               <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={handleDisconnect}
                  disabled={pending}
               >
                  <Unlink className="size-3.5" />
                  Disconnect
               </Button>
            </div>
         )}

         {/* Repo selector */}
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                  disabled={pending}
               >
                  {currentRepo ? (
                     <span className="font-mono text-sm">{currentRepo}</span>
                  ) : (
                     <span className="text-muted-foreground">Select a repository…</span>
                  )}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
               <Command>
                  <CommandInput placeholder="Search repositories…" />
                  <CommandList>
                     <CommandEmpty>No repositories found.</CommandEmpty>
                     <CommandGroup>
                        {repos.map((repo) => (
                           <CommandItem
                              key={repo.fullName}
                              value={repo.fullName}
                              onSelect={handleSelect}
                           >
                              <Check
                                 className={cn(
                                    'mr-2 size-4',
                                    currentRepo === repo.fullName ? 'opacity-100' : 'opacity-0'
                                 )}
                              />
                              <div className="flex flex-col min-w-0">
                                 <span className="font-mono text-sm truncate">{repo.fullName}</span>
                                 {repo.description && (
                                    <span className="text-xs text-muted-foreground truncate">
                                       {repo.description}
                                    </span>
                                 )}
                              </div>
                              {repo.private && (
                                 <span className="ml-auto text-xs text-muted-foreground shrink-0">
                                    private
                                 </span>
                              )}
                           </CommandItem>
                        ))}
                     </CommandGroup>
                  </CommandList>
               </Command>
            </PopoverContent>
         </Popover>
      </div>
   );
}
