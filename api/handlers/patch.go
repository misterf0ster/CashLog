package handlers

import (
	"net/http"
	"strconv"
	"tbc/db"
	"tbc/models"

	"github.com/labstack/echo/v4"
)

func PatchHandler(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid ID",
		})
	}

	var updates map[string]interface{}
	if err := c.Bind(&updates); err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid input",
		})
	}

	// Обновляем только разрешенные поля
	allowedFields := []string{"place", "category", "amount", "comment", "date"}
	for key := range updates {
		if !contains(allowedFields, key) {
			return c.JSON(http.StatusBadRequest, models.Response{
				Status:  "Error",
				Message: "Invalid field: " + key,
			})
		}
	}

	// Обновление записи
	result := db.DB.Model(&models.Expenses{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "Error",
			Message: "Could not update expense",
		})
	}

	return c.JSON(http.StatusOK, models.Response{
		Status:  "Success",
		Message: "Expense updated",
	})
}

// Вспомогательная функция для проверки полей
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
