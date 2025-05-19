document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.querySelector(".login-btn");

    loginBtn.addEventListener("click", () => {
        const emailInput = document.querySelector('input[placeholder="Email"]');
        const passwordInput = document.querySelector('input[placeholder="Password"]');

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }

        const cleanEmail = email.replace(/\./g, "_");
        const dbRef = firebase.database().ref("users/" + cleanEmail);

        dbRef.once("value")
            .then(snapshot => {
                const user = snapshot.val();

                if (!user || user.password !== password) {
                    alert("Incorrect email or password.");
                    return;
                }

                // Ruaj të dhënat në localStorage
                localStorage.setItem("email", user.email);
                localStorage.setItem("username", user.username);

                alert("Login successful!");
                window.location.href = "home.html";
            })
            .catch(error => {
                console.error("Database error:", error);
                alert("Something went wrong. Please try again later.");
            });
    });
});