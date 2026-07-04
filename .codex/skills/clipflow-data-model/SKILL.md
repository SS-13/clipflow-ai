---
name: clipflow-data-model
description: Create, update, or review ClipFlow data contracts. Use when Codex changes Run, Step, Gate, Artifact, Agent, Skill, WorkflowVersion, dashboard sample data, cover gallery data, platform metrics snapshots, or JSON/Markdown source-of-truth mappings.
---

# ClipFlow Data Model

Use this before changing `data/` or model-facing UI.

## Read First

- `spec/workflow-agent-model.md`
- `spec/source-video-diary-workflow-inventory.md`
- `docs/ClipFlow-PRD.md`
- Relevant `data/*.json`
- `references/data-rules.md`

## Model Rules

- Keep these product names stable:
  - `Workflow`
  - `WorkflowVersion`
  - `Run`
  - `Step`
  - `Gate`
  - `Artifact`
  - `Agent`
  - `Skill`
  - `CoverGalleryItem`
  - `PlatformMetricsSnapshot`
- `Compliance Agent` output is a `Gate`, not a production `Step`.
- `status` is execution state only.
- `Gate.result` is one of `pass`, `revise`, `block`.
- Missing platform metrics are `null`, never `0`.
- Artifacts belong to the Step that produced them.
- Keep media paths as paths; do not inline media into JSON.

## Change Workflow

1. Identify the UI question the data must answer.
2. Extend the smallest relevant sample JSON.
3. Keep IDs stable and readable.
4. Update affected docs if a model term changes.
5. Add one minimal validation check when shape logic is non-trivial.

## Done

- JSON parses.
- Existing pages using the data still render.
- Model names match `spec/`.
