document.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem("email");
    if (!email) {
        alert("User not logged in.");
        return;
    }

    const cleanEmail = email.replace(/\./g, "_");
    const userRef = firebase.database().ref("users/" + cleanEmail);

    userRef.once("value").then(snapshot => {
        const user = snapshot.val();
        if (!user) {
            console.warn("No user data found.");
            return;
        }

        // ✅ Username dhe Email
        document.getElementById("profileUsername").textContent = user.username || "";
        document.getElementById("profileEmail").textContent = user.email || "";

        // ✅ Gender
        document.getElementById("genderSelect").value = user.gender || "";

        // ✅ Age Group
        document.getElementById("ageGroupSelect").value = user.age_group || "";

        // ✅ Skin Color
        document.querySelectorAll(".skincolor").forEach(c => {
            c.classList.remove("selected");
            if (c.dataset.color === user.skin_color) {
                c.classList.add("selected");
            }
        });

        // ✅ Skin Type
        document.querySelectorAll(".skin-btn").forEach(btn => {
            btn.classList.remove("selected");
            if (btn.textContent.toLowerCase() === user.skin_type) {
                btn.classList.add("selected");
            }
        });

        // ✅ Skin Issues
        document.querySelectorAll(".issue-btn").forEach(btn => {
            const txt = btn.textContent.toLowerCase();
            if (Array.isArray(user.skin_issue) && user.skin_issue.includes(txt)) {
                btn.classList.add("selected");
            } else {
                btn.classList.remove("selected");
            }
        });
    });

    // ✅ Auto-save kur ndryshohet ndonjë e dhënë
    const autoSaveElements = [
        ...document.querySelectorAll(".skin-btn"),
        ...document.querySelectorAll(".skincolor"),
        ...document.querySelectorAll(".issue-btn"),
        ...document.querySelectorAll("select")
    ];

    autoSaveElements.forEach(el => {
        el.addEventListener("change", () => saveProfileData(userRef));
        el.addEventListener("click", () => saveProfileData(userRef));
    });
});

function saveProfileData(userRef) {
    const gender = document.getElementById("genderSelect").value;
    const ageGroup = document.getElementById("ageGroupSelect").value;

    const skinTypeBtn = document.querySelector(".skin-btn.selected");
    const skinType = skinTypeBtn ? skinTypeBtn.textContent.toLowerCase() : null;

    const skinColorDiv = document.querySelector(".skincolor.selected");
    const skinColor = skinColorDiv ? skinColorDiv.dataset.color : null;

    const skinIssues = [...document.querySelectorAll(".issue-btn.selected")].map(btn =>
        btn.textContent.toLowerCase()
    );

    userRef.update({
        gender,
        age_group: ageGroup,
        skin_type: skinType,
        skin_color: skinColor,
        skin_issue: skinIssues
    }).then(() => {
        console.log("User profile updated.");
    }).catch(err => {
        console.error("Error updating profile:", err);
    });
}