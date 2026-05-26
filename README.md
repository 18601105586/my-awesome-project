# AI 研发过程看板

一个将 AI 辅助研发过程具象化展示的看板系统。从需求提出、方案设计、编码实现、测试验证到部署运行，完整记录 AI 研发流水线。

## 功能特性

- **Kanban 看板** - 拖拽式任务管理，支持列和任务的 CRUD
- **研发时间线** - 按时间顺序展示所有 AI 研发活动
- **AI 会话追踪** - 记录每次 AI 对话会话及其生成的工件
- **Skill 调用统计** - 展示各 Claude Code Skill 的使用频率
- **阶段分布可视化** - 展示任务在各研发阶段的分布

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Data Fetching**: TanStack Query
- **Drag & Drop**: @dnd-kit

## Getting Started

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend starts on http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on http://localhost:5177

## API Endpoints

### Columns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/columns | Create column |
| GET | /api/columns | List all columns |
| GET | /api/columns/:id | Get column by ID |
| PUT | /api/columns/:id | Update column name |
| PATCH | /api/columns/:id | Reorder column |
| DELETE | /api/columns/:id | Delete column |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tasks | Create task |
| GET | /api/tasks | List all tasks |
| GET | /api/tasks/:id | Get task by ID |
| GET | /api/tasks/:id/sessions | Get task's AI sessions |
| GET | /api/columns/:cid/tasks | List tasks in column |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id | Move task (drag & drop) |
| DELETE | /api/tasks/:id | Delete task |

### AI Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sessions | Create AI session |
| GET | /api/sessions | List all sessions |
| GET | /api/sessions/:id | Get session details |
| PUT | /api/sessions/:id | Update session |
| DELETE | /api/sessions/:id | Delete session |
| GET | /api/sessions/:id/skills | Get session's skill calls |

### Skill Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/skill-calls | Record skill call |
| GET | /api/skill-calls | List skill calls |
| GET | /api/skill-calls/stats | Get skill usage stats |
| GET | /api/skill-calls/:id | Get skill call details |
| DELETE | /api/skill-calls/:id | Delete skill call |

### Artifacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/artifacts | Create artifact |
| GET | /api/artifacts | List artifacts |
| GET | /api/artifacts/:id | Get artifact details |
| GET | /api/artifacts/:id/preview | Get artifact preview |
| PUT | /api/artifacts/:id | Update artifact |
| DELETE | /api/artifacts/:id | Delete artifact |

### Pipeline Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/webhooks/pipeline | Webhook endpoint |
| GET | /api/pipeline-events | List pipeline events |
| GET | /api/pipeline-events/stats | Get pipeline stats |

## Environment Variables

### Backend (backend/.env)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: development)
- `WEBHOOK_TOKEN` - Token for webhook authentication

### Frontend (frontend/.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Database

The application uses Prisma ORM with SQLite. To view the database:

```bash
cd backend
npx prisma studio
```

## Research Phases

The system tracks five research phases:

| Phase | Icon | Description |
|-------|------|-------------|
| 需求提出 | 📋 | PRD, requirements analysis |
| 方案设计 | 🎨 | Architecture design, tech selection |
| 编码实现 | 💻 | Code generation, implementation |
| 测试验证 | ✅ | Unit tests, E2E tests, code review |
| 部署运行 | 🚀 | Build, deploy, monitoring |
