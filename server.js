const express = require("express");
const { Client } = require("pg");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");
const WebSocket = require('ws');

const app = express();

dotenv.config({ path: "./.env" });

// PostgreSQL connection
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'PawlightPortal',
  password: 'postgres',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

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
    const { username, password, isAdmin } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password, isadmin) VALUES ($1, $2, $3) RETURNING *";
        const values = [username, hashedPassword, isAdmin];

        const result = await client.query(query, values);
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
        const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
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
        const result = await client.query("SELECT * FROM SystemSpecs WHERE userid = $1", [req.session.userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching system specs:", error);
        res.status(500).json({ message: "Error fetching system specs" });
    }
});

// Fetch updates dynamically
app.get("/get-updates", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM Updates WHERE userid = $1", [req.session.userId]);
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
        await client.query("UPDATE users SET twoFactorEnabled = $1 WHERE userid = $2", [enabled, req.session.userId]);
        res.json({ message: "2FA updated successfully" });
    } catch (error) {
        console.error("Error updating 2FA:", error);
        res.status(500).json({ message: "Error updating 2FA" });
    }
});

// Get User Plan & Billing Details
app.get("/get-user-plan", async (req, res) => {
    try {
        const result = await client.query("SELECT plan, billingDate, billingAmount FROM UserPlans WHERE user_id = $1", [req.session.userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user plan:", error);
        res.status(500).json({ message: "Error fetching user plan" });
    }
});

const PORT = process.env.PORT || 80;
const server = app.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
}); 


// ============== WebSocket Client to Arduino ==============
const ARDUINO_WS_URL = "ws://10.160.0.214:8080";
let arduinoSocket;

function connectToArduino() {
    arduinoSocket = new WebSocket(ARDUINO_WS_URL);

    arduinoSocket.on('open', () => {
        console.log('Connected to Arduino WebSocket server');
    });

    arduinoSocket.on('message', (data) => {
        console.log('Message from Arduino:', data);
    });

    arduinoSocket.on('close', () => {
        console.log('Connection to Arduino closed. Reconnecting in 5 seconds...');
        setTimeout(connectToArduino, 5000); // retry connection
    });

    arduinoSocket.on('error', (err) => {
        console.error('WebSocket error with Arduino:', err.message);
    });
}

connectToArduino();

// Send command to Arduino
function sendToArduino(command) {
    if (arduinoSocket && arduinoSocket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type: 'command', command });
        arduinoSocket.send(message);
        return true;
    } else {
        console.log('Arduino WebSocket not connected');
        return false;
    }
}

// ============== API to Send Door Commands ==============
app.post("/api/door", (req, res) => {
    const { command } = req.body;
    console.log(`Command received: ${command}`);

    if (["lock", "unlock", "open", "close"].includes(command)) {
        const sent = sendToArduino(command);
        if (sent) {
            res.status(200).json({ message: `Command "${command}" sent to Arduino successfully.` });
        } else {
            res.status(503).json({ message: "Arduino is not connected" });
        }
    } else {
        res.status(400).json({ message: "Invalid command" });
    }
});