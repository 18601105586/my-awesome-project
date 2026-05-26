# AI 研发过程看板 - 实现计划

> **对于自主执行**：建议使用 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans` 按任务执行。

**Goal**: 实现 AI 研发过程可视化看板，包含 Sessions、Skill Calls、Artifacts API 和前端时间线视图

**Architecture**: 在现有 Node.js + Express + Prisma + React 架构上扩展，新增 4 个数据表和对应的 API 端点，前端新增时间线视图和统计面板

**Tech Stack**: Node.js, Express, Prisma, SQLite, React, TypeScript, TanStack Query

---

## 文件结构

### 后端新增文件
- `backend/prisma/schema.prisma` - 扩展数据模型
- `backend/src/controllers/sessions.ts` - Sessions 控制器
- `backend/src/controllers/skill-calls.ts` - Skill Calls 控制器
- `backend/src/controllers/artifacts.ts` - Artifacts 控制器
- `backend/src/controllers/pipeline-events.ts` - Pipeline Events 控制器
- `backend/src/routes/sessions.ts` - Sessions 路由
- `backend/src/routes/skill-calls.ts` - Skill Calls 路由
- `backend/src/routes/artifacts.ts` - Artifacts 路由
- `backend/src/routes/pipeline-events.ts` - Pipeline Events 路由

### 前端新增文件
- `frontend/src/components/Timeline/Timeline.tsx` - 时间线组件
- `frontend/src/components/Timeline/Timeline.css` - 时间线样式
- `frontend/src/components/SessionCard/SessionCard.tsx` - 会话卡片组件
- `frontend/src/components/SessionCard/SessionCard.css` - 卡片样式
- `frontend/src/components/StatsPanel/StatsPanel.tsx` - 统计面板组件
- `frontend/src/components/StatsPanel/StatsPanel.css` - 统计样式

### 修改文件
- `backend/src/index.ts` - 注册新路由
- `backend/src/controllers/tasks.ts` - 添加 phase 过滤支持
- `frontend/src/App.tsx` - 添加视图切换
- `frontend/src/App.css` - 添加视图切换样式
- `README.md` - 更新 API 文档

---

## Task 1: 数据库模型

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1.1: 更新 Prisma schema**

在现有 schema 中添加以下模型：

```prisma
// AI conversation sessions
model AISession {
  id          Int      @id @default(autoincrement())
  title       String
  phase       String   // requirement | design | implementation | testing | deployment
  taskId      Int?
  task        Task?    @relation(fields: [taskId], references: [id], onDelete: SetNull)
  summary     String?
  completed   Boolean  @default(false)
  metadata    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  skillCalls  SkillCall[]
  artifacts   Artifact[]

  @@index([phase])
  @@index([taskId])
  @@map("ai_sessions")
}

// Skill tool invocations
model SkillCall {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  session     AISession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  skill       String
  input       String?
  output      String?
  durationMs  Int?
  status      String   @default("success")
  error       String?
  createdAt   DateTime @default(now())

  @@index([sessionId])
  @@index([skill])
  @@map("skill_calls")
}

// Artifacts
model Artifact {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  session     AISession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  taskId      Int?
  task        Task?    @relation(fields: [taskId], references: [id], onDelete: SetNull)

  type        String   // document | code | config | other
  name        String
  path        String?
  language    String?
  content     String?
  version     Int      @default(1)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sessionId])
  @@index([taskId])
  @@index([type])
  @@map("artifacts")
}

// Pipeline events
model PipelineEvent {
  id          Int      @id @default(autoincrement())
  type        String   // commit | build | test | deploy
  status      String   // success | failed | running
  author      String?
  message     String?
  sha         String?
  durationMs  Int?
  error       String?
  metadata    String?
  createdAt   DateTime @default(now())

  @@index([type])
  @@index([status])
  @@map("pipeline_events")
}
```

同时更新 Task 模型，添加 phase 字段和反向关系：

```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  columnId    Int
  position    Int
  phase       String   @default("implementation")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  column      Column   @relation(fields: [columnId], references: [id], onDelete: Cascade)
  sessions    AISession[]
  artifacts   Artifact[]

  @@index([columnId])
  @@index([phase])
  @@map("tasks")
}
```

- [ ] **Step 1.2: 运行数据库迁移**

```bash
cd backend
npx prisma migrate dev --name add_ai_research_models
npx prisma generate
```

预期输出：创建迁移文件并生成 Prisma Client

---

## Task 2: Sessions API

**Files:**
- Create: `backend/src/controllers/sessions.ts`
- Create: `backend/src/routes/sessions.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 2.1: 创建 Sessions 控制器**

```typescript
import { Request, Response, NextFunction } from 'express'
import { PrismaClient, AISession } from '@prisma/client'

const prisma = new PrismaClient()

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, phase, taskId, summary, metadata } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' })
      return
    }

    const session = await prisma.aISession.create({
      data: { title, phase: phase || 'implementation', taskId: taskId || null, summary: summary || null, metadata: metadata || null },
      include: { task: true }
    })

    res.status(201).json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phase, taskId } = req.query
    const where: any = {}
    if (phase) where.phase = phase
    if (taskId) where.taskId = parseInt(taskId as string, 10)

    const sessions = await prisma.aISession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { task: true, skillCalls: { orderBy: { createdAt: 'desc' }, take: 5 }, artifacts: { orderBy: { createdAt: 'desc' }, take: 5 } }
    })

    res.json({ success: true, data: sessions })
  } catch (error) {
    next(error)
  }
}

export const getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const session = await prisma.aISession.findUnique({
      where: { id: parseInt(id, 10) },
      include: { task: true, skillCalls: { orderBy: { createdAt: 'asc' } }, artifacts: { orderBy: { createdAt: 'asc' } } }
    })

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' })
      return
    }

    res.json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const updateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { title, phase, taskId, summary, completed, metadata } = req.body

    const session = await prisma.aISession.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title !== undefined ? title : undefined,
        phase: phase !== undefined ? phase : undefined,
        taskId: taskId !== undefined ? taskId : undefined,
        summary: summary !== undefined ? summary : undefined,
        completed: completed !== undefined ? completed : undefined,
        metadata: metadata !== undefined ? metadata : undefined
      },
      include: { task: true }
    })

    res.json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.aISession.delete({ where: { id: parseInt(id, 10) } })
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}

export const getSessionSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const skills = await prisma.skillCall.findMany({
      where: { sessionId: parseInt(id, 10) },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ success: true, data: skills })
  } catch (error) {
    next(error)
  }
}

export const getTaskSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const sessions = await prisma.aISession.findMany({
      where: { taskId: parseInt(id, 10) },
      orderBy: { createdAt: 'desc' },
      include: { skillCalls: { orderBy: { createdAt: 'desc' }, take: 3 }, artifacts: { orderBy: { createdAt: 'desc' }, take: 3 } }
    })
    res.json({ success: true, data: sessions })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 2.2: 创建 Sessions 路由**

```typescript
import { Router } from 'express'
import {
  createSession, getSessions, getSession, updateSession, deleteSession, getSessionSkills, getTaskSessions
} from '../controllers/sessions'

const router = Router()

router.post('/', createSession)
router.get('/', getSessions)
router.get('/:id', getSession)
router.put('/:id', updateSession)
router.delete('/:id', deleteSession)
router.get('/:id/skills', getSessionSkills)

export default router
```

- [ ] **Step 2.3: 注册路由**

在 `backend/src/index.ts` 中添加：

```typescript
import sessionRoutes from './routes/sessions'
// ... 其他导入

// 在 routes 部分添加
app.use('/api/sessions', sessionRoutes)
```

- [ ] **Step 2.4: 测试 API**

```bash
curl -X POST http://localhost:3000/api/sessions -H "Content-Type: application/json" -d '{"title":"Test Session","phase":"design"}'
```

---

## Task 3: Skill Calls API

**Files:**
- Create: `backend/src/controllers/skill-calls.ts`
- Create: `backend/src/routes/skill-calls.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 3.1: 创建 Skill Calls 控制器**

```typescript
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, skill, input, output, durationMs, status, error: errorMessage } = req.body

    if (!sessionId || !skill) {
      res.status(400).json({ success: false, error: 'sessionId and skill are required' })
      return
    }

    const skillCall = await prisma.skillCall.create({
      data: { sessionId, skill, input: input || null, output: output || null, durationMs: durationMs || null, status: status || 'success', error: errorMessage || null }
    })

    res.status(201).json({ success: true, data: skillCall })
  } catch (error) {
    next(error)
  }
}

export const getSkillCalls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, skill } = req.query
    const where: any = {}
    if (sessionId) where.sessionId = parseInt(sessionId as string, 10)
    if (skill) where.skill = skill

    const skillCalls = await prisma.skillCall.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { session: true }
    })

    res.json({ success: true, data: skillCalls })
  } catch (error) {
    next(error)
  }
}

export const getSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const skillCall = await prisma.skillCall.findUnique({
      where: { id: parseInt(id, 10) },
      include: { session: true }
    })

    if (!skillCall) {
      res.status(404).json({ success: false, error: 'Skill call not found' })
      return
    }

    res.json({ success: true, data: skillCall })
  } catch (error) {
    next(error)
  }
}

export const deleteSkillCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.skillCall.delete({ where: { id: parseInt(id, 10) } })
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}

export const getSkillStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.query
    const where: any = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from as string)
      if (to) where.createdAt.lte = new Date(to as string)
    }

    const skillCalls = await prisma.skillCall.findMany({ where, select: { skill: true } })

    const stats: Record<string, number> = {}
    for (const call of skillCalls) {
      stats[call.skill] = (stats[call.skill] || 0) + 1
    }

    res.json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 3.2: 创建路由并注册**

类似 Task 2 的步骤 2.2 和 2.3

---

## Task 4: Artifacts API

**Files:**
- Create: `backend/src/controllers/artifacts.ts`
- Create: `backend/src/routes/artifacts.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 4.1: 创建 Artifacts 控制器**

```typescript
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, taskId, type, name, path, language, content, version } = req.body

    if (!sessionId || !type || !name) {
      res.status(400).json({ success: false, error: 'sessionId, type, and name are required' })
      return
    }

    const artifact = await prisma.artifact.create({
      data: { sessionId, taskId: taskId || null, type, name, path: path || null, language: language || null, content: content || null, version: version || 1 }
    })

    res.status(201).json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const getArtifacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, taskId, type } = req.query
    const where: any = {}
    if (sessionId) where.sessionId = parseInt(sessionId as string, 10)
    if (taskId) where.taskId = parseInt(taskId as string, 10)
    if (type) where.type = type

    const artifacts = await prisma.artifact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { session: true, task: true }
    })

    res.json({ success: true, data: artifacts })
  } catch (error) {
    next(error)
  }
}

export const getArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const artifact = await prisma.artifact.findUnique({
      where: { id: parseInt(id, 10) },
      include: { session: true, task: true }
    })

    if (!artifact) {
      res.status(404).json({ success: false, error: 'Artifact not found' })
      return
    }

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const getArtifactPreview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const artifact = await prisma.artifact.findUnique({
      where: { id: parseInt(id, 10) },
      select: { id: true, sessionId: true, taskId: true, type: true, name: true, path: true, language: true, version: true, createdAt: true, updatedAt: true }
    })

    if (!artifact) {
      res.status(404).json({ success: false, error: 'Artifact not found' })
      return
    }

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const updateArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { taskId, type, name, path, language, content, version } = req.body

    const artifact = await prisma.artifact.update({
      where: { id: parseInt(id, 10) },
      data: {
        taskId: taskId !== undefined ? taskId : undefined,
        type: type !== undefined ? type : undefined,
        name: name !== undefined ? name : undefined,
        path: path !== undefined ? path : undefined,
        language: language !== undefined ? language : undefined,
        content: content !== undefined ? content : undefined,
        version: version !== undefined ? version : undefined
      }
    })

    res.json({ success: true, data: artifact })
  } catch (error) {
    next(error)
  }
}

export const deleteArtifact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.artifact.delete({ where: { id: parseInt(id, 10) } })
    res.json({ success: true, data: null })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 4.2: 创建路由并注册**

类似 Task 2

---

## Task 5: Pipeline Events API（简化版）

**Files:**
- Create: `backend/src/controllers/pipeline-events.ts`
- Create: `backend/src/routes/pipeline-events.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 5.1: 创建 Pipeline Events 控制器**

```typescript
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || 'webhook-secret-change-in-production'

export const webhookAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-webhook-token'] as string
  if (!token || token !== WEBHOOK_TOKEN) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  next()
}

export const createPipelineEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status, author, message, sha, durationMs, error: errorMessage, metadata } = req.body

    if (!type) {
      res.status(400).json({ success: false, error: 'type is required' })
      return
    }

    const event = await prisma.pipelineEvent.create({
      data: { type, status: status || 'running', author: author || null, message: message || null, sha: sha || null, durationMs: durationMs || null, error: errorMessage || null, metadata: metadata || null }
    })

    res.status(201).json({ success: true, data: event })
  } catch (error) {
    next(error)
  }
}

export const getPipelineEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, status } = req.query
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const events = await prisma.pipelineEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })
    res.json({ success: true, data: events })
  } catch (error) {
    next(error)
  }
}

export const getPipelineStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, to } = req.query
    const where: any = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from as string)
      if (to) where.createdAt.lte = new Date(to as string)
    }

    const events = await prisma.pipelineEvent.findMany({ where, select: { type: true, status: true } })

    const stats = {
      total_commits: 0,
      builds: { success: 0, failed: 0, running: 0 },
      tests: { success: 0, failed: 0, running: 0 },
      deploys: { success: 0, failed: 0, running: 0 },
      avg_build_time_ms: 0
    }

    let totalBuildTime = 0, buildCount = 0

    for (const event of events) {
      if (event.type === 'commit') stats.total_commits++
      else if (event.type === 'build') {
        buildCount++
        if (event.durationMs) totalBuildTime += event.durationMs
        if (event.status === 'success') stats.builds.success++
        else if (event.status === 'failed') stats.builds.failed++
        else if (event.status === 'running') stats.builds.running++
      } else if (event.type === 'test') {
        if (event.status === 'success') stats.tests.success++
        else if (event.status === 'failed') stats.tests.failed++
        else if (event.status === 'running') stats.tests.running++
      } else if (event.type === 'deploy') {
        if (event.status === 'success') stats.deploys.success++
        else if (event.status === 'failed') stats.deploys.failed++
        else if (event.status === 'running') stats.deploys.running++
      }
    }

    stats.avg_build_time_ms = buildCount > 0 ? Math.round(totalBuildTime / buildCount) : 0
    res.json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 5.2: 创建路由并注册**

```typescript
import { Router } from 'express'
import { webhookAuth, createPipelineEvent, getPipelineEvents, getPipelineStats } from '../controllers/pipeline-events'

const router = Router()
router.post('/pipeline', webhookAuth, createPipelineEvent)
router.get('/pipeline-events', getPipelineEvents)
router.get('/pipeline-events/stats', getPipelineStats)

export default router
```

---

## Task 6: 更新 Tasks 控制器支持 phase

**Files:**
- Modify: `backend/src/controllers/tasks.ts`

- [ ] **Step 6.1: 更新 getTasks 支持 phase 过滤**

```typescript
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phase, column_id } = req.query
    const where: any = {}
    if (phase) where.phase = phase
    if (column_id) where.columnId = parseInt(column_id as string, 10)

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
      include: { column: true }
    })
    res.json({ success: true, data: tasks })
  } catch (error) {
    next(error)
  }
}
```

- [ ] **Step 6.2: 更新 updateTask 支持 phase 字段**

```typescript
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, phase } = req.body

    const task = await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        phase: phase !== undefined ? phase : undefined
      },
      include: { column: true }
    })

    res.json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}
```

---

## Task 7: 前端 - StatsPanel 组件

**Files:**
- Create: `frontend/src/components/StatsPanel/StatsPanel.tsx`
- Create: `frontend/src/components/StatsPanel/StatsPanel.css`

- [ ] **Step 7.1: 创建 StatsPanel 组件**

```tsx
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import './StatsPanel.css'

interface SkillStats { [key: string]: number }
interface PhaseStats { requirement: number; design: number; implementation: number; testing: number; deployment: number }

export default function StatsPanel() {
  const [skillStats, setSkillStats] = useState<SkillStats>({})
  const [phaseStats, setPhaseStats] = useState<PhaseStats>({ requirement: 0, design: 0, implementation: 0, testing: 0, deployment: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const skillsResponse = await api.get('/api/skill-calls/stats')
      setSkillStats(skillsResponse.data.data)

      const sessionsResponse = await api.get('/api/sessions')
      const sessions = sessionsResponse.data.data
      const phases: PhaseStats = { requirement: 0, design: 0, implementation: 0, testing: 0, deployment: 0 }
      sessions.forEach((session: { phase: string }) => {
        if (phases[session.phase as keyof PhaseStats] !== undefined) phases[session.phase as keyof PhaseStats]++
      })
      setPhaseStats(phases)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="stats-panel loading">加载中...</div>

  const totalSessions = Object.values(phaseStats).reduce((a, b) => a + b, 0)
  const totalSkillCalls = Object.values(skillStats).reduce((a, b) => a + b, 0)

  const phases = [
    { key: 'requirement', label: '📋 需求', color: '#9c27b0' },
    { key: 'design', label: '🎨 设计', color: '#2196f3' },
    { key: 'implementation', label: '💻 开发', color: '#4caf50' },
    { key: 'testing', label: '✅ 测试', color: '#ff9800' },
    { key: 'deployment', label: '🚀 部署', color: '#f44336' }
  ] as const

  const skills = Object.entries(skillStats).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="stats-panel">
      <h2>研发统计</h2>
      <div className="stats-overview">
        <div className="stat-card"><span className="stat-value">{totalSessions}</span><span className="stat-label">AI 会话</span></div>
        <div className="stat-card"><span className="stat-value">{totalSkillCalls}</span><span className="stat-label">Skill 调用</span></div>
      </div>
      <div className="stats-section">
        <h3>阶段分布</h3>
        <div className="phase-bars">
          {phases.map(({ key, label, color }) => {
            const count = phaseStats[key as keyof PhaseStats]
            const percentage = totalSessions > 0 ? (count / totalSessions) * 100 : 0
            return (
              <div key={key} className="phase-bar-item">
                <span className="phase-label">{label}</span>
                <div className="phase-bar"><div className="phase-bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }} /></div>
                <span className="phase-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      {skills.length > 0 && (
        <div className="stats-section">
          <h3>Skill 使用</h3>
          <div className="skill-list">
            {skills.map(([skill, count]) => (
              <div key={skill} className="skill-item"><span className="skill-name">{skill}</span><span className="skill-count">{count}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7.2: 创建样式文件**

（参考之前提供的 CSS 代码）

---

## Task 8: 前端 - Timeline 和 SessionCard 组件

**Files:**
- Create: `frontend/src/components/Timeline/Timeline.tsx`
- Create: `frontend/src/components/Timeline/Timeline.css`
- Create: `frontend/src/components/SessionCard/SessionCard.tsx`
- Create: `frontend/src/components/SessionCard/SessionCard.css`

- [ ] **Step 8.1: 创建 Timeline 组件**

```tsx
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import SessionCard from '../SessionCard/SessionCard'
import './Timeline.css'

interface Session {
  id: number
  title: string
  phase: string
  summary: string | null
  completed: boolean
  createdAt: string
  skillCalls: { id: number; skill: string; createdAt: string }[]
  artifacts: { id: number; name: string; type: string }[]
}

export default function Timeline() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPhase, setFilterPhase] = useState<string>('')

  useEffect(() => { fetchSessions() }, [filterPhase])

  const fetchSessions = async () => {
    try {
      const url = filterPhase ? `/api/sessions?phase=${filterPhase}` : '/api/sessions'
      const response = await api.get(url)
      setSessions(response.data.data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const phases = [
    { value: '', label: 'All' },
    { value: 'requirement', label: '📋 需求' },
    { value: 'design', label: '🎨 设计' },
    { value: 'implementation', label: '💻 开发' },
    { value: 'testing', label: '✅ 测试' },
    { value: 'deployment', label: '🚀 部署' }
  ]

  if (loading) return <div className="timeline loading">加载中...</div>

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h2>研发时间线</h2>
        <div className="timeline-filters">
          {phases.map(phase => (
            <button key={phase.value} className={filterPhase === phase.value ? 'active' : ''} onClick={() => setFilterPhase(phase.value)}>
              {phase.label}
            </button>
          ))}
        </div>
      </div>
      {sessions.length === 0 ? (
        <div className="timeline-empty">
          <p>暂无研发记录</p>
          <p className="hint">通过 API 创建 AI 会话来开始记录研发过程</p>
        </div>
      ) : (
        <div className="timeline-list">
          {sessions.map(session => <SessionCard key={session.id} session={session} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8.2: 创建 SessionCard 组件**

```tsx
import './SessionCard.css'

interface SessionCardProps {
  session: {
    id: number
    title: string
    phase: string
    summary: string | null
    completed: boolean
    createdAt: string
    skillCalls: { id: number; skill: string; createdAt: string }[]
    artifacts: { id: number; name: string; type: string }[]
  }
}

const phaseIcons: Record<string, string> = {
  requirement: '📋', design: '🎨', implementation: '💻', testing: '✅', deployment: '🚀'
}

const phaseColors: Record<string, string> = {
  requirement: '#9c27b0', design: '#2196f3', implementation: '#4caf50', testing: '#ff9800', deployment: '#f44336'
}

export default function SessionCard({ session }: SessionCardProps) {
  const icon = phaseIcons[session.phase] || '📝'
  const color = phaseColors[session.phase] || '#666'

  return (
    <div className="session-card">
      <div className="session-card-header">
        <div className="session-card-phase" style={{ backgroundColor: color }}>{icon}</div>
        <div className="session-card-title">
          <h3>{session.title}</h3>
          <span className="session-card-time">{new Date(session.createdAt).toLocaleString('zh-CN')}</span>
        </div>
        {session.completed && <span className="session-card-badge">完成</span>}
      </div>
      {session.summary && <p className="session-card-summary">{session.summary}</p>}
      <div className="session-card-stats">
        {session.skillCalls.length > 0 && (
          <div className="session-card-section">
            <span className="section-label">Skill 调用:</span>
            <div className="skill-tags">
              {session.skillCalls.slice(0, 5).map(call => <span key={call.id} className="skill-tag">{call.skill}</span>)}
              {session.skillCalls.length > 5 && <span className="skill-tag more">+{session.skillCalls.length - 5}</span>}
            </div>
          </div>
        )}
        {session.artifacts.length > 0 && (
          <div className="session-card-section">
            <span className="section-label">生成工件:</span>
            <div className="artifact-tags">
              {session.artifacts.slice(0, 5).map(artifact => <span key={artifact.id} className="artifact-tag">{artifact.type === 'code' ? '📄' : '📝'} {artifact.name}</span>)}
              {session.artifacts.length > 5 && <span className="artifact-tag more">+{session.artifacts.length - 5}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 8.3: 创建样式文件**

（参考之前提供的 CSS 代码）

---

## Task 9: 前端 - 视图切换

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`

- [ ] **Step 9.1: 更新 App.tsx**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Board from './components/Board/Board'
import Timeline from './components/Timeline/Timeline'
import StatsPanel from './components/StatsPanel/StatsPanel'
import './App.css'

const queryClient = new QueryClient()
type ViewMode = 'board' | 'timeline'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('board')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="app-header">
          <h1>AI 研发看板</h1>
          <div className="view-toggle">
            <button className={viewMode === 'board' ? 'active' : ''} onClick={() => setViewMode('board')}>看板</button>
            <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>时间线</button>
          </div>
        </header>
        {viewMode === 'board' ? (
          <Board />
        ) : (
          <div className="timeline-view">
            <StatsPanel />
            <Timeline />
          </div>
        )}
      </div>
    </QueryClientProvider>
  )
}

export default App
```

- [ ] **Step 9.2: 更新 App.css**

添加视图切换按钮和 time
