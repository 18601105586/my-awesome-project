-- CreateTable
CREATE TABLE "ai_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "taskId" INTEGER,
    "summary" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill_calls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skill_calls_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "taskId" INTEGER,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "language" TEXT,
    "content" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "artifacts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "artifacts_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pipeline_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "author" TEXT,
    "message" TEXT,
    "sha" TEXT,
    "durationMs" INTEGER,
    "error" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "columnId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'implementation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "columns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("columnId", "createdAt", "description", "id", "position", "title", "updatedAt") SELECT "columnId", "createdAt", "description", "id", "position", "title", "updatedAt" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_columnId_idx" ON "tasks"("columnId");
CREATE INDEX "tasks_phase_idx" ON "tasks"("phase");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ai_sessions_phase_idx" ON "ai_sessions"("phase");

-- CreateIndex
CREATE INDEX "ai_sessions_taskId_idx" ON "ai_sessions"("taskId");

-- CreateIndex
CREATE INDEX "skill_calls_sessionId_idx" ON "skill_calls"("sessionId");

-- CreateIndex
CREATE INDEX "skill_calls_skill_idx" ON "skill_calls"("skill");

-- CreateIndex
CREATE INDEX "artifacts_sessionId_idx" ON "artifacts"("sessionId");

-- CreateIndex
CREATE INDEX "artifacts_taskId_idx" ON "artifacts"("taskId");

-- CreateIndex
CREATE INDEX "artifacts_type_idx" ON "artifacts"("type");

-- CreateIndex
CREATE INDEX "pipeline_events_type_idx" ON "pipeline_events"("type");

-- CreateIndex
CREATE INDEX "pipeline_events_status_idx" ON "pipeline_events"("status");
