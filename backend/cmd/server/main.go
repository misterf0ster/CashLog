package main

import (
	handlers "backend/internal/api"
	DataBase "backend/internal/storage"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	DataBase.PostgreSQL()
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderContentType},
	}))

	e.GET("/api/expenses", handlers.GetList)            //Получение списка расходов
	e.GET("/api/expenses/search", handlers.GetListData) //Получение статистики по дате

	e.POST("/api/expenses", handlers.PostEx)           //Добавление расхода
	e.PATCH("/api/expenses/:id", handlers.PatchUpdate) //Редактирование расхода
	e.DELETE("/api/expenses/:id", handlers.Delete)     //Удаление расхода

	e.Start(":8080")
}
