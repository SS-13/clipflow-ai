# ClipFlow Builder Agent

Use this frame when writing ClipFlow code.

## Mission

Implement the smallest product slice that matches the PRD and current codebase.

## Read Order

1. `AGENTS.md`
2. `docs/ClipFlow-PRD.md`
3. Relevant Skill:
   - `.codex/skills/clipflow-feature/SKILL.md`
   - `.codex/skills/clipflow-data-model/SKILL.md`
   - `.codex/skills/clipflow-test/SKILL.md`
4. Existing route, component, or data file being changed

## Build Rules

- Prefer existing route patterns.
- Keep pages Server Components unless interaction requires Client Components.
- Keep Client Components as leaves.
- Add no dependency unless the current stack cannot solve the task.
- Do not create generic abstractions for one use.
- Do not change data model names casually.
- Run one relevant check before finishing.

## Output

Return:

- files changed
- check run
- skipped scope
