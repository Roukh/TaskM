# TaskM — Architecture

_Last updated: 2026-05-26_

## Overview

**Status: In Progress** (Phase 0 complete — Neon schema pushed, BetterAuth wired, dev server running)

TaskM is a **Deterministic Reconciliation Loop** for software construction. It maintains two parallel representations of any codebase and continuously diffs them to produce zero-hallucination build instructions for AI agents.

The core insight: AI coding agents fail not because they can't code, but because they lack precise knowledge of what already exists. TaskM solves this by making "what should exist" (PLANNED) and "what actually exists" (CURRENT) two queryable graph states — and computing the exact delta between them.

---

## The Two-Reality Model

**Status: Planned**

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│     PLANNED State            │     │     CURRENT State            │
│  (Human + AI intent canvas)  │     │  (AST scan of actual code)   │
│  Drawn on React Flow canvas  │     │  Extracted on every git push  │
└──────────────┬───────────────┘     └───────────────┬──────────────┘
               │                                     │
               └──────────────┬──────────────────────┘
                              ▼
               ┌──────────────────────────┐
               │    Graph Diff Engine     │
               │  (KuzuDB Cypher query)   │
               │  Execution Delta Object  │
               │  { create, delete,       │
               │    refactor }            │
               └──────────────┬───────────┘
                              ▼
               ┌──────────────────────────┐
               │  MCP Server (Agent API)  │
               │  Claude Code / Cursor /  │
               │  any MCP-compatible tool │
               └──────────────────────────┘
```

---

## Database Architecture

**Status: Implemented (auth/projects) + Planned (graph tables)**

Single database: **Neon (serverless PostgreSQL)** with **pgvector** extension.

**What lives in Neon:**
- BetterAuth tables (user, session, account, verification)
- Project registry (`projects` table — id, repo path, branch, api_key)
- Graph nodes (`nodes` table — all PLANNED + CURRENT + DEPRECATED nodes)
- Graph edges (`edges` table — directional relationships)
- MemRI entries (`memri` table — SOPs, memories, issues per project)
- PLANNED state snapshots (`graph_snapshots` table — version history)
- Node embeddings (`nodes.embedding vector(1536)` — semantic search via pgvector)

**No KuzuDB.** All graph queries use SQL + recursive CTEs. pgvector handles semantic search. See `docs/data-model.md` for full schema.

**Snapshot cadence:** Every canvas commit creates a `graph_snapshots` row (PLANNED state serialized to JSONB). Users can browse and restore from history panel.

---

## Core Loop

**Status: Planned**

1. **Draw** — User or strategic AI draws PLANNED nodes/edges on the React Flow canvas
2. **Commit** — Developer commits code; Git post-commit hook fires
3. **Scan** — AST engine (ts-morph) walks the codebase, extracts all code entities → upserts into local KuzuDB as `CURRENT` nodes + edges
4. **Reconcile** — Any node previously `CURRENT` on this branch but absent from the latest scan → automatically marked `DEPRECATED` in KuzuDB
5. **Diff** — Cypher query computes PLANNED vs CURRENT set intersection → Execution Delta object
6. **Execute** — Agent reads delta via MCP (`get_execution_delta`), executes targeted changes
7. **Close loop** — Next commit triggers step 3; canvas refreshes to reflect new CURRENT state

---

## Tech Stack

**Status: Partially Implemented** (Next.js, React, Tailwind, shadcn/ui, BetterAuth, Drizzle+Neon are live; KuzuDB, React Flow, ELKjs, ts-morph, MCP SDK pending Phase 1–4)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15 |
| UI Runtime | React | 19 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui (Radix UI) | latest |
| Graph Canvas | @xyflow/react | 12.10.2 |
| Auto-layout | elkjs | 0.11.1 |
| State | Zustand | 4.x |
| Cloud DB | Neon (PostgreSQL serverless + pgvector) | — |
| ORM | Drizzle ORM | latest |
| Auth | BetterAuth | latest |
| Validation | Zod | 3.x |
| AST (TypeScript) | ts-morph | 28.0.0 |
| AST (multi-language) | tree-sitter | 0.25.0 |
| Agent Protocol | @modelcontextprotocol/sdk | 1.29.0 |

---

## Project Structure (Target)

**Status: Planned**

```
app/
  page.tsx                              → redirect to /projects
  (auth)/
    login/page.tsx
    signup/page.tsx
  projects/
    page.tsx                            → project list + "New project" dialog
    [projectId]/
      page.tsx                          → dashboard (tabbed: PLANNED / CURRENT / Raw / MemRI)
      settings/page.tsx                 → project settings, api_key copy, git hook install
  api/
    auth/[...all]/route.ts              → BetterAuth handler  [Implemented]
    mcp/route.ts                        → MCP server (WebStandard transport)
    projects/route.ts                   → GET list, POST create (generates api_key)
    projects/[projectId]/route.ts       → GET, PATCH
    projects/[projectId]/nodes/route.ts → CRUD against nodes table
    projects/[projectId]/nodes/[nodeId]/route.ts
    projects/[projectId]/edges/route.ts → CRUD against edges table
    projects/[projectId]/edges/[edgeId]/route.ts
    projects/[projectId]/memri/route.ts → CRUD against memri table
    projects/[projectId]/delta/route.ts → SQL diff → ExecutionDelta
    memri/[memriId]/route.ts            → PATCH, DELETE
    sync/route.ts                       → AST scanner writeback (bearer auth)

components/
  canvas/
    graph-canvas.tsx                    → ReactFlowProvider + canvas shell
    graph-controls.tsx                  → toolbar (layout, zoom, expand/collapse)
    node-types/
      file-cluster-node.tsx             → collapsed file card (expands on double-click)
      function-node.tsx
      component-node.tsx
      endpoint-node.tsx
      database-model-node.tsx
    edge-types/
      calls-edge.tsx
      imports-edge.tsx
      implements-edge.tsx
      mutates-edge.tsx
    delta-panel.tsx                     → Create / Delete / Refactor sidebar
  memri/
    memri-list.tsx
    memri-form.tsx
  layout/
    sidebar/app-sidebar.tsx             → [Implemented] (project nav pending Phase 5)
    theme-provider.tsx                  → [Implemented]
    main-layout.tsx                     → [Implemented]

lib/
  db/
    schema.ts                           → Drizzle schema
    index.ts                            → Neon HTTP client  [Implemented]
    queries/
      nodes.ts                          → node CRUD + markDeprecated
      edges.ts                          → edge CRUD
      memri.ts                          → memri CRUD
      delta.ts                          → computeDelta SQL
  ast/
    scanner.ts                          → orchestrates ts-morph scan
    ts-extractor.ts                     → ts-morph extraction logic
    node-hasher.ts                      → deterministic ID: project_id:branch:file:name
  mcp/
    server.ts                           → McpServer + tool registrations
    tools/
      get-execution-delta.ts
      get-node-context.ts
      get-bound-rules.ts
      get-current-state.ts
      plan-node.ts
      plan-edge.ts
      delete-planned-node.ts
      add-memri.ts
  auth/
    index.ts                            → [Implemented]
    client.ts                           → [Implemented]
  elk/
    layout.ts                           → ELKjs layout computation

scripts/
  scan.ts                               → CLI entry point
  git-hook.sh                           → post-commit hook

middleware.ts                           → BetterAuth session protection  [Implemented]
drizzle.config.ts
CLAUDE.md                               → agent entry point (generated template)
```

---

## Key Design Decisions

**Status: Planned**

### Node IDs are deterministic hashes

Node IDs are generated as `sha1(file_path + '#' + export_name)`. This means the AST scanner and the canvas both produce the same ID for the same code entity — set intersection for the diff is an exact match, not fuzzy matching. No semantic comparison required.

### KuzuDB for graph data (not Neon)

All nodes, edges, and per-project MemRI live in KuzuDB — an embedded graph database that runs in-process like SQLite. Storing graph data in Neon would require complex join queries and lose native graph traversal semantics. KuzuDB's Cypher support means the diff query is a single graph pattern match, not multiple SQL joins across nodes/edges/status columns.

### ELKjs over Dagre

Selected for: superior edge routing (orthogonal/spline), crossing minimization (`LAYER_SWEEP`), and hierarchical grouping support (`elk.hierarchyHandling: INCLUDE_CHILDREN`). Required for heterogeneous edge types (`calls`, `imports`, `mutates`) where visual clarity degrades quickly with straight-line layouts.

### MCP over REST for agent communication

Claude Code, Cursor, and other MCP-compatible tools connect natively. No custom client, no auth header management, no HTTP client code in agent configurations. The server exposes three tools: `get_execution_delta`, `get_node_context`, `get_bound_rules`.

### Stateless MCP in Next.js

The MCP route uses `WebStandardStreamableHTTPServerTransport` — one transport per POST request, stateless. For request/response tool patterns (fetch delta, fetch context), stateless is sufficient. If streaming notifications become needed, a standalone stdio process is used instead.

### MemRI is node-bound context

MemRI entries can be bound to a specific node via `target_node_id`. When an agent requests context for a node, the MCP server includes all MemRI rows bound to that node. SOPs, memories, and active issues travel with the code entity they describe. Global (user-level) MemRI lives in Neon; project-scoped MemRI lives in the project's KuzuDB.

### KuzuDB snapshots in Neon

On branch push or manual save, the KuzuDB graph state is serialized to JSONB and written to `graph_snapshots` in Neon. This enables: cloud backup, cross-machine continuation, and future team diff viewing — without moving live graph operations to the cloud.
