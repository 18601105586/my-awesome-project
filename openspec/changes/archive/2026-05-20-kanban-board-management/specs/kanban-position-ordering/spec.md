## ADDED Requirements

### Requirement: Maintain unique position per column
The system SHALL ensure that each column has a unique position value within its scope.

#### Scenario: Prevent duplicate positions
- **WHEN** an operation tries to set two columns to the same position
- **THEN** the system rejects the operation with a 409 Conflict error

### Requirement: Maintain unique position per task within column
The system SHALL ensure that each task has a unique position within its column.

#### Scenario: Prevent duplicate task positions in same column
- **WHEN** an operation tries to set two tasks to the same position in the same column
- **THEN** the system rejects the operation with a 409 Conflict error

### Requirement: Automatic position assignment
The system SHALL automatically assign the next available position when creating a new column or task.

#### Scenario: Auto-assign column position
- **WHEN** a new column is created without specifying position
- **THEN** the system assigns position = max(existing_positions) + 1

#### Scenario: Auto-assign task position within column
- **WHEN** a new task is created without specifying position
- **THEN** the system assigns position = max(existing task positions in that column) + 1

### Requirement: Position reordering with shift
The system SHALL handle position changes that require shifting other items.

#### Scenario: Insert at middle position
- **WHEN** a column at position 3 is moved to position 1
- **THEN** the system shifts columns at positions 1 and 2 to positions 2 and 3
- **AND** the moved column ends up at position 1

#### Scenario: Task reordering within column
- **WHEN** a task is moved to a different position within the same column
- **THEN** the system shifts other tasks to maintain unique positions

### Requirement: Position bounds validation
The system SHALL validate that position values are within acceptable bounds.

#### Scenario: Reject negative position
- **WHEN** an operation tries to set position to -1
- **THEN** the system returns a 400 Bad Request error

#### Scenario: Accept zero position
- **WHEN** an operation sets position to 0
- **THEN** the system accepts it (0-indexed positions allowed)
