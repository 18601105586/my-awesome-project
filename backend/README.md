# Kanban Backend

Go backend for the kanban board application.

## Setup

```bash
# Install dependencies
go mod download

# Run server
go run cmd/server/main.go
```

## Testing

```bash
go test ./... -v
```

## Database

The application uses SQLite with GORM ORM. The database file is created automatically at `data/kanban.db` (or the path specified in `DATABASE_PATH` environment variable).

### Models

- **Column**: id, name, position, created_at, updated_at
- **Task**: id, title, description, column_id, position, created_at, updated_at
