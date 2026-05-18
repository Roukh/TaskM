# TaskM — Integrations

_Last updated: 2026-05-17_

## Neon (PostgreSQL)

**Status: Implemented, Connected, Live**

Serverless PostgreSQL. Used via the HTTP driver — no persistent connection, compatible with Vercel/serverless.

| Detail      | Value                                    |
| ----------- | ---------------------------------------- |
| Package     | `@neondatabase/serverless ^1.1.0`        |
| Driver      | `neon()` from `@neondatabase/serverless` |
| ORM adapter | `drizzle-orm/neon-http`                  |
| Client file | `lib/db/index.ts`                        |
| Schema file | `lib/db/schema.ts`                       |

**Required env var:**

```
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require
```

---

## Drizzle ORM

**Status: Implemented, schema pushed**

Type-safe ORM. Schema is the source of truth for all table definitions. Schema has been pushed to Neon via `pnpm db:push`.

| Detail            | Value                  |
| ----------------- | ---------------------- |
| Package           | `drizzle-orm ^0.45.2`  |
| Dev tool          | `drizzle-kit ^0.31.10` |
| Config            | `drizzle.config.ts`    |
| Migrations output | `drizzle/` directory   |

**Scripts:**

```bash
pnpm db:generate   # generate migration files from schema changes
pnpm db:push       # push schema directly to Neon (dev only)
pnpm db:studio     # open Drizzle Studio UI
pnpm db:seed       # seed taskm-core project data
pnpm db:seed-data  # seed Layer 2/3 design + schema data
```

---

## BetterAuth

**Status: Implemented**

Session-based auth. Email/password. Cookie sessions.

| Detail           | Value                            |
| ---------------- | -------------------------------- |
| Package          | `better-auth ^1.6.11`            |
| Session strategy | Cookie-based                     |
| Auth file        | `lib/auth/index.ts`              |
| Client file      | `lib/auth/client.ts`             |
| API route        | `app/api/auth/[...all]/route.ts` |

**Required env vars:**

```
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=http://localhost:3010
```

All dashboard routes require a valid session cookie. Middleware protects `/projects` and `/dashboard`.

---

## GitHub OAuth

**Status: Planned**

Required for repo-linking features (`tm-connect-repo.tsx`). Not yet wired.

| Detail  | Value                         |
| ------- | ----------------------------- |
| Purpose | Link GitHub repos to projects |
| Route   | `/api/github/repos` (stub)    |

---

## Anthropic Claude

**Status: Planned**

Agent invocation via Claude API. API key stored per-user in DB, managed via `/api/user/claude-key`.

---

## Required Env Vars Summary

**Status: Stub exists at `.env.local`**

| Var                   | Purpose                  | Required for           |
| --------------------- | ------------------------ | ---------------------- |
| `DATABASE_URL`        | Neon postgres connection | DB queries, BetterAuth |
| `BETTER_AUTH_SECRET`  | Session signing key      | Auth                   |
| `BETTER_AUTH_URL`     | Auth API base URL        | Auth                   |
| `NEXT_PUBLIC_APP_URL` | Public app URL           | Auth redirects         |
