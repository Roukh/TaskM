'use client';

import * as React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { NavProjects } from '@/components/taskm/sidebar/nav-projects';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function TaskMBranding() {
   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
               <Link href="/projects">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                     <Layers className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                     <span className="truncate font-semibold">TaskM</span>
                     <span className="truncate text-xs text-muted-foreground">Build substrate</span>
                  </div>
               </Link>
            </SidebarMenuButton>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader>
            <TaskMBranding />
         </SidebarHeader>
         <SidebarContent>
            <NavProjects />
         </SidebarContent>
         <SidebarFooter>
            <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground">
               <Plus className="size-3.5" />
               New project
            </Button>
         </SidebarFooter>
      </Sidebar>
   );
}
