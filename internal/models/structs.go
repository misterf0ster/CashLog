package models

import (
	"time"
)

type RequestData struct {
	ID        string    `json:"id"`
	Place     string    `json:"place"`
	Category  string    `json:"category"`
	Amount    float64   `json:"amount"`
	Date      string    `json:"date"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"update_at"`
}

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Expenses struct {
	ID       int       `json:"id"`
	Place    string    `json:"place"`
	Category string    `json:"category"`
	Amount   float64   `json:"amount"`
	Comment  string    `json:"comment"`
	Date     time.Time `json:"date"`
}

type ExpensesResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    []Expenses
}

func (e Expenses) Formatted() map[string]interface{} {
	return map[string]interface{}{
		"id":       e.ID,
		"place":    e.Place,
		"category": e.Category,
		"amount":   e.Amount,
		"date":     e.Date.Format("02.01.2006 15:04"), // DD.MM.YYYY HH:mm
		"comment":  e.Comment,
	}
}
