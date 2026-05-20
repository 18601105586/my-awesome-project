# Kanban Board Management System Design

**Date**: 2026-05-20  
**Tech Stack**: Go + Gin + SQLite + GORM / React + Vite + TypeScript

## Overview

A kanban board management system enabling visual task organization with draggable columns and tasks.

## Architecture

### Backend (Go)

```
backend/
├── cmd/server/main.go          # Application entry point
├── internal/
│   ├── models/                 # Domain models
│   │   ├── column.go
│   │   └── task.go
│   ├── repository/             # Data access layer
│   │   ├── column_repo.go
│   │   └── task_repo.go
│   ├── handlers/               # HTTP handlers
│   │   ├── column_handler.go
│   │   └── task_handler.go
│   └── server/                 # Server setup
│       └── server.go
└── migrations/
    └── 001_initial_schema.sql
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx
│   │   │   └── Board.css
│   │   ├── Column/
│   │   │   ├── Column.tsx
│   │   │   └── Column.css
│   │   └── TaskCard/
│   │       ├── TaskCard.tsx
│   │       └── TaskCard.css
│   ├── hooks/
│   │   └── useKanban.ts
│   ├── stores/
│   │   └── kanbanStore.ts
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
```

## Data Models

### Column

| Field | Type | Constraints |
|-------|------|-------------|
| id | uint | Primary key, auto-increment |
| name | string | Not null |
| position | int | Not null, unique per board |
| created_at | time.Time | Auto |
| updated_at | time.Time | Auto |

### Task

| Field | Type | Constraints |
|-------|------|-------------|
| id | uint | Primary key, auto-increment |
| title | string | Not null |
| description | string | Nullable |
| column_id | uint | Not null, indexed, foreign key |
| position | int | Not null |
| created_at | time.Time | Auto |
| updated_at | time.Time | Auto |

## API Endpoints

### Columns

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/columns | Create column |
| GET | /api/columns | List all columns (ordered by position) |
| GET | /api/columns/:id | Get column by ID |
| PUT | /api/columns/:id | Update column name |
| PATCH | /api/columns/:id | Reorder column |
| DELETE | /api/columns/:id | Delete column |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/tasks | Create task |
| GET | /api/tasks | List all tasks |
| GET | /api/tasks/:id | Get task by ID |
| GET | /api/columns/:cid/tasks | List tasks in column |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id | Move task to different column |
| DELETE | /api/tasks/:id | Delete task |

## Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No Content (DELETE)
- 400: Bad Request (validation error)
- 404: Not Found
- 409: Conflict (position conflict, column has tasks)

## Position Reordering Logic

When moving an item to a new position:
1. If target position is beyond current max, append at end
2. If target position is within range, shift items down
3. Use database transaction to ensure consistency
4. Handle unique constraint violations with retry

## Frontend Components

### Board
- Container for all columns
- Handles column-level drag and drop
- Renders columns in position order

### Column
- Renders column header with name
- Renders task list within column
- Handles task drag and drop
- Supports inline rename

### TaskCard
- Displays task title and preview of description
- Handles drag events
- Supports click to expand details

## State Management

### Server State (TanStack Query)
- Columns list
- Tasks list
- Individual column/task fetches

### Client State (Zustand)
- Dragging state
- Selected task for details panel
- UI preferences (theme, etc.)

## Testing Strategy

### Backend
- Unit tests for repository layer
- Integration tests for handlers
- Test position reordering edge cases

### Frontend
- Component unit tests
- Integration tests for drag and drop
- Visual regression tests for key states

## Implementation Phases

1. **Backend Setup**: Project structure, database connection, models
2. **Repository Layer**: CRUD operations, position logic
3. **API Layer**: HTTP handlers, routing, validation
4. **Frontend Setup**: Vite project, types, API client
5. **UI Components**: Board, Column, TaskCard
6. **Integration**: Connect frontend to backend
7. **Testing**: Full test suite
8. **Documentation**: README, API docs
