package handlers

import (
	"net/http"
	"tbc/db"
	"tbc/models"

	"github.com/labstack/echo/v4"
)

// Добавление расхода
func PostEx(c echo.Context) error {
	var req models.Expenses
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid request body: " + err.Error(),
		})
	}

	// Валидация обязательных полей
	if req.Place == "" || req.Category == "" || req.Amount <= 0 {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Place, category, and amount are required",
		})
	}

	expense := models.Expenses{
		ID:       req.ID,
		Place:    req.Place,
		Category: req.Category,
		Amount:   req.Amount,
		Comment:  req.Comment,
		Date:     req.Date,
	}

	if err := db.DB.Create(&expense).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "Error",
			Message: "Could not create expense: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, models.Response{
		Status:  "Success",
		Message: "Expense created successfully",
	})
}
