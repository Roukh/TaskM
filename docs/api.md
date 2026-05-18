# TaskM — API

_Last updated: 2026-05-17_

## Current State

**Status: Implemented**

Data comes from Neon PostgreSQL via Drizzle ORM. Route Handlers serve GET requests; Server Actions handle mutations. `mock-data/` has been removed.

---

## BetterAuth Route

**Status: Implemented**

```
app/api/auth/[...all]/route.ts
```

Handles all BetterAuth endpoints (sign-in, sign-up, sign-out, session, etc.). Mounted at `/api/auth/*`.

---

## Implemented Route Handlers

All routes require a valid BetterAuth session cookie.

### Projects

**Status: Implemented**

| Method | Path                        | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `GET`  | `/api/projects`             | List projects for current user |
| `POST` | `/api/projects`             | Create project                 |
| `GET`  | `/api/projects/[projectId]` | Get single project             |

### Tasks

**Status: Implemented**

| Method | Path                              | Description                           |
| ------ | --------------------------------- | ------------------------------------- |
| `GET`  | `/api/projects/[projectId]/tasks` | List tasks (filterable by layerIndex) |

### Logs

**Status: Implemented**

| Method | Path                             | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| `GET`  | `/api/projects/[projectId]/logs` | Get logs (newest first)      |
| `POST` | `/api/projects/[projectId]/logs` | Append log entry (agent use) |

### Jobs

**Status: Implemented**

| Method | Path                | Description    |
| ------ | ------------------- | -------------- |
| `GET`  | `/api/jobs`         | List jobs      |
| `POST` | `/api/jobs`         | Enqueue job    |
| `GET`  | `/api/jobs/[jobId]` | Get job status |

### GitHub

**Status: Implemented**

| Method | Path                | Description              |
| ------ | ------------------- | ------------------------ |
| `GET`  | `/api/github/repos` | List user's GitHub repos |

### User

**Status: Implemented**

| Method  | Path                   | Description               |
| ------- | ---------------------- | ------------------------- |
| `GET`   | `/api/user/claude-key` | Get stored Claude API key |
| `PATCH` | `/api/user/claude-key` | Update Claude API key     |

---

## Server Actions

**Status: Implemented**

Mutations implemented as Next.js Server Actions with auth guard. Located in `lib/actions/`.

| File           | Actions                                          |
| -------------- | ------------------------------------------------ |
| `projects.ts`  | createProject, updateProject                     |
| `discovery.ts` | saveDiscoveryAnswer                              |
| `rules.ts`     | createRule, updateRule, deleteRule               |
| `frontend.ts`  | CRUD for pages, components, atoms, global tokens |

---

## Planned Application Routes

**Status: Planned**

| Method  | Path                              | Description                |
| ------- | --------------------------------- | -------------------------- |
| `PATCH` | `/api/projects/[projectId]`       | Update project metadata    |
| `GET`   | `/api/projects/[projectId]/specs` | Query spec rows            |
| `POST`  | `/api/projects/[projectId]/specs` | Write spec row (agent use) |

---

## Notes

- `logs` and `specs` tables are append-only — no PATCH or DELETE endpoints
- Agent tools (CLI/worker) call the API directly with a service-role key
- Error format: `{ error: string, status: number }`
