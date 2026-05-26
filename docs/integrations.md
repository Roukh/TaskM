# TaskM — Integrations

_Last updated: 2026-05-26_

## KuzuDB (Local Graph Database)

**Status: Planned**

KuzuDB is the primary data store for all graph data. It runs embedded (in-process) in both the CLI scanner and the Next.js API routes — no separate server process.

**Package:** `kuzu` (official Node.js binding)

**Location per project:** `{repo_path}/.taskm/graph/` — KuzuDB uses a directory, not a single file.

**Path stored in Neon:** `projects.kuzu_db_path`

**Initialization:** On first project connection, `lib/kuzu/schema.ts` runs the Cypher `CREATE NODE TABLE` / `CREATE REL TABLE` DDL statements. Subsequent opens detect existing schema and skip.

**Client pattern:**
```typescript
import kuzu from 'kuzu';

export function getKuzuDb(kuzuDbPath: string) {
  const db = new kuzu.Database(kuzuDbPath);
  const conn = new kuzu.Connection(db);
  return conn;
}
```

**Query example (diff):**
```cypher
MATCH (n:Node {status: "PLANNED", git_branch: $branch})
WHERE NOT (n)-[:REALIZED_BY]->(:Node {status: "CURRENT"})
RETURN n.id, n.name, n.node_type, n.file_path, n.metadata
```

**Snapshot push:** On `git push` or manual "Save Plan", `lib/kuzu/snapshot.ts` serializes all nodes + edges + memri from KuzuDB into a JSONB payload and writes it to `graph_snapshots` in Neon.

---

## AST Scanner (ts-morph)

**Status: Planned**

The AST scanner walks a connected codebase, extracts all code entities, and upserts them directly into the project's local KuzuDB as `CURRENT` nodes + edges.

**Package:** `ts-morph@28.0.0`

**Extraction targets:**
- Exported functions and their signatures (`GET`, `POST`, component functions)
- React component definitions (PascalCase exported identifiers with JSX return)
- Import declarations → `imports` edges
- Next.js route handlers (`export async function GET/POST/PUT/DELETE`)
- DB table references (Drizzle ORM patterns → `mutates` edges)

**Output:** Upserts directly into KuzuDB via `lib/kuzu/nodes.ts` and `lib/kuzu/edges.ts`. Previously CURRENT nodes absent from this scan are marked `DEPRECATED`.

**Node ID generation:** `sha1(relative_file_path + '#' + export_name)` — deterministic, reproducible across runs

**Invocation:** `npx tsx scripts/scan.ts --project taskm-core --branch main`

---

## Multi-Language Scanner (tree-sitter)

**Status: Planned**

For non-TypeScript projects or files. Falls back from ts-morph when file extension is `.py`, `.go`, `.rs`, etc.

**Package:** `tree-sitter@0.25.0` + `tree-sitter-typescript@0.23.2` + `tree-sitter-python@0.25.0`

**Note:** Requires native compilation (`node-gyp`). Not suitable for Vercel Edge/serverless. Runs in the CLI scanner script (Node.js process), not in Next.js API routes.

---

## Git Hook Integration

**Status: Planned**

A `post-commit` shell script is installed in `.git/hooks/post-commit` (or distributed as a template via `scripts/git-hook.sh`).

**Flow:**
1. Developer commits code
2. Hook fires: `npx tsx scripts/scan.ts --project $PROJECT_ID --branch $(git rev-parse --abbrev-ref HEAD) --commit $(git rev-parse HEAD)`
3. Scanner walks the working directory, produces node/edge payload
4. Upserts directly into local KuzuDB (no HTTP round-trip needed)
5. Server picks up new CURRENT state on next canvas load

**Install command (run once per developer):**
```bash
cp scripts/git-hook.sh .git/hooks/post-commit && chmod +x .git/hooks/post-commit
```

**Environment variables required (in connected repo):**
```
TASKM_PROJECT_ID=taskm-core
TASKM_KUZU_PATH=/absolute/path/to/.taskm/graph
```

---

## MCP Server

**Status: Planned**

**Package:** `@modelcontextprotocol/sdk@1.29.0`

**Transport:** `WebStandardStreamableHTTPServerTransport` (stateless, Next.js compatible)

**Mounted at:** `/api/mcp`

**Tools exposed:** `get_execution_delta`, `get_node_context`, `get_bound_rules`

All three tools query the local KuzuDB via the project's `kuzu_db_path` stored in Neon.

**Connection (Claude Code):** Add to `.mcp.json` in the connected repository:
```json
{
  "mcpServers": {
    "taskm": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

**Alternative: Standalone stdio server**

For Claude Code desktop running locally, a standalone stdio process (`scripts/mcp-stdio.ts`) is also provided. This avoids the requirement for the Next.js server to be running.

---

## Neon (PostgreSQL)

**Status: Implemented** (schema pushed — all tables live)

**Provider:** Neon serverless PostgreSQL
**Client:** `@neondatabase/serverless` (HTTP client for edge-compatible routes)
**ORM:** Drizzle ORM

Neon stores: user accounts, project registry, graph snapshots. No live graph data.

**Required env vars:**
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
```

---

## BetterAuth

**Status: Implemented** (`lib/auth/index.ts` — email/password + GitHub OAuth wired)

**Package:** `better-auth`
**Strategy:** Email/password + GitHub OAuth
**Session:** Cookie-based (HTTP-only)
**GitHub OAuth:** Token stored on `user.github_oauth_token` for repo access

**Required env vars:**
```
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## GitHub (optional)

**Status: Planned**

Optional integration for displaying repo metadata, linking nodes to GitHub file URLs, and future PR-diff integration. Uses stored `github_oauth_token` on the user row.

Not required for core AST scanning (scanner uses local file system path, not GitHub API).
