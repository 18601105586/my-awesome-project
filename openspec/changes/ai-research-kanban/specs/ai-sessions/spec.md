## ADDED Requirements

### Requirement: Create AI session record
系统 SHALL 允许创建新的 AI 对话会话记录，用于追踪一次完整的 AI 辅助研发活动。

#### Scenario: Create new session
- **WHEN** POST to `/api/sessions` with `{ "title": "xxx", "phase": "design" }`
- **THEN** system returns created session with `id`, `created_at`, `updated_at`

#### Scenario: Validate required fields
- **WHEN** POST to `/api/sessions` without `title`
- **THEN** system returns 400 error with validation message

### Requirement: List AI sessions
系统 SHALL 允许查询所有 AI 会话，支持按研发阶段过滤。

#### Scenario: List all sessions
- **WHEN** GET `/api/sessions`
- **THEN** system returns array of all sessions ordered by `created_at` DESC

#### Scenario: Filter by phase
- **WHEN** GET `/api/sessions?phase=design`
- **THEN** system returns only sessions with `phase = "design"`

### Requirement: Get session details
系统 SHALL 允许获取单个会话的详细信息，包括关联的 Skill 调用和工件。

#### Scenario: Get session with details
- **WHEN** GET `/api/sessions/:id`
- **THEN** system returns session with embedded `skill_calls` and `artifacts` arrays

#### Scenario: Session not found
- **WHEN** GET `/api/sessions/:id` with non-existent ID
- **THEN** system returns 404 error

### Requirement: Update session
系统 SHALL 允许更新会话信息，如添加总结或标记完成状态。

#### Scenario: Update session summary
- **WHEN** PUT `/api/sessions/:id` with `{ "summary": "xxx", "completed": true }`
- **THEN** system updates session and returns updated record

#### Scenario: Update phase
- **WHEN** PUT `/api/sessions/:id` with `{ "phase": "testing" }`
- **THEN** system updates session phase, useful for tracking phase transitions

### Requirement: Delete session
系统 SHALL 允许删除 AI 会话记录，同时级联删除关联的 Skill 调用和工件。

#### Scenario: Delete session
- **WHEN** DELETE `/api/sessions/:id`
- **THEN** system deletes session and all related records, returns 200

### Requirement: Link session to task
系统 SHALL 允许将会话与看板任务关联，建立 AI 活动与具体任务的联系。

#### Scenario: Link session to task
- **WHEN** PUT `/api/sessions/:id` with `{ "task_id": 1 }`
- **THEN** system associates session with the specified task

#### Scenario: Get sessions by task
- **WHEN** GET `/api/tasks/:id/sessions`
- **THEN** system returns all sessions linked to that task
