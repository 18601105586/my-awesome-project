package repository

import (
	"testing"

	"backend/internal/models"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestColumnRepository(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect database: %v", err)
	}

	db.AutoMigrate(&models.Column{})

	repo := NewColumnRepository(db)

	t.Run("Create column", func(t *testing.T) {
		col := &models.Column{Name: "To Do", Position: 0}
		err := repo.Create(col)
		assert.NoError(t, err)
		assert.NotZero(t, col.ID)
	})

	t.Run("Get all columns", func(t *testing.T) {
		cols, err := repo.FindAll()
		assert.NoError(t, err)
		assert.Len(t, cols, 1)
	})

	t.Run("Get column by ID", func(t *testing.T) {
		col, err := repo.FindByID(1)
		assert.NoError(t, err)
		assert.Equal(t, "To Do", col.Name)
	})

	t.Run("Update column", func(t *testing.T) {
		col, _ := repo.FindByID(1)
		col.Name = "In Progress"
		err := repo.Update(col)
		assert.NoError(t, err)

		updated, _ := repo.FindByID(1)
		assert.Equal(t, "In Progress", updated.Name)
	})

	t.Run("Delete column", func(t *testing.T) {
		err := repo.Delete(1)
		assert.NoError(t, err)

		_, err = repo.FindByID(1)
		assert.Error(t, err)
	})
}
