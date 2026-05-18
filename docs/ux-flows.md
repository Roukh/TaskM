# TaskM — UX Flows

_Last updated: 2026-05-17_

## Route Overview

**Status: Implemented**

| Route                                       | Page                             | Entry Points                                       |
| ------------------------------------------- | -------------------------------- | -------------------------------------------------- |
| `/`                                         | Redirect → `/projects`           | Direct URL                                         |
| `/login`                                    | Login form                       | Unauthenticated redirect, direct URL               |
| `/signup`                                   | Signup form                      | Login page link                                    |
| `/projects`                                 | Project list                     | Sidebar logo, breadcrumb                           |
| `/projects/[projectId]`                     | Layer grid                       | Sidebar project link, project list row             |
| `/projects/[projectId]/layers/[layerIndex]` | Layer view (layer-specific tabs) | Sidebar layer link, layer card                     |
| `/projects/[projectId]/settings`            | Project settings                 | (planned entry point)                              |
| `/dashboard`                                | Redirect → `/dashboard/rules`    | Sidebar dashboard link                             |
| `/dashboard/rules`                          | Rules management page            | Sidebar dashboard link, redirect from `/dashboard` |

---

## Flow: Auth

**Status: Implemented**

```
Unauthenticated user → redirect to /login
  → BetterAuth login form (email/password)
  → On success → redirect to /projects
  → "Don't have an account?" → /signup
```

---

## Flow: Project List

**Status: Implemented**

```
User lands on /projects
  → Sees table: name + goal | type | state badge | current layer
  → Click any row → /projects/[projectId]
  → Click "New project" button (header or sidebar footer) → TmNewProjectDialog opens
```

**Columns:** Project (name + goal), Type (font-mono), State (colored badge), Current layer (active layer name)

---

## Flow: Project Overview (Layer Grid)

**Status: Implemented**

```
User lands on /projects/[projectId]
  → Sees 5 layer cards in responsive grid (1→2→3→4 col)
  → Each card shows: layer index + name, description, state icon, progress bar
  → Click any card → /projects/[projectId]/layers/[layerIndex]
```

**Empty state:** "No layers found for this project. Run taskm init to set up layers."

**State visualization:**

- not-started: Circle (muted) + grey border
- in-progress: Loader2 spinning (yellow) + yellow border
- complete: CheckCircle2 (green) + green border
- blocked: XCircle (red) + red border

---

## Flow: Layer View (Tabbed)

**Status: Implemented**

```
User lands on /projects/[projectId]/layers/[layerIndex]
  → Sees layer-specific tab set (varies by layer)
  → Default tab is the first tab listed below per layer
```

### Layer 0: Discovery

**Tab: Questions** (default)
Q&A pairs sourced from `discovery_questions` + `discovery_answers`. Inline editable answers. Header shows "X/N answered" count. All questions required.

### Layer 1: Infrastructure

**Tab: Stack** (default)
Stack entries grouped by category with URLs and icons.

**Tab: Repo**
Agent-generated file tree from `repo_files`. Folder/file icons, depth-indented display.

**Tab: Agent Tasks**
Tasks where `audience = 'llm'`.

**Tab: Your Tasks**
Tasks where `audience = 'user'`.

**Tab: Logs**
Append-only event stream scoped to this layer.
Type icons: PlayCircle (blue), CheckCircle2 (green), Wrench (yellow), FileText (purple), MessageSquare (muted), AlertCircle (red).

### Layer 2: Frontend

**Tab: Pages** (default)
CRUD table for site pages. Columns: path (monospace) | name | description | actions.

**Tab: Components**
CRUD table for UI components, grouped by family. Columns: name (monospace) | family | description | actions.

**Tab: Atoms**
CRUD table for design atoms, grouped by type. Columns: family | type | size | variant | interactive | actions.

**Tab: Globals**
CRUD for 6 global design token types: colors (with swatch), fonts, font sizes, spacings, radii, shadows.

**Tab: Agent Tasks**
Tasks where `audience = 'llm'`.

**Tab: Your Tasks**
Tasks where `audience = 'user'`.

**Tab: Logs**
Append-only event stream scoped to this layer.

### Layer 3: Backend

**Tab: Schema** (default)
Backend atoms displayed as DB schema: tables with columns, then API endpoints.

**Tab: Agent Tasks**
Tasks where `audience = 'llm'`.

**Tab: Your Tasks**
Tasks where `audience = 'user'`.

**Tab: Logs**
Append-only event stream scoped to this layer.

### Layer 4: QA

**Tab: QA List** (default)
Checklist items with toggle (CheckSquare2 green = passed, Square muted = not yet).

- "X/N complete" count in header
- Items sourced from `checklist` (copied from `qa_templates` on project creation)

**Tab: Agent Tasks**
Tasks where `audience = 'llm'`.

**Tab: Your Tasks**
Tasks where `audience = 'user'`.

**Tab: Logs**
Append-only event stream scoped to this layer.

---

## Navigation Structure

**Status: Implemented**

```
Sidebar
  ├── TaskM branding (→ /projects)
  └── Projects
       ├── [Project A] (collapsible)
       │    ├── Layer 0: Discovery
       │    ├── Layer 1: Infrastructure
       │    ├── Layer 2: Frontend
       │    ├── Layer 3: Backend
       │    └── Layer 4: QA
       └── [Project B] ...
```

Sidebar auto-expands the active project. Active state detection via `usePathname` (startsWith for layer routes).

---

## Breadcrumb Pattern

**Status: Implemented**

| Page                                 | Breadcrumb                              |
| ------------------------------------ | --------------------------------------- |
| `/projects`                          | Projects                                |
| `/projects/[id]`                     | Projects / Project Name                 |
| `/projects/[id]/layers/[layerIndex]` | Projects / Project Name / Layer N: Name |
| `/dashboard/rules`                   | Dashboard / Rules                       |

---

## Flow: Dashboard > Rules

**Status: Implemented**

```
User lands on /dashboard → redirect to /dashboard/rules
  → Sees rules table: Name | Content (truncated) | Layer assignment | Edit/Delete actions
  → Click "Add rule" → dialog opens: name, description, content, layer assignment dropdown
```

**Layer assignment dropdown options:** All layers | Layer 0: Discovery | Layer 1: Infrastructure | Layer 2: Frontend | Layer 3: Backend | Layer 4: QA

Rules are global and user-scoped (not per-project). `layer_index = null` means the rule applies to all layers.

---

## Planned Flows

**Status: Planned**

- `/projects/[projectId]/settings` — project settings (name, type, goal, constraints)
- Task detail view — click task row to expand or navigate to detail
- Atom/spec editing — inline edit for spec values (agent-written, human-editable)
