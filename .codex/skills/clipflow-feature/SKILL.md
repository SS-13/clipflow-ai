---
name: clipflow-feature
description: Build or change ClipFlow Next.js App Router UI. Use when Codex needs to create or modify pages, routes, workflow interactions, dashboard panels, gallery views, metrics views, Run Detail UI, or reusable React components in the ClipFlow MVP.
---

# ClipFlow Feature

Use this for user-facing UI code.

## Read First

- `AGENTS.md`
- `docs/ClipFlow-PRD.md`
- Existing route being changed under `mvp/src/app/`
- Relevant data file under `data/`
- `references/frontend-rules.md`

## Implementation Rules

1. Use Next.js App Router.
2. Keep pages Server Components by default.
3. Add `"use client"` only for forms, local interaction, timers, browser APIs, or user-driven state.
4. Read static JSON in Server Components using Node `fs` or a shared server-only helper.
5. Keep Client Components as leaf components when possible.
6. Name components by product concept:
   - `StepTimeline`
   - `StepDetail`
   - `GatePanel`
   - `ArtifactList`
   - `CoverGallery`
   - `MetricsSnapshotTable`
7. Keep route-private components near the route until reuse is real.
8. Use existing dependencies only: Next, React, lucide-react, Tailwind/shadcn helpers already present.
9. Use native controls first: `input[type=date]`, file input, buttons, tables.

## UI Constraints

- Dashboard surfaces must be dense, scan-friendly, and operational.
- Do not create a marketing landing page.
- Do not nest cards inside cards.
- Text must fit on mobile and desktop.
- Use icons for commands when they improve scanning.
- Do not add decorative gradient blobs or one-off visual systems.

## Done

- Relevant route still renders.
- `npm run lint` from `mvp/` passes when available.
- If behavior changed, use `clipflow-test` for one minimal check.
