
"use strict";

// ==========================================
// TOTE-ALLY YOURS — PRODUCT DATA
// ==========================================

const products = [
  { id: 1, name: "Petal Party Tote", price: 249, category: "Floral", image: "floral.jpg", rating: "4.9", reviews: 128, badge: "Bestseller", color: "#f1dfd1" },
  { id: 2, name: "Tulip Dreams Tote", price: 229, category: "Illustrated", image: "tulips.jpg", rating: "4.8", reviews: 96, badge: "New", color: "#eee4cf" },
  { id: 3, name: "Lavender Picnic Tote", price: 279, category: "Gingham", image: "gingham.jpg", rating: "4.9", reviews: 112, badge: "", color: "#eadcec" },
  { id: 4, name: "Garden Notes Tote", price: 269, category: "Botanical", image: "whimsical.jpg", rating: "4.7", reviews: 84, badge: "", color: "#e3e5cf" },
  { id: 5, name: "Daisy Daydream Tote", price: 239, category: "Floral", image: "daydream.jpg", rating: "4.8", reviews: 73, badge: "", color: "#f5e8cc" },
  { id: 6, name: "Sweetheart Canvas Tote", price: 199, category: "Illustrated", image: "canvas.jpg", rating: "4.8", reviews: 65, badge: "Popular", color: "#f6dedd" },
  { id: 7, name: "Retro Bloom Tote", price: 259, category: "Retro", image: "retro.jpg", rating: "4.6", reviews: 51, badge: "", color: "#f0d8ca" },
  { id: 8, name: "Sage Meadow Tote", price: 289, category: "Botanical", image: "meadow.jpg", rating: "4.9", reviews: 102, badge: "New", color: "#e0e4c9" }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = amount => "₱" + Number(amount).toFixed(2);

// ==========================================
// SAFE LOCAL STORAGE
// Fixes: cart.filter is not a function
// ==========================================

function load(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));

    if (!Array.isArray(saved)) {
      return fallback;
    }

    return saved;
  } catch (error) {
    return fallback;
  }
}

function cleanCart(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter(item =>
      item &&
      Number.isFinite(Number(item.id)) &&
      Number.isFinite(Number(item.qty)) &&
      Number(item.qty) > 0 &&
      products.some(product => product.id === Number(item.id))
    )
    .map(item => ({
      id: Number(item.id),
      qty: Math.floor(Number(item.qty))
    }));
}

function cleanWishlist(items) {
  if (!Array.isArray(items)) return [];

  return [...new Set(items.map(Number))]
    .filter(id => products.some(product => product.id === id));
}

let cart = cleanCart(load("toteCart", []));
let wishlist = cleanWishlist(load("toteWishlist", []));

let category = "All";
let query = "";
let page = "home";
let coupon = "";

// ==========================================
// SAVE DATA
// ==========================================

function save() {
  try {
    localStorage.setItem("toteCart", JSON.stringify(cart));
    localStorage.setItem("toteWishlist", JSON.stringify(wishlist));
  } catch (error) {
    console.error("Unable to save shopping data:", error);
  }
}

// Correct old or invalid saved data immediately.
save();

// ==========================================
// NOTIFICATION
// ==========================================

function toast(message) {
  const element = $("#toast");

  if (!element) return;

  element.textContent = message;
  element.classList.remove("hidden");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    element.classList.add("hidden");
  }, 2200);
}

// ==========================================
// PRODUCT FILTERING AND SORTING
// ==========================================

function visibleProducts() {
  let list = products.filter(product => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesWishlist =
      page !== "wishlist" || wishlist.includes(product.id);

    const matchesSearch =
      (product.name + " " + product.category)
        .toLowerCase()
        .includes(query.toLowerCase());

    return matchesCategory && matchesWishlist && matchesSearch;
  });

  const sort = $("#sortSelect")?.value || "featured";

  if (sort === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts() {
  const grid = $("#productGrid");

  if (!grid) {
    console.error("Cannot find #productGrid in index.html.");
    return;
  }

  const list = visibleProducts();
  const heading = $("#productHeading");
  const resultCount = $("#resultCount");

  if (heading) {
    heading.textContent =
      page === "wishlist"
        ? "Your Wishlist ♡"
        : category === "All"
          ? "Featured Totes"
          : category + " Totes";
  }

  if (resultCount) {
    resultCount.textContent = query
      ? `${list.length} search result(s)`
      : `${list.length} lovely tote designs`;
  }

  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image" style="background:${product.color}">

        <img
          src="${product.image}"
          alt="${product.name}"
          style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"
          onerror="this.style.display='none'"
        >

        ${product.badge ? `
          <span class="product-badge ${product.badge === "New" ? "new" : ""}">
            ${product.badge}
          </span>
        ` : ""}

        <button
          type="button"
          class="wishlist-button ${wishlist.includes(product.id) ? "is-favorite" : ""}"
          data-wish="${product.id}"
          aria-label="Toggle wishlist"
        >${wishlist.includes(product.id) ? "♥" : "♡"}</button>

      </div>

      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">${money(product.price)}</div>
        <div class="product-rating">★ ${product.rating} (${product.reviews})</div>

        <button
          type="button"
          class="add-button"
          data-add="${product.id}"
        >Add to Cart</button>
      </div>
    </article>
  `).join("");

  if ($("#emptyState")) {
    $("#emptyState").classList.toggle("hidden", list.length > 0);
  }

  grid.classList.toggle("hidden", list.length === 0);

  // Bind events to the newly rendered buttons.
  grid.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const id = Number(button.dataset.add);
      addToCart(id);
    });
  });

  grid.querySelectorAll("[data-wish]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      toggleWishlist(Number(button.dataset.wish));
    });
  });
}

// ==========================================
// CATEGORIES
// ==========================================

function setCategory(value) {
  category = value;
  page = "home";

  $$(".category").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === value
    );
  });

  $$(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === "home"
    );
  });

  renderProducts();

  if (value !== "All") {
    $("#shop")?.scrollIntoView({ behavior: "smooth" });
  }
}

// ==========================================
// CART COUNTS
// ==========================================

function updateCounts() {
  cart = cleanCart(cart);
  wishlist = cleanWishlist(wishlist);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const headerCount = $("#headerCartCount");
  const bottomCount = $("#bottomCartCount");
  const wishlistCount = $("#wishlistCount");

  if (headerCount) {
    headerCount.textContent = count;
  }

  if (bottomCount) {
    bottomCount.textContent = count;
    bottomCount.classList.toggle("hidden", count === 0);
  }

  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.classList.toggle("hidden", wishlist.length === 0);
  }
}

// ==========================================
// ADD TO CART — FIXED
// ==========================================

function addToCart(id) {
  id = Number(id);

  const product = products.find(item => item.id === id);

  if (!product) {
    console.error("Product not found. ID:", id);
    toast("Sorry, this product could not be found.");
    return;
  }

  // Ensure cart is always an array before using it.
  cart = cleanCart(cart);

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: id,
      qty: 1
    });
  }

  save();
  updateCounts();
  renderCart();

  toast(product.name + " added to your cart!");
}

// ==========================================
// WISHLIST
// ==========================================

function toggleWishlist(id) {
  id = Number(id);

  if (!products.some(product => product.id === id)) return;

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(itemId => itemId !== id);
    toast("Removed from wishlist");
  } else {
    wishlist.push(id);
    toast("Saved to your wishlist ♡");
  }

  save();
  updateCounts();
  renderProducts();
}

// ==========================================
// CART TOTALS
// ==========================================

function subtotal() {
  cart = cleanCart(cart);

  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);

    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

// ==========================================
// DISPLAY SHOPPING BAG
// ==========================================

function renderCart() {
  // Critical safety check for malformed saved cart data.
  cart = cleanCart(cart);

  const cartItems = $("#cartItems");

  if (!cartItems) {
    console.error("Cannot find #cartItems in index.html.");
    updateCounts();
    return;
  }

  const hasItems = cart.length > 0;

  $("#cartEmpty")?.classList.toggle("hidden", hasItems);
  $("#cartSummary")?.classList.toggle("hidden", !hasItems);

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return "";

    return `
      <div class="cart-item">
        <div class="cart-thumb">
          <img
            src="${product.image}"
            alt="${product.name}"
            style="width:100%;height:100%;object-fit:cover;border-radius:8px;"
            onerror="this.style.display='none'"
          >
        </div>

        <div>
          <h3>${product.name}</h3>
          <div class="item-price">${money(product.price)}</div>

          <div class="quantity-controls">
            <button
              type="button"
              data-qty="${product.id}"
              data-change="-1"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.qty}</span>

            <button
              type="button"
              data-qty="${product.id}"
              data-change="1"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>

        <button
          type="button"
          class="remove-item"
          data-remove="${product.id}"
          aria-label="Remove ${product.name}"
        >×</button>
      </div>
    `;
  }).join("");

  const sub = subtotal();

  const discount =
    coupon === "BLOOM10" ? sub * 0.10 :
    coupon === "HELLO50" && sub >= 500 ? 50 : 0;

  const shipping = sub === 0 || sub >= 800 ? 0 : 49;

  if ($("#subtotalValue")) {
    $("#subtotalValue").textContent = money(sub);
  }

  if ($("#discountValue")) {
    $("#discountValue").textContent = "−" + money(discount);
  }

  if ($("#shippingValue")) {
    $("#shippingValue").textContent =
      shipping ? money(shipping) : "FREE";
  }

  if ($("#totalValue")) {
    $("#totalValue").textContent =
      money(sub - discount + shipping);
  }

  if ($("#shippingNote")) {
    $("#shippingNote").textContent = sub >= 800
      ? "Yay! Your shipping is free!"
      : `Spend ${money(800 - sub)} more for free shipping.`;
  }

  updateCounts();
}

// ==========================================
// OPEN AND CLOSE CART
// ==========================================

function openCart() {
  renderCart();
  $("#cartOverlay")?.classList.remove("hidden");
}

function closeCart() {
  $("#cartOverlay")?.classList.add("hidden");
}

// ==========================================
// SHOW WISHLIST
// ==========================================

function showWishlist() {
  page = "wishlist";
  category = "All";

  $$(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === "wishlist"
    );
  });

  renderProducts();
  $("#shop")?.scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// SEARCH
// ==========================================

$("#searchForm")?.addEventListener("submit", event => {
  event.preventDefault();

  query = $("#searchInput")?.value.trim() || "";
  page = "home";

  renderProducts();
  $("#shop")?.scrollIntoView({ behavior: "smooth" });
});

$("#searchInput")?.addEventListener("input", event => {
  query = event.target.value.trim();
  page = "home";
  renderProducts();
});

$("#sortSelect")?.addEventListener("change", renderProducts);

// ==========================================
// CART QUANTITY, REMOVE, CATEGORY, NAVIGATION
// ==========================================

document.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  const categoryButton = event.target.closest("[data-category]");
  const navButton = event.target.closest("[data-page]");

  if (quantityButton) {
    const id = Number(quantityButton.dataset.qty);
    const change = Number(quantityButton.dataset.change);

    cart = cleanCart(cart);

    const item = cart.find(product => product.id === id);

    if (item) {
      item.qty += change;
      cart = cleanCart(cart);

      save();
      renderCart();
    }
  }

  if (removeButton) {
    const id = Number(removeButton.dataset.remove);

    cart = cleanCart(cart).filter(item => item.id !== id);

    save();
    renderCart();
  }

  if (categoryButton) {
    setCategory(categoryButton.dataset.category);
  }

  if (navButton) {
    const target = navButton.dataset.page;

    $$(".nav-item").forEach(button => {
      button.classList.toggle("active", button === navButton);
    });

    if (target === "cart") {
      openCart();
    }

    if (target === "wishlist") {
      showWishlist();
    }

    if (target === "categories") {
      $("#categories")?.scrollIntoView({ behavior: "smooth" });
    }

    if (target === "home") {
      page = "home";
      category = "All";
      query = "";

      if ($("#searchInput")) {
        $("#searchInput").value = "";
      }

      setCategory("All");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
});

// ==========================================
// HEADER AND CART CONTROLS
// ==========================================

$("#headerCart")?.addEventListener("click", openCart);
$("#headerWishlist")?.addEventListener("click", showWishlist);
$("#closeCart")?.addEventListener("click", closeCart);
$("#continueShopping")?.addEventListener("click", closeCart);

$("#cartOverlay")?.addEventListener("click", event => {
  if (event.target === $("#cartOverlay")) {
    closeCart();
  }
});

// ==========================================
// COUPONS
// ==========================================

$("#applyCoupon")?.addEventListener("click", () => {
  const code = $("#couponInput")?.value.trim().toUpperCase() || "";
  const message = $("#couponMessage");

  if (code === "BLOOM10") {
    coupon = code;

    if (message) {
      message.textContent = "10% discount applied! ♡";
    }
  } else if (code === "HELLO50" && subtotal() >= 500) {
    coupon = code;

    if (message) {
      message.textContent = "₱50 discount applied!";
    }
  } else {
    coupon = "";

    if (message) {
      message.textContent = code === "HELLO50"
        ? "HELLO50 requires a ₱500 subtotal."
        : "Invalid code. Try BLOOM10 or HELLO50.";
    }
  }

  renderCart();
});

// ==========================================
// CHECKOUT
// ==========================================

$("#checkoutButton")?.addEventListener("click", () => {
  if (cart.length === 0) {
    toast("Your cart is empty.");
    return;
  }

  $("#checkoutOverlay")?.classList.remove("hidden");
});

$("#closeCheckout")?.addEventListener("click", () => {
  $("#checkoutOverlay")?.classList.add("hidden");
});

$("#checkoutOverlay")?.addEventListener("click", event => {
  if (event.target === $("#checkoutOverlay")) {
    $("#checkoutOverlay")?.classList.add("hidden");
  }
});

$("#checkoutForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#customerName")?.value.trim() || "there";

  cart = [];
  coupon = "";

  save();
  renderCart();

  $("#checkoutOverlay")?.classList.add("hidden");
  closeCart();

  event.target.reset();

  toast(`Thank you, ${name}! Demo order complete ♡`);
});

// ==========================================
// RESET FILTERS
// ==========================================

$("#resetFilters")?.addEventListener("click", () => {
  category = "All";
  query = "";
  page = "home";

  if ($("#searchInput")) {
    $("#searchInput").value = "";
  }

  if ($("#sortSelect")) {
    $("#sortSelect").value = "featured";
  }

  setCategory("All");
});

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}

renderProducts();
renderCart();
updateCounts();
