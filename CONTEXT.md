# TaskM — Domain Glossary

_Updated: 2026-05-26_

---

## Product Model

**TaskM v1 = one paid tier, no free/OSS tier yet.**

The dashboard is the paid product. It has two primary surfaces:
1. **Visual canvas** — human edits PLANNED state (drag/click to add nodes, draw edges). CURRENT nodes are read-only on canvas. Each canvas save triggers a PLANNED snapshot.
2. **Chatbot** — LLM interface embedded in the dashboard. Human talks to it; it plans via the same MCP tools that external agents use.

Secondary surfaces: MemRI manager (rules/issues per-project and global), project manager (add projects, connect git), snapshot history (browse + restore previous PLANNED states).

**The PLANNED/CURRENT invariant — the most important rule in the system:**
- PLANNED is written by: (1) human via canvas, (2) LLM via MCP tools (dashboard chatbot or external agent)
- CURRENT is written by: AST scanner only (git hook → `POST /api/sync`)
- Neither can write to the other's domain. LLM cannot directly set CURRENT. AST cannot set PLANNED.

**The agent loop (via MCP):**
```
1. get_current_state     — read what exists in code
2. get_bound_rules       — read MemRI constraints
3. plan_node/plan_edge   — write intent to PLANNED
4. get_execution_delta   — verify gap (PLANNED − CURRENT)
5. write code → commit → git hook → AST → CURRENT updated
6. repeat 4–5 until delta = empty
```

**Snapshot model (v1 = linear history, no branching yet):**
Each canvas save (or MCP `plan_node` commit) creates a `graph_snapshots` row in Neon. History panel in dashboard lets user browse + restore snapshots. No named versions, no plan branches in v1.

---

## Core Terms

**PLANNED state**
The developer's declared intent — nodes and edges drawn on the React Flow canvas. Stored cloud-side in the SaaS database. Represents what *should* exist in the codebase.

**CURRENT state**
The ground truth extracted from the actual codebase by the AST scanner. Pushed to the cloud by the git hook on every commit. Represents what *does* exist.

**DEPRECATED state**
A node that was previously CURRENT but is absent from the latest AST scan. Marked automatically by the sync endpoint. Represents what *used to* exist.

**Execution Delta**
The computed difference between PLANNED and CURRENT for a given project + branch. Not a stored entity — computed on demand. Three buckets: `create` (PLANNED, no CURRENT match), `delete` (CURRENT → DEPRECATED), `refactor` (edge mutations).

**Scanner**
The local CLI component (git hook + `scripts/scan.ts`) that runs on the developer's machine after every commit. Walks the codebase via ts-morph, extracts function-level nodes and edges, POSTs them to `/api/sync` on the cloud. The only required local install.

**Dashboard**
The paid SaaS web product. Four surfaces: (1) Planning Canvas — interactive editor for PLANNED state, read-only viewer for CURRENT; (2) MemRI Manager — add/edit rules, memories, issues per-project and global; (3) Project Manager — add projects, connect git repos, copy scanner install command; (4) Snapshot History — browse and restore previous PLANNED states.

**Planning Canvas**
The React Flow component inside the Dashboard. Human can create/edit/delete PLANNED nodes and edges. CURRENT nodes are rendered but locked. Each save triggers a `graph_snapshots` entry. File-cluster default view; double-click expands to function-level nodes.

**MCP Server**
The Model Context Protocol server mounted at `/api/mcp` on the cloud. Claude Code, Cursor, and other MCP-compatible agents connect via URL in `.mcp.json`. Read tools: `get_execution_delta`, `get_node_context`, `get_bound_rules`, `get_current_state`. Write tools (PLANNED only): `plan_node`, `plan_edge`, `delete_planned_node`, `add_memri`.

**MemRI**
Per-project persistent context entries bound to specific code nodes. Three categories: `sop` (standing operating procedures), `memory` (historical change log), `issue` (active bugs). Queried by the MCP server and included in node context responses.

---

## Architecture Decisions (Resolved)

| Decision | Choice | Rationale |
|---|---|---|
| Delta computation location | **Cloud** | Web UI delta panel requires cloud access to both PLANNED and CURRENT. Local-only delta breaks the SaaS web app. |
| MCP hosting | **Cloud-hosted** (`/api/mcp`) | Zero local install friction. Scanner git hook is the only required local component. |
| OSS strategy | **B — Scanner + local MCP OSS, planning canvas proprietary** | Scanner is the free hook that drives adoption. Canvas is the moat and revenue driver. OSS boundary TBD — deferred to last phase. |
| Cloud graph store | **Neon + pgvector** | Single DB (already connected). SQL + recursive CTEs for traversal. pgvector extension for semantic node search by LLM agents. KuzuDB eliminated from cloud layer. Reserved for OSS self-hosted tier (Phase 7). |
| Scanner auth | **Per-project API key** | Static secret stored on `projects.api_key`. Developer sets `TASKM_API_KEY` in local env. Git hook sends `Authorization: Bearer <key>`. Per-project rotation scope. |
| Canvas write domain | **PLANNED only** | Human edits canvas → writes PLANNED. CURRENT nodes on canvas are read-only. PLANNED/CURRENT invariant enforced (see ADR 0001). |
| Canvas rendering | **File-cluster default, function drill-down** | File-level cluster cards by default. Double-click expands to function/component/endpoint/model nodes inside. React Flow compound nodes + ELKjs. |
| Snapshot model | **Linear history, no branching (v1)** | Every canvas save creates a `graph_snapshots` row. History panel lets user browse + restore. No named plan branches until future version. |
| Dashboard chatbot | **Deferred to Phase 5+** | MVP: no embedded chatbot. LLM interaction via external MCP clients only. When built: TaskM-hosted API, tier limits, planning-only. Future v2: server-side building direct to git, no local builds. |

---

## Open Questions

- Exact OSS boundary (what files/packages become public) — declared in a future phase
- Deployment target for the cloud SaaS (Vercel, AWS, VPS, Docker)
- Team collaboration model (single-user canvas vs real-time multi-user)
