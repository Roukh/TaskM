/**
 * scripts/seed-taskm-data.ts
 *
 * Populates sitemap (Layer 2) and schema (Layer 3) data for the taskm-core project.
 * Clears existing data for these tables before re-inserting — safe to re-run.
 *
 * Run with: pnpm db:seed-data
 */

import { db } from '../lib/db/index';
import {
   pages,
   components,
   pageComponents,
   backendAtoms,
   atoms,
   globalColors,
   globalFonts,
   globalFontSizes,
   globalSpacings,
   globalRadii,
   globalShadows,
} from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const PROJECT_ID = 'taskm-core';

// ── Clear existing data ───────────────────────────────────────────────────────

async function clearExisting() {
   await db.delete(pages).where(eq(pages.projectId, PROJECT_ID));
   await db.delete(components).where(eq(components.projectId, PROJECT_ID));
   await db.delete(backendAtoms).where(eq(backendAtoms.projectId, PROJECT_ID));
   await db.delete(atoms).where(eq(atoms.projectId, PROJECT_ID));
   await db.delete(globalColors).where(eq(globalColors.projectId, PROJECT_ID));
   await db.delete(globalFonts).where(eq(globalFonts.projectId, PROJECT_ID));
   await db.delete(globalFontSizes).where(eq(globalFontSizes.projectId, PROJECT_ID));
   await db.delete(globalSpacings).where(eq(globalSpacings.projectId, PROJECT_ID));
   await db.delete(globalRadii).where(eq(globalRadii.projectId, PROJECT_ID));
   await db.delete(globalShadows).where(eq(globalShadows.projectId, PROJECT_ID));
}

// ── Pages ─────────────────────────────────────────────────────────────────────

async function seedPages(): Promise<Record<string, string>> {
   const rows = await db
      .insert(pages)
      .values([
         {
            projectId: PROJECT_ID,
            path: '/login',
            name: 'Login',
            description: 'Email + GitHub OAuth login. Redirects to /projects on success.',
         },
         {
            projectId: PROJECT_ID,
            path: '/signup',
            name: 'Signup',
            description: 'New account creation via email or GitHub OAuth.',
         },
         {
            projectId: PROJECT_ID,
            path: '/projects',
            name: 'Project list',
            description: 'Table of all projects: name, goal, type, state badge, current layer.',
         },
         {
            projectId: PROJECT_ID,
            path: '/projects/[projectId]',
            name: 'Project overview',
            description:
               'Layer grid — 5 layer cards showing name, description, state, and progress.',
         },
         {
            projectId: PROJECT_ID,
            path: '/projects/[projectId]/layers/[layerIndex]',
            name: 'Layer detail',
            description: 'Layer-specific tabbed view. Tabs vary by layer index (0–4).',
         },
         {
            projectId: PROJECT_ID,
            path: '/projects/[projectId]/settings',
            name: 'Project settings',
            description: 'Project config: name, type, goal, GitHub repo, Claude API key.',
         },
         {
            projectId: PROJECT_ID,
            path: '/dashboard/rules',
            name: 'Rules',
            description:
               'Global user-scoped rules — CRUD table, assignable to specific layers or all.',
         },
      ])
      .returning({ id: pages.id, path: pages.path });

   return Object.fromEntries(rows.map((r) => [r.path, r.id]));
}

// ── Components ────────────────────────────────────────────────────────────────

async function seedComponents(): Promise<Record<string, string>> {
   const rows = await db
      .insert(components)
      .values([
         // Shell / layout
         {
            projectId: PROJECT_ID,
            name: 'main-layout',
            family: 'shell',
            description:
               'Root shell: SidebarProvider + AppSidebar + content area. Wraps every page.',
         },
         {
            projectId: PROJECT_ID,
            name: 'app-sidebar',
            family: 'shell',
            description:
               'Collapsible sidebar: TaskM branding, NavProjects tree, New project footer button.',
         },
         {
            projectId: PROJECT_ID,
            name: 'nav-projects',
            family: 'shell',
            description:
               'Collapsible project tree. One entry per project, sub-items for each layer. Auto-expands active project.',
         },

         // Projects list page
         {
            projectId: PROJECT_ID,
            name: 'tm-projects-header',
            family: 'projects-list',
            description: 'Breadcrumb header: "Projects". Includes New project button.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-projects-list',
            family: 'projects-list',
            description:
               'Project table. Columns: Project (name+goal), Type, State badge, Current layer. Rows are clickable.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-new-project-dialog',
            family: 'projects-list',
            description: 'Dialog for creating a new project. Fields: name, type, goal.',
         },

         // Project overview page
         {
            projectId: PROJECT_ID,
            name: 'tm-project-header',
            family: 'project-overview',
            description: 'Breadcrumb header: "Projects / Project Name".',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-grid',
            family: 'project-overview',
            description:
               'Responsive grid of 5 layer cards. State-colored borders. Progress bar for non-idle layers.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-connect-repo',
            family: 'project-overview',
            description: 'GitHub repo connection UI. Lets user link a GitHub repo to the project.',
         },

         // Layer detail page
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-header',
            family: 'layer-detail',
            description: 'Breadcrumb header: "Projects / Name / Layer N: Name".',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-tabs',
            family: 'layer-detail',
            description: 'Layer-specific tab container. Tab sets differ per layer index (0–4).',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-discovery',
            family: 'layer-detail',
            description:
               'Discovery Q&A view. Inline-editable answers. Header shows X/N answered count. Layer 0 only.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-atoms',
            family: 'layer-detail',
            description:
               'Multi-purpose view: Stack (L1), Repo file tree (L1), Sitemap (L2), Backend schema (L3).',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-tasks',
            family: 'layer-detail',
            description:
               'Task list filtered by audience (llm or user). Status and priority icons. Layers 1–4.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-checklist',
            family: 'layer-detail',
            description: 'QA checklist with pass/fail toggle. Shows X/N complete. Layer 4 only.',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-layer-logs',
            family: 'layer-detail',
            description:
               'Append-only event stream scoped to layer. Type icons: start, complete, tool, file, message, error.',
         },

         // Dashboard
         {
            projectId: PROJECT_ID,
            name: 'tm-rules-header',
            family: 'dashboard',
            description: 'Breadcrumb header: "Dashboard / Rules".',
         },
         {
            projectId: PROJECT_ID,
            name: 'tm-rules-page',
            family: 'dashboard',
            description:
               'Rules CRUD table. Columns: Name, Content (truncated), Layer assignment, Actions. Add/Edit dialog + delete confirm.',
         },

         // Settings
         {
            projectId: PROJECT_ID,
            name: 'tm-claude-api-key',
            family: 'settings',
            description:
               'Claude API key form. Save (POST /api/user/claude-key) and remove (DELETE) actions.',
         },
      ])
      .returning({ id: components.id, name: components.name });

   return Object.fromEntries(rows.map((r) => [r.name, r.id]));
}

// ── Page-Component junctions ──────────────────────────────────────────────────

async function seedPageComponents(
   pageIds: Record<string, string>,
   componentIds: Record<string, string>
) {
   // Shared shell components on every authenticated page
   const shell = ['main-layout', 'app-sidebar', 'nav-projects'];

   const assignments: Array<{ pageKey: string; comps: string[] }> = [
      {
         pageKey: '/projects',
         comps: [...shell, 'tm-projects-header', 'tm-projects-list', 'tm-new-project-dialog'],
      },
      {
         pageKey: '/projects/[projectId]',
         comps: [...shell, 'tm-project-header', 'tm-layer-grid', 'tm-connect-repo'],
      },
      {
         pageKey: '/projects/[projectId]/layers/[layerIndex]',
         comps: [
            ...shell,
            'tm-layer-header',
            'tm-layer-tabs',
            'tm-layer-discovery',
            'tm-layer-atoms',
            'tm-layer-tasks',
            'tm-layer-checklist',
            'tm-layer-logs',
         ],
      },
      {
         pageKey: '/projects/[projectId]/settings',
         comps: [...shell, 'tm-claude-api-key'],
      },
      {
         pageKey: '/dashboard/rules',
         comps: [...shell, 'tm-rules-header', 'tm-rules-page'],
      },
   ];

   const rows = assignments.flatMap(({ pageKey, comps }) => {
      const pageId = pageIds[pageKey];
      if (!pageId) return [];
      return comps.map((name, order) => ({
         pageId,
         componentId: componentIds[name],
         order: order as unknown as number,
      }));
   });

   await db.insert(pageComponents).values(rows);
}

// ── Backend atoms ─────────────────────────────────────────────────────────────

async function seedBackendAtoms() {
   // DB tables — in schema definition order
   const tables = [
      // Auth (BetterAuth-owned)
      {
         name: 'user',
         props: {
            group: 'auth',
            note: 'BetterAuth users + app extensions (github_oauth_token, claude_api_key)',
         },
      },
      { name: 'session', props: { group: 'auth', note: 'BetterAuth sessions — cookie-based' } },
      { name: 'account', props: { group: 'auth', note: 'BetterAuth OAuth accounts (GitHub)' } },
      {
         name: 'verification',
         props: { group: 'auth', note: 'BetterAuth email verification tokens' },
      },
      // Core
      {
         name: 'projects',
         props: { group: 'core', note: 'Project registry. id is a slug (e.g. taskm-core).' },
      },
      {
         name: 'jobs',
         props: { group: 'core', note: 'Agent job queue. Status: queued|running|done|failed.' },
      },
      {
         name: 'tasks',
         props: {
            group: 'core',
            note: 'Tasks for agents (audience=llm) and humans (audience=user). Scoped to layer_index.',
         },
      },
      {
         name: 'logs',
         props: { group: 'core', note: 'Append-only event stream. Never updated or deleted.' },
      },
      // Layer 0
      {
         name: 'specs',
         props: {
            group: 'layer-0',
            note: 'Project specs: goals, constraints, decisions, personas.',
         },
      },
      // Layer 1
      {
         name: 'stack_entries',
         props: {
            group: 'layer-1',
            note: 'Tech stack. Categories: framework, db, hosting, auth, integration.',
         },
      },
      {
         name: 'repo_files',
         props: {
            group: 'layer-1',
            note: 'Agent-generated file tree. type: file|dir. Ordered by depth + order.',
         },
      },
      // Layer 2 — design tokens
      {
         name: 'global_colors',
         props: { group: 'layer-2-tokens', note: 'Design tokens: colors (hex/rgba/oklch).' },
      },
      {
         name: 'global_fonts',
         props: {
            group: 'layer-2-tokens',
            note: 'Design tokens: fonts and roles (body/heading/mono).',
         },
      },
      {
         name: 'global_font_sizes',
         props: { group: 'layer-2-tokens', note: 'Design tokens: named font sizes.' },
      },
      {
         name: 'global_spacings',
         props: { group: 'layer-2-tokens', note: 'Design tokens: spacing scale.' },
      },
      {
         name: 'global_radii',
         props: { group: 'layer-2-tokens', note: 'Design tokens: border radius scale.' },
      },
      {
         name: 'global_shadows',
         props: { group: 'layer-2-tokens', note: 'Design tokens: box-shadow values.' },
      },
      // Layer 2 — components
      {
         name: 'atoms',
         props: {
            group: 'layer-2',
            note: 'Frontend atoms: buttons, links, inputs, icons, etc. Defines style — not content.',
         },
      },
      { name: 'components', props: { group: 'layer-2', note: 'UI components composed of atoms.' } },
      {
         name: 'component_atoms',
         props: {
            group: 'layer-2',
            note: 'Junction: which atoms compose each component. Props hold contextual content (labels, etc.).',
         },
      },
      {
         name: 'pages',
         props: {
            group: 'layer-2',
            note: 'Sitemap pages. Each page has a path and belongs to a project.',
         },
      },
      {
         name: 'page_components',
         props: {
            group: 'layer-2',
            note: 'Junction: which components appear on which page, with placement config.',
         },
      },
      // Layer 3
      {
         name: 'backend_atoms',
         props: {
            group: 'layer-3',
            note: 'Backend atoms: db-table, db-column, endpoint, service, migration.',
         },
      },
      // Layer 4
      {
         name: 'qa_templates',
         props: {
            group: 'layer-4',
            note: 'Global QA checklist template rows — seeded once, not project-scoped.',
         },
      },
      {
         name: 'checklist',
         props: {
            group: 'layer-4',
            note: 'Per-project QA checklist. Copied from qa_templates on project creation.',
         },
      },
      // Global
      {
         name: 'rules',
         props: { group: 'global', note: 'User-scoped rules. layer_index=null means all layers.' },
      },
      // Discovery
      {
         name: 'discovery_questions',
         props: {
            group: 'discovery',
            note: 'Global Q&A template — same questions for every project.',
         },
      },
      {
         name: 'discovery_answers',
         props: {
            group: 'discovery',
            note: 'Per-project answers, seeded empty on project creation.',
         },
      },
   ];

   // API endpoints
   const endpoints = [
      {
         method: 'GET',
         path: '/api/projects',
         name: 'List projects',
         props: { auth: true, note: 'Returns all projects for authenticated user.' },
      },
      {
         method: 'POST',
         path: '/api/projects',
         name: 'Create project',
         props: { auth: true, note: 'Creates project + seeds QA checklist + discovery answers.' },
      },
      {
         method: 'GET',
         path: '/api/projects/[projectId]',
         name: 'Get project',
         props: { auth: true },
      },
      {
         method: 'PATCH',
         path: '/api/projects/[projectId]',
         name: 'Update project',
         props: { auth: true, note: 'Partial update: name, goal, state, githubRepo.' },
      },
      {
         method: 'GET',
         path: '/api/projects/[projectId]/tasks',
         name: 'List tasks',
         props: { auth: true, note: 'Optional ?layerIndex and ?audience query params.' },
      },
      {
         method: 'POST',
         path: '/api/projects/[projectId]/tasks',
         name: 'Create task',
         props: { auth: true },
      },
      {
         method: 'GET',
         path: '/api/projects/[projectId]/logs',
         name: 'List logs',
         props: {
            auth: true,
            note: 'Optional ?layerIndex query param. Returns DESC by createdAt.',
         },
      },
      {
         method: 'POST',
         path: '/api/projects/[projectId]/logs',
         name: 'Append log entry',
         props: { auth: true },
      },
      {
         method: 'POST',
         path: '/api/jobs',
         name: 'Create job',
         props: { auth: true, note: 'Enqueues an agent job for a project + layer.' },
      },
      { method: 'GET', path: '/api/jobs', name: 'List jobs', props: { auth: true } },
      { method: 'GET', path: '/api/jobs/[jobId]', name: 'Get job', props: { auth: true } },
      {
         method: 'GET',
         path: '/api/github/repos',
         name: 'List GitHub repos',
         props: { auth: true, note: 'Uses github_oauth_token from user row.' },
      },
      {
         method: 'POST',
         path: '/api/user/claude-key',
         name: 'Save Claude API key',
         props: { auth: true, note: 'Base64-encodes the key before storing.' },
      },
      {
         method: 'DELETE',
         path: '/api/user/claude-key',
         name: 'Remove Claude API key',
         props: { auth: true },
      },
      {
         method: 'ALL',
         path: '/api/auth/[...all]',
         name: 'BetterAuth handler',
         props: { auth: false, note: 'BetterAuth catch-all. Handles session, OAuth, email flows.' },
      },
   ];

   // Server actions (services)
   const services = [
      {
         name: 'createProject',
         props: {
            file: 'lib/actions/projects.ts',
            note: 'Creates project, seeds checklist + discovery answers.',
         },
      },
      { name: 'createRule', props: { file: 'lib/actions/rules.ts' } },
      { name: 'updateRule', props: { file: 'lib/actions/rules.ts' } },
      { name: 'deleteRule', props: { file: 'lib/actions/rules.ts' } },
      {
         name: 'upsertDiscoveryAnswer',
         props: {
            file: 'lib/actions/discovery.ts',
            note: 'Select + conditional insert/update (no native upsert).',
         },
      },
   ];

   await db.insert(backendAtoms).values([
      ...tables.map((t) => ({
         projectId: PROJECT_ID,
         atomType: 'db-table' as const,
         dbType: 'sql' as const,
         name: t.name,
         props: t.props,
      })),
      ...endpoints.map((e) => ({
         projectId: PROJECT_ID,
         atomType: 'endpoint' as const,
         name: e.name,
         method: e.method,
         path: e.path,
         props: e.props,
      })),
      ...services.map((s) => ({
         projectId: PROJECT_ID,
         atomType: 'service' as const,
         name: s.name,
         props: s.props,
      })),
   ]);
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

async function seedAtoms() {
   await db.insert(atoms).values([
      {
         projectId: PROJECT_ID,
         family: 'primary-button',
         atomType: 'button',
         variant: 'default',
         size: 'md',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'secondary-button',
         atomType: 'button',
         variant: 'secondary',
         size: 'md',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'outline-button',
         atomType: 'button',
         variant: 'outline',
         size: 'md',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'ghost-button',
         atomType: 'button',
         variant: 'ghost',
         size: 'sm',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'destructive-button',
         atomType: 'button',
         variant: 'destructive',
         size: 'sm',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'icon-button',
         atomType: 'button',
         variant: 'ghost',
         size: 'sm',
         icon: 'generic',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'nav-link',
         atomType: 'link',
         size: 'sm',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'breadcrumb-link',
         atomType: 'link',
         size: 'xs',
         interactive: true,
      },
      { projectId: PROJECT_ID, family: 'state-badge', atomType: 'badge', variant: 'outline' },
      { projectId: PROJECT_ID, family: 'family-badge', atomType: 'badge', variant: 'secondary' },
      {
         projectId: PROJECT_ID,
         family: 'text-input',
         atomType: 'input',
         size: 'md',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'textarea-field',
         atomType: 'input',
         size: 'md',
         interactive: true,
      },
      {
         projectId: PROJECT_ID,
         family: 'select-field',
         atomType: 'input',
         size: 'md',
         interactive: true,
      },
      { projectId: PROJECT_ID, family: 'page-heading', atomType: 'text', size: 'xl' },
      { projectId: PROJECT_ID, family: 'section-heading', atomType: 'text', size: 'lg' },
      { projectId: PROJECT_ID, family: 'body-text', atomType: 'text', size: 'sm' },
      { projectId: PROJECT_ID, family: 'muted-label', atomType: 'label', size: 'xs' },
      { projectId: PROJECT_ID, family: 'mono-text', atomType: 'text', size: 'xs' },
      { projectId: PROJECT_ID, family: 'section-divider', atomType: 'divider' },
   ]);
}

// ── Global design tokens ──────────────────────────────────────────────────────

async function seedGlobalColors() {
   await db.insert(globalColors).values([
      { projectId: PROJECT_ID, name: 'background', value: 'hsl(0 0% 3.9%)', role: 'background' },
      { projectId: PROJECT_ID, name: 'foreground', value: 'hsl(0 0% 98%)', role: 'foreground' },
      { projectId: PROJECT_ID, name: 'card', value: 'hsl(0 0% 3.9%)', role: 'card' },
      {
         projectId: PROJECT_ID,
         name: 'card-foreground',
         value: 'hsl(0 0% 98%)',
         role: 'card-foreground',
      },
      { projectId: PROJECT_ID, name: 'popover', value: 'hsl(0 0% 3.9%)', role: 'popover' },
      {
         projectId: PROJECT_ID,
         name: 'popover-foreground',
         value: 'hsl(0 0% 98%)',
         role: 'popover-foreground',
      },
      { projectId: PROJECT_ID, name: 'primary', value: 'hsl(0 0% 98%)', role: 'primary' },
      {
         projectId: PROJECT_ID,
         name: 'primary-foreground',
         value: 'hsl(0 0% 9%)',
         role: 'primary-foreground',
      },
      { projectId: PROJECT_ID, name: 'secondary', value: 'hsl(0 0% 14.9%)', role: 'secondary' },
      {
         projectId: PROJECT_ID,
         name: 'secondary-foreground',
         value: 'hsl(0 0% 98%)',
         role: 'secondary-foreground',
      },
      { projectId: PROJECT_ID, name: 'muted', value: 'hsl(0 0% 14.9%)', role: 'muted' },
      {
         projectId: PROJECT_ID,
         name: 'muted-foreground',
         value: 'hsl(0 0% 63.9%)',
         role: 'muted-foreground',
      },
      { projectId: PROJECT_ID, name: 'accent', value: 'hsl(0 0% 14.9%)', role: 'accent' },
      {
         projectId: PROJECT_ID,
         name: 'accent-foreground',
         value: 'hsl(0 0% 98%)',
         role: 'accent-foreground',
      },
      {
         projectId: PROJECT_ID,
         name: 'destructive',
         value: 'hsl(0 62.8% 30.6%)',
         role: 'destructive',
      },
      { projectId: PROJECT_ID, name: 'border', value: 'hsl(0 0% 14.9%)', role: 'border' },
      { projectId: PROJECT_ID, name: 'input', value: 'hsl(0 0% 14.9%)', role: 'input' },
      { projectId: PROJECT_ID, name: 'ring', value: 'hsl(0 0% 83.1%)', role: 'ring' },
      { projectId: PROJECT_ID, name: 'sidebar', value: 'hsl(240 5.9% 10%)', role: 'sidebar' },
   ]);
}

async function seedGlobalFonts() {
   await db.insert(globalFonts).values([
      { projectId: PROJECT_ID, name: 'geist-sans', family: 'var(--font-geist-sans)', role: 'body' },
      { projectId: PROJECT_ID, name: 'geist-mono', family: 'var(--font-geist-mono)', role: 'mono' },
   ]);
}

async function seedGlobalFontSizes() {
   await db.insert(globalFontSizes).values([
      { projectId: PROJECT_ID, name: 'xs', value: '0.75rem' },
      { projectId: PROJECT_ID, name: 'sm', value: '0.875rem' },
      { projectId: PROJECT_ID, name: 'base', value: '1rem' },
      { projectId: PROJECT_ID, name: 'lg', value: '1.125rem' },
      { projectId: PROJECT_ID, name: 'xl', value: '1.25rem' },
      { projectId: PROJECT_ID, name: '2xl', value: '1.5rem' },
      { projectId: PROJECT_ID, name: '3xl', value: '1.875rem' },
   ]);
}

async function seedGlobalSpacings() {
   await db.insert(globalSpacings).values([
      { projectId: PROJECT_ID, name: '1', value: '0.25rem' },
      { projectId: PROJECT_ID, name: '2', value: '0.5rem' },
      { projectId: PROJECT_ID, name: '3', value: '0.75rem' },
      { projectId: PROJECT_ID, name: '4', value: '1rem' },
      { projectId: PROJECT_ID, name: '5', value: '1.25rem' },
      { projectId: PROJECT_ID, name: '6', value: '1.5rem' },
      { projectId: PROJECT_ID, name: '8', value: '2rem' },
      { projectId: PROJECT_ID, name: '10', value: '2.5rem' },
      { projectId: PROJECT_ID, name: '12', value: '3rem' },
      { projectId: PROJECT_ID, name: '16', value: '4rem' },
   ]);
}

async function seedGlobalRadii() {
   await db.insert(globalRadii).values([
      { projectId: PROJECT_ID, name: 'sm', value: 'calc(0.625rem - 4px)' },
      { projectId: PROJECT_ID, name: 'md', value: 'calc(0.625rem - 2px)' },
      { projectId: PROJECT_ID, name: 'lg', value: '0.625rem' },
      { projectId: PROJECT_ID, name: 'xl', value: 'calc(0.625rem + 4px)' },
      { projectId: PROJECT_ID, name: 'full', value: '9999px' },
   ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
   console.log('Seeding TaskM project data (sitemap + schema)...');

   console.log('  → clearing existing data');
   await clearExisting();

   console.log('  → pages');
   const pageIds = await seedPages();

   console.log('  → components');
   const componentIds = await seedComponents();

   console.log('  → page-component junctions');
   await seedPageComponents(pageIds, componentIds);

   console.log('  → backend atoms (tables + endpoints + services)');
   await seedBackendAtoms();

   console.log('  → atoms (19)');
   await seedAtoms();

   console.log('  → global colors (19)');
   await seedGlobalColors();

   console.log('  → global fonts (2)');
   await seedGlobalFonts();

   console.log('  → global font sizes (7)');
   await seedGlobalFontSizes();

   console.log('  → global spacings (10)');
   await seedGlobalSpacings();

   console.log('  → global radii (5)');
   await seedGlobalRadii();

   console.log('Done.');
   process.exit(0);
}

main().catch((err) => {
   console.error('Seed failed:', err);
   process.exit(1);
});
