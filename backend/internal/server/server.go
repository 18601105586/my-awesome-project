package server

import (
	"log"

	"backend/internal/handlers"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Server struct {
	engine *gin.Engine
}

func NewServer(db *gorm.DB) *Server {
	// Initialize repositories with the database connection
	handlers.InitRepositories(db)

	s := &Server{
		engine: gin.Default(),
	}
	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	// CORS middleware
	s.engine.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := s.engine.Group("/api")
	{
		// Column routes
		api.POST("/columns", handlers.CreateColumn)
		api.GET("/columns", handlers.ListColumns)
		api.GET("/columns/:id", handlers.GetColumn)
		api.PUT("/columns/:id", handlers.UpdateColumn)
		api.PATCH("/columns/:id", handlers.ReorderColumn)
		api.DELETE("/columns/:id", handlers.DeleteColumn)

		// Task routes
		api.POST("/tasks", handlers.CreateTask)
		api.GET("/tasks", handlers.ListTasks)
		api.GET("/tasks/:id", handlers.GetTask)
		api.GET("/columns/:cid/tasks", handlers.ListTasksByColumn)
		api.PUT("/tasks/:id", handlers.UpdateTask)
		api.PATCH("/tasks/:id", handlers.MoveTask)
		api.DELETE("/tasks/:id", handlers.DeleteTask)
	}
}

func (s *Server) Run(addr string) error {
	log.Printf("Server starting on %s", addr)
	return s.engine.Run(addr)
}

// Repository access functions for testing
func GetColumnRepository() *repository.ColumnRepository {
	return handlers.GetColumnRepo()
}

func GetTaskRepository() *repository.TaskRepository {
	return handlers.GetTaskRepo()
}
