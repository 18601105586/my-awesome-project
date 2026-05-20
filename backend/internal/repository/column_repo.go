package repository

import (
	"database/sql"
	"errors"

	"backend/internal/models"

	"gorm.io/gorm"
)

var ErrNotFound = errors.New("record not found")

type ColumnRepository struct {
	db *gorm.DB
}

func NewColumnRepository(db *gorm.DB) *ColumnRepository {
	return &ColumnRepository{db: db}
}

func (r *ColumnRepository) Create(col *models.Column) error {
	return r.db.Create(col).Error
}

func (r *ColumnRepository) FindAll() ([]models.Column, error) {
	var cols []models.Column
	err := r.db.Order("position ASC").Find(&cols).Error
	return cols, err
}

func (r *ColumnRepository) FindByID(id uint) (*models.Column, error) {
	var col models.Column
	err := r.db.First(&col, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &col, err
}

func (r *ColumnRepository) Update(col *models.Column) error {
	return r.db.Save(col).Error
}

func (r *ColumnRepository) Delete(id uint) error {
	return r.db.Delete(&models.Column{}, id).Error
}

func (r *ColumnRepository) FindMaxPosition() (int, error) {
	var max sql.NullInt64
	err := r.db.Model(&models.Column{}).Select("COALESCE(MAX(position), -1)").Scan(&max).Error
	if err != nil {
		return 0, err
	}
	return int(max.Int64) + 1, nil
}

func (r *ColumnRepository) ShiftPositionsAfter(afterPos int) error {
	return r.db.Model(&models.Column{}).
		Where("position > ?", afterPos).
		UpdateColumn("position", gorm.Expr("position + 1")).
		Error
}
