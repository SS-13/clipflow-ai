# ClipFlow Hooks

This folder documents project checks that should become hooks later.

Current state: documentation only. Do not block commits automatically yet.

## Pre-Edit Check

- Read `AGENTS.md`.
- Read only the relevant `spec/`, `data/`, route, or PRD file.
- Confirm whether the task belongs to design branch or `nextjs` implementation branch.

## Pre-Commit Check

Run the smallest relevant checks:

```bash
cd mvp
npm run lint
```

If JSON changed:

```bash
node -e "JSON.parse(require('fs').readFileSync('../data/sample-run-day28.json','utf8'))"
```

## Hook Candidates

- Validate all `data/*.json` parses.
- Run `npm run lint` when `mvp/src/**/*.ts*` changes.
- Reject accidental `rm -rf` scripts.
- Warn when a TSX page uses `"use client"` at the top without forms or local interaction.
