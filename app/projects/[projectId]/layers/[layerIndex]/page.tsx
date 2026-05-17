import MainLayout from '@/components/layout/main-layout';
import TmLayerHeader from '@/components/taskm/layer/tm-layer-header';
import TmLayerTabs from '@/components/taskm/layer/tm-layer-tabs';
import { LayerIndex } from '@/types/taskm';
import {
   getProject,
   getTasks,
   getLogs,
   getDiscoveryQuestions,
   getDiscoveryAnswers,
   getStackEntries,
   getRepoFiles,
   getAtoms,
   getPages,
   getComponents,
   getPageComponentsForProject,
   getComponentAtomsForProject,
   getGlobalColors,
   getGlobalFonts,
   getGlobalFontSizes,
   getGlobalSpacings,
   getGlobalRadii,
   getGlobalShadows,
   getBackendAtoms,
   getChecklist,
   DEV_USER_ID,
} from '@/lib/db/queries';
import { notFound } from 'next/navigation';

interface Props {
   params: Promise<{ projectId: string; layerIndex: string }>;
}

export default async function LayerPage({ params }: Props) {
   const { projectId, layerIndex } = await params;
   const layerIdx = parseInt(layerIndex, 10) as LayerIndex;

   const project = await getProject(projectId, DEV_USER_ID);
   if (!project) notFound();

   const [layerTasks, layerLogs] = await Promise.all([
      getTasks(projectId, layerIdx),
      getLogs(projectId, layerIdx),
   ]);

   // Layer-specific data — fetch only what the layer needs
   const [
      discoveryQuestions,
      discoveryAnswers,
      stackEntries,
      repoFiles,
      atoms,
      pages,
      components,
      pageComponents,
      componentAtoms,
      globalColors,
      globalFonts,
      globalFontSizes,
      globalSpacings,
      globalRadii,
      globalShadows,
      backendAtoms,
      checklistItems,
   ] = await Promise.all([
      layerIdx === 0 ? getDiscoveryQuestions() : Promise.resolve([]),
      layerIdx === 0 ? getDiscoveryAnswers(projectId) : Promise.resolve([]),
      layerIdx === 1 ? getStackEntries(projectId) : Promise.resolve([]),
      layerIdx === 1 ? getRepoFiles(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getAtoms(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getPages(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getComponents(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getPageComponentsForProject(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getComponentAtomsForProject(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalColors(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalFonts(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalFontSizes(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalSpacings(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalRadii(projectId) : Promise.resolve([]),
      layerIdx === 2 ? getGlobalShadows(projectId) : Promise.resolve([]),
      layerIdx === 3 ? getBackendAtoms(projectId) : Promise.resolve([]),
      layerIdx === 4 ? getChecklist(projectId) : Promise.resolve([]),
   ]);

   return (
      <MainLayout
         header={
            <TmLayerHeader projectId={projectId} layerIndex={layerIdx} projectName={project.name} />
         }
      >
         <TmLayerTabs
            projectId={projectId}
            layerIndex={layerIdx}
            tasks={layerTasks}
            logs={layerLogs}
            discoveryQuestions={discoveryQuestions}
            discoveryAnswers={discoveryAnswers}
            stackEntries={stackEntries}
            repoFiles={repoFiles}
            atoms={atoms}
            pages={pages}
            components={components}
            pageComponents={pageComponents}
            componentAtoms={componentAtoms}
            globalColors={globalColors}
            globalFonts={globalFonts}
            globalFontSizes={globalFontSizes}
            globalSpacings={globalSpacings}
            globalRadii={globalRadii}
            globalShadows={globalShadows}
            backendAtoms={backendAtoms}
            checklist={checklistItems}
         />
      </MainLayout>
   );
}
