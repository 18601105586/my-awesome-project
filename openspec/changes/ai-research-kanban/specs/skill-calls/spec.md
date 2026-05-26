## ADDED Requirements

### Requirement: Record skill call
系统 SHALL 允许记录每次 Skill 工具的调用，包括输入、输出和执行时间。

#### Scenario: Record skill invocation
- **WHEN** POST to `/api/skill-calls` with `{ "session_id": 1, "skill": "planner", "input": "xxx", "output": "xxx", "duration_ms": 5000 }`
- **THEN** system creates skill call record with timestamp

#### Scenario: Validate session association
- **WHEN** POST to `/api/skill-calls` with non-existent `session_id`
- **THEN** system returns 400 error

### Requirement: List skill calls
系统 SHALL 允许查询 Skill 调用记录，支持按会话和 Skill 类型过滤。

#### Scenario: List calls by session
- **WHEN** GET `/api/sessions/:id/skills`
- **THEN** system returns all skill calls for that session

#### Scenario: Filter by skill type
- **WHEN** GET `/api/skill-calls?skill=code-review`
- **THEN** system returns only calls of that specific skill

### Requirement: Get skill call details
系统 SHALL 允许获取单个 Skill 调用的完整详情，包括输入输出内容。

#### Scenario: Get call details
- **WHEN** GET `/api/skill-calls/:id`
- **THEN** system returns full call record with input/output

### Requirement: Skill usage statistics
系统 SHALL 提供 Skill 使用统计，用于展示各工具的调用频率。

#### Scenario: Get usage statistics
- **WHEN** GET `/api/skill-calls/stats`
- **THEN** system returns `{ "planner": 5, "tdd": 3, "code-reviewer": 2, ... }`

#### Scenario: Stats by time range
- **WHEN** GET `/api/skill-calls/stats?from=2026-05-01&to=2026-05-31`
- **THEN** system returns statistics filtered by date range

### Requirement: Delete skill call
系统 SHALL 允许删除单个 Skill 调用记录。

#### Scenario: Delete skill call
- **WHEN** DELETE `/api/skill-calls/:id`
- **THEN** system deletes the record and returns 200
