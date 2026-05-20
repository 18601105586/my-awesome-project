package repository

import (
	"log"

	"backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewDatabase(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate models
	if err := db.AutoMigrate(&models.Column{}, &models.Task{}); err != nil {
		return nil, err
	}

	log.Println("Database migrated successfully")
	return db, nil
}
