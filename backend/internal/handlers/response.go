package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/repository"

	"gorm.io/gorm"
)

type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func RespondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func RespondError(w http.ResponseWriter, status int, message string) {
	RespondJSON(w, status, ErrorResponse{Success: false, Error: message})
}

func RespondSuccess(w http.ResponseWriter, status int, data interface{}) {
	RespondJSON(w, status, SuccessResponse{Success: true, Data: data})
}

var (
	columnRepo *repository.ColumnRepository
	taskRepo   *repository.TaskRepository
)

func InitRepositories(db *gorm.DB) {
	columnRepo = repository.NewColumnRepository(db)
	taskRepo = repository.NewTaskRepository(db)
}

// GetColumnRepo returns the column repository (for testing)
func GetColumnRepo() *repository.ColumnRepository {
	return columnRepo
}

// GetTaskRepo returns the task repository (for testing)
func GetTaskRepo() *repository.TaskRepository {
	return taskRepo
}
