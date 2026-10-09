/* ==========================================================================
   BOOKSWAP - auth.js  (Member 4 - Aleena)
   Login / Sign up popup, Buyer & Seller accounts, Switch to Seller.

   How to use on any page (put it AFTER include.js):
     <script src="js/include.js"></script>
     <script src="js/auth.js"></script>

   - The popup markup lives in login-modal.html, its 4 parts in Partial/.
   - Visitors can browse every page WITHOUT an account (like Amazon).
     The popup only opens when a guest tries something that needs an
     account: profile, wishlist, add to cart, chat, buy, sell...
   - To protect any button or link, just add an attribute:
       <button data-auth-required="Sign in to add this book to your cart">Add to cart</button>
       <a href="seller/add-listing.html" data-seller-required>Sell a book</a>
     After signing in / signing up, the click continues automatically.
   - Other pages can call:
       BookSwapAuth.open('login')            open sign in
       BookSwapAuth.open('role')             open "Buyer or Seller?"
       BookSwapAuth.currentUser()            signed-in user or null
       BookSwapAuth.isSeller()               true / false
       BookSwapAuth.becomeSeller()           buyer -> seller (asks payout, optional)
       BookSwapAuth.editPayout()             change payout account
       BookSwapAuth.logout()
       BookSwapAuth.require('Sign in to chat', function () { ... })
     and listen for:  document.addEventListener('auth:changed', ...)

   Rules:  a Seller can buy AND sell.  A Buyer can only buy, until they
   switch to Seller.  Payout details are optional.

   BACKEND: users are saved in the browser (localStorage) ONLY so the
   frontend can be tested. Every place marked "BACKEND:" must be
   replaced with a real API call by the backend team.
   ========================================================================== */

(function () {
  'use strict';

  var script = document.currentScript || document.querySelector('script[src*="auth.js"]');
  var ROOT = new URL('../', script.src).href;           // .../Frontend/

  var USERS_KEY = 'bookswap_users';
  var SESSION_KEY = 'bookswap_session';

  /* ======================================================================
     1. DEMO STORAGE  (BACKEND: replace with /api/auth/... calls)
     ====================================================================== */
  function readUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveUsers(list) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
  }

  function findUser(email) {
    email = String(email || '').trim().toLowerCase();
    return readUsers().filter(function (u) { return u.email === email; })[0] || null;
  }

  function saveUser(user) {
    var list = readUsers();
    var i = list.findIndex(function (u) { return u.email === user.email; });
    if (i === -1) list.push(user); else list[i] = user;
    saveUsers(list);
  }

  function sessionEmail() {
    try { return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY); }
    catch (e) { return null; }
  }

  function startSession(email, remember) {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, email);
    } catch (e) { /* storage blocked */ }
  }

  function endSession() {
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); }
    catch (e) { /* storage blocked */ }
  }

  function currentUser() {
    var email = sessionEmail();
    return email ? findUser(email) : null;
  }

  // Never hand the password hash to other pages
  function publicCopy(user) {
    if (!user) return null;
    var copy = JSON.parse(JSON.stringify(user));
    delete copy.passHash;
    return copy;
  }

  // Passwords are never stored as plain text, even in the demo
  function hashPassword(pw) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode('bookswap:' + pw)).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      });
    }
    return Promise.resolve('x' + btoa(unescape(encodeURIComponent(pw))));
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ======================================================================
     2. SMALL HELPERS
     ====================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^(\+92|0)3\d{9}$/;
  var IBAN_RE = /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/;

  function cleanPhone(v) { return String(v || '').replace(/[\s-]/g, ''); }
  function cleanIban(v) { return String(v || '').replace(/\s/g, '').toUpperCase(); }
  function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || 'there'; }

  var METHOD_NAMES = { easypaisa: 'Easypaisa', jazzcash: 'JazzCash', bank: 'Bank account' };

  function maskPayout(p) {
    if (!p) return '';
    var digits = p.method === 'bank' ? p.iban : p.number;
    var last4 = String(digits || '').slice(-4);
    var name = p.method === 'bank' ? (p.bank || 'Bank') : METHOD_NAMES[p.method];
    return name + ' •••• ' + last4;
  }

  function passwordScore(pw) {
    var s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/i.test(pw) && /\d/.test(pw)) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
    return pw ? Math.max(s, 1) : 0;
  }

  function setError(input, msg) {
    var field = input.closest('.auth-field');
    if (!field) return;
    var box = field.querySelector('.auth-error');
    field.classList.toggle('has-error', !!msg);
    if (box) box.textContent = msg || '';
    if (input.matches('input, select')) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function clearErrors(form) {
    form.querySelectorAll('.has-error').forEach(function (f) { f.classList.remove('has-error'); });
    form.querySelectorAll('.auth-error').forEach(function (e) { e.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.setAttribute('aria-invalid', 'false'); });
    showAlert(form, '');
  }

  function showAlert(form, msg, type) {
    var box = form.querySelector('.auth-alert');
    if (!box) return;
    box.hidden = !msg;
    box.textContent = msg || '';
    box.className = 'auth-alert' + (type === 'info' ? ' auth-alert-info' : '');
  }

  function setBusy(btn, busy) {
    btn.disabled = busy;
    btn.classList.toggle('is-loading', busy);
  }

  function focusFirstError(form) {
    var bad = form.querySelector('.has-error input, .has-error select');
    if (bad) bad.focus();
  }

  function toast(msg) {
    var t = document.getElementById('authToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'authToast';
      t.className = 'auth-toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  function announceChange() {
    paintNav();
    document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: publicCopy(currentUser()) } }));
  }

  /* ======================================================================
     3. LOAD THE POPUP  (login-modal.html + 4 files from Partial/)
     ====================================================================== */
  var modal, dialog;
  var state = {
    view: 'login',
    role: 'buyer',          // which role is being signed up
    payoutMode: 'signup',   // signup | upgrade | edit
    next: null,             // page to open after signing in
    pending: null,          // action to continue after signing in / up
    reason: '',             // "Sign in to add this book to your cart"
    lastFocus: null,
    pageMode: document.body.hasAttribute('data-auth-page')
  };

  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {   // always get the newest file
      if (!res.ok) throw new Error(res.status + ' ' + url);
      return res.text();
    });
  }

  function loadModal() {
    modal = document.getElementById('authModal');
    var getShell = modal ? Promise.resolve() : fetchText(ROOT + 'login-modal.html').then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      modal = document.importNode(doc.getElementById('authModal'), true);
      document.body.appendChild(modal);
    });

    return getShell.then(function () {
      var parts = modal.querySelectorAll('[data-auth-part]');
      return Promise.all(Array.prototype.map.call(parts, function (el) {
        var name = el.getAttribute('data-auth-part');
        return fetchText(ROOT + name + '.html').then(function (html) {
          el.innerHTML = html.split('{{ROOT}}').join(ROOT);
          el.removeAttribute('data-auth-part');
        });
      }));
    }).then(function () {
      dialog = modal.querySelector('.auth-dialog');
      wireModal();
    });
  }

  /* ======================================================================
     4. OPEN / CLOSE / SWITCH SCREENS
     ====================================================================== */
  var SIDE_TEXT = {
    login:  ['Good to see you again', 'Your next book is only a few clicks away.'],
    role:   ['One account, two ways to use it', 'Buy books for this semester, or sell the ones you are done with.'],
    buyer:  ['Books for every core course', 'Save money on the books you need this semester.'],
    seller: ['Turn old books into cash', "Your last semester's books can help a junior this semester."],
    payout: ['Get paid your way', 'Easypaisa, JazzCash or any Pakistani bank account.'],
    done:   ['Welcome to BookSwap', 'Read. Swap. Grow.']
  };

  function show(view) {
    state.view = view;
    modal.querySelectorAll('.auth-view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== view; });
    dialog.setAttribute('aria-labelledby', 'authTitle-' + view);

    // Left panel text
    var key = view === 'signup' ? state.role : view;
    modal.querySelector('[data-side-title]').textContent = SIDE_TEXT[key][0];
    modal.querySelector('[data-side-text]').textContent = SIDE_TEXT[key][1];

    // Seller step bar: 1 Your details -> 2 Payout account
    var steps = modal.querySelector('[data-auth-steps]');
    var showSteps = state.role === 'seller' && (view === 'signup' || (view === 'payout' && state.payoutMode === 'signup'));
    steps.hidden = !showSteps;
    steps.querySelector('[data-step="1"]').className = view === 'signup' ? 'is-current' : 'is-done';
    steps.querySelector('[data-step="2"]').className = view === 'payout' ? 'is-current' : '';

    modal.querySelectorAll('[data-auth-reason]').forEach(function (r) {
      r.textContent = state.reason;
      r.hidden = !state.reason;
    });

    if (view === 'signup') prepareSignup();
    if (view === 'payout') preparePayout();

    modal.querySelector('.auth-main').scrollTop = 0;

    var active = modal.querySelector('.auth-view[data-view="' + view + '"]');
    var first = active.querySelector('input:not([type="radio"]):not([type="checkbox"]), .auth-role, input[type="radio"], .auth-btn');
    if (first) first.focus({ preventScroll: true });
  }

  function open(view, opts) {
    opts = opts || {};
    return ready.then(function () {
      if (!modal) return;
      if (modal.hidden) {
        state.next = opts.next || null;
        state.pending = opts.pending || null;
        state.reason = opts.reason || '';
      }
      if (opts.role) state.role = opts.role;
      if (opts.mode) state.payoutMode = opts.mode;
      else if (view !== 'payout') state.payoutMode = 'signup';

      if (modal.hidden) {
        state.lastFocus = document.activeElement;
        modal.querySelectorAll('form').forEach(function (f) { f.reset(); clearErrors(f); });
        resetExtras();
        modal.hidden = false;
        document.documentElement.classList.add('auth-lock');
        requestAnimationFrame(function () { modal.classList.add('is-open'); });
      }
      show(view || 'login');
    });
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('auth-lock');
    setTimeout(function () { modal.hidden = true; }, 200);
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
    if (state.pageMode) paintPageBox();
    state.pending = null;
    state.next = null;
  }

  // Continue what the guest was trying to do before we asked them to sign in
  function continuePending() {
    var pending = state.pending, next = state.next;
    close();
    if (pending) setTimeout(pending, 250);
    else if (next) window.location.href = next;
  }

  function resetExtras() {
    var meter = modal.querySelector('.auth-strength');
    if (meter) meter.setAttribute('data-strength', '0');
    var fields = modal.querySelector('[data-payout-fields]');
    if (fields) fields.hidden = true;
    modal.querySelectorAll('[data-auth-eye]').forEach(function (b) {
      var input = b.parentNode.querySelector('input');
      input.type = 'password';
      b.setAttribute('aria-label', 'Show password');
      b.classList.remove('is-on');
    });
  }

  /* ======================================================================
     5. SIGN IN
     ====================================================================== */
  function handleLogin(e) {
    e.preventDefault();
    var form = e.target;
    var email = form.email.value.trim().toLowerCase();
    var pw = form.password.value;
    var btn = form.querySelector('[type="submit"]');
    clearErrors(form);

    if (!email) setError(form.email, 'Enter your email.');
    else if (!EMAIL_RE.test(email)) setError(form.email, 'This email does not look right.');
    if (!pw) setError(form.password, 'Enter your password.');
    if (form.querySelector('.has-error')) return focusFirstError(form);

    setBusy(btn, true);
    // BACKEND: POST /api/auth/login  { email, password }  -> { user, token }
    Promise.all([hashPassword(pw), wait(500)]).then(function (r) {
      setBusy(btn, false);
      var user = findUser(email);
      if (!user || user.passHash !== r[0]) {
        showAlert(form, "That email and password don't match. Try again, or create an account.");
        form.password.value = '';
        form.password.focus();
        return;
      }
      startSession(user.email, form.remember.checked);
      announceChange();
      toast('Welcome back, ' + firstName(user.name) + '!');
      if (state.pending || state.next) return continuePending();
      close();
      if (state.pageMode) window.location.href = ROOT + 'index.html';
    });
  }

  /* ======================================================================
     6. SIGN UP  (Buyer = 1 step,  Seller = 2 steps with payout)
     ====================================================================== */
  function prepareSignup() {
    var isSeller = state.role === 'seller';
    modal.querySelector('[data-auth-rolename]').textContent = isSeller ? 'Seller' : 'Buyer';
    modal.querySelector('[data-signup-submit]').textContent = isSeller ? 'Continue to payout' : 'Create account';
  }

  function handleSignup(e) {
    e.preventDefault();
    var form = e.target;
    var name = form.name.value.trim().replace(/\s+/g, ' ');
    var email = form.email.value.trim().toLowerCase();
    var phone = cleanPhone(form.phone.value);
    var pw = form.password.value;
    var btn = form.querySelector('[type="submit"]');
    clearErrors(form);

    if (name.length < 3) setError(form.name, 'Enter your full name.');
    else if (!/^[A-Za-z][A-Za-z .'-]+$/.test(name)) setError(form.name, 'Use letters only.');

    if (!email) setError(form.email, 'Enter your email.');
    else if (!EMAIL_RE.test(email)) setError(form.email, 'This email does not look right.');
    else if (findUser(email)) setError(form.email, 'This email already has an account. Sign in instead.');

    if (!phone) setError(form.phone, 'Enter your phone number.');
    else if (!PHONE_RE.test(phone)) setError(form.phone, 'Use a mobile number like 0300 1234567.');

    if (pw.length < 8) setError(form.password, 'Password must be at least 8 characters.');
    else if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) setError(form.password, 'Use both letters and numbers.');

    if (!form.confirm.value) setError(form.confirm, 'Type your password again.');
    else if (form.confirm.value !== pw) setError(form.confirm, 'Passwords do not match.');

    if (!form.terms.checked) setError(form.terms, 'Please accept the terms to continue.');

    if (form.querySelector('.has-error')) return focusFirstError(form);

    setBusy(btn, true);
    // BACKEND: POST /api/auth/register  { name, email, phone, password, role }
    Promise.all([hashPassword(pw), wait(600)]).then(function (r) {
      setBusy(btn, false);
      var user = {
        id: 'u' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        role: state.role,           // 'buyer' or 'seller'
        payout: null,               // filled in the payout step (optional)
        joined: new Date().toISOString(),
        passHash: r[0]
      };
      saveUser(user);
      startSession(email, true);
      announceChange();

      if (state.role === 'seller') {
        state.payoutMode = 'signup';
        show('payout');
      } else {
        showDone('buyer');
      }
    });
  }

  function updateStrength(input) {
    var meter = input.closest('.auth-field').querySelector('.auth-strength');
    if (meter) meter.setAttribute('data-strength', passwordScore(input.value));
  }

  /* ======================================================================
     7. PAYOUT ACCOUNT  (optional)
        mode 'signup'  -> step 2 of seller sign up
        mode 'upgrade' -> buyer clicked "Switch to Seller"
        mode 'edit'    -> seller changing payout from profile
     ====================================================================== */
  function preparePayout() {
    var mode = state.payoutMode;
    var form = modal.querySelector('#payoutForm');
    var title = { signup: 'How should we pay you?', upgrade: 'Become a seller', edit: 'Payout account' }[mode];
    var sub = {
      signup: 'When a buyer pays for your book, we send the money here.',
      upgrade: 'Sellers can list books and still buy. Add where we should send your money.',
      edit: 'Choose where your earnings should go.'
    }[mode];

    modal.querySelector('[data-payout-title]').textContent = title;
    modal.querySelector('[data-payout-sub]').textContent = sub;
    modal.querySelector('[data-auth-skip]').textContent =
      { signup: 'Skip for now', upgrade: 'Add it later', edit: 'Cancel' }[mode];
    modal.querySelector('[data-payout-submit]').textContent =
      { signup: 'Save & finish', upgrade: 'Save & become seller', edit: 'Save changes' }[mode];

    // Edit mode: fill in what is already saved
    var user = currentUser();
    if (mode === 'edit' && user && user.payout) {
      var p = user.payout;
      var radio = form.querySelector('input[name="method"][value="' + p.method + '"]');
      if (radio) radio.checked = true;
      form.title.value = p.title || '';
      form.number.value = p.number || '';
      form.bank.value = p.bank || '';
      form.iban.value = p.iban || '';
    }
    showPayoutFields(form);
  }

  function showPayoutFields(form) {
    var checked = form.querySelector('input[name="method"]:checked');
    var box = form.querySelector('[data-payout-fields]');
    box.hidden = !checked;
    if (!checked) return;
    var isBank = checked.value === 'bank';
    box.querySelectorAll('[data-for="wallet"]').forEach(function (el) { el.hidden = isBank; });
    box.querySelectorAll('[data-for="bank"]').forEach(function (el) { el.hidden = !isBank; });
    if (!isBank) form.querySelector('[data-wallet-name]').textContent = METHOD_NAMES[checked.value];
  }

  function handlePayout(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('[type="submit"]');
    var checked = form.querySelector('input[name="method"]:checked');
    clearErrors(form);

    if (!checked) {
      setError(form.querySelector('input[name="method"]'), 'Choose a payout method, or press "' +
        form.querySelector('[data-auth-skip]').textContent + '".');
      return form.querySelector('input[name="method"]').focus();
    }

    var method = checked.value;
    var data = { method: method, title: form.title.value.trim().replace(/\s+/g, ' ') };

    if (data.title.length < 3) setError(form.title, 'Enter the name on the account.');

    if (method === 'bank') {
      data.bank = form.bank.value;
      data.iban = cleanIban(form.iban.value);
      if (!data.bank) setError(form.bank, 'Choose your bank.');
      if (!data.iban) setError(form.iban, 'Enter your IBAN.');
      else if (data.iban.length !== 24) setError(form.iban, 'IBAN must be 24 characters (you entered ' + data.iban.length + ').');
      else if (!IBAN_RE.test(data.iban)) setError(form.iban, 'IBAN should look like PK36SCBL0000001123456702.');
    } else {
      data.number = cleanPhone(form.number.value);
      if (!data.number) setError(form.number, 'Enter your ' + METHOD_NAMES[method] + ' number.');
      else if (!PHONE_RE.test(data.number)) setError(form.number, 'Use a mobile number like 0300 1234567.');
    }

    if (form.querySelector('.has-error')) return focusFirstError(form);

    setBusy(btn, true);
    // BACKEND: PUT /api/users/me/payout  { method, title, number | bank + iban }
    wait(500).then(function () {
      setBusy(btn, false);
      finishPayout(data);
    });
  }

  function finishPayout(data) {
    var user = currentUser();
    if (!user) return show('login');
    var mode = state.payoutMode;

    if (data) user.payout = data;
    if (mode === 'upgrade') user.role = 'seller';   // BACKEND: POST /api/users/me/become-seller
    saveUser(user);
    announceChange();

    if (mode === 'edit') {
      close();
      if (data) toast('Payout account saved');
      return;
    }
    showDone(mode === 'upgrade' ? 'upgrade' : 'seller');
  }

  /* ======================================================================
     8. SUCCESS SCREEN
     ====================================================================== */
  function showDone(kind) {
    var user = currentUser();
    var name = firstName(user && user.name);
    var payoutLine = user && user.payout
      ? 'Your earnings will go to ' + maskPayout(user.payout) + '.'
      : 'You can add a payout account later from your profile. You will need it before your first payout.';

    var screens = {
      buyer: ['Welcome, ' + name + '!',
              'Your buyer account is ready. Want to sell books later? Switch to seller anytime from your profile.',
              'Start browsing', 'index.html'],
      seller: ['Your seller account is ready',
               payoutLine + ' You can buy books too.',
               'Go to seller dashboard', 'Seller/seller-dashboard.html'],
      upgrade: ["You're now a seller!",
                payoutLine + ' List your first book to start selling.',
                'List your first book', 'Seller/add-listing.html']
    }[kind];

    // The guest was in the middle of something (add to cart, chat...) -> let them finish it
    if (state.pending || state.next) {
      screens[2] = 'Continue where you left off';
      screens[3] = '#continue';
    }

    modal.querySelector('[data-done-title]').textContent = screens[0];
    modal.querySelector('[data-done-text]').textContent = screens[1];
    var link = modal.querySelector('[data-done-link]');
    link.textContent = screens[2];
    link.href = screens[3] === '#continue' ? '#continue' : ROOT + screens[3];
    show('done');
  }

  /* ======================================================================
     9. EVENTS INSIDE THE POPUP
     ====================================================================== */
  function wireModal() {
    modal.addEventListener('click', function (e) {
      var t = e.target.closest('button, a, [data-auth-close]');
      if (!t || !modal.contains(t)) return;

      if (t.hasAttribute('data-auth-close')) { e.preventDefault(); return close(); }
      if (t.hasAttribute('data-done-link') && t.getAttribute('href') === '#continue') {
        e.preventDefault();
        return continuePending();
      }
      if (t.hasAttribute('data-auth-go')) return show(t.getAttribute('data-auth-go'));
      if (t.hasAttribute('data-auth-role')) { state.role = t.getAttribute('data-auth-role'); return show('signup'); }
      if (t.hasAttribute('data-auth-skip')) {
        if (state.payoutMode === 'edit') return close();
        return finishPayout(null);
      }
      if (t.hasAttribute('data-auth-forgot')) {
        // BACKEND: POST /api/auth/forgot-password  { email }
        return showAlert(modal.querySelector('#loginForm'),
          'Password reset is coming soon. For now, ask the BookSwap admin to reset it for you.', 'info');
      }
      if (t.hasAttribute('data-auth-eye')) {
        var input = t.parentNode.querySelector('input');
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        t.classList.toggle('is-on', !showing);
        t.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      }
    });

    modal.querySelector('#loginForm').addEventListener('submit', handleLogin);
    modal.querySelector('#signupForm').addEventListener('submit', handleSignup);
    modal.querySelector('#payoutForm').addEventListener('submit', handlePayout);

    modal.addEventListener('input', function (e) {
      var el = e.target;
      if (el.closest('.has-error')) setError(el, '');
      if (el.id === 'signupPassword') updateStrength(el);
      if (el.id === 'payoutIban') {
        var pos = el.value.length;
        el.value = el.value.toUpperCase();
        el.setSelectionRange(pos, pos);
      }
    });

    modal.addEventListener('change', function (e) {
      if (e.target.name === 'method') {
        setError(e.target, '');
        showPayoutFields(e.target.form);
      }
      if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') setError(e.target, '');
    });

    // Esc closes, Tab stays inside the popup
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); return close(); }
      if (e.key !== 'Tab') return;
      var items = Array.prototype.filter.call(
        dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select'),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ======================================================================
     10. NAVBAR: show the user's first letter, open popup when signed out
     ====================================================================== */
  function paintNav() {
    paintNavButton();
    var avatar = document.querySelector('.nav-avatar');
    if (!avatar) return;
    var user = currentUser();
    var badge = avatar.querySelector('.auth-initial');
    if (user) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'auth-initial';
        badge.setAttribute('aria-hidden', 'true');
        avatar.appendChild(badge);
      }
      badge.textContent = user.name.trim().charAt(0).toUpperCase();
      avatar.classList.add('is-signed-in');
      avatar.classList.remove('is-guest');
      avatar.setAttribute('aria-label', 'My profile (' + user.name + ')');
    } else {
      if (badge) badge.remove();
      avatar.classList.remove('is-signed-in');
      avatar.classList.add('is-guest');
      avatar.setAttribute('aria-label', 'Sign in');
    }
  }

  // Runs a guarded click again after the guest signs in
  function replay(el) {
    return function () {
      if (el.tagName === 'A' && el.href) window.location.href = el.href;
      else el.click();
    };
  }

  // Guests can browse freely. These clicks need an account:
  //   - profile icon, wishlist, "Sign in" button in the navbar
  //   - anything with data-auth-required   (add to cart, chat, buy...)
  //   - anything with data-seller-required (sell a book, my shop...)
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-auth-open], [data-auth-required], [data-seller-required], .nav-avatar, a[href*="profile.html"]');
    if (!el || (modal && modal.contains(el))) return;

    if (el.hasAttribute('data-auth-open')) {
      e.preventDefault();
      return open(el.getAttribute('data-auth-open'));
    }

    var user = currentUser();

    if (el.hasAttribute('data-seller-required')) {
      if (user && user.role === 'seller') return;        // allowed, carry on
      e.preventDefault();
      e.stopImmediatePropagation();                      // stop the button's own code
      if (user) return api.becomeSeller({ pending: replay(el) });   // buyer -> offer Switch to Seller
      return open('role', {
        reason: el.getAttribute('data-seller-required') || 'Create a seller account to sell your books.',
        role: 'seller',
        pending: replay(el)
      });
    }

    if (user) return;                                     // signed in, nothing to do
    e.preventDefault();
    e.stopImmediatePropagation();                        // stop the button's own code
    var reason = el.getAttribute('data-auth-required') ||
      (/wishlist/.test(el.getAttribute('href') || '') ? 'Sign in to see your wishlist.' : '');
    open('login', { reason: reason, pending: replay(el) });
  }, true);   // "true" = run before the button's own click code

  // Navbar: guests see a "Sign in" button next to the profile icon (like Amazon)
  function paintNavButton() {
    var actions = document.querySelector('.nav-actions');
    if (!actions) return;
    var btn = actions.querySelector('.auth-nav-signin');
    if (currentUser()) { if (btn) btn.remove(); return; }
    if (btn) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'auth-nav-signin';
    btn.setAttribute('data-auth-open', 'login');
    btn.innerHTML = '<span class="auth-nav-hello">Hello, guest</span><span class="auth-nav-cta">Sign in / Sign up</span>';
    var avatar = actions.querySelector('.nav-avatar');
    actions.insertBefore(btn, avatar || null);
  }

  document.addEventListener('components:loaded', paintNav);

  /* ======================================================================
     11. login-modal.html opened directly as a page
     ====================================================================== */
  function paintPageBox() {
    var box = document.getElementById('authPageBox');
    var user = currentUser();
    if (!box || !user) return;
    box.innerHTML =
      '<h1>You Are Signed In</h1>' +
      '<p>Signed in as <strong></strong> (' + (user.role === 'seller' ? 'Seller' : 'Buyer') + ').</p>' +
      '<a class="auth-btn auth-btn-primary" href="' + ROOT + 'index.html">Go to home</a>' +
      '<button type="button" class="auth-btn auth-btn-ghost" data-auth-logout>Sign out</button>';
    box.querySelector('strong').textContent = user.email;
    box.querySelector('[data-auth-logout]').addEventListener('click', function () {
      api.logout();
      window.location.reload();
    });
  }

  /* ======================================================================
     12. START + PUBLIC API
     ====================================================================== */
  var ready = loadModal().catch(function (err) {
    console.error('[auth.js] Could not load the login popup -> ' + err.message +
      '  (Open the site with Live Server, not by double-clicking the file.)');
  });

  paintNav();

  if (state.pageMode) {
    ready.then(function () {
      var params = new URLSearchParams(window.location.search);
      if (currentUser()) return paintPageBox();
      var hash = window.location.hash;
      if (hash === '#signup') open('role');
      else if (hash === '#seller') open('signup', { role: 'seller' });
      else open('login', { next: params.get('next') });
    });
  }

  var api = {
    ready: ready,
    open: open,
    close: close,
    currentUser: function () { return publicCopy(currentUser()); },
    isLoggedIn: function () { return !!currentUser(); },
    isSeller: function () { var u = currentUser(); return !!u && u.role === 'seller'; },
    maskPayout: maskPayout,

    // For other JS files:  BookSwapAuth.require('Sign in to chat with the seller', openChat)
    require: function (reason, action) {
      if (currentUser()) { if (action) action(); return true; }
      open('login', { reason: reason, pending: action });
      return false;
    },

    becomeSeller: function (opts) {
      opts = opts || {};
      if (!currentUser()) return open('login', { pending: opts.pending });
      return open('payout', { mode: 'upgrade', role: 'buyer', pending: opts.pending });
    },

    editPayout: function () {
      if (!currentUser()) return open('login');
      return open('payout', { mode: 'edit' });
    },

    // Save profile changes (used by profile.html)
    updateProfile: function (fields) {
      var user = currentUser();
      if (!user) return null;
      ['name', 'phone'].forEach(function (k) { if (fields[k] !== undefined) user[k] = fields[k]; });
      saveUser(user);                     // BACKEND: PUT /api/users/me
      announceChange();
      return publicCopy(user);
    },

    logout: function () {
      endSession();                       // BACKEND: POST /api/auth/logout
      announceChange();
      toast('You have been signed out');
    },

    toast: toast
  };

  window.BookSwapAuth = api;
})();
