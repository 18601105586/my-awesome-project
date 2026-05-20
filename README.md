# Kanban Board Management System

A full-stack kanban board application with Go backend and React frontend.

## Tech Stack

- **Backend**: Go, Gin, GORM, SQLite
- **Frontend**: React, TypeScript, Vite, Zustand, TanStack Query, dnd-kit

## Getting Started

### Backend

```bash
cd backend
go run cmd/server/main.go
```

Server starts on http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on http://localhost:5173

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
| GET | /api/columns/:cid/tasks | List tasks in column |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id | Move task |
| DELETE | /api/tasks/:id | Delete task |

## Environment Variables

### Backend
- `PORT` - Server port (default: 8080)
- `DATABASE_PATH` - SQLite database path (default: data/kanban.db)

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm test
```
