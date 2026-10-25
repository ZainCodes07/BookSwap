/* ==========================================================================
   BOOKSWAP - book-details.js
   Loads book details from Backend API (GET /api/listings/:id)
   Integrated with Backend Chat API and Fly-to-Cart animation
   ========================================================================== */

(function () {
  "use strict";

  var CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z"/></svg>';
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

  /* ================= HELPERS ================= */

  function esc(value) {
    var div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  function stars(n) {
    n = Math.min(5, Math.max(1, Math.round(n || 4)));
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  function formatTime(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /* ================= FLY TO CART ANIMATION ================= */

  function flyToCart(sourceEl, onComplete) {
    var cartBtn = document.getElementById("cartBtn");
    if (!cartBtn || !sourceEl) {
      if (onComplete) onComplete();
      return;
    }

    var startRect = sourceEl.getBoundingClientRect();
    var endRect = cartBtn.getBoundingClientRect();

    var clone = sourceEl.cloneNode(true);
    clone.className = "cart-fly-clone";
    clone.style.left = startRect.left + "px";
    clone.style.top = startRect.top + "px";
    clone.style.width = startRect.width + "px";
    clone.style.height = startRect.height + "px";
    clone.style.opacity = "1";

    document.body.appendChild(clone);

    // Force layout reflow
    clone.getBoundingClientRect();

    // Animate to cart position
    var targetX = endRect.left + endRect.width / 2 - 15;
    var targetY = endRect.top + endRect.height / 2 - 15;

    clone.style.left = targetX + "px";
    clone.style.top = targetY + "px";
    clone.style.width = "30px";
    clone.style.height = "30px";
    clone.style.opacity = "0.2";
    clone.style.transform = "scale(0.2) rotate(360deg)";

    setTimeout(function () {
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      cartBtn.classList.remove("cart-hit");
      void cartBtn.offsetWidth; // reflow
      cartBtn.classList.add("cart-hit");

      var badge = document.getElementById("cartCount") || document.getElementById("navCartBadge");
      if (badge) {
        var count = parseInt(badge.textContent, 10) || 0;
        badge.textContent = count + 1;
      }

      if (onComplete) onComplete();
    }, 750);
  }

  /* ================= CART OPERATIONS ================= */

  function handleAddToCart(book, sourceEl) {
    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;

    flyToCart(sourceEl, function () {
      // Sync with localStorage
      try {
        var cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        var bookId = book.BookID || book.id;
        var existing = cart.filter(function (c) { return (c.BookID || c.id) === bookId; })[0];
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
        } else {
          cart.push({
            id: bookId,
            BookID: bookId,
            title: book.Title || book.title,
            price: Number(book.Price || book.price || 0),
            qty: 1,
            photo: book.ImageUrl || book.photo || null
          });
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch (e) {}

      // If user is logged in, sync with Backend API
      if (user && window.BookSwapAPI) {
        window.BookSwapAPI.cart.add(user.UserID || user.id, book.BookID || book.id)
          .catch(function (err) {
            console.warn("[Cart API Sync]", err.message);
          });
      }
    });
  }

  /* ================= CHAT ================= */

  function loadMessages(sellerId) {
    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
    if (!user || !window.BookSwapAPI) return Promise.resolve([]);

    return window.BookSwapAPI.chat.getConversation(user.UserID || user.id, sellerId)
      .then(function (res) {
        return res.messages || [];
      })
      .catch(function () {
        return [];
      });
  }

  function renderChat(messages) {
    if (!currentBook) return;
    chatMessages.innerHTML = "";

    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
    var currentUserId = user ? (user.UserID || user.id) : null;

    if (!messages || messages.length === 0) {
      var emptyNote = document.createElement("p");
      emptyNote.className = "bd-chat-empty";
      emptyNote.textContent = "No messages yet. Say hello to " + (currentBook.sellerName || "Seller") + "!";
      chatMessages.appendChild(emptyNote);
      return;
    }

    messages.forEach(function (m) {
      var isMe = m.SenderID === currentUserId || m.from === "me";
      var bubble = document.createElement("div");
      bubble.className = "bd-msg " + (isMe ? "bd-msg-me" : "bd-msg-them");

      var txtSpan = document.createElement("span");
      txtSpan.className = "bd-msg-text";
      txtSpan.textContent = m.MessageText || m.text;
      bubble.appendChild(txtSpan);

      var time = document.createElement("span");
      time.className = "bd-msg-time";
      time.textContent = formatTime(m.CreatedAt || m.SentAt || m.ts);
      if (isMe) {
        var chk = document.createElement("span");
        chk.className = "bd-msg-check";
        chk.textContent = " ✓✓";
        time.appendChild(chk);
      }
      bubble.appendChild(time);

      chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  var bdPollTimer = null;
  function startBdPolling() {
    stopBdPolling();
    bdPollTimer = setInterval(function () {
      if (!chatEl.classList.contains("is-open") || !currentBook) return;
      var sellerId = currentBook.SellerID || currentBook.sellerId || 1;
      loadMessages(sellerId).then(function (messages) {
        var existingCount = chatMessages.querySelectorAll(".bd-msg").length;
        if (messages && messages.length !== existingCount) {
          renderChat(messages);
        }
      });
    }, 2500);
  }

  function stopBdPolling() {
    if (bdPollTimer) {
      clearInterval(bdPollTimer);
      bdPollTimer = null;
    }
  }

  function openChat(trigger) {
    if (!currentBook) return;

    var Auth = window.BookSwapAuth;
    if (!Auth || !Auth.isLoggedIn()) {
      if (Auth) Auth.open('login', { reason: 'Sign in to message the seller.' });
      return;
    }

    lastTrigger = trigger || null;
    chatName.textContent = currentBook.sellerName || "Seller";
    chatBook.textContent = "About: " + (currentBook.Title || currentBook.title);

    var chatAvatar = chatEl.querySelector(".bd-chat-avatar");
    if (chatAvatar && window.BookSwapAvatars) {
      window.BookSwapAvatars.insertAvatar(chatAvatar, currentBook.sellerName || "Seller", "38");
    }

    chatEl.classList.add("is-open");
    chatEl.setAttribute("aria-hidden", "false");
    chatInput.focus();

    loadMessages(currentBook.SellerID || currentBook.sellerId || 1).then(renderChat);
    startBdPolling();
  }

  function closeChat() {
    stopBdPolling();
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

    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
    if (!user) return;

    var senderId = user.UserID || user.id;
    var receiverId = currentBook.SellerID || currentBook.sellerId || 1;
    var bookId = currentBook.BookID || currentBook.id;

    if (window.BookSwapAPI) {
      window.BookSwapAPI.chat.send(senderId, receiverId, bookId, text)
        .then(function () {
          chatInput.value = "";
          loadMessages(receiverId).then(renderChat);
        })
        .catch(function (err) {
          alert("Could not send message: " + err.message);
        });
    }
  });

  /* ================= RENDER BOOK ================= */

  function render(book) {
    var title = book.Title || book.title || "Untitled Book";
    var author = book.Author || book.author || "Unknown Author";
    var price = Number(book.Price || book.price || 0);
    var condition = book.BookCondition || book.condition || "Good";
    var listingType = book.ListingType || (book.swap ? "Swap" : "Sale");
    var description = book.Description || book.description || "Verified student listing for course studies.";
    var course = book.Course || book.course || book.Subject || book.subject || "";

    var sellerName = book.SellerName || book.sellerName || (book.User && book.User.FullName) || (book.User && book.User.Name) || (book.seller && isNaN(book.seller) ? book.seller : "Seller");
    var sellerId = book.SellerID || book.sellerId || (book.User && book.User.UserID) || (book.seller ? book.seller : "");

    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
    var currentUid = user ? (user.UserID || user.id) : null;
    var isOwner = Boolean(user && (
      (book.SellerID && currentUid && Number(book.SellerID) === Number(currentUid)) ||
      (book.sellerEmail && user.email && book.sellerEmail.toLowerCase() === user.email.toLowerCase())
    ));

    var imgUrl = book.ImageUrl || book.photo;
    var coverHtml = imgUrl
      ? '<img src="' + esc(imgUrl) + '" alt="' + esc(title) + '" style="max-height: 360px; max-width: 90%; width: auto; object-fit: contain; border-radius: 8px; filter: drop-shadow(0 12px 24px rgba(15, 23, 42, 0.16)); transition: transform 0.25s ease;">'
      : '<div style="width: 200px; height: 280px; background: linear-gradient(135deg, #1E293B, #0F172A); border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; color: #fff; box-shadow: 0 12px 28px rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.1);">' +
          '<span style="font-size: 34px; margin-bottom: 12px;">📖</span>' +
          '<strong style="font-size: 15px; line-height: 1.3; color: #F8FAFC; margin-bottom: 6px;">' + esc(title) + '</strong>' +
          '<small style="font-size: 12px; color: #94A3B8;">' + esc(author) + '</small>' +
        '</div>';

    var fabHtml = isOwner ? '' : '<button class="bd-chat-fab" type="button" data-open-chat aria-label="Chat with seller">' + CHAT_ICON + '</button>';

    var actionButtonsHtml = isOwner
      ? '<div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">' +
          '<a href="Seller/add-listing.html?id=' + encodeURIComponent(book.BookID || book.id) + '" class="btn btn-primary" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">✏️ Edit My Listing</a>' +
          '<a href="Seller/seller-dashboard.html" class="btn btn-outline" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">📊 Seller Dashboard</a>' +
        '</div>'
      : '<div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">' +
          '<button class="btn btn-primary" id="bdAddToCart" type="button" style="padding: 12px 24px; font-size: 16px; border-radius: 8px;">Add to Cart - Rs. ' + esc(price) + '</button>' +
          '<button class="btn btn-outline" id="bdChatBtn" type="button" data-open-chat style="padding: 12px 24px; font-size: 16px; border-radius: 8px;">Chat with Seller</button>' +
        '</div>';

    var sellerInitial = (sellerName && sellerName !== "Seller" ? sellerName : "S").charAt(0).toUpperCase();

    var sellerCardHtml =
      '<div class="bd-seller-card">' +
        '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">' +
          '<div id="bdSellerAvatar" style="width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; background: #6C38FF; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px;">' +
            esc(sellerInitial) +
          '</div>' +
          '<div>' +
            '<span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; font-weight: 600; display: block;">Book Listed By</span>' +
            '<strong id="bdSellerNameDisplay" style="font-size: 15.5px; color: #0F172A;">' + esc(sellerName) + '</strong>' +
          '</div>' +
        '</div>' +
        '<a id="bdSellerVisitLink" href="Seller/my-shop.html?seller=' + encodeURIComponent(sellerId) + (sellerName !== "Seller" ? '&name=' + encodeURIComponent(sellerName) : '') + '" class="bd-seller-visit-btn">' +
          '<span id="bdSellerVisitText">Visit ' + esc(sellerName !== "Seller" ? sellerName + "'s" : "Seller's") + ' Shop</span>' +
          '<svg style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '</a>' +
      '</div>';

    wrap.innerHTML =
      '<div class="bd-cover" id="bdCoverBox">' +
        coverHtml +
        fabHtml +
      '</div>' +
      '<div class="bd-info">' +
        '<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">' +
          '<span style="background: #EEF2FF; color: #4F46E5; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: capitalize;">' + esc(condition) + ' Condition</span>' +
          '<span style="background: #F1F5F9; color: #334155; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px;">' + esc(listingType) + '</span>' +
          (course ? '<span style="background: #FAF5FF; color: #7E22CE; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px;">' + esc(course) + '</span>' : '') +
        '</div>' +
        '<h1 class="bd-title">' + esc(title) + '</h1>' +
        '<p style="margin: 0 0 14px; font-size: 14.5px; color: #64748B;">By <strong style="color: #1E293B;">' + esc(author) + '</strong></p>' +
        '<div class="bd-price" style="font-size: 26px; font-weight: 800; color: #6C38FF; margin-bottom: 18px;">Rs. ' + esc(price.toLocaleString("en-PK")) + '</div>' +
        sellerCardHtml +
        '<div style="margin-bottom: 20px;">' +
          '<h3 style="font-size: 13.5px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">About This Book</h3>' +
          '<p class="bd-desc" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">' + esc(description) + '</p>' +
        '</div>' +
        actionButtonsHtml +
      '</div>';

    // If seller name wasn't provided, fetch it live from user API
    if (sellerId && (!book.SellerName || sellerName === "Seller" || isNaN(sellerName) === false) && window.BookSwapAPI && window.BookSwapAPI.users) {
      window.BookSwapAPI.users.getById(sellerId).then(function (uRes) {
        if (uRes && uRes.user && uRes.user.FullName) {
          var realName = uRes.user.FullName;
          var nameEl = document.getElementById("bdSellerNameDisplay");
          var visitEl = document.getElementById("bdSellerVisitLink");
          var visitTxt = document.getElementById("bdSellerVisitText");
          var avEl = document.getElementById("bdSellerAvatar");
          if (nameEl) nameEl.textContent = realName;
          if (avEl) avEl.textContent = realName.charAt(0).toUpperCase();
          if (visitTxt) visitTxt.textContent = "Visit " + realName + "'s Shop";
          if (visitEl) visitEl.href = "Seller/my-shop.html?seller=" + encodeURIComponent(sellerId) + "&name=" + encodeURIComponent(realName);
        }
      }).catch(function () {});
    }
          '<p class="bd-desc" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">' + esc(description) + '</p>' +
        '</div>' +
        actionButtonsHtml +
      '</div>';

    var coverBox = document.getElementById("bdCoverBox");
    var addToCartBtn = document.getElementById("bdAddToCart");

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", function () {
        handleAddToCart(book, coverBox);
        var originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = "Added to Cart ✓";
        setTimeout(function () { addToCartBtn.textContent = originalText; }, 1400);
      });
    }

    if (!isOwner) {
      var openers = wrap.querySelectorAll("[data-open-chat]");
      Array.prototype.forEach.call(openers, function (btn) {
        btn.addEventListener("click", function () { openChat(btn); });
      });
    }
  }

  /* ================= INITIAL LOAD ================= */

  var params = new URLSearchParams(window.location.search);
  var rawId = params.get("id");
  var bookId = rawId ? parseInt(rawId, 10) : NaN;

  var DEMO_BOOKS = [
    { id: 1,  title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', subject: 'dsa', price: 2200, original: 6500, condition: 'Good', swap: true,  seller: 'Hamza', semester: 6, sold: 41, listedDaysAgo: 9 },
    { id: 2,  title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', subject: 'networking', price: 1800, original: 5200, condition: 'Like new', swap: false, seller: 'Ayesha', semester: 7, sold: 38, listedDaysAgo: 1 },
    { id: 3,  title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', subject: 'databases', price: 1600, original: 4800, condition: 'Good', swap: true, seller: 'Bilal', semester: 5, sold: 35, listedDaysAgo: 3 },
    { id: 4,  title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', subject: 'os', price: 1700, original: 5000, condition: 'Fair', swap: true, seller: 'Usman', semester: 8, sold: 29, listedDaysAgo: 12 },
    { id: 5,  title: 'Data Structures and Algorithms in Java', author: 'Goodrich, Tamassia, Goldwasser', subject: 'dsa', price: 1400, original: 4200, condition: 'Like new', swap: false, seller: 'Fatima', semester: 4, sold: 27, listedDaysAgo: 2 },
    { id: 6,  title: 'C++ How to Program', author: 'Paul Deitel & Harvey Deitel', subject: 'programming', price: 1200, original: 3900, condition: 'Good', swap: true, seller: 'Ali', semester: 3, sold: 33, listedDaysAgo: 5 },
    { id: 7,  title: 'Computer Networks', author: 'Andrew S. Tanenbaum', subject: 'networking', price: 1900, original: 5400, condition: 'Like new', swap: false, seller: 'Zara', semester: 7, sold: 24, listedDaysAgo: 0 },
    { id: 8,  title: 'Object-Oriented Programming in C++', author: 'Robert Lafore', subject: 'oop', price: 1300, original: 4000, condition: 'Good', swap: true, seller: 'Saad', semester: 2, sold: 31, listedDaysAgo: 4 },
    { id: 9,  title: 'Fundamentals of Database Systems', author: 'Elmasri & Navathe', subject: 'databases', price: 1500, original: 4600, condition: 'Good', swap: false, seller: 'Hira', semester: 5, sold: 22, listedDaysAgo: 1 },
    { id: 10, title: 'Computer Organization and Design', author: 'Patterson & Hennessy', subject: 'os', price: 1900, original: 5600, condition: 'Fair', swap: true, seller: 'Taha', semester: 4, sold: 18, listedDaysAgo: 6 },
    { id: 11, title: 'Head First Java', author: 'Kathy Sierra & Bert Bates', subject: 'oop', price: 1100, original: 3800, condition: 'Like new', swap: true, seller: 'Maryam', semester: 1, sold: 26, listedDaysAgo: 2 },
    { id: 12, title: 'Clean Code', author: 'Robert C. Martin', subject: 'oop', price: 1000, original: 3200, condition: 'Good', swap: false, seller: 'Danish', semester: 5, sold: 20, listedDaysAgo: 7 }
  ];

  function fallbackLookup() {
    var localMatch = null;
    try {
      var stored = JSON.parse(localStorage.getItem("bookswap_listings") || "[]");
      localMatch = stored.find(function (item) {
        return String(item.BookID) === String(rawId) || String(item.id) === String(rawId);
      });
    } catch (e) {}

    if (localMatch) {
      currentBook = {
        BookID: localMatch.BookID || localMatch.id,
        Title: localMatch.title,
        Author: localMatch.author,
        Price: localMatch.price,
        BookCondition: localMatch.condition,
        ListingType: localMatch.type === 'swap' ? 'Swap' : 'Sale',
        Description: localMatch.description || ('Verified student listing for ' + (localMatch.course || 'course studies') + '.'),
        sellerName: localMatch.sellerName || 'Student Seller',
        ImageUrl: localMatch.photo || null
      };
      document.title = (currentBook.Title || "Book") + " - BookSwap";
      render(currentBook);
      if (params.get("chat") === "1") openChat(null);
      return true;
    }

    var demoBook = DEMO_BOOKS.find(function (b) { return b.id === bookId; });
    if (demoBook) {
      currentBook = {
        BookID: demoBook.id,
        Title: demoBook.title,
        Author: demoBook.author,
        Price: demoBook.price,
        BookCondition: demoBook.condition,
        ListingType: demoBook.swap ? "Swap" : "Sale",
        Description: "Standard textbook for " + (demoBook.subject ? demoBook.subject.toUpperCase() : "course studies") + ". Great condition, verified student listing.",
        sellerName: demoBook.seller + " (" + demoBook.semester + "th sem)",
        SellerID: 1
      };
      document.title = (demoBook.title || "Book") + " - BookSwap";
      render(currentBook);
      if (params.get("chat") === "1") openChat(null);
      return true;
    }

    return false;
  }

  if (window.BookSwapAPI && !isNaN(bookId)) {
    window.BookSwapAPI.listings.getById(bookId)
      .then(function (res) {
        var book = res.book;
        if (!book) throw new Error("Book not found");
        currentBook = book;
        document.title = (book.Title || "Book") + " - BookSwap";
        render(book);
        if (params.get("chat") === "1") openChat(null);
      })
      .catch(function (err) {
        console.warn("[Book Details Fetch Error]", err.message);
        if (!fallbackLookup()) {
          wrap.innerHTML =
            '<div style="text-align: center; padding: 60px 20px;">' +
              '<h2>Book Listing #' + esc(rawId) + '</h2>' +
              '<p style="color: #64748B; margin: 12px 0 24px;">' + esc(err.message || "Book listing not found in database.") + '</p>' +
              '<a href="index.html" class="btn btn-primary">Browse All Books</a>' +
            '</div>';
        }
      });
  } else {
    if (!fallbackLookup()) {
      wrap.innerHTML =
        '<div style="text-align: center; padding: 60px 20px;">' +
          '<h2>Book Listing #' + esc(rawId) + '</h2>' +
          '<p style="color: #64748B; margin: 12px 0 24px;">Book listing not found.</p>' +
          '<a href="index.html" class="btn btn-primary">Browse All Books</a>' +
        '</div>';
    }
  }

})();