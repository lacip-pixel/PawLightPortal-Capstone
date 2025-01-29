const express = require("express");
const app = express();

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Set the server to listen on a port
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
