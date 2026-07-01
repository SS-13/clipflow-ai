# Video Diary Workflow Version Evolution

来源：`06_video-diary` Codex 工作流  
当前版本：`1.3.0`

## Version Timeline

| Version | Workflow Change | Product Meaning |
| --- | --- | --- |
| `1.0` | Raw idea -> script -> recording -> subtitle video -> cover -> log | First complete human-in-the-loop publishing path |
| `1.1` | Cover-first flow, safe subtitle area, real subtitles, cover gallery, column paths | Stabilized viewer-facing quality and repeatable artifacts |
| `1.2` | Split into Text Agent and Video Agent; added `00_state` as durable data layer | Main thread stays light; monthly stats do not depend on media files still existing |
| `1.3` | Added Compliance Agent before script generation and before publish, with platform-rule references | Compliance becomes explicit gates, not hidden edits |

## Current Agent Flow

```text
Main Codex Thread
-> Compliance Agent
-> Text Agent
-> Human edit and recording
-> Video Agent
-> Compliance Agent
-> Publish
```

## Current Gates

| Gate | Owner | Purpose |
| --- | --- | --- |
| Input Compliance Gate | Compliance Agent | Review raw spoken text before script generation |
| Script Gate | Text Agent | Turn approved raw material into a speakable script |
| Cover Gate | Video Agent + Human | Produce cover candidates before full video editing |
| Edit Gate | Video Agent | Subtitle, trim, export, and record production stats |
| Output Compliance Gate | Compliance Agent | Review final subtitles/timeline/video before publish |

## Platform Rule References

```text
.codex/agents/references/platform-rules/README.md
.codex/agents/references/platform-rules/douyin.md
```

For ClipFlow-AI, model these as `Reference` artifacts attached to Compliance Gates.

## MVP Product Hint

Do not build a platform-policy engine yet. The current useful model is:

```text
Run -> Step -> Gate -> Artifact -> Reference
```

Compliance is a gate with a reference file and a result:

```text
pass | revise | block
```
