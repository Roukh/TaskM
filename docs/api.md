# TaskM — API

_Last updated: 2026-05-26_

## Overview

**Status: Planned**

Two API surfaces:

1. **REST Route Handlers** — Next.js App Router routes. Used by the dashboard UI and the CLI scanner writeback.
2. **MCP Server** — mounted at `/api/mcp`. Exposes read + write tools to Claude Code, Cursor, and any MCP-compatible agent.

REST routes require a BetterAuth session cookie unless marked otherwise. The sync endpoint uses a per-project API key instead (no session available in git hook context).

---

## REST Routes

### Auth

**Status: Implemented** (`app/api/auth/[...all]/route.ts`)

```
app/api/auth/[...all]/route.ts
```

All BetterAuth endpoints (sign-in, sign-up, sign-out, session). Mounted at `/api/auth/*`.

---

### Projects

**Status: Planned**

**Data source: Neon (Drizzle).** Project metadata only — no graph data.

`POST /api/projects` also calls `initKuzuSchema` to initialize the KuzuDB directory at `kuzuDbPath` for the new project.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List projects for current user |
| `POST` | `/api/projects` | Create project (+ init KuzuDB schema) |
| `GET` | `/api/projects/[projectId]` | Get single project |
| `PATCH` | `/api/projects/[projectId]` | Update project metadata |

---

### Nodes

**Status: Planned**

**Data source: KuzuDB (embedded, per project).** Reads `projects.kuzuDbPath` from Neon to locate the database, then queries KuzuDB via Cypher.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/[projectId]/nodes` | List all nodes (filterable by `status`, `branch`, `node_type`) |
| `POST` | `/api/projects/[projectId]/nodes` | Create a PLANNED node |
| `PATCH` | `/api/projects/[projectId]/nodes/[nodeId]` | Update node (canvas position, metadata, status) |
| `DELETE` | `/api/projects/[projectId]/nodes/[nodeId]` | Delete PLANNED node |

Query params for GET: `?status=PLANNED&branch=main&label=Endpoint`

---

### Edges

**Status: Planned**

**Data source: KuzuDB (embedded, per project).** Reads `projects.kuzuDbPath` from Neon to locate the database, then queries KuzuDB via Cypher.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/[projectId]/edges` | List all edges (filterable by `status`, `branch`) |
| `POST` | `/api/projects/[projectId]/edges` | Create a PLANNED edge |
| `DELETE` | `/api/projects/[projectId]/edges/[edgeId]` | Delete PLANNED edge |

---

### Delta (Execution Delta)

**Status: Planned**

**Data source: KuzuDB (embedded, per project).** Runs a Cypher diff query comparing PLANNED and CURRENT nodes on the given branch.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/[projectId]/delta` | Compute and return ExecutionDelta for current branch |

Query params: `?branch=main` (defaults to project's `default_branch`)

Returns the `ExecutionDelta` object (see data-model.md).

---

### MemRI

**Status: Planned**

**Data source: KuzuDB (embedded, per project).** Project-scoped MemRI entries live in the `MemRI` node table in KuzuDB. Global (user-level) MemRI is out of scope until Phase 5 (`global_memri` table in Neon).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/[projectId]/memri` | List MemRI entries for the project (from KuzuDB) |
| `POST` | `/api/projects/[projectId]/memri` | Create MemRI entry in KuzuDB |
| `PATCH` | `/api/memri/[memriId]` | Update MemRI entry in KuzuDB |
| `DELETE` | `/api/memri/[memriId]` | Delete MemRI entry from KuzuDB |

---

### Sync (AST Scanner Writeback)

**Status: Planned**

**Data source: KuzuDB (embedded, per project).** Resolves `kuzuDbPath` from Neon using `project_id`, then upserts nodes/edges directly into KuzuDB.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/sync` | Receive AST scan payload, upsert nodes/edges as CURRENT, mark orphans DEPRECATED |

This endpoint is called by the CLI scanner script (`scripts/scan.ts`) after every git commit hook. It accepts a bearer token (project API key) rather than a session cookie.

Request body:
```json
{
  "project_id": "taskm-core",
  "branch": "main",
  "commit_sha": "abc123",
  "nodes": [{ "id": "...", "name": "...", "node_type": "...", "file_path": "...", "metadata": {} }],
  "edges": [{ "id": "...", "source_id": "...", "target_id": "...", "relation_type": "..." }]
}
```

---

## MCP Server

**Status: Planned** (Phase 4)

Mounted at `app/api/mcp/route.ts`. Uses `WebStandardStreamableHTTPServerTransport` — stateless, one transport per POST. Data source: Neon (PostgreSQL).

### Connection config

Add to `.mcp.json` in the connected repository:
```json
{
  "mcpServers": {
    "taskm": {
      "url": "https://taskm.app/api/mcp"
    }
  }
}
```

### MCP Tool Compact Format

All tools return data in compact text format by default to minimize LLM context consumption. Example:

```
validateCart · Function · PLANNED · src/checkout/validate.ts:12-28
  args: (cart: CartItem[]) → Promise<boolean>
  ← CALLS: CheckoutForm, CartSummary
  → CALLS: formatCurrency, validateAddress
  → MUTATES: orders
  RULES: [sop] Wrap all DB writes in transaction
```

---

### Read Tools

#### get_execution_delta

**Status: Planned**

Returns the current Execution Delta (PLANNED − CURRENT gap) in compact format.

Input: `{ "project_id": "string", "branch": "string (optional)" }`

Output:
```
CREATE:
  validateCart · Function · src/checkout/validate.ts
  SubmitButton · Component · (no file yet)

DELETE:
  oldHandler · Function · src/api/legacy.ts

REFACTOR:
  CheckoutForm -[CALLS]-> validateCart (added)
```

---

#### get_node_context

**Status: Planned**

Returns full context for one node: metadata, 1-hop edges, bound MemRI.

Input: `{ "node_id": "string" }`

Output: compact edge-list format (see MCP Tool Compact Format above).

---

#### get_bound_rules

**Status: Planned**

Returns all MemRI entries that apply to a node — node-specific and project-wide.

Input: `{ "node_id": "string", "project_id": "string" }`

---

#### get_current_state

**Status: Planned**

Returns CURRENT nodes for a project/branch. Filterable by label.

Input: `{ "project_id": "string", "branch": "string", "label": "Function|Component|Endpoint|DatabaseModel (optional)" }`

---

### Write Tools (PLANNED only — see ADR 0001)

#### plan_node

**Status: Planned**

Creates a PLANNED node. Enforces invariant: only writes `status = PLANNED`. Checks bound MemRI rules before writing and includes them in response.

Input:
```json
{
  "project_id": "string",
  "branch": "string",
  "label": "Function | Component | Endpoint | DatabaseModel",
  "name": "string",
  "file_path": "string (optional)",
  "metadata": {}
}
```

---

#### plan_edge

**Status: Planned**

Creates a PLANNED edge between two existing nodes.

Input:
```json
{
  "project_id": "string",
  "branch": "string",
  "source_id": "string",
  "target_id": "string",
  "relation": "CALLS | IMPORTS | IMPLEMENTS | MUTATES"
}
```

---

#### delete_planned_node

**Status: Planned**

Deletes a PLANNED node and its associated PLANNED edges. Refuses if node status is CURRENT or DEPRECATED.

Input: `{ "node_id": "string" }`

---

#### add_memri

**Status: Planned**

Creates a MemRI entry (sop/memory/issue), optionally bound to a specific node.

Input:
```json
{
  "project_id": "string",
  "category": "sop | memory | issue",
  "content": "string",
  "target_node_id": "string (optional)"
}
```

---

## Error Format

**Status: Planned**

All REST routes return:
```json
{ "error": "string", "status": 400 }
```

MCP tools return an error result in the MCP envelope format on failure.
