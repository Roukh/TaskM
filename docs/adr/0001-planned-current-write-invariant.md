# ADR 0001 — PLANNED/CURRENT Write Domain Invariant

**Status:** Accepted  
**Date:** 2026-05-26

## Decision

PLANNED state and CURRENT state have mutually exclusive write domains:

- **PLANNED** is written only by human intent or LLM intent — via the canvas UI or MCP tools (`plan_node`, `plan_edge`). The AST scanner never touches PLANNED.
- **CURRENT** is written only by the AST scanner — via the git hook → `POST /api/sync` pipeline. No LLM, no UI action, no MCP tool writes CURRENT directly.

## Context

TaskM maintains two parallel representations of a codebase: what is *intended* (PLANNED) and what *actually exists* (CURRENT). The delta between them is the agent's work queue.

If both could be written by the same actors, the delta would become meaningless — an agent could "complete" a task by writing CURRENT directly rather than writing real code. Similarly, if the scanner wrote PLANNED, human intent would be overwritten by code reality.

## Consequences

- The MCP server exposes **write tools for PLANNED only** (`plan_node`, `plan_edge`, `add_memri`). There is no `set_current_node` tool.
- The `/api/sync` endpoint is the **only** write path for CURRENT. It requires a project API key (not a session cookie) and is called only by the scanner.
- Canvas UI edits are PLANNED-only. CURRENT nodes on the canvas are rendered but not editable.
- To "undo" a CURRENT state change, you revert code and re-commit — the scanner reconciles automatically.
