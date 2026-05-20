## ADDED Requirements

### Requirement: Create a new column
The system SHALL allow creating a new column with a name and automatic position assignment.

#### Scenario: Successfully create a column
- **WHEN** a POST request is made to `/api/columns` with `{"name": "To Do"}`
- **THEN** the system creates a new column with the given name
- **AND** assigns the next available position (e.g., if max position is 2, new position is 3)
- **AND** returns the created column with id and position

#### Scenario: Create column with invalid name (empty)
- **WHEN** a POST request is made with `{"name": ""}`
- **THEN** the system returns a 400 Bad Request error

### Requirement: Get all columns
The system SHALL return all columns ordered by position.

#### Scenario: Successfully retrieve columns
- **WHEN** a GET request is made to `/api/columns`
- **THEN** the system returns an array of columns sorted by position ascending

### Requirement: Update a column
The system SHALL allow updating the name of an existing column.

#### Scenario: Successfully rename a column
- **WHEN** a PUT request is made to `/api/columns/{id}` with `{"name": "In Progress"}`
- **THEN** the system updates the column name
- **AND** returns the updated column

#### Scenario: Update non-existent column
- **WHEN** a PUT request is made to a column id that doesn't exist
- **THEN** the system returns a 404 Not Found error

### Requirement: Delete a column
The system SHALL allow deleting a column.

#### Scenario: Successfully delete a column
- **WHEN** a DELETE request is made to `/api/columns/{id}`
- **THEN** the system removes the column from the database
- **AND** returns 204 No Content

#### Scenario: Delete column with tasks
- **WHEN** a DELETE request is made to a column that contains tasks
- **THEN** the system returns a 409 Conflict error (or cascades delete - TBD)

### Requirement: Reorder columns
The system SHALL allow changing the position of a column.

#### Scenario: Successfully reorder a column
- **WHEN** a PATCH request is made to `/api/columns/{id}` with `{"position": 2}`
- **THEN** the system updates the column position
- **AND** shifts other columns as needed to maintain unique positions
- **AND** returns the updated column

#### Scenario: Reorder with position conflict
- **WHEN** a PATCH request sets position to an existing value
- **THEN** the system swaps positions or shifts columns to maintain order
