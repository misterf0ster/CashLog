# CashLog - Учет личных расходов

![GitHub](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![GitHub](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)
![GitHub](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

Простое веб-приложение для учета личных расходов с возможностью добавления и удаления операций.

## 📌 Функционал
- ✅ Добавление новых расходов
- ❌ Удаление существующих записей
- 📊 Просмотр истории операций (в разработке)
- 🔍 Фильтрация по категориям (в разработке)

## 🛠 Технологии
**Frontend**:
- Node.js (v18+)
- Хост: `http://localhost:3000`

**Backend**:
- Go (1.20+)
- Хост: `http://localhost:8080`
- REST API

## 🌐 API Endpoints (Backend на Go)

### Основные эндпоинты

| Метод  | Эндпоинт                | Параметры (JSON)                          | Описание                          |
|--------|-------------------------|------------------------------------------|-----------------------------------|
| POST   | `/api/expenses`         | `{"amount": float, "category": string, "date": "YYYY-MM-DD", "description": string}` | Добавление нового расхода |
| DELETE | `/api/expenses/{id}`    | -                                        | Удаление записи по ID             |
| GET    | `/api/expenses`         | -                                        | Получение всех расходов           |
| GET    | `/api/expenses/{id}`    | -                                        | Получение конкретного расхода     |


**База данных**:
- PostgreSQL 15 (в Docker-контейнере)
- Порт: `5432`

## 🚀 Запуск проекта

### Предварительные требования
- Установленный Docker
- Go 1.20+
- Node.js 18+

### 1. Запуск базы данных
```bash
docker run --name cashlog-db -e POSTGRES_PASSWORD=12345 -p 5432:5432 -d postgres:15
