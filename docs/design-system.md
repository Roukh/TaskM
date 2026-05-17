# TaskM — Design System

_Last updated: 2026-05-17_

## Typography

**Status: Implemented**

| Token         | Value                                          |
| ------------- | ---------------------------------------------- |
| `--font-sans` | Geist Sans (Google Fonts, `--font-geist-sans`) |
| `--font-mono` | Geist Mono (Google Fonts, `--font-geist-mono`) |

Geist Mono used for: project type labels, layer index labels, timestamps.

---

## Color Tokens (OKLCH)

**Status: Implemented**

### Light mode (`:root`)

| Token                | Value                        | Usage                    |
| -------------------- | ---------------------------- | ------------------------ |
| `--background`       | `oklch(1 0 0)`               | Page background          |
| `--foreground`       | `oklch(0.141 0.005 285.823)` | Primary text             |
| `--primary`          | `oklch(0.21 0.006 285.885)`  | Primary actions          |
| `--muted`            | `oklch(0.967 0.001 286.375)` | Subtle backgrounds       |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | Secondary text           |
| `--border`           | `oklch(0.92 0.004 286.32)`   | Dividers, card borders   |
| `--sidebar`          | `oklch(0.985 0 0)`           | Sidebar background       |
| `--container`        | `#fff`                       | Content panel background |
| `--radius`           | `0.625rem`                   | Border radius            |
| `--destructive`      | `oklch(0.577 0.245 27.325)`  | Destructive actions      |

### Dark mode (`.dark`)

Default theme. `ThemeProvider` sets `defaultTheme="dark"`.

| Token                | Value                        |
| -------------------- | ---------------------------- |
| `--background`       | `oklch(0.141 0.005 285.823)` |
| `--foreground`       | `oklch(0.985 0 0)`           |
| `--muted`            | `oklch(0.274 0.006 286.033)` |
| `--muted-foreground` | `oklch(0.705 0.015 286.067)` |

---

## Semantic Color Usage

**Status: Implemented**

| Semantic          | Color            | Uses                                           |
| ----------------- | ---------------- | ---------------------------------------------- |
| not-started       | muted/grey       | Layer borders, state badges, icons             |
| in-progress       | yellow-500       | Layer borders, spinners, priority icons (high) |
| complete          | green-500        | Layer borders, checkmarks, state badges        |
| blocked           | red-500          | Layer borders, XCircle icons                   |
| urgent priority   | red-500          | AlertCircle priority icon                      |
| high priority     | orange-500       | ChevronUp priority icon                        |
| medium priority   | yellow-500       | Minus priority icon                            |
| low priority      | muted-foreground | ChevronDown priority icon                      |
| log: layer_start  | blue-500         | PlayCircle icon                                |
| log: spec_written | purple-500       | FileText icon                                  |

---

## Layout

**Status: Implemented**

- Desktop: `lg:p-2` outer padding, content panel has `lg:border lg:rounded-md`
- Sidebar: collapsible (offcanvas), `SidebarProvider` via shadcn/ui
- Content height: `calc(100svh - Npx)` — N=80 (two headers), N=40 (one header)
- Grid: layer cards use `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`

---

## UX Micro-Patterns

Reference: `skills/roukh-skill/UX-CHECKLIST.md`

### 1. Loading States

**Status: Planned**

- Sub-1s: no indicator
- 1–2s: spinner acceptable for component loads
- Full-page loads: skeleton screen mirroring page structure
- Layer grid load: skeleton with 7 card placeholders
- In-progress layers already use `Loader2 animate-spin` as a layer state icon (not a loading indicator)
- `prefers-reduced-motion`: replace spin with opacity pulse

### 2. Empty States

**Status: Implemented (partial)**

Current empty states:

- Layer grid: "No layers found for this project. Run taskm init to set up layers." ✓
- Logs list: "No logs yet for this project. Events are written here as the build progresses." ✓

Both satisfy the three-part rule: what the space is for + why empty + what to do.

Planned: project list empty state (no projects yet).

### 3. Error States

**Status: Planned**

- Toast via `sonner` (already in layout) for recoverable errors
- Auth errors: persistent inline, never toast
- 404: `app/not-found.tsx` exists; needs a CTA back to `/projects`
- Form validation: on-blur, inline below fields (planned for new project form)

### 4. Tooltips & Popovers

**Status: Not applicable (current scope)**

No tooltips currently in the codebase. When added: hover + focus trigger, 0.5s show delay, Escape dismisses.

### 5. Transitions & Animation

**Status: Implemented (partial)**

- Sidebar collapsible: shadcn/ui handles expand/collapse animation
- Layer card hover: `hover:bg-card/80 transition-colors` (150ms)
- Project row hover: `hover:bg-sidebar/50`
- ChevronRight rotation: `group-data-[state=open]/collapsible:rotate-90` with `duration-200`
- Loader2: `animate-spin` for in-progress layer state

`prefers-reduced-motion`: not yet explicitly implemented — add when Motion animations are introduced.

### 6. Forms

**Status: Planned**

New project form (planned):

- Validate on blur
- Zod schema validation (already installed)
- Required fields marked with \* + legend
- Error text inline below each field

### 7. Data Tables & Lists

**Status: Implemented**

- Projects list: flat list, no pagination needed at current scale
- Logs list: newest-first, no pagination yet (planned: load-more when > 100 entries)
- Layer tasks: flat list; no sorting UI yet
- Table headers: sticky top-0 z-10 for all lists

No infinite scroll — load-more preferred when volume requires pagination.

### 8. Modals & Overlays

**Status: Planned**

New project creation: modal dialog (not full page). Focus trap + Escape dismiss + return focus to trigger.

Confirmation dialogs for destructive actions (e.g., delete project): action-specific button labels, never pre-select destructive option.

### 9. Navigation

**Status: Implemented**

- Active state: `isActive` prop on `SidebarMenuButton`/`SidebarMenuSubButton` — uses both background and font weight change via shadcn/ui
- Breadcrumbs: current page is final item, visually distinct (font-medium), not linked ✓
- Sidebar auto-expands active project via `defaultOpen={isProjectActive}` ✓
- Every route is deep-linkable ✓

### 10. Feedback Patterns

**Status: Planned**

- `Toaster` (sonner) already mounted in `app/layout.tsx`
- Success toasts: 4–5s, bottom-right (sonner default)
- Destructive confirmations: modal with action-specific labels (planned)
- Undo: planned for task status changes
