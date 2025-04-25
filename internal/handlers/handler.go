package handlers

import (
	m "CashLog/internal/models"
	psql "CashLog/internal/storage"
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/labstack/echo/v4"
)

type Handler struct {
	db *psql.DB
}

func New(db *psql.DB) *Handler {
	return &Handler{db: db}
}

// <------------------------------------GET--------------------------------------->
// Получение списка расходов
func (h *Handler) GetList(c *fiber.Ctx) error {
	rows, err := h.db.DB.Query(context.Background(), `SELECT id, title, description, status, created_at, updated_at FROM tasks`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Error fetching data",
		})
	}
	defer rows.Close()

	var expenses []*m.Expenses
	for rows.Next() {
		var t *m.Expenses
		if err := rows.Scan(&t.ID, &t.Place, &t.Category, &t.Amount, &t.Comment, &t.Date); err == nil {
			expenses = append(expenses, t)
		}
	}

	return c.Status(200).JSON(expenses)
}

// Получение данных по дате
func GetListData(c echo.Context) error {
	dateFrom := c.QueryParam("dateFrom")
	dateTo := c.QueryParam("dateTo")

	// Парсинг дат
	from, err := time.Parse("02.01.2006", dateFrom)
	if err != nil {
		return c.JSON(http.StatusBadRequest, m.Response{
			Status:  "error",
			Message: "Неверный формат dateFrom. Используйте DD.MM.YYYY",
		})
	}

	to, err := time.Parse("02.01.2006", dateTo)
	if err != nil {
		return c.JSON(http.StatusBadRequest, m.Response{
			Status:  "error",
			Message: "Неверный формат dateTo. Используйте DD.MM.YYYY",
		})
	}

	// Устанавливаем время для точного диапазона
	from = time.Date(from.Year(), from.Month(), from.Day(), 0, 0, 0, 0, from.Location())
	to = time.Date(to.Year(), to.Month(), to.Day(), 23, 59, 59, 0, to.Location())

	var expenses []m.Expenses
	if err := psql.DB.Where("date BETWEEN ? AND ?", from, to).Find(&expenses).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, m.Response{
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
func (h *Handler) PostTask(c *fiber.Ctx) error {
	var t *m.RequestData
	if err := c.BodyParser(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Bad request"})
	}

	err := h.db.DB.QueryRow(
		context.Background(), `INSERT INTO tasks (id, place, category, amount, date, comment) VALUES ($1, $2, $3, $4, $5,) RETURNING id, created_at, updated_at`,
		t.Place, t.Category, t.Amount, t.Date, t.Comment).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Failed to create task",
		})
	}

	if t.Category != "new" || t.Category || "in_progress" || t.Category != "done" {
		return c.Status(400).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Invalid category",
		})
	}
	return c.Status(200).JSON(fiber.Map{
		"Status":  "Success",
		"message": "Task add successfully",
	})
}

// <------------------------------------PUT--------------------------------------->
func (h *Handler) PutUpdate(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Bad ID"})
	}

	var t *m.RequestData
	if err := c.BodyParser(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Bad request: Invalid data format"})
	}

	t.UpdatedAt = time.Now()

	_, err = h.db.DB.Exec(
		context.Background(),
		`UPDATE tasks SET place=$1, category=$2, amount=$3, date=$4, comment=$5, updated_at=$6 WHERE id=$7`,
		t.Place, t.Category, t.Amount, t.Date, t.Comment, t.UpdatedAt, id,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Update failed",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"Status":  "Success",
		"message": "Data was updated successfully",
	})
}

// <------------------------------------DELETE--------------------------------------->
func (h *Handler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Invalid ID",
		})
	}

	result, err := h.db.DB.Exec(context.Background(), `DELETE FROM tasks WHERE id=$1`, id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Could not delete",
		})
	}
	if result.RowsAffected() == 0 {
		return c.Status(404).JSON(fiber.Map{
			"Status":  "Error",
			"Message": "Data not found",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"Status":  "Success",
		"Message": "Data was deleted",
	})
}
