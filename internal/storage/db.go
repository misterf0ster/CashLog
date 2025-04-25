package storage

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
)

type DB struct {
	DB *pgx.Conn
}

// Открываю коннект
func Open(url string) (*DB, error) {
	conn, err := pgx.Connect(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("database connection error: %w", err)
	}

	if err := conn.Ping(context.Background()); err != nil {
		conn.Close(context.Background())
		return nil, fmt.Errorf("error checking database connection: %w", err)
	}

	log.Println("successfully connected to database")
	return &DB{DB: conn}, nil
}

// Закрываю соединение
func (db *DB) Close() {
	if db.DB != nil {
		db.DB.Close(context.Background())
		log.Println("Closed db connection")
	}
}
