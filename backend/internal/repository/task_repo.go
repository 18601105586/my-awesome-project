package repository

import (
	"database/sql"
	"errors"

	"backend/internal/models"

	"gorm.io/gorm"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task *models.Task) error {
	return r.db.Create(task).Error
}

func (r *TaskRepository) FindAll() ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Preload("Column").Order("column_id, position ASC").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) FindByColumnID(columnID uint) ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Where("column_id = ?", columnID).Order("position ASC").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) FindByID(id uint) (*models.Task, error) {
	var task models.Task
	err := r.db.Preload("Column").First(&task, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &task, err
}

func (r *TaskRepository) Update(task *models.Task) error {
	return r.db.Save(task).Error
}

func (r *TaskRepository) Delete(id uint) error {
	return r.db.Delete(&models.Task{}, id).Error
}

func (r *TaskRepository) FindMaxPositionInColumn(columnID uint) (int, error) {
	var max sql.NullInt64
	err := r.db.Model(&models.Task{}).
		Where("column_id = ?", columnID).
		Select("COALESCE(MAX(position), -1)").
		Scan(&max).
		Error
	if err != nil {
		return 0, err
	}
	return int(max.Int64) + 1, nil
}

func (r *TaskRepository) MoveToColumn(task *models.Task, newColumnID uint, newPosition int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Shift positions in target column if needed
		if newPosition >= 0 {
			tx.Model(&models.Task{}).
				Where("column_id = ? AND position >= ?", newColumnID, newPosition).
				UpdateColumn("position", gorm.Expr("position + 1")).
				Error
		}

		// Update task
		task.ColumnID = newColumnID
		task.Position = newPosition
		return tx.Save(task).Error
	})
}
