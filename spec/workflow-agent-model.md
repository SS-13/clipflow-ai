# ClipFlow Workflow Agent Model

版本：v0.3  
日期：2026-07-01  
来源：现有 `06_video-diary` Codex 工作流

## 1. 结论

当前源工作流是一个主线程加三个 Sub Agent 的管道系统：

```text
Main Codex Thread
  -> Compliance Agent
  -> Text Agent
  -> Video Agent
  -> Compliance Agent
```

`Compliance Agent` 是检视闸口，负责入口和出口合规检查；`Text Agent` 负责文字；`Video Agent` 负责视频生产。Skills 是阶段能力包，不等同于长期运行的 Agent。

产品化时保留这个模型：Dashboard 展示 `Run / Step / Artifact / Gate / WorkflowVersion`，第一版不做拖拽式 Agent 编排。

## 2. 当前 Sub Agent

| Agent | 源文件 | 职责 | 禁止事项 | 产品化角色 |
| --- | --- | --- | --- | --- |
| Main Thread | `.codex/agents/README.md` | 判断意图、确认日期/栏目/标题、路由任务、审核结果、给用户反馈 | 不承载具体执行细节 | Orchestrator |
| Compliance Agent | `.codex/agents/compliance-agent.md` | 入口/出口合规检视，返回 `pass / revise / block` | 不改原始文本，不生成脚本，不剪视频 | Compliance Gate |
| Text Agent | `.codex/agents/text-agent.md` | 原始想法、`01_inbox`、脚本生成/修改、语言风格 | 不碰视频、封面、字幕、导出、统计 | Script Workspace |
| Video Agent | `.codex/agents/video-agent.md` | 封面、剪辑、字幕、导出、日志、`00_state` 统计 | 不改原始想法，不重写脚本，不批量删除 | Production Workspace |

核心边界：

- `01_inbox` 是原始证据层，只能保留原话。
- Compliance Agent 默认只读，只给风险和最小处理建议。
- Text Agent 完成脚本后停止，不能自动进入剪辑。
- Video Agent 从“视频上传/开始剪辑”开始独占生产计时。
- 生产统计以 `00_state/production-stats.csv` 为准，不能月末从视频文件反推。

## 3. Skills 清单

| Skill | 所属 Agent / 层级 | 触发场景 | 主要输入 | 主要输出 |
| --- | --- | --- | --- | --- |
| `video-diary-orchestrator` | Main Thread | 泛工作流问题、下一步、端到端路由 | 用户意图、日期、栏目 | 选择下一个 Skill / Agent |
| `video-diary-intake` | Text Agent | 记录原始想法、初始化日期工作区 | 用户原话、日期 | `01_inbox/YYYY-MM-DD.md` |
| `video-diary-script` | Text Agent | 生成/修改提词器脚本 | `01_inbox`、语言习惯、两秒规则 | `02_scripts/YYYY-MM-DD.md` |
| `video-diary-cover` | Video Agent | 封面候选、封面改版、封面归档 | 视频帧、标题、栏目路线 | `05_exports/...cover.jpg`、`15_cover_gallery` |
| `video-diary-edit` | Video Agent | 开始剪辑、字幕、裁片尾、导出 | `02_scripts`、`03_recordings`、封面 | `04_videos`、`05_exports/...mp4` |
| `video-diary-log` | Video Agent | 记录耗时、token、发布、统计 | 成片路径、封面路径、耗时 | `06_logs`、`00_state/*.csv` |
| `video-diary-remote` | Support | 飞书移动端录入/脚本桥接 | 移动端消息、worker 状态 | `01_inbox`、`02_scripts`、worker log |
| `video-diary-cleanup` | Support | 日常清理、自检 | 日期、工作流目录 | 清理报告，不删除 |
| `video-diary-monthly-review` | Support | 月末复盘、归档、视频扫描、单文件删除 | 月份、生产台账 | `16_monthly_archive`、扫描清单 |
| `video-diary-douyin` | Support | 抖音数据轮询/报告 | 浏览器登录态、发布台账 | `00_state/publish-ledger.csv`、报告 |
| `video-diary-audit` | Support | 第三方工作流审计 | skills/scripts/templates/workflows | `17_reports/MiniMax-audit-*.md` |

MVP 主链路只需要前 6 个 skill，加上 Compliance Gate。Support skills 先进 Roadmap。

## 4. 当前执行流程

```text
0. 用户输入原始想法
   -> Compliance Agent input review

1. 记录原始想法
   Text Agent + video-diary-intake
   -> 01_inbox/YYYY-MM-DD.md

2. 用户明确说生成脚本
   Text Agent + video-diary-script
   -> 02_scripts/YYYY-MM-DD.md
   -> 01_inbox 录制状态更新为 已生成脚本

3. 用户录制并上传视频
   Human
   -> 03_recordings/YYYY-MM-DD/

4. 用户明确说开始剪辑
   Main Thread 路由给 Video Agent

5. Cover first
   Video Agent + video-diary-cover
   -> 抽帧 / 候选 / 用户确认
   -> 05_exports/...cover.jpg
   -> 15_cover_gallery/YYYY-MM-DD/

6. Edit second
   Video Agent + video-diary-edit
   -> 检查开头
   -> 裁掉片尾黑屏/水印
   -> 真实转写字幕
   -> 字幕纠错
   -> 清理可安全隔离的语气词
   -> 渲染字幕
   -> 05_exports/...video-diary.mp4

7. Log immediately
   Video Agent + video-diary-log
   -> 06_logs/YYYY-MM-DD.md
   -> 00_state/production-stats.csv
   -> 00_state/content-ledger.csv

8. 发布前合规检视
   -> Compliance Agent output review
   -> pass / revise / block
```

## 5. Gate 模型

| Gate | 进入条件 | 退出条件 |
| --- | --- | --- |
| Input Compliance Gate | 用户给出原始想法 | `pass / revise / block` 和 safe brief |
| Intake Gate | 合规未阻断，用户确认记录 | 原话写入 `01_inbox` |
| Script Gate | 用户明确说生成脚本 | `02_scripts` 可直接复制到提词器 |
| Recording Gate | 用户上传录制文件 | `03_recordings` 有素材 |
| Cover Gate | 视频上传且需要封面 | 用户确认最终封面 |
| Edit Gate | 封面已确认或用户跳过封面 | 最终 MP4 出现在 `05_exports` |
| Log Gate | MP4 和封面存在 | `06_logs` 与 `00_state` 已记录 |
| Output Compliance Gate | 发布前 | `publish_ready=true/false` |

状态枚举沿用 PRD：

```text
pending
running
waiting_user
succeeded
failed
canceled
```

合规结果不要做成状态，放在 `Gate.result`：

```json
{
  "status": "succeeded",
  "result": "revise",
  "risks": [
    {
      "level": "P1",
      "time": "02:14-02:58",
      "reason": "possible third-party app promotion",
      "action": "cut"
    }
  ]
}
```

## 6. 数据模型映射

### Agent

```json
{
  "id": "compliance-agent",
  "name": "Compliance Agent",
  "scope": "input and output compliance review",
  "readOnlyByDefault": true,
  "forbidden": ["rewrite raw thoughts", "generate scripts", "edit videos", "delete files"]
}
```

### Skill

```json
{
  "id": "video-diary-edit",
  "agentId": "video-agent",
  "stage": "edit",
  "inputs": ["02_scripts/YYYY-MM-DD.md", "03_recordings/YYYY-MM-DD/", "confirmed cover"],
  "outputs": ["04_videos/YYYY-MM-DD/", "05_exports/YYYY-MM-DD/*.mp4"],
  "methods": ["preprocessRecording", "transcribeToSrt", "correctTranscript", "removeFillers", "renderSubtitleOverlay"]
}
```

### WorkflowVersion

```json
{
  "id": "workflow_version_1_3",
  "workflowId": "video-diary-v1",
  "version": "1.3.0",
  "title": "Compliance Agent and platform review gates",
  "changes": ["add Compliance Agent", "add input/output compliance gates"],
  "knownLimits": ["platform rules are still manually maintained references"]
}
```

### Gate

```json
{
  "id": "output-compliance",
  "runId": "run_2026_06_30_day28",
  "agentId": "compliance-agent",
  "type": "compliance_review",
  "status": "succeeded",
  "result": "revise",
  "publishReady": false
}
```

## 7. 文件归属模型

| 路径 | 类型 | Owner | 产品含义 |
| --- | --- | --- | --- |
| `01_inbox/` | markdown | Text Agent | Raw Thought |
| `02_scripts/` | markdown | Text Agent | Script |
| `03_recordings/` | media | Human | Recording Input |
| `04_videos/` | workspace | Video Agent | Working Artifacts |
| `05_exports/` | media/image | Video Agent | Publish Pack |
| `06_logs/` | markdown/csv | Video Agent | Run Log |
| `00_state/` | csv/json | Video Agent | Structured Ledger |
| `data/workflow-history.json` | json | Product | Version History |
| `15_cover_gallery/` | image/md | Video Agent | Cover Versions |
| `16_monthly_archive/` | markdown/csv | Monthly Review | Archive |
| `17_reports/` | markdown | Audit | Workflow Reports |

## 8. 产品化取舍

保留：

- 三个 Sub Agent：Compliance / Text / Video。
- Skills 作为 Step 的执行能力。
- Compliance 作为 Gate，而不是普通内容生产 Step。
- 每阶段手动确认。
- Artifact 追踪。
- `00_state` 作为结构化记录来源。
- `workflow-history.json` 作为版本演进记录来源。

暂不做：

- 旧 4-agent 架构。
- 拖拽式工作流编排。
- 自动监听目录并跨阶段执行。
- 多账号、多用户、多项目协作。
- 批量删除或自动清理视频文件。

## 9. MVP 页面映射

| 页面 | 展示内容 | 数据来源 |
| --- | --- | --- |
| Dashboard | 最近 Runs、状态、待用户动作 | `Run`、`Step`、`Gate` |
| Run Detail | 时间线、Step 输入输出、Artifacts、错误、合规结果 | `Run`、`Step`、`Artifact`、`Gate` |
| Script Workspace | 原始想法、合规提示、生成脚本、修改记录 | Compliance Gate + Text Agent Steps |
| Production Workspace | 封面、字幕、成片、日志 | Video Agent Steps |
| Workflow History | 版本演进、历史追问、下一版建议 | `WorkflowVersion` |
| Settings | 本地路径、模型 Provider、默认栏目、平台规则 | app config |

最小可开发切片：

```text
读取 data/sample-run-day28.json
-> 渲染一个 Run Detail
-> 左侧 Step Timeline
-> 中间 Step I/O
-> 右侧 Artifacts + Compliance Gates + Issues + Workflow Version
```

## 10. 下一步

1. 把 `data/sample-run-day28.json` 补上 `agentId`、`skillId`、`gates` 字段。
2. 给 Day28 添加 output compliance gate，记录合规重剪。
3. 做一个只读 Run Detail 页面。
4. 暂不接模型，先验证用户能否看懂一次完整链路。
