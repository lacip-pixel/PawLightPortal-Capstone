const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL connected!");
    }
});

app.use(express.static(path.join(__dirname, "public")));

// Define routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html")); // Assuming 'login.html' exists
});

// Password hashing example
async function hashPassword() {
    const password = "123456";
    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    console.log({ password, salt, hash });
}

hashPassword();

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
