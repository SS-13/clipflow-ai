# ClipFlow AI 共建基础

版本：v0.1  
日期：2026-07-04

## 目标

让 AI 在 ClipFlow 项目里写代码时，先按项目规则、产品模型和 Next.js / React 19 最佳实践工作，而不是每次重新解释上下文。

## 当前结构

```text
AGENTS.md                         # 全局项目规则
.codex/skills/clipflow            # 总入口 Skill
.codex/skills/clipflow-feature    # 页面和组件 Skill
.codex/skills/clipflow-data-model # 数据模型 Skill
.codex/skills/clipflow-test       # 最小验证 Skill
.codex/agents/clipflow-review-agent.md # 检视 Agent
.codex/hooks/README.md            # hooks 候选清单
docs/ClipFlow-PRD.md              # 产品需求
docs/tech/README.md               # 技术资料索引
```

## Skill 路由

| 任务 | 使用 |
| --- | --- |
| 不确定该怎么做 | `clipflow` |
| 创建页面、组件、交互 | `clipflow-feature` |
| 修改 Run / Step / Gate / Artifact / JSON | `clipflow-data-model` |
| 单元测试、lint、页面验证 | `clipflow-test` |
| 代码检视、架构检视 | `.codex/agents/clipflow-review-agent.md` |

## Rules 分层

- `AGENTS.md`：长期稳定规则。
- Skill：某类任务的执行方法。
- Agent：某个角色的检查视角。
- Hook：自动化检查，当前只记录候选，不强制。

## 先不做

- 不创建大量细碎 Skill。
- 不上新测试框架。
- 不做自动阻塞型 hooks。
- 不把课程全集塞进每个 Skill。

## 下一步

1. 用这 4 个 Skill 跑一次真实页面改动。
2. 观察哪个 Skill 太宽或太窄。
3. 再决定是否增加 `clipflow-cover-gallery`、`clipflow-metrics`、`clipflow-create-flow`。
