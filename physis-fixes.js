(function() {

  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper{background:transparent!important;background-color:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;margin:0 auto!important}'
    + '[class*="logo-wrapper"]{background:transparent!important;background-color:transparent!important;border:none!important}'
    + '.header__logo{background:transparent!important;background-color:transparent!important;display:flex!important;justify-content:center!important;width:100%!important}'
    + '.w-block-header{background-color:transparent!important}'
    + '.w-block-background{background-color:transparent!important}'
    + '.header__flex{justify-content:center!important;width:100%!important}'
    + '.header__content-container{justify-content:center!important;width:100%!important}'
    + '.header__condensed{justify-content:center!important}'
    + '}';
  document.head.appendChild(s);

  function applyFixes() {
    document.querySelectorAll('.header__logo-wrapper, .header__logo, [class*="logo-wrapper"]').forEach(function(el) {
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', 'none', 'important');
      el.style.setProperty('margin', '0 auto', 'important');
    });

    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    if (l) l.style.setProperty('--mobile-width', '160px', 'important');
    if (i) i.style.setProperty('width', '160px', 'important');

    var header = document.querySelector('.header__flex, .header__content-container');
    if (header) header.style.setProperty('justify-content', 'center', 'important');

    var bg = document.querySelector('.w-block-background');
    if (bg) bg.style.setProperty('background-color', 'transparent', 'important');
  }

  var observer = new MutationObserver(function() {
    if (document.querySelector('.header__logo-wrapper')) applyFixes();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', applyFixes);
  setTimeout(applyFixes, 300);
  setTimeout(applyFixes, 800);
  setTimeout(applyFixes, 1500);
  setTimeout(function() { observer.disconnect(); }, 15000);

})();
