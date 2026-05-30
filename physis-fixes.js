(function () {

  // Inject styles immediately — synchronous, before paint
  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper{background:transparent!important;background-color:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;display:block!important;width:160px!important;margin-left:auto!important;margin-right:auto!important}'
    + '[class*="logo-wrapper"]{background:transparent!important;background-color:transparent!important;border:none!important}'
    + '.header__logo{background:transparent!important;background-color:transparent!important}'
    + '.w-block-background{background-color:transparent!important;background:transparent!important}'
    + '.w-block-header{background-color:transparent!important;background:transparent!important}'
    + '.w-header{background-color:transparent!important;background:transparent!important}'
    + '.w-container.header__content-container{justify-content:center!important;display:flex!important}'
    + '.w-cell.header__flex{display:flex!important;justify-content:center!important;flex:unset!important;width:100%!important}'
    // Prevent layout shift before JS runs
    + '.header__logo-wrapper{position:static!important}'
    + '}';
  document.head.appendChild(s);

  function applyFixes() {
    document.querySelectorAll('.header__logo-wrapper, .header__logo, [class*="logo-wrapper"]').forEach(function (el) {
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', 'none', 'important');
    });

    document.querySelectorAll('.w-block-background, .w-block-header, .w-header').forEach(function (el) {
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('--color-white', 'transparent', 'important');
    });

    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    if (l) l.style.setProperty('--mobile-width', '160px', 'important');
    if (i) i.style.setProperty('width', '160px', 'important');

    var logoWrap = document.querySelector('.header__logo-wrapper');
    if (logoWrap) {
      logoWrap.style.removeProperty('position');
      logoWrap.style.removeProperty('left');
      logoWrap.style.removeProperty('right');
      logoWrap.style.setProperty('margin-left', 'auto', 'important');
      logoWrap.style.setProperty('margin-right', 'auto', 'important');
      logoWrap.style.setProperty('display', 'block', 'important');
      logoWrap.style.setProperty('width', '160px', 'important');
    }

    var row = document.querySelector('.w-container.header__content-container');
    if (row) {
      row.style.setProperty('justify-content', 'center', 'important');
      row.style.setProperty('display', 'flex', 'important');
    }

    var cell = document.querySelector('.w-cell.header__flex');
    if (cell) {
      cell.style.setProperty('display', 'flex', 'important');
      cell.style.setProperty('justify-content', 'center', 'important');
      cell.style.setProperty('flex', 'unset', 'important');
      cell.style.setProperty('width', '100%', 'important');
    }
  }

  // Narrowly scoped observer — only watch the header, not the whole document
  function startObserver() {
    var header = document.querySelector('.w-header, header');
    if (!header) return;

    var observer = new MutationObserver(function (mutations, obs) {
      applyFixes();
      // Disconnect after first fix — Square re-applies styles once on load, not continuously
      obs.disconnect();

      // Re-attach a lightweight version for SPA navigation only
      attachNavObserver();
    });

    observer.observe(header, { childList: true, subtree: true, attributes: true });
  }

  // Lightweight SPA navigation handler — replaces setInterval URL polling
  function attachNavObserver() {
    var lastUrl = location.href;
    var navObserver = new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(applyFixes, 150);
      }
    });
    // Watch only <title> changes — Square updates page title on navigation
    var titleEl = document.querySelector('title');
    if (titleEl) navObserver.observe(titleEl, { childList: true });
  }

  // Single run at DOMContentLoaded — no staggered timeouts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyFixes();
      startObserver();
      attachNavObserver();
    });
  } else {
    applyFixes();
    startObserver();
    attachNavObserver();
  }

  // One fallback timeout only, for Square's late style injection
  setTimeout(applyFixes, 500);

  window.addEventListener('popstate', function () { setTimeout(applyFixes, 150); });
  window.addEventListener('hashchange', function () { setTimeout(applyFixes, 150); });

})();
