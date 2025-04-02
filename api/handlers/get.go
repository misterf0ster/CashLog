package handlers

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"tbc/db"
	"tbc/models"
	"time"
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
	dateFrom := c.QueryParam("dateFrom")
	dateTo := c.QueryParam("dateTo")

	// Парсинг дат
	from, err := time.Parse("02.01.2006", dateFrom)
	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "error",
			Message: "Неверный формат dateFrom. Используйте DD.MM.YYYY",
		})
	}

	to, err := time.Parse("02.01.2006", dateTo)
	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "error",
			Message: "Неверный формат dateTo. Используйте DD.MM.YYYY",
		})
	}

	// Устанавливаем время для точного диапазона
	from = time.Date(from.Year(), from.Month(), from.Day(), 0, 0, 0, 0, from.Location())
	to = time.Date(to.Year(), to.Month(), to.Day(), 23, 59, 59, 0, to.Location())

	var expenses []models.Expenses
	if err := db.DB.Where("date BETWEEN ? AND ?", from, to).Find(&expenses).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "error",
			Message: "Ошибка при получении данных",
		})
	}

	formatted := make([]map[string]interface{}, len(expenses))
	for i, exp := range expenses {
		formatted[i] = exp.Formatted()
	}

	return c.JSON(http.StatusOK, expenses)
}
