const db = firebase.database().ref("products");

window.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".products-grid");
    const originalTemplate = document.querySelector(".product-card").cloneNode(true);

    // Hiq template-in nga DOM-i që të mos shfaqet karta bosh
    document.querySelector(".product-card").remove();

    db.on("value", (snapshot) => {
        const products = snapshot.val();
        grid.innerHTML = ""; // Pastro grid-in

        Object.entries(products).forEach(([key, product]) => {
            const card = originalTemplate.cloneNode(true);
            card.style.display = "block";

            const img = card.querySelector(".product-photo");
            img.src = product.photo;

            // Kontrollo ngarkimin e fotos
            console.log("Ngarkim fotoje për:", product.name, "URL:", product.photo);
            img.onerror = () => {
                console.error("❌ FOTO NUK U NGARKUA:", product.name, product.photo);
                img.src = "icons/prod_image.png"; // fallback
            };

            card.querySelector(".brand-name").textContent = product.brand;
            card.querySelector(".product-name").textContent = product.name;
            updateSkinTypeBadge(card, product.skin);

            const favBtn = card.querySelector(".wishlist-container");
            const favIcon = favBtn.querySelector("img");
            favBtn.setAttribute("data-key", key);
            updateHeartIcon(favBtn, product.favourite);

            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const newVal = !product.favourite;
                db.child(key).update({ favourite: newVal });
            });

            card.addEventListener("click", (e) => {
                if (e.target.closest(".wishlist-container")) return;
                showPopup(product, key);
            });

            grid.appendChild(card);
        });
    });
});

function updateHeartIcon(button, state) {
    const img = button.querySelector("img");
    button.setAttribute("data-active", state ? "true" : "false");
    img.src = state ? "icons/active_heart.png" : "icons/heart.png";
}

function showPopup(product, key) {
    const popup = document.getElementById("productPopup");
    const overlay = document.getElementById("popupOverlay");

    const popupImg = popup.querySelector(".popup-product-photo");
    popupImg.src = product.photo;

    popupImg.onerror = () => {
        console.error("❌ FOTO POPUP NUK U NGARKUA:", product.name, product.photo);
        popupImg.src = "icons/prod_image.png";
    };

    popup.querySelector(".popup-brand-name").textContent = product.brand;
    popup.querySelector(".popup-product-name-bold").textContent = product.name;
    popup.querySelectorAll(".popup-text")[0].textContent = product.desc;
    popup.querySelectorAll(".popup-text")[1].textContent = product.ingredients;

    popup.setAttribute("data-key", key);

    const popupBtn = popup.querySelector(".wishlist-container-popup");
    updateHeartIcon(popupBtn, product.favourite);

    popupBtn.onclick = () => {
        const newVal = !product.favourite;
        db.child(key).update({ favourite: newVal });
    };

    overlay.classList.add("active");
    popup.classList.add("open");
    popup.style.transform = "translateY(0)";
    document.body.style.overflow = "hidden";
}

function updateSkinTypeBadge(card, skinType) {
    const skinElement = card.querySelector(".skin-type");
    if (!skinType) return;

    const lower = skinType.trim().toLowerCase();
    let className = "";
    let label = "";

    switch (lower) {
        case "all types":
        case "all skin types":
            className = "skin-all";
            label = "All skin types";
            break;
        case "normal":
        case "normal skin":
            className = "skin-normal";
            label = "Normal skin";
            break;
        case "dry":
        case "dry skin":
            className = "skin-dry";
            label = "Dry skin";
            break;
        case "oily":
        case "oily skin":
            className = "skin-oily";
            label = "Oily skin";
            break;
        case "combination":
        case "combination skin":
            className = "skin-combination";
            label = "Combination skin";
            break;
        case "dry/combo":
        case "dry/combo skin":
            className = "skin-dry-combo";
            label = "Dry/Combo skin";
            break;
        case "oily/combo":
        case "oily/combo skin":
            className = "skin-oily-combo";
            label = "Oily/Combo skin";
            break;
        case "sensitive":
            className = "skin-normal";
            label = "Sensitive skin";
            break;
        case "acne-prone":
            className = "skin-oily";
            label = "Acne-prone skin";
            break;
        default:
            skinElement.style.display = "none";
            return;
    }

    skinElement.classList.add(className);
    skinElement.textContent = label;
}