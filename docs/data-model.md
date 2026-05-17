# TaskM — Data Model

_Last updated: 2026-05-17_

## Architecture Overview

TaskM is a SaaS build substrate. Every project is structured around 5 fixed layers hardcoded in the application. There is no `layers` table — layers are a code enum. Progress per layer is computed from task completion ratio: `complete / total` for `layer_index = X`.

**Layer enum (hardcoded):**

| Index | Name           | Purpose                                          |
| ----- | -------------- | ------------------------------------------------ |
| 0     | Discovery      | Goals, constraints, decisions, personas          |
| 1     | Infrastructure | Full stack declaration — stack visuals           |
| 2     | Frontend       | Atoms, tokens, components, pages (copy included) |
| 3     | Backend        | Data models + endpoints (unified)                |
| 4     | QA             | Preset standard checklist                        |

**Agent protocol:** Every agent reads `tasks WHERE project_id=? AND layer_index=? AND status!='complete'` and writes to `logs`. DB is the handoff between layers — no direct agent-to-agent communication. Atoms are locked after approval; no subsequent agent writes to locked layers.

**Provider:** Neon (PostgreSQL serverless). Drizzle ORM. Schema in `lib/db/schema.ts`.

---

## Core Tables

### Table: projects

One row per build project. Slug is the human-readable primary key.

| Column         | Type          | Notes                                                                        |
| -------------- | ------------- | ---------------------------------------------------------------------------- |
| `id`           | `text`        | Slug: `ghobz-realtor`, `taskm-core`                                          |
| `user_id`      | `text`        | FK → `user.id` (BetterAuth)                                                  |
| `name`         | `text`        | Display name                                                                 |
| `type`         | `text`        | `next-app` \| `python-api` \| `ghobz-site` \| `custom`                       |
| `state`        | `text`        | `not-started` \| `in-progress` \| `complete` \| `blocked`                    |
| `goal`         | `text`        | What this project is trying to achieve                                       |
| `github_repo`  | `text`        | Connected GitHub repo (owner/name)                                           |
| `layer_locked` | `jsonb`       | `{"0": "2026-05-17T...", "2": "2026-05-18T..."}` — approved layer timestamps |
| `created_at`   | `timestamptz` |                                                                              |
| `updated_at`   | `timestamptz` |                                                                              |

**Note:** No `percent` or layer state columns — these are computed from `tasks`.

### Table: tasks

Work items scoped to project + layer. Progress per layer = `COUNT(status='complete') / COUNT(*)`.

| Column        | Type          | Notes                                              |
| ------------- | ------------- | -------------------------------------------------- | ---------------------- |
| `id`          | `uuid`        |                                                    |
| `project_id`  | `text`        | FK → `projects.id`                                 |
| `layer_index` | `smallint`    | 0–4, references hardcoded layer enum               |
| `title`       | `text`        |                                                    |
| `description` | `text`        | nullable                                           |
| `status`      | `text`        | `todo` \| `in-progress` \| `complete` \| `blocked` |
| `priority`    | `text`        | `low` \| `medium` \| `high` \| `urgent`            |
| `audience`    | `text`        | `'llm'` (default) — `'llm' = agent task            | 'user' = human action` |
| `created_at`  | `timestamptz` |                                                    |

### Table: logs

Append-only event stream. Never updated, never deleted.

| Column        | Type          | Notes                                                                                       |
| ------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `id`          | `uuid`        |                                                                                             |
| `project_id`  | `text`        | FK → `projects.id`                                                                          |
| `layer_index` | `smallint`    | nullable — which layer produced this log                                                    |
| `job_id`      | `uuid`        | nullable — FK → `jobs.id`                                                                   |
| `type`        | `text`        | `layer_start` \| `layer_complete` \| `task_done` \| `atom_written` \| `response` \| `error` |
| `summary`     | `text`        | Human-readable description                                                                  |
| `metadata`    | `jsonb`       |                                                                                             |
| `created_at`  | `timestamptz` |                                                                                             |

### Table: jobs

Worker job queue. VPS worker polls for `status='queued'` rows.

| Column        | Type          | Notes                                       |
| ------------- | ------------- | ------------------------------------------- |
| `id`          | `uuid`        |                                             |
| `project_id`  | `text`        | FK → `projects.id`                          |
| `layer_index` | `smallint`    | Which layer to run                          |
| `status`      | `text`        | `queued` \| `running` \| `done` \| `failed` |
| `error`       | `text`        | nullable                                    |
| `created_at`  | `timestamptz` |                                             |
| `started_at`  | `timestamptz` | nullable                                    |
| `finished_at` | `timestamptz` | nullable                                    |

---

## Layer 1: Infrastructure

### Table: stack_entries

One row per stack component declared for a project. Displays as stack visuals on dashboard.

| Column           | Type   | Notes                                                       |
| ---------------- | ------ | ----------------------------------------------------------- |
| `id`             | `uuid` |                                                             |
| `project_id`     | `text` | FK → `projects.id`                                          |
| `stack_category` | `text` | `framework` \| `db` \| `hosting` \| `auth` \| `integration` |
| `name`           | `text` | e.g. `Next.js`, `PostgreSQL`, `Vercel`                      |
| `version`        | `text` | nullable                                                    |
| `icon`           | `text` | nullable — icon identifier for visual display               |
| `url`            | `text` | nullable — docs/homepage URL                                |

---

## Global Tables (User-Scoped)

### Table: rules

**Status: Implemented**

Global rules set by the user, optionally scoped to a specific layer. Not per-project.

| Column        | Type          | Notes                        |
| ------------- | ------------- | ---------------------------- |
| `id`          | `uuid`        |                              |
| `user_id`     | `text`        | FK → `user.id`               |
| `name`        | `text`        | Rule name                    |
| `description` | `text`        | nullable                     |
| `content`     | `text`        | Rule body                    |
| `layer_index` | `smallint`    | nullable — null = all layers |
| `created_at`  | `timestamptz` |                              |
| `updated_at`  | `timestamptz` |                              |

---

## Layer 0: Discovery

### Table: specs

Key/value fact store for discovery artifacts. One row per spec item.

| Column       | Type          | Notes                                                                              |
| ------------ | ------------- | ---------------------------------------------------------------------------------- |
| `id`         | `uuid`        |                                                                                    |
| `project_id` | `text`        | FK → `projects.id`                                                                 |
| `category`   | `text`        | `goal` \| `constraint` \| `decision` \| `persona` \| `user-flow` \| `sitemap-page` |
| `key`        | `text`        | Machine-readable identifier                                                        |
| `value`      | `text`        | The spec value                                                                     |
| `metadata`   | `jsonb`       | Extra context                                                                      |
| `created_at` | `timestamptz` |                                                                                    |

### Table: discovery_questions

**Status: Implemented**

Global template, seeded once. Defines the standard Q&A set for Layer 0 Discovery.

| Column        | Type       | Notes                                                                |
| ------------- | ---------- | -------------------------------------------------------------------- |
| `id`          | `uuid`     |                                                                      |
| `order`       | `smallint` | Display order                                                        |
| `key`         | `text`     | UNIQUE — machine-readable slug: `core-problem`, `primary-user`, etc. |
| `question`    | `text`     | The question text                                                    |
| `description` | `text`     | nullable — hint for answering                                        |
| `required`    | `boolean`  | default true                                                         |

### Table: discovery_answers

**Status: Implemented**

Per-project answers to `discovery_questions`.

| Column        | Type          | Notes                         |
| ------------- | ------------- | ----------------------------- | -------- |
| `id`          | `uuid`        |                               |
| `project_id`  | `text`        | FK → `projects.id`            |
| `question_id` | `uuid`        | FK → `discovery_questions.id` |
| `answer`      | `text`        | nullable                      |
| `answered_by` | `text`        | nullable — `'agent'           | 'human'` |
| `answered_at` | `timestamptz` | nullable                      |
| `created_at`  | `timestamptz` |                               |

---

## Layer 2: Frontend

### Token Tables

Six token tables — one per token type. Atoms reference these via FK.

#### Table: global_colors

| Column       | Type                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `id`         | `uuid`                                                                         |
| `project_id` | `text`                                                                         |
| `name`       | `text`                                                                         |
| `value`      | `text` (hex/rgba/oklch)                                                        |
| `role`       | `text` nullable — `primary` \| `secondary` \| `destructive` \| `muted` \| etc. |

#### Table: global_fonts

| Column       | Type                                            |
| ------------ | ----------------------------------------------- |
| `id`         | `uuid`                                          |
| `project_id` | `text`                                          |
| `name`       | `text`                                          |
| `family`     | `text` — CSS font-family value                  |
| `role`       | `text` nullable — `body` \| `heading` \| `mono` |

#### Table: global_font_sizes

| Column       | Type                                                             |
| ------------ | ---------------------------------------------------------------- |
| `id`         | `uuid`                                                           |
| `project_id` | `text`                                                           |
| `name`       | `text` — `xs` \| `sm` \| `base` \| `lg` \| `xl` \| `2xl` \| etc. |
| `value`      | `text` — CSS value (rem/px)                                      |

#### Table: global_spacings

| Column       | Type                                      |
| ------------ | ----------------------------------------- |
| `id`         | `uuid`                                    |
| `project_id` | `text`                                    |
| `name`       | `text` — `1` \| `2` \| `4` \| `8` \| etc. |
| `value`      | `text` — CSS value                        |

#### Table: global_radii

| Column       | Type                                    |
| ------------ | --------------------------------------- |
| `id`         | `uuid`                                  |
| `project_id` | `text`                                  |
| `name`       | `text` — `sm` \| `md` \| `lg` \| `full` |
| `value`      | `text` — CSS value                      |

#### Table: global_shadows

| Column       | Type                          |
| ------------ | ----------------------------- |
| `id`         | `uuid`                        |
| `project_id` | `text`                        |
| `name`       | `text` — `sm` \| `md` \| `lg` |
| `value`      | `text` — CSS box-shadow value |

### Table: atoms

Indivisible UI elements. Each row is a fully specified atom variant.

| Column            | Type          | Notes                                                                                           |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `id`              | `uuid`        |                                                                                                 |
| `project_id`      | `text`        | FK → `projects.id`                                                                              |
| `family`          | `text`        | Grouping label: `primary-button`, `nav-link`, etc.                                              |
| `atom_type`       | `text`        | `button` \| `link` \| `icon` \| `input` \| `label` \| `badge` \| `image` \| `divider` \| `text` |
| `icon`            | `text`        | nullable — icon identifier (lucide name)                                                        |
| `size`            | `text`        | nullable — `xs` \| `sm` \| `md` \| `lg` \| `xl`                                                 |
| `variant`         | `text`        | nullable — `default` \| `secondary` \| `outline` \| `ghost` \| `destructive`                    |
| `interactive`     | `boolean`     | Has hover/focus/active states                                                                   |
| `aria_label`      | `text`        | nullable                                                                                        |
| `color_id`        | `uuid`        | nullable FK → `global_colors` — text color                                                      |
| `bg_color_id`     | `uuid`        | nullable FK → `global_colors` — background                                                      |
| `font_id`         | `uuid`        | nullable FK → `global_fonts`                                                                    |
| `font_size_id`    | `uuid`        | nullable FK → `global_font_sizes`                                                               |
| `radius_id`       | `uuid`        | nullable FK → `global_radii`                                                                    |
| `shadow_id`       | `uuid`        | nullable FK → `global_shadows`                                                                  |
| `border_color_id` | `uuid`        | nullable FK → `global_colors`                                                                   |
| `border_width`    | `smallint`    | nullable — 0, 1, 2, 4                                                                           |
| `padding`         | `text`        | nullable — CSS shorthand `4px 12px`                                                             |
| `props`           | `jsonb`       | Type-specific: href/target (link), src/alt (image), placeholder (input), etc.                   |
| `locked_at`       | `timestamptz` | nullable — set when layer 2 is approved                                                         |

### Table: components

Reusable UI compositions. Each row is a unique component (no duplicates). Pages adopt via junction.

| Column        | Type          | Notes                                                        |
| ------------- | ------------- | ------------------------------------------------------------ |
| `id`          | `uuid`        |                                                              |
| `project_id`  | `text`        | FK → `projects.id`                                           |
| `name`        | `text`        | Unique identifier: `primary-nav`, `hero-section`             |
| `family`      | `text`        | nullable — grouping: `nav`, `hero`, `footer`, `card`, `form` |
| `description` | `text`        | nullable                                                     |
| `locked_at`   | `timestamptz` | nullable                                                     |
| `props`       | `jsonb`       | Component-level config                                       |

### Table: component_atoms

Junction: which atoms compose a component, and in what order. One atom can appear in multiple components without duplication.

**Intrinsic vs contextual rule:** Atoms define what they ARE (color, font, label, type). The junction defines how they FIT (width, alignment, gap). Environmental adaptations are placement properties, never atom properties.

| Column         | Type       | Notes                                                                                                                                              |
| -------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `uuid`     |                                                                                                                                                    |
| `component_id` | `uuid`     | FK → `components.id`                                                                                                                               |
| `atom_id`      | `uuid`     | FK → `atoms.id`                                                                                                                                    |
| `order`        | `smallint` | Position within component                                                                                                                          |
| `props`        | `jsonb`    | Contextual adaptations: `label`, `full_width`, `flex_grow`, `alignment`, `gap`, etc. Label is content — it belongs to the placement, not the atom. |

### Table: pages

One row per page in the sitemap.

| Column        | Type          | Notes                                     |
| ------------- | ------------- | ----------------------------------------- |
| `id`          | `uuid`        |                                           |
| `project_id`  | `text`        | FK → `projects.id`                        |
| `path`        | `text`        | URL path: `/`, `/about`, `/projects/[id]` |
| `name`        | `text`        | Display name                              |
| `description` | `text`        | nullable                                  |
| `locked_at`   | `timestamptz` | nullable                                  |

### Table: page_components

Junction: which components appear on which pages, with placement properties.

| Column            | Type       | Notes                                                       |
| ----------------- | ---------- | ----------------------------------------------------------- |
| `id`              | `uuid`     |                                                             |
| `page_id`         | `uuid`     | FK → `pages.id`                                             |
| `component_id`    | `uuid`     | FK → `components.id`                                        |
| `order`           | `smallint` | Position on page (0-indexed)                                |
| `sticky`          | `boolean`  | Fixed/sticky positioning                                    |
| `full_width`      | `boolean`  | Spans full viewport vs. container                           |
| `bg_color_id`     | `uuid`     | nullable FK → `global_colors` — section background override |
| `padding_y`       | `text`     | nullable — vertical padding CSS value                       |
| `section_id`      | `text`     | nullable — HTML id for anchor nav                           |
| `mobile_hidden`   | `boolean`  | Hidden below md breakpoint                                  |
| `animation`       | `text`     | nullable — `none` \| `fade-up` \| `fade-in` \| `slide`      |
| `placement_props` | `jsonb`    | Overflow placement config                                   |

### Table: repo_files

**Status: Implemented**

Agent-generated file tree for a project's connected repository.

| Column       | Type          | Notes                             |
| ------------ | ------------- | --------------------------------- | ------ |
| `id`         | `uuid`        |                                   |
| `project_id` | `text`        | FK → `projects.id`                |
| `path`       | `text`        | Relative path: `src/app/page.tsx` |
| `type`       | `text`        | `'file'                           | 'dir'` |
| `depth`      | `smallint`    | Indentation level                 |
| `order`      | `smallint`    | Sort order                        |
| `created_at` | `timestamptz` |                                   |

---

## Layer 3: Backend

### Table: backend_atoms

Atomic units of the backend layer. Covers any data architecture (SQL, NoSQL, vector, KV).

| Column       | Type          | Notes                                                                                |
| ------------ | ------------- | ------------------------------------------------------------------------------------ |
| `id`         | `uuid`        |                                                                                      |
| `project_id` | `text`        | FK → `projects.id`                                                                   |
| `atom_type`  | `text`        | `db-table` \| `db-column` \| `db-relation` \| `endpoint` \| `migration` \| `service` |
| `name`       | `text`        | Table name, endpoint path, service name                                              |
| `db_type`    | `text`        | nullable — `sql` \| `nosql` \| `vector` \| `kv` (for db atoms)                       |
| `method`     | `text`        | nullable — `GET` \| `POST` \| `PUT` \| `DELETE` \| `PATCH` (for endpoints)           |
| `path`       | `text`        | nullable — endpoint path `/api/users/:id`                                            |
| `locked_at`  | `timestamptz` | nullable                                                                             |
| `props`      | `jsonb`       | Type-specific: column definitions, auth required, relations, etc.                    |
| `created_at` | `timestamptz` |                                                                                      |

---

## Layer 4: QA

### Table: qa_templates

Product-defined checklist items. Seeded once, copied to each new project on creation.

| Column        | Type       | Notes                                                                    |
| ------------- | ---------- | ------------------------------------------------------------------------ |
| `id`          | `uuid`     |                                                                          |
| `order`       | `smallint` | Display order                                                            |
| `category`    | `text`     | `accessibility` \| `performance` \| `security` \| `ux` \| `code-quality` |
| `title`       | `text`     | The checklist item                                                       |
| `description` | `text`     | nullable                                                                 |

### Table: checklist

Per-project QA items (copied from `qa_templates` on project creation).

| Column        | Type          | Notes                                    |
| ------------- | ------------- | ---------------------------------------- |
| `id`          | `uuid`        |                                          |
| `project_id`  | `text`        | FK → `projects.id`                       |
| `template_id` | `uuid`        | FK → `qa_templates.id`                   |
| `title`       | `text`        | Copied from template (may be customized) |
| `category`    | `text`        |                                          |
| `order`       | `smallint`    |                                          |
| `passed`      | `boolean`     | default false                            |
| `passed_at`   | `timestamptz` | nullable                                 |
| `passed_by`   | `text`        | nullable — `agent` \| `human`            |

---

## Auth Tables (BetterAuth-owned)

`user`, `session`, `account`, `verification` — owned by BetterAuth.

The `user` table gains additional columns via Drizzle extension:

| Column               | Type   | Notes                                      |
| -------------------- | ------ | ------------------------------------------ |
| `github_oauth_token` | `text` | nullable — encrypted, for repo access      |
| `claude_oauth_token` | `text` | nullable — encrypted, for Max plan auth    |
| `claude_api_key`     | `text` | nullable — encrypted, alternative to OAuth |

---

## Indexes

| Index                           | Table               | Columns                           |
| ------------------------------- | ------------------- | --------------------------------- |
| `idx_tasks_project_layer`       | `tasks`             | `project_id, layer_index`         |
| `idx_tasks_status`              | `tasks`             | `project_id, layer_index, status` |
| `idx_logs_project`              | `logs`              | `project_id, created_at DESC`     |
| `idx_jobs_status`               | `jobs`              | `status, created_at`              |
| `idx_stack_entries_project`     | `stack_entries`     | `project_id`                      |
| `idx_specs_project_category`    | `specs`             | `project_id, category`            |
| `idx_atoms_project`             | `atoms`             | `project_id`                      |
| `idx_components_project`        | `components`        | `project_id`                      |
| `idx_pages_project`             | `pages`             | `project_id`                      |
| `idx_backend_atoms_project`     | `backend_atoms`     | `project_id, atom_type`           |
| `idx_checklist_project`         | `checklist`         | `project_id`                      |
| `idx_rules_user`                | `rules`             | `user_id`                         |
| `idx_discovery_answers_project` | `discovery_answers` | `project_id`                      |
| `idx_repo_files_project`        | `repo_files`        | `project_id, order`               |

---

## Atomization Principle

Every build artifact is a row. Agents query `SELECT * FROM <table> WHERE project_id = ?` to get what they need. No prose, no file reads. Frontend atoms resolve against global token tables via FK. Backend atoms use `atom_type` to discriminate data models from endpoints. Discovery facts live in `specs`. Layers are locked after human approval — agents can read locked layers but never write them.
