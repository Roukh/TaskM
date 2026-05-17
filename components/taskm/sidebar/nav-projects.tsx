'use client';

import { Project } from '@/lib/db/schema';
import { TASKM_LAYERS } from '@/types/taskm';
import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubButton,
   SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, ChevronRight, Layers } from 'lucide-react';

interface Props {
   projects: Project[];
}

export function NavProjects({ projects }: Props) {
   const pathname = usePathname();

   if (projects.length === 0) {
      return (
         <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <p className="px-2 py-1 text-xs text-muted-foreground">No projects yet.</p>
         </SidebarGroup>
      );
   }

   return (
      <SidebarGroup>
         <SidebarGroupLabel>Projects</SidebarGroupLabel>
         <SidebarMenu>
            {projects.map((project) => {
               const isProjectActive = pathname.startsWith(`/projects/${project.id}`);

               return (
                  <Collapsible
                     key={project.id}
                     asChild
                     defaultOpen={isProjectActive}
                     className="group/collapsible"
                  >
                     <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           <SidebarMenuButton
                              asChild
                              isActive={pathname === `/projects/${project.id}`}
                              tooltip={project.name}
                           >
                              <Link href={`/projects/${project.id}`}>
                                 <Box className="size-4" />
                                 <span className="truncate">{project.name}</span>
                                 <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </Link>
                           </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                           <SidebarMenuSub>
                              {TASKM_LAYERS.map((layer) => (
                                 <SidebarMenuSubItem key={layer.index}>
                                    <SidebarMenuSubButton
                                       asChild
                                       isActive={pathname.startsWith(
                                          `/projects/${project.id}/layers/${layer.index}`
                                       )}
                                    >
                                       <Link href={`/projects/${project.id}/layers/${layer.index}`}>
                                          <Layers className="size-3.5" />
                                          <span>
                                             {layer.index}: {layer.name}
                                          </span>
                                       </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                              ))}
                           </SidebarMenuSub>
                        </CollapsibleContent>
                     </SidebarMenuItem>
                  </Collapsible>
               );
            })}
         </SidebarMenu>
      </SidebarGroup>
   );
}
