## Context

Building a kanban board management system to enable visual task organization. The system needs to support:
- Multiple columns representing workflow stages
- Tasks that can be moved between columns
- Position-based ordering for both columns and tasks

Current state: No existing kanban functionality in the codebase.

## Goals / Non-Goals

**Goals:**
- Define data models for Column and Task entities
- Implement CRUD operations for columns and tasks
- Support reordering of columns via position field
- Support moving tasks between columns

**Non-Goals:**
- Frontend UI implementation (out of scope for this change)
- User authentication/authorization (assumed handled separately)
- Task assignments, due dates, labels (future enhancements)
- Real-time collaboration (WebSocket updates)

## Decisions

**Position-based ordering over timestamp-based**
- Decision: Use explicit `position` integer field for ordering
- Rationale: More predictable, easier to reorder in batches, no floating point precision issues
- Alternative: Timestamp-based ordering (created_at) - harder to reorder, requires floating point

**Single column per task vs multiple**
- Decision: Task belongs to exactly one column (foreign key)
- Rationale: Simpler data model, matches typical kanban behavior
- Alternative: Many-to-many relationship - unnecessary complexity for MVP

**Database-level vs application-level position updates**
- Decision: Application manages position, database enforces via unique constraint (column_id, position)
- Rationale: Simpler logic, easier to reason about
- Alternative: Database triggers - harder to debug, vendor-specific

## Risks / Trade-offs

**Position reordering can cause conflicts** → Mitigation: Use database transactions and handle unique constraint violations with retry logic

**No soft delete** → Mitigation: Add deleted_at field if data retention becomes a requirement

**Position as integer can overflow** → Mitigation: Use BIGINT, re-index if needed (rare edge case)

## Migration Plan

1. Create database migrations for `columns` and `tasks` tables
2. Run migrations to create tables
3. Deploy backend API endpoints
4. No data migration needed (new feature)

Rollback: Drop tables, remove API routes

## Open Questions

- What is the maximum number of columns/tasks per board? (Consider adding limits later)
- Should position be per-board or global? (Assuming per-board for now)
