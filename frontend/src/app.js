function initFlatpickr() {
    if (document.getElementById("date")) {
        flatpickr("#date", {
            enableTime: true,
            dateFormat: "d.m.Y H:i",
            locale: "ru",
            time_24hr: true,
            defaultDate: new Date(),
            allowInput: true,
            time_zone: "Europe/Moscow"
        });
    }

    if (document.getElementById("searchDateFrom")) {
        flatpickr("#searchDateFrom", {
            dateFormat: "d.m.Y",
            locale: "ru"
        });
    }

    if (document.getElementById("searchDateTo")) {
        flatpickr("#searchDateTo", {
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

    // Календарь для поиска
    flatpickr("#searchDateFrom", {
        dateFormat: "d.m.Y",
        locale: "ru",
        static: true
    });

    flatpickr("#searchDateTo", {
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

            renderExpenses(expenses);
        } catch (error) {
            console.error("Ошибка при получении расходов:", error);
        }
    }

    fetchExpensess();

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

    document.getElementById("backToList").addEventListener("click", () => {
        document.getElementById("expensesTable").style.display = "table";
        document.getElementById("chartContainer").style.display = "none";
    });


    // Отображение списка
    function renderExpenses(expenses) {
        const tableBody = document.getElementById("tableBody");
        tableBody.innerHTML = "";

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
                        const moscowTime = new Date(dateObj.getTime() - 3 * 60 * 60 * 1000);
                        formattedDate = moscowTime.toLocaleString('ru-RU', {
                            timeZone: 'Europe/Moscow',
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

            // Заполню строку таблицы
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

            // Клик по строке (если не было свайпа)
            row.addEventListener("click", (e) => {
                if (!isSwiped && startX === undefined) {
                }
            });

            tableBody.appendChild(row);
        });
    }

    function showExpenseAnalysis(expenses, dateFrom, dateTo) {
        if (!Array.isArray(expenses)) {
            console.error("Ожидался массив расходов:", expenses);
            alert("Ошибка: сервер вернул неверный формат данных");
            return;
        }

        const canvas = document.getElementById('expenseChart');
        if (!canvas) {
            console.error('Canvas элемент не найден!');
            return;
        }

        if (expenses.length === 0) {
            alert("Нет данных за выбранный период");
            return;
        }

        // Группирую по категориям
        const categories = {};
        expenses.forEach(expense => {
            const category = expense.category || "Без категории";
            const amount = parseFloat(expense.amount) || 0;
            categories[category] = (categories[category] || 0) + amount;
        });

        document.getElementById("expensesTable").style.display = "none";
        document.getElementById("chartContainer").style.display = "block";
        document.querySelector("#chartContainer h2").textContent = `Анализ расходов с ${dateFrom} по ${dateTo}`;

        updateChart(categories);
        updateSummaryTable(categories, expenses);
    }

    let expenseChartInstance = null;
    function updateChart(categories) {
        const ctx = document.getElementById('expenseChart').getContext('2d');

        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }

        const labels = Object.keys(categories);
        const data = Object.values(categories);

        const backgroundColors = [
            '#FF6384',
            '#36A2EB',
            '#a1581c',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
        ];

        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverBackgroundColor: backgroundColors.map(color => color + 'CC'),
                    hoverBorderWidth: 0,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '40%',
                radius: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value.toFixed(2)} ₽ (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 800
                }
            }
        });

        createCustomLegend(labels, backgroundColors.slice(0, labels.length));
    }

    function createCustomLegend(labels, colors) {
        const legendContainer = document.querySelector('.chart-legend');
        if (!legendContainer) return;

        legendContainer.innerHTML = '';

        labels.forEach((label, i) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'chart-legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'chart-legend-color';
            colorBox.style.backgroundColor = colors[i % colors.length];

            const text = document.createElement('span');
            text.textContent = label;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(text);
            legendContainer.appendChild(legendItem);

            legendItem.addEventListener('mouseenter', () => {
                if (expenseChartInstance) {
                    expenseChartInstance.setActiveElements([{ datasetIndex: 0, index: i }]);
                    expenseChartInstance.update();
                }
            });

            legendItem.addEventListener('mouseleave', () => {
                if (expenseChartInstance) {
                    expenseChartInstance.setActiveElements([]);
                    expenseChartInstance.update();
                }
            });
        });
    }

    initFlatpickr();



    // Добавление нового расхода
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fp = document.getElementById("date")._flatpickr;
        const selectedDate = fp.selectedDates[0];

        const timezoneOffset = selectedDate.getTimezoneOffset() * 60000;
        const correctedDate = new Date(selectedDate.getTime() - timezoneOffset);

        const expenseData = {
            place: document.getElementById("place").value,
            category: document.getElementById("category").value,
            amount: parseFloat(document.getElementById("amount").value),
            date: correctedDate.toISOString(), // Исправленный формат даты
            comment: document.getElementById("comment").value
        };

        console.log("Отправляемые данные:", expenseData);

        if (!expenseData.place || !expenseData.category || !expenseData.amount) {
            alert("Заполните обязательные поля (место, категория, сумма)");
            return;
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
            alert("Произошла ошибка при добавлении записи: " + error.message);
        }
    });

    function updateSummaryTable(categories, allExpenses) {
        const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
        const tbody = document.querySelector("#categorySummary tbody");
        tbody.innerHTML = '';

        Object.entries(categories).forEach(([category, amount]) => {
            const categoryRow = document.createElement('tr');
            categoryRow.className = 'category-row';
            categoryRow.dataset.category = category;
            categoryRow.innerHTML = `
            <td>${category}</td>
            <td>${amount.toFixed(2)} ₽</td>
            <td>${total > 0 ? ((amount / total) * 100).toFixed(1) : 0}%</td>
        `;
            tbody.appendChild(categoryRow);
            // Обработчик клика
            categoryRow.addEventListener('click', () => {
                // Находим все детализированные строки для этой категории
                const existingDetails = document.querySelectorAll(`tr[data-parent-category="${category}"]`);

                if (existingDetails.length > 0) {
                    // Если записи уже показаны - удаляем их
                    existingDetails.forEach(row => row.remove());
                    categoryRow.classList.remove('expanded');
                } else {
                    const categoryExpenses = allExpenses.filter(exp => exp.category === category);

                    categoryExpenses.forEach((expense, index) => {
                        const detailRow = document.createElement('tr');
                        detailRow.className = 'expense-details-row';
                        detailRow.dataset.parentCategory = category;

                        const formattedDate = new Date(expense.date).toLocaleDateString('ru-RU');

                        detailRow.innerHTML = `
                        <td class="detail-cell">${expense.place || '—'}</td>
                        <td>${expense.amount} ₽</td>
                        <td>${formattedDate}</td>
                    `;
                        categoryRow.after(detailRow);
                    });
                    categoryRow.classList.add('expanded');
                }
            });
        });
    }

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
        const dateFrom = document.getElementById("searchDateFrom").value;
        const dateTo = document.getElementById("searchDateTo").value;

        try {
            const response = await fetch(`${apiBaseUrl}/search?dateFrom=${dateFrom}&dateTo=${dateTo}`);

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Ошибка сервера");
            }

            const expenses = await response.json(); // Теперь получаем чистый массив
            showExpenseAnalysis(expenses, dateFrom, dateTo);
            searchModal.style.display = "none";
        } catch (error) {
            console.error("Ошибка поиска:", error);
            alert(`Ошибка: ${error.message}`);
        }
    });

    // Сброс поиска
    resetSearch.addEventListener("click", () => {
        document.getElementById("searchDateFrom").value = "";
        document.getElementById("searchDateTo").value = "";
        document.getElementById("chartContainer").style.display = "none";
        document.getElementById("expensesTable").style.display = "table";

        // Уничтожение графика при сбросе
        if (expenseChartInstance) {
            expenseChartInstance.destroy();
            expenseChartInstance = null;
        }

        fetchExpenses();
        searchModal.style.display = "none";
    });
    fetchExpenses();
});

