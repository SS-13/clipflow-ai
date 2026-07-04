# AGENTS.md

## 项目定位

ClipFlow 是把个人视频日记制作流程产品化的项目。

它不是通用视频剪辑器，第一阶段只解决一件事：把已经跑通的 Codex 视频工作流，变成可视化、可复用、可分享、可迭代的产品。

核心目标：

- 创建一条新的视频日记工作流 Run。
- 让用户看到每个 Step 的输入、输出、状态和产物。
- 在关键节点保留人工确认。
- 把合规检视、脚本生成、封面确认、剪辑导出、数据归档建模成稳定产品能力。
- 让后续 Agent 和 Skill 可以基于明确规则扩展，而不是靠临时对话堆上下文。

## AI 架构师职责

本项目里的 AI 架构师不是“让 AI 一次性写完整产品”，而是负责把需求、工程、Agent、Skill、数据和验证闭环管理起来。

AI 架构师要做：

- 定义边界：判断什么属于产品主链路，什么只是后台工具或后续 Roadmap。
- 控制上下文：每次只读取和当前任务相关的文件，避免把课程、spec、代码、样例数据全部塞进同一轮。
- 建立模型：把真实工作流抽象成 `Workflow / WorkflowVersion / Run / Step / Gate / Artifact / Agent / Skill`。
- 拆小切片：把需求拆成可运行、可验证、可回滚的小任务。
- 维护数据契约：先稳定 JSON / Markdown 数据结构，再考虑数据库和真实 AI 执行。
- 设计验证闭环：每个功能必须知道如何验证，不允许只生成代码不检查。
- 沉淀规则：把重复流程写入 `AGENTS.md`、`spec/`、`docs/design-plan/` 或项目 Skill。
- 做取舍：优先保留主流程可用性，延后拖拽编排、多用户、多账号、自动化执行等复杂能力。

AI 架构师不做：

- 不用 AI 输出替代工程判断。
- 不把“能跑”当成“设计正确”。
- 不为了完整性一次性引入数据库、队列、权限系统、真实 Agent 调度。
- 不把所有规则都写进一个巨大 Prompt。
- 不让多个 Skill 语义重叠，导致命中混乱。

## 从课程中学到的工作方法

`docs/tech/架构师思维下的-ai-编程实践-全集.md` 对本项目最重要的结论：

- AI 输出是概率结果，越长的上下文越容易稀释重点。
- 资深工程师的价值在于定义问题、判断方案、控制边界和验证结果。
- Rules 适合放稳定的项目全局约束。
- Skill 适合封装重复、明确、可触发的任务流程。
- 新功能开发要按“做什么 / 看什么上下文 / 怎么验证”拆分。
- Bug 修复一次只修一个问题，先定位根因再改。
- 重构要分离行为变化和结构移动。
- 从零搭建项目时，AI 做体力活，人做架构决策。
- 接手项目时，先跑起来、扫结构、找入口、看数据流，再下结论。

落到 ClipFlow：

- `AGENTS.md` 保存长期稳定规则。
- `spec/` 保存产品模型和源工作流事实。
- `docs/tech/` 保存学习资料，不直接作为每次开发上下文。
- `docs/design-plan/` 后续保存技术选型、架构设计、Skill 设计和 Roadmap。
- 项目 Skill 只在流程稳定后创建，不提前泛化。

## 当前工程扫描

当前仓库已经有这些核心材料：

- `spec/workflow-agent-model.md`：产品化后的 Agent / Skill / Step / Gate / Artifact 模型。
- `spec/source-video-diary-workflow-inventory.md`：从真实 `06_video-diary` 工作流抽出的源事实。
- `data/sample-run-day28.json`：Day 28 的 Run Detail 样例数据。
- `data/workflow-history.json`：工作流版本演进数据。
- `docs/tech/README.md`：三门技术课程的学习索引。
- `docs/tech/*-全集.md`：三门课程的全量合并资料。
- `mvp/`：Next.js demo，当前展示 Day 28 的 Step Timeline / I/O / Artifact / Workflow Version / Gate。

当前工程还不是完整产品，处于“设计规划 + MVP Demo”阶段。

已明确的产品事实：

- 源工作流有三个 Sub Agent：`Compliance Agent`、`Text Agent`、`Video Agent`。
- `Compliance Agent` 是 `Gate`，不是生产 `Step`。
- 历史回询是产品能力，不是源工作流里的第四个 Sub Agent。
- Support skills 暂不进入主链路 UI。
- 本地 JSON / Markdown 是当前数据源。
- 数据库、真实 Agent 执行、多人协作、拖拽编排都延后。

## Source Of Truth

优先级从高到低：

1. `spec/workflow-agent-model.md`
2. `spec/source-video-diary-workflow-inventory.md`
3. `data/workflow-history.json`
4. `data/sample-run-day28.json`
5. `docs/tech/README.md`
6. `docs/tech/*-全集.md`

开发时不要直接依赖记忆判断工作流细节。先读 source of truth。

如果 `docs/tech/` 的课程建议和 `spec/` 的产品模型冲突，以 `spec/` 为准。

## Domain Model

这些命名必须稳定使用：

- `Workflow`：可复用的视频日记工作流定义。
- `WorkflowVersion`：工作流版本演进记录。
- `Run`：一次工作流执行。
- `Step`：Run 内一个具体生产阶段。
- `Gate`：检查或审批节点，例如合规检视、人工确认。
- `Artifact`：输入或产出的文件，例如脚本、字幕、封面、成片、日志。
- `Agent`：产品角色，例如 Compliance / Text / Video。
- `Skill`：可复用能力包，不等于长期运行的 Agent。

不要随意改名。需要新增概念时，先更新 `spec/`。

## Workflow Boundary

产品主流程：

```text
raw input
-> input compliance gate
-> script draft
-> human script revision
-> recording
-> cover generation
-> cover confirmation
-> edit / subtitle / export
-> production log
-> output compliance gate
-> archive
```

主流程 Agent 边界：

| Agent | 角色 | 允许做 | 禁止做 |
| --- | --- | --- | --- |
| `Compliance Agent` | 合规闸口 | 输入/输出检视，返回 `pass / revise / block` | 改原始文本、生成脚本、剪视频、删除文件 |
| `Text Agent` | 文本生产 | 原始想法入库、脚本生成、脚本修订 | 处理视频、封面、字幕、导出、统计 |
| `Video Agent` | 视频生产 | 封面、字幕、剪辑、导出、日志、状态记录 | 改原始想法、重写脚本、批量删除 |

## Data Rules

- 先用本地 JSON / Markdown。
- 不新增数据库，除非 Run 创建、历史查询、多人协作已经需要它。
- ID 要稳定、可读、可追踪：
  - `run_YYYY_MM_DD_dayNN`
  - `step_<stage>`
  - `gate_<stage>`
  - `artifact_<name>`
  - `workflow_version_X_Y`
- `status` 只表示执行状态：
  - `pending`
  - `running`
  - `waiting_user`
  - `succeeded`
  - `failed`
  - `canceled`
- 合规结果放在 `Gate.result`，不要混进 `status`。
- `Gate.result` 只允许：
  - `pass`
  - `revise`
  - `block`
- 保留 `contentDate`、`startedAt`、`endedAt` 的区别。
- Artifact 必须挂到生产它的 Step。
- 不从媒体文件是否存在反推长期统计，统计口径以结构化数据为准。

## Next.js Rules

- 使用 App Router。
- Server Components 负责读取静态 JSON、workflow history、只读详情数据。
- Client Components 负责表单、步骤推进、人工确认、本地交互状态。
- 能在 Server Component 初始化的数据，不用 `useEffect` 初始化。
- 路由语义优先：
  - `/runs/[runId]`
  - `/workflows/[workflowId]`
  - `/workflow-history`
  - `/settings`
- 新页面先从 demo 数据跑通，再抽象数据读取层。
- 不为了“未来可能需要”提前引入后端、数据库、队列或状态机库。

## Component Rules

组件优先按产品概念命名，而不是按视觉布局命名。

推荐命名：

- `StepTimeline`
- `StepDetail`
- `ArtifactList`
- `GatePanel`
- `WorkflowVersionPanel`
- `CreateRunFlow`
- `ScriptWorkspace`
- `ProductionWorkspace`

组件规则：

- 业务组件先放在对应 route 或 feature 附近。
- 至少出现两处真实复用，再抽成通用组件。
- 不创建过早的 generic wrapper。
- Dashboard UI 要务实、密集、可扫描。
- 可以使用 lucide 图标增强识别。
- 不做营销式首页，除非用户明确要求。
- 不把卡片套卡片。

## File Organization

当前推荐方向：

```text
mvp/src/app/                 # routes
mvp/src/features/            # product features
mvp/src/lib/                 # shared utilities
data/                        # sample workflow data
spec/                        # product and source workflow models
docs/tech/                   # reference material
docs/design-plan/            # future design decisions
```

不要为了匹配目录结构而移动现有文件。新增代码时逐步靠近这个结构。

## Skill Design Rules

Skill 的作用是保存重复工作方法，不是替代产品代码。

可以创建 Skill 的条件：

- 同类任务已经重复出现。
- 输入、输出、验证方式都清楚。
- Skill 描述能明确命中，不会和其他 Skill 抢任务。
- 规则足够稳定，不是一次性想法。

候选项目 Skill：

- `clipflow-run-model`：创建或更新 `Run / Step / Gate / Artifact` 数据。
- `clipflow-route`：按既有数据模型新增 App Router 页面。
- `clipflow-ui-panel`：新增 dashboard 风格面板。
- `clipflow-workflow-demo`：新增一个可交互的工作流切片。
- `clipflow-design-plan`：把需求沉淀为技术选型、架构方案和 Roadmap。

Skill 规则：

- 数量要少。
- 描述要具体。
- 高风险任务优先显式触发。
- 不把多个模糊场景塞进一个 Skill。
- 不让 Skill 直接持有全量课程资料。

## Project AI Surface

当前项目级 AI 共建入口：

- `.codex/skills/clipflow/SKILL.md`：总入口和任务路由。
- `.codex/skills/clipflow-feature/SKILL.md`：创建或修改 Next.js 页面、组件、交互。
- `.codex/skills/clipflow-data-model/SKILL.md`：修改 Run / Step / Gate / Artifact / Dashboard / Gallery / Metrics 数据。
- `.codex/skills/clipflow-test/SKILL.md`：最小验证、lint、页面检查、回归检查。
- `.codex/agents/clipflow-builder-agent.md`：写代码时使用的工程 Agent 框架。
- `.codex/agents/clipflow-review-agent.md`：检视代码、数据和架构漂移的 Agent 框架。
- `.codex/hooks/README.md`：后续 hooks 候选清单，目前只做文档，不自动阻塞。

使用原则：

- 不确定任务归属时先读 `clipflow`。
- 写功能用 Builder Agent，审查用 Review Agent。
- 先使用现有 4 个 Skill；真实开发中出现重复痛点后，再增加更细 Skill。
- hooks 先不启用自动化，避免早期误拦截。

## Change Process

新功能：

1. 读相关 `spec/`、数据文件和当前 route。
2. 写清楚最小可见切片。
3. 只改当前切片需要的数据结构。
4. 实现 route / component / lib。
5. 跑最小验证。

Bug：

1. 先复现或定位异常路径。
2. 一次只修一个 bug。
3. 找共享根因，不只修表象。
4. 加最小验证。

重构：

1. 不混合行为变化和文件移动。
2. 一次只移动或抽取一个边界。
3. 每步后验证。
4. 保持 diff 可审查。

设计规划：

1. 先扫描现状。
2. 标出事实、假设和未决策项。
3. 给出小步 Roadmap。
4. 写入 `docs/design-plan/`，不要只留在聊天里。

## Git Rules

- `main` 保持稳定。
- 设计分支使用 `codex/design-plan`。
- 功能分支可使用：
  - `codex/workflow-demo`
  - `codex/run-model`
  - `codex/create-run-flow`
- 不提交无关未跟踪目录，例如临时复制的 `mvp/`，除非用户明确要求。
- 不批量删除文件或目录。
- 不合并设计分支，除非用户明确确认。

## Current Simplifications

- 先用 JSON 和 Markdown。
- 先做可交互 demo，不接真实 AI 执行。
- Agent 执行可以先模拟。
- Compliance 先建模为 Gate。
- Workflow History 先读结构化 JSON。
- 创建工作流先做单用户、本地路径版本。

## Definition Of Done

一次改动完成前，至少满足：

- 相关 source of truth 已读。
- 改动范围和任务一致。
- 数据模型命名没有漂移。
- 没有引入无关依赖。
- 没有批量删除。
- 能运行的检查已经运行；不能运行要说明原因。
- 结果写入仓库文件，而不是只在聊天里解释。
