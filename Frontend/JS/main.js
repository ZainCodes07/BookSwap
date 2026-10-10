/* ==========================================================================
   BOOKSWAP - main.js
   Owner: Member 3 (Ghauri)
   Used by: index.html (home page), contact.html

   Every section below checks if its element exists on the page first,
   so this same file is safe to load on any page.

   NOTE FOR BACKEND: the BOOKS array is dummy data for now.
   Later, replace it with data from the API (e.g. GET /api/books)
   and call renderHome(books) with the result.
   ========================================================================== */

(function () {
  'use strict';

  /* ========== 1. DUMMY DATA STARTED ========== */

  // CS core courses: one 4-credit core course per semester, in semester order
  var SUBJECTS = [
    { key: 'programming', name: 'Programming Fundamentals',    short: 'Programming',     icon: '{ }', semester: 1 },
    { key: 'oop',         name: 'Object Oriented Programming', short: 'OOP',             icon: 'OOP', semester: 2 },
    { key: 'dsa',         name: 'Data Structures',             short: 'Data Structures', icon: '[ ]', semester: 3 },
    { key: 'databases',   name: 'Databases',                   short: 'Databases',       icon: 'DB',  semester: 4 },
    { key: 'networking',  name: 'Computer Networks',           short: 'Networks',        icon: '<->', semester: 5 },
    { key: 'os',          name: 'Operating Systems',           short: 'OS',              icon: 'OS',  semester: 6 }
  ];

  // cover = background colour of the book cover, ink = text colour on it
  var BOOKS = [
    { id: 1,  title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', subject: 'dsa', price: 2200, original: 6500, condition: 'Good', swap: true,  seller: 'Hamza', semester: 6, sold: 41, listedDaysAgo: 9,  cover: '#0F172A', ink: '#FDE68A' },
    { id: 2,  title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', subject: 'networking', price: 1800, original: 5200, condition: 'Like new', swap: false, seller: 'Ayesha', semester: 7, sold: 38, listedDaysAgo: 1, cover: '#6C38FF', ink: '#FFFFFF' },
    { id: 3,  title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', subject: 'databases', price: 1600, original: 4800, condition: 'Good', swap: true, seller: 'Bilal', semester: 5, sold: 35, listedDaysAgo: 3, cover: '#F472B6', ink: '#0F172A' },
    { id: 4,  title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', subject: 'os', price: 1700, original: 5000, condition: 'Fair', swap: true, seller: 'Usman', semester: 8, sold: 29, listedDaysAgo: 12, cover: '#FDE68A', ink: '#0F172A' },
    { id: 5,  title: 'Data Structures and Algorithms in Java', author: 'Goodrich, Tamassia, Goldwasser', subject: 'dsa', price: 1400, original: 4200, condition: 'Like new', swap: false, seller: 'Fatima', semester: 4, sold: 27, listedDaysAgo: 2, cover: '#14B8A6', ink: '#0F172A' },
    { id: 6,  title: 'C++ How to Program', author: 'Paul Deitel & Harvey Deitel', subject: 'programming', price: 1200, original: 3900, condition: 'Good', swap: true, seller: 'Ali', semester: 3, sold: 33, listedDaysAgo: 5, cover: '#A855F7', ink: '#FFFFFF' },
    { id: 7,  title: 'Computer Networks', author: 'Andrew S. Tanenbaum', subject: 'networking', price: 1900, original: 5400, condition: 'Like new', swap: false, seller: 'Zara', semester: 7, sold: 24, listedDaysAgo: 0, cover: '#1E1B4B', ink: '#C4B5FD' },
    { id: 8,  title: 'Object-Oriented Programming in C++', author: 'Robert Lafore', subject: 'oop', price: 1300, original: 4000, condition: 'Good', swap: true, seller: 'Saad', semester: 2, sold: 31, listedDaysAgo: 4, cover: '#BE185D', ink: '#FFFFFF' },
    { id: 9,  title: 'Fundamentals of Database Systems', author: 'Elmasri & Navathe', subject: 'databases', price: 1500, original: 4600, condition: 'Good', swap: false, seller: 'Hira', semester: 5, sold: 22, listedDaysAgo: 1, cover: '#0E7490', ink: '#FFFFFF' },
    { id: 10, title: 'Computer Organization and Design', author: 'Patterson & Hennessy', subject: 'os', price: 1900, original: 5600, condition: 'Fair', swap: true, seller: 'Taha', semester: 4, sold: 18, listedDaysAgo: 6, cover: '#334155', ink: '#F8FAFC' },
    { id: 11, title: 'Head First Java', author: 'Kathy Sierra & Bert Bates', subject: 'oop', price: 1100, original: 3800, condition: 'Like new', swap: true, seller: 'Maryam', semester: 1, sold: 26, listedDaysAgo: 2, cover: '#8B5CF6', ink: '#FFFFFF' },
    { id: 12, title: 'Clean Code', author: 'Robert C. Martin', subject: 'oop', price: 1000, original: 3200, condition: 'Good', swap: false, seller: 'Danish', semester: 5, sold: 20, listedDaysAgo: 7, cover: '#FEF3C7', ink: '#7C2D12' }
  ];

  /* ========== DUMMY DATA END ========== */


  /* ========== 2. HELPERS STARTED ========== */

  function $(id) { return document.getElementById(id); }

  // Escape text before putting it in HTML (safe for backend data later)
  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rupees(n) { return 'Rs ' + n.toLocaleString('en-PK'); }

  function discount(book) {
    return Math.round((1 - book.price / book.original) * 100);
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function listedText(days) {
    if (days === 0) return 'Listed today';
    if (days === 1) return 'Listed yesterday';
    return 'Listed ' + days + ' days ago';
  }

  // Small popup at the bottom of the screen
  var toastTimer;
  function showToast(message) {
    var toast = $('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  /* ========== HELPERS END ========== */


  /* ========== 3. BOOK CARD TEMPLATE STARTED ========== */

  function bookCard(book) {
    var link = 'book-details.html?id=' + book.id;
    var conditionClass = 'cond-' + book.condition.toLowerCase().replace(' ', '-');

    return '' +
      '<article class="book-card">' +
        '<a href="' + link + '" class="book-cover" style="--cover:' + book.cover + ';--ink:' + book.ink + '" aria-label="' + esc(book.title) + '">' +
          '<span class="cover-title">' + esc(book.title) + '</span>' +
          '<span class="cover-author">' + esc(book.author) + '</span>' +
          '<span class="cover-off">-' + discount(book) + '%</span>' +
        '</a>' +
        '<button type="button" class="wish-btn" data-wish="' + book.id + '" aria-label="Save ' + esc(book.title) + ' to wishlist" aria-pressed="false">' +
          '<svg class="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '</button>' +
        '<div class="book-info">' +
          '<div class="book-tags">' +
            '<span class="tag ' + conditionClass + '">' + esc(book.condition) + '</span>' +
            (book.swap ? '<span class="tag tag-swap">Open to swap</span>' : '') +
          '</div>' +
          '<h3 class="book-title"><a href="' + link + '">' + esc(book.title) + '</a></h3>' +
          '<p class="book-author">' + esc(book.author) + '</p>' +
          '<p class="book-seller">' + esc(book.seller) + ', ' + ordinal(book.semester) + ' semester</p>' +
          '<div class="book-bottom">' +
            '<div class="book-price">' +
              '<strong>' + rupees(book.price) + '</strong>' +
              '<s>' + rupees(book.original) + '</s>' +
            '</div>' +
            '<button type="button" class="add-btn" data-add="' + book.id + '" aria-label="Add ' + esc(book.title) + ' to cart">' +
              '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* ========== BOOK CARD TEMPLATE END ========== */


  /* ========== 4. HOME PAGE SECTIONS STARTED ========== */

  // Hero: subject chips + total book count
  function renderHero(books) {
    var chips = $('heroChips');
    if (chips) {
      chips.innerHTML = SUBJECTS.slice(0, 5).map(function (s) {
        return '<a class="chip" href="category.html?subject=' + s.key + '">' + esc(s.short) + '</a>';
      }).join('');
    }
    var count = $('heroBookCount');
    if (count) count.textContent = books.length;
  }

  // Hero bookshelf: top sellers.
  // First 5 stand as spines, next 2 lie flat in a small stack,
  // and the floating book (static HTML in index.html) hovers above that stack.
  function renderShelf(books) {
    var shelf = $('shelfBooks');
    if (!shelf) return;

    var top = books.slice().sort(function (a, b) { return b.sold - a.sold; });
    var standing = top.slice(0, 5);
    var lying    = top.slice(5, 7);
    var heights  = [94, 84, 100, 88, 96];   // % heights so spines look natural
    var widths   = [54, 46, 60, 50, 56];    // px

    var spines = standing.map(function (book, i) {
      return '<a class="spine" href="book-details.html?id=' + book.id + '" ' +
        'style="--cover:' + book.cover + ';--ink:' + book.ink + ';--h:' + heights[i] + '%;--w:' + widths[i] + 'px;--i:' + i + '" ' +
        'title="' + esc(book.title) + ' - ' + rupees(book.price) + '">' +
          '<span class="spine-title">' + esc(book.title) + '</span>' +
        '</a>';
    }).join('');

    var stack = '<div class="book-stack">' + lying.map(function (book, i) {
      return '<a class="lying-book" href="book-details.html?id=' + book.id + '" ' +
        'style="--cover:' + book.cover + ';--ink:' + book.ink + ';--i:' + (5 + i) + '" ' +
        'title="' + esc(book.title) + ' - ' + rupees(book.price) + '">' +
          '<span class="lying-title">' + esc(book.title) + '</span>' +
        '</a>';
    }).join('') + '</div>';

    shelf.innerHTML = spines + stack;
  }

  // Subject tiles with number of books in each
  function renderSubjects(books) {
    var grid = $('subjectGrid');
    if (!grid) return;

    grid.innerHTML = SUBJECTS.map(function (s) {
      var count = books.filter(function (b) { return b.subject === s.key; }).length;
      return '<a class="subject-tile" href="category.html?subject=' + s.key + '">' +
          '<span class="subject-icon" aria-hidden="true">' + esc(s.icon) + '</span>' +
          '<span class="subject-name">' + esc(s.name) + '</span>' +
          '<span class="subject-count">' + count + (count === 1 ? ' book' : ' books') + '</span>' +
        '</a>';
    }).join('');
  }

  // Best selling: sorted by how many times sold.
  // The cards are added TWICE in one long row. CSS slides the row to the left,
  // and when the first copy has fully passed, the row jumps back to the start.
  // Because the second copy looks exactly like the first, the loop looks endless.
  function renderBestSellers(books) {
    var box = $('bestSellers');
    if (!box) return;

    var top = books.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 8);
    var cards = top.map(bookCard).join('');

    box.innerHTML =
      '<div class="marquee-track">' +
        '<div class="marquee-set">' + cards + '</div>' +
        '<div class="marquee-set" aria-hidden="true">' + cards + '</div>' +
      '</div>';

    // The copy is only for the visual loop: hide it from keyboard and screen readers
    box.querySelectorAll('.marquee-set[aria-hidden="true"] a, .marquee-set[aria-hidden="true"] button')
      .forEach(function (el) { el.setAttribute('tabindex', '-1'); });

    // Same slow speed on every screen size: about 35 pixels per second
    var track = box.querySelector('.marquee-track');
    var setWidth = track.scrollWidth / 2;
    track.style.setProperty('--marquee-time', Math.round(setWidth / 35) + 's');
  }

  // Recently listed + filter tabs
  var currentFilter = 'all';
  function renderRecent(books) {
    var grid = $('recentGrid');
    if (!grid) return;

    var list = books.slice().sort(function (a, b) { return a.listedDaysAgo - b.listedDaysAgo; });
    if (currentFilter === 'like-new') list = list.filter(function (b) { return b.condition === 'Like new'; });
    if (currentFilter === 'swap')     list = list.filter(function (b) { return b.swap; });

    if (!list.length) {
      grid.innerHTML = '<p class="empty-msg">No books match this filter yet. Try "All", or list one of yours.</p>';
      return;
    }

    grid.innerHTML = list.slice(0, 8).map(function (b) {
      return bookCard(b).replace('<div class="book-info">',
        '<div class="book-info"><p class="book-listed">' + listedText(b.listedDaysAgo) + '</p>');
    }).join('');
  }

  function renderHome(books) {
    renderHero(books);
    renderShelf(books);
    renderSubjects(books);
    renderBestSellers(books);
    renderRecent(books);
  }

  /* ========== HOME PAGE SECTIONS END ========== */


  /* ========== 5. HOME PAGE INTERACTIONS STARTED ========== */

  // Hero search -> search.html?q=...
  function initHeroSearch() {
    var form = $('heroSearchForm');
    var input = $('heroSearchInput');
    if (!form || !input) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      window.location.href = 'search.html?q=' + encodeURIComponent(q);
    });
  }

  // Filter tabs for "Recently listed"
  function initFilterTabs() {
    var tabs = $('filterTabs');
    if (!tabs) return;

    tabs.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      tabs.querySelectorAll('.tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.getAttribute('data-filter');
      renderRecent(BOOKS);
    });
  }

  // Add to cart + wishlist (one listener for all cards)
  // Frontend only for now: updates the cart badge in the navbar.
  // Member 5 (cart.js) will connect this to the real cart later.
  function initCardButtons() {
    document.addEventListener('click', function (e) {
      var addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        var badge = $('cartCount');
        if (badge) {
          badge.textContent = Number(badge.textContent || 0) + 1;
          badge.classList.remove('bump');
          void badge.offsetWidth;            // restart the animation
          badge.classList.add('bump');
        }
        addBtn.classList.add('added');
        showToast('Added to cart');
        return;
      }

      var wishBtn = e.target.closest('[data-wish]');
      if (wishBtn) {
        var saved = wishBtn.getAttribute('aria-pressed') === 'true';
        wishBtn.setAttribute('aria-pressed', saved ? 'false' : 'true');
        showToast(saved ? 'Removed from wishlist' : 'Saved to wishlist');
      }
    });
  }

  // Footer wave: stop its animation if the user has turned off motion
  // in their device settings (footer is loaded later by include.js)
  function initFooterWave() {
    document.addEventListener('components:loaded', function () {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelectorAll('.footer-wave').forEach(function (svg) {
        if (svg.pauseAnimations) svg.pauseAnimations();
      });
    });
  }

  /* ========== HOME PAGE INTERACTIONS END ========== */


  /* ========== 6. CONTACT PAGE STARTED ========== */
  // Checks the contact form and shows a "Message sent" box.
  // NOTE FOR BACKEND: there is no server yet. Later, send the data
  // with fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
  // and call showSent() when the server answers OK.
  function initContactForm() {
    var form = $('contactForm');
    if (!form) return;

    var fields = {
      name:    $('cName'),
      email:   $('cEmail'),
      phone:   $('cPhone'),
      topic:   $('cTopic'),
      message: $('cMessage')
    };
    var counter = $('cMessageCount');
    var sentBox = $('contactSent');

    // Returns an error message, or '' if the field is fine
    function check(key) {
      var value = fields[key].value.trim();
      if (key === 'name') {
        if (!value) return 'Enter your name.';
        if (value.length < 2) return 'Name must be at least 2 letters.';
      }
      if (key === 'email') {
        if (!value) return 'Enter your email so we can reply.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email, like ali@gmail.com.';
      }
      if (key === 'phone') {
        if (!value) return 'Enter your phone number.';
        // Pakistani mobile: 03XXXXXXXXX or +923XXXXXXXXX (spaces and dashes allowed)
        if (!/^(\+92|0)3\d{9}$/.test(value.replace(/[\s-]/g, ''))) return 'Enter a valid number, like 03001234567.';
      }
      if (key === 'topic' && !value) return 'Choose a topic.';
      if (key === 'message') {
        if (!value) return 'Write your message.';
        if (value.length < 20) return 'Add a bit more detail (at least 20 characters).';
      }
      return '';
    }

    function showError(key, msg) {
      var input = fields[key];
      $(input.id + 'Err').textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    // Check a field when the user leaves it, and clear the error while they fix it
    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('blur', function () {
        if (fields[key].value.trim()) showError(key, check(key));
      });
      fields[key].addEventListener('input', function () {
        if (fields[key].getAttribute('aria-invalid') === 'true') showError(key, check(key));
      });
    });

    // Live character count for the message
    fields.message.addEventListener('input', function () {
      counter.textContent = fields.message.value.length + ' / 1000';
    });

    function showSent(name, email) {
      $('sentName').textContent = name.split(' ')[0];
      $('sentEmail').textContent = email;
      form.hidden = true;
      sentBox.hidden = false;
      sentBox.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      Object.keys(fields).forEach(function (key) {
        var msg = check(key);
        showError(key, msg);
        if (msg && !firstBad) firstBad = fields[key];
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.replace(/[\s-]/g, ''),
        topic: fields.topic.value,
        message: fields.message.value.trim()
      };

      // Fake a short wait so the button shows "Sending..." (remove when backend is ready)
      var btn = $('contactSubmit');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = 'Send message';
        showSent(data.name, data.email);
      }, 700);
    });

    $('contactAgain').addEventListener('click', function () {
      form.reset();
      counter.textContent = '0 / 1000';
      Object.keys(fields).forEach(function (key) { showError(key, ''); });
      sentBox.hidden = true;
      form.hidden = false;
      fields.name.focus();
    });
  }
  /* ========== CONTACT PAGE END ========== */


  /* ========== 7. RUN ========== */
  function run() {
    renderHome(BOOKS);
    initHeroSearch();
    initFilterTabs();
    initCardButtons();
    initFooterWave();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();