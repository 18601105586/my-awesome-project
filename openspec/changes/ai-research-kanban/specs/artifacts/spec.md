## ADDED Requirements

### Requirement: Create artifact record
系统 SHALL 允许创建工件记录，用于追踪 AI 生成的文档或代码文件。

#### Scenario: Create document artifact
- **WHEN** POST to `/api/artifacts` with `{ "session_id": 1, "type": "document", "name": "design.md", "path": "docs/design.md", "content": "..." }`
- **THEN** system creates artifact record with metadata

#### Scenario: Create code artifact
- **WHEN** POST to `/api/artifacts` with `{ "session_id": 1, "type": "code", "name": "columns.ts", "path": "src/controllers/columns.ts", "language": "typescript" }`
- **THEN** system creates code artifact record

### Requirement: List artifacts
系统 SHALL 允许查询所有工件，支持按类型和会话过滤。

#### Scenario: List all artifacts
- **WHEN** GET `/api/artifacts`
- **THEN** system returns all artifacts ordered by `created_at` DESC

#### Scenario: Filter by type
- **WHEN** GET `/api/artifacts?type=document`
- **THEN** system returns only document-type artifacts

#### Scenario: Filter by session
- **WHEN** GET `/api/artifacts?session_id=1`
- **THEN** system returns artifacts from that session

### Requirement: Get artifact content
系统 SHALL 允许获取工件的完整内容。

#### Scenario: Get artifact with content
- **WHEN** GET `/api/artifacts/:id`
- **THEN** system returns artifact including `content` field

#### Scenario: Get artifact preview
- **WHEN** GET `/api/artifacts/:id/preview`
- **THEN** system returns artifact metadata only (no content) for listing views

### Requirement: Update artifact
系统 SHALL 允许更新工件内容，用于记录版本迭代。

#### Scenario: Update artifact content
- **WHEN** PUT `/api/artifacts/:id` with `{ "content": "updated content", "version": 2 }`
- **THEN** system updates artifact and increments version

### Requirement: Delete artifact
系统 SHALL 允许删除工件记录。

#### Scenario: Delete artifact
- **WHEN** DELETE `/api/artifacts/:id`
- **THEN** system deletes the record and returns 200

### Requirement: Link artifact to task
系统 SHALL 允许将工件与看板任务关联。

#### Scenario: Link artifact to task
- **WHEN** PUT `/api/artifacts/:id` with `{ "task_id": 1 }`
- **THEN** system associates artifact with the specified task
