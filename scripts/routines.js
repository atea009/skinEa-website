const db = firebase.database().ref("products");

async function loadRoutineData() {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) return alert("User not logged in.");

    const cleanEmail = userEmail.replace(/\./g, "_");
    const userRef = firebase.database().ref("users/" + cleanEmail);
    const wishlistRef = firebase.database().ref("wishlist/" + cleanEmail);

    const [baseRoutines, issueModifiers, wishlistSnap, productsSnap, userSnap] = await Promise.all([
        fetch("db/BaseRoutines.json").then(r => r.json()),
        fetch("db/IssueModifiers.json").then(r => r.json()),
        wishlistRef.once("value"),
        db.once("value"),
        userRef.once("value")
    ]);

    const wishlistData = wishlistSnap.val() || {};
    const allProducts = productsSnap.val() || {};
    const userData = userSnap.val();
    if (!userData) return alert("User data not found.");

    const skinType = userData.skin_type.toLowerCase();
    const skinIssues = userData.skin_issue ? Object.values(userData.skin_issue).map(i => i.toLowerCase()) : [];

    const baseMorning = baseRoutines.morning[skinType] || [];
    const baseNight = baseRoutines.night[skinType] || [];

    let morningRoutine = [...baseMorning];
    let nightRoutine = [...baseNight];

    for (const issue of skinIssues) {
        const mod = issueModifiers[issue];
        if (!mod) continue;

        ["morning", "night"].forEach(period => {
            const targetRoutine = period === "morning" ? morningRoutine : nightRoutine;
            const mods = mod[period] || [];
            for (const item of mods) {
                const index = targetRoutine.findIndex(p => p.category.toLowerCase() === item.category.toLowerCase());
                if (item.category.toLowerCase() === "special treatment") {
                    targetRoutine.push(item);
                } else if (index !== -1) {
                    targetRoutine[index] = item;
                }
            }
        });
    }

    renderRoutine("morningGrid", morningRoutine, allProducts, wishlistData);
    renderRoutine("nightGrid", nightRoutine, allProducts, wishlistData);
}

function renderRoutine(containerId, routineList, allProducts, wishlistData) {
    const grid = document.getElementById(containerId);
    const template = grid.querySelector(".product-card");
    grid.innerHTML = "";

    routineList.forEach(item => {
        const product = Object.values(allProducts).find(p =>
            p.name.toLowerCase() === item.name.toLowerCase() &&
            p.brand.toLowerCase() === item.brand.toLowerCase()
        );
        if (!product) return;

        const card = template.cloneNode(true);
        card.style.display = "block";

        const img = card.querySelector(".product-photo");
        img.src = product.photo;
        img.onerror = () => img.src = "icons/prod_image.png";

        card.querySelector(".brand-name").textContent = product.brand;
        card.querySelector(".product-name").textContent = product.name;
        updateSkinTypeBadge(card, product.skin);

        const favBtn = card.querySelector(".wishlist-container");
        favBtn.setAttribute("data-key", product.name);
        const isInWishlist = !!wishlistData[product.name];
        updateHeartIcon(favBtn, isInWishlist);

        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const key = product.name;
            const ref = firebase.database().ref("wishlist/" + localStorage.getItem("email").replace(/\./g, "_") + "/" + key);
            const active = favBtn.getAttribute("data-active") === "true";
            updateHeartIcon(favBtn, !active);
            if (active) ref.remove();
            else ref.set(true);
        });

        card.addEventListener("click", (e) => {
            if (e.target.closest(".wishlist-container")) return;
            showPopup(product, product.name, isInWishlist);
        });

        grid.appendChild(card);
    });
}

function updateHeartIcon(button, state) {
    const img = button.querySelector("img");
    button.setAttribute("data-active", state ? "true" : "false");
    img.src = state ? "icons/active_heart.png" : "icons/heart.png";
}

function updateSkinTypeBadge(card, skinType) {
    const skinElement = card.querySelector(".skin-type");
    if (!skinType) return;
    const lower = skinType.trim().toLowerCase();
    let className = "",
        label = "";
    switch (lower) {
        case "all skin types":
            className = "skin-all";
            label = "All skin types";
            break;
        case "normal skin":
            className = "skin-normal";
            label = "Normal skin";
            break;
        case "dry skin":
            className = "skin-dry";
            label = "Dry skin";
            break;
        case "oily skin":
            className = "skin-oily";
            label = "Oily skin";
            break;
        case "combination skin":
            className = "skin-combination";
            label = "Combination skin";
            break;
        case "dry/combo skin":
            className = "skin-dry-combo";
            label = "Dry/Combo skin";
            break;
        case "oily/combo skin":
            className = "skin-oily-combo";
            label = "Oily/Combo skin";
            break;
        default:
            skinElement.style.display = "none";
            return;
    }
    skinElement.classList.add(className);
    skinElement.textContent = label;
}

function showPopup(product, key, isInWishlist = false) {
    const popup = document.getElementById("productPopup");
    const overlay = document.getElementById("popupOverlay");

    popup.querySelector(".popup-product-photo").src = product.photo || "icons/prod_image.png";
    popup.querySelector(".popup-brand-name").textContent = product.brand;
    popup.querySelector(".popup-product-name-bold").textContent = product.name;
    popup.querySelectorAll(".popup-text")[0].textContent = product.desc;
    popup.querySelectorAll(".popup-text")[1].textContent = product.ingredients;
    popup.querySelector(".buy-button").onclick = () => {
        if (product.buyLink) window.open(product.buyLink, "_blank");
    };

    const favBtn = popup.querySelector(".wishlist-container-popup");
    updateHeartIcon(favBtn, isInWishlist);
    favBtn.onclick = () => {
        const email = localStorage.getItem("email").replace(/\./g, "_");
        const ref = firebase.database().ref("wishlist/" + email + "/" + key);
        const active = favBtn.getAttribute("data-active") === "true";
        updateHeartIcon(favBtn, !active);
        if (active) ref.remove();
        else ref.set(true);
    };

    overlay.classList.add("active");
    popup.classList.add("open");
    popup.style.transform = "translateY(0)";
    document.body.style.overflow = "hidden";
}

window.addEventListener("DOMContentLoaded", loadRoutineData);