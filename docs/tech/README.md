# ClipFlow Tech Docs

这个目录放的是项目重构前的技术资料库。

## 资料入口

- [NextJS 实战进阶指南](./nextjs-实战进阶指南.md)
- [React 19+](./react-19-plus.md)
- [架构师思维下的 AI 编程实践](./架构师思维下的-ai-编程实践.md)
- [HyperFrames AGENTS 样例](./HyperFrames-AGENTS样例.md)

## 学习顺序

1. 先读 `架构师思维下的 AI 编程实践` 的工作流部分，明确怎么让 AI 参与项目规划、开发、重构和代码接手。
2. 再读 `NextJS 实战进阶指南` 的 App Router、RSC、缓存、鉴权、项目结构和部署章节，确定 ClipFlow 的产品技术底座。
3. 最后读 `React 19+` 的架构思维、Hook 数据流和组件设计章节，用来收敛前端组件边界。

## ClipFlow 重构索引

| 要解决的问题 | 优先阅读 | 用在 ClipFlow 的位置 |
| --- | --- | --- |
| 项目先怎么分析，不急着乱重构 | `架构师思维下的 AI 编程实践`：31 项目现状分析、30 代码理解与接手 | 先整理现有 `mvp/`、`data/`、`spec/` 的边界 |
| AI 怎么参与开发流程 | `架构师思维下的 AI 编程实践`：24 工作流总论、25 工具选型与项目配置、26 新功能开发 | 建立 Codex 分支 / worktree / PR 的日常协作流程 |
| 怎么把需求拆成小步 | `架构师思维下的 AI 编程实践`：26 新功能开发、28 代码重构 | 把视频日记流程拆成 Run Detail、Create Run、Workflow History 等切片 |
| 怎么设计 Next.js 路由 | `NextJS 实战进阶指南`：12 路由设计原则、13 App Router、18 路由分组、19 动态路由 | `/runs/[runId]`、`/workflows/[workflowId]`、`/settings` |
| Server Component 和 Client Component 怎么分 | `NextJS 实战进阶指南`：03 React Server Components、09 use client、25 RSC、26 客户端组件 | 静态数据读取放服务端，表单/step 操作放客户端 |
| 怎么减少不必要的 useEffect | `NextJS 实战进阶指南`：10 初始化与更新分离、11 代码写法技巧汇总 | Run 数据读取、表单初始化、状态派生 |
| 数据缓存和刷新怎么想 | `NextJS 实战进阶指南`：27 ISR、30 fetch 的缓存配置、31 各版本缓存策略对比 | 后续 Run 列表、Workflow Version、历史查询 |
| 登录和权限怎么设计 | `NextJS 实战进阶指南`：40 GitHub OAuth、41 登录数据库设计、46 中间件鉴权、51 统一前置鉴权 | 多用户分享、私有工作流、发布前权限 |
| 项目结构怎么定 | `NextJS 实战进阶指南`：38 项目结构设计、23 模块结构 | `app/`、`features/`、`lib/`、`data/`、`spec/` 的边界 |
| 组件怎么拆 | `React 19+`：10 组件拆分原则、11 解耦与嵌套、19 子组件数据解耦、23 子组件单独维护状态 | Step Timeline、Artifact Panel、Gate Panel、Create Flow |
| 数据请求怎么组织 | `React 19+`：15 多接口并行、16 多接口前后依赖、17 数据缓存、21 接口更新频率不一致 | Run、Artifacts、WorkflowVersion、Gate 的组合读取 |
| 常用 UI 组件怎么沉淀 | `React 19+`：27 Button、28 Modal、29 Drawer、30 Dialog、36 Pagination、37 Skeleton | 后续设计系统和表单交互 |
| Skills 怎么参与代码创建 | `架构师思维下的 AI 编程实践`：15 skill、16 使用 Claude Code 创建 Skill、17 Skill 的命中问题 | 后续沉淀 `clipflow-route`、`clipflow-run-model`、`clipflow-ui-panel` 等项目技能 |

## 设计决策候选

### 技术选型

- Next.js App Router 作为主框架。
- Server Component 负责读取样例数据、版本历史、只读详情。
- Client Component 负责创建视频日记、表单编辑、步骤推进、人工确认。
- 先用本地 JSON / Markdown 建模，等流程稳定后再考虑数据库。

### 项目结构

```text
mvp/src/app/                 # 页面路由
mvp/src/features/            # 按业务功能组织组件
mvp/src/lib/                 # 通用读写、格式化、校验
data/                        # 样例 Run 和 workflow history
spec/                        # 产品模型和工作流建模
docs/tech/                   # 技术资料和设计依据
```

### Skills 使用方向

- 用 Skill 固定“读现有代码 -> 找边界 -> 小步实现 -> 验证”的开发流程。
- Skill 不直接替代业务代码，只沉淀重复工作方法。
- 每个 Skill 的描述要语义清晰，避免多个 Skill 抢同一个任务。
- 先沉淀少量高频 Skill，再根据真实开发过程扩展。

## 后续产物

- `docs/design-plan/TECH_STACK.md`：技术选型。
- `docs/design-plan/ARCHITECTURE.md`：目录结构与模块边界。
- `docs/design-plan/SKILLS.md`：项目内 Skills 创建和使用规范。
- `docs/design-plan/ROADMAP.md`：从 Day28 demo 到可创建工作流 demo 的切片计划。
