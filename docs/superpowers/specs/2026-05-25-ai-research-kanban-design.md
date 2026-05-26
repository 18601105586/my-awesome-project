# AI 研发过程看板 - 设计文档

**日期**: 2026-05-25  
**基于**: OpenSpec `openspec/changes/ai-research-kanban/`

## 概述

将现有 Kanban 系统扩展为 AI 研发过程可视化工具，记录从需求提出到部署运行的完整研发流水线。

## 数据模型

### 核心表

| 表名 | 用途 |
|------|------|
| `ai_sessions` | 记录每次 AI 对话会话 |
| `skill_calls` | 记录 Skill 工具调用详情 |
| `artifacts` | 记录生成的文档/代码文件（含完整内容） |
| `pipeline_events` | 记录流水线事件（简化版，仅数据模型预留） |

### 关系

- `Task` ←→ `AISession`: 一个任务可以有多个会话
- `AISession` ←→ `SkillCall`: 一个会话可以有多个 Skill 调用
- `AISession` ←→ `Artifact`: 一个会话可以生成多个工件
- `Task` ←→ `Artifact`: 工件可以关联到任务

### Phase 字段说明

- `Task.phase`: 任务当前的研发阶段（requirement/design/implementation/testing/deployment）
- `AISession.phase`: 本次 AI 会话的目标阶段（记录历史）
- 创建 Session 关联 Task 时，可选更新 Task 的 phase

## API 设计

### Sessions

```
POST   /api/sessions              # 创建会话
GET    /api/sessions              # 列出会话（支持 ?phase= 过滤）
GET    /api/sessions/:id          # 获取会话详情
PUT    /api/sessions/:id          # 更新会话
DELETE /api/sessions/:id          # 删除会话
GET    /api/sessions/:id/skills   # 获取会话的 Skill 调用
GET    /api/tasks/:id/sessions    # 获取任务的会话
```

### Skill Calls

```
POST   /api/skill-calls           # 记录调用
GET    /api/skill-calls           # 列出调用（支持 ?sessionId=, ?skill= 过滤）
GET    /api/skill-calls/stats     # 获取使用统计
GET    /api/skill-calls/:id       # 获取调用详情
DELETE /api/skill-calls/:id       # 删除调用
```

### Artifacts

```
POST   /api/artifacts             # 创建工件（含 content）
GET    /api/artifacts             # 列出工件（不返回 content）
GET    /api/artifacts/:id         # 获取完整工件（含 content）
GET    /api/artifacts/:id/preview # 获取预览（仅元数据）
PUT    /api/artifacts/:id         # 更新工件
DELETE /api/artifacts/:id         # 删除工件
```

### Pipeline Events（简化）

```
POST   /api/webhooks/pipeline     # Webhook 端点（需认证）
GET    /api/pipeline-events       # 列出事件
GET    /api/pipeline-events/stats # 获取统计
```

## 前端组件

### 新增组件

| 组件 | 路径 | 职责 |
|------|------|------|
| `Timeline` | `components/Timeline/` | 时间线视图，支持 phase 过滤 |
| `SessionCard` | `components/SessionCard/` | 展示单个会话及其关联数据 |
| `StatsPanel` | `components/StatsPanel/` | 展示 phase 分布和 Skill 统计 |

### 视图切换

在 `App.tsx` 中添加视图切换按钮：
- **看板** - 现有 Kanban 功能
- **时间线** - 新时间线视图（包含 StatsPanel + Timeline）

## 实现顺序

1. 数据库模型（Prisma schema + 迁移）
2. 后端 API（Sessions → Skill Calls → Artifacts → Pipeline Events）
3. 前端组件（StatsPanel → Timeline → SessionCard）
4. 集成测试

## 备注

- Pipeline Events 模块简化实现，仅保留数据模型和基础 API，前端不实现相关 UI
- Artifact 的 content 字段存储完整内容，列表查询时不返回
