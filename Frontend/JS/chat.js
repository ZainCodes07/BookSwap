/* ==========================================================================
   BOOKSWAP - chat.js
   In-app messaging between Buyers and Sellers
   Fully integrated with Backend Chat API (GET /api/chat/user/:id, POST /api/chat)
   Includes privacy safeguards (names and books only; no phone numbers or personal emails)
   ========================================================================== */

(function () {
  "use strict";

  var CHAT_KEY = "bookswap_chat_";
  var CART_KEY = "bookswap_cart";

  var shell = document.getElementById("chatShell");
  var listEl = document.getElementById("chatList");
  var threadEl = document.getElementById("chatThread");

  var activeConv = null;
  var conversations = [];
  var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
  var currentUid = user ? (user.UserID || user.id) : null;

  /* Helper functions */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fmtTime(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    var time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (d.toDateString() === new Date().toDateString()) return time;
    return d.toLocaleDateString([], { day: "numeric", month: "short" }) + ", " + time;
  }

  function showEmptyThread(hasConversations) {
    threadEl.innerHTML = "";
    var box = el("p", "chat-empty");

    if (hasConversations) {
      box.textContent = "Select a conversation to start chatting.";
    } else {
      box.appendChild(document.createTextNode("No conversations yet. Open a book and tap \u201CChat with Seller\u201D to start one. "));
      var link = el("a", "", "Browse books");
      link.href = "category.html";
      box.appendChild(link);
    }
    threadEl.appendChild(box);
  }

  function renderList() {
    listEl.innerHTML = "";

    if (!conversations.length) {
      var empty = el("p", "chat-empty");
      empty.appendChild(document.createTextNode("No conversations yet. "));
      var link = el("a", "", "Browse books");
      link.href = "category.html";
      empty.appendChild(link);
      listEl.appendChild(empty);
      return;
    }

    conversations.forEach(function (conv) {
      var isActive = activeConv && activeConv.id === conv.id;
      var item = el("button", "chat-item" + (isActive ? " is-active" : ""));
      item.type = "button";

      var meta = el("span", "chat-item-meta");
      // Privacy safeguard: only other student's name
      meta.appendChild(el("span", "chat-item-name", conv.name || "Student"));
      meta.appendChild(el("span", "chat-item-preview", conv.lastText ? conv.lastText : ("Re: " + (conv.title || "Book"))));

      item.appendChild(el("span", "chat-avatar"));
      item.appendChild(meta);

      item.addEventListener("click", function () { openConversation(conv); });
      listEl.appendChild(item);
    });
  }

  function renderMessages(conv) {
    var box = document.getElementById("chatMessages");
    if (!box || !conv) return;

    box.innerHTML = "";

    if (!conv.messages || conv.messages.length === 0) {
      box.appendChild(el("p", "chat-empty", "No messages yet. Say hello to " + (conv.name || "seller") + "!"));
      return;
    }

    conv.messages.forEach(function (m) {
      var isMe = currentUid ? (m.SenderID === currentUid) : (m.from === "me");
      var bubble = el("div", "chat-msg " + (isMe ? "chat-msg-me" : "chat-msg-them"), m.MessageText || m.text);
      bubble.appendChild(el("span", "chat-msg-time", fmtTime(m.SentAt || m.ts)));
      box.appendChild(bubble);
    });

    box.scrollTop = box.scrollHeight;
  }

  function openConversation(conv) {
    if (!conv) return;
    activeConv = conv;

    // Header displays Name and Book Title ONLY (Anti-circumvention / Commission protection)
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

    document.getElementById("chatName").textContent = conv.name || "Student";
    document.getElementById("chatSub").textContent = "About: " + (conv.title || "Book");

    document.getElementById("chatBack").addEventListener("click", function () {
      shell.classList.remove("is-thread-open");
    });

    document.getElementById("chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chatInput");
      var text = input.value.trim();
      if (!text) return;

      input.value = "";

      var newMsg = {
        SenderID: currentUid,
        ReceiverID: conv.otherId,
        BookID: conv.bookId,
        MessageText: text,
        SentAt: new Date().toISOString(),
        from: "me",
        text: text,
        ts: Date.now()
      };

      conv.messages.push(newMsg);
      conv.lastText = text;
      conv.lastTs = Date.now();

      renderMessages(conv);
      renderList();

      // Send to Backend API
      if (window.BookSwapAPI && currentUid && conv.otherId) {
        window.BookSwapAPI.chat.send(currentUid, conv.otherId, conv.bookId || null, text)
          .catch(function (err) {
            console.warn("[Send Message API Error]", err.message);
          });
      }

      // Also persist to localStorage for instant backup
      try {
        var localKey = CHAT_KEY + (conv.bookId || conv.otherId);
        var existing = JSON.parse(localStorage.getItem(localKey) || "[]");
        existing.push(newMsg);
        localStorage.setItem(localKey, JSON.stringify(existing));
      } catch (err) {}

      input.focus();
    });

    renderMessages(conv);
    renderList();
    shell.classList.add("is-thread-open");

    if (window.matchMedia("(min-width: 761px)").matches) {
      var chatIn = document.getElementById("chatInput");
      if (chatIn) chatIn.focus();
    }
  }

  /* ================= LOAD CONVERSATIONS ================= */

  function loadBackendChat(cb) {
    if (!window.BookSwapAPI || !currentUid) {
      if (cb) cb();
      return;
    }

    window.BookSwapAPI.chat.getByUser(currentUid)
      .then(function (res) {
        var msgs = (res && res.messages) || [];
        var threadMap = {};

        msgs.forEach(function (m) {
          var otherId = (m.SenderID === currentUid) ? m.ReceiverID : m.SenderID;
          var otherName = (m.SenderID === currentUid) ? (m.ReceiverName || "Student") : (m.SenderName || "Student");
          var bookId = m.BookID || 0;
          var key = otherId + "_" + bookId;

          if (!threadMap[key]) {
            threadMap[key] = {
              id: key,
              otherId: otherId,
              bookId: bookId,
              name: otherName,
              title: m.BookTitle || "Book Inquiry",
              messages: [],
              lastText: "",
              lastTs: 0
            };
          }

          threadMap[key].messages.push(m);
        });

        conversations = Object.keys(threadMap).map(function (k) {
          var t = threadMap[k];
          t.messages.sort(function (a, b) {
            return new Date(a.SentAt || 0) - new Date(b.SentAt || 0);
          });
          var last = t.messages[t.messages.length - 1];
          t.lastText = last ? last.MessageText : "";
          t.lastTs = last ? new Date(last.SentAt || 0).getTime() : 0;
          return t;
        });

        conversations.sort(function (a, b) { return b.lastTs - a.lastTs; });

        if (cb) cb();
      })
      .catch(function (err) {
        console.warn("[Chat Load Error]", err.message);
        if (cb) cb();
      });
  }

  function handleDraftFromParams() {
    var params = new URLSearchParams(window.location.search);
    var bookParam = parseInt(params.get("book"), 10);
    var userParam = parseInt(params.get("user"), 10);

    if (!bookParam && !userParam) return;

    var existing = conversations.find(function (c) {
      if (bookParam && userParam) return c.bookId === bookParam && c.otherId === userParam;
      if (bookParam) return c.bookId === bookParam;
      if (userParam) return c.otherId === userParam;
      return false;
    });

    if (existing) {
      openConversation(existing);
      return;
    }

    // Create a new draft thread
    var draft = {
      id: "draft_" + (userParam || "0") + "_" + (bookParam || "0"),
      otherId: userParam || 1,
      bookId: bookParam || 0,
      name: "Seller / Student",
      title: "Book Listing",
      messages: [],
      lastText: "",
      lastTs: Date.now()
    };

    if (window.BookSwapAPI && bookParam) {
      window.BookSwapAPI.listings.getById(bookParam)
        .then(function (res) {
          if (res && res.book) {
            draft.title = res.book.Title || "Book Listing";
            if (res.book.SellerID) draft.otherId = res.book.SellerID;
          }
          conversations.unshift(draft);
          renderList();
          openConversation(draft);
        })
        .catch(function () {
          conversations.unshift(draft);
          renderList();
          openConversation(draft);
        });
    } else {
      conversations.unshift(draft);
      renderList();
      openConversation(draft);
    }
  }

  /* ================= INIT ================= */

  loadBackendChat(function () {
    renderList();

    var params = new URLSearchParams(window.location.search);
    if (params.get("book") || params.get("user")) {
      handleDraftFromParams();
    } else if (conversations.length > 0 && window.matchMedia("(min-width: 761px)").matches) {
      openConversation(conversations[0]);
    } else {
      showEmptyThread(conversations.length > 0);
    }
  });

  /* Keep in sync if another tab updates */
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.indexOf(CHAT_KEY) === 0) {
      loadBackendChat(function () {
        renderList();
        if (activeConv) {
          var updated = conversations.find(function (c) { return c.id === activeConv.id; });
          if (updated) renderMessages(updated);
        }
      });
    }
  });

  /* Navbar mobile menu button */
  var nav = document.querySelector(".site-nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* Navbar cart count */
  try {
    var cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById("navCartBadge") || document.getElementById("cartCount");
    if (badge) badge.textContent = total;
  } catch (err) {}
})();