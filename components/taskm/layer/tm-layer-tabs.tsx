'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TmLayerTasks from './tm-layer-tasks';
import TmLayerAtoms from './tm-layer-atoms';
import TmLayerChecklist from './tm-layer-checklist';
import TmLayerLogs from './tm-layer-logs';
import TmLayerDiscovery from './tm-layer-discovery';
import TmFrontendPages from './tm-frontend-pages';
import TmFrontendComponents from './tm-frontend-components';
import TmFrontendAtoms from './tm-frontend-atoms';
import TmFrontendGlobals from './tm-frontend-globals';
import { LayerIndex } from '@/types/taskm';
import type {
   Task,
   Log,
   DiscoveryQuestion,
   DiscoveryAnswer,
   StackEntry,
   RepoFile,
   Atom,
   Page,
   Component,
   PageComponent,
   ComponentAtom,
   BackendAtom,
   Checklist,
   GlobalColor,
   GlobalFont,
   GlobalFontSize,
   GlobalSpacing,
   GlobalRadius,
   GlobalShadow,
} from '@/lib/db/schema';

interface Props {
   projectId: string;
   layerIndex: LayerIndex;
   tasks: Task[];
   logs: Log[];
   discoveryQuestions?: DiscoveryQuestion[];
   discoveryAnswers?: DiscoveryAnswer[];
   stackEntries?: StackEntry[];
   repoFiles?: RepoFile[];
   atoms?: Atom[];
   pages?: Page[];
   components?: Component[];
   pageComponents?: PageComponent[];
   componentAtoms?: ComponentAtom[];
   globalColors?: GlobalColor[];
   globalFonts?: GlobalFont[];
   globalFontSizes?: GlobalFontSize[];
   globalSpacings?: GlobalSpacing[];
   globalRadii?: GlobalRadius[];
   globalShadows?: GlobalShadow[];
   backendAtoms?: BackendAtom[];
   checklist?: Checklist[];
}

const trigger =
   'rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 h-full text-sm';

function SharedTaskLogTriggers() {
   return (
      <>
         <TabsTrigger value="agent-tasks" className={trigger}>
            Agent Tasks
         </TabsTrigger>
         <TabsTrigger value="your-tasks" className={trigger}>
            Your Tasks
         </TabsTrigger>
         <TabsTrigger value="logs" className={trigger}>
            Logs
         </TabsTrigger>
      </>
   );
}

function SharedTaskLogContent({
   tasks,
   logs,
   layerIndex,
}: {
   tasks: Task[];
   logs: Log[];
   layerIndex: LayerIndex;
}) {
   return (
      <>
         <TabsContent value="agent-tasks" className="mt-0">
            <TmLayerTasks tasks={tasks} layerIndex={layerIndex} audience="llm" />
         </TabsContent>
         <TabsContent value="your-tasks" className="mt-0">
            <TmLayerTasks tasks={tasks} layerIndex={layerIndex} audience="user" />
         </TabsContent>
         <TabsContent value="logs" className="mt-0">
            <TmLayerLogs logs={logs} layerIndex={layerIndex} />
         </TabsContent>
      </>
   );
}

function DiscoveryTabs({
   projectId,
   discoveryQuestions,
   discoveryAnswers,
}: {
   projectId: string;
   discoveryQuestions: DiscoveryQuestion[];
   discoveryAnswers: DiscoveryAnswer[];
}) {
   return (
      <Tabs defaultValue="questions" className="w-full flex flex-col gap-0">
         <TabsList className="sticky top-0 z-20 h-9 w-full justify-start rounded-none border-b bg-container px-2 gap-0">
            <TabsTrigger value="questions" className={trigger}>
               Questions
            </TabsTrigger>
         </TabsList>
         <TabsContent value="questions" className="mt-0">
            <TmLayerDiscovery
               projectId={projectId}
               questions={discoveryQuestions}
               answers={discoveryAnswers}
            />
         </TabsContent>
      </Tabs>
   );
}

function InfrastructureTabs({
   stackEntries,
   repoFiles,
   tasks,
   logs,
}: {
   stackEntries: StackEntry[];
   repoFiles: RepoFile[];
   tasks: Task[];
   logs: Log[];
}) {
   return (
      <Tabs defaultValue="stack" className="w-full flex flex-col gap-0">
         <TabsList className="sticky top-0 z-20 h-9 w-full justify-start rounded-none border-b bg-container px-2 gap-0">
            <TabsTrigger value="stack" className={trigger}>
               Stack
            </TabsTrigger>
            <TabsTrigger value="repo" className={trigger}>
               Repo
            </TabsTrigger>
            <SharedTaskLogTriggers />
         </TabsList>
         <TabsContent value="stack" className="mt-0">
            <TmLayerAtoms layerIndex={1} stackEntries={stackEntries} />
         </TabsContent>
         <TabsContent value="repo" className="mt-0">
            <TmLayerAtoms layerIndex={1} view="repo" repoFiles={repoFiles} />
         </TabsContent>
         <SharedTaskLogContent tasks={tasks} logs={logs} layerIndex={1} />
      </Tabs>
   );
}

function FrontendTabs({
   projectId,
   atoms,
   pages,
   components,
   globalColors,
   globalFonts,
   globalFontSizes,
   globalSpacings,
   globalRadii,
   globalShadows,
   tasks,
   logs,
}: {
   projectId: string;
   atoms: Atom[];
   pages: Page[];
   components: Component[];
   globalColors: GlobalColor[];
   globalFonts: GlobalFont[];
   globalFontSizes: GlobalFontSize[];
   globalSpacings: GlobalSpacing[];
   globalRadii: GlobalRadius[];
   globalShadows: GlobalShadow[];
   tasks: Task[];
   logs: Log[];
}) {
   return (
      <Tabs defaultValue="pages" className="w-full flex flex-col gap-0">
         <TabsList className="sticky top-0 z-20 h-9 w-full justify-start rounded-none border-b bg-container px-2 gap-0">
            <TabsTrigger value="pages" className={trigger}>
               Pages
            </TabsTrigger>
            <TabsTrigger value="components" className={trigger}>
               Components
            </TabsTrigger>
            <TabsTrigger value="atoms" className={trigger}>
               Atoms
            </TabsTrigger>
            <TabsTrigger value="globals" className={trigger}>
               Globals
            </TabsTrigger>
            <SharedTaskLogTriggers />
         </TabsList>
         <TabsContent value="pages" className="mt-0">
            <TmFrontendPages projectId={projectId} initialPages={pages} />
         </TabsContent>
         <TabsContent value="components" className="mt-0">
            <TmFrontendComponents projectId={projectId} initialComponents={components} />
         </TabsContent>
         <TabsContent value="atoms" className="mt-0">
            <TmFrontendAtoms projectId={projectId} initialAtoms={atoms} />
         </TabsContent>
         <TabsContent value="globals" className="mt-0">
            <TmFrontendGlobals
               projectId={projectId}
               initialColors={globalColors}
               initialFonts={globalFonts}
               initialFontSizes={globalFontSizes}
               initialSpacings={globalSpacings}
               initialRadii={globalRadii}
               initialShadows={globalShadows}
            />
         </TabsContent>
         <SharedTaskLogContent tasks={tasks} logs={logs} layerIndex={2} />
      </Tabs>
   );
}

function BackendTabs({
   backendAtoms,
   tasks,
   logs,
}: {
   backendAtoms: BackendAtom[];
   tasks: Task[];
   logs: Log[];
}) {
   return (
      <Tabs defaultValue="schema" className="w-full flex flex-col gap-0">
         <TabsList className="sticky top-0 z-20 h-9 w-full justify-start rounded-none border-b bg-container px-2 gap-0">
            <TabsTrigger value="schema" className={trigger}>
               Schema
            </TabsTrigger>
            <SharedTaskLogTriggers />
         </TabsList>
         <TabsContent value="schema" className="mt-0">
            <TmLayerAtoms layerIndex={3} backendAtoms={backendAtoms} />
         </TabsContent>
         <SharedTaskLogContent tasks={tasks} logs={logs} layerIndex={3} />
      </Tabs>
   );
}

function QATabs({
   projectId,
   checklist,
   tasks,
   logs,
}: {
   projectId: string;
   checklist: Checklist[];
   tasks: Task[];
   logs: Log[];
}) {
   return (
      <Tabs defaultValue="qa-list" className="w-full flex flex-col gap-0">
         <TabsList className="sticky top-0 z-20 h-9 w-full justify-start rounded-none border-b bg-container px-2 gap-0">
            <TabsTrigger value="qa-list" className={trigger}>
               QA List
            </TabsTrigger>
            <SharedTaskLogTriggers />
         </TabsList>
         <TabsContent value="qa-list" className="mt-0">
            <TmLayerChecklist projectId={projectId} layerIndex={4} initialChecklist={checklist} />
         </TabsContent>
         <SharedTaskLogContent tasks={tasks} logs={logs} layerIndex={4} />
      </Tabs>
   );
}

export default function TmLayerTabs({
   projectId,
   layerIndex,
   tasks,
   logs,
   discoveryQuestions = [],
   discoveryAnswers = [],
   stackEntries = [],
   repoFiles = [],
   atoms = [],
   pages = [],
   components = [],
   pageComponents = [],
   componentAtoms = [],
   globalColors = [],
   globalFonts = [],
   globalFontSizes = [],
   globalSpacings = [],
   globalRadii = [],
   globalShadows = [],
   backendAtoms = [],
   checklist = [],
}: Props) {
   switch (layerIndex) {
      case 0:
         return (
            <DiscoveryTabs
               projectId={projectId}
               discoveryQuestions={discoveryQuestions}
               discoveryAnswers={discoveryAnswers}
            />
         );
      case 1:
         return (
            <InfrastructureTabs
               stackEntries={stackEntries}
               repoFiles={repoFiles}
               tasks={tasks}
               logs={logs}
            />
         );
      case 2:
         return (
            <FrontendTabs
               projectId={projectId}
               atoms={atoms}
               pages={pages}
               components={components}
               globalColors={globalColors}
               globalFonts={globalFonts}
               globalFontSizes={globalFontSizes}
               globalSpacings={globalSpacings}
               globalRadii={globalRadii}
               globalShadows={globalShadows}
               tasks={tasks}
               logs={logs}
            />
         );
      case 3:
         return <BackendTabs backendAtoms={backendAtoms} tasks={tasks} logs={logs} />;
      case 4:
         return <QATabs projectId={projectId} checklist={checklist} tasks={tasks} logs={logs} />;
   }
}
