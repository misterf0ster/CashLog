package main

import (
	cfg "CashLog/config"
	"CashLog/internal/handlers"
	psql "CashLog/internal/storage"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
)

func main() {

	cfg.LoadConfig()

	url := cfg.PsqlCfg()

	conn, err := psql.Open(url)
	if err != nil {
		log.Fatalf("Unable to connect to db: %v\n", err)
	}
	defer conn.Close()

	h := handlers.New(conn)
	app := fiber.New()

	expensesGroup := app.Group("/api/expenses")
	{
		expensesGroup.Get("/", h.GetList)           //Получение списка расходов
		expensesGroup.Get("/search", h.GetListData) //Получение статистики по дате
		expensesGroup.Post("/", h.PostEx)           //Добавление расхода
		expensesGroup.Put("/:id", h.PatchUpdate)    //Изменение расхода
		expensesGroup.Delete("/:id", h.Delete)      //Удаление расхода
	}

	port := os.Getenv("PORT")
	if port == "" {
		log.Printf("port not found")
	}

	log.Println("starting server on port", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("server startup error: " + err.Error())
	}
}
