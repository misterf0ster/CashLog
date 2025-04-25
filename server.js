const express = require("express");
const cors = require("cors");
const path = require('path');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", methods: 'GET,POST,PUT,DELETE', allowedHeaders: 'Content-Type'})); // Запросы с фронта отправлять на Go API

app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
    console.log(`Frontend запущен на http://localhost:${PORT}`);
});
