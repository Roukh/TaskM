# TaskM — Data Model

_Last updated: 2026-05-26_

## Architecture Overview

**Status: Partially Implemented**

All data lives in **Neon (PostgreSQL)**. No separate graph database.

- **Auth tables** — BetterAuth-managed. Implemented.
- **Project registry** — `projects` table. Implemented.
- **Graph tables** — `nodes`, `edges`, `memri`. Planned (Phase 1).
- **Snapshots** — `graph_snapshots` (PLANNED state history). Implemented schema, write logic planned.

pgvector extension enables semantic node search for MCP agents (`embedding vector(1536)` column on `nodes`).

---

## Neon Schema (Drizzle)

### Table: user

**Status: Implemented** (`lib/db/schema.ts`)

BetterAuth-owned. Do not modify base columns.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `name` | `text` | |
| `email` | `text` | unique |
| `emailVerified` | `boolean` | |
| `image` | `text` | nullable |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |
| `github_oauth_token` | `text` | nullable — stored on OAuth login |
| `claude_api_key` | `text` | nullable — reserved for future chatbot tier |

### Table: session

**Status: Implemented** (`lib/db/schema.ts`)

BetterAuth-owned.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `expiresAt` | `timestamptz` | |
| `token` | `text` | unique |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |
| `ipAddress` | `text` | nullable |
| `userAgent` | `text` | nullable |
| `userId` | `text` | FK → `user.id` |

### Table: account

**Status: Implemented** (`lib/db/schema.ts`)

BetterAuth OAuth account linkage.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `accountId` | `text` | |
| `providerId` | `text` | `github` or `credential` |
| `userId` | `text` | FK → `user.id` |
| `accessToken` | `text` | nullable |
| `refreshToken` | `text` | nullable |
| `idToken` | `text` | nullable |
| `accessTokenExpiresAt` | `timestamptz` | nullable |
| `refreshTokenExpiresAt` | `timestamptz` | nullable |
| `scope` | `text` | nullable |
| `password` | `text` | nullable (hashed) |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |

### Table: verification

**Status: Implemented** (`lib/db/schema.ts`)

BetterAuth email verification tokens.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK |
| `identifier` | `text` | |
| `value` | `text` | |
| `expiresAt` | `timestamptz` | |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |

### Table: projects

**Status: Planned** (schema update — add `api_key` column)

Project registry. One row per connected repository.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK. Slug: `ghobz-realtor`, `taskm-core` |
| `user_id` | `text` | FK → `user.id` |
| `name` | `text` | Display name |
| `repo_path` | `text NOT NULL` | Absolute local path to connected repo |
| `default_branch` | `text` | Default: `main` |
| `github_repo` | `text` | Optional: `owner/repo-name` |
| `api_key` | `text NOT NULL` | Scanner auth token. Generated on project create. Sent as `Authorization: Bearer <key>` by git hook. |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Note:** `kuzu_db_path` column removed — KuzuDB is not used in the cloud layer.

**Index:** `idx_projects_user` on `user_id`

### Table: graph_snapshots

**Status: Implemented** (`lib/db/schema.ts`)

Serialized PLANNED state. Written on every canvas save (commit). Enables snapshot history and restore.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK. UUID |
| `project_id` | `text` | FK → `projects.id` |
| `branch` | `text` | Git branch name |
| `commit_sha` | `text` | Git commit hash at time of snapshot (null for manual canvas saves) |
| `snapshot` | `jsonb` | Serialized PLANNED nodes + edges: `{ nodes: [], edges: [] }` |
| `created_at` | `timestamptz` | |

**Indexes:** `idx_snapshots_project_branch` on `(project_id, branch)`, `idx_snapshots_commit` on `commit_sha`

---

## Graph Tables (Neon)

### Table: nodes

**Status: Planned** (Phase 1)

Every code entity — planned or scanned — is a node. Label is the entity type. Status is the reconciliation state.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK. Deterministic: `project_id:branch:file_path:entity_name`. PLANNED-only nodes: `uuid()`. |
| `project_id` | `text` | FK → `projects.id` |
| `branch` | `text` | Git branch name |
| `label` | `node_label` enum | `Function` \| `Component` \| `Endpoint` \| `DatabaseModel` |
| `name` | `text` | Raw entity name, e.g. `validateCart`, `SubmitButton` |
| `status` | `node_status` enum | `PLANNED` \| `CURRENT` \| `DEPRECATED` |
| `file_path` | `text` | Absolute path. Null for PLANNED nodes with no known file yet. |
| `metadata` | `jsonb` | Shape varies by label (see below) |
| `embedding` | `vector(1536)` | pgvector embedding for semantic search. Generated from `name + label + metadata`. Null until embeddings phase. |
| `canvas_x` | `float` | Null if auto-layout; set after user drags |
| `canvas_y` | `float` | Null if auto-layout; set after user drags |
| `commit_sha` | `text` | Null for PLANNED; set by scanner for CURRENT |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Enums:**
```sql
CREATE TYPE node_label AS ENUM ('Function', 'Component', 'Endpoint', 'DatabaseModel');
CREATE TYPE node_status AS ENUM ('PLANNED', 'CURRENT', 'DEPRECATED');
```

**Label assignment (scanner):**

| Label | Condition |
|---|---|
| `Component` | PascalCase export with JSX return type |
| `Endpoint` | `export async function GET/POST/PUT/DELETE/PATCH` in `app/api/**` |
| `DatabaseModel` | Drizzle `pgTable(...)` / `sqliteTable(...)` export |
| `Function` | All other exported functions |

**`metadata` shapes by label:**

```json
// Function
{ "line_start": 12, "line_end": 28, "args": "(user: string, age: number)", "return_type": "Promise<User>" }

// Component
{ "line_start": 5, "line_end": 42, "props": "({ user, onSelect }: UserCardProps)", "is_client": true }

// Endpoint
{ "line_start": 1, "line_end": 18, "method": "POST", "path": "/api/projects", "auth_required": true }

// DatabaseModel
{ "columns": [{ "name": "id", "type": "text", "pk": true }], "db_type": "sql" }
```

**Indexes:**
- `idx_nodes_project_branch` on `(project_id, branch)`
- `idx_nodes_status` on `(project_id, branch, status)`
- `idx_nodes_embedding` — ivfflat or hnsw index for vector similarity search (added in embeddings phase)

---

### Table: edges

**Status: Planned** (Phase 1)

Directional relationships between nodes. Single edge per logical relationship — no inverse stored. Cypher-style reverse traversal is handled in SQL via bidirectional query when needed.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK. Deterministic: `source_id:RELATION:target_id` |
| `project_id` | `text` | FK → `projects.id` |
| `branch` | `text` | Git branch name |
| `source_id` | `text` | FK → `nodes.id` — the node initiating the action |
| `target_id` | `text` | FK → `nodes.id` — the node receiving the action |
| `relation` | `edge_relation` enum | `CALLS` \| `IMPORTS` \| `IMPLEMENTS` \| `MUTATES` |
| `status` | `node_status` enum | `PLANNED` \| `CURRENT` \| `DEPRECATED` |
| `commit_sha` | `text` | Null for PLANNED |
| `created_at` | `timestamptz` | |

**Enum:**
```sql
CREATE TYPE edge_relation AS ENUM ('CALLS', 'IMPORTS', 'IMPLEMENTS', 'MUTATES');
```

**Relation semantics:**

| Relation | Direction | Source |
|---|---|---|
| `CALLS` | A invokes B | AST: function call expressions |
| `IMPORTS` | A imports from B | AST: import declarations |
| `IMPLEMENTS` | A reads from DB model | AST: ORM SELECT patterns |
| `MUTATES` | A writes to DB model | AST: ORM INSERT/UPDATE/DELETE patterns |

**Reverse traversal (SQL):**
```sql
-- What calls validateCart? (reverse)
SELECT n.* FROM nodes n
JOIN edges e ON e.source_id = n.id
WHERE e.target_id = $nodeId AND e.relation = 'CALLS'

-- Impact radius: 2-hop callers of validateCart
WITH RECURSIVE callers AS (
  SELECT source_id, 1 AS depth FROM edges
  WHERE target_id = $nodeId AND relation = 'CALLS'
  UNION ALL
  SELECT e.source_id, c.depth + 1 FROM edges e
  JOIN callers c ON e.target_id = c.source_id
  WHERE c.depth < 2
)
SELECT DISTINCT n.* FROM nodes n JOIN callers c ON n.id = c.source_id
```

**Indexes:**
- `idx_edges_project_branch` on `(project_id, branch)`
- `idx_edges_source` on `source_id`
- `idx_edges_target` on `target_id`

---

### Table: memri

**Status: Planned** (Phase 1)

Per-project persistent context. Bound to a specific node or project-wide.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` | PK. UUID |
| `project_id` | `text` | FK → `projects.id` |
| `category` | `memri_category` enum | `sop` \| `memory` \| `issue` |
| `content` | `text` | Plain text or markdown |
| `target_node_id` | `text` | Nullable FK → `nodes.id`. Empty = project-wide |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**Enum:**
```sql
CREATE TYPE memri_category AS ENUM ('sop', 'memory', 'issue');
```

| Category | Purpose | Example |
|---|---|---|
| `sop` | Standing operating procedure | "All DB writes must be wrapped in a transaction" |
| `memory` | Historical change log | "Migrated auth from JWT to BetterAuth on 2026-05-10" |
| `issue` | Active bug or tracked problem | "Search endpoint returns 500 on empty query" |

**Index:** `idx_memri_project` on `project_id`, `idx_memri_node` on `target_node_id`

---

## Execution Delta Object

**Status: Planned**

Computed output of the graph diff. Not a stored table. Returned by `/api/projects/[projectId]/delta` and `get_execution_delta` MCP tool.

```typescript
type ExecutionDelta = {
  project_id: string
  branch: string
  computed_at: string
  create: NodeDelta[]   // PLANNED with no CURRENT match
  delete: NodeDelta[]   // CURRENT → DEPRECATED since last scan
  refactor: EdgeDelta[] // Edges in PLANNED with no CURRENT match
}

type NodeDelta = {
  node_id: string
  name: string
  label: 'Function' | 'Component' | 'Endpoint' | 'DatabaseModel'
  file_path: string | null
  metadata: Record<string, unknown>
}

type EdgeDelta = {
  edge_id: string
  source_name: string
  target_name: string
  relation: 'CALLS' | 'IMPORTS' | 'IMPLEMENTS' | 'MUTATES'
  change: 'added' | 'removed'
}
```

**Delta SQL query:**
```sql
-- Nodes to CREATE: PLANNED with no CURRENT match on same branch
SELECT * FROM nodes
WHERE project_id = $projectId AND branch = $branch AND status = 'PLANNED'
  AND id NOT IN (
    SELECT id FROM nodes
    WHERE project_id = $projectId AND branch = $branch AND status = 'CURRENT'
  )

-- Nodes to DELETE: recently marked DEPRECATED
SELECT * FROM nodes
WHERE project_id = $projectId AND branch = $branch AND status = 'DEPRECATED'
  AND updated_at > $since
```
