## Why

Need a kanban board management system to organize tasks with drag-and-drop style workflow. This enables visual task management with customizable columns and task tracking across different statuses.

## What Changes

- New kanban board data model with Column and Task entities
- CRUD operations for managing columns (create, reorder, rename, delete)
- CRUD operations for managing tasks (create, edit, move between columns, delete)
- Position-based ordering for columns to maintain display order
- Status-based task organization tied to column membership

## Capabilities

### New Capabilities

- `kanban-column-management`: Manage board columns including creation, reordering, renaming, and deletion
- `kanban-task-management`: Manage tasks within columns including creation, editing, movement between columns, and deletion
- `kanban-position-ordering`: Maintain positional ordering of columns and tasks for consistent display order

## Impact

- New database tables: `columns` (id, name, position) and `tasks` (id, title, description, status/column_id)
- New API endpoints for column and task CRUD operations
- New data models/entities and repositories
- Potential UI components for kanban board visualization (if frontend is part of scope)
