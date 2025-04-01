package handlers

import (
	"net/http"
	"strconv"
	"tbc/db"
	"tbc/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Удаление расхода
func Delete(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Bad ID",
		})
	}

	if err := db.DB.Delete(&models.Expenses{}, id).Error; err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Could not delete the data",
		})
	}

	return c.JSON(http.StatusOK, models.Response{
		Status:  "Success",
		Message: "Data was deleted",
	})
}
