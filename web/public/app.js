function initFlatpickr() {
    if (document.getElementById("date")) {
        flatpickr("#date", {
            enableTime: true,
            dateFormat: "d.m.Y H:i",
            locale: "ru",
            time_24hr: true,
            defaultDate: new Date(),
            allowInput: true
        });
    }

    if (document.getElementById("searchDate")) {
        flatpickr("#searchDate", {
            dateFormat: "d.m.Y",
            locale: "ru"
        });
    }
}

function initDatePickers() {
    // Календарь для добавления расходов (с временем)
    flatpickr("#datetime", {
        enableTime: true,
        dateFormat: "d.m.Y H:i", // Формат для отображения
        altInput: true,
        altFormat: "d.m.Y H:i",
        locale: "ru",
        time_24hr: true,
        defaultDate: new Date(),
        allowInput: false
    });

    // Календарь для поиска (только дата)
    flatpickr("#searchDate", {
        dateFormat: "d.m.Y",
        locale: "ru",
        static: true
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "http://localhost:8080/api/expenses";
    const form = document.getElementById("expenseForm");
    const expenseList = document.getElementById("tableBody");
    const addBtn = document.getElementById("addBtn");
    const addModal = document.getElementById("addModal");
    const closeModal = addModal.querySelector(".close");
    const searchBtn = document.getElementById("searchBtn");
    const searchModal = document.getElementById("searchModal");
    const searchClose = searchModal.querySelector(".close");
    const searchForm = document.getElementById("searchForm");
    const resetSearch = document.getElementById("resetSearch");

    initDatePickers();
    async function fetchExpensess() {
        try {
            const response = await fetch(apiBaseUrl);
            if (!response.ok) throw new Error("Ошибка загрузки данных");
            const expenses = await response.json();

            // Временный вывод в консоль для проверки данных
            console.log("Данные из БД:", expenses);

            renderExpenses(expenses);
        } catch (error) {
            console.error("Ошибка при получении расходов:", error);
        }
    }

    fetchExpensess();
    // Код для переключения темы
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.add("dark-theme");
        themeToggle.textContent = "☀️";
    }

    // Обработчик клика
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-theme");

        // Меняем иконку
        themeToggle.textContent = body.classList.contains("dark-theme")
            ? "☀️"
            : "🌙";

        // Сохраняем в localStorage
        localStorage.setItem("theme",
            body.classList.contains("dark-theme") ? "dark" : "light"
        );
    });

    // Обработчики модального окна
    addBtn.addEventListener("click", () => {
        addModal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        addModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === addModal) {
            addModal.style.display = "none";
        }
    });


    // Получение списка расходов
    async function fetchExpenses() {
        try {
            const response = await fetch(apiBaseUrl);
            if (!response.ok) throw new Error("Ошибка загрузки данных");
            const expenses = await response.json();
            renderExpenses(expenses);
        } catch (error) {
            console.error("Ошибка при получении расходов:", error);
        }
    }


    // Отображение списка
    function renderExpenses(expenses) {
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = "";

        // Проверяем на массив
        if (!Array.isArray(expenses)) {
            console.error("Ожидался массив расходов, получено:", expenses);
            return;
        }

        expenses.forEach((expense) => {
            const normalizedExpense = {
                id: expense["id "] || expense.id, // Обрабатываем оба варианта
                place: expense.place,
                category: expense.category,
                amount: expense.amount,
                date: expense.date,
                comment: expense.comment
            };

            // Проверяем наличие ID
            if (normalizedExpense.id === undefined) {
                console.error("Не удалось получить ID для записи:", expense);
                return;
            }

            const row = document.createElement("tr");
            row.className = "expense-row";

            // Форматирование даты
            let formattedDate = "Не указано";
            if (normalizedExpense.date) {
                try {
                    const dateObj = new Date(normalizedExpense.date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                } catch (e) {
                    console.error("Ошибка форматирования даты:", e);
                }
            }

            // Заполняем строку таблицы
            row.innerHTML = `
            <td>${normalizedExpense.id}</td>
            <td>${normalizedExpense.place || '—'}</td>
            <td>${normalizedExpense.category || '—'}</td>
            <td>${normalizedExpense.amount ? `${normalizedExpense.amount} ₽` : '0 ₽'}</td>
            <td>${formattedDate}</td>
            <td>${normalizedExpense.comment || '—'}</td>
            <td class="delete-cell"><div class="delete-btn">🗑️</div></td>
        `;

            // Обработчик удаления
            const deleteBtn = row.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm("Вы уверены, что хотите удалить эту запись?")) {
                    try {
                        const response = await fetch(`${apiBaseUrl}/${normalizedExpense.id}`, {
                            method: "DELETE"
                        });
                        if (!response.ok) throw new Error("Ошибка удаления");
                        fetchExpenses();
                    } catch (error) {
                        console.error("Ошибка при удалении:", error);
                        alert("Не удалось удалить запись");
                    }
                }
            });

            tableBody.appendChild(row);

            let startX, currentX;
            let isSwiped = false;

            // Функция для обработки движения
            const handleMove = (x) => {
                currentX = x;
                const diff = startX - currentX;

                if (diff > 30) {
                    row.classList.add("swiped");
                    isSwiped = true;
                } else if (diff < -30) {
                    row.classList.remove("swiped");
                    isSwiped = false;
                }
            };

            // Обработчики для мыши
            row.addEventListener("mousedown", (e) => {
                startX = e.clientX;
                isSwiped = false;
                e.preventDefault();
            });

            row.addEventListener("mousemove", (e) => {
                if (startX === undefined) return;
                handleMove(e.clientX);
            });

            row.addEventListener("mouseup", () => {
                if (!isSwiped) {
                    row.classList.remove("swiped");
                }
                startX = undefined;
            });

            row.addEventListener("mouseleave", () => {
                if (!isSwiped) {
                    row.classList.remove("swiped");
                }
                startX = undefined;
            });

            // Обработчики для тач-устройств
            row.addEventListener("touchstart", (e) => {
                startX = e.touches[0].clientX;
                isSwiped = false;
            }, { passive: true });

            row.addEventListener("touchmove", (e) => {
                if (startX === undefined) return;
                handleMove(e.touches[0].clientX);
            }, { passive: true });

            row.addEventListener("touchend", () => {
                if (!isSwiped) {
                    row.classList.remove("swiped");
                }
                startX = undefined;
            });

            // Клик по строке (если не было свайпа)
            row.addEventListener("click", (e) => {
                if (!isSwiped && startX === undefined) {
                }
            });

            tableBody.appendChild(row);
        });
    }

    initFlatpickr();

    // Добавление нового расхода
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Получаем выбранную дату из flatpickr
        const fp = document.getElementById("date")._flatpickr;
        const selectedDate = fp.selectedDates[0];

        const expenseData = {
            place: document.getElementById("place").value,
            category: document.getElementById("category").value,
            amount: parseFloat(document.getElementById("amount").value),
            date: selectedDate.toISOString(),
            comment: document.getElementById("comment").value
        };

        console.log("Отправляемые данные:", expenseData); // Для отладки

        if (!expenseData.place || !expenseData.category || !expenseData.amount) {
            alert("Заполните обязательные поля (место, категория, сумма)");
            return;
        }

        if (!expenseData.date) {
            const now = new Date();
            expenseData.date = now.toISOString();
        }

        try {
            const response = await fetch(apiBaseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) throw new Error("Ошибка при добавлении расхода");

            form.reset();
            addModal.style.display = "none";
            fetchExpenses();
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
        }


    });

    // Удаление расхода
    expenseList.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const id = event.target.dataset.id;
            try {
                const response = await fetch(`${apiBaseUrl}/${id}`, { method: "DELETE" });
                if (!response.ok) throw new Error("Ошибка при удалении");
                fetchExpenses();
            } catch (error) {
                console.error("Ошибка при удалении:", error);
            }
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".expense-row")) {
            document.querySelectorAll(".expense-row").forEach(row => {
                row.classList.remove("swiped");
            });
        }
    });

    // Открытие модального окна поиска
    searchBtn.addEventListener("click", () => {
        searchModal.style.display = "block";
    });

    // Закрытие модального окна поиска
    searchClose.addEventListener("click", () => {
        searchModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === searchModal) {
            searchModal.style.display = "none";
        }
    });

    // Обработчик формы поиска
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const date = document.getElementById("searchDate").value;

        if (!date) {
            alert("Выберите дату для поиска");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/search?date=${date}`);
            if (!response.ok) throw new Error("Ошибка поиска");
            const results = await response.json();
            renderExpenses(results);
            searchModal.style.display = "none";
        } catch (error) {
            console.error("Ошибка при поиске:", error);
        }
    });

    // Сброс поиска
    resetSearch.addEventListener("click", () => {
        document.getElementById("searchDate").value = "";
        fetchExpenses();
        searchModal.style.display = "none";
    });

    fetchExpenses();

});

