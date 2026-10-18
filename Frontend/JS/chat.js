/* ==========================================================================
   BOOKSWAP - chat.js
   In-app messaging between Buyers and Sellers
   Fully integrated with Backend Chat API (GET /api/chat/user/:id, POST /api/chat)
   Real-Time Polling & Live Updates, Online/Last Seen, Cartoon Student Avatars, Quick Chips
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
  var pollInterval = null;

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

  function calcStatus(lastTs) {
    if (!lastTs) return { text: "Active recently", isOnline: false };
    var diffMs = Date.now() - new Date(lastTs).getTime();
    var diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 4) {
      return { text: "Online now", isOnline: true };
    } else if (diffMin < 60) {
      return { text: "Active " + diffMin + "m ago", isOnline: false };
    } else {
      var d = new Date(lastTs);
      if (d.toDateString() === new Date().toDateString()) {
        return { text: "Active today at " + fmtTime(lastTs), isOnline: false };
      }
      return { text: "Active recently", isOnline: false };
    }
  }

  function showEmptyThread(hasConversations) {
    threadEl.innerHTML = "";
    var box = el("div", "chat-empty-state");

    var icon = el("div", "chat-empty-icon");
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#6C38FF" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>';
    box.appendChild(icon);

    if (hasConversations) {
      var h3 = el("h3", "", "Select a conversation");
      var p = el("p", "", "Choose a student from the left menu to view messages or negotiate a book swap.");
      box.appendChild(h3);
      box.appendChild(p);
    } else {
      var h3 = el("h3", "", "No conversations yet");
      var p = el("p", "", "When you or a buyer messages about a book, your chats will appear here in real-time.");
      var link = el("a", "auth-btn auth-btn-primary", "Browse Books");
      link.href = "category.html";
      link.style.marginTop = "14px";
      link.style.display = "inline-flex";
      box.appendChild(h3);
      box.appendChild(p);
      box.appendChild(link);
    }
    threadEl.appendChild(box);
  }

  function renderList() {
    listEl.innerHTML = "";

    if (!conversations.length) {
      var empty = el("div", "chat-empty");
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

      // Creative student avatar
      var avatarEl;
      if (window.BookSwapAvatars) {
        avatarEl = window.BookSwapAvatars.createAvatarEl(conv.name, "chat-avatar");
      } else {
        avatarEl = el("span", "chat-avatar");
      }

      var meta = el("span", "chat-item-meta");
      var nameRow = el("span", "chat-item-top-row");
      nameRow.appendChild(el("span", "chat-item-name", conv.name || "Student"));
      if (conv.lastTs) {
        nameRow.appendChild(el("span", "chat-item-time", fmtTime(conv.lastTs)));
      }
      meta.appendChild(nameRow);

      var previewText = conv.lastText ? conv.lastText : ("About: " + (conv.title || "Book"));
      meta.appendChild(el("span", "chat-item-preview", previewText));

      item.appendChild(avatarEl);
      item.appendChild(meta);

      item.addEventListener("click", function () { openConversation(conv); });
      listEl.appendChild(item);
    });
  }

  function appendSingleBubble(box, m) {
    var isMe = currentUid ? (m.SenderID === currentUid) : (m.from === "me");
    var bubble = el("div", "chat-msg " + (isMe ? "chat-msg-me" : "chat-msg-them"));
    bubble.setAttribute("data-msg-id", m.MessageID || m.id || m.ts);

    var txtSpan = el("span", "chat-msg-text", m.MessageText || m.text);
    bubble.appendChild(txtSpan);

    var timeWrap = el("span", "chat-msg-time", fmtTime(m.SentAt || m.ts));
    if (isMe) {
      var check = el("span", "chat-msg-check", " ✓✓");
      timeWrap.appendChild(check);
    }
    bubble.appendChild(timeWrap);

    box.appendChild(bubble);
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
      appendSingleBubble(box, m);
    });

    box.scrollTop = box.scrollHeight;
  }

  function openConversation(conv) {
    if (!conv) return;
    activeConv = conv;

    var status = calcStatus(conv.lastTs);

    // Header displays Name and Book Title ONLY (Anti-circumvention / Commission protection)
    threadEl.innerHTML =
      '<div class="chat-thread-head">' +
        '<button class="chat-back" id="chatBack" type="button" aria-label="Back to conversations">&larr;</button>' +
        '<span class="chat-avatar chat-avatar-sm" id="chatHeaderAvatar"></span>' +
        '<div class="chat-head-info">' +
          '<div class="chat-head-name-row">' +
            '<span class="chat-thread-name" id="chatName"></span>' +
            '<span class="chat-status-pill" id="chatStatusPill">' +
              '<span class="chat-status-dot ' + (status.isOnline ? 'is-online' : '') + '"></span>' +
              '<span id="chatStatusText">' + status.text + '</span>' +
            '</span>' +
          '</div>' +
          '<span class="chat-thread-sub" id="chatSub"></span>' +
        '</div>' +
      '</div>' +
      '<div class="chat-book-banner" id="chatBookBanner" style="display: none;">' +
        '<div class="chat-book-thumb" id="chatBookThumb">📖</div>' +
        '<div class="chat-book-meta">' +
          '<strong id="chatBookTitle">Book Title</strong>' +
          '<span id="chatBookDesc">Verified Student Listing &middot; Fast Handover</span>' +
        '</div>' +
        '<a href="#" class="chat-book-view-btn" id="chatBookLink" target="_blank">View Book &rarr;</a>' +
      '</div>' +
      '<div class="chat-messages" id="chatMessages" role="log" aria-live="polite"></div>' +
      '<div class="chat-quick-chips" id="chatQuickChips">' +
        '<button type="button" class="chat-chip" data-chip="Is this book still available?">👋 Still available?</button>' +
        '<button type="button" class="chat-chip" data-chip="What is the condition of this book?">📖 Condition details?</button>' +
        '<button type="button" class="chat-chip" data-chip="Can we meet on campus for handoff?">🏫 Campus handover?</button>' +
        '<button type="button" class="chat-chip" data-chip="Are you interested in a swap?">🤝 Open for swap?</button>' +
      '</div>' +
      '<form class="chat-form" id="chatForm" autocomplete="off">' +
        '<input class="chat-input" id="chatInput" type="text" placeholder="Type a message..." aria-label="Type a message" maxlength="500">' +
        '<button class="chat-send" type="submit" aria-label="Send message">' +
          '<svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</form>';

    document.getElementById("chatName").textContent = conv.name || "Student";
    document.getElementById("chatSub").textContent = "Re: " + (conv.title || "Book Inquiry");

    if (window.BookSwapAvatars) {
      window.BookSwapAvatars.insertAvatar(document.getElementById("chatHeaderAvatar"), conv.name);
    }

    // Book Banner info
    if (conv.bookId && conv.bookId !== "0") {
      var bBanner = document.getElementById("chatBookBanner");
      var bTitle = document.getElementById("chatBookTitle");
      var bLink = document.getElementById("chatBookLink");
      if (bBanner && bTitle && bLink) {
        bBanner.style.display = "flex";
        bTitle.textContent = conv.title || "Book Listing";
        bLink.href = "book-details.html?id=" + encodeURIComponent(conv.bookId);
      }
    }

    // Quick chips click
    var chips = threadEl.querySelectorAll(".chat-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var text = chip.getAttribute("data-chip");
        var inp = document.getElementById("chatInput");
        if (inp) {
          inp.value = text;
          inp.focus();
        }
      });
    });

    document.getElementById("chatBack").addEventListener("click", function () {
      shell.classList.remove("is-thread-open");
    });

    document.getElementById("chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chatInput");
      var text = input.value.trim();
      if (!text) return;

      input.value = "";

      var tempId = "local_" + Date.now();
      var newMsg = {
        MessageID: tempId,
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

      var box = document.getElementById("chatMessages");
      if (box) {
        appendSingleBubble(box, newMsg);
        box.scrollTop = box.scrollHeight;
      }
      renderList();

      // Send to Backend API
      if (window.BookSwapAPI && currentUid && conv.otherId) {
        window.BookSwapAPI.chat.send(currentUid, conv.otherId, conv.bookId || null, text)
          .then(function (res) {
            if (res && res.data && res.data.MessageID) {
              newMsg.MessageID = res.data.MessageID;
            }
          })
          .catch(function (err) {
            console.warn("[Send Message API Error]", err.message);
          });
      }

      // Also persist to localStorage for instant offline safety
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

  function parseMessagesToThreads(msgs) {
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

    var parsed = Object.keys(threadMap).map(function (k) {
      var t = threadMap[k];
      t.messages.sort(function (a, b) {
        return new Date(a.SentAt || 0) - new Date(b.SentAt || 0);
      });
      var last = t.messages[t.messages.length - 1];
      t.lastText = last ? last.MessageText : "";
      t.lastTs = last ? new Date(last.SentAt || 0).getTime() : 0;
      return t;
    });

    parsed.sort(function (a, b) { return b.lastTs - a.lastTs; });
    return parsed;
  }

  function loadBackendChat(cb) {
    if (!window.BookSwapAPI || !currentUid) {
      if (cb) cb();
      return;
    }

    window.BookSwapAPI.chat.getByUser(currentUid)
      .then(function (res) {
        var msgs = (res && res.messages) || [];
        conversations = parseMessagesToThreads(msgs);
        if (cb) cb();
      })
      .catch(function (err) {
        console.warn("[Chat Load Error]", err.message);
        if (cb) cb();
      });
  }

  /* ================= REAL-TIME SILENT POLLER ================= */

  function pollMessagesSilently() {
    if (!window.BookSwapAPI || !currentUid) return;

    window.BookSwapAPI.chat.getByUser(currentUid)
      .then(function (res) {
        var msgs = (res && res.messages) || [];
        var updatedThreads = parseMessagesToThreads(msgs);

        // Check if any new message arrived for active conversation
        if (activeConv) {
          var currentActiveInUpdated = updatedThreads.find(function (t) {
            return t.id === activeConv.id;
          });

          if (currentActiveInUpdated) {
            var box = document.getElementById("chatMessages");
            var existingCount = activeConv.messages.length;
            var newCount = currentActiveInUpdated.messages.length;

            if (newCount > existingCount) {
              // Append newly arrived messages
              var newlyArrived = currentActiveInUpdated.messages.slice(existingCount);
              newlyArrived.forEach(function (nm) {
                activeConv.messages.push(nm);
                if (box) appendSingleBubble(box, nm);
              });

              if (box) {
                box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
              }

              activeConv.lastText = currentActiveInUpdated.lastText;
              activeConv.lastTs = currentActiveInUpdated.lastTs;

              // Update online status pill
              var st = calcStatus(activeConv.lastTs);
              var stText = document.getElementById("chatStatusText");
              var stDot = document.querySelector(".chat-status-dot");
              if (stText) stText.textContent = st.text;
              if (stDot) {
                if (st.isOnline) stDot.classList.add("is-online");
                else stDot.classList.remove("is-online");
              }
            }
          }
        }

        conversations = updatedThreads;
        renderList();
      })
      .catch(function () {});
  }

  function startLivePolling() {
    stopLivePolling();
    pollInterval = setInterval(function () {
      if (!document.hidden && currentUid) {
        pollMessagesSilently();
      }
    }, 2500);
  }

  function stopLivePolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  /* ================= DRAFT CONVERSATION ================= */

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
            if (res.book.sellerName) draft.name = res.book.sellerName;
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

    // Start real-time polling
    startLivePolling();
  });

  /* Keep in sync if another tab updates */
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.indexOf(CHAT_KEY) === 0) {
      pollMessagesSilently();
    }
  });

  window.addEventListener("focus", function () {
    pollMessagesSilently();
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