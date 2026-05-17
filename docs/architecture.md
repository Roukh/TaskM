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
  page.tsx                        → redirect to /projects
  projects/
    page.tsx                      → project list
    [projectId]/
      page.tsx                    → project overview (layer grid)
      layers/[layerId]/page.tsx   → tasks for a layer
      logs/page.tsx               → append-only log stream
      settings/page.tsx           → project settings (planned)

components/
  taskm/                          → TaskM-specific components
    projects/                     → project list + header
    project/                      → layer grid + project header
    layer/                        → layer tasks + header
    logs/                         → logs list + header
    sidebar/                      → nav-projects (collapsible tree)
  layout/                         → main-layout, sidebar shell
  ui/                             → shadcn/ui primitives

lib/
  db/
    schema.ts                     → Drizzle schema (source of truth)
    index.ts                      → Neon HTTP client
  utils.ts

types/
  taskm.ts                        → TypeScript interfaces

mock-data/
  tm-projects.ts                  → placeholder data (pre-Neon wire)
  tm-layers.ts                    → placeholder data
  tm-logs.ts                      → placeholder data

types/
  taskm.ts                        → temporary TypeScript interfaces (replace with Drizzle $inferSelect types once DB is wired)

drizzle/                          → generated migration files
drizzle.config.ts
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
