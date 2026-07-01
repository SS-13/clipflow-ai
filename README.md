# ClipFlow

[中文说明](README.zh-CN.md)

ClipFlow is an AI agent workflow for turning raw thoughts into short-form video diaries.

It is not a full video editor. The first version focuses on one thing: make the workflow visible and repeatable from idea to script, recording, subtitles, cover, export, and log.

## Why

Many people can record ideas, but the repeated production work is tiring:

- turning loose thoughts into a speakable script
- keeping the script close to the user's own voice
- processing subtitles and rough cuts
- choosing a cover
- keeping a run log for later improvement

ClipFlow turns that into an agent run that can be inspected, shared, and improved.

## MVP

The v0.1 scope is a static agent run dashboard data model:

- `Workflow`: the reusable video diary workflow
- `WorkflowVersion`: workflow history and version evolution
- `Run`: one execution of the workflow
- `Step`: each agent or human checkpoint
- `Artifact`: scripts, recordings, subtitles, cover files, exported videos, and logs

Example data lives in [data/sample-run-day28.json](/Users/macos/Workspaces/AI/makesense/clipflow-ai/data/sample-run-day28.json).

The first public sample is documented in [docs/day28-sample-breakdown.md](/Users/macos/Workspaces/AI/makesense/clipflow-ai/docs/day28-sample-breakdown.md).

Workflow history lives in [data/workflow-history.json](/Users/macos/Workspaces/AI/makesense/clipflow-ai/data/workflow-history.json).

## Example Run

`2026-06-30 Day 28` shows a real video diary workflow:

```text
raw thought
-> speakable script
-> phone recording
-> subtitle correction
-> rough cut
-> cover version
-> compliance cut
-> production log
```

Final output:

- video: `05_exports/2026-06-30/2026-06-30_Day28_video-diary_compliance-cut.mp4`
- cover: `05_exports/2026-06-30/2026-06-30_Day28_cover.jpg`
- status: `succeeded`

## Agent Model

The current source workflow uses three Sub Agents:

```text
Main Thread
  -> Compliance Agent
  -> Text Agent
  -> Video Agent
```

- `Compliance Agent`: reviews input and output for platform risk.
- `Text Agent`: handles raw thoughts, scripts, and speaking style.
- `Video Agent`: handles cover, subtitles, editing, export, logs, and stats.

## Roadmap

### v0.1

- static README
- Run / Step / Artifact data model
- one public sample run

### v0.2

- Script Agent integration
- editable script workspace
- Style Memory from script revisions
- Compliance Agent for input and output review

### v0.3

- subtitle processing
- basic video processing
- export package organization

### v0.4

- Cover Agent
- cover preference memory
- cover version comparison

## Disclaimer

This project is provided as an open-source workflow tool. Users are responsible for their own content, model usage, platform compliance, privacy, and copyright risks.
