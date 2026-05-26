# TaskM — UX Flows

_Last updated: 2026-05-26_

## Core Pages

**Status: Partially Implemented**

| Route | Purpose | Status |
|---|---|---|
| `/` | Redirect → `/projects` | Implemented |
| `/login`, `/signup` | Auth forms | Implemented |
| `/projects` | Project list + "New project" dialog | Placeholder |
| `/projects/[projectId]` | **Dashboard** — tabbed: PLANNED / CURRENT / Raw / MemRI | Placeholder |
| `/projects/[projectId]/settings` | Project settings (repo path, branch, copy API key, install git hook) | Planned |

---

## Flow 1: Create Project

**Status: Planned**

1. User lands on `/projects` → clicks "New project"
2. Dialog: name, repo path (local absolute path), default branch
3. On submit → `POST /api/projects` → redirect to `/projects/[projectId]`
4. Canvas opens empty (no nodes yet)
5. Prompt: "Connect a repo to auto-populate the graph" or "Start drawing manually"

---

## Flow 2: Connect Repo & Initial Scan

**Status: Planned**

1. User sets repo path in settings (or during project creation)
2. User clicks "Scan now" → triggers `POST /api/sync` (runs scan in-process for first time)
3. Canvas populates with CURRENT nodes from codebase
4. ELKjs auto-layout runs → nodes positioned hierarchically
5. Status badges show: all nodes marked `CURRENT`

---

## Flow 3: Dashboard — PLANNED Tab (Primary editing surface)

**Status: Planned**

The PLANNED tab is the only editable surface. CURRENT tab is read-only.

1. User opens `/projects/[projectId]` → lands on PLANNED tab
2. Canvas shows file-cluster cards (collapsed by file path)
3. Double-click a file cluster → expands to show individual function/component/endpoint/model nodes inside
4. To add a PLANNED node: double-click empty canvas area → "Add node" popover → select label, enter name → confirm
5. To add a PLANNED edge: drag from a node's output handle → drop on target node → select relation type
6. Delta panel (right sidebar) updates live — new PLANNED node appears in "Create" section
7. When done: click **Commit** → snapshot saved to `graph_snapshots` → success toast

---

## Flow 4: Viewing the Execution Delta

**Status: Planned**

1. Delta panel visible on the PLANNED tab (right sidebar)
2. Three sections: **Create** (PLANNED with no CURRENT match), **Delete** (CURRENT → DEPRECATED), **Refactor** (PLANNED edges with no CURRENT match)
3. Each item: node name, label, file path (if CURRENT), action needed
4. "Copy delta JSON" button → compact JSON payload for manual agent use
5. MCP agents call `get_execution_delta` to receive the same data in compact text format

---

## Flow 5: Post-Commit Sync (Automatic)

**Status: Planned**

1. Developer commits code in their connected repo
2. Git hook fires → AST scan runs → POSTs to `/api/sync`
3. Canvas refreshes automatically (polling or WebSocket)
4. Nodes that match PLANNED → promoted to CURRENT (badge changes)
5. Nodes in code but not on canvas → added as CURRENT
6. Nodes previously CURRENT but now absent from code → marked DEPRECATED (shown in red)

---

## Flow 6: Managing MemRI

**Status: Planned**

1. User navigates to `/projects/[projectId]/memri`
2. Table of MemRI entries: category badge, content preview, bound node name (if any)
3. "Add rule" → form: category (sop/memory/issue), content (markdown), optional node binding
4. "Bind to node" → node picker opens (searchable list of project nodes)
5. When bound node is queried via MCP, the MemRI entry is included in the context automatically

---

## Flow 7: MCP Agent Planning Loop

**Status: Planned**

How an external agent (Claude Code, Cursor) interacts with TaskM:

```
1. call get_current_state      → read what exists in the codebase
2. call get_bound_rules        → read project SOPs, active issues
3. call plan_node / plan_edge  → write intent to PLANNED
4. call get_execution_delta    → verify the gap
5. write code → git commit → hook fires → scanner → CURRENT updated
6. repeat 4-5 until delta = empty
```

PLANNED writes only happen through the MCP (or canvas UI). CURRENT writes only happen through the AST scanner. See ADR 0001.

---

## Flow 8: Snapshot History

**Status: Planned**

1. User clicks "History" in project sidebar
2. List of past snapshots: timestamp, branch, commit SHA (if triggered by scanner)
3. Click a snapshot → preview in read-only canvas
4. "Restore" button → replaces current PLANNED state with snapshot, creates a new snapshot entry before overwriting

---

## Canvas Interaction Details

**Status: Planned**

### Node status visual language

| Status | Visual |
|---|---|
| `PLANNED` | Dashed border, muted fill, blue badge |
| `CURRENT` | Solid border, full fill, green badge |
| `DEPRECATED` | Red border, strikethrough label, red badge |

### Edge visual language

| Relation | Visual |
|---|---|
| `CALLS` | Solid arrow, neutral color |
| `IMPORTS` | Dashed arrow, blue |
| `IMPLEMENTS` | Dashed arrow, teal (reads from DB model) |
| `MUTATES` | Solid arrow, orange (writes to DB model) |

### Canvas controls

- **Zoom / pan** — native React Flow
- **Auto-layout** — ELKjs `layered` algorithm, `DOWN` direction by default, toggle `RIGHT` for data-flow view
- **Filter by status** — toggle PLANNED / CURRENT / DEPRECATED layers on/off
- **Filter by node_type** — show only endpoints, only components, etc.
- **Minimap** — React Flow built-in
