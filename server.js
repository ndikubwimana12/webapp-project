
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Temporary in-memory users for this practical demonstration
const users = [];

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "WebApp Project is running" });
});

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });

    res.status(201).json({ message: "Registration successful" });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        user => user.username === username && user.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username: user.username });
});

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`WebApp Project running on port ${PORT}`);
    });
}

module.exports = app;
