# CLAUDE.md — TaskM

## Docs update rule

After every code change that affects routes, components, schema, auth, or integrations, update the relevant `docs/` file before finishing the task.

| Change type                          | Update target                              |
| ------------------------------------ | ------------------------------------------ |
| New/modified route or page           | `docs/ux-flows.md`, `docs/architecture.md` |
| New/modified component               | `docs/components.md`                       |
| Schema or DB table change            | `docs/data-model.md`                       |
| Auth change                          | `docs/auth.md`                             |
| New/modified API route or action     | `docs/api.md`                              |
| New integration or env var           | `docs/integrations.md`                     |
| Design token or design system change | `docs/design-system.md`                    |

Every section in every doc must carry a `**Status:**` marker: `Implemented`, `Planned`, `In Progress`, or `Deprecated`.
