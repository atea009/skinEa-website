const db = firebase.database().ref("products");

window.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".horizontal-grid");
    const template = document.createElement("div");

    template.innerHTML = `
        <div class="product-card">
            <div class="card-top">
                <img src="icons/prod_image.png" alt="Product Image" class="product-photo" />
                <button class="wishlist-container" data-active="false">
                    <img src="icons/heart.png" alt="Wishlist" class="wishlist-icon" />
                </button>
            </div>
            <div class="card-bottom">
                <span class="skin-type"></span>
                <p class="brand-name"></p>
                <p class="product-name"></p>
            </div>
        </div>
    `;
    const templateCard = template.firstElementChild;

    db.once("value").then(snapshot => {
        const products = snapshot.val();
        if (!products) return;

        const shuffled = shuffleArray(Object.entries(products)).slice(0, 6);

        shuffled.forEach(([key, product]) => {
            const card = templateCard.cloneNode(true);

            const img = card.querySelector(".product-photo");
            img.src = product.photo;
            img.onerror = () => img.src = "icons/prod_image.png";

            card.querySelector(".brand-name").textContent = product.brand;
            card.querySelector(".product-name").textContent = product.name;

            updateSkinTypeBadge(card, product.skin);

            const favBtn = card.querySelector(".wishlist-container");
            favBtn.setAttribute("data-key", key);
            updateHeartIcon(favBtn, product.favourite);

            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const newVal = !product.favourite;
                db.child(key).update({ favourite: newVal });
                product.favourite = newVal;
                updateHeartIcon(favBtn, newVal);

                // Përditëso dhe popup nëse është hapur
                const popupKey = document.getElementById("productPopup").getAttribute("data-key");
                if (popupKey === key) {
                    const popupFav = document.querySelector(".wishlist-container-popup");
                    updateHeartIcon(popupFav, newVal);
                }
            });

            card.addEventListener("click", (e) => {
                if (e.target.closest(".wishlist-container")) return;
                showPopup(product, key);
            });

            grid.appendChild(card);
        });
    });
});

function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function updateHeartIcon(button, isActive) {
    const img = button.querySelector("img");
    button.setAttribute("data-active", isActive ? "true" : "false");
    img.src = isActive ? "icons/active_heart.png" : "icons/heart.png";
}

function updateSkinTypeBadge(card, skin) {
    const el = card.querySelector(".skin-type");
    const lower = skin.trim().toLowerCase();

    switch (lower) {
        case "all skin types":
            el.classList.add("skin-all");
            el.textContent = "All skin types";
            break;
        case "normal skin":
            el.classList.add("skin-normal");
            el.textContent = "Normal skin";
            break;
        case "dry skin":
            el.classList.add("skin-dry");
            el.textContent = "Dry skin";
            break;
        case "oily skin":
            el.classList.add("skin-oily");
            el.textContent = "Oily skin";
            break;
        case "combination skin":
            el.classList.add("skin-combination");
            el.textContent = "Combination skin";
            break;
        case "dry/combo skin":
            el.classList.add("skin-dry-combo");
            el.textContent = "Dry/Combo skin";
            break;
        case "oily/combo skin":
            el.classList.add("skin-oily-combo");
            el.textContent = "Oily/Combo skin";
            break;
        default:
            el.style.display = "none";
    }
}

function showPopup(product, key) {
    const popup = document.getElementById("productPopup");
    const overlay = document.getElementById("popupOverlay");

    popup.setAttribute("data-key", key);

    popup.querySelector(".popup-product-photo").src = product.photo || "icons/prod_image.png";
    popup.querySelector(".popup-brand-name").textContent = product.brand;
    popup.querySelector(".popup-product-name-bold").textContent = product.name;
    popup.querySelectorAll(".popup-text")[0].textContent = product.desc;
    popup.querySelectorAll(".popup-text")[1].textContent = product.ingredients;

    const buyBtn = popup.querySelector(".buy-button");
    buyBtn.onclick = () => {
        if (product.buyLink) window.open(product.buyLink, "_blank");
    };

    const favBtn = popup.querySelector(".wishlist-container-popup");
    updateHeartIcon(favBtn, product.favourite);

    favBtn.onclick = () => {
        const newVal = !product.favourite;
        db.child(key).update({ favourite: newVal });
        product.favourite = newVal;
        updateHeartIcon(favBtn, newVal);

        // Përditëso edhe kartën përkatëse
        const allCards = document.querySelectorAll(`.wishlist-container[data-key="${key}"]`);
        allCards.forEach(btn => updateHeartIcon(btn, newVal));
    };

    overlay.classList.add("active");
    popup.classList.add("open");
    popup.style.transform = "translateY(0)";
    document.body.style.overflow = "hidden";

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            popup.classList.remove("open");
            overlay.classList.remove("active");
            popup.style.transform = "translateY(100%)";
            document.body.style.overflow = "";
        }
    };
}