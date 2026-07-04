---
name: clipflow-test
description: Add or run the smallest useful validation for ClipFlow changes. Use when Codex needs tests, lint checks, browser checks, JSON validation, regression checks, or a verification plan for Next.js pages, workflow branching, data transforms, or bug fixes.
---

# ClipFlow Test

Use this to keep validation small and real.

## Read First

- `mvp/package.json`
- Changed files
- `references/test-rules.md`

## Test Ladder

Stop at the first check that proves the change:

1. Static data changed: parse the JSON.
2. Types or TSX changed: run `npm run lint` in `mvp/`.
3. Page changed: open the affected route and verify the visible contract.
4. Branching logic changed: add one assert-based self-check or one small test file if the project already has a test runner.
5. Bug fixed: reproduce the failing path, then verify the fix and one sibling path.

## Current Commands

From `mvp/`:

```bash
npm run lint
npm run build
```

Use `npm run build` only when route/data boundaries changed or lint is insufficient.

## Browser Checks

For UI changes, verify only affected pages:

- `/`
- `/create`
- `/gallery`
- `/metrics/snapshots`
- `/runs/run_2026_06_30_day28`

Do not click every page unless navigation or layout changed globally.

## Done

- Report exactly what ran.
- If a check cannot run, report the blocker.
- Do not add a new test framework unless explicitly requested.
