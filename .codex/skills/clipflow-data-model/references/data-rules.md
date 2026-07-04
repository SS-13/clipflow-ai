# ClipFlow Data Rules

## IDs

- Run: `run_YYYY_MM_DD_dayNN`
- Step: `step_<stage>`
- Gate: `gate_<stage>`
- Artifact: `artifact_<name>`
- Workflow version: `workflow_version_X_Y`

## Status

Execution status:

- `pending`
- `running`
- `waiting_user`
- `succeeded`
- `failed`
- `canceled`

Gate result:

- `pass`
- `revise`
- `block`

## Metrics

- Missing platform metrics are `null`.
- `0` means the platform reported zero.
- Screenshot path or manual note must exist for verified metrics.

## Source Priority

1. `spec/workflow-agent-model.md`
2. `spec/source-video-diary-workflow-inventory.md`
3. `docs/ClipFlow-PRD.md`
4. `data/*.json`
