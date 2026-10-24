/**
 * ============================================================================
 * BOOKSWAP - updater.js
 * In-App Version Checker & Animated Splash Screen Controller
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  // App version constants
  var CURRENT_VERSION = '1.2.0';
  var CURRENT_VERSION_CODE = 3;
  var UPDATE_DISMISSED_KEY = 'bookswap_update_dismissed_ver';
  var UPDATE_DISMISSED_TIME_KEY = 'bookswap_update_dismissed_time';

  window.BOOKSWAP_APP_VERSION = CURRENT_VERSION;
  window.BOOKSWAP_VERSION_CODE = CURRENT_VERSION_CODE;

  /* --------------------------------------------------------------------------
   * 1. Animated Splash Screen Handler
   * -------------------------------------------------------------------------- */
  function initSplashScreen() {
    var splash = document.getElementById('appSplashScreen');
    if (!splash) return;

    // Show for 1.3s with pop-up animation, then smoothly pop-down / fade out
    setTimeout(function () {
      splash.classList.add('is-hidden');

      setTimeout(function () {
        if (splash && splash.parentNode) {
          splash.style.display = 'none';
          splash.parentNode.removeChild(splash);
        }
      }, 500);
    }, 1300);
  }

  /* --------------------------------------------------------------------------
   * 2. In-App Update Modal UI
   * -------------------------------------------------------------------------- */
  function ensureUpdateModal() {
    var modal = document.getElementById('appUpdateModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'appUpdateModal';
    modal.className = 'app-update-modal is-hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'appUpdateTitle');

    modal.innerHTML = [
      '<div class="app-update-backdrop" id="appUpdateBackdrop"></div>',
      '<div class="app-update-dialog">',
      '  <div class="app-update-icon">🚀</div>',
      '  <h2 class="app-update-title" id="appUpdateTitle">New Update Available!</h2>',
      '  <div class="app-update-version" id="appUpdateVersion">v' + CURRENT_VERSION + '</div>',
      '  <div class="app-update-notes" id="appUpdateNotes">',
      '    A new version of BookSwap is ready with performance updates, bug fixes, and new features.',
      '  </div>',
      '  <div class="app-update-actions">',
      '    <a href="#" class="app-update-btn-primary" id="appUpdateDownloadBtn" target="_blank" rel="noopener">',
      '      Download &amp; Install Update',
      '    </a>',
      '    <button type="button" class="app-update-btn-ghost" id="appUpdateDismissBtn">',
      '      Maybe Later',
      '    </button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(modal);

    // Event handlers
    var dismissBtn = modal.querySelector('#appUpdateDismissBtn');
    var backdrop = modal.querySelector('#appUpdateBackdrop');

    function hideModal() {
      modal.classList.add('is-hidden');
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
          sessionStorage.setItem('bookswap_session_update_dismissed', 'true');
        } catch (err) {}
        hideModal();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
          sessionStorage.setItem('bookswap_session_update_dismissed', 'true');
        } catch (err) {}
        hideModal();
      });
    }

    return modal;
  }

  function showUpdateModal(info) {
    var modal = ensureUpdateModal();
    var versionEl = document.getElementById('appUpdateVersion');
    var notesEl = document.getElementById('appUpdateNotes');
    var downloadBtn = document.getElementById('appUpdateDownloadBtn');

    if (versionEl) {
      versionEl.textContent = 'v' + (info.latestVersion || '1.1.0');
    }

    if (notesEl && info.releaseNotes) {
      notesEl.innerHTML = info.releaseNotes.replace(/\n/g, '<br>');
    }

    if (downloadBtn) {
      downloadBtn.href = info.downloadUrl || 'https://github.com/ZainCodes07/BookSwap/releases/latest/download/BookSwap.apk';
      downloadBtn.onclick = function () {
        setTimeout(function () {
          hideModal();
        }, 800);
      };
    }

    modal.classList.remove('is-hidden');
    modal.removeAttribute('hidden');
    modal.style.display = 'grid';
  }

  /* --------------------------------------------------------------------------
   * 3. Version Comparison & Check Routine
   * -------------------------------------------------------------------------- */
  function isNewerVersion(remoteVer, localVer) {
    if (!remoteVer) return false;
    if (!localVer) return true;
    var remoteParts = remoteVer.split('.').map(Number);
    var localParts = localVer.split('.').map(Number);
    for (var i = 0; i < Math.max(remoteParts.length, localParts.length); i++) {
      var r = remoteParts[i] || 0;
      var l = localParts[i] || 0;
      if (r > l) return true;
      if (r < l) return false;
    }
    return false;
  }

  async function fetchVersionInfo() {
    var candidateUrls = [];
    if (window.BOOKSWAP_API_BASE) {
      candidateUrls.push(window.BOOKSWAP_API_BASE + '/app-version');
    }
    candidateUrls.push('https://book-swap-mocha.vercel.app/api/app-version');
    candidateUrls.push('/api/app-version');
    candidateUrls.push('http://localhost:5000/api/app-version');

    for (var i = 0; i < candidateUrls.length; i++) {
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 4000);
        var res = await fetch(candidateUrls[i], { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          var data = await res.json();
          if (data && (data.latestVersion || data.versionCode)) {
            return data;
          }
        }
      } catch (e) {
        // Try next candidate
      }
    }
    return null;
  }

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  async function checkForUpdates(manual) {
    if (manual) {
      showToast('Checking for updates...');
    }

    try {
      var info = await fetchVersionInfo();
      if (!info) {
        if (manual) {
          showToast("BookSwap is up to date (v" + CURRENT_VERSION + ")");
        }
        return;
      }

      var hasUpdate = false;
      if (typeof info.versionCode === 'number' && info.versionCode > CURRENT_VERSION_CODE) {
        hasUpdate = true;
      } else if (info.latestVersion && isNewerVersion(info.latestVersion, CURRENT_VERSION)) {
        hasUpdate = true;
      }

      if (hasUpdate) {
        // If automatic check, verify if dismissed during current app session
        if (!manual) {
          try {
            var sessionDismissed = sessionStorage.getItem('bookswap_session_update_dismissed');
            if (sessionDismissed === 'true') {
              return;
            }
          } catch (e) {}
        }

        showUpdateModal(info);
      } else if (manual) {
        showToast("You're using the latest version (v" + CURRENT_VERSION + ")");
      }
    } catch (err) {
      if (manual) {
        showToast("You're using the latest version (v" + CURRENT_VERSION + ")");
      }
    }
  }

  /* --------------------------------------------------------------------------
   * 4. Lifecycle & Event Delegation
   * -------------------------------------------------------------------------- */
  function onReady() {
    initSplashScreen();

    // Check updates silently 2.5 seconds after launch
    setTimeout(function () {
      checkForUpdates(false);
    }, 2500);

    // Global click listener for "Check for Updates" buttons
    document.addEventListener('click', function (e) {
      var target = e.target.closest('#drawerCheckUpdateBtn, [data-action="check-update"]');
      if (target) {
        e.preventDefault();
        checkForUpdates(true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Export to global scope
  window.BookSwapUpdater = {
    currentVersion: CURRENT_VERSION,
    versionCode: CURRENT_VERSION_CODE,
    check: function () { checkForUpdates(true); },
    showModal: showUpdateModal
  };

})(window, document);
