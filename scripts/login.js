document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".login-btn");

    loginBtn.addEventListener("click", () => {
        const email = document.querySelector('input[placeholder="Email"]').value.trim();
        const password = document.querySelector('input[placeholder="Password"]').value.trim();

        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }

        const dbRef = firebase.database().ref("users");

        dbRef.once("value", (snapshot) => {
            let found = false;

            snapshot.forEach((child) => {
                const user = child.val();
                if (user.email === email && user.password === password) {
                    found = true;
                    alert("Login successful!");
                    // Ruaj në localStorage nëse do
                    localStorage.setItem("username", user.username);
                    localStorage.setItem("email", user.email);
                    window.location.href = "home.html";
                }
            });

            if (!found) {
                alert("Incorrect email or password.");
            }
        }, (error) => {
            console.error("Error checking login:", error);
            alert("Database error. Please try again later.");
        });
    });
});