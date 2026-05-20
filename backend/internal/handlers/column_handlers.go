package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

// CreateColumn handles POST /api/columns
func CreateColumn(c *gin.Context) {
	var col models.Column
	if err := c.ShouldBindJSON(&col); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	// Get next position
	maxPos, err := columnRepo.FindMaxPosition()
	if err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get column position")
		return
	}
	col.Position = maxPos

	if err := columnRepo.Create(&col); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to create column")
		return
	}

	RespondSuccess(c.Writer, http.StatusCreated, col)
}

// ListColumns handles GET /api/columns
func ListColumns(c *gin.Context) {
	cols, err := columnRepo.FindAll()
	if err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to list columns")
		return
	}
	RespondSuccess(c.Writer, http.StatusOK, cols)
}

// GetColumn handles GET /api/columns/:id
func GetColumn(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid column ID")
		return
	}

	col, err := columnRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Column not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get column")
		return
	}
	RespondSuccess(c.Writer, http.StatusOK, col)
}

// UpdateColumn handles PUT /api/columns/:id
func UpdateColumn(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid column ID")
		return
	}

	col, err := columnRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Column not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get column")
		return
	}

	if err := c.ShouldBindJSON(col); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	if err := columnRepo.Update(col); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to update column")
		return
	}

	RespondSuccess(c.Writer, http.StatusOK, col)
}

// ReorderColumn handles PATCH /api/columns/:id
func ReorderColumn(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid column ID")
		return
	}

	var req struct {
		NewPosition int `json:"new_position"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondError(c.Writer, http.StatusBadRequest, err.Error())
		return
	}

	col, err := columnRepo.FindByID(uint(id))
	if err != nil {
		if err == repository.ErrNotFound {
			RespondError(c.Writer, http.StatusNotFound, "Column not found")
			return
		}
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to get column")
		return
	}

	oldPos := col.Position

	// Shift positions
	if req.NewPosition > oldPos {
		// Moving down: shift positions between old and new up
		if err := columnRepo.ShiftPositionsBetween(oldPos, req.NewPosition, -1); err != nil {
			RespondError(c.Writer, http.StatusInternalServerError, "Failed to reorder column")
			return
		}
	} else if req.NewPosition < oldPos {
		// Moving up: shift positions between new and old down
		if err := columnRepo.ShiftPositionsBetween(req.NewPosition, oldPos, 1); err != nil {
			RespondError(c.Writer, http.StatusInternalServerError, "Failed to reorder column")
			return
		}
	}

	col.Position = req.NewPosition
	if err := columnRepo.Update(col); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to update column position")
		return
	}

	RespondSuccess(c.Writer, http.StatusOK, col)
}

// DeleteColumn handles DELETE /api/columns/:id
func DeleteColumn(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		RespondError(c.Writer, http.StatusBadRequest, "Invalid column ID")
		return
	}

	if err := columnRepo.Delete(uint(id)); err != nil {
		RespondError(c.Writer, http.StatusInternalServerError, "Failed to delete column")
		return
	}

	RespondSuccess(c.Writer, http.StatusOK, nil)
}
