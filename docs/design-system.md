# TaskM — Design System

_Last updated: 2026-05-26_

## Stack

**Status: Planned**

Tailwind CSS 4 + shadcn/ui (Radix UI). No custom component library. React Flow node/edge components use Tailwind classes for styling.

## Color Tokens (Semantic)

**Status: Planned**

| Token | Purpose |
|---|---|
| `--planned` | Blue — PLANNED status nodes/badges |
| `--current` | Green — CURRENT status nodes/badges |
| `--deprecated` | Red — DEPRECATED status nodes/badges |
| `--calls-edge` | Neutral — calls relation edges |
| `--imports-edge` | Blue — imports relation edges |
| `--mutates-edge` | Orange — mutates relation edges |
| `--enforces-edge` | Purple — enforces (MemRI) relation edges |

## Node Visual Grammar

**Status: Planned**

- `PLANNED` nodes: dashed border, 60% opacity background, blue status badge
- `CURRENT` nodes: solid border, full opacity, green status badge
- `DEPRECATED` nodes: red border, strikethrough label, red status badge

## Typography

**Status: Planned**

System font stack. Node labels: 12px/14px monospace for code entity names. UI chrome: sans-serif.

## UX Micro-Patterns

**Status: Planned**

| Category | Pattern |
|---|---|
| Loading states | Skeleton placeholders for node list; spinner on layout computation |
| Empty states | Canvas empty state with two CTAs: "Scan repo" or "Draw manually" |
| Errors | Toast notifications (Sonner) for sync failures, scan errors |
| Confirmations | Inline confirmation for DEPRECATED node deletion |
| Keyboard shortcuts | `Space` to fit view, `Cmd+L` to re-layout, `Escape` to deselect |
| Accessibility | All interactive nodes keyboard-focusable; status communicated via aria-label not color alone |
