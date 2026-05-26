# TaskM — Components

_Last updated: 2026-05-26_

## Component Architecture

**Status: Planned**

The dashboard (`/projects/[projectId]`) is a tabbed layout. PLANNED tab contains the interactive React Flow editor. CURRENT tab is a read-only React Flow viewer with the same node/edge components.

```
Server Component (page.tsx)
  └── fetches { plannedNodes, currentNodes, edges, memri, snapshots }
      └── DashboardTabs (client boundary 'use client')
            ├── Tab: PLANNED
            │     └── GraphCanvas (editable)
            │           └── ReactFlowProvider → ReactFlow
            │                 ├── FileClusterNode (compound, expandable)
            │                 ├── [function-level node-types]
            │                 ├── [edge-types]
            │                 └── DeltaPanel (right sidebar)
            ├── Tab: CURRENT
            │     └── GraphCanvas (read-only, same components, no handles)
            ├── Tab: Raw Data
            │     └── NodeTable / EdgeTable / MemriTable
            └── Tab: MemRI
                  └── MemriList + MemriForm
```

---

## Canvas Components

### GraphCanvas

**Status: Planned**

`components/canvas/graph-canvas.tsx` — Client Component.

Props:
- `initialNodes: Node[]`
- `initialEdges: Edge[]`
- `projectId: string`
- `mode: 'planned' | 'current'` — controls editability

Responsibilities:
- Mounts `ReactFlowProvider`
- Owns `useNodesState` / `useEdgesState`
- Calls ELKjs auto-layout on initial load (`layered`, `DOWN` direction, `INCLUDE_CHILDREN` for compound nodes)
- In `planned` mode: enables node/edge creation, fires PATCH on drag, shows "Commit" button
- In `current` mode: read-only, no edit handles, shows DEPRECATED nodes in red

### FileClusterNode

**Status: Planned**

`components/canvas/node-types/file-cluster-node.tsx` — Compound node representing a single file.

States:
- **Collapsed**: card showing `filename`, node count badge, status summary (N planned / N current)
- **Expanded**: shows child function-level nodes inside using React Flow compound node pattern

Double-click toggles collapsed ↔ expanded. ELKjs re-runs layout after expansion.

---

### GraphControls

**Status: Planned**

`components/canvas/graph-controls.tsx` — Toolbar overlay on canvas.

Controls:
- Auto-layout (ELKjs, direction toggle: DOWN / RIGHT)
- Status filter toggles (PLANNED / CURRENT / DEPRECATED)
- Node type filter toggles
- Fit view
- "Add node" shortcut

---

### Node Types

**Status: Planned**

All node components live in `components/canvas/node-types/`. All are Client Components. Each receives `NodeProps<T>` from React Flow. Nodes map 1:1 to KuzuDB node labels.

| Component | File | KuzuDB Label |
|---|---|---|
| `FunctionNode` | `function-node.tsx` | `Function` |
| `ComponentNode` | `component-node.tsx` | `Component` |
| `EndpointNode` | `endpoint-node.tsx` | `Endpoint` |
| `DatabaseModelNode` | `database-model-node.tsx` | `DatabaseModel` |

All node components share:
- Status badge (PLANNED / CURRENT / DEPRECATED) — color-coded
- Node name label
- Source handle (bottom or right depending on layout direction)
- Target handle (top or left)

Label-specific displays:
- `EndpointNode`: HTTP method badge (GET/POST/etc.), path string
- `DatabaseModelNode`: column count badge
- `ComponentNode`: `isClient` badge
- `FunctionNode`: arg signature excerpt, return type

---

### Edge Types

**Status: Planned**

All edge components live in `components/canvas/edge-types/`. All are Client Components. Edges are directional — one direction stored, both directions queryable.

| Component | File | KuzuDB Relation |
|---|---|---|
| `CallsEdge` | `calls-edge.tsx` | `CALLS` |
| `ImportsEdge` | `imports-edge.tsx` | `IMPORTS` |
| `ImplementsEdge` | `implements-edge.tsx` | `IMPLEMENTS` |
| `MutatesEdge` | `mutates-edge.tsx` | `MUTATES` |

Each edge renders as a labeled, colored `BaseEdge` with a marker. Labels show relation type on hover.

---

### DeltaPanel

**Status: Planned**

`components/canvas/delta-panel.tsx` — Right sidebar showing the live Execution Delta.

Sections:
- **Create** — PLANNED nodes with no CURRENT match
- **Delete** — CURRENT nodes marked DEPRECATED
- **Refactor** — edges that changed between PLANNED and CURRENT

Each item: node name, type icon, file path (if known), action description.

Buttons: "Copy delta JSON", "Dismiss item" (mark PLANNED as accepted/skipped)

---

## MemRI Components

### MemriList

**Status: Planned**

`components/memri/memri-list.tsx` — Table of all MemRI entries for the project.

Columns: category badge, content excerpt, bound node name, created date, actions.

### MemriForm

**Status: Planned**

`components/memri/memri-form.tsx` — Create/edit form.

Fields: category select, content textarea (markdown), optional node binding picker.

---

## Layout Components

### Sidebar

**Status: Implemented** (`components/layout/sidebar/app-sidebar.tsx`)

`components/layout/sidebar/app-sidebar.tsx` — App sidebar. Currently shows TaskM branding + empty content area. Project navigation items pending Phase 1 (needs project list data).

### ThemeProvider

**Status: Implemented** (`components/layout/theme-provider.tsx`)

`components/layout/theme-provider.tsx` — next-themes, dark mode default.
