(function() {

  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper{background:transparent!important;background-color:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important}'
    + '.header__logo-wrapper[data-v-fd76376c]{background:transparent!important;background-color:transparent!important;border:none!important;border-radius:0!important}'
    + '.header__logo{background:transparent!important;background-color:transparent!important}'
    + '[class*="logo-wrapper"]{background:transparent!important;background-color:transparent!important;border:none!important}'
    + '.header__content-container{justify-content:center!important}'
    + '.header__flex{justify-content:center!important;text-align:center!important}'
    + '.header__logo-wrapper{margin:0 auto!important;display:block!important}'
    + '}';
  document.head.appendChild(s);

  function applyFixes() {
    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    if (l) l.style.setProperty('--mobile-width', '160px', 'important');
    if (i) i.style.setProperty('width', '160px', 'important');

    document.querySelectorAll('.header__logo-wrapper, .header__logo, [class*="logo-wrapper"]').forEach(function(el) {
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', 'none', 'important');
      el.style.setProperty('margin', '0 auto', 'important');
    });
  }

  var observer = new MutationObserver(function() {
    if (document.querySelector('.header__logo-wrapper')) {
      applyFixes();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  document.addEventListener('DOMContentLoaded', applyFixes);
  setTimeout(applyFixes, 500);
  setTimeout(applyFixes, 1500);
  setTimeout(function() { observer.disconnect(); }, 15000);

})();
