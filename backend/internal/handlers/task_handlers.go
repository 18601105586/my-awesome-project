package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

// CreateTask handles POST /api/tasks
func CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	// Validate required fields
	if task.Title == "" {
		RespondError(c.Writer, http.StatusBadRequest, "Title is required")
		return
	}
	if task.ColumnID == 0 {
		RespondError(c.Writer, http.StatusBadRequest, "ColumnID is required")
		return
	}

	// Get next position in column
	maxPos, err := taskRepo.FindMaxPositionInColumn(task.ColumnID)
	if err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get task position")
		return
	}
	task.Position = maxPos

	if err := taskRepo.Create(&task); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to create task")
		return
	}

	RespondSuccess(c.Writer, http.StatusCreated, task)
}

// ListTasks handles GET /api/tasks
func ListTasks(c *gin.Context) {
	tasks, err := taskRepo.FindAll()
	if err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to list tasks")
		return
	}
	RespondSuccess(c.Writer, http.StatusOK, tasks)
}

// ListTasksByColumn handles GET /api/columns/:cid/tasks
func ListTasksByColumn(c *gin.Context) {
	columnID, err := strconv.ParseUint(c.Param("cid"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid column ID")
		return
	}

	tasks, err := taskRepo.FindByColumnID(uint(columnID))
	if err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to list tasks")
		return
	}
	RespondSuccess(c.Writer, http.StatusOK, tasks)
}

// GetTask handles GET /api/tasks/:id
func GetTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid task ID")
		return
	}

	task, err := taskRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Task not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get task")
		return
	}
	RespondSuccess(c.Writer, http.StatusOK, task)
}

// UpdateTask handles PUT /api/tasks/:id
func UpdateTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid task ID")
		return
	}

	task, err := taskRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Task not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get task")
		return
	}

	if err := c.ShouldBindJSON(task); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	if err := taskRepo.Update(task); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to update task")
		return
	}

	RespondSuccess(c.Writer, http.StatusOK, task)
}

// MoveTask handles PATCH /api/tasks/:id
func MoveTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var req struct {
		ColumnID    uint `json:"column_id"`
		NewPosition int  `json:"new_position"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	task, err := taskRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Task not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get task")
		return
	}

	if err := taskRepo.MoveToColumn(task, req.ColumnID, req.NewPosition); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to move task")
		return
	}

	// Reload task with column
	updatedTask, _ := taskRepo.FindByID(uint(id))
	RespondSuccess(c.Writer, http.StatusOK, updatedTask)
}

// DeleteTask handles DELETE /api/tasks/:id
func DeleteTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid task ID")
		return
	}

	if err := taskRepo.Delete(uint(id)); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	RespondSuccess(c.Writer, http.StatusOK, nil)
}
