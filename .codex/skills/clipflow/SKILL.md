---
name: clipflow
description: ClipFlow project entry skill. Use when Codex is asked to plan, build, refactor, test, audit, or explain ClipFlow product code, especially tasks involving the video workflow platform, PRD, Next.js App Router pages, Run/Step/Gate/Artifact data, dashboard, gallery, metrics snapshots, project rules, or choosing a more specific ClipFlow skill.
---

# ClipFlow

Use this as the first skill for ClipFlow work. Route to a narrower skill when possible.

## Read First

Read only the files needed for the task:

- Product intent: `docs/ClipFlow-PRD.md`
- Project rules: `AGENTS.md`
- Data model: `spec/workflow-agent-model.md`
- Source workflow: `spec/source-video-diary-workflow-inventory.md`
- Tech index: `docs/tech/README.md`

Do not load full course documents unless the task is specifically about learning or changing rules.

## Routing

- Page, route, component, dashboard, gallery, metrics, workflow UI: use `clipflow-feature`.
- Run, Step, Gate, Artifact, dashboard JSON, gallery JSON, metrics snapshot data: use `clipflow-data-model`.
- Tests, checks, regression validation, browser verification: use `clipflow-test`.
- Architecture, PRD, Roadmap, rules, Skills, Agents, hooks: stay in this skill and update durable docs.
- Audit or review of existing code: use `.codex/agents/clipflow-review-agent.md` as the review frame.

## Default Workflow

1. Confirm which checkout is authoritative for the task.
   - Design docs usually live in this branch.
   - Current UI implementation may live at `/Users/macos/Workspaces/AI/makesense/clipflow-ai/`.
2. Read the narrow source files.
3. State the smallest useful slice.
4. Make the minimal change.
5. Run the smallest relevant check.
6. Report skipped scope and when to add it.

## Hard Limits

- Do not batch delete files.
- Do not add a database until JSON/Markdown is insufficient.
- Do not add new dependencies for simple local JSON or UI work.
- Do not turn Compliance Agent into a production Step.
- Do not merge feature and refactor work in one change.
