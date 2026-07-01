# Source Video Diary Workflow Inventory

版本：v0.1  
日期：2026-07-01  
来源：`/Users/macos/Documents/Joseph_garden/Joseph's garden/06_video-diary`

## 1. 扫描结论

源工作流当前版本是 `1.3.0`，不是普通文件夹模板，而是一套已经跑过真实视频日记的 Codex 工作流。

当前有效架构：

```text
Main Codex thread
-> Compliance Agent
-> Text Agent
-> Human recording
-> Video Agent
-> Compliance Agent
-> Publish / Log / Review
```

三个 Sub Agent：

| Agent | 源文件 | 核心职责 | 写入边界 |
| --- | --- | --- | --- |
| Compliance Agent | `.codex/agents/compliance-agent.md` | 入口/出口合规检视，返回 `pass / revise / block` | 默认只读，不改原始文本，不剪视频 |
| Text Agent | `.codex/agents/text-agent.md` | 原始想法、`01_inbox`、脚本生成/修订、语言风格 | `01_inbox/`、`02_scripts/`、短日志 |
| Video Agent | `.codex/agents/video-agent.md` | 封面、剪辑、字幕、导出、日志、`00_state` 统计 | `04_videos/`、`05_exports/`、`06_logs/`、`15_cover_gallery/`、`00_state/` |

Main thread 只做路由、参数确认、审核和简短反馈，不承载执行细节。

## 2. 版本演进

| 版本 | 源文件 | 核心变化 |
| --- | --- | --- |
| `1.0` | `08_workflows/video-diary-v1.md` | 跑通 `原始想法 -> 脚本 -> 录制 -> 字幕 MP4 -> 封面 -> 日志` |
| `1.1` | `08_workflows/video-diary-v1.1.md` | 先封面后剪辑、真实字幕、安全区、封面画廊、栏目目录 |
| `1.2` | `08_workflows/video-diary-v1.2.md` | Text / Video 双 Agent，新增 `00_state` 数据层 |
| `1.3` | `08_workflows/video-diary-v1.3.md` | 新增 Compliance Agent，入口和出口两次合规闸口 |

关键纠偏：`1.3` 的第三个 Agent 是 `Compliance Agent`，不是历史回询 Agent。历史回询应作为产品数据能力，不作为源工作流执行 Agent。

## 3. 日常执行流程

```text
01_inbox
-> Compliance Agent input review
-> Text Agent writes 02_scripts
-> user edits script manually
-> user records video
-> 03_recordings
-> Video Agent cover first
-> user confirms cover
-> Video Agent edit / subtitle / export / stats
-> Compliance Agent output review
-> publish pack + log + state ledger
```

硬规则：

- 每一段都要用户明确推进，不能自动跨阶段。
- `01_inbox` 是原始证据层，不摘要、不润色、不覆盖。
- 封面优先于正式剪辑，除非用户明确跳过。
- 字幕来自真实转写，脚本文案只做提词器。
- 默认不加 BGM。
- 原始视频不覆盖、不移动。
- 禁止批量删除。
- 月度统计只读 `00_state/production-stats.csv`，不从媒体文件反推。

## 4. 文件夹模型

| 路径 | 作用 | Owner |
| --- | --- | --- |
| `00_state/` | 长期结构化状态层：Day、内容、制作统计、发布台账 | Video Agent / Log |
| `01_inbox/` | 原始想法和口述证据 | Text Agent |
| `02_scripts/` | 提词器脚本 | Text Agent |
| `03_recordings/` | 手机导入原始口播视频 | Human |
| `04_videos/` | 自动剪辑工程、预处理、字幕、时间轴 | Video Agent |
| `05_exports/` | 最终发布包，视频和封面 | Video Agent |
| `06_logs/` | 日志、兼容台账、抖音数据、worker 状态 | Video Agent / Support tools |
| `08_workflows/` | 版本化工作流说明 | Human / Inspect docs |
| `09_tools/` | 旧自动化脚本层 | Support |
| `11_templates/` | 模板、BGM、关键词词库 | Support / Edit |
| `12_research/` | 工具和内容研究 | Reference |
| `15_cover_gallery/` | 封面版本归档 | Video Agent |
| `16_monthly_archive/` | 月度文本归档和媒体清单 | Monthly Review |
| `17_reports/` | 审计、状态、清理报告 | Audit / Support |

## 5. Skills 清单

| Skill | Agent / 层级 | 触发 | 抽出的产品方法 |
| --- | --- | --- | --- |
| `video-diary-orchestrator` | Main thread | 泛工作流请求、下一步、端到端路由 | `routeRequest`、`resolveColumnPath`、`enforceStageGate` |
| `video-diary-intake` | Text Agent | 记录原始想法、初始化日期 | `createDayWorkspace`、`appendRawIdea` |
| `video-diary-script` | Text Agent | 生成/修订口播脚本 | `generateTeleprompterScript`、`applyStyleMemory`、`checkOpeningRetention` |
| `video-diary-cover` | Video Agent | 封面候选、渲染、改版、归档 | `selectCoverRoute`、`renderCover`、`archiveCoverVersion` |
| `video-diary-edit` | Video Agent | 剪辑、字幕、裁片尾、导出 | `preprocessRecording`、`transcribeToSrt`、`correctTranscript`、`removeFillers`、`generateCaptionAssets`、`renderSubtitleOverlay`、`exportMp4` |
| `video-diary-log` | Video Agent | 记录耗时、token、发布、统计 | `recordProductionStats`、`updateDailyLog`、`mirrorLegacyLedger` |
| `video-diary-remote` | Support | 飞书移动端录入和脚本桥接 | `startRemoteWorker`、`syncRemoteIdea`、`syncRemoteScript` |
| `video-diary-cleanup` | Support | 日常清理、自检 | `generateCleanupReport`、`auditWorkflowDryRun` |
| `video-diary-monthly-review` | Support | 月末复盘、归档、扫描、单文件删除 | `buildMonthlyReview`、`scanVideoFiles`、`collectTextArchive`、`deleteOneVideoDryRun` |
| `video-diary-douyin` | Support | 抖音数据轮询和报告 | `pollDouyinMetrics`、`buildDouyinReport`、`analyzeOpeningRetention` |
| `video-diary-audit` | Support | 第三方工作流审计 | `scanOrphanScripts`、`scanNpmOrphans`、`scanDoubleSource`、`renderAuditReport` |

备注：当前 `.codex/skills/README.md` 仍只写 Text / Video，没有同步写入 Compliance；但 `video-diary-orchestrator`、`.codex/agents/README.md` 和 `08_workflows/video-diary-v1.3.md` 已经以三 Agent 为准。

## 6. 脚本方法层

### Text / Bootstrap

| 命令 | 源脚本 | 产品方法 |
| --- | --- | --- |
| `npm run new-day -- YYYY-MM-DD` | `09_tools/new-day.mjs` | 创建 inbox/script/recording/video/log 工作区，推断 Day 编号 |

### Cover

| 命令 | 源脚本 | 产品方法 |
| --- | --- | --- |
| `npm run cover:render` | `.codex/skills/video-diary-cover/scripts/render-cover.py` | 按 route 渲染封面 |
| `npm run archive-cover` | `.codex/skills/video-diary-cover/scripts/archive-cover.mjs` | 归档封面版本 |
| `npm run cover:gallery` | `.codex/skills/video-diary-cover/scripts/build-gallery-index.mjs` | 重建封面画廊索引 |

### Edit / Subtitle

| 命令 | 源脚本 | 产品方法 |
| --- | --- | --- |
| `subtitle:transcribe` | `transcribe-recording-to-srt.py` | Whisper 转写真实口播 |
| `subtitle:correct` | `correct-transcript.py` | 词库纠错 |
| `subtitle:remove-fillers` | `remove-filler-words.py` | 删除可安全隔离的语气词并重排字幕 |
| `subtitle:check` | `check-subtitle-srt.py` | 字幕长度和坏词检查 |
| `subtitle:assets` | `generate-video-diary-caption-assets.py` | 生成字幕 PNG / ASS / concat / filter 资产 |
| `subtitle:render` | `render-subtitle-overlay.py` | 透明字幕轨烧录到 MP4 |
| `video:add-pip` | `add-picture-in-picture.py` | 插入画中画素材 |
| `add-bgm` | `add-bgm.mjs` | 给成片加低音量 BGM |

### Log / State

| 命令 | 源脚本 | 产品方法 |
| --- | --- | --- |
| `record-production-stats.py` | `.codex/skills/video-diary-log/scripts/record-production-stats.py` | 写入 `00_state/production-stats.csv` 和兼容日志 |

### Support

| 命令 | 源脚本 | 产品方法 |
| --- | --- | --- |
| `monthly-review` | `monthly_review.py review` | 月度归档和统计 |
| `video:scan` | `monthly_review.py scan-video` | 扫描媒体文件清单 |
| `video:delete-one` | `monthly_review.py delete-one` | 单个明确视频文件 dry-run / confirmed delete |
| `morning-cleanup` | `09_tools/morning-cleanup.mjs` | 生成早晨清理报告 |
| `audit-workflow` | `09_tools/audit-workflow.mjs` | 生成工作流状态审计 |
| `douyin:login` | `09_tools/douyin-poll.mjs login` | 浏览器登录抖音 |
| `douyin:poll` | `09_tools/douyin-poll.mjs poll` | 拉取抖音数据 |
| `douyin:report` | `09_tools/douyin-report.mjs` | 生成抖音数据报告 |
| `go-out` / `come-back` | `09_tools/feishu-worker-control.mjs` | 控制飞书 worker 和 caffeinate |

## 7. 合规检视模型

Compliance Agent 有两个闸口：

| Gate | 输入 | 输出 |
| --- | --- | --- |
| Input Compliance Gate | `01_inbox` 原始口播或用户刚输入的 raw text | `pass / revise / block`、风险原句、最小改法、给 Text Agent 的 safe brief |
| Output Compliance Gate | `02_scripts`、真实字幕、时间轴、最终视频路径、平台反馈 | `pass / revise / block`、风险时间段、`rewrite / cut / mute / keep` 动作 |

当前抖音规则来自 `.codex/agents/references/platform-rules/douyin.md`：

- 降低下载、注册、购买、私聊、加群、跳转第三方平台等导流表达。
- 对具体 APP、课程、服务、工具只表达个人体验，不做强推荐。
- 避免绝对化效果承诺。
- 外部素材只保留必要引用，不做长段搬运。

产品化时应把 Compliance 输出建模成 `Gate`，而不是普通 `Step`：它可以阻断发布，也可以生成给 Video Agent 的最小重剪指令。

## 8. 数据层

`00_state` 是长期数据源：

| 文件 | 用途 |
| --- | --- |
| `day-counter.json` | Day 编号源 |
| `content-ledger.csv` | 跨栏目内容总账 |
| `production-stats.csv` | 制作统计主口径 |
| `publish-ledger.csv` | 发布状态、平台链接、发布时间 |

产品模型要保持一个原则：

```text
媒体文件可以被清理，结构化统计不能从媒体存在与否反推。
```

## 9. 产品化映射

最小产品模型：

```text
Workflow
WorkflowVersion
Run
Agent
Skill
Step
Gate
Artifact
LedgerEntry
```

三 Agent 映射：

| 源 Agent | 产品模块 |
| --- | --- |
| Compliance Agent | Compliance Gate / Risk Review |
| Text Agent | Script Workspace |
| Video Agent | Production Workspace |

Support skills 不进入主链路 UI，先作为后台工具或后续 Roadmap。

## 10. 已发现的不一致

| 位置 | 问题 | 产品处理 |
| --- | --- | --- |
| `PIPELINE.md` | 仍写“当前使用 2 个 Sub Agent” | 以 `.codex/agents/README.md` 和 `v1.3` 为准 |
| `.codex/skills/README.md` | Skills 总览未写 Compliance Agent | spec 记录为源文档未同步 |
| `09_tools/archive-month.mjs` | 旧月度归档路径仍存在 | 产品只采用 `monthly_review.py` |
| `06_logs/*.csv` | 仍作为兼容镜像存在 | 产品以 `00_state/*` 为 canonical |

## 11. ClipFlow 下一步

1. 把 `data/workflow-history.json` 的 `1.3` 改成 Compliance Agent 版本。
2. 给 `data/sample-run-day28.json` 增加 Compliance Gate：input gate 可为空，output gate 记录合规重剪。
3. Run Detail 页面右侧显示：WorkflowVersion、Compliance result、Artifacts、Known issues。
4. 不做拖拽编排，不把 support skills 做成主流程。
