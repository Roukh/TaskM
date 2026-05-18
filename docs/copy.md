# TaskM — Copy

_Last updated: 2026-05-17_

## Brand Voice

**Status: Planned**

Spare. Technical. Direct. TaskM is infrastructure — it doesn't have personality, it has precision. No exclamation marks, no "Let's get started!", no motivational copy. Copy should read like good inline documentation.

---

## App Shell Copy

**Status: Implemented**

| Element                | Copy              | Location                 |
| ---------------------- | ----------------- | ------------------------ |
| Sidebar brand name     | `TaskM`           | `app-sidebar.tsx`        |
| Sidebar brand tagline  | `Build substrate` | `app-sidebar.tsx`        |
| Sidebar footer button  | `New project`     | `app-sidebar.tsx`        |
| Projects header button | `New project`     | `tm-projects-header.tsx` |
| Projects header title  | `Projects`        | `tm-projects-header.tsx` |

---

## Table Headers

**Status: Implemented**

### Projects list (`/projects`)

| Column | Header copy     |
| ------ | --------------- |
| 45%    | `Project`       |
| 15%    | `Type`          |
| 20%    | `State`         |
| 15%    | `Current layer` |

### Task list (`/layers/[id]`)

| Column   | Header copy |
| -------- | ----------- |
| flex-1   | `Task`      |
| shrink-0 | `Created`   |

### Logs list (`/logs`)

| Column     | Header copy |
| ---------- | ----------- |
| w-8 (icon) | _(empty)_   |
| flex-1     | `Event`     |
| shrink-0   | `Time`      |

---

## State Labels

**Status: Implemented**

| State value   | Display label |
| ------------- | ------------- |
| `not-started` | `Not started` |
| `in-progress` | `In progress` |
| `complete`    | `Complete`    |
| `blocked`     | `Blocked`     |

---

## Empty State Copy

**Status: Implemented**

| Context               | Primary copy                        | Secondary copy                                     |
| --------------------- | ----------------------------------- | -------------------------------------------------- |
| Layer grid, no layers | `No layers found for this project.` | `Run taskm init to set up layers.`                 |
| Logs list, no logs    | `No logs yet for this project.`     | `Events are written here as the build progresses.` |

---

## Planned Copy

**Status: Planned**

| Context                            | Proposed copy                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Projects list, no projects         | `No projects yet.` / `Run taskm init in any directory to create your first project.` |
| New project modal title            | `New project`                                                                        |
| New project form: name field label | `Project ID`                                                                         |
| New project form: name helper text | `Slug format — lowercase, hyphens only. Example: ghobz-realtor`                      |
| New project form: type label       | `Type`                                                                               |
| New project form: goal label       | `Goal`                                                                               |
| New project form: goal helper text | `What problem does this project solve?`                                              |
| New project submit button          | `Create project`                                                                     |
| Delete project confirmation        | `Delete [project-id]? This cannot be undone.`                                        |
| Delete project confirm button      | `Delete project`                                                                     |
| Delete project cancel button       | `Keep project`                                                                       |

---

## Microcopy Rules

**Status: Planned**

- IDs use slug format: `kebab-case`, never title case in technical fields
- State values: sentence case (`Not started`, not `NOT STARTED`)
- Timestamps: `MMM d, HH:mm` format (e.g., `May 16, 14:32`) — already in tm-logs-list.tsx
- Layer names: consistent with `LAYER_DEFINITIONS` — `Discovery`, `Infrastructure`, `Frontend`, `Backend`, `QA` (5 fixed layers, indices 0–4)
- No ellipsis on truncated labels — use CSS `truncate`; never add `...` manually
