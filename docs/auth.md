# TaskM — Auth

_Last updated: 2026-05-16_

## Provider

**Status: Planned**

BetterAuth — same pattern as `Roukh/TaskM` repo. Email/password, session cookie strategy.

## Tables

**Status: Planned**

BetterAuth-owned: `user`, `session`, `account`, `verification`. Created via `npx better-auth migrate`. Never modify columns directly.

## Session Model

**Status: Planned**

Cookie-based sessions. All dashboard routes require valid session. Mutations go through Server Actions with auth guard.

## Required Env Vars

**Status: Planned**

```
DATABASE_URL=<neon-connection-string>
BETTER_AUTH_SECRET=<32+ char random>
BETTER_AUTH_URL=http://localhost:3010
NEXT_PUBLIC_APP_URL=http://localhost:3010
```

## Bootstrap

**Status: Planned**

After setting `DATABASE_URL`, run once:

```bash
npx better-auth migrate
```

## Open Questions

- [ ] Sign-up: open or invite-only?
- [ ] GitHub OAuth: needed for GitHub integration features (repo linking)?
