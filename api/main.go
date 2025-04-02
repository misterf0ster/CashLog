package main

import (
	"net/http"
	"tbc/db"
	"tbc/handlers"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db.PostgreSQL()
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderContentType},
	}))

	e.GET("/api/expenses", handlers.GetList)            //Получение списка расходов
	e.GET("/api/expenses/search", handlers.GetListData) //Получение данных по дате

	e.POST("/api/expenses", handlers.PostEx) //Добавление расхода

	e.DELETE("/api/expenses/:id", handlers.Delete) //Удаление расхода

	e.Start(":8080")
}
