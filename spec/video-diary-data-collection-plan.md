# Video Diary Data Collection Plan

版本：v0.1  
日期：2026-07-03  
范围：`06_video-diary` 的数据收集、结构化台账和月度复盘口径

## 1. 目标

这份方案的目标不是多记，而是把视频日记工作流里真正有长期价值的数据沉到固定位置，后续可以：

1. 回看每条内容从输入到发布的完整链路。
2. 统计每个月的制作时长、视频时长、发布时间、token 和产物路径。
3. 区分“媒体文件”与“结构化数据”，避免磁盘清理后统计口径丢失。
4. 支持后续产品化时直接读取 `00_state`，而不是从散落日志里猜。

## 2. 现有数据分层

当前工作流里的数据层可以分成四类：

1. 原始输入层：`01_inbox/`
2. 生产过程层：`02_scripts/`、`03_recordings/`、`04_videos/`、`05_exports/`
3. 结构化状态层：`00_state/`
4. 兼容日志层：`06_logs/`

其中 `00_state/` 是长期主口径，`06_logs/` 只做历史兼容和运行日志。

## 3. `00_state` 的主表

### `day-counter.json`

用途：Day 编号的源头。

规则：

- Day 号不能从录制文件数推断。
- 月末清理媒体文件后，Day 编号仍然要连续。
- 新建内容时先读它，再生成当日工作区和台账主键。

### `content-ledger.csv`

用途：每条内容的总账。

当前适合记录的字段：

- `content_id`
- `date`
- `column`
- `day_label`
- `title`
- `status`
- `inbox_ref`
- `script_ref`
- `recording_ref`
- `workspace_ref`
- `export_ref`
- `cover_ref`
- `published_at`
- `douyin_url`
- `notes`

它负责回答“这条内容有哪些文件、最后走到哪一步、有没有发布”。

### `production-stats.csv`

用途：制作统计主口径。

这是月报和年报的第一数据源，不能从媒体是否还存在反推。

当前适合记录的字段：

- `content_id`
- `date`
- `column`
- `day_label`
- `title`
- `video_path`
- `cover_path`
- `video_duration_seconds`
- `video_duration_text`
- `production_started_at`
- `production_finished_at`
- `production_total_minutes`
- `production_total_text`
- `estimated_tokens`
- `export_file_size_bytes`
- `notes`
- `updated_at`

### `publish-ledger.csv`

用途：发布分析和平台回溯。

当前适合记录的字段：

- `date`
- `day_label`
- `topic`
- `status`
- `published_at`
- `video_path`
- `cover_path`
- `video_duration`
- `manual_minutes`
- `total_elapsed`
- `reported_tokens`
- `estimated_tokens`
- `codex_visible_tokens`
- `douyin_url`
- `notes`

它负责回答“什么时候发的、发到哪里、消耗多少、是否有发布反馈”。

## 4. 生产过程中的采集点

### 输入时

采集：

- 日期
- 标题
- 原始想法或口播稿
- 栏目类型

写入：

- `01_inbox/YYYY-MM-DD.md`
- `content-ledger.csv`

### 脚本完成时

采集：

- 脚本路径
- 脚本版本
- 合规结果
- 是否需要人工改稿

写入：

- `02_scripts/YYYY-MM-DD.md`
- `content-ledger.csv`

### 录制完成时

采集：

- 原始录制文件名
- 是否有多个 take
- 视频目录

写入：

- `03_recordings/YYYY-MM-DD/`
- `content-ledger.csv`

### 剪辑完成时

采集：

- 视频时长
- 成片路径
- 封面路径
- 制作开始和结束时间
- 制作总时长
- 估算 token

写入：

- `04_videos/YYYY-MM-DD/`
- `05_exports/YYYY-MM-DD/`
- `00_state/production-stats.csv`
- `06_logs/YYYY-MM-DD.md`
- `content-ledger.csv`

### 发布时

采集：

- 发布时间
- 平台链接
- 发布标题
- 发布封面版本
- 用户报告 token

写入：

- `00_state/publish-ledger.csv`
- `06_logs/`

## 5. 日志层的角色

`06_logs/` 不作为长期统计主口径，只做：

- 每日运行记录
- worker 状态
- 抖音轮询结果
- 审计报告
- 兼容旧表

它能丢部分历史运行痕迹，但不能丢 `00_state` 的结构化总账。

## 6. 月度复盘口径

月度复盘按这个优先级读数据：

1. `00_state/production-stats.csv`
2. `00_state/publish-ledger.csv`
3. `06_logs/*.md`
4. 媒体文件目录

原因很简单：

- 媒体文件会被清理。
- 日志可能缺行。
- `00_state` 是稳定统计源。

月报重点看：

- 每条视频时长
- 每条制作总时长
- 平均制作成本
- 发布情况
- 是否有异常重剪

## 7. 现有方案整理

你现在这套方案可以概括成一句话：

> 用 `01_inbox -> 02_scripts -> 03_recordings -> 04_videos / 05_exports -> 06_logs -> 00_state` 的顺序，把每条视频从原始想法、脚本、录制、剪辑、发布到统计全部落盘。

其中最关键的不是文件多，而是这三条线要分开：

1. 原始内容线：`01_inbox`、`02_scripts`
2. 生产产物线：`03_recordings`、`04_videos`、`05_exports`
3. 结构化统计线：`00_state`

## 8. 建议的最小收集原则

- 只收一次，不重复猜。
- 能从 `00_state` 读出的，不再从媒体目录反推。
- 媒体可以删，统计不能断。
- 每个步骤都只写自己该写的那一层。

## 9. 后续可补的内容

如果要继续补强，这份方案下一步可以扩成：

- `content-ledger` 的字段定义说明
- `production-stats` 的汇总规则
- `publish-ledger` 和抖音回写规则
- 每日日志模板和月报模板的映射表

## 10. 平台数据快照补充

平台播放量、点赞、评论、收藏等增长数据不进入 `00_state` 的制作主表，也不从平台实时抓取。

第一版把它定义为“月度平台数据快照”：

- 月末复盘前，用户为本月视频上传平台截图或手动录入数据。
- 系统通过 OCR 或人工校对整理成结构化快照。
- Dashboard 和月度汇总读取快照展示增长表现。
- 缺失数据展示为 `待录入平台快照`，不能用 `0` 代替。

详细计划见：

```text
spec/platform-metrics-snapshot-plan.md
```
