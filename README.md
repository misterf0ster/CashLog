# CashLog - Учет личных расходов

![GitHub](https://img.shields.io/badge/Go-1.20+-00ADD8?logo=go)
![GitHub](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)
![GitHub](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

Простое веб-приложение для учета личных расходов с возможностью добавления и удаления записей.

## 📌 Функционал
- ✅ Добавление новых расходов
- ❌ Удаление существующих записей (Происходи посредством свайпа строки с записью влево)
- 📊 Графики (Предоставляет данные за определенный период)
- 🔍 Фильтрация по категориям (в разработке)
- 🔒 Авторизация JWT (в разработке)

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

| Метод  | Эндпоинт                | Параметры (JSON)                          | Описание                      |
|--------|-------------------------|------------------------------------------|-------------------------------|
| GET    | `/api/expenses`         | -                                        | Получение всех расходов       |
| GET    | `/api/expenses/search`  | -                                        | Получение статистики расходов |
| POST   | `/api/expenses`         | `{"place": string, "category": string, "amount": float, "date": "YYYY-MM-DD", "comment": string}` | Добавление нового расхода     |
| DELETE | `/api/expenses/{id}`    | -                                        | Удаление записи по ID         |



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
cd CashLog
docker-compose up -d

````

### 2. Запуск бэкенда 
```bash
cd backend
go mod download
go run cmd/server/main.go
```

### 3. Запуск фронтенда
```bash
cd frontend
npm install
node server.js
```


### Update 0.1
Добавлен функцианал кнопки "Cтатистика", теперь можно посмотеть на траты за определенный период времени в процентном соотношении.