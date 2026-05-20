## 1. Database Setup

- [ ] 1.1 Create database migration for `columns` table (id, name, position, created_at, updated_at)
- [ ] 1.2 Create database migration for `tasks` table (id, title, description, column_id, position, created_at, updated_at)
- [ ] 1.3 Add unique constraints: (column_id, position) for tasks, ensure position uniqueness per column
- [ ] 1.4 Run migrations and verify tables created

## 2. Data Models & Repositories

- [ ] 2.1 Define Column entity/model with fields: id, name, position
- [ ] 2.2 Define Task entity/model with fields: id, title, description, column_id, position
- [ ] 2.3 Create ColumnRepository with CRUD operations and position-based ordering
- [ ] 2.4 Create TaskRepository with CRUD operations and column-based filtering
- [ ] 2.5 Implement position assignment logic (auto-assign next available position)
- [ ] 2.6 Implement position reordering logic (shift other items when position changes)

## 3. Column API Endpoints

- [ ] 3.1 POST /api/columns - Create a new column
- [ ] 3.2 GET /api/columns - List all columns ordered by position
- [ ] 3.3 GET /api/columns/{id} - Get a specific column
- [ ] 3.4 PUT /api/columns/{id} - Update column name
- [ ] 3.5 PATCH /api/columns/{id} - Reorder column (change position)
- [ ] 3.6 DELETE /api/columns/{id} - Delete a column (with task conflict check)

## 4. Task API Endpoints

- [ ] 4.1 POST /api/tasks - Create a new task
- [ ] 4.2 GET /api/tasks - List all tasks
- [ ] 4.3 GET /api/tasks/{id} - Get a specific task with column info
- [ ] 4.4 GET /api/columns/{column_id}/tasks - List tasks in a column
- [ ] 4.5 PUT /api/tasks/{id} - Update task properties
- [ ] 4.6 PATCH /api/tasks/{id} - Move task to different column
- [ ] 4.7 DELETE /api/tasks/{id} - Delete a task

## 5. Input Validation & Error Handling

- [ ] 5.1 Validate column name is not empty
- [ ] 5.2 Validate task title is not empty
- [ ] 5.3 Validate column_id exists when creating task
- [ ] 5.4 Validate position is non-negative integer
- [ ] 5.5 Handle 404 errors for non-existent resources
- [ ] 5.6 Handle 409 conflicts for position duplicates and column deletion with tasks

## 6. Testing

- [ ] 6.1 Write unit tests for ColumnRepository
- [ ] 6.2 Write unit tests for TaskRepository
- [ ] 6.3 Write unit tests for position ordering logic
- [ ] 6.4 Write API tests for column endpoints
- [ ] 6.5 Write API tests for task endpoints
- [ ] 6.6 Write integration tests for move task between columns scenario

## 7. Documentation & Cleanup

- [ ] 7.1 Add API documentation (OpenAPI/Swagger or README)
- [ ] 7.2 Update project README with new endpoints
- [ ] 7.3 Run full test suite and verify all pass
- [ ] 7.4 Verify code coverage meets 80% threshold
