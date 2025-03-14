document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch User Data
        const userResponse = await fetch("/check-auth");
        const userData = await userResponse.json();

        if (userData.authenticated) {
            document.getElementById("userName").innerText = userData.user.username;
            document.getElementById("userEmail").innerText = userData.user.email;
            document.getElementById("petID").innerText = userData.user.petID || "N/A";
        } else {
            window.location.href = "/login";
        }

        // Fetch System Specs
        const specsResponse = await fetch("/get-system-specs");
        const specsData = await specsResponse.json();
        Object.entries(specsData).forEach(([key, value]) => {
            if (document.getElementById(key)) {
                document.getElementById(key).innerText = value;
            }
        });

        // Fetch Notification Preferences
        const prefResponse = await fetch("/get-preferences");
        const prefData = await prefResponse.json();
        document.getElementById("doorActivity").checked = prefData.doorActivity;
        document.getElementById("systemAlerts").checked = prefData.systemAlerts;
        document.getElementById("maintenance").checked = prefData.maintenance;
        document.getElementById("pushNotifications").checked = prefData.pushNotifications;
        document.getElementById("emailNotifications").checked = prefData.emailNotifications;
        document.getElementById("textNotifications").checked = prefData.textNotifications;

        // Fetch Updates
        const updatesResponse = await fetch("/get-updates");
        const updatesData = await updatesResponse.json();
        document.getElementById("updateVersion").innerText = updatesData.version;
        document.getElementById("releaseDate").innerText = updatesData.releaseDate;

        // Fetch User Plan & Billing
        const planResponse = await fetch("/get-user-plan");
        const planData = await planResponse.json();
        document.getElementById("userPlan").innerText = planData.plan;
        document.getElementById("billingDate").innerText = planData.billingDate;
        document.getElementById("billingAmount").innerText = `$${planData.billingAmount}`;
        
    } catch (error) {
        console.error("Error loading settings:", error);
    }
});

// Save Notification Preferences
document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", async function () {
        const preferences = {
            doorActivity: document.getElementById("doorActivity").checked,
            systemAlerts: document.getElementById("systemAlerts").checked,
            maintenance: document.getElementById("maintenance").checked,
            pushNotifications: document.getElementById("pushNotifications").checked,
            emailNotifications: document.getElementById("emailNotifications").checked,
            textNotifications: document.getElementById("textNotifications").checked
        };

        await fetch("/update-preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferences)
        });
    });
});

// Handle Update Download
document.getElementById("downloadUpdate").addEventListener("click", function () {
    window.location.href = "/download-update";
});

// Handle Logout
document.getElementById("logoutBtn").addEventListener("click", async function () {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login";
});
