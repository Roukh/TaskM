# TaskM — Auth

_Last updated: 2026-05-26_

## Provider

**Status: Implemented** (`lib/auth/index.ts`)

BetterAuth with email/password and GitHub OAuth.

## Session Model

**Status: Implemented** (`middleware.ts`)

Cookie-based sessions (HTTP-only). Middleware at `middleware.ts` protects `/projects` and `/dashboard` routes. Public routes: `/login`, `/signup`, `/api/auth/*`.

## Routes

**Status: Implemented** (`app/api/auth/[...all]/route.ts`)

All BetterAuth endpoints mounted at `/api/auth/[...all]`.

## GitHub OAuth

**Status: Implemented** (`lib/auth/index.ts` — token stored on `user.github_oauth_token` via `databaseHooks`)

GitHub OAuth token stored encrypted on `user.github_oauth_token`. Used for future GitHub repo integration (not required for core AST scanning which uses local file paths).

## Sync API Key

**Status: Planned**

Projects have a service-level API key for the `/api/sync` endpoint (called by the CLI scanner via git hook — no session cookie available in that context). Key stored on the `projects` table, passed as `Authorization: Bearer <key>`.

## Environment Variables

**Status: Implemented** (`.env.local` populated)

```
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```
