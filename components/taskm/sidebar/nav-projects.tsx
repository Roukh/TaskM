'use client';

import { tmProjects } from '@/mock-data/tm-projects';
import { tmLayers } from '@/mock-data/tm-layers';
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
import { Box, ChevronRight, Layers, ScrollText } from 'lucide-react';

export function NavProjects() {
   const pathname = usePathname();

   return (
      <SidebarGroup>
         <SidebarGroupLabel>Projects</SidebarGroupLabel>
         <SidebarMenu>
            {tmProjects.map((project) => {
               const layers = tmLayers
                  .filter((l) => l.projectId === project.id)
                  .sort((a, b) => a.index - b.index);
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
                              {layers.map((layer) => (
                                 <SidebarMenuSubItem key={layer.id}>
                                    <SidebarMenuSubButton
                                       asChild
                                       isActive={
                                          pathname === `/projects/${project.id}/layers/${layer.id}`
                                       }
                                    >
                                       <Link href={`/projects/${project.id}/layers/${layer.id}`}>
                                          <Layers className="size-3.5" />
                                          <span>
                                             {layer.index}: {layer.name}
                                          </span>
                                       </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                              ))}
                              <SidebarMenuSubItem>
                                 <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === `/projects/${project.id}/logs`}
                                 >
                                    <Link href={`/projects/${project.id}/logs`}>
                                       <ScrollText className="size-3.5" />
                                       <span>Logs</span>
                                    </Link>
                                 </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
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
