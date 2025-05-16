const db = firebase.database().ref("products");

window.addEventListener("DOMContentLoaded", () => {
    const userEmail = localStorage.getItem("email");
    const cleanEmail = userEmail ? userEmail.replace(/\./g, "_") : null;
    const wishlistRef = cleanEmail ? firebase.database().ref("wishlist/" + cleanEmail) : null;

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

    if (!wishlistRef) {
        alert("User not logged in.");
        return;
    }

    wishlistRef.once("value").then((wishlistSnap) => {
        const wishlistData = wishlistSnap.val() || {};

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
                const isInWishlist = !!wishlistData[key];
                updateHeartIcon(favBtn, isInWishlist);

                favBtn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const isActive = favBtn.getAttribute("data-active") === "true";
                    updateHeartIcon(favBtn, !isActive);

                    const ref = firebase.database().ref("wishlist/" + cleanEmail + "/" + key);
                    if (isActive) {
                        ref.remove();
                    } else {
                        ref.set(true);
                    }
                });

                card.addEventListener("click", (e) => {
                    if (e.target.closest(".wishlist-container")) return;
                    showPopup(product, key, isInWishlist);
                });

                grid.appendChild(card);
            });
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

function showPopup(product, key, isInWishlist = false) {
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
    updateHeartIcon(favBtn, isInWishlist);

    favBtn.onclick = () => {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) {
            alert("Login required.");
            return;
        }

        const cleanEmail = userEmail.replace(/\./g, "_");
        const wishlistRef = firebase.database().ref("wishlist/" + cleanEmail + "/" + key);

        const isActive = favBtn.getAttribute("data-active") === "true";
        updateHeartIcon(favBtn, !isActive);

        if (isActive) {
            wishlistRef.remove();
        } else {
            wishlistRef.set(true);
        }

        // Update zemrat në çdo kartë
        const allCards = document.querySelectorAll(`.wishlist-container[data-key="${key}"]`);
        allCards.forEach(btn => updateHeartIcon(btn, !isActive));
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