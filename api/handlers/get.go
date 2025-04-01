package handlers

import (
	"errors"
	"net/http"
	"tbc/db"
	"tbc/models"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// Получение списка расходов
func GetList(c echo.Context) error {
	var expenses []models.Expenses
	if err := db.DB.Find(&expenses).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "Error",
			Message: "Could not fetch expenses",
		})
	}
	return c.JSON(http.StatusOK, &expenses)
}

// Получение данных по дате
func GetListData(c echo.Context) error {
	dateParam := c.Param("date")
	_, err := time.Parse("2006-01-02", dateParam)

	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid data",
		})
	}

	var expenses []models.Expenses
	result := db.DB.Where("DATE(date) = ?", dateParam).Find(&expenses)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, models.Response{
				Status:  "Error",
				Message: "Data not find",
			})
		}
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "Error",
			Message: "Error when get a data",
		})
	}

	return c.JSON(http.StatusOK, expenses)
}
