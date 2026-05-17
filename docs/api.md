# TaskM — API

_Last updated: 2026-05-17_

## Current State

**Status: No API routes implemented**

All data currently comes from `mock-data/`. API routes will be added when the DB is wired. BetterAuth's route (`/api/auth/[...all]`) is the first to be added.

---

## BetterAuth Route

**Status: Planned**

```
app/api/auth/[...all]/route.ts
```

Handles all BetterAuth endpoints (sign-in, sign-up, sign-out, session, etc.). Mounted at `/api/auth/*`.

---

## Planned Application Routes

All routes require a valid BetterAuth session cookie. These will be implemented as Next.js Route Handlers or Server Actions.

### Projects

**Status: Planned**

| Method  | Path                        | Auth     | Description                              |
| ------- | --------------------------- | -------- | ---------------------------------------- |
| `GET`   | `/api/projects`             | Required | List projects for current user           |
| `POST`  | `/api/projects`             | Required | Create project                           |
| `GET`   | `/api/projects/[projectId]` | Required | Get project with layers                  |
| `PATCH` | `/api/projects/[projectId]` | Required | Update project (name, type, goal, state) |

### Layers

**Status: Planned**

| Method  | Path                                         | Auth     | Description                |
| ------- | -------------------------------------------- | -------- | -------------------------- |
| `GET`   | `/api/projects/[projectId]/layers`           | Required | List layers for project    |
| `PATCH` | `/api/projects/[projectId]/layers/[layerId]` | Required | Update layer state/percent |

### Tasks

**Status: Planned**

| Method  | Path                                       | Auth     | Description                            |
| ------- | ------------------------------------------ | -------- | -------------------------------------- |
| `GET`   | `/api/projects/[projectId]/tasks`          | Required | List tasks (filter by layerId, status) |
| `POST`  | `/api/projects/[projectId]/tasks`          | Required | Create task                            |
| `PATCH` | `/api/projects/[projectId]/tasks/[taskId]` | Required | Update task (status, priority, title)  |

### Logs

**Status: Planned**

| Method | Path                             | Auth     | Description                        |
| ------ | -------------------------------- | -------- | ---------------------------------- |
| `GET`  | `/api/projects/[projectId]/logs` | Required | Get logs (newest first, paginated) |
| `POST` | `/api/projects/[projectId]/logs` | Required | Append log entry (agent use)       |

### Specs

**Status: Planned**

| Method | Path                              | Auth     | Description                                  |
| ------ | --------------------------------- | -------- | -------------------------------------------- |
| `GET`  | `/api/projects/[projectId]/specs` | Required | Query specs (filter by category, layerIndex) |
| `POST` | `/api/projects/[projectId]/specs` | Required | Write spec row (agent use)                   |

---

## Server Actions (Alternative)

**Status: Planned**

Mutations may be implemented as Next.js Server Actions with `requireAuth()` guard rather than Route Handlers, consistent with the pattern in `Roukh/TaskM`.

---

## Notes

- `logs` and `specs` tables are append-only — no PATCH or DELETE endpoints
- Agent tools (CLI) will call the API directly with a service-role key bypassing session auth
- Error format: `{ error: string, status: number }`
