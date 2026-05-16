import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TmProjectsHeader() {
   return (
      <div className="w-full flex flex-col items-center">
         <div className="w-full flex items-center gap-2 px-4 py-2.5 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">Projects</span>
            <div className="ml-auto">
               <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="size-3.5" />
                  New project
               </Button>
            </div>
         </div>
      </div>
   );
}
