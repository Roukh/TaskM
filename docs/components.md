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
    main-layout.tsx          — SidebarProvider + AppSidebar + content area
    sidebar/
      app-sidebar.tsx        — Sidebar shell: branding, NavProjects, "New project" footer
    theme-provider.tsx        — next-themes ThemeProvider (dark default)
  taskm/
    sidebar/
      nav-projects.tsx       — Collapsible project tree with layers + Logs per project
    projects/
      tm-projects-header.tsx — Breadcrumb header + "New project" button
      tm-projects-list.tsx   — Project table (name/goal, type, state badge, current layer)
    project/
      tm-project-header.tsx  — Breadcrumb header (Projects / Name)
      tm-layer-grid.tsx      — 7 layer cards, responsive grid, state-colored borders
    layer/
      tm-layer-header.tsx    — Breadcrumb header (Projects / Name / Layer N)
      tm-layer-tabs.tsx      — Tab container: layer-specific tab sets (varies per layer)
      tm-layer-tasks.tsx     — Task list (status icon, priority icon, title, date)
      tm-layer-atoms.tsx     — Spec rows grouped by category (atoms tab)
      tm-layer-checklist.tsx — QA-layer checklist items with toggle (QA layer only)
      tm-layer-discovery.tsx — Discovery Q&A view (questions + inline-editable answers)
      tm-layer-skills.tsx    — Installed skills list (skills tab)
      tm-layer-logs.tsx      — Layer-scoped event stream (logs tab)
    dashboard/
      tm-rules-header.tsx    — Breadcrumb header for dashboard (Dashboard / Rules)
      tm-rules-page.tsx      — Rules CRUD table (client component)
  ui/                        — shadcn/ui primitives (sidebar, button, badge, progress, etc.)
```

---

## Page-to-Component Assignments

**Status: Implemented**

| Route                         | Layout     | Header Component | Body Component |
| ----------------------------- | ---------- | ---------------- | -------------- |
| `/projects`                   | MainLayout | TmProjectsHeader | TmProjectsList |
| `/projects/[id]`              | MainLayout | TmProjectHeader  | TmLayerGrid    |
| `/projects/[id]/layers/[lid]` | MainLayout | TmLayerHeader    | TmLayerTabs    |
| `/dashboard/rules`            | MainLayout | TmRulesHeader    | TmRulesPage    |

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

- Client component; reads `tmProjects` + `tmLayers` from mock data
- Each project: Collapsible, auto-opens when path starts with `/projects/[projectId]`
- Sub-items: one per layer (icon + "N: Name") + "Logs" link
- Active state: exact path match via `usePathname`

### TmLayerGrid

**Status: Implemented**

- Client component
- Props: `projectId: string`
- Renders a `LayerCard` per layer, sorted by `index`
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
- Layer 2: Sitemap | Agent Tasks | Your Tasks | Logs
- Layer 3: Schema | Agent Tasks | Your Tasks | Logs
- Layer 4: QA List | Agent Tasks | Your Tasks | Logs

### TmLayerDiscovery

**Status: Implemented**

- Client component
- Props: `projectId: string`
- Renders Q&A pairs from `discovery_questions` + `discovery_answers`
- Answers are inline-editable; header shows "X/N answered" count

### TmRulesPage

**Status: Implemented**

- Client component
- Table columns: Name | Content (truncated) | Layer assignment | Edit/Delete actions
- "Add rule" button opens dialog: name, description, content, layer assignment dropdown (All layers | Layer 0–4)
- Reads/writes `rules` table (user-scoped)

### TmRulesHeader

**Status: Implemented**

- Breadcrumb header: Dashboard / Rules

### TmLayerTasks

**Status: Implemented (placeholder data)**

- Client component
- Props: `projectId: string`, `layerId: string`
- Currently renders `PLACEHOLDER_TASKS` — will be replaced with DB query
- Status icons: Circle, Loader2 (spinning), CheckCircle2, XCircle
- Priority icons: AlertCircle (urgent), ChevronUp (high), Minus (medium), ChevronDown (low)

### TmLogsList

**Status: Implemented (mock data)**

- Client component
- Props: `projectId: string`
- Renders log rows sorted by `createdAt DESC`
- Shows layer name (`Layer N: Name`) when `layerId` is set
- Type icons: PlayCircle, CheckCircle2, Wrench, FileText, MessageSquare, AlertCircle

---

## Planned Components

**Status: Planned**

| Component                  | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `tm-new-project-modal.tsx` | Create project form (name, type, goal)      |
| `tm-project-settings.tsx`  | Edit project settings                       |
| `tm-task-detail.tsx`       | Task detail view (click-to-expand or modal) |
| `tm-auth-gate.tsx`         | Login/signup form (BetterAuth)              |

## Recently Implemented Components

| Component                | Status      | Notes                                    |
| ------------------------ | ----------- | ---------------------------------------- |
| `tm-layer-discovery.tsx` | Implemented | Discovery Q&A view; Layer 0 default tab  |
| `tm-rules-page.tsx`      | Implemented | Rules CRUD table; dashboard rules page   |
| `tm-rules-header.tsx`    | Implemented | Breadcrumb header for `/dashboard/rules` |

**Note:** `tm-layer-checklist.tsx` is now QA-layer only (Layer 4). The Checklist tab is no longer shown in other layers.
