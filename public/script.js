// Assign each button to a variable
const controlsBtn = document.getElementById("controlsbtn");
const scheduleBtn = document.getElementById("schedulebtn");
const monitoringBtn = document.getElementById("monitoringbtn");
const specificsBtn = document.getElementById("specificsbtn");
const maintenanceBtn = document.getElementById("maintainencebtn");
const settingsBtn = document.getElementById("settingsbtn");

//redirect on click of button
controlsBtn.addEventListener("click", () => window.location.href = "controls.html");
scheduleBtn.addEventListener("click", () => window.location.href = "schedule.html");
monitoringBtn.addEventListener("click", () => window.location.href = "monitoring.html");
specificsBtn.addEventListener("click", () => window.location.href = "specifics.html");
maintenanceBtn.addEventListener("click", () => window.location.href = "Maintenance.html");
settingsBtn.addEventListener("click", () => window.location.href = "settings.html");