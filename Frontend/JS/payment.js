/* CHECKOUT PAGE
   Reads the cart saved by book-details ("bookswap_cart"), validates the form,
   and places the order.

   Backend-ready: placeOrder() is the only function to replace with a real
   fetch() call. Real card numbers are never collected on the frontend. */

(function () {
  "use strict";

  var CART_KEY = "bookswap_cart";
  var ORDER_KEY = "bookswap_last_order";
  var SERVICE_FEE = 0;

  var form = document.getElementById("coForm");
  var itemsEl = document.getElementById("coItems");
  var subtotalEl = document.getElementById("coSubtotal");
  var feeEl = document.getElementById("coFee");
  var totalEl = document.getElementById("coTotal");
  var placeBtn = document.getElementById("coPlace");
  var formError = document.getElementById("coFormError");
  var resultEl = document.getElementById("coResult");
  var extraWallet = document.getElementById("coExtraWallet");
  var extraBank = document.getElementById("coExtraBank");


  /* ================= DATA ================= */

  function readCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(raw)) return [];

      return raw.filter(function (item) {
        return item && typeof item.title === "string" && Number(item.price) >= 0 && Number(item.qty) >= 1;
      }).map(function (item) {
        return { id: item.id, title: item.title, price: Number(item.price), qty: Math.floor(Number(item.qty)) };
      });
    } catch (err) {
      return [];
    }
  }

  function placeOrder(order) {
    // future: return fetch("/api/orders", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(order)
    // }).then(function (r) { if (!r.ok) throw new Error("Order failed"); return r.json(); });
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ id: "BS-" + Date.now().toString(36).toUpperCase() });
      }, 600);
    });
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

  function validPhone(value) {
    return /^\+?\d{10,13}$/.test(value.replace(/[\s-]/g, ""));
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(inputId, message) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(inputId + "Err");
    if (!input || !err) return;

    if (message) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      err.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      err.textContent = "";
    }
  }

  function getPayment() {
    var checked = form.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "cash";
  }


  /* ================= SUMMARY ================= */

  var cart = readCart();
  var subtotal = 0;
  var count = 0;

  cart.forEach(function (item) {
    subtotal += item.price * item.qty;
    count += item.qty;
  });

  var total = subtotal + SERVICE_FEE;

  function renderSummary() {
    itemsEl.innerHTML = cart.map(function (item) {
      return '<div class="co-summary-item">' +
        '<span class="co-summary-thumb"></span>' +
        '<div class="co-summary-info">' +
          '<span class="co-summary-title">' + esc(item.title) + '</span>' +
          '<span class="co-summary-qty">Qty: ' + item.qty + '</span>' +
        '</div>' +
        '<span class="co-summary-price">' + money(item.price * item.qty) + '</span>' +
      '</div>';
    }).join("");

    subtotalEl.textContent = money(subtotal);
    feeEl.textContent = money(SERVICE_FEE);
    totalEl.textContent = money(total);
  }

  function updateBadge(value) {
    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = String(value);
  }


  /* ================= PAYMENT EXTRAS ================= */

  function updateExtras() {
    var method = getPayment();
    extraWallet.classList.toggle("is-visible", method === "wallet");
    extraBank.classList.toggle("is-visible", method === "bank");

    if (method !== "wallet") setError("coWallet", "");
    if (method !== "bank") setError("coBankName", "");
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "payment") updateExtras();
  });


  /* ================= VALIDATION ================= */

  function validate() {
    var firstInvalid = null;

    function check(id, message) {
      setError(id, message);
      if (message && !firstInvalid) firstInvalid = document.getElementById(id);
    }

    var name = document.getElementById("coName").value.trim();
    var phone = document.getElementById("coPhone").value.trim();
    var email = document.getElementById("coEmail").value.trim();
    var meetup = document.getElementById("coMeetup").value;
    var method = getPayment();

    check("coName", name.length < 2 ? "Please enter your full name." : "");
    check("coPhone", !validPhone(phone) ? "Enter a valid phone number (10 to 13 digits)." : "");
    check("coEmail", email && !validEmail(email) ? "Enter a valid email address." : "");
    check("coMeetup", !meetup ? "Please choose a meetup point." : "");

    if (method === "wallet") {
      var wallet = document.getElementById("coWallet").value.trim();
      check("coWallet", !validPhone(wallet) ? "Enter your wallet number (10 to 13 digits)." : "");
    }

    if (method === "bank") {
      var bankName = document.getElementById("coBankName").value.trim();
      check("coBankName", bankName.length < 2 ? "Enter the name on your account." : "");
    }

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* clear an error as soon as the user edits that field */
  form.addEventListener("input", function (e) {
    if (e.target.id && e.target.classList.contains("is-invalid")) setError(e.target.id, "");
  });
  form.addEventListener("change", function (e) {
    if (e.target.id && e.target.classList.contains("is-invalid")) setError(e.target.id, "");
  });


  /* ================= SUCCESS / EMPTY ================= */

  function showSuccess(orderId) {
    form.hidden = true;

    document.getElementById("coStep2").classList.remove("is-current");
    document.getElementById("coStep2").classList.add("is-done");
    document.getElementById("coLine2").classList.add("is-done");
    document.getElementById("coStep3").classList.add("is-done");

    resultEl.innerHTML =
      '<div class="co-success">' +
        '<div class="co-success-icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
        '<h2 id="coSuccessTitle" tabindex="-1">Order placed!</h2>' +
        '<p>Thank you. The seller will contact you to arrange the handover.</p>' +
        '<span class="co-order-id">Order ' + esc(orderId) + '</span>' +
        '<p><a href="category.html" class="co-empty-link">Continue browsing</a></p>' +
      '</div>';

    var title = document.getElementById("coSuccessTitle");
    if (title) title.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showEmpty() {
    form.hidden = true;
    resultEl.innerHTML =
      '<div class="co-empty">' +
        '<p>Your cart is empty, so there is nothing to check out yet.</p>' +
        '<a href="category.html">Browse books</a>' +
      '</div>';
  }


  /* ================= SUBMIT ================= */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.textContent = "";

    if (cart.length === 0) return;
    if (!validate()) return;

    var method = getPayment();
    var order = {
      items: cart,
      subtotal: subtotal,
      fee: SERVICE_FEE,
      total: total,
      customer: {
        name: document.getElementById("coName").value.trim(),
        phone: document.getElementById("coPhone").value.trim(),
        email: document.getElementById("coEmail").value.trim()
      },
      meetup: document.getElementById("coMeetup").value,
      notes: document.getElementById("coNotes").value.trim(),
      payment: {
        method: method,
        walletNumber: method === "wallet" ? document.getElementById("coWallet").value.trim() : "",
        accountTitle: method === "bank" ? document.getElementById("coBankName").value.trim() : ""
      }
    };

    placeBtn.disabled = true;
    placeBtn.textContent = "Placing order...";

    placeOrder(order).then(function (result) {
      try {
        localStorage.setItem(ORDER_KEY, JSON.stringify({ id: result.id, total: total, count: count }));
        localStorage.removeItem(CART_KEY);
      } catch (err) {
        /* storage blocked */
      }
      updateBadge(0);
      showSuccess(result.id);
    }).catch(function () {
      formError.textContent = "Something went wrong. Please try again.";
      placeBtn.disabled = false;
      placeBtn.textContent = "Place Order";
    });
  });


  /* ================= INIT ================= */

  if (cart.length === 0) {
    showEmpty();
    updateBadge(0);
  } else {
    renderSummary();
    updateExtras();
    updateBadge(count);
  }

  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
})();