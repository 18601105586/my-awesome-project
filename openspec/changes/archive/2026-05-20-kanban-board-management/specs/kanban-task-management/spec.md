## ADDED Requirements

### Requirement: Create a new task
The system SHALL allow creating a new task with title, optional description, and column assignment.

#### Scenario: Successfully create a task
- **WHEN** a POST request is made to `/api/tasks` with `{"title": "Fix bug", "description": "Details", "column_id": 1}`
- **THEN** the system creates a new task with the given properties
- **AND** assigns the next available position in the column
- **AND** returns the created task

#### Scenario: Create task with invalid column
- **WHEN** a POST request is made with a non-existent column_id
- **THEN** the system returns a 400 Bad Request error

#### Scenario: Create task with empty title
- **WHEN** a POST request is made with `{"title": ""}`
- **THEN** the system returns a 400 Bad Request error

### Requirement: Get all tasks
The system SHALL return tasks filtered by column and ordered by position.

#### Scenario: Successfully retrieve tasks in a column
- **WHEN** a GET request is made to `/api/columns/{column_id}/tasks`
- **THEN** the system returns an array of tasks in that column sorted by position

#### Scenario: Get all tasks across columns
- **WHEN** a GET request is made to `/api/tasks`
- **THEN** the system returns all tasks with their column information

### Requirement: Update a task
The system SHALL allow updating task properties.

#### Scenario: Successfully update task title
- **WHEN** a PUT request is made to `/api/tasks/{id}` with `{"title": "Updated title"}`
- **THEN** the system updates the task title
- **AND** returns the updated task

#### Scenario: Update task description
- **WHEN** a PUT request is made with `{"description": "New description"}`
- **THEN** the system updates only the description field

### Requirement: Move task between columns
The system SHALL allow moving a task to a different column.

#### Scenario: Successfully move task to another column
- **WHEN** a PATCH request is made to `/api/tasks/{id}` with `{"column_id": 2}`
- **THEN** the system moves the task to the new column
- **AND** assigns a position in the target column (e.g., last position)
- **AND** returns the updated task

### Requirement: Delete a task
The system SHALL allow deleting a task.

#### Scenario: Successfully delete a task
- **WHEN** a DELETE request is made to `/api/tasks/{id}`
- **THEN** the system removes the task from the database
- **AND** returns 204 No Content

### Requirement: Get task by ID
The system SHALL return a single task with its associated column.

#### Scenario: Successfully retrieve a task
- **WHEN** a GET request is made to `/api/tasks/{id}`
- **THEN** the system returns the task with column information

#### Scenario: Retrieve non-existent task
- **WHEN** a GET request is made to a task id that doesn't exist
- **THEN** the system returns a 404 Not Found error
