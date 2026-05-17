import { db } from './index';
import {
   projects,
   tasks,
   logs,
   specs,
   stackEntries,
   atoms,
   backendAtoms,
   checklist,
   rules,
   discoveryQuestions,
   discoveryAnswers,
   repoFiles,
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
} from './schema';
import type {
   Project,
   Task,
   Log,
   Spec,
   StackEntry,
   Atom,
   BackendAtom,
   Checklist,
   Rule,
   DiscoveryQuestion,
   DiscoveryAnswer,
   RepoFile,
   Page,
   Component,
   PageComponent,
   ComponentAtom,
   GlobalColor,
   GlobalFont,
   GlobalFontSize,
   GlobalSpacing,
   GlobalRadius,
   GlobalShadow,
} from './schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// TODO: replace with session.user.id once auth is wired
export const DEV_USER_ID = 'dev-user';

// ── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(userId: string): Promise<Project[]> {
   return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProject(projectId: string, userId: string): Promise<Project | null> {
   const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);
   return rows[0] ?? null;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasks(projectId: string, layerIndex?: number): Promise<Task[]> {
   if (layerIndex !== undefined) {
      return db
         .select()
         .from(tasks)
         .where(and(eq(tasks.projectId, projectId), eq(tasks.layerIndex, layerIndex)));
   }
   return db.select().from(tasks).where(eq(tasks.projectId, projectId));
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export async function getLogs(projectId: string, layerIndex?: number): Promise<Log[]> {
   if (layerIndex !== undefined) {
      return db
         .select()
         .from(logs)
         .where(and(eq(logs.projectId, projectId), eq(logs.layerIndex, layerIndex)))
         .orderBy(desc(logs.createdAt));
   }
   return db.select().from(logs).where(eq(logs.projectId, projectId)).orderBy(desc(logs.createdAt));
}

// ── Specs ─────────────────────────────────────────────────────────────────────

export async function getSpecs(projectId: string, category?: string): Promise<Spec[]> {
   if (category !== undefined) {
      return db
         .select()
         .from(specs)
         .where(and(eq(specs.projectId, projectId), eq(specs.category, category)));
   }
   return db.select().from(specs).where(eq(specs.projectId, projectId));
}

// ── Stack entries ─────────────────────────────────────────────────────────────

export async function getStackEntries(projectId: string): Promise<StackEntry[]> {
   return db.select().from(stackEntries).where(eq(stackEntries.projectId, projectId));
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

export async function getAtoms(projectId: string): Promise<Atom[]> {
   return db.select().from(atoms).where(eq(atoms.projectId, projectId));
}

// ── Backend atoms ─────────────────────────────────────────────────────────────

export async function getBackendAtoms(projectId: string): Promise<BackendAtom[]> {
   return db.select().from(backendAtoms).where(eq(backendAtoms.projectId, projectId));
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export async function getChecklist(projectId: string): Promise<Checklist[]> {
   return db.select().from(checklist).where(eq(checklist.projectId, projectId));
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export async function getRules(userId: string): Promise<Rule[]> {
   return db.select().from(rules).where(eq(rules.userId, userId)).orderBy(asc(rules.createdAt));
}

// ── Discovery Q&A ─────────────────────────────────────────────────────────────

export async function getDiscoveryQuestions(): Promise<DiscoveryQuestion[]> {
   return db.select().from(discoveryQuestions).orderBy(asc(discoveryQuestions.order));
}

export async function getDiscoveryAnswers(projectId: string): Promise<DiscoveryAnswer[]> {
   return db.select().from(discoveryAnswers).where(eq(discoveryAnswers.projectId, projectId));
}

// ── Repo files ────────────────────────────────────────────────────────────────

export async function getRepoFiles(projectId: string): Promise<RepoFile[]> {
   return db
      .select()
      .from(repoFiles)
      .where(eq(repoFiles.projectId, projectId))
      .orderBy(asc(repoFiles.order));
}

// ── Frontend: Pages, Components, Junctions ────────────────────────────────────

export async function getPages(projectId: string): Promise<Page[]> {
   return db.select().from(pages).where(eq(pages.projectId, projectId));
}

export async function getComponents(projectId: string): Promise<Component[]> {
   return db.select().from(components).where(eq(components.projectId, projectId));
}

export async function getPageComponentsForProject(projectId: string): Promise<PageComponent[]> {
   return db
      .select({
         id: pageComponents.id,
         pageId: pageComponents.pageId,
         componentId: pageComponents.componentId,
         order: pageComponents.order,
         sticky: pageComponents.sticky,
         fullWidth: pageComponents.fullWidth,
         bgColorId: pageComponents.bgColorId,
         paddingY: pageComponents.paddingY,
         sectionId: pageComponents.sectionId,
         mobileHidden: pageComponents.mobileHidden,
         animation: pageComponents.animation,
         placementProps: pageComponents.placementProps,
      })
      .from(pageComponents)
      .innerJoin(pages, eq(pageComponents.pageId, pages.id))
      .where(eq(pages.projectId, projectId))
      .orderBy(asc(pageComponents.order));
}

// ── Global design tokens ──────────────────────────────────────────────────────

export async function getGlobalColors(projectId: string): Promise<GlobalColor[]> {
   return db.select().from(globalColors).where(eq(globalColors.projectId, projectId));
}
export async function getGlobalFonts(projectId: string): Promise<GlobalFont[]> {
   return db.select().from(globalFonts).where(eq(globalFonts.projectId, projectId));
}
export async function getGlobalFontSizes(projectId: string): Promise<GlobalFontSize[]> {
   return db.select().from(globalFontSizes).where(eq(globalFontSizes.projectId, projectId));
}
export async function getGlobalSpacings(projectId: string): Promise<GlobalSpacing[]> {
   return db.select().from(globalSpacings).where(eq(globalSpacings.projectId, projectId));
}
export async function getGlobalRadii(projectId: string): Promise<GlobalRadius[]> {
   return db.select().from(globalRadii).where(eq(globalRadii.projectId, projectId));
}
export async function getGlobalShadows(projectId: string): Promise<GlobalShadow[]> {
   return db.select().from(globalShadows).where(eq(globalShadows.projectId, projectId));
}

export async function getComponentAtomsForProject(projectId: string): Promise<ComponentAtom[]> {
   return db
      .select({
         id: componentAtoms.id,
         componentId: componentAtoms.componentId,
         atomId: componentAtoms.atomId,
         order: componentAtoms.order,
         props: componentAtoms.props,
      })
      .from(componentAtoms)
      .innerJoin(components, eq(componentAtoms.componentId, components.id))
      .where(eq(components.projectId, projectId))
      .orderBy(asc(componentAtoms.order));
}
