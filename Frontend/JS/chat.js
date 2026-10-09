/* CHAT PAGE (in-app messaging)
   Conversations are the chats started from book-details.html (saved per book
   under "bookswap_chat_<bookId>"). Open a chat directly with chat.html?book=3

   Backend-ready spots (replace with fetch() when the API exists):
   loadMessages(), saveMessage(), getConversations() */

(function () {
  "use strict";

  var CHAT_KEY = "bookswap_chat_";
  var CART_KEY = "bookswap_cart";

  /* placeholder lookup: the backend will send seller + book info itself */
  var BOOKS = {
    1:  { seller: "Ahmed R.",   title: "Introduction to Programming" },
    2:  { seller: "Sara K.",    title: "Calculus & Analytic Geometry" },
    3:  { seller: "Bilal H.",   title: "Intro to Machine Learning" },
    4:  { seller: "Hina M.",    title: "Applied Physics" },
    5:  { seller: "Usman T.",   title: "Data Structures & Algorithms" },
    6:  { seller: "Zara A.",    title: "Linear Algebra" },
    7:  { seller: "Daniyal S.", title: "Operating Systems Concepts" },
    8:  { seller: "Maryam F.",  title: "Database Systems" },
    9:  { seller: "Areeba N.",  title: "English Composition" },
    10: { seller: "Hamza Q.",   title: "Python Programming" },
    11: { seller: "Fatima L.",  title: "Probability & Statistics" }
  };


  /* ================= DATA LAYER (placeholder) ================= */

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
    messages.push({ from: "me", text: text, ts: Date.now() });
    try {
      localStorage.setItem(CHAT_KEY + bookId, JSON.stringify(messages));
    } catch (err) {
      /* storage blocked */
    }
  }

  function getConversations() {
    // future: return fetch("/api/conversations").then(function (r) { return r.json(); });
    var list = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || key.indexOf(CHAT_KEY) !== 0) continue;

        var id = parseInt(key.slice(CHAT_KEY.length), 10);
        var info = BOOKS[id];
        if (!info) continue;

        var messages = loadMessages(id);
        if (messages.length === 0) continue;

        list.push({
          bookId: id,
          seller: info.seller,
          title: info.title,
          last: messages[messages.length - 1]
        });
      }
    } catch (err) {
      /* ignore storage errors */
    }

    list.sort(function (a, b) { return b.last.ts - a.last.ts; });
    return list;
  }


  /* ================= UI ================= */

  var shell = document.getElementById("chatShell");
  var listEl = document.getElementById("chatList");
  var threadEl = document.getElementById("chatThread");

  var activeId = null;
  var draftId = null; /* a chat opened from a book page that has no messages yet */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    var time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (d.toDateString() === new Date().toDateString()) return time;
    return d.toLocaleDateString([], { day: "numeric", month: "short" }) + ", " + time;
  }

  function currentList() {
    var convs = getConversations();
    if (draftId && BOOKS[draftId]) {
      var exists = convs.some(function (c) { return c.bookId === draftId; });
      if (!exists) {
        convs.unshift({
          bookId: draftId,
          seller: BOOKS[draftId].seller,
          title: BOOKS[draftId].title,
          last: null
        });
      }
    }
    return convs;
  }

  function showEmptyThread(hasConversations) {
    threadEl.innerHTML = "";
    var box = el("p", "chat-empty");

    if (hasConversations) {
      box.textContent = "Select a conversation to start chatting.";
    } else {
      box.appendChild(document.createTextNode("No conversations yet. Open a book and tap \u201CMessage Seller\u201D to start one. "));
      var link = el("a", "", "Browse books");
      link.href = "category.html";
      box.appendChild(link);
    }
    threadEl.appendChild(box);
  }

  function renderList() {
    var convs = currentList();
    listEl.innerHTML = "";

    if (convs.length === 0) {
      var empty = el("p", "chat-empty");
      empty.appendChild(document.createTextNode("No conversations yet. "));
      var link = el("a", "", "Browse books");
      link.href = "category.html";
      empty.appendChild(link);
      listEl.appendChild(empty);
      return convs;
    }

    convs.forEach(function (conv) {
      var item = el("button", "chat-item" + (conv.bookId === activeId ? " is-active" : ""));
      item.type = "button";

      var meta = el("span", "chat-item-meta");
      meta.appendChild(el("span", "chat-item-name", conv.seller));
      meta.appendChild(el("span", "chat-item-preview", conv.last ? conv.last.text : "No messages yet"));

      item.appendChild(el("span", "chat-avatar"));
      item.appendChild(meta);

      item.addEventListener("click", function () { openConversation(conv.bookId); });
      listEl.appendChild(item);
    });

    return convs;
  }

  function renderMessages() {
    var box = document.getElementById("chatMessages");
    if (!box || !activeId) return;

    var messages = loadMessages(activeId);
    box.innerHTML = "";

    if (messages.length === 0) {
      box.appendChild(el("p", "chat-empty", "No messages yet. Say hello to " + BOOKS[activeId].seller + "!"));
      return;
    }

    messages.forEach(function (m) {
      var bubble = el("div", "chat-msg " + (m.from === "me" ? "chat-msg-me" : "chat-msg-them"), m.text);
      bubble.appendChild(el("span", "chat-msg-time", fmtTime(m.ts)));
      box.appendChild(bubble);
    });

    box.scrollTop = box.scrollHeight;
  }

  function openConversation(bookId) {
    var info = BOOKS[bookId];
    if (!info) return;

    activeId = bookId;

    threadEl.innerHTML =
      '<div class="chat-thread-head">' +
        '<button class="chat-back" id="chatBack" type="button" aria-label="Back to conversations">&larr;</button>' +
        '<span class="chat-avatar chat-avatar-sm"></span>' +
        '<span><span class="chat-thread-name" id="chatName"></span><span class="chat-thread-sub" id="chatSub"></span></span>' +
      '</div>' +
      '<div class="chat-messages" id="chatMessages" role="log" aria-live="polite"></div>' +
      '<form class="chat-form" id="chatForm" autocomplete="off">' +
        '<input class="chat-input" id="chatInput" type="text" placeholder="Type a message..." aria-label="Type a message" maxlength="500">' +
        '<button class="chat-send" type="submit" aria-label="Send message">' +
          '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</form>';

    document.getElementById("chatName").textContent = info.seller;
    document.getElementById("chatSub").textContent = "About: " + info.title;

    document.getElementById("chatBack").addEventListener("click", function () {
      shell.classList.remove("is-thread-open");
    });

    document.getElementById("chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chatInput");
      var text = input.value.trim();
      if (!text) return;

      saveMessage(activeId, text);
      input.value = "";
      renderMessages();
      renderList();
      input.focus();
    });

    renderMessages();
    renderList();
    shell.classList.add("is-thread-open");

    if (window.matchMedia("(min-width: 761px)").matches) {
      document.getElementById("chatInput").focus();
    }
  }


  /* ================= INIT ================= */

  var params = new URLSearchParams(window.location.search);
  var bookParam = parseInt(params.get("book"), 10);
  if (bookParam && BOOKS[bookParam]) draftId = bookParam;

  var convs = renderList();

  if (draftId) {
    openConversation(draftId);
  } else if (convs.length > 0 && window.matchMedia("(min-width: 761px)").matches) {
    openConversation(convs[0].bookId);
  } else {
    showEmptyThread(convs.length > 0);
  }

  /* keep in sync if another tab sends a message */
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.indexOf(CHAT_KEY) === 0) {
      renderList();
      renderMessages();
    }
  });

  /* navbar: mobile menu button */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* navbar: cart count */
  try {
    var cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById("navCartBadge");
    if (badge) badge.textContent = total;
  } catch (err) {
    /* ignore storage errors */
  }
})();