// Assign each button to a variable
const controlsBtn = document.getElementById("controlsbtn");
const scheduleBtn = document.getElementById("schedulebtn");
const monitoringBtn = document.getElementById("monitoringbtn");
const maintenanceBtn = document.getElementById("maintainencebtn");
const settingsBtn = document.getElementById("settingsbtn");

// Redirect on click of button
controlsBtn?.addEventListener("click", () => (window.location.href = "controls.html"));
scheduleBtn?.addEventListener("click", () => (window.location.href = "schedule.html"));
monitoringBtn?.addEventListener("click", () => (window.location.href = "monitoring.html"));
maintenanceBtn?.addEventListener("click", () => (window.location.href = "Maintenance.html"));
settingsBtn?.addEventListener("click", () => (window.location.href = "settings.html"));

// Login functionality
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Login successful!");
        window.location.href = "/";
    } else {
        alert(data.message || "Error logging in");
    }
});

// Register functionality
const registerBtn = document.getElementById("registerBtn");
registerBtn?.addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;

    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "/login.html";
    } else {
        alert(data.message || "Error registering user");
    }
});

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message || "Logout successful!");
      window.location.href = "/login.html"; // Redirect to login page after logout
    } else {
      alert(data.message || "Error logging out");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred during logout.");
  }
});

// Door Control Buttons
const lockBtn = document.getElementById("lockBtn");
const unlockBtn = document.getElementById("unlockBtn");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const statusMessage = document.getElementById("statusMessage");

// Base URL for the API 
const API_BASE_URL = "http://3.132.229.82";

// Function to send a command to the Arduino
async function sendCommand(command) {
    try {
        const response = await fetch(`${API_BASE_URL}/door`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ command }),
        });

        const data = await response.json();
        if (response.ok) {
            statusMessage.textContent = `Command "${command}" sent successfully!`;
            statusMessage.style.color = "green";
        } else {
            statusMessage.textContent = `Error: ${data.message || "Failed to send command"}`;
            statusMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Error sending command:", error);
        statusMessage.textContent = "An error occurred while sending the command.";
        statusMessage.style.color = "red";
    }
}

// Add event listeners to buttons
lockBtn?.addEventListener("click", () => sendCommand("lock"));
unlockBtn?.addEventListener("click", () => sendCommand("unlock"));
openBtn?.addEventListener("click", () => sendCommand("open"));
closeBtn?.addEventListener("click", () => sendCommand("close"));
