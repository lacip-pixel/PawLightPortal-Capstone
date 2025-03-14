const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");

const app = express();

dotenv.config({ path: "./.env" });

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DATABASE_USER || "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    database: process.env.DATABASE || "PawlightPortalLocal",
    password: process.env.DATABASE_PASSWORD || "postgres",
    port: process.env.DATABASE_PORT || 5432,
});

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
    session({
        secret: "your_secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Register a new user
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO Users (Username, Password) VALUES ($1, $2) RETURNING *",
            [username, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login user
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM Users WHERE Username = $1", [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (validPassword) {
                req.session.userId = user.userid;
                req.session.username = user.username;
                res.status(200).json({ message: "Login successful", user: { id: user.userid, username: user.username } });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
});

// Logout user
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logout successful" });
    });
});

// Check if user is authenticated
app.get("/check-auth", (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ authenticated: true, user: { id: req.session.userId, username: req.session.username } });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Get system specs
app.get("/get-system-specs", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM SystemSpecs WHERE userid = $1", [req.session.userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching system specs:", error);
        res.status(500).json({ message: "Error fetching system specs" });
    }
});

// Fetch updates dynamically
app.get("/get-updates", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Updates WHERE userid = $1", [req.session.userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching updates:", error);
        res.status(500).json({ message: "Error fetching updates" });
    }
});

// Update Two-Factor Authentication
app.post("/update-2fa", async (req, res) => {
    const { enabled } = req.body;
    try {
        await pool.query("UPDATE Users SET twoFactorEnabled = $1 WHERE userid = $2", [enabled, req.session.userId]);
        res.json({ message: "2FA updated successfully" });
    } catch (error) {
        console.error("Error updating 2FA:", error);
        res.status(500).json({ message: "Error updating 2FA" });
    }
});

// Get User Plan & Billing Details
app.get("/get-user-plan", async (req, res) => {
    try {
        const result = await pool.query("SELECT plan, billingDate, billingAmount FROM UserPlans WHERE userid = $1", [req.session.userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user plan:", error);
        res.status(500).json({ message: "Error fetching user plan" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Simulated API endpoint for door controls
app.post("/api/door", (req, res) => {
    const { command } = req.body;
    console.log(`Command received: ${command}`);
    if (["lock", "unlock", "open", "close"].includes(command)) {
        res.status(200).json({ message: `Command "${command}" executed successfully.` });
    } else {
        res.status(400).json({ message: "Invalid command" });
    }
});
