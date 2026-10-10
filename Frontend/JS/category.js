/* CATEGORY PAGE
   Desktop (mouse): the subject dropdown opens on hover (pure CSS).
   Mobile / keyboard: tap, click or Enter toggles the dropdown (class "is-open"). */

(function () {
  "use strict";

  var cards = document.querySelectorAll(".cat-card");

  function setOpen(card, open) {
    card.classList.toggle("is-open", open);
    var btn = card.querySelector(".cat-toggle");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAll(except) {
    cards.forEach(function (card) {
      if (card !== except) setOpen(card, false);
    });
  }

  cards.forEach(function (card) {
    var btn = card.querySelector(".cat-toggle");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var willOpen = !card.classList.contains("is-open");
      closeAll(card);
      setOpen(card, willOpen);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".cat-card")) closeAll(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });

  /* navbar: mobile menu button */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* navbar: cart count (saved by book_details.js) */
  try {
    var cart = JSON.parse(localStorage.getItem("bookswap_cart") || "[]");
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = total;
  } catch (err) {
    /* ignore storage errors */
  }
})();