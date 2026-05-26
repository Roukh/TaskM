# TaskM — Task List

_Last updated: 2026-05-26 — Phase 1 complete. All review remediations done. Ready for Phase 2._

---

## Phase 0 — Project Bootstrap

| # | Task | Priority | Status |
|---|---|---|---|
| P0-1 | Restore Next.js config files from git | high | done |
| P0-2 | Restore all shadcn/ui primitives from git (`components/ui/`) | high | done |
| P0-3 | Restore layout shell from git — ThemeProvider, MainLayout, AppSidebar | high | done |
| P0-4 | Restore auth files from git (`lib/auth/index.ts`, `lib/auth/client.ts`, `app/api/auth/[...all]/route.ts`) | high | done |
| P0-5 | Restore Neon DB client from git (`lib/db/index.ts`) | high | done |
| P0-6 | Write clean Drizzle schema — BetterAuth tables + `projects` + `graph_snapshots` | high | done |
| P0-7 | Restore middleware from git (`middleware.ts`) | high | done |
| P0-8 | Restore app shell from git (`app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/(auth)/login/`, `app/(auth)/signup/`) | high | done |
| P0-9 | Write minimal `lib/db/queries.ts` — `getProjects(userId)`, `getProject(id)` | high | done |
| P0-10 | Create `.env.local` template | medium | done |
| P0-11 | `lib/utils.ts` — stripped to `cn()` only | low | done |
| P0-12 | Create bare `/projects` page placeholder | medium | done |
| P0-13 | Create `app/projects/[projectId]/page.tsx` placeholder | medium | done |
| P0-14 | Run `pnpm install` + verify dev server starts | high | done |
| P0-15 | Add env vars to `.env.local` + run `pnpm db:push` | high | done |

---

## Phase 1 — Neon Graph Layer + REST API

> KuzuDB is not used. All graph data lives in Neon (PostgreSQL + pgvector).
> See `docs/data-model.md` for full schema and `docs/adr/0001-planned-current-write-invariant.md` for the PLANNED/CURRENT invariant.

### Schema

| # | Task | Priority | Status |
|---|---|---|---|
| P1-1 | Enable pgvector extension on Neon: `CREATE EXTENSION IF NOT EXISTS vector` (run once via Neon console or migration) | high | **open — user action required** |
| P1-2 | Add `node_label`, `node_status`, `edge_relation`, `memri_category` enums to Drizzle schema | high | done |
| P1-3 | Add `nodes` table to Drizzle schema — id, project_id, branch, label, name, status, file_path, metadata jsonb, embedding vector(1536), canvas_x/y, commit_sha, created_at, updated_at | high | done |
| P1-4 | Add `edges` table to Drizzle schema — id, project_id, branch, source_id, target_id, relation, status, commit_sha, created_at | high | done |
| P1-5 | Add `memri` table to Drizzle schema — id, project_id, category, content, target_node_id, created_at, updated_at | high | done |
| P1-6 | Add `api_key` column to `projects` table | high | done |
| P1-7 | Run `pnpm db:push` — push new tables and columns to Neon | high | **open — user action required** |

### Query Layer

| # | Task | Priority | Status |
|---|---|---|---|
| P1-8 | `lib/db/queries/nodes.ts` — upsertNode, getNodes (filterable by status/branch/label), getNodeById, markDeprecated | high | done |
| P1-9 | `lib/db/queries/edges.ts` — upsertEdge, getEdges, deleteEdge, getEdgesForNode (forward + reverse) | high | done |
| P1-10 | `lib/db/queries/memri.ts` — createMemri, getMemri (by project + optional node binding), updateMemri, deleteMemri, getMemriById | high | done |
| P1-11 | `lib/db/queries/delta.ts` — computeDelta SQL (PLANNED nodes with no CURRENT match + recently DEPRECATED nodes) returning ExecutionDelta | high | done |

### API Routes

| # | Task | Priority | Status |
|---|---|---|---|
| P1-12 | Projects CRUD (`GET /api/projects`, `POST`, `GET/PATCH /api/projects/[id]`) — POST generates `api_key` via `crypto.randomBytes(32).toString('hex')` | high | done |
| P1-13 | Nodes routes (`GET/POST /api/projects/[id]/nodes`, `PATCH/DELETE /api/projects/[id]/nodes/[nodeId]`) — query `nodes` table | high | done |
| P1-14 | Edges routes (`GET/POST /api/projects/[id]/edges`, `DELETE /api/projects/[id]/edges/[edgeId]`) | high | done |
| P1-15 | MemRI routes (`GET/POST /api/projects/[id]/memri`, `PATCH/DELETE /api/memri/[id]`) | high | done |
| P1-16 | Sync endpoint (`POST /api/sync`) — bearer auth (project api_key), upsert nodes/edges as CURRENT, mark orphan CURRENT nodes DEPRECATED | high | done |
| P1-17 | Delta endpoint (`GET /api/projects/[id]/delta`) — runs computeDelta, returns ExecutionDelta JSON | high | done |

### Phase 1 Review Remediations

_From code review — block on CRITICAL before Phase 2 starts._

| # | Task | Priority | Status |
|---|---|---|---|
| P1-R1 | **[CRITICAL]** Split `upsertNode`/`upsertEdge` into `upsertPlannedNode`/`upsertCurrentNode` (and same for edges) — status must not be caller-supplied; enforce invariant at query layer, not convention | critical | done |
| P1-R2 | **[CRITICAL]** Add `allowEmptyScan: boolean` to sync schema; only skip `markDeprecated` when explicitly acknowledged — prevents ghost CURRENT state on misconfigured scanner | critical | done |
| P1-R3 | **[HIGH]** Batch inserts in sync (`values([...array])`) — fix N+1 write loop. Note: Neon HTTP driver does not support interactive transactions; batch inserts are best-effort. | high | done |
| P1-R4 | **[HIGH]** Add `projectId` to `getNodeById` / `getEdgeById` WHERE clause — remove cross-project read risk from query layer | high | done |
| P1-R5 | **[HIGH]** Prefix scanner-supplied node IDs with projectId in sync endpoint — prevent cross-project ID collision overwriting wrong project's nodes | high | done |
| P1-R6 | **[HIGH]** Validate query string enum params with Zod in nodes/edges GET routes — replace `as NodeStatus` casts | high | done |
| P1-R7 | **[HIGH]** Move `PATCH /api/memri/[memriId]` and `DELETE` under `/api/projects/[projectId]/memri/[memriId]/` for consistent ownership scoping | high | done |
| P1-R8 | **[MEDIUM]** Consistent `computeDelta` read — merged 3 separate queries into one `SELECT ... WHERE status IN (...)`, eliminating the race window. Neon HTTP driver has no transactions; single query is the correct fix. | medium | done |

---

## Phase 2 — Graph Canvas

| # | Task | Priority | Status |
|---|---|---|---|
| P2-1 | Dashboard shell — tabbed layout: PLANNED tab, CURRENT tab, Raw Data tab, MemRI tab | high | open |
| P2-2 | PLANNED tab: `GraphCanvas` client component — ReactFlowProvider, file-cluster compound nodes, ELKjs auto-layout | high | open |
| P2-3 | File cluster node (`FileClusterNode`) — collapsed card showing filename + node count + status summary; expands on double-click | high | open |
| P2-4 | Build 4 function-level node components: `FunctionNode`, `ComponentNode`, `EndpointNode`, `DatabaseModelNode` | high | open |
| P2-5 | Build 4 edge type components: `CallsEdge`, `ImportsEdge`, `ImplementsEdge`, `MutatesEdge` | high | open |
| P2-6 | `GraphControls` toolbar — fit view, re-layout, expand/collapse all clusters | medium | open |
| P2-7 | PLANNED canvas: wire node/edge creates → `POST /api/projects/[id]/nodes` and `edges` | high | open |
| P2-8 | PLANNED canvas: wire position drag → debounced `PATCH` on canvas_x/y | medium | open |
| P2-9 | PLANNED canvas: "Commit" button → saves snapshot to `graph_snapshots`, shows success toast | high | open |
| P2-10 | CURRENT tab: read-only `GraphCanvas` rendering CURRENT + DEPRECATED nodes (same components, no edit handles) | high | open |
| P2-11 | Delta panel (right sidebar on PLANNED tab) — Create / Delete / Refactor sections, "Copy delta JSON" button | high | open |
| P2-12 | Raw Data tab: table views for nodes, edges, memri (filterable) | medium | open |

---

## Phase 3 — AST Scanner

| # | Task | Priority | Status |
|---|---|---|---|
| P3-1 | `lib/ast/ts-extractor.ts` — ts-morph extraction: exported functions, React components (PascalCase + JSX), route handlers, Drizzle table exports | high | open |
| P3-2 | `lib/ast/node-hasher.ts` — deterministic ID: `project_id:branch:relative_file_path:entity_name` | high | open |
| P3-3 | `lib/ast/scanner.ts` — orchestrate extraction, build nodes/edges payload, POST to `/api/sync` | high | open |
| P3-4 | `scripts/scan.ts` — CLI entry point. Args: `--project`, `--branch`, `--commit`. Reads `TASKM_API_KEY` + `TASKM_PROJECT_ID` from env. | high | open |
| P3-5 | `scripts/git-hook.sh` — post-commit hook invoking scan.ts with current branch + commit SHA | medium | open |

---

## Phase 4 — MCP Server

| # | Task | Priority | Status |
|---|---|---|---|
| P4-1 | `lib/mcp/server.ts` — McpServer instance, tool registrations, WebStandardStreamableHTTPServerTransport | high | open |
| P4-2 | Read tool: `get_execution_delta` — calls computeDelta, returns ExecutionDelta in compact edge-list format | high | open |
| P4-3 | Read tool: `get_node_context` — returns node + 1-hop edges + bound memri in compact text format | high | open |
| P4-4 | Read tool: `get_bound_rules` — returns memri entries for a node_id (node-specific + project-wide) | high | open |
| P4-5 | Read tool: `get_current_state` — returns CURRENT nodes for a project/branch (filterable by label) | high | open |
| P4-6 | Write tool: `plan_node` — creates a PLANNED node (enforces invariant: only writes PLANNED status) | high | open |
| P4-7 | Write tool: `plan_edge` — creates a PLANNED edge between two nodes | high | open |
| P4-8 | Write tool: `delete_planned_node` — deletes a PLANNED node (CURRENT nodes cannot be deleted via MCP) | high | open |
| P4-9 | Write tool: `add_memri` — creates a memri entry (sop/memory/issue) optionally bound to a node | high | open |
| P4-10 | Mount MCP server at `app/api/mcp/route.ts` | high | open |
| P4-11 | Generate `CLAUDE.md` template (shown to user in project settings, copy to repo) | high | open |

---

## Phase 5 — MemRI UI

| # | Task | Priority | Status |
|---|---|---|---|
| P5-1 | MemRI tab: `MemriList` component — table of entries, category badge, content excerpt, bound node name | medium | open |
| P5-2 | `MemriForm` — create/edit: category select, content textarea, optional node binding picker (searchable node list) | medium | open |
| P5-3 | Project manager page (`/projects`) — list projects, "New project" dialog (name, repo_path, branch), shows api_key after creation | medium | open |
| P5-4 | Project settings page (`/projects/[id]/settings`) — edit name/branch, copy git hook install command, rotate api_key | medium | open |

---

## Phase 6 — Polish & Sync Loop

| # | Task | Priority | Status |
|---|---|---|---|
| P6-1 | Snapshot history panel — list `graph_snapshots` for project, click to preview, "Restore" button | medium | open |
| P6-2 | Canvas auto-refresh on sync — poll `/api/projects/[id]/nodes` every 30s, update CURRENT view | medium | open |
| P6-3 | pgvector embeddings — on node upsert, generate embedding (OpenAI or Voyage AI), store in `nodes.embedding` | medium | open |
| P6-4 | MCP semantic search tool: `find_nodes` — vector similarity search via pgvector (`<->` operator) | medium | open |
| P6-5 | Write `CLAUDE.md` for the TaskM repo itself (agent entry point) | high | open |

---

## Phase 7 — OSS Extract (Deferred)

> OSS boundary is TBD — exact files/packages to open-source must be declared before this phase begins.
> Working hypothesis: scanner CLI + local MCP server become OSS. Planning canvas stays proprietary.

| # | Task | Priority | Status |
|---|---|---|---|
| P7-1 | Declare exact OSS boundary (which packages/files are public) | high | open |
| P7-2 | Extract scanner + local MCP into a standalone package / separate repo | high | open |
| P7-3 | Publish OSS package to npm | high | open |
| P7-4 | Write OSS README + install guide (git hook setup, MCP config, cloud auth token) | high | open |
