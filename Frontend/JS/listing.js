/* ==========================================================================
   BOOKSWAP - listing.js  (Member 4 - Aleena)
   Seller pages: Seller Dashboard, Add Listing, My Shop.

   Put it AFTER include.js and auth.js:
     <script src="../js/include.js"></script>
     <script src="../js/auth.js"></script>
     <script src="../js/listing.js"></script>

   Each page sets <body data-page="..."> so only its own code runs:
     seller-dashboard  ->  Seller/seller-dashboard.html
     add-listing       ->  Seller/add-listing.html   (add ?id=... to edit)

   BACKEND: listings are saved in the browser (localStorage) ONLY so the
   frontend can be tested. Every place marked "BACKEND:" must be replaced
   with a real API call by the backend team.
   ========================================================================== */

(function () {
  'use strict';

  var Auth = window.BookSwapAuth;
  if (!Auth) { console.error('[listing.js] auth.js must be loaded before listing.js'); return; }

  var script = document.currentScript || document.querySelector('script[src*="listing.js"]');
  var ROOT = new URL('../', script.src).href;           // .../Frontend/
  var KEY = 'bookswap_listings';

  /* ======================================================================
     1. SHARED DATA  (used by all seller pages)
     ====================================================================== */
  // CS core courses, same order as the home page
  var COURSES = ['Programming Fundamentals', 'Object Oriented Programming', 'Data Structures',
                 'Databases', 'Computer Networks', 'Operating Systems', 'Other'];

  var CONDITIONS = ['Like new', 'Good', 'Fair', 'Heavily used'];

  var STATUS = {
    pending: { label: 'Waiting for review', css: 'is-pending' },   // admin has not approved yet
    live:    { label: 'Live',               css: 'is-live' },
    sold:    { label: 'Sold',               css: 'is-sold' },
    removed: { label: 'Removed',            css: 'is-removed' }
  };

  // Cover colours for books without a photo
  var COVERS = ['#5B34C9', '#3B2470', '#2B3247', '#6C38FF', '#4C1D95', '#334155', '#7C3AED'];

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function writeAll(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage full or blocked */ }
  }

  function mine() {
    var user = Auth.currentUser();
    if (!user) return [];
    return readAll().filter(function (l) { return l.sellerEmail === user.email; })
      .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
  }

  function get(id) {
    return readAll().filter(function (l) { return l.id === id; })[0] || null;
  }

  function save(listing) {                       // BACKEND: POST / PUT /api/listings
    var list = readAll();
    var i = list.findIndex(function (l) { return l.id === listing.id; });
    if (i === -1) list.push(listing); else list[i] = listing;
    writeAll(list);
    return listing;
  }

  function update(id, fields) {
    var l = get(id);
    if (!l) return null;
    Object.keys(fields).forEach(function (k) { l[k] = fields[k]; });
    return save(l);
  }

  function remove(id) {                          // BACKEND: DELETE /api/listings/:id
    writeAll(readAll().filter(function (l) { return l.id !== id; }));
  }

  function price(n) {
    return 'Rs ' + Number(n || 0).toLocaleString('en-PK');
  }

  function coverColor(id) {
    var n = 0;
    String(id).split('').forEach(function (c) { n += c.charCodeAt(0); });
    return COVERS[n % COVERS.length];
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeAgo(iso) {
    var s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return 'just now';
    var m = Math.round(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + ' h ago';
    var d = Math.round(h / 24); if (d < 30) return d + (d === 1 ? ' day ago' : ' days ago');
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // DEMO ONLY: open the dashboard with ?demo=1 to add 4 sample books for testing
  function addDemoListings() {
    var user = Auth.currentUser();
    if (!user || mine().length) return;
    var now = Date.now();
    [
      ['C++ How to Program', 'Deitel & Deitel', 'Programming Fundamentals', 'Good', 'sell', 1200, 'live', 34],
      ['Data Structures Using C++', 'D. S. Malik', 'Data Structures', 'Like new', 'both', 1800, 'live', 51],
      ['Database System Concepts', 'Silberschatz', 'Databases', 'Fair', 'swap', 0, 'pending', 3],
      ['Computer Networking: A Top-Down Approach', 'Kurose & Ross', 'Computer Networks', 'Good', 'sell', 1500, 'sold', 77, 0],
      ['Object-Oriented Programming in C++', 'Robert Lafore', 'Object Oriented Programming', 'Good', 'sell', 900, 'sold', 40, 1],
      ['Discrete Mathematics', 'Kenneth Rosen', 'Other', 'Fair', 'sell', 700, 'sold', 28, 3],
      ['Operating System Concepts', 'Silberschatz', 'Operating Systems', 'Like new', 'sell', 1600, 'sold', 62, 4]
    ].forEach(function (d, i) {
      save({
        id: 'l' + (now + i), sellerEmail: user.email, sellerName: user.name,
        title: d[0], author: d[1], edition: '', course: d[2], condition: d[3], type: d[4],
        price: d[5], swapFor: d[4] === 'sell' ? '' : 'Any Operating Systems book',
        description: '', photo: '', status: d[6], views: d[7],
        createdAt: new Date(now - i * 86400000 * 2).toISOString(),
        soldAt: d[6] === 'sold' ? monthsAgo(d[8] || 0) : ''
      });
    });
    var swapBook = mine().filter(function (l) { return l.type !== 'sell'; })[0];
    if (swapBook) {
      [['Hamza Iqbal', 'Operating System Concepts', 'Good', 'Can meet at the library after 2 pm.'],
       ['Sana Tariq', 'Modern Operating Systems', 'Like new', '']
      ].forEach(function (d, i) {
        saveSwap({ id: 's' + (now + i), sellerEmail: user.email, listingId: swapBook.id, listingTitle: swapBook.title,
          fromName: d[0], offerTitle: d[1], offerCondition: d[2], note: d[3], status: 'pending',
          createdAt: new Date(now - (i + 1) * 3600000 * 5).toISOString() });
      });
    }
  }

  function monthsAgo(n) {
    var d = new Date();
    d.setDate(10);
    d.setMonth(d.getMonth() - n);
    return d.toISOString();
  }

  /* ---------- Swap requests (BACKEND: /api/seller/swaps) ---------- */
  var SWAP_KEY = 'bookswap_swaps';
  function readSwaps() {
    try { return JSON.parse(localStorage.getItem(SWAP_KEY)) || []; } catch (e) { return []; }
  }
  function saveSwap(sw) {
    var list = readSwaps();
    var i = list.findIndex(function (x) { return x.id === sw.id; });
    if (i === -1) list.push(sw); else list[i] = sw;
    try { localStorage.setItem(SWAP_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function mySwaps() {
    var user = Auth.currentUser();
    if (!user) return [];
    return readSwaps().filter(function (x) { return x.sellerEmail === user.email; })
      .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
  }

  window.BookSwapListings = {
    COURSES: COURSES, CONDITIONS: CONDITIONS, STATUS: STATUS,
    all: readAll, mine: mine, get: get, save: save, update: update, remove: remove,
    price: price, coverColor: coverColor, escapeHtml: escapeHtml, timeAgo: timeAgo,
    swaps: mySwaps, saveSwap: saveSwap, FEE: 0.05
  };

  /* ======================================================================
     2. SMALL SHARED UI: confirm box + "sellers only" gate
     ====================================================================== */
  function confirmBox(title, text, okLabel) {
    return new Promise(function (resolve) {
      var box = document.getElementById('sdConfirm');
      if (!box) return resolve(window.confirm(title));
      box.querySelector('[data-confirm-title]').textContent = title;
      box.querySelector('[data-confirm-text]').textContent = text;
      var ok = box.querySelector('[data-confirm-ok]');
      var cancel = box.querySelector('[data-confirm-cancel]');
      ok.textContent = okLabel || 'Yes';
      var last = document.activeElement;
      box.hidden = false;
      ok.focus();
      function done(answer) {
        box.hidden = true;
        ok.removeEventListener('click', yes);
        cancel.removeEventListener('click', no);
        box.removeEventListener('keydown', key);
        if (last && last.focus) last.focus();
        resolve(answer);
      }
      function yes() { done(true); }
      function no() { done(false); }
      function key(e) { if (e.key === 'Escape') done(false); }
      ok.addEventListener('click', yes);
      cancel.addEventListener('click', no);
      box.addEventListener('keydown', key);
    });
  }

  // Shows the right block: guest -> sign in, buyer -> become a seller, seller -> page
  function gate() {
    var user = Auth.currentUser();
    var isSeller = !!user && user.role === 'seller';
    document.getElementById('sdGuest').hidden = !!user;
    document.getElementById('sdBuyer').hidden = !user || isSeller;
    document.getElementById('sdPage').hidden = !isSeller;
    return isSeller ? user : null;
  }

  function wireGate(reason) {
    var sw = document.getElementById('sdSwitch');
    if (sw) sw.addEventListener('click', function () { Auth.becomeSeller(); });
    if (!Auth.currentUser()) {
      Auth.ready.then(function () { Auth.open('login', { reason: reason || 'Sign in to open your seller dashboard.' }); });
    }
  }

  /* ======================================================================
     3. SELLER DASHBOARD  (Seller/seller-dashboard.html)
     ====================================================================== */
  if (document.body.getAttribute('data-page') === 'seller-dashboard') {
    var filter = 'all';
    var $ = function (id) { return document.getElementById(id); };

    function renderDashboard() {
      var user = gate();
      if (!user) return;

      if (/[?&]demo=1/.test(window.location.search)) addDemoListings();

      var list = mine();
      var live = list.filter(function (l) { return l.status === 'live'; });
      var pending = list.filter(function (l) { return l.status === 'pending'; });
      var sold = list.filter(function (l) { return l.status === 'sold'; });
      var earned = sold.reduce(function (sum, l) { return sum + Number(l.price || 0); }, 0);
      var views = list.reduce(function (sum, l) { return sum + Number(l.views || 0); }, 0);

      // Greeting
      $('sdHello').textContent = 'Hey, Reader!';
      $('sdShopLink').href = ROOT + 'Seller/my-shop.html';

      // Payout banner
      $('sdPayoutWarn').hidden = !!user.payout;
      $('sdPayoutLine').textContent = user.payout ? Auth.maskPayout(user.payout) : 'Not added yet';

      // Stat tiles
      $('sdStatLive').textContent = live.length;
      $('sdStatPending').textContent = pending.length;
      $('sdStatSold').textContent = sold.length;
      $('sdStatEarned').textContent = price(earned);
      $('sdStatViews').textContent = views.toLocaleString('en-PK') + ' views in total';

      // Tab counts
      $('sdCountAll').textContent = list.length;
      $('sdCountLive').textContent = live.length;
      $('sdCountPending').textContent = pending.length;
      $('sdCountSold').textContent = sold.length;

      document.querySelectorAll('[data-sd-filter]').forEach(function (t) {
        var on = t.getAttribute('data-sd-filter') === filter;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      renderEarnings(sold);
      renderSwaps();
      renderBadges(user, list, sold);
      renderShare(user);

      var shown = filter === 'all' ? list : list.filter(function (l) { return l.status === filter; });
      var body = $('sdRows');
      body.innerHTML = '';

      $('sdEmpty').hidden = list.length > 0;
      $('sdNone').hidden = !(list.length > 0 && shown.length === 0);
      $('sdTable').hidden = shown.length === 0;

      shown.forEach(function (l) {
        var st = STATUS[l.status] || STATUS.pending;
        var tr = document.createElement('tr');
        var priceText = l.type === 'swap' ? 'Swap only' : price(l.price) + (l.type === 'both' ? ' or swap' : '');
        tr.innerHTML =
          '<td><div class="sd-book">' +
            (l.photo
              ? '<img class="sd-cover" src="' + escapeHtml(l.photo) + '" alt="">'
              : '<span class="sd-cover" style="background:' + coverColor(l.id) + '" aria-hidden="true">' + escapeHtml(l.title.charAt(0)) + '</span>') +
            '<span><strong>' + escapeHtml(l.title) + '</strong><small>' + escapeHtml(l.course) + ' &middot; ' + escapeHtml(l.condition) + '</small></span>' +
          '</div></td>' +
          '<td class="sd-price">' + escapeHtml(priceText) + '</td>' +
          '<td><span class="sd-status ' + st.css + '">' + st.label + '</span></td>' +
          '<td class="sd-muted">' + Number(l.views || 0) + '</td>' +
          '<td class="sd-muted">' + timeAgo(l.createdAt) + '</td>' +
          '<td><div class="sd-actions"></div></td>';

        var actions = tr.querySelector('.sd-actions');
        if (l.status !== 'sold') {
          actions.appendChild(actionButton('Edit', 'edit', l));
        }
        if (l.status === 'live') actions.appendChild(actionButton('Mark sold', 'sold', l));
        actions.appendChild(actionButton('Delete', 'delete', l));
        body.appendChild(tr);
      });
    }

    function actionButton(label, act, l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sd-act' + (act === 'delete' ? ' is-danger' : '');
      b.textContent = label;
      b.setAttribute('aria-label', label + ': ' + l.title);
      b.addEventListener('click', function () { doAction(act, l); });
      return b;
    }

    function doAction(act, l) {
      if (act === 'edit') {
        window.location.href = ROOT + 'Seller/add-listing.html?id=' + encodeURIComponent(l.id);
        return;
      }
      if (act === 'sold') {
        confirmBox('Mark "' + l.title + '" as sold?', 'It will be hidden from buyers and added to your earnings.', 'Mark as sold')
          .then(function (yes) {
            if (!yes) return;
            update(l.id, { status: 'sold', soldAt: new Date().toISOString() });   // BACKEND: PATCH /api/listings/:id
            Auth.toast('Marked as sold');
            renderDashboard();
          });
        return;
      }
      if (act === 'delete') {
        confirmBox('Delete "' + l.title + '"?', 'This removes the listing for good. You cannot undo this.', 'Delete')
          .then(function (yes) {
            if (!yes) return;
            remove(l.id);
            Auth.toast('Listing deleted');
            renderDashboard();
          });
      }
    }


    /* ---------- Earnings chart (last 6 months) ---------- */
    var FEE = 0.05;   // BookSwap commission (SOW: 2-5%)
    function renderEarnings(sold) {
      var months = [];
      var now = new Date();
      for (var i = 5; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('en-GB', { month: 'short' }), total: 0 });
      }
      sold.forEach(function (l) {
        var d = new Date(l.soldAt || l.createdAt);
        months.forEach(function (mo) { if (mo.y === d.getFullYear() && mo.m === d.getMonth()) mo.total += Number(l.price || 0); });
      });
      var gross = months.reduce(function (a, mo) { return a + mo.total; }, 0);
      var fee = Math.round(gross * FEE);
      var max = Math.max.apply(null, months.map(function (mo) { return mo.total; }).concat([1]));

      $('shGross').textContent = price(gross);
      $('shFee').textContent = '− ' + price(fee);
      $('shNet').textContent = price(gross - fee);
      $('shNet2').textContent = price(gross - fee);

      var chart = $('shChart');
      chart.innerHTML = '';
      months.forEach(function (mo, idx) {
        var col = document.createElement('div');
        col.className = 'sh-col' + (idx === months.length - 1 ? ' is-now' : '');
        var h = mo.total ? Math.max(6, Math.round(mo.total / max * 100)) : 0;
        col.innerHTML =
          '<span class="sh-val">' + (mo.total ? price(mo.total).replace('Rs ', '') : '') + '</span>' +
          '<span class="sh-bar" style="height:' + h + '%" title="' + mo.label + ': ' + price(mo.total) + '"></span>' +
          '<span class="sh-mon">' + mo.label + '</span>';
        chart.appendChild(col);
      });
      chart.setAttribute('aria-label', 'Earnings by month: ' + months.map(function (mo) { return mo.label + ' ' + price(mo.total); }).join(', '));
    }

    /* ---------- Swap requests ---------- */
    function renderSwaps() {
      var list = mySwaps();
      var box = $('shSwaps');
      var pending = list.filter(function (x) { return x.status === 'pending'; }).length;
      $('shSwapCount').textContent = pending + ' new';
      $('shSwapCount').classList.toggle('is-hot', pending > 0);
      $('shSwapEmpty').hidden = list.length > 0;
      box.innerHTML = '';
      list.slice(0, 5).forEach(function (x) {
        var li = document.createElement('li');
        li.className = 'sh-swap is-' + x.status;
        li.innerHTML =
          '<span class="al-avatar">' + escapeHtml(x.fromName.charAt(0)) + '</span>' +
          '<div class="sh-swap-body">' +
            '<p><strong>' + escapeHtml(x.fromName) + '</strong> offers <strong>' + escapeHtml(x.offerTitle) + '</strong>' +
            ' <span class="sh-muted">(' + escapeHtml(x.offerCondition) + ')</span></p>' +
            '<p class="sh-muted">for your ' + escapeHtml(x.listingTitle) + ' · ' + timeAgo(x.createdAt) + '</p>' +
            (x.note ? '<p class="sh-note">“' + escapeHtml(x.note) + '”</p>' : '') +
          '</div>' +
          '<div class="sh-swap-act"></div>';
        var act = li.querySelector('.sh-swap-act');
        if (x.status === 'pending') {
          var ok = document.createElement('button');
          ok.type = 'button'; ok.className = 'sd-act sh-accept'; ok.textContent = 'Accept';
          ok.setAttribute('aria-label', 'Accept swap from ' + x.fromName);
          ok.addEventListener('click', function () {
            x.status = 'accepted'; saveSwap(x);              // BACKEND: POST /api/swaps/:id/accept
            Auth.toast('Swap accepted. Message ' + x.fromName.split(' ')[0] + ' to meet up.');
            renderDashboard();
          });
          var no = document.createElement('button');
          no.type = 'button'; no.className = 'sd-act is-danger'; no.textContent = 'Decline';
          no.setAttribute('aria-label', 'Decline swap from ' + x.fromName);
          no.addEventListener('click', function () {
            confirmBox('Decline this swap?', x.fromName + ' will be told politely.', 'Decline').then(function (yes) {
              if (!yes) return;
              x.status = 'declined'; saveSwap(x);            // BACKEND: POST /api/swaps/:id/decline
              renderDashboard();
            });
          });
          act.appendChild(ok); act.appendChild(no);
        } else {
          act.innerHTML = '<span class="sh-pill ' + (x.status === 'accepted' ? 'is-yes' : 'is-no') + '">' +
            (x.status === 'accepted' ? 'Accepted' : 'Declined') + '</span>';
        }
        box.appendChild(li);
      });
    }

    /* ---------- Badges ---------- */
    var BADGE_ICONS = {
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>',
      tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
      stack: '<path d="M12 2 2 7l10 5 10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
      star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
      swap: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
      wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13h.01M2 10h20"/>'
    };
    function renderBadges(user, list, sold) {
      var swapsDone = mySwaps().filter(function (x) { return x.status === 'accepted'; }).length;
      var badges = [
        ['book', 'First Listing', 'List your first book', list.length, 1],
        ['tag', 'First Sale', 'Sell one book', sold.length, 1],
        ['stack', 'Full Shelf', 'List 5 books', list.length, 5],
        ['star', 'Top Seller', 'Sell 5 books', sold.length, 5],
        ['swap', 'Swapper', 'Accept a swap', swapsDone, 1],
        ['wallet', 'Payday Ready', 'Add a payout account', user.payout ? 1 : 0, 1]
      ];
      var got = 0;
      var ul = $('shBadges');
      ul.innerHTML = '';
      badges.forEach(function (b) {
        var done = b[3] >= b[4];
        if (done) got++;
        var li = document.createElement('li');
        li.className = 'sh-badge' + (done ? ' is-on' : '');
        li.innerHTML =
          '<span class="sh-badge-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + BADGE_ICONS[b[0]] + '</svg></span>' +
          '<span class="sh-badge-text"><strong>' + b[1] + '</strong><small>' +
          (done ? 'Unlocked' : b[2] + (b[4] > 1 ? ' · ' + Math.min(b[3], b[4]) + '/' + b[4] : '')) + '</small></span>';
        ul.appendChild(li);
      });
      $('shBadgeCount').textContent = got + ' / ' + badges.length;
    }

    /* ---------- Share my shop ---------- */
    function renderShare(user) {
      var link = ROOT + 'Seller/my-shop.html?seller=' + encodeURIComponent(user.id);
      $('shLink').value = link;
      $('shWa').href = 'https://wa.me/?text=' + encodeURIComponent('Selling my old course books on BookSwap. Have a look: ' + link);
    }
    $('shCopy').addEventListener('click', function () {
      var link = $('shLink').value;
      var done = function () { Auth.toast('Shop link copied'); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, function () { $('shLink').select(); });
      else { $('shLink').select(); document.execCommand('copy'); done(); }
    });
    $('shLink').addEventListener('focus', function () { this.select(); });

    document.querySelectorAll('[data-sd-filter]').forEach(function (t) {
      t.addEventListener('click', function () {
        filter = t.getAttribute('data-sd-filter');
        renderDashboard();
      });
    });

    $('sdPayoutBtn').addEventListener('click', function () { Auth.editPayout(); });
    document.querySelector('[data-auth-payout]').addEventListener('click', function () { Auth.editPayout(); });

    wireGate();
    document.addEventListener('auth:changed', renderDashboard);
    renderDashboard();
  }
  /* ======================================================================
     4. ADD / EDIT LISTING  (Seller/add-listing.html)
     ====================================================================== */
  if (document.body.getAttribute('data-page') === 'add-listing') {
    var el = function (id) { return document.getElementById(id); };
    var form = el('alForm');
    var editId = new URLSearchParams(window.location.search).get('id');
    var photo = '';             // resized cover photo (data URL)
    var draftTimer = null;
    var started = false;

    var CONDITION_INFO = {
      'Like new':     ['Basically untouched.', 1200, 2000],
      'Good':         ['Light wear, every page there.', 800, 1500],
      'Fair':         ['Well loved, fully usable.', 500, 1000],
      'Heavily used': ['Rough, but it works.', 300, 600]
    };

    // Build the course list and the condition cards
    COURSES.forEach(function (c) {
      var o = document.createElement('option');
      o.textContent = c; o.value = c;
      form.course.appendChild(o);
    });
    var condBox = form.querySelector('.al-choices-4');
    var condErr = el('alCondition-err');
    CONDITIONS.forEach(function (c) {
      var lab = document.createElement('label');
      lab.className = 'al-choice';
      lab.innerHTML = '<input type="radio" name="condition" value="' + c + '">' +
        '<span class="al-choice-card"><strong>' + c + '</strong><small>' + CONDITION_INFO[c][0] + '</small></span>';
      condBox.insertBefore(lab, condErr);
    });

    function draftKey() {
      var u = Auth.currentUser();
      return u ? 'bookswap_listing_draft_' + u.email : null;
    }

    function radio(name) {
      var r = form.querySelector('input[name="' + name + '"]:checked');
      return r ? r.value : '';
    }

    function setRadio(name, value) {
      var r = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
      if (r) r.checked = true;
    }

    function values() {
      return {
        title: form.title.value.trim().replace(/\s+/g, ' '),
        author: form.author.value.trim().replace(/\s+/g, ' '),
        edition: form.edition.value.trim(),
        course: form.course.value,
        condition: radio('condition'),
        type: radio('type'),
        price: form.price.value.replace(/[^\d]/g, ''),
        swapFor: form.swapFor.value.trim(),
        description: form.description.value.trim(),
        photo: photo
      };
    }

    function fill(v) {
      form.title.value = v.title || '';
      form.author.value = v.author || '';
      form.edition.value = v.edition || '';
      form.course.value = v.course || '';
      if (v.condition) setRadio('condition', v.condition);
      if (v.type) setRadio('type', v.type);
      form.price.value = v.price ? String(v.price) : '';
      form.swapFor.value = v.swapFor || '';
      form.description.value = v.description || '';
      setPhoto(v.photo || '');
    }

    /* ---------- Live preview + listing strength ---------- */
    function refresh() {
      var v = values();
      var user = Auth.currentUser();

      // show / hide price + swap fields
      var showPrice = v.type === 'sell' || v.type === 'both';
      var showSwap = v.type === 'swap' || v.type === 'both';
      form.querySelector('[data-for-type="price"]').hidden = !showPrice;
      form.querySelector('[data-for-type="swap"]').hidden = !showSwap;

      // price suggestion
      var hint = el('alPriceHint');
      if (v.condition) {
        var r = CONDITION_INFO[v.condition];
        hint.innerHTML = 'Sweet spot for <strong>' + v.condition.toLowerCase() + '</strong> copies: ' +
          price(r[1]) + ' – ' + price(r[2]);
      } else {
        hint.textContent = 'Pick a condition and we\'ll suggest a price.';
      }

      // preview card
      var title = v.title || 'Your book title';
      el('pvTitle').textContent = title;
      el('pvCoverTitle').textContent = title;
      el('pvCoverAuthor').textContent = v.author || 'Author';
      el('pvCourseTag').textContent = v.course || 'BookSwap';
      el('pvMeta').textContent = [v.author || 'Author', v.edition ? v.edition + ' edition' : '']
        .filter(Boolean).join(' · ');
      el('pvCourseChip').textContent = v.course || 'Course';
      el('alCoverArt').style.setProperty('--al-cover', coverColor(v.title || 'x'));

      var priceText = 'Rs —';
      if (v.type === 'swap') priceText = 'Swap';
      else if (v.price) priceText = price(v.price);
      el('pvPrice').textContent = priceText;

      el('pvType').hidden = !v.type || v.type === 'sell';
      el('pvType').textContent = v.type === 'swap' ? 'Swap only' : 'Sell or swap';
      el('pvCond').hidden = !v.condition;
      el('pvCond').textContent = v.condition;
      el('pvSwap').hidden = !(showSwap && v.swapFor);
      el('pvSwap').textContent = 'Wants: ' + v.swapFor;
      el('pvSeller').textContent = user ? user.name.trim().split(/\s+/)[0] : 'You';
      el('pvAvatar').textContent = user ? user.name.trim().charAt(0).toUpperCase() : 'Y';

      el('alDescCount').textContent = form.description.value.length;

      // strength
      var steps = [
        [!!v.title, 'Title first. The rest is easy.'],
        [!!v.course, 'Tag the course so juniors can find it.'],
        [!!v.condition, 'Pick a condition. Buyers check it first.'],
        [!!v.type && (!showPrice || !!v.price) && (!showSwap || !!v.swapFor), 'Set a price or name your swap.'],
        [!!v.author, 'Add the author. Search loves it.'],
        [!!v.photo, 'Add a cover pic. Photos get the clicks.'],
        [!!v.description, 'One honest line builds trust.']
      ];
      var done = steps.filter(function (s) { return s[0]; }).length;
      var pct = Math.round(done / steps.length * 100);
      var next = steps.filter(function (s) { return !s[0]; })[0];
      var label = pct === 100 ? 'Good to go' : pct >= 70 ? 'So close' : pct >= 35 ? 'Coming together' : 'Just started';
      el('alStrengthLabel').textContent = label;
      el('alStrengthPct').textContent = pct + '%';
      el('alBar').style.width = pct + '%';
      el('alBar').parentNode.classList.toggle('is-full', pct === 100);
      el('alStrengthTip').textContent = next ? next[1] : 'Looks great. Buyers will love this one.';
    }

    /* ---------- Photo: drag & drop, resize, preview ---------- */
    function setPhoto(src) {
      photo = src || '';
      el('alDropEmpty').hidden = !!photo;
      el('alDropFull').hidden = !photo;
      el('alPhotoImg').src = photo || '';
      el('alCoverImg').hidden = !photo;
      el('alCoverImg').src = photo || '';
      el('alCoverArt').hidden = !!photo;
      el('alDrop').classList.toggle('has-photo', !!photo);
      refresh();
    }

    function readPhoto(file) {
      var err = el('alPhoto-err');
      err.textContent = '';
      if (!file) return;
      if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { err.textContent = 'JPG or PNG only.'; return; }
      if (file.size > 5 * 1024 * 1024) { err.textContent = 'Too big. Keep it under 5 MB.'; return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          // shrink to max 600px so it fits in the browser's storage
          var scale = Math.min(1, 600 / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          setPhoto(c.toDataURL('image/jpeg', 0.8));     // BACKEND: upload the file, store its URL instead
          saveDraft();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    var drop = el('alDrop');
    el('alPhoto').addEventListener('change', function () { readPhoto(this.files[0]); this.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) { readPhoto(e.dataTransfer.files[0]); });
    drop.addEventListener('click', function (e) {
      if (!photo && !e.target.closest('label, button')) el('alPhoto').click();
    });
    el('alPhotoRemove').addEventListener('click', function () { setPhoto(''); saveDraft(); });

    /* ---------- Draft (new listings only) ---------- */
    function saveDraft() {
      if (editId || !draftKey()) return;
      clearTimeout(draftTimer);
      draftTimer = setTimeout(function () {
        try {
          localStorage.setItem(draftKey(), JSON.stringify(values()));
          el('alDraft').hidden = false;
          el('alDraft').querySelector('span').textContent = 'Saved · ' +
            new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { /* storage full: photo too big, skip the draft */ }
      }, 600);
    }

    function clearDraft() {
      try { if (draftKey()) localStorage.removeItem(draftKey()); } catch (e) { /* ignore */ }
      el('alDraft').hidden = true;
    }

    /* ---------- Validation + submit ---------- */
    function fieldError(id, msg) {
      var box = el(id + '-err');
      if (!box) return;
      box.textContent = msg || '';
      var f = box.closest('.auth-field');
      if (f) f.classList.toggle('has-error', !!msg);
    }

    function validate(v) {
      ['alTitle', 'alAuthor', 'alCourse', 'alCondition', 'alType', 'alPrice', 'alSwap'].forEach(function (id) { fieldError(id, ''); });
      var ok = true;
      function bad(id, msg) { fieldError(id, msg); ok = false; }

      if (v.title.length < 2) bad('alTitle', 'Add the title.');
      if (!v.author) bad('alAuthor', 'Who wrote it?');
      if (!v.course) bad('alCourse', 'Pick a course.');
      if (!v.condition) bad('alCondition', 'Pick a condition.');
      if (!v.type) bad('alType', 'Sell, swap or either?');
      if ((v.type === 'sell' || v.type === 'both')) {
        var n = Number(v.price);
        if (!v.price) bad('alPrice', 'Set a price.');
        else if (n < 50) bad('alPrice', 'Minimum is Rs 50.');
        else if (n > 50000) bad('alPrice', 'That\'s a lot for a used book.');
      }
      if ((v.type === 'swap' || v.type === 'both') && v.swapFor.length < 3) bad('alSwap', 'Name what you\'d swap for.');
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = values();
      if (!validate(v)) {
        var first = form.querySelector('.has-error input, .has-error select');
        if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        return;
      }
      var user = Auth.currentUser();
      var btn = el('alSubmit');
      btn.disabled = true;
      btn.classList.add('is-loading');

      // BACKEND: POST /api/listings (new)  or  PUT /api/listings/:id (edit)
      setTimeout(function () {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        var existing = editId ? get(editId) : null;
        var listing = existing || {
          id: 'l' + Date.now(),
          sellerEmail: user.email,
          sellerName: user.name,
          status: 'pending',
          views: 0,
          createdAt: new Date().toISOString(),
          soldAt: ''
        };
        ['title', 'author', 'edition', 'course', 'condition', 'type', 'swapFor', 'description', 'photo'].forEach(function (k) {
          listing[k] = v[k];
        });
        listing.price = v.type === 'swap' ? 0 : Number(v.price);
        if (v.type === 'sell') listing.swapFor = '';

        try {
          save(listing);
        } catch (err) {
          Auth.toast('Couldn\'t save. Try a smaller pic.');
          return;
        }
        clearDraft();
        el('alCopy').setAttribute('data-id', listing.id);
        showDone(!!existing);
      }, 600);
    });

    function showDone(wasEdit) {
      el('alFormWrap').hidden = true;
      el('alDone').hidden = false;
      el('alDoneTitle').textContent = wasEdit ? 'Saved' : 'In review';
      el('alDoneText').innerHTML = wasEdit
        ? 'Your listing is updated. Buyers see it right away.'
        : "Quick check from us, then it's live. Find it under <strong>Waiting</strong>.";
      el('alHeading').textContent = wasEdit ? 'All Set' : 'Nice One';
      el('alSub').textContent = wasEdit ? 'Edits are live.' : 'One less book gathering dust.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    el('alAnother').addEventListener('click', function () {
      window.location.href = window.location.pathname;
    });

    el('alCopy').addEventListener('click', function () {
      // BACKEND/Laiba: book-details.html shows one listing
      var link = ROOT + 'book-details.html?id=' + encodeURIComponent(this.getAttribute('data-id') || '');
      var done = function () { Auth.toast('Link copied'); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, function () { window.prompt('Copy this link', link); });
      else window.prompt('Copy this link', link);
    });

    el('alReset').addEventListener('click', function () {
      confirmBox('Clear everything?', 'Your draft goes too.', 'Clear').then(function (yes) {
        if (!yes) return;
        form.reset();
        setPhoto('');
        clearDraft();
        ['alTitle', 'alAuthor', 'alCourse', 'alCondition', 'alType', 'alPrice', 'alSwap'].forEach(function (id) { fieldError(id, ''); });
        refresh();
      });
    });

    form.addEventListener('input', function (e) {
      if (e.target.name === 'price') e.target.value = e.target.value.replace(/[^\d]/g, '');
      var f = e.target.closest('.auth-field');
      if (f && f.classList.contains('has-error')) { f.classList.remove('has-error'); var b = f.querySelector('.auth-error'); if (b) b.textContent = ''; }
      refresh();
      saveDraft();
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'radio' || e.target.tagName === 'SELECT') {
        var f = e.target.closest('.auth-field');
        if (f) { f.classList.remove('has-error'); var b = f.querySelector('.auth-error'); if (b) b.textContent = ''; }
      }
      refresh();
      saveDraft();
    });

    /* ---------- Start ---------- */
    function start() {
      var user = gate();
      if (!user || started) return;
      started = true;

      if (editId) {
        var l = get(editId);
        if (!l || l.sellerEmail !== user.email) {
          Auth.toast('Listing not found');
          editId = null;
        } else {
          el('alHeading').textContent = 'Fresh Edits';
          el('alSub').textContent = 'Change what changed. It updates instantly.';
          el('alSubmit').textContent = 'Save changes';
          fill(l);
        }
      } else {
        try {
          var d = JSON.parse(localStorage.getItem(draftKey()));
          if (d) {
            fill(d);
            el('alDraft').hidden = false;
            el('alDraft').querySelector('span').textContent = 'Picked up where you left off';
          }
        } catch (e) { /* no draft */ }
      }
      refresh();
    }

    wireGate('Sign in to start selling.');
    document.addEventListener('auth:changed', function () { gate(); start(); });
    start();
  }
})();
