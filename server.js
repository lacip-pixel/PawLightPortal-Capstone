const express = require("express");
const { Client } = require("pg");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");
const WebSocket = require('ws');

// Initialize Express app
const app = express();

// Load environment variables
dotenv.config({ path: "./.env" });

// PostgreSQL connection
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'PawlightPortal',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  })
);
app.use(express.static(path.join(__dirname, "public")));

// Create HTTP server
const PORT = process.env.PORT || 80;
const server = app.listen(PORT, () => {
  console.log(`HTTP server running on Port:${PORT}`);
});

// ============== WebSocket Server ==============
const wss = new WebSocket.Server({ 
  server,
  path: "/ws" // WebSocket endpoint
});

// Track connected Arduino clients
const arduinoClients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  arduinoClients.add(ws);

  ws.on('message', (message) => {
    console.log(`Received from Arduino: ${message}`);
    
    try {
      const data = JSON.parse(message);
      
      // Handle Arduino identification
      if (data.type === 'arduino_identify') {
        ws.send(JSON.stringify({ 
          status: 'identified',
          message: 'Connection established with server'
        }));
      }
      
      // Handle access events
      if (data.type === 'access') {
        console.log(`Access ${data.status} for UID: ${data.uid}`);
        // You could store this in your database
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Arduino disconnected');
    arduinoClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// ============== API Endpoints ==============

// Door command endpoint
app.post("/api/door", (req, res) => {
  // Check authentication
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { command } = req.body;
  const validCommands = ["lock", "unlock", "open", "close"];

  // Validate command
  if (!validCommands.includes(command)) {
    return res.status(400).json({ success: false, message: "Invalid command" });
  }

  // Send to all connected Arduinos
  let sentCount = 0;
  arduinoClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ command }));
      sentCount++;
    }
  });

  if (sentCount > 0) {
    res.json({ 
      success: true,
      message: `Command "${command}" sent to ${sentCount} device(s)`
    });
  } else {
    res.status(503).json({ 
      success: false,
      message: "No Arduino devices connected"
    });
  }
});

// Connection status endpoint
app.get("/api/connection-status", (req, res) => {
  const status = {
    connectedDevices: arduinoClients.size,
    serverTime: new Date().toISOString(),
    activeConnections: Array.from(arduinoClients).map(ws => ({
      readyState: ws.readyState // 1 = OPEN, 0 = CONNECTING, etc.
    }))
  };
  res.json(status);
});

// ============== Authentication Routes ==============
// (Keep your existing auth routes from previous implementation)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});