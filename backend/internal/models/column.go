package models

import (
	"time"

	"gorm.io/gorm"
)

type Column struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Position  int       `gorm:"not null" json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Tasks     []Task    `gorm:"foreignKey:ColumnID" json:"tasks,omitempty"`
}

func (Column) TableName() string {
	return "columns"
}
