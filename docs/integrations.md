# TaskM — Integrations

_Last updated: 2026-05-17_

## Neon (PostgreSQL)

**Status: Installed, not yet connected**

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

**Not yet wired:** App reads from `mock-data/` — switch to `db` queries when `DATABASE_URL` is set.

---

## Drizzle ORM

**Status: Installed, schema written, not yet pushed**

Type-safe ORM. Schema is the source of truth for all table definitions.

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
```

**Push workflow:** Add `DATABASE_URL` to `.env.local`, then run `pnpm db:push`.

---

## BetterAuth

**Status: Planned**

Session-based auth. Email/password. Same pattern as `Roukh/TaskM` repo.

| Detail           | Value                                      |
| ---------------- | ------------------------------------------ |
| Package          | `better-auth` (not yet installed)          |
| Session strategy | Cookie-based                               |
| Auth file        | `lib/auth/index.ts` (planned)              |
| Client file      | `lib/auth/client.ts` (planned)             |
| API route        | `app/api/auth/[...all]/route.ts` (planned) |

**Required env vars:**

```
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=http://localhost:3010
```

**Bootstrap (run once after DATABASE_URL is set):**

```bash
npx better-auth migrate
```

Creates: `user`, `session`, `account`, `verification` tables in Neon.

**All dashboard routes** will require a valid session cookie once auth is wired. Mutations go through Server Actions with `requireAuth()` guard.

---

## Required Env Vars Summary

**Status: Stub exists at `.env.local`**

| Var                   | Purpose                  | Required for             |
| --------------------- | ------------------------ | ------------------------ |
| `DATABASE_URL`        | Neon postgres connection | DB queries, BetterAuth   |
| `BETTER_AUTH_SECRET`  | Session signing key      | Auth (planned)           |
| `BETTER_AUTH_URL`     | Auth API base URL        | Auth (planned)           |
| `NEXT_PUBLIC_APP_URL` | Public app URL           | Auth redirects (planned) |
