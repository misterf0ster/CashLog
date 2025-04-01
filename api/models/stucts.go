package models

import (
	"time"
)

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Expenses struct {
	ID       int       `json:"id "`
	Place    string    `json:"place"`
	Category string    `json:"category"`
	Amount   float64   `json:"amount"`
	Comment  string    `json:"comment"`
	Date     time.Time `json:"date"`
}
