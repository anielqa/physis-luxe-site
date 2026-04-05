(function() {

  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper{background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important}'
    + '.header__logo-wrapper[data-v-fd76376c]{background:transparent!important;border:none!important;border-radius:0!important}'
    + '}';
  document.head.appendChild(s);

  function applyFixes(el) {
    el.style.setProperty('background', 'transparent', 'important');
    el.style.setProperty('border', 'none', 'important');
    el.style.setProperty('border-radius', '0', 'important');
  }

  function fixAll() {
    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    var w = document.querySelector('.header__logo-wrapper');
    if (l) l.style.setProperty('--mobile-width', '160px', 'important');
    if (i) i.style.setProperty('width', '160px', 'important');
    if (w) applyFixes(w);
  }

  var observer = new MutationObserver(function() {
    var w = document.querySelector('.header__logo-wrapper');
    if (w) {
      applyFixes(w);
      fixAll();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  document.addEventListener('DOMContentLoaded', function() {
    fixAll();
    setTimeout(fixAll, 500);
    setTimeout(fixAll, 1500);
  });

  setTimeout(function() {
    observer.disconnect();
  }, 15000);

})();
