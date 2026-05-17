export const dynamic = 'force-dynamic';

import MainLayout from '@/components/layout/main-layout';
import TmRulesHeader from '@/components/taskm/dashboard/tm-rules-header';
import TmRulesPage from '@/components/taskm/dashboard/tm-rules-page';
import { getRules, DEV_USER_ID } from '@/lib/db/queries';

export default async function RulesPage() {
   const rules = await getRules(DEV_USER_ID);

   return (
      <MainLayout header={<TmRulesHeader />}>
         <TmRulesPage initialRules={rules} />
      </MainLayout>
   );
}
