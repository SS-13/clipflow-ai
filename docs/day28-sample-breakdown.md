# Day 28 Sample Breakdown

This sample turns one real video diary run into public product data.

The goal is not to publish private notes. The goal is to show how ClipFlow tracks a human-in-the-loop agent workflow.

## Source

- content date: `2026-06-30`
- production time: `2026-07-01 00:08-01:20 +08:00`
- video number: `Day 28`
- final duration: `223.57s`
- final status: `succeeded`

## Workflow

```text
idea -> script -> recording -> subtitle -> cover -> export -> log
```

## Step Breakdown

| Step | Owner | Status | Input | Output |
| --- | --- | --- | --- | --- |
| idea | Idea Agent | succeeded | Raw spoken thought | One selected topic |
| script | Script Agent | succeeded | Raw thought and style memory | 2-3 minute teleprompter script |
| recording | Human | succeeded | Script | Phone recording |
| subtitle | Video Processing Agent | succeeded | Recording | Corrected subtitles and overlay |
| cover | Cover Agent | succeeded | Title and topic | Two candidates, one final cover |
| export | Video Processing Agent | succeeded | Trimmed video, subtitles, cover | Final compliance-cut video |
| log | Log Agent | succeeded | Run artifacts and notes | Production log and ledgers |

## Public Artifacts

These paths are product-facing examples. They are relative paths from the local video diary workspace:

- `01_inbox/2026-06-30.md`
- `02_scripts/2026-06-30.md`
- `03_recordings/2026-06-30/Detail_20260701004614.MP4`
- `04_videos/2026-06-30/subtitles/2026-06-30_transcribed_corrected.srt`
- `04_videos/2026-06-30/TOPIC_TIMELINE.md`
- `05_exports/2026-06-30/2026-06-30_Day28_video-diary_compliance-cut.mp4`
- `05_exports/2026-06-30/2026-06-30_Day28_cover.jpg`
- `06_logs/2026-06-30.md`

## Product Lessons

1. A run needs both `contentDate` and production timestamps because daily videos can be made after midnight.
2. Compliance edits should be tracked as explicit workflow events, not hidden in a filename.
3. The dashboard should show artifacts per step so users know what they can inspect or reuse.
4. A failed helper command should not fail the whole run if the final video, cover, and log were produced.

## Next Dashboard Slice

The smallest useful UI is one read-only run detail page:

- top: run title, status, content date, duration
- left: step timeline
- middle: selected step input and output
- right: artifacts and known issues

Skipped for v0.1: drag-and-drop workflow editing, cloud accounts, automatic publishing, and advanced video editing.
