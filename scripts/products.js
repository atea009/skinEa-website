const db = firebase.database().ref("products");

window.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".products-grid");
    const originalTemplate = document.querySelector(".product-card").cloneNode(true);

    document.querySelector(".product-card").remove();

    db.on("value", (snapshot) => {
        const products = snapshot.val();
        grid.innerHTML = "";

        Object.entries(products).forEach(([key, product]) => {
            const card = originalTemplate.cloneNode(true);
            card.style.display = "block";

            const img = card.querySelector(".product-photo");
            img.src = product.photo;
            img.onerror = () => img.src = "icons/prod_image.png";

            card.querySelector(".brand-name").textContent = product.brand;
            card.querySelector(".product-name").textContent = product.name;

            updateSkinTypeBadge(card, product.skin);

            const favBtn = card.querySelector(".wishlist-container");
            const favIcon = favBtn.querySelector("img");
            favBtn.setAttribute("data-key", key);
            updateHeartIcon(favBtn, product.favourite);

            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                db.child(key).update({ favourite: !product.favourite });
            });

            card.addEventListener("click", (e) => {
                if (e.target.closest(".wishlist-container")) return;
                showPopup(product, key);
            });

            grid.appendChild(card);
        });
    });

    setupCategoryTabs();
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
    updateHeartIcon(popupBtn, product.favourite);

    popupBtn.onclick = () => {
        db.child(key).update({ favourite: !product.favourite });
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

function setupCategoryTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const selectedCategory = tab.textContent.trim().toLowerCase();
            const cards = document.querySelectorAll(".products-grid .product-card");
            cards.forEach(card => {
                const name = card.querySelector(".product-name").textContent.trim().toLowerCase();
                const brand = card.querySelector(".brand-name").textContent.trim().toLowerCase();

                const match = Object.values(window.productsCache || {}).find(prod =>
                    prod.name.toLowerCase() === name && prod.brand.toLowerCase() === brand
                );

                if (!match) return card.style.display = "none";

                if (selectedCategory === "all" || match.category.toLowerCase() === selectedCategory) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

const productsCache = {};
db.once("value").then(snapshot => {
    Object.entries(snapshot.val()).forEach(([_, product]) => {
        const id = `${product.name.toLowerCase()}_${product.brand.toLowerCase()}`;
        productsCache[id] = product;
    });
    window.productsCache = productsCache;
});