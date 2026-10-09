/* BOOK DETAILS PAGE + IN-APP CHAT
   Open with ?id=3 (example: book-details.html?id=3).
   Add &chat=1 to open the chat panel automatically.

   BOOKS is placeholder data shaped like a real API response.
   Backend-ready spots (replace with fetch() when the API exists):
   - getBookById()
   - loadMessages()
   - saveMessage()  */

(function () {
  "use strict";

  var BOOKS = {
    1:  { id: 1,  sellerId: 1,  seller: "Ahmed R.",   title: "Introduction to Programming",  price: 850,  subject: "Programming Fundamentals", degree: "Software Engineering",    semester: "Sem 1", condition: "Good",     rating: 4, reviews: 23, description: "Slightly used, no missing pages, a few pencil underlines in Ch.3." },
    2:  { id: 2,  sellerId: 2,  seller: "Sara K.",    title: "Calculus & Analytic Geometry", price: 600,  subject: "Mathematics",              degree: "Software Engineering",    semester: "Sem 1", condition: "Like New", rating: 5, reviews: 11, description: "Barely used, no markings inside." },
    3:  { id: 3,  sellerId: 3,  seller: "Bilal H.",   title: "Intro to Machine Learning",    price: 1200, subject: "Machine Learning",         degree: "Artificial Intelligence", semester: "Sem 5", condition: "Fair",     rating: 4, reviews: 8,  description: "Well used but complete, some highlighter marks in the first chapters." },
    4:  { id: 4,  sellerId: 4,  seller: "Hina M.",    title: "Applied Physics",              price: 550,  subject: "Physics",                  degree: "Software Engineering",    semester: "Sem 2", condition: "Good",     rating: 4, reviews: 6,  description: "All chapters intact, light pencil notes in margins." },
    5:  { id: 5,  sellerId: 5,  seller: "Usman T.",   title: "Data Structures & Algorithms", price: 900,  subject: "Data Structures",          degree: "Computer Science",        semester: "Sem 3", condition: "Like New", rating: 5, reviews: 15, description: "Almost new, used for one semester only." },
    6:  { id: 6,  sellerId: 6,  seller: "Zara A.",    title: "Linear Algebra",               price: 500,  subject: "Mathematics",              degree: "Artificial Intelligence", semester: "Sem 2", condition: "Good",     rating: 4, reviews: 9,  description: "Clean copy with solved examples marked in a few chapters." },
    7:  { id: 7,  sellerId: 7,  seller: "Daniyal S.", title: "Operating Systems Concepts",   price: 750,  subject: "Operating Systems",        degree: "Computer Science",        semester: "Sem 4", condition: "Fair",     rating: 3, reviews: 5,  description: "Older edition but still relevant. Spine slightly loose." },
    8:  { id: 8,  sellerId: 8,  seller: "Maryam F.",  title: "Database Systems",             price: 700,  subject: "Databases",                degree: "Computer Science",        semester: "Sem 4", condition: "Good",     rating: 4, reviews: 12, description: "Complete book with clean pages." },
    9:  { id: 9,  sellerId: 9,  seller: "Areeba N.",  title: "English Composition",          price: 400,  subject: "English",                  degree: "Software Engineering",    semester: "Sem 1", condition: "Good",     rating: 4, reviews: 4,  description: "Useful for report writing. Light usage." },
    10: { id: 10, sellerId: 10, seller: "Hamza Q.",   title: "Python Programming",           price: 650,  subject: "Python",                   degree: "Artificial Intelligence", semester: "Sem 2", condition: "Like New", rating: 5, reviews: 14, description: "Exercises included, none filled in." },
    11: { id: 11, sellerId: 11, seller: "Fatima L.",  title: "Probability & Statistics",     price: 580,  subject: "Statistics",               degree: "Artificial Intelligence", semester: "Sem 3", condition: "Good",     rating: 4, reviews: 7,  description: "Complete with practice problem sets." }
  };

  var CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z"/></svg>';
  var CHAT_KEY = "bookswap_chat_";
  var CART_KEY = "bookswap_cart";

  var wrap = document.getElementById("bdWrap");
  var chatEl = document.getElementById("bdChat");
  var chatMessages = document.getElementById("bdChatMessages");
  var chatForm = document.getElementById("bdChatForm");
  var chatInput = document.getElementById("bdChatInput");
  var chatClose = document.getElementById("bdChatClose");
  var chatName = document.getElementById("bdChatName");
  var chatBook = document.getElementById("bdChatBook");

  var currentBook = null;
  var lastTrigger = null;


  /* ================= DATA LAYER (placeholder) ================= */

  function getBookById(id) {
    // future: return fetch("/api/books/" + id).then(function (r) { return r.json(); });
    return BOOKS[id] || null;
  }

  function loadMessages(bookId) {
    // future: return fetch("/api/books/" + bookId + "/messages").then(function (r) { return r.json(); });
    try {
      var data = JSON.parse(localStorage.getItem(CHAT_KEY + bookId) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  function saveMessage(bookId, text) {
    // future: return fetch("/api/books/" + bookId + "/messages", { method: "POST", body: JSON.stringify({ text: text }) });
    var messages = loadMessages(bookId);
    var message = { from: "me", text: text, ts: Date.now() };
    messages.push(message);
    try {
      localStorage.setItem(CHAT_KEY + bookId, JSON.stringify(messages));
    } catch (err) {
      /* storage blocked: message still shows for this visit */
    }
    return message;
  }


  /* ================= HELPERS ================= */

  function esc(value) {
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function readCart() {
    try {
      var cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(cart) ? cart : [];
    } catch (err) {
      return [];
    }
  }

  function updateCartBadge() {
    var total = readCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = total;
  }

  function addToCart(book) {
    var cart = readCart();
    var existing = cart.filter(function (item) { return item.id === book.id; })[0];

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: book.id, title: book.title, price: book.price, qty: 1 });
    }

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      /* storage blocked */
    }
    updateCartBadge();
  }


  /* ================= CHAT PANEL ================= */

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function renderChat() {
    if (!currentBook) return;

    var messages = loadMessages(currentBook.id);
    chatMessages.innerHTML = "";

    if (messages.length === 0) {
      var emptyNote = document.createElement("p");
      emptyNote.className = "bd-chat-empty";
      emptyNote.textContent = "No messages yet. Say hello to " + currentBook.seller + "!";
      chatMessages.appendChild(emptyNote);
      return;
    }

    messages.forEach(function (m) {
      var bubble = document.createElement("div");
      bubble.className = "bd-msg " + (m.from === "me" ? "bd-msg-me" : "bd-msg-them");
      bubble.textContent = m.text;

      var time = document.createElement("span");
      time.className = "bd-msg-time";
      time.textContent = formatTime(m.ts);
      bubble.appendChild(time);

      chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function openChat(trigger) {
    if (!currentBook) return;
    lastTrigger = trigger || null;
    chatName.textContent = currentBook.seller;
    chatBook.textContent = "About: " + currentBook.title;
    renderChat();
    chatEl.classList.add("is-open");
    chatEl.setAttribute("aria-hidden", "false");
    chatInput.focus();
  }

  function closeChat() {
    chatEl.classList.remove("is-open");
    chatEl.setAttribute("aria-hidden", "true");
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  }

  chatClose.addEventListener("click", closeChat);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && chatEl.classList.contains("is-open")) closeChat();
  });

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = chatInput.value.trim();
    if (!text || !currentBook) return;

    saveMessage(currentBook.id, text);
    chatInput.value = "";
    renderChat();
  });


  /* ================= PAGE RENDER ================= */

  function render(book) {
    wrap.innerHTML =
      '<div class="bd-cover">' +
        '<span class="bd-badge">' + esc(book.condition.toUpperCase()) + '</span>' +
        '<span class="bd-label">' + esc(book.subject) + '</span>' +
        '<button class="bd-chat-fab" type="button" data-open-chat aria-label="Chat with seller">' + CHAT_ICON + '</button>' +
      '</div>' +
      '<div class="bd-info">' +
        '<h1 class="bd-title">' + esc(book.title) + '</h1>' +
        '<div class="bd-stars">' + stars(book.rating) + ' <span>(' + esc(book.reviews) + ' reviews)</span></div>' +
        '<div class="bd-price">Rs. ' + esc(book.price) + '</div>' +
        '<div class="bd-seller"><span class="bd-seller-avatar"></span>Sold by ' + esc(book.seller) + ' · ' + esc(book.degree) + ' · ' + esc(book.semester) + '</div>' +
        '<p class="bd-desc">' + esc(book.description) + '</p>' +
        '<div class="bd-tags"><span>' + esc(book.subject) + '</span><span>' + esc(book.condition) + '</span></div>' +
        '<button class="bd-btn bd-btn-primary" id="bdAddToCart" type="button">Add to Cart - Rs. ' + esc(book.price) + '</button>' +
        '<button class="bd-btn bd-btn-ghost" type="button" data-open-chat>Message Seller</button>' +
      '</div>';

    var openers = wrap.querySelectorAll("[data-open-chat]");
    Array.prototype.forEach.call(openers, function (btn) {
      btn.addEventListener("click", function () { openChat(btn); });
    });

    var cartBtn = document.getElementById("bdAddToCart");
    cartBtn.addEventListener("click", function () {
      addToCart(book);
      var original = cartBtn.textContent;
      cartBtn.textContent = "Added to cart ✓";
      setTimeout(function () { cartBtn.textContent = original; }, 1500);
    });
  }


  /* ================= INIT ================= */

  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"), 10) || 1;
  var book = getBookById(id);

  if (!book) {
    wrap.innerHTML = '<p class="bd-notfound">Sorry, this book listing could not be found.</p>';
  } else {
    currentBook = book;
    document.title = book.title + " - BookSwap";
    render(book);
    if (params.get("chat") === "1") openChat(null);
  }

  /* navbar: mobile menu button */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  updateCartBadge();
})();