# TaskM — Architecture

_Last updated: 2026-05-17_

## Overview

**Status: In Progress**

TaskM is the motherboard for AI-assisted software builds. Not a task manager — a build substrate that makes context-independent, professional-quality software builds possible at any scale, by any agent, in any directory.

Core property: **context independence**. Every build artifact lives in the DB. A cold session with zero conversation history invokes TaskM, reads the project state, and executes without needing prior context.

## Goals

**Status: Planned**

- `taskm init` in any directory → creates project in DB, runs Layer 0 interview
- Layer 0 questions → spec rows written to DB
- Agent can query DB to get full project state at any time
- Dashboard displays project, layers, tasks, logs
- Plug-and-play skills per layer

## Stack

**Status: Implemented (base)**

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js 15 (App Router)                        |
| UI         | React 19, Tailwind CSS 4, shadcn/ui (Radix UI) |
| State      | Zustand                                        |
| DB         | Neon (PostgreSQL)                              |
| ORM        | Drizzle ORM                                    |
| Auth       | BetterAuth (email/password, session cookie)    |
| Validation | Zod                                            |
| Animations | Motion (Framer Motion)                         |

## Project Structure

**Status: Implemented**

```
app/
  page.tsx                              → redirect to /projects
  (auth)/
    login/page.tsx                      → login form (BetterAuth)
    signup/page.tsx                     → signup form (BetterAuth)
  api/
    auth/[...all]/route.ts              → BetterAuth handler
    projects/route.ts                   → GET list, POST create
    projects/[projectId]/route.ts       → GET project
    projects/[projectId]/tasks/route.ts → GET tasks
    projects/[projectId]/logs/route.ts  → GET/POST logs
    github/repos/route.ts               → GitHub repo listing
    jobs/route.ts                       → job queue
    jobs/[jobId]/route.ts               → job status
    user/claude-key/route.ts            → Claude API key management
  projects/
    page.tsx                            → project list
    [projectId]/
      page.tsx                          → project overview (layer grid)
      layers/[layerIndex]/page.tsx      → layer view (tabbed, layer-specific)
      settings/page.tsx                 → project settings

components/
  taskm/
    projects/
      tm-projects-header.tsx            → breadcrumb header + "New project" button
      tm-projects-list.tsx              → project table
      tm-new-project-dialog.tsx         → create project dialog
    project/
      tm-project-header.tsx             → breadcrumb header
      tm-layer-grid.tsx                 → 5 layer cards, responsive grid
      tm-connect-repo.tsx               → GitHub repo connection UI
    layer/
      tm-layer-header.tsx               → breadcrumb header (Projects / Name / Layer N)
      tm-layer-tabs.tsx                 → tab container (layer-specific tab sets)
      tm-layer-tasks.tsx                → task list (from DB)
      tm-layer-atoms.tsx                → spec rows grouped by category
      tm-layer-checklist.tsx            → QA checklist (Layer 4 only)
      tm-layer-discovery.tsx            → Discovery Q&A (Layer 0)
      tm-layer-logs.tsx                 → layer-scoped event stream
      tm-frontend-pages.tsx             → Pages CRUD (Layer 2)
      tm-frontend-components.tsx        → Components CRUD (Layer 2)
      tm-frontend-atoms.tsx             → Atoms CRUD (Layer 2)
      tm-frontend-globals.tsx           → Global design tokens CRUD (Layer 2)
    dashboard/
      tm-rules-header.tsx               → breadcrumb header
      tm-rules-page.tsx                 → rules CRUD table
    settings/
      tm-claude-api-key.tsx             → Claude API key input
    sidebar/
      nav-projects.tsx                  → collapsible project tree (reads from DB)
  layout/
    main-layout.tsx                     → SidebarProvider + AppSidebar + content
    sidebar/app-sidebar.tsx             → sidebar shell
    theme-provider.tsx                  → next-themes dark default
  ui/                                   → shadcn/ui primitives

lib/
  db/
    schema.ts                           → Drizzle schema (source of truth)
    index.ts                            → Neon HTTP client
    queries.ts                          → read-only DB query functions
    seed.ts                             → idempotent seed (taskm-core project)
  auth/
    index.ts                            → BetterAuth server config
    client.ts                           → BetterAuth client config
  actions/
    projects.ts                         → project create/update Server Actions
    discovery.ts                        → discovery answers Server Actions
    rules.ts                            → rules CRUD Server Actions
    frontend.ts                         → frontend layer CRUD Server Actions

middleware.ts                           → BetterAuth middleware (protects /projects, /dashboard)
drizzle/                                → generated migration files
drizzle.config.ts
scripts/
  seed-taskm-data.ts                    → seed Layer 2/3 design + schema data
  worker.ts                             → VPS job worker
```

## Session Protocol

**Status: Planned**

Every TaskM session starts with: `invoke TaskM` → reads project from DB → resumes where last session ended. No conversation memory required. The DB is the memory.

Phase sequence (context-independent):

```
Layer 0 (one session, complete before proceeding)
  └── Layer 1–N (separate sessions, fresh context each)
       └── Verification gate (close gaps before building)
            └── Foundation (sequential: shared files)
                 └── Parallel build (worktrees, one per component)
                      └── Assembly
                           └── QA (defined tests, Playwright)
```

## Constraints

**Status: Implemented (enforced)**

- No mutation — always return new objects
- Files: 200–400 lines typical, 800 max
- DB is the single source of truth for project state; never read architecture from MD files at runtime
- Docs-first: read `docs/` before work; docs-last: update after every change
