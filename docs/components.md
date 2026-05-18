# TaskM — Components

_Last updated: 2026-05-17_

## Overview

**Status: Implemented**

Components are organized by feature under `components/taskm/` plus a shared `components/layout/` for the shell.

---

## Component Tree

**Status: Implemented**

```
components/
  layout/
    main-layout.tsx               — SidebarProvider + AppSidebar + content area
    sidebar/
      app-sidebar.tsx             — Sidebar shell: branding, NavProjects, "New project" footer
    theme-provider.tsx            — next-themes ThemeProvider (dark default)
  taskm/
    sidebar/
      nav-projects.tsx            — Collapsible project tree (reads from DB)
    projects/
      tm-projects-header.tsx      — Breadcrumb header + "New project" button
      tm-projects-list.tsx        — Project table (name/goal, type, state badge, current layer)
      tm-new-project-dialog.tsx   — Create project dialog (name, type, goal)
    project/
      tm-project-header.tsx       — Breadcrumb header (Projects / Name)
      tm-layer-grid.tsx           — 5 layer cards, responsive grid, state-colored borders
      tm-connect-repo.tsx         — GitHub repo connection UI
    layer/
      tm-layer-header.tsx         — Breadcrumb header (Projects / Name / Layer N)
      tm-layer-tabs.tsx           — Tab container: layer-specific tab sets (varies per layer)
      tm-layer-tasks.tsx          — Task list (status icon, priority icon, title, date) — reads from DB
      tm-layer-atoms.tsx          — Spec rows grouped by category
      tm-layer-checklist.tsx      — QA-layer checklist items with toggle (Layer 4 only)
      tm-layer-discovery.tsx      — Discovery Q&A view (questions + inline-editable answers)
      tm-layer-logs.tsx           — Layer-scoped event stream (logs tab)
      tm-frontend-pages.tsx       — Pages CRUD table (Layer 2)
      tm-frontend-components.tsx  — Components CRUD table, grouped by family (Layer 2)
      tm-frontend-atoms.tsx       — Atoms CRUD table, grouped by type (Layer 2)
      tm-frontend-globals.tsx     — Global design tokens CRUD: colors, fonts, sizes, spacings, radii, shadows (Layer 2)
    dashboard/
      tm-rules-header.tsx         — Breadcrumb header for dashboard (Dashboard / Rules)
      tm-rules-page.tsx           — Rules CRUD table (client component)
    settings/
      tm-claude-api-key.tsx       — Claude API key input (project settings)
  ui/                             — shadcn/ui primitives (sidebar, button, badge, progress, etc.)
```

---

## Page-to-Component Assignments

**Status: Implemented**

| Route                                | Layout     | Header Component | Body Component  |
| ------------------------------------ | ---------- | ---------------- | --------------- |
| `/login`                             | (none)     | —                | BetterAuth form |
| `/signup`                            | (none)     | —                | BetterAuth form |
| `/projects`                          | MainLayout | TmProjectsHeader | TmProjectsList  |
| `/projects/[id]`                     | MainLayout | TmProjectHeader  | TmLayerGrid     |
| `/projects/[id]/layers/[layerIndex]` | MainLayout | TmLayerHeader    | TmLayerTabs     |
| `/projects/[id]/settings`            | MainLayout | —                | TmClaudeApiKey  |
| `/dashboard/rules`                   | MainLayout | TmRulesHeader    | TmRulesPage     |

---

## Component Details

### MainLayout

**Status: Implemented**

- Props: `children`, `header?`, `headersNumber?: 1 | 2`
- Renders: `SidebarProvider > AppSidebar + content panel`
- Content height: `calc(100svh - 80px)` for 2 headers (default), `calc(100svh - 40px)` for 1
- Mobile: padding removed; desktop: `lg:p-2` with rounded border

### AppSidebar

**Status: Implemented**

- Collapsible mode: `offcanvas`
- Header: TaskMBranding (Layers icon + "TaskM" + "Build substrate")
- Content: NavProjects
- Footer: "New project" button (outline, full-width)

### NavProjects

**Status: Implemented**

- Client component; fetches projects from DB (no mock data)
- Each project: Collapsible, auto-opens when path starts with `/projects/[projectId]`
- Sub-items: one per layer (icon + "N: Name")
- Active state: exact path match via `usePathname`

### TmLayerGrid

**Status: Implemented**

- Client component
- Props: `projectId: string`
- Renders a `LayerCard` per layer (5 fixed layers: 0–4), sorted by `index`
- State colors: not-started=muted, in-progress=yellow/40, complete=green/40, blocked=red/40
- Progress bar visible for non-"not-started" states only

### TmProjectsList

**Status: Implemented**

- Client component
- Table columns: Project (45%), Type (15%), State badge (20%), Current layer (15%), chevron (5%)
- State badge colors: not-started=muted, in-progress=yellow/15, complete=green/15, blocked=red/15

### TmLayerTabs

**Status: Implemented**

- Client component
- Returns a layer-specific tab set based on `layerIndex` (0–4)
- Layer 0: Questions tab
- Layer 1: Stack | Repo | Agent Tasks | Your Tasks | Logs
- Layer 2: Pages | Components | Atoms | Globals | Agent Tasks | Your Tasks | Logs
- Layer 3: Schema | Agent Tasks | Your Tasks | Logs
- Layer 4: QA List | Agent Tasks | Your Tasks | Logs

### TmLayerDiscovery

**Status: Implemented**

- Client component
- Props: `projectId: string`
- Renders Q&A pairs from `discovery_questions` + `discovery_answers`
- Answers are inline-editable; header shows "X/N answered" count
- All questions are required (no "required" badge shown)

### TmFrontendPages

**Status: Implemented**

- Client component, Layer 2 — Pages tab
- CRUD for `pages` table rows (path, name, description)
- Dialog for add/edit; AlertDialog for delete confirmation
- Sorted by path; monospace path display

### TmFrontendComponents

**Status: Implemented**

- Client component, Layer 2 — Components tab
- CRUD for `components` table rows (name, family, description)
- Grouped by family with section headers

### TmFrontendAtoms

**Status: Implemented**

- Client component, Layer 2 — Atoms tab
- CRUD for `atoms` table rows (family, atomType, variant, size, icon, interactive)
- Grouped by atom type (button, link, icon, input, label, badge, image, divider, text)

### TmFrontendGlobals

**Status: Implemented**

- Client component, Layer 2 — Globals tab
- CRUD for 6 global token types: colors (with swatch), fonts, fontSizes, spacings, radii, shadows
- Each type has its own section with inline Add button

### TmRulesPage

**Status: Implemented**

- Client component
- Table columns: Name | Content (truncated) | Layer assignment | Edit/Delete actions
- "Add rule" button opens dialog: name, description, content, layer assignment dropdown (All layers | Layer 0–4)
- Reads/writes `rules` table (user-scoped)

### TmLayerTasks

**Status: Implemented**

- Client component
- Props: `projectId: string`, `layerIndex: number`
- Reads tasks from DB, filtered by layerIndex
- Status icons: Circle, Loader2 (spinning), CheckCircle2, XCircle
- Priority icons: AlertCircle (urgent), ChevronUp (high), Minus (medium), ChevronDown (low)

---

## Planned Components

**Status: Planned**

| Component            | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `tm-task-detail.tsx` | Task detail view (click-to-expand or modal) |
