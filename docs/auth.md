# TaskM — Auth

_Last updated: 2026-05-17_

## Provider

**Status: Implemented**

BetterAuth — email/password + GitHub OAuth. Session cookie strategy.

## Tables

**Status: Implemented**

BetterAuth-owned: `user`, `session`, `account`, `verification`. Created via `npx better-auth migrate`. Never modify columns directly.

## Session Model

**Status: Implemented**

Cookie-based sessions. All dashboard routes require a valid session. Route protection via `middleware.ts` (BetterAuth session check). Mutations go through Server Actions with auth guard.

## Middleware

**Status: Implemented**

`middleware.ts` protects `/projects` and `/dashboard` routes. Unauthenticated requests are redirected to `/login`. Public routes: `/login`, `/signup`, `/api/auth/*`.

## Required Env Vars

**Status: Implemented**

```
DATABASE_URL=<neon-connection-string>
BETTER_AUTH_SECRET=<32+ char random>
BETTER_AUTH_URL=http://localhost:3010
NEXT_PUBLIC_APP_URL=http://localhost:3010
```

## Key Files

**Status: Implemented**

| File                             | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `lib/auth/index.ts`              | BetterAuth server config (auth instance)     |
| `lib/auth/client.ts`             | BetterAuth client config (browser)           |
| `app/api/auth/[...all]/route.ts` | Mounts all BetterAuth endpoints at /api/auth |
| `middleware.ts`                  | Session-based route protection               |
| `app/(auth)/login/page.tsx`      | Login form                                   |
| `app/(auth)/signup/page.tsx`     | Signup form                                  |

## Open Questions

- [ ] Sign-up: open or invite-only?
- [ ] GitHub OAuth: needed for GitHub integration features (repo linking)?
