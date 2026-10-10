/* ==========================================================================
   BOOKSWAP - admin.js
   Owner: Member 3 (Ghauri)
   Used by: admin/admin-dashboard.html, admin/manage-users.html,
            admin/manage-listings.html, admin/pending-payouts.html

   Each page has <body data-page="...">, and only that page's code runs.

   NOTE FOR BACKEND: USERS, LISTINGS and PAYOUTS below are dummy data.
   Replace them with API calls (e.g. GET /api/admin/users) and send the
   button actions to the server (e.g. POST /api/admin/users/:id/block).
   Every place that needs a server call is marked with "BACKEND:".
   ========================================================================== */

(function () {
  'use strict';

  /* ========== 1. DUMMY DATA STARTED ========== */

  var COURSES = {
    programming: 'Programming Fundamentals',
    oop: 'Object Oriented Programming',
    dsa: 'Data Structures',
    databases: 'Databases',
    networking: 'Computer Networks',
    os: 'Operating Systems'
  };

  var USERS = [
    { id: 1,  name: 'Hamza Ahmed',   email: 'hamza.ahmed@gmail.com',  semester: 6, listings: 3, joined: '2026-08-02', blocked: false },
    { id: 2,  name: 'Ayesha Malik',  email: 'ayesha.m@gmail.com',     semester: 7, listings: 2, joined: '2026-08-05', blocked: false },
    { id: 3,  name: 'Bilal Khan',    email: 'bilalkhan21@yahoo.com',  semester: 5, listings: 4, joined: '2026-08-11', blocked: false },
    { id: 4,  name: 'Usman Tariq',   email: 'usman.tariq@gmail.com',  semester: 8, listings: 1, joined: '2026-08-14', blocked: true  },
    { id: 5,  name: 'Fatima Noor',   email: 'fatima.noor@gmail.com',  semester: 4, listings: 2, joined: '2026-08-20', blocked: false },
    { id: 6,  name: 'Ali Raza',      email: 'ali.raza99@gmail.com',   semester: 3, listings: 1, joined: '2026-09-01', blocked: false },
    { id: 7,  name: 'Zara Sheikh',   email: 'zara.sheikh@outlook.com',semester: 7, listings: 0, joined: '2026-09-08', blocked: false },
    { id: 8,  name: 'Saad Iqbal',    email: 'saad.iqbal@gmail.com',   semester: 2, listings: 2, joined: '2026-09-15', blocked: false },
    { id: 9,  name: 'Hira Javed',    email: 'hira.javed@gmail.com',   semester: 5, listings: 1, joined: '2026-09-22', blocked: false },
    { id: 10, name: 'Taha Siddiqui', email: 'taha.s@gmail.com',       semester: 4, listings: 0, joined: '2026-10-01', blocked: true  }
  ];

  // status: 'pending' (waiting for admin), 'live' (visible on site), 'removed'
  var LISTINGS = [
    { id: 101, title: 'Introduction to Algorithms',        course: 'dsa',         seller: 'Hamza Ahmed',  condition: 'Good',     price: 2200, listed: '2026-10-03', status: 'pending' },
    { id: 102, title: 'Computer Networking: A Top-Down Approach', course: 'networking', seller: 'Ayesha Malik', condition: 'Like new', price: 1800, listed: '2026-10-03', status: 'pending' },
    { id: 103, title: 'Database System Concepts',          course: 'databases',   seller: 'Bilal Khan',   condition: 'Good',     price: 1600, listed: '2026-10-02', status: 'pending' },
    { id: 104, title: 'Head First Java',                   course: 'oop',         seller: 'Saad Iqbal',   condition: 'Like new', price: 1100, listed: '2026-10-02', status: 'pending' },
    { id: 105, title: 'C++ How to Program',                course: 'programming', seller: 'Ali Raza',     condition: 'Fair',     price: 1200, listed: '2026-10-01', status: 'pending' },
    { id: 106, title: 'Operating System Concepts',         course: 'os',          seller: 'Usman Tariq',  condition: 'Fair',     price: 1700, listed: '2026-09-28', status: 'live' },
    { id: 107, title: 'Data Structures and Algorithms in Java', course: 'dsa',    seller: 'Fatima Noor',  condition: 'Like new', price: 1400, listed: '2026-09-25', status: 'live' },
    { id: 108, title: 'Fundamentals of Database Systems',  course: 'databases',   seller: 'Hira Javed',   condition: 'Good',     price: 1500, listed: '2026-09-22', status: 'live' },
    { id: 109, title: 'Object-Oriented Programming in C++',course: 'oop',         seller: 'Saad Iqbal',   condition: 'Good',     price: 1300, listed: '2026-09-20', status: 'live' },
    { id: 110, title: 'Computer Networks',                 course: 'networking',  seller: 'Bilal Khan',   condition: 'Like new', price: 1900, listed: '2026-09-18', status: 'live' },
    { id: 111, title: 'Photocopy of OS lecture notes',     course: 'os',          seller: 'Taha Siddiqui',condition: 'Fair',     price: 300,  listed: '2026-09-15', status: 'removed' }
  ];

  var PAYOUTS = [
    { id: 'BS-1042', seller: 'Bilal Khan',   book: 'Database System Concepts',   method: 'JazzCash',  account: '03001234567', amount: 1600, confirmed: '2026-10-03', paid: false },
    { id: 'BS-1039', seller: 'Fatima Noor',  book: 'Data Structures and Algorithms in Java', method: 'Easypaisa', account: '03451234567', amount: 1400, confirmed: '2026-10-02', paid: false },
    { id: 'BS-1035', seller: 'Hamza Ahmed',  book: 'Introduction to Algorithms', method: 'JazzCash',  account: '03211234567', amount: 2200, confirmed: '2026-10-01', paid: false },
    { id: 'BS-1031', seller: 'Saad Iqbal',   book: 'Object-Oriented Programming in C++', method: 'Easypaisa', account: '03331234567', amount: 1300, confirmed: '2026-09-30', paid: false },
    { id: 'BS-1027', seller: 'Hira Javed',   book: 'Fundamentals of Database Systems', method: 'JazzCash', account: '03121234567', amount: 1500, confirmed: '2026-09-29', paid: false }
  ];

  /* ========== DUMMY DATA END ========== */


  /* ========== 2. HELPERS STARTED ========== */

  function $(id) { return document.getElementById(id); }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rupees(n) { return 'Rs ' + n.toLocaleString('en-PK'); }

  // '2026-10-03' -> '3 Oct 2026'
  function niceDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // 03001234567 -> 0300 ***4567 (do not show full numbers on screen)
  function maskPhone(n) { return n.slice(0, 4) + ' ***' + n.slice(-4); }

  var toastTimer;
  function toast(message) {
    var el = $('admToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  // Small "Are you sure?" box. onYes runs only if the admin clicks the main button.
  function confirmBox(title, text, yesLabel, danger, onYes) {
    var old = document.querySelector('.adm-dialog');
    if (old) old.remove();

    var back = document.createElement('div');
    back.className = 'adm-dialog';
    back.innerHTML =
      '<div class="adm-dialog-box" role="dialog" aria-modal="true" aria-labelledby="admDlgTitle">' +
        '<h2 id="admDlgTitle">' + esc(title) + '</h2>' +
        '<p>' + esc(text) + '</p>' +
        '<div class="adm-dialog-actions">' +
          '<button type="button" class="adm-btn adm-btn-ghost" data-dlg="no">Cancel</button>' +
          '<button type="button" class="adm-btn ' + (danger ? 'adm-btn-danger' : 'adm-btn-primary') + '" data-dlg="yes">' + esc(yesLabel) + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(back);

    var lastFocus = document.activeElement;
    var yesBtn = back.querySelector('[data-dlg="yes"]');
    yesBtn.focus();

    function close() {
      back.remove();
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    back.addEventListener('click', function (e) {
      var which = e.target.getAttribute('data-dlg');
      if (e.target === back || which === 'no') close();
      if (which === 'yes') { close(); onYes(); }
    });
  }

  // Filter tabs (shared by users + listings pages)
  function initTabs(groupId, onChange) {
    var group = $(groupId);
    if (!group) return;
    group.addEventListener('click', function (e) {
      var tab = e.target.closest('.adm-tab');
      if (!tab) return;
      group.querySelectorAll('.adm-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      onChange(tab.getAttribute('data-filter'));
    });
  }

  function emptyRow(cols, text) {
    return '<tr><td colspan="' + cols + '" class="adm-empty">' + esc(text) + '</td></tr>';
  }

  /* ========== HELPERS END ========== */


  /* ========== 3. DASHBOARD PAGE STARTED ========== */

  function initDashboard() {
    var pending = LISTINGS.filter(function (l) { return l.status === 'pending'; });
    var live = LISTINGS.filter(function (l) { return l.status === 'live'; });
    var toPay = PAYOUTS.filter(function (p) { return !p.paid; });
    var owed = toPay.reduce(function (sum, p) { return sum + p.amount; }, 0);

    $('admStats').innerHTML = [
      { label: 'Students signed up', value: USERS.length, href: 'manage-users.html' },
      { label: 'Books live on the site', value: live.length, href: 'manage-listings.html' },
      { label: 'Listings to review', value: pending.length, href: 'manage-listings.html', alert: pending.length > 0 },
      { label: 'Owed to sellers', value: rupees(owed), href: 'pending-payouts.html', alert: owed > 0 }
    ].map(function (s) {
      return '<a class="adm-stat' + (s.alert ? ' is-alert' : '') + '" href="' + s.href + '">' +
          '<span class="adm-stat-value">' + esc(s.value) + '</span>' +
          '<span class="adm-stat-label">' + esc(s.label) + '</span>' +
        '</a>';
    }).join('');

    renderDashListings();

    $('dashPayouts').innerHTML = toPay.length ? toPay.slice(0, 5).map(function (p) {
      return '<tr>' +
          '<td>' + esc(p.seller) + '</td>' +
          '<td><span class="adm-pill pill-' + p.method.toLowerCase() + '">' + esc(p.method) + '</span></td>' +
          '<td class="num strong">' + rupees(p.amount) + '</td>' +
        '</tr>';
    }).join('') : emptyRow(3, 'All sellers are paid.');
  }

  function renderDashListings() {
    var pending = LISTINGS.filter(function (l) { return l.status === 'pending'; });
    $('dashListings').innerHTML = pending.length ? pending.slice(0, 5).map(function (l) {
      return '<tr>' +
          '<td class="strong">' + esc(l.title) + '</td>' +
          '<td>' + esc(l.seller) + '</td>' +
          '<td class="num">' + rupees(l.price) + '</td>' +
          '<td class="adm-actions">' +
            '<button type="button" class="adm-btn adm-btn-sm adm-btn-primary" data-approve="' + l.id + '">Approve</button>' +
          '</td>' +
        '</tr>';
    }).join('') : emptyRow(4, 'No listings waiting. You are all caught up.');

    $('dashListings').onclick = function (e) {
      var btn = e.target.closest('[data-approve]');
      if (!btn) return;
      var item = findListing(btn.getAttribute('data-approve'));
      item.status = 'live';            // BACKEND: POST /api/admin/listings/:id/approve
      toast('"' + item.title + '" is now live.');
      initDashboard();
    };
  }

  /* ========== DASHBOARD PAGE END ========== */


  /* ========== 4. MANAGE USERS PAGE STARTED ========== */

  function initUsers() {
    var filter = 'all';
    var search = $('userSearch');

    function render() {
      var q = search.value.trim().toLowerCase();
      var list = USERS.filter(function (u) {
        if (filter === 'active' && u.blocked) return false;
        if (filter === 'blocked' && !u.blocked) return false;
        return !q || u.name.toLowerCase().indexOf(q) > -1 || u.email.toLowerCase().indexOf(q) > -1;
      });

      $('userRows').innerHTML = list.length ? list.map(function (u) {
        return '<tr>' +
            '<td class="strong">' + esc(u.name) + '</td>' +
            '<td>' + esc(u.email) + '</td>' +
            '<td>' + u.semester + '</td>' +
            '<td>' + u.listings + '</td>' +
            '<td class="nowrap">' + niceDate(u.joined) + '</td>' +
            '<td>' + (u.blocked ? '<span class="adm-pill pill-red">Blocked</span>' : '<span class="adm-pill pill-green">Active</span>') + '</td>' +
            '<td class="adm-actions">' +
              (u.blocked
                ? '<button type="button" class="adm-btn adm-btn-sm adm-btn-ghost" data-unblock="' + u.id + '">Unblock</button>'
                : '<button type="button" class="adm-btn adm-btn-sm adm-btn-danger-ghost" data-block="' + u.id + '">Block</button>') +
            '</td>' +
          '</tr>';
      }).join('') : emptyRow(7, 'No users match your search.');
    }

    search.addEventListener('input', render);
    initTabs('userTabs', function (f) { filter = f; render(); });

    $('userRows').addEventListener('click', function (e) {
      var blockBtn = e.target.closest('[data-block]');
      var unblockBtn = e.target.closest('[data-unblock]');

      if (blockBtn) {
        var u = findUser(blockBtn.getAttribute('data-block'));
        confirmBox('Block ' + u.name + '?', 'They will not be able to log in, buy or list books until you unblock them.', 'Block user', true, function () {
          u.blocked = true;            // BACKEND: POST /api/admin/users/:id/block
          toast(u.name + ' is blocked.');
          render();
        });
      }

      if (unblockBtn) {
        var v = findUser(unblockBtn.getAttribute('data-unblock'));
        v.blocked = false;             // BACKEND: POST /api/admin/users/:id/unblock
        toast(v.name + ' can use BookSwap again.');
        render();
      }
    });

    render();
  }

  function findUser(id) {
    return USERS.filter(function (u) { return String(u.id) === String(id); })[0];
  }

  /* ========== MANAGE USERS PAGE END ========== */


  /* ========== 5. MANAGE LISTINGS PAGE STARTED ========== */

  function initListings() {
    var filter = 'pending';
    var search = $('listingSearch');

    function render() {
      var q = search.value.trim().toLowerCase();
      var list = LISTINGS.filter(function (l) {
        if (l.status !== filter) return false;
        return !q || l.title.toLowerCase().indexOf(q) > -1 || l.seller.toLowerCase().indexOf(q) > -1;
      });

      var emptyText = {
        pending: 'No listings waiting for review.',
        live: 'No live listings match your search.',
        removed: 'No removed listings.'
      }[filter];

      $('listingRows').innerHTML = list.length ? list.map(function (l) {
        var actions = '';
        if (l.status === 'pending') {
          actions = '<button type="button" class="adm-btn adm-btn-sm adm-btn-primary" data-act="approve" data-id="' + l.id + '">Approve</button>' +
                    '<button type="button" class="adm-btn adm-btn-sm adm-btn-danger-ghost" data-act="reject" data-id="' + l.id + '">Reject</button>';
        } else if (l.status === 'live') {
          actions = '<button type="button" class="adm-btn adm-btn-sm adm-btn-danger-ghost" data-act="remove" data-id="' + l.id + '">Remove</button>';
        } else {
          actions = '<button type="button" class="adm-btn adm-btn-sm adm-btn-ghost" data-act="restore" data-id="' + l.id + '">Put back live</button>';
        }
        return '<tr>' +
            '<td class="strong">' + esc(l.title) + '</td>' +
            '<td>' + esc(COURSES[l.course]) + '</td>' +
            '<td>' + esc(l.seller) + '</td>' +
            '<td>' + esc(l.condition) + '</td>' +
            '<td class="num">' + rupees(l.price) + '</td>' +
            '<td class="nowrap">' + niceDate(l.listed) + '</td>' +
            '<td class="adm-actions">' + actions + '</td>' +
          '</tr>';
      }).join('') : emptyRow(7, emptyText);

      updateTabCounts();
    }

    // Show how many listings are in each tab, e.g. "Waiting for review (5)"
    function updateTabCounts() {
      $('listingTabs').querySelectorAll('.adm-tab').forEach(function (t) {
        var f = t.getAttribute('data-filter');
        var n = LISTINGS.filter(function (l) { return l.status === f; }).length;
        if (!t.dataset.label) t.dataset.label = t.textContent;
        t.textContent = t.dataset.label + ' (' + n + ')';
      });
    }

    search.addEventListener('input', render);
    initTabs('listingTabs', function (f) { filter = f; render(); });

    $('listingRows').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var item = findListing(btn.getAttribute('data-id'));
      var act = btn.getAttribute('data-act');

      if (act === 'approve') {
        item.status = 'live';          // BACKEND: POST /api/admin/listings/:id/approve
        toast('"' + item.title + '" is now live.');
        render();
      }
      if (act === 'restore') {
        item.status = 'live';          // BACKEND: POST /api/admin/listings/:id/restore
        toast('"' + item.title + '" is live again.');
        render();
      }
      if (act === 'reject' || act === 'remove') {
        var rejecting = act === 'reject';
        confirmBox(
          (rejecting ? 'Reject' : 'Remove') + ' this listing?',
          '"' + item.title + '" by ' + item.seller + ' will be hidden from the site. You can put it back later from the Removed tab.',
          rejecting ? 'Reject listing' : 'Remove listing',
          true,
          function () {
            item.status = 'removed';   // BACKEND: POST /api/admin/listings/:id/remove
            toast('"' + item.title + '" was ' + (rejecting ? 'rejected.' : 'removed.'));
            render();
          }
        );
      }
    });

    render();
  }

  function findListing(id) {
    return LISTINGS.filter(function (l) { return String(l.id) === String(id); })[0];
  }

  /* ========== MANAGE LISTINGS PAGE END ========== */


  /* ========== 6. PENDING PAYOUTS PAGE STARTED ========== */

  function initPayouts() {
    function render() {
      var toPay = PAYOUTS.filter(function (p) { return !p.paid; });
      var owed = toPay.reduce(function (sum, p) { return sum + p.amount; }, 0);

      $('payoutStats').innerHTML =
        '<div class="adm-stat' + (owed ? ' is-alert' : '') + '"><span class="adm-stat-value">' + rupees(owed) + '</span><span class="adm-stat-label">Still to send</span></div>' +
        '<div class="adm-stat"><span class="adm-stat-value">' + toPay.length + '</span><span class="adm-stat-label">Sellers waiting</span></div>';

      $('payoutRows').innerHTML = toPay.length ? toPay.map(function (p) {
        return '<tr>' +
            '<td class="mono">' + esc(p.id) + '</td>' +
            '<td class="strong">' + esc(p.seller) + '</td>' +
            '<td>' + esc(p.book) + '</td>' +
            '<td class="nowrap"><span class="adm-pill pill-' + p.method.toLowerCase() + '">' + esc(p.method) + '</span> ' + maskPhone(p.account) + '</td>' +
            '<td class="nowrap">' + niceDate(p.confirmed) + '</td>' +
            '<td class="num strong">' + rupees(p.amount) + '</td>' +
            '<td class="adm-actions"><button type="button" class="adm-btn adm-btn-sm adm-btn-primary" data-pay="' + esc(p.id) + '">Mark as paid</button></td>' +
          '</tr>';
      }).join('') : emptyRow(7, 'All sellers are paid. Nothing to send right now.');
    }

    $('payoutRows').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-pay]');
      if (!btn) return;
      var p = PAYOUTS.filter(function (x) { return x.id === btn.getAttribute('data-pay'); })[0];
      confirmBox(
        'Mark ' + rupees(p.amount) + ' as paid?',
        'Only do this after you have sent the money to ' + p.seller + ' on ' + p.method + ' (' + maskPhone(p.account) + ').',
        'Yes, mark as paid',
        false,
        function () {
          p.paid = true;               // BACKEND: POST /api/admin/payouts/:id/paid
          toast(rupees(p.amount) + ' to ' + p.seller + ' marked as paid.');
          render();
        }
      );
    });

    render();
  }

  /* ========== PENDING PAYOUTS PAGE END ========== */


  /* ========== 7. RUN ========== */
  function run() {
    // On phones the menu scrolls sideways: make sure the current page's link is visible
    var current = document.querySelector('.adm-nav [aria-current="page"]');
    if (current && window.innerWidth <= 820) {
      current.parentElement.parentElement.scrollLeft = current.parentElement.offsetLeft - 16;
    }

    var page = document.body.getAttribute('data-page');
    if (page === 'dashboard') initDashboard();
    if (page === 'users')     initUsers();
    if (page === 'listings')  initListings();
    if (page === 'payouts')   initPayouts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();