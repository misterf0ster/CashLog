package handlers

import (
	"backend/internal/models"
	DataBase "backend/internal/storage"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

// <------------------------------------GET--------------------------------------->
// Получение списка расходов
func GetList(c echo.Context) error {
	var expenses []models.Expenses
	if err := DataBase.DB.Find(&expenses).Error; err != nil {
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
	if err := DataBase.DB.Where("date BETWEEN ? AND ?", from, to).Find(&expenses).Error; err != nil {
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

// <------------------------------------POST--------------------------------------------->
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

	if err := DataBase.DB.Create(&expense).Error; err != nil {
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

// <------------------------------------PATCH--------------------------------------->
func PatchUpdate(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	var requestData struct {
		Place    string  `json:"place"`
		Category string  `json:"category"`
		Amount   float64 `json:"amount"`
		Date     string  `json:"date"`
		Comment  string  `json:"comment"`
	}

	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid ID",
		})
	}

	if err := c.Bind(&requestData); err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Invalid input",
		})
	}

	// // Обновляем только разрешенные поля
	// allowedFields := []string{"place", "category", "amount", "comment", "date"}
	// for key := range requestData {
	// 	if !contains(allowedFields, key) {
	// 		return c.JSON(http.StatusBadRequest, models.Response{
	// 			Status:  "Error",
	// 			Message: "Invalid field: " + key,
	// 		})
	// 	}
	// }

	// Обновление записи
	result := DataBase.DB.Model(&models.Expenses{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"place":    requestData.Place,
			"category": requestData.Category,
			"amount":   requestData.Amount,
			"date":     requestData.Date,
			"comment":  requestData.Comment,
		})

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, models.Response{
			Status:  "Error",
			Message: "Database update failed",
		})
	}

	return c.JSON(http.StatusOK, models.Response{
		Status:  "Success",
		Message: "Expense updated successfully",
	})
}

// Функция для проверки полей
// func contains(slice []string, item string) bool {
// 	for _, s := range slice {
// 		if s == item {
// 			return true
// 		}
// 	}
// 	return false
// }

// <------------------------------------DELETE--------------------------------------->
func Delete(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil {
		return c.JSON(http.StatusBadRequest, models.Response{
			Status:  "Error",
			Message: "Bad ID",
		})
	}

	if err := DataBase.DB.Delete(&models.Expenses{}, id).Error; err != nil {
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
