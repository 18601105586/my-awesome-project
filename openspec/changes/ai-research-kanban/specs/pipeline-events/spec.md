## ADDED Requirements

### Requirement: Pipeline event webhook
系统 SHALL 提供 Webhook 端点接收外部流水线事件，如代码提交、构建结果等。

#### Scenario: Receive commit event
- **WHEN** POST to `/api/webhooks/pipeline` with `{ "type": "commit", "author": "xxx", "message": "xxx", "sha": "abc123" }`
- **THEN** system creates pipeline event record and returns 200

#### Scenario: Receive build success
- **WHEN** POST to `/api/webhooks/pipeline` with `{ "type": "build", "status": "success", "duration_ms": 30000 }`
- **THEN** system creates build success event

#### Scenario: Receive build failure
- **WHEN** POST to `/api/webhooks/pipeline` with `{ "type": "build", "status": "failed", "error": "xxx" }`
- **THEN** system creates build failure event

#### Scenario: Validate webhook payload
- **WHEN** POST to `/api/webhooks/pipeline` without required `type` field
- **THEN** system returns 400 error

### Requirement: Pipeline event authentication
系统 SHALL 支持简单的 token 验证，确保 Webhook 调用的安全性。

#### Scenario: Valid token
- **WHEN** POST to `/api/webhooks/pipeline` with header `X-Webhook-Token: <valid-token>`
- **THEN** system accepts the request

#### Scenario: Missing token
- **WHEN** POST to `/api/webhooks/pipeline` without token header
- **THEN** system returns 401 unauthorized

#### Scenario: Invalid token
- **WHEN** POST to `/api/webhooks/pipeline` with invalid token
- **THEN** system returns 401 unauthorized

### Requirement: List pipeline events
系统 SHALL 允许查询流水线事件，支持按类型和时间范围过滤。

#### Scenario: List all events
- **WHEN** GET `/api/pipeline-events`
- **THEN** system returns all events ordered by `created_at` DESC

#### Scenario: Filter by event type
- **WHEN** GET `/api/pipeline-events?type=build`
- **THEN** system returns only build-type events

#### Scenario: Filter by status
- **WHEN** GET `/api/pipeline-events?status=failed`
- **THEN** system returns only failed events

### Requirement: Pipeline statistics
系统 SHALL 提供流水线统计信息，如构建成功率、平均构建时间等。

#### Scenario: Get pipeline stats
- **WHEN** GET `/api/pipeline-events/stats`
- **THEN** system returns `{ "total_commits": 10, "builds": { "success": 8, "failed": 2 }, "avg_build_time_ms": 25000 }`
