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
    var url = ROOT + name + '.html';

    return fetch(url)
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
    if (!nav) return;

    // Mobile menu toggle
    var toggle = document.getElementById('navToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Highlight current page link
    var current = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      var file = new URL(a.href).pathname.split('/').pop();
      if (file === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
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
