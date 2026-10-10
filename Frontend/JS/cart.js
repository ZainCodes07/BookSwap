/* CART DRAWER
   Reads and writes the cart saved by book-details ("bookswap_cart").
   Each item looks like { id, title, price, qty }.
   Backend-ready: readCart() / writeCart() are the only functions that touch storage. */

(function () {
  "use strict";

  var CART_KEY = "bookswap_cart";
  var MAX_QTY = 10;

  var overlay = document.getElementById("cartOverlay");
  var drawer = document.getElementById("cartDrawer");
  var closeBtn = document.getElementById("cartClose");
  var itemsEl = document.getElementById("cartItems");
  var subtotalEl = document.getElementById("cartSubtotal");
  var countEl = document.getElementById("cartHeadCount");
  var checkoutLink = document.getElementById("cartCheckout");

  var EMPTY_HTML =
    '<div class="cart-empty">' +
      '<span class="cart-empty-icon"><svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg></span>' +
      '<p>Your cart is empty. Browse books and add the ones you need.</p>' +
    '</div>';


  /* ================= DATA ================= */

  function readCart() {
    // future: return fetch("/api/cart").then(function (r) { return r.json(); });
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(raw)) return [];

      return raw.filter(function (item) {
        return item && typeof item.title === "string" && Number(item.price) >= 0 && Number(item.qty) >= 1;
      }).map(function (item) {
        return {
          id: item.id,
          title: item.title,
          price: Number(item.price),
          qty: Math.min(MAX_QTY, Math.floor(Number(item.qty)))
        };
      });
    } catch (err) {
      return [];
    }
  }

  function writeCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      /* storage blocked */
    }
  }


  /* ================= HELPERS ================= */

  function esc(value) {
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  function money(n) {
    return "Rs. " + Number(n).toLocaleString("en-US");
  }

  function itemHtml(item) {
    var id = esc(item.id);
    var title = esc(item.title);

    return '<div class="cart-item">' +
      '<span class="cart-thumb"></span>' +
      '<div class="cart-item-info">' +
        '<h3 class="cart-item-title">' + title + '</h3>' +
        '<span class="cart-item-price">' + money(item.price * item.qty) + '</span>' +
        '<div class="cart-item-actions">' +
          '<div class="cart-qty">' +
            '<button type="button" data-action="dec" data-id="' + id + '" aria-label="Decrease quantity of ' + title + '">&minus;</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" data-action="inc" data-id="' + id + '" aria-label="Increase quantity of ' + title + '">+</button>' +
          '</div>' +
          '<button class="cart-remove" type="button" data-action="remove" data-id="' + id + '">Remove</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }


  /* ================= RENDER ================= */

  function render() {
    var cart = readCart();
    var count = 0;
    var subtotal = 0;

    cart.forEach(function (item) {
      count += item.qty;
      subtotal += item.price * item.qty;
    });

    itemsEl.innerHTML = cart.length ? cart.map(itemHtml).join("") : EMPTY_HTML;
    subtotalEl.textContent = money(subtotal);
    countEl.textContent = String(count);

    if (cart.length === 0) {
      checkoutLink.classList.add("is-disabled");
      checkoutLink.setAttribute("aria-disabled", "true");
      checkoutLink.setAttribute("tabindex", "-1");
    } else {
      checkoutLink.classList.remove("is-disabled");
      checkoutLink.removeAttribute("aria-disabled");
      checkoutLink.removeAttribute("tabindex");
    }

    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = String(count);
  }

  function changeQty(id, delta) {
    var cart = readCart();
    var item = cart.filter(function (c) { return String(c.id) === id; })[0];
    if (!item) return;

    item.qty = Math.max(1, Math.min(MAX_QTY, item.qty + delta));
    writeCart(cart);
    render();
  }

  function removeItem(id) {
    var cart = readCart().filter(function (c) { return String(c.id) !== id; });
    writeCart(cart);
    render();
  }

  itemsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;

    var id = btn.getAttribute("data-id");
    var action = btn.getAttribute("data-action");

    if (action === "inc") changeQty(id, 1);
    else if (action === "dec") changeQty(id, -1);
    else if (action === "remove") removeItem(id);
  });

  checkoutLink.addEventListener("click", function (e) {
    if (checkoutLink.classList.contains("is-disabled")) e.preventDefault();
  });


  /* ================= OPEN / CLOSE ================= */

  function leavePage() {
    var cameFromSite = document.referrer && document.referrer.indexOf(window.location.origin) === 0;
    if (cameFromSite && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "category.html";
    }
  }

  function closeDrawer() {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    document.body.classList.remove("cart-lock");
    setTimeout(leavePage, 300);
  }

  function openDrawer() {
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
    document.body.classList.add("cart-lock");
    closeBtn.focus();
  }

  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* keep keyboard focus inside the drawer while it is open */
  drawer.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;

    var focusable = drawer.querySelectorAll('button:not([disabled]), a[href]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });


  /* ================= INIT ================= */

  render();
  window.requestAnimationFrame(openDrawer);

  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
})();