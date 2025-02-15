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