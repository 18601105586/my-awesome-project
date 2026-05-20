package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	ColumnID    uint      `gorm:"not null;index" json:"column_id"`
	Position    int       `gorm:"not null" json:"position"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Column      Column    `gorm:"foreignKey:ColumnID" json:"column,omitempty"`
}

func (Task) TableName() string {
	return "tasks"
}
