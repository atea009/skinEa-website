// scripts/wishlist.js

const db = firebase.database().ref("products");

window.addEventListener("DOMContentLoaded", () => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
        alert("You must be logged in to see your wishlist.");
        return;
    }

    const cleanEmail = userEmail.replace(/\./g, "_");
    const wishlistRef = firebase.database().ref("wishlist/" + cleanEmail);

    const grid = document.querySelector(".products-grid");
    const originalTemplate = document.querySelector(".product-card").cloneNode(true);

    document.querySelector(".product-card").remove();

    wishlistRef.once("value").then((wishlistSnapshot) => {
        const wishlist = wishlistSnapshot.val();
        if (!wishlist) {
            grid.innerHTML = "<p style='text-align:center;'>Your wishlist is empty.</p>";
            return;
        }

        db.once("value").then((productsSnapshot) => {
            const products = productsSnapshot.val();

            Object.entries(wishlist).forEach(([key, _]) => {
                const product = products[key];
                if (!product) return;

                const card = originalTemplate.cloneNode(true);
                card.style.display = "block";
                card.setAttribute("data-key", key);

                const img = card.querySelector(".product-photo");
                img.src = product.photo;
                img.onerror = () => img.src = "icons/prod_image.png";

                card.querySelector(".brand-name").textContent = product.brand;
                card.querySelector(".product-name").textContent = product.name;

                updateSkinTypeBadge(card, product.skin);

                const favBtn = card.querySelector(".wishlist-container");
                const favIcon = favBtn.querySelector("img");
                favBtn.setAttribute("data-key", key);
                updateHeartIcon(favBtn, true);

                favBtn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const wishlistItemRef = firebase.database().ref("wishlist/" + cleanEmail + "/" + key);
                    wishlistItemRef.remove();

                    firebase.database().ref("products/" + key).update({ favourite: false });

                    card.remove();
                });

                card.addEventListener("click", (e) => {
                    if (e.target.closest(".wishlist-container")) return;
                    showPopup(product, key);
                });

                grid.appendChild(card);
            });
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
    popupImg.onerror = () => popupImg.src = "icons/prod_image.png";

    popup.querySelector(".popup-brand-name").textContent = product.brand;
    popup.querySelector(".popup-product-name-bold").textContent = product.name;
    popup.querySelectorAll(".popup-text")[0].textContent = product.desc;
    popup.querySelectorAll(".popup-text")[1].textContent = product.ingredients;

    const buyBtn = popup.querySelector(".buy-button");
    buyBtn.onclick = () => {
        if (product.buyLink) {
            window.open(product.buyLink, "_blank");
        }
    };

    popup.setAttribute("data-key", key);

    const popupBtn = popup.querySelector(".wishlist-container-popup");
    updateHeartIcon(popupBtn, true);

    popupBtn.onclick = () => {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) {
            alert("Login required.");
            return;
        }

        const cleanEmail = userEmail.replace(/\./g, "_");
        const wishlistRef = firebase.database().ref("wishlist/" + cleanEmail + "/" + key);

        wishlistRef.remove();
        firebase.database().ref("products/" + key).update({ favourite: false });

        popup.classList.remove("open");
        document.getElementById("popupOverlay").classList.remove("active");
        document.body.style.overflow = "auto";

        const cardToRemove = document.querySelector(`.product-card[data-key="${key}"]`);
        if (cardToRemove) cardToRemove.remove();
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