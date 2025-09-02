document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault(); // Prevent page reload
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Both email and password are required!");
        return;
    }

    try {
        // Send login data to Flask backend
        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // Important for sessions
            body: JSON.stringify({ email, password }),
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            data = { success: false, message: "Invalid server response" };
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || `Server error: ${response.status}`);
        }

        console.log("Login success:", data);
        // Redirect to main page with a parameter indicating we just logged in
        window.location.href = "mainpage.html?fromLogin=true";

    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
        // Don't clear the form on error so user can see what they entered
    }
}