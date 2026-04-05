(function() {

  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper[data-v-fd76376c]{background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;padding:0!important}'
    + '.header__logo-wrapper{background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important}'
    + '}';
  document.head.appendChild(s);

  function fixLogo() {
    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    var w = document.querySelector('.header__logo-wrapper');
    if (l && i) {
      l.style.setProperty('--mobile-width', '160px', 'important');
      i.style.setProperty('width', '160px', 'important');
    }
    if (w) {
      w.style.setProperty('background', 'transparent', 'important');
      w.style.setProperty('border', 'none', 'important');
      w.style.setProperty('border-radius', '0', 'important');
      clearInterval(t);
    }
  }
  var t = setInterval(fixLogo, 100);
  setTimeout(function() { clearInterval(t); }, 10000);

})();
