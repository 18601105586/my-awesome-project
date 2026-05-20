package repository

import (
	"testing"

	"backend/internal/models"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestTaskRepository(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect database: %v", err)
	}

	db.AutoMigrate(&models.Column{}, &models.Task{})

	colRepo := NewColumnRepository(db)
	taskRepo := NewTaskRepository(db)

	// Setup
	colRepo.Create(&models.Column{Name: "To Do", Position: 0})

	t.Run("Create task", func(t *testing.T) {
		task := &models.Task{Title: "Test Task", ColumnID: 1, Position: 0}
		err := taskRepo.Create(task)
		assert.NoError(t, err)
		assert.NotZero(t, task.ID)
	})

	t.Run("Get tasks by column", func(t *testing.T) {
		tasks, err := taskRepo.FindByColumnID(1)
		assert.NoError(t, err)
		assert.Len(t, tasks, 1)
	})

	t.Run("Get task by ID", func(t *testing.T) {
		task, err := taskRepo.FindByID(1)
		assert.NoError(t, err)
		assert.Equal(t, "Test Task", task.Title)
	})

	t.Run("Update task", func(t *testing.T) {
		task, _ := taskRepo.FindByID(1)
		task.Title = "Updated Task"
		err := taskRepo.Update(task)
		assert.NoError(t, err)

		updated, _ := taskRepo.FindByID(1)
		assert.Equal(t, "Updated Task", updated.Title)
	})

	t.Run("Delete task", func(t *testing.T) {
		err := taskRepo.Delete(1)
		assert.NoError(t, err)

		_, err = taskRepo.FindByID(1)
		assert.Error(t, err)
	})
}
