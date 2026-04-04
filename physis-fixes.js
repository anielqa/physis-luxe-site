(function() {
  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){.header__logo{--mobile-width:160px!important}.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}}';
  document.head.appendChild(s);

  function fixLogo() {
    var l = document.querySelector('.w-sitelogo');
    var i = document.querySelector('.w-sitelogo img');
    if (l && i) {
      l.style.setProperty('--mobile-width', '160px', 'important');
      i.style.setProperty('width', '160px', 'important');
      clearInterval(t);
    }
  }
  var t = setInterval(fixLogo, 100);
  setTimeout(function() { clearInterval(t); }, 10000);
})();
