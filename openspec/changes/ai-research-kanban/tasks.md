## 1. 数据库模型扩展

- [ ] 1.1 更新 Prisma schema，添加 `ai_sessions` 表
- [ ] 1.2 更新 Prisma schema，添加 `skill_calls` 表
- [ ] 1.3 更新 Prisma schema，添加 `artifacts` 表
- [ ] 1.4 更新 Prisma schema，添加 `pipeline_events` 表
- [ ] 1.5 运行 `npx prisma migrate dev` 创建数据库迁移
- [ ] 1.6 运行 `npx prisma generate` 生成 Prisma Client

## 2. 后端 - AI Sessions API

- [ ] 2.1 创建 `src/controllers/sessions.ts` 实现 CRUD 控制器
- [ ] 2.2 创建 `src/routes/sessions.ts` 定义路由
- [ ] 2.3 在 `src/index.ts` 中注册 sessions 路由
- [ ] 2.4 实现 `/api/sessions` GET/POST 端点
- [ ] 2.5 实现 `/api/sessions/:id` GET/PUT/DELETE 端点
- [ ] 2.6 实现 `/api/sessions/:id/skills` GET 端点
- [ ] 2.7 实现 `/api/tasks/:id/sessions` GET 端点

## 3. 后端 - Skill Calls API

- [ ] 3.1 创建 `src/controllers/skill-calls.ts` 实现控制器
- [ ] 3.2 创建 `src/routes/skill-calls.ts` 定义路由
- [ ] 3.3 在 `src/index.ts` 中注册 skill-calls 路由
- [ ] 3.4 实现 `/api/skill-calls` GET/POST 端点
- [ ] 3.5 实现 `/api/skill-calls/:id` GET/DELETE 端点
- [ ] 3.6 实现 `/api/skill-calls/stats` GET 端点

## 4. 后端 - Artifacts API

- [ ] 4.1 创建 `src/controllers/artifacts.ts` 实现控制器
- [ ] 4.2 创建 `src/routes/artifacts.ts` 定义路由
- [ ] 4.3 在 `src/index.ts` 中注册 artifacts 路由
- [ ] 4.4 实现 `/api/artifacts` GET/POST 端点
- [ ] 4.5 实现 `/api/artifacts/:id` GET/PUT/DELETE 端点
- [ ] 4.6 实现 `/api/artifacts/:id/preview` GET 端点

## 5. 后端 - Pipeline Events API

- [ ] 5.1 创建 `src/controllers/pipeline-events.ts` 实现控制器
- [ ] 5.2 创建 `src/routes/pipeline-events.ts` 定义路由
- [ ] 5.3 创建 `src/middleware/webhook-auth.ts` 实现 token 验证
- [ ] 5.4 在 `src/index.ts` 中注册 pipeline-events 路由和中间件
- [ ] 5.5 实现 `/api/webhooks/pipeline` POST 端点
- [ ] 5.6 实现 `/api/pipeline-events` GET 端点
- [ ] 5.7 实现 `/api/pipeline-events/stats` GET 端点

## 6. 后端 - 任务阶段扩展

- [ ] 6.1 在 Task 模型中添加 `phase` 字段（requirement/design/implementation/testing/deployment）
- [ ] 6.2 运行数据库迁移
- [ ] 6.3 更新任务控制器，支持按 phase 过滤

## 7. 前端 - 时间线视图

- [ ] 7.1 创建 `src/components/Timeline/Timeline.tsx` 组件
- [ ] 7.2 创建 `src/components/Timeline/Timeline.css` 样式
- [ ] 7.3 创建 `src/components/SessionCard/SessionCard.tsx` 组件
- [ ] 7.4 创建 `src/components/SkillCallList/SkillCallList.tsx` 组件
- [ ] 7.5 在 App.tsx 中添加时间线路由/视图切换

## 8. 前端 - 统计面板

- [ ] 8.1 创建 `src/components/StatsPanel/StatsPanel.tsx` 组件
- [ ] 8.2 创建 `src/components/PhaseDistribution/PhaseDistribution.tsx` 组件
- [ ] 8.3 使用 TanStack Query 获取统计数据
- [ ] 8.4 添加简单的图表展示（可使用 CSS 或轻量库）

## 9. 测试与验证

- [ ] 9.1 测试所有新 API 端点（使用 curl 或 Postman）
- [ ] 9.2 验证数据库关系和级联删除
- [ ] 9.3 测试 Webhook 认证逻辑
- [ ] 9.4 验证前端组件渲染
- [ ] 9.5 检查 TypeScript 类型错误

## 10. 文档与清理

- [ ] 10.1 更新 README.md 添加新 API 文档
- [ ] 10.2 创建 `.env.example` 添加新环境变量示例
- [ ] 10.3 运行 `npm run build` 验证生产构建
- [ ] 10.4 清理临时文件和不需要的依赖
