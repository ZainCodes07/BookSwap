/* ==========================================================================
   BOOKSWAP - listing.js  (Member 4 - Aleena)
   Seller pages: Seller Dashboard, Add Listing, My Shop.

   Put it AFTER include.js and auth.js:
     <script src="../js/include.js"></script>
     <script src="../js/auth.js"></script>
     <script src="../js/listing.js"></script>

   Each page sets <body data-page="..."> so only its own code runs:
     seller-dashboard  ->  Seller/seller-dashboard.html

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
  var COVERS = ['#6C38FF', '#DB2777', '#0EA5E9', '#16A34A', '#F59E0B', '#7C3AED', '#0F766E'];

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
      ['Computer Networking: A Top-Down Approach', 'Kurose & Ross', 'Computer Networks', 'Good', 'sell', 1500, 'sold', 77]
    ].forEach(function (d, i) {
      save({
        id: 'l' + (now + i), sellerEmail: user.email, sellerName: user.name,
        title: d[0], author: d[1], edition: '', course: d[2], condition: d[3], type: d[4],
        price: d[5], swapFor: d[4] === 'sell' ? '' : 'Any Operating Systems book',
        description: '', photo: '', status: d[6], views: d[7],
        createdAt: new Date(now - i * 86400000 * 2).toISOString(),
        soldAt: d[6] === 'sold' ? new Date(now - 86400000).toISOString() : ''
      });
    });
  }

  window.BookSwapListings = {
    COURSES: COURSES, CONDITIONS: CONDITIONS, STATUS: STATUS,
    all: readAll, mine: mine, get: get, save: save, update: update, remove: remove,
    price: price, coverColor: coverColor, escapeHtml: escapeHtml, timeAgo: timeAgo
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

  function wireGate() {
    var sw = document.getElementById('sdSwitch');
    if (sw) sw.addEventListener('click', function () { Auth.becomeSeller(); });
    if (!Auth.currentUser()) {
      Auth.ready.then(function () { Auth.open('login', { reason: 'Sign in to open your seller dashboard.' }); });
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
})();
