/* ==========================================================================
   BOOKSWAP - include.js
   Loads reusable components (navigation, footer) into any page.

   Usage in any HTML page:
     <div data-include="nav"></div>
     ...
     <div data-include="footer"></div>
     <script src="js/include.js"></script>

   Components are read from:  frontend/<name>.html
   (nav -> frontend/nav.html, footer -> frontend/footer.html,
    partials/login-form -> frontend/partials/login-form.html)
   {{ROOT}} inside a component is replaced with the frontend folder URL,
   so links and images work from ANY page depth.
   ========================================================================== */

(function () {
  'use strict';

  // frontend/js/include.js  ->  ROOT = frontend/
  var script = document.currentScript || document.querySelector('script[src*="include.js"]');
  var ROOT = new URL('../', script.src).href;

  /* ---------- Load one component ---------- */
  function loadComponent(el) {
    var name = el.getAttribute('data-include');
    var url = ROOT + name + '.html?v=' + Date.now();

    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html.split('{{ROOT}}').join(ROOT);
      })
      .catch(function (err) {
        console.error('[include.js] Could not load "' + name + '" from ' + url + ' -> ' + err.message);
      });
  }

  /* ---------- Navigation behaviour ---------- */
  function initNavigation() {
    var nav = document.getElementById('siteNav');
    var drawer = document.getElementById('navDrawer');
    var backdrop = document.getElementById('navDrawerBackdrop');
    var toggle = document.getElementById('navToggle');
    var closeBtn = document.getElementById('navDrawerClose');

    function openDrawer() {
      if (drawer) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
      }
      if (backdrop) backdrop.classList.add('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
    }

    function closeDrawer() {
      if (drawer) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (backdrop) backdrop.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
    }

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (drawer && drawer.classList.contains('is-open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    if (drawer) {
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeDrawer);
      });
    }

    // Highlight current page link (both desktop nav and drawer)
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .drawer-nav-list a').forEach(function (a) {
      try {
        var file = new URL(a.href, window.location.origin).pathname.split('/').pop();
        if (file === current) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      } catch (err) {}
    });

    // Search -> search.html?q=...
    var form = document.getElementById('navSearchForm');
    var input = document.getElementById('navSearchInput');
    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = input.value.trim();
        if (q) window.location.href = ROOT + 'search.html?q=' + encodeURIComponent(q);
      });
    }
  }

  /* ---------- Footer behaviour ---------- */
  function initFooter() {
    // Current year
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    // Newsletter form (frontend only for now - connect to backend later)
    var form = document.getElementById('newsletterForm');
    var msg = document.getElementById('newsletterMsg');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (msg) msg.textContent = 'Thanks for subscribing!';
        form.reset();
      });
    }
  }

  /* ---------- Run ---------- */
  function run() {
    var targets = document.querySelectorAll('[data-include]');
    Promise.all(Array.prototype.map.call(targets, loadComponent)).then(function () {
      initNavigation();
      initFooter();
      document.dispatchEvent(new CustomEvent('components:loaded'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
