package main

import (
	"log"
	"os"

	"backend/internal/server"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := server.NewServer()

	log.Printf("Server starting on port %s", port)
	if err := srv.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
