# ClipFlow

[English](README.md)

ClipFlow 是一套 AI Agent 视频日记工作流，用来把原始想法变成可发布的短视频日记。

它不是完整剪辑器。第一版只做一件事：把一次视频日记从想法、脚本、录制、字幕、封面、导出到日志的过程变得可见、可复用、可追踪。

## 为什么做

很多人愿意表达，但每天重复制作视频很累：

- 零散想法要整理成能说出口的脚本
- AI 改写容易不像自己
- 字幕、粗剪、封面和发布包整理很耗时
- 每次做完很难复盘到底哪里花了时间

ClipFlow 把这些动作变成一次可检查的 Agent Run。

## MVP

v0.1 的范围是静态 Agent Run Dashboard 数据模型：

- `Workflow`：可复用的视频日记流程
- `WorkflowVersion`：工作流版本演进记录
- `Run`：一次流程执行
- `Step`：每个 Agent 或人工检查点
- `Artifact`：脚本、录制视频、字幕、封面、成片、日志

样例数据在 [data/sample-run-day28.json](/Users/macos/Workspaces/AI/makesense/clipflow-ai/data/sample-run-day28.json)。

第一个公开样例说明在 [docs/day28-sample-breakdown.md](/Users/macos/Workspaces/AI/makesense/clipflow-ai/docs/day28-sample-breakdown.md)。

当前工作流建模在 [spec/workflow-agent-model.md](/Users/macos/Workspaces/AI/makesense/clipflow-ai/spec/workflow-agent-model.md)。

版本演进数据在 [data/workflow-history.json](/Users/macos/Workspaces/AI/makesense/clipflow-ai/data/workflow-history.json)。

## 样例 Run

`2026-06-30 Day 28` 展示了一条真实视频日记链路：

```text
原始想法
-> 可口播脚本
-> 手机录制
-> 字幕纠错
-> 粗剪
-> 封面版本
-> 合规重剪
-> 生产日志
```

最终产物：

- 视频：`05_exports/2026-06-30/2026-06-30_Day28_video-diary_compliance-cut.mp4`
- 封面：`05_exports/2026-06-30/2026-06-30_Day28_cover.jpg`
- 状态：`succeeded`

## 当前 Agent 模型

第一版保留最小模型：

```text
Main Thread
  -> Compliance Agent
  -> Text Agent
  -> Video Agent
```

- `Compliance Agent`：入口/出口合规检视，标出平台风险和最小处理建议。
- `Text Agent`：处理原始想法、脚本、语言风格。
- `Video Agent`：处理封面、字幕、剪辑、导出、日志和统计。
- `Skills`：作为每个 Step 的执行能力，不作为常驻 Agent。

## Roadmap

### v0.1

- 静态 README
- Run / Step / Artifact 数据模型
- 一个公开样例 Run

### v0.2

- Script Agent 接入
- 可编辑脚本工作区
- 从脚本修改中沉淀 Style Memory

### v0.3

- 字幕处理
- 基础视频处理
- 发布包整理

### v0.4

- Cover Agent
- 封面偏好记忆
- 封面版本对比

## 免责声明

ClipFlow 是一个开源工作流工具。用户需要自行负责内容、模型使用、平台合规、隐私和版权风险。
