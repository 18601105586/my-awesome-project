## Context

现有的看板系统是一个基础的 Kanban 应用，使用 Node.js + Express + Prisma + SQLite 技术栈，支持列和任务的基本 CRUD 操作，以及拖拽功能。

现在需要将其改造为展示 AI 研发过程的可视化工具，核心是记录和管理 AI 辅助研发的各个阶段、Skill 工具调用、生成的文档/代码等。

## Goals / Non-Goals

**Goals:**
- 扩展数据模型，支持记录 AI 会话、Skill 调用、生成的工件
- 实现研发阶段的分类管理（需求、设计、研发、测试、部署）
- 提供 API 用于记录和查询 AI 研发过程数据
- 前端展示研发时间线和 Skill 使用统计
- 支持 Webhook 接收外部事件（如代码提交、构建结果）

**Non-Goals:**
- 不实现真实的自动化流水线（这是演示/展示用途）
- 不集成真实的 CI/CD 系统
- 不进行复杂的权限管理（单用户场景）
- 不实现实时协作功能

## Decisions

### 1. 数据模型设计

**决策**: 在现有 Column/Task 基础上，新增以下表：

| 表名 | 用途 |
|------|------|
| `ai_sessions` | 记录每次 AI 对话会话 |
| `skill_calls` | 记录 Skill 工具调用详情 |
| `artifacts` | 记录生成的文档/代码文件 |
| `pipeline_events` | 记录流水线事件（模拟 CI/CD） |

**理由**:
- 保持现有 Kanban 功能不变，作为"任务管理"层
- 新增表作为"研发过程记录"层，通过 `task_id` 关联
- 这样既能保留原有功能，又能扩展 AI 研发展示能力

### 2. 研发阶段映射

**决策**: 使用 Task 的 `type` 字段或标签来区分研发阶段：

| 阶段 | 标识 | 对应 Skill 示例 |
|------|------|----------------|
| 需求提出 | `requirement` | `brainstorming`, `to-prd` |
| 方案设计 | `design` | `planner`, `architect`, `outline` |
| 编码实现 | `implementation` | `tdd`, `execute-plan`, `codex` |
| 测试验证 | `testing` | `code-review`, `e2e-testing`, `verify` |
| 部署运行 | `deployment` | `ship`, `land-and-deploy`, `canary` |

**理由**:
- 利用现有 Task 模型，最小化数据模型变更
- 前端可通过过滤/颜色区分不同阶段

### 3. API 设计

**决策**: 新增以下 API 端点：

```
GET    /api/sessions           - 列出所有 AI 会话
POST   /api/sessions           - 创建新会话
GET    /api/sessions/:id       - 获取会话详情
GET    /api/sessions/:id/skills - 获取会话中的 Skill 调用

GET    /api/artifacts          - 列出所有工件
POST   /api/artifacts          - 创建工件记录
GET    /api/artifacts/:id      - 获取工件详情

POST   /api/webhooks/pipeline  - Webhook 端点接收流水线事件
```

**理由**:
- RESTful 风格，与现有 API 保持一致
- 端点清晰，易于前端调用

### 4. 前端展示

**决策**: 新增以下视图：

1. **时间线视图** - 按时间顺序展示所有研发活动
2. **Skill 统计** - 展示各 Skill 的使用频率
3. **阶段分布** - 展示任务在各研发阶段的分布

**理由**:
- 时间线是展示过程的最佳方式
- 统计图表直观展示 AI 使用情况

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 数据量增长导致性能下降 | 添加适当索引，考虑分页查询 |
| 前端复杂度增加 | 分阶段实现，先核心后增强 |
| Webhook 安全性 | 添加简单的 token 验证 |
| 与现有功能冲突 | 保持现有 API 不变，新增端点独立 |

## Migration Plan

1. **数据库迁移**: 运行 Prisma migration 创建新表
2. **后端部署**: 部署新 API 端点，向后兼容旧端点
3. **前端部署**: 渐进式更新，先添加时间线视图
4. **数据迁移**: 现有任务自动标记为 `implementation` 阶段

## Open Questions

1. 是否需要持久化 AI 对话的完整内容，还是只记录元数据？
2. Webhook 是否需要支持多个外部源（GitHub、GitLab 等）？
3. 是否需要导出功能（如生成 PDF 报告）？
