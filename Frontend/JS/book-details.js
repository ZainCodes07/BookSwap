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
      bubble.textContent = m.MessageText || m.text;

      var time = document.createElement("span");
      time.className = "bd-msg-time";
      time.textContent = formatTime(m.CreatedAt || m.ts);
      bubble.appendChild(time);

      chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
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

    chatEl.classList.add("is-open");
    chatEl.setAttribute("aria-hidden", "false");
    chatInput.focus();

    loadMessages(currentBook.SellerID || currentBook.sellerId || 1).then(renderChat);
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
    var description = book.Description || book.description || "No description provided.";
    var sellerName = book.sellerName || "Student Seller";

    var user = window.BookSwapAuth ? window.BookSwapAuth.currentUser() : null;
    var currentUid = user ? (user.UserID || user.id) : null;
    var isOwner = Boolean(user && (
      (book.SellerID && currentUid && Number(book.SellerID) === Number(currentUid)) ||
      (book.sellerEmail && user.email && book.sellerEmail.toLowerCase() === user.email.toLowerCase())
    ));

    var imgUrl = book.ImageUrl || book.photo;
    var coverHtml = imgUrl
      ? '<img src="' + esc(imgUrl) + '" alt="' + esc(title) + '" style="max-height: 300px; max-width: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">'
      : '<div style="text-align: center;">' +
          '<h2 style="font-size: 24px; margin-bottom: 8px; color: #fff;">' + esc(title) + '</h2>' +
          '<p style="font-size: 16px; color: #E0E7FF;">' + esc(author) + '</p>' +
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

    wrap.innerHTML =
      '<div class="bd-cover" id="bdCoverBox" style="background: linear-gradient(135deg, #6C38FF, #3B2470); color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; border-radius: 16px; position: relative; min-height: 380px;">' +
        '<span class="bd-badge" style="position: absolute; top: 16px; left: 16px;">' + esc(condition.toUpperCase()) + '</span>' +
        '<span class="bd-label" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 999px; font-size: 12px;">' + esc(listingType) + '</span>' +
        coverHtml +
        fabHtml +
      '</div>' +
      '<div class="bd-info">' +
        '<h1 class="bd-title">' + esc(title) + '</h1>' +
        '<div class="bd-stars">' + stars(4) + ' <span>(Verified Student Listing)</span></div>' +
        '<div class="bd-price">Rs. ' + esc(price.toLocaleString("en-PK")) + '</div>' +
        '<div class="bd-seller"><span class="bd-seller-avatar"></span>' + esc(sellerName) + ' &middot; ' + esc(listingType) + '</div>' +
        '<p class="bd-desc">' + esc(description) + '</p>' +
        '<div class="bd-tags"><span>' + esc(condition) + '</span><span>' + esc(listingType) + '</span></div>' +
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
  var rawId = params.get("id") || "1";
  var bookId = parseInt(rawId, 10);

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