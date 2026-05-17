import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function TmRulesHeader() {
   return (
      <header className="flex h-10 items-center gap-2 px-3 border-b">
         <SidebarTrigger className="-ml-1" />
         <Separator orientation="vertical" className="h-4" />
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>Dashboard</BreadcrumbItem>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                  <BreadcrumbPage>Rules</BreadcrumbPage>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>
      </header>
   );
}
