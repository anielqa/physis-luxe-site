(function () {

  var s = document.createElement('style');
  s.innerHTML = '@media(max-width:768px){'
    + '.header__logo{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e]{--mobile-width:160px!important}'
    + '.w-sitelogo[data-v-23d6841e] img{width:160px!important;max-width:160px!important;min-width:160px!important}'
    + '.header__logo-wrapper{background:transparent!important;background-color:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;display:block!important;width:160px!important;margin-left:auto!important;margin-right:auto!important;position:static!important}'
    + '[class*="logo-wrapper"]{background:transparent!important;background-color:transparent!important;border:none!important}'
    + '.header__logo{background:transparent!important;background-color:transparent!important}'
    + '.w-block-background{background-color:transparent!important;background:transparent!important}'
    + '.w-block-header{background-color:transparent!important;background:transparent!important}'
    + '.w-header{background-color:transparent!important;background:transparent!important}'
    + '.w-container.header__content-container{justify-content:center!important;display:flex!important}'
    + '.w-cell.header__flex{display:flex!important;justify-content:center!important;flex:unset!important;width:100%!important}'
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

  // Scoped to header only, stays connected but throttled
  var ticking = false;
  var observer = new MutationObserver(function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        applyFixes();
        ticking = false;
      });
    }
  });

  function startObserver() {
    var header = document.querySelector('.w-header, .w-block-header, header');
    if (header) {
      observer.observe(header, { childList: true, subtree: true, attributes: true });
    } else {
      // Fallback if header not in DOM yet
      observer.observe(document.documentElement, { childList: true, subtree: false });
    }
  }

  // SPA navigation via title watching
  var lastUrl = location.href;
  var titleEl = document.querySelector('title');
  if (titleEl) {
    new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(applyFixes, 150);
        setTimeout(applyFixes, 500);
      }
    }).observe(titleEl, { childList: true });
  }

  window.addEventListener('popstate', function () { setTimeout(applyFixes, 150); });
  window.addEventListener('hashchange', function () { setTimeout(applyFixes, 150); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyFixes();
      startObserver();
    });
  } else {
    applyFixes();
    startObserver();
  }

  // Two fallbacks only — covers Square's late style injection
  setTimeout(applyFixes, 400);
  setTimeout(applyFixes, 1000);

})();


/* =========================================================================
   PHYSIS LUXE — Canonical URL injection
   -------------------------------------------------------------------------
   Square Online emits no <link rel="canonical"> at all. As a result Google
   indexes tracking-parameter variants of the same page as separate URLs
   (?cs=true&cst=custom, ?si=true), splitting impressions across duplicates
   and fragmenting rankings.

   This block injects a self-referencing canonical on every page, normalised
   to https + www with tracking parameters stripped. It re-runs on SPA
   navigation because Square is a Vue app: the URL changes without a page
   reload, and a canonical written once at load would go stale and point
   every subsequent product at whichever page happened to load first.

   Google honours JS-injected canonicals, but at render time rather than
   crawl time — expect several weeks before consolidation shows in GSC.
   ========================================================================= */
(function () {

  var CANONICAL_HOST = 'www.physisluxe.com';

  // Parameters removed from the canonical URL. Square's own share/session
  // params first, then the usual ad and analytics click IDs.
  var STRIP_PARAMS = /^(cs|cst|si|utm_[a-z_]+|fbclid|gclid|gbraid|wbraid|msclkid|ttclid|twclid|igshid|mc_cid|mc_eid|_gl|ref|source)$/i;

  // Paths that should never carry a canonical — transactional pages Google
  // has no business indexing in the first place.
  var SKIP_PATHS = /^\/(cart|checkout|order-confirmation|account|login|search)/i;

  function buildCanonical() {
    var url;
    try {
      url = new URL(window.location.href);
    } catch (e) {
      return null;
    }

    url.protocol = 'https:';
    url.hostname = CANONICAL_HOST;
    url.port = '';
    url.hash = '';

    var kept = new URLSearchParams();
    url.searchParams.forEach(function (value, key) {
      if (!STRIP_PARAMS.test(key)) kept.append(key, value);
    });
    var qs = kept.toString();
    url.search = qs ? '?' + qs : '';

    return url.toString();
  }

  function setCanonical() {
    if (SKIP_PATHS.test(window.location.pathname)) return;

    var href = buildCanonical();
    if (!href) return;

    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setCanonical);
  }
  setCanonical();

  // Square rewrites the URL via the History API on SPA navigation, which
  // fires no event of its own — patch both methods so the canonical follows.
  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function () {
      var result = original.apply(this, arguments);
      setTimeout(setCanonical, 0);
      return result;
    };
  });

  window.addEventListener('popstate', function () { setTimeout(setCanonical, 0); });
  window.addEventListener('hashchange', function () { setTimeout(setCanonical, 0); });

  // Belt-and-braces: catch any late route change the patches above miss.
  setTimeout(setCanonical, 600);
  setTimeout(setCanonical, 1500);

})();


/* =========================================================================
   PHYSIS LUXE — Merchant listing schema augmentation
   -------------------------------------------------------------------------
   Adds brand + hasMerchantReturnPolicy + shippingDetails to Square's
   auto-generated Product JSON-LD to clear the GSC "Improve item appearance"
   warnings. It edits Square's existing block in place (no duplicate schema).

   NOTE: This does NOT create price / image / name. Those are the RED
   "Invalid" items and must be fixed in Square (give each affected product a
   real price and at least one image). This block only handles the yellow
   warnings.
   ========================================================================= */
(function () {

  /* ---- THESE VALUES MIRROR THE LIVE Shipping & Returns PAGE --------------
     Google cross-checks structured data against the policy customers can
     actually read on the site, and suppresses merchant listings when the two
     disagree. Any edit to the Shipping and Returns page must be mirrored
     here in the same session.

     Current site policy (verify before changing):
       Shipping  — $5.95 standard, free over $75
                   1–2 business days handling, 5–7 business days transit
       Returns   — 30-day window, return by mail,
                   return postage paid by the customer
     ---------------------------------------------------------------------- */
  var CONFIG = {
    brand: 'Physis Luxe',
    country: 'US',
    currency: 'USD',

    // SHIPPING — standard rate is declared. The free-over-$75 threshold is
    // deliberately not encoded: expressing a conditional rate needs multiple
    // ShippingRateSettings, and declaring a flat $5.95 understates the offer
    // rather than overstating it, which is the safe direction with Google.
    shipping: {
      rate: 5.95,
      handlingMinDays: 1,
      handlingMaxDays: 2,
      transitMinDays: 5,
      transitMaxDays: 7
    },

    // RETURNS
    returnsAccepted: true,
    returns: {
      days: 30,
      // Return postage is the customer's responsibility per the policy page.
      // ReturnFeesCustomerResponsibility states this without needing a
      // specific amount, unlike ReturnShippingFees.
      fee: 'https://schema.org/ReturnFeesCustomerResponsibility',
      method: 'https://schema.org/ReturnByMail'
    }
  };
  /* ---------------------------------------------------------------------- */

  function isType(node, t) {
    var ty = node && node['@type'];
    return ty === t || (Array.isArray(ty) && ty.indexOf(t) !== -1);
  }

  function buildShipping() {
    return {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: CONFIG.shipping.rate,
        currency: CONFIG.currency
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: CONFIG.country
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: CONFIG.shipping.handlingMinDays,
          maxValue: CONFIG.shipping.handlingMaxDays,
          unitCode: 'DAY'
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: CONFIG.shipping.transitMinDays,
          maxValue: CONFIG.shipping.transitMaxDays,
          unitCode: 'DAY'
        }
      }
    };
  }

  function buildReturns() {
    if (!CONFIG.returnsAccepted) {
      return {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: CONFIG.country,
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
      };
    }
    return {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: CONFIG.country,
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: CONFIG.returns.days,
      returnMethod: CONFIG.returns.method,
      returnFees: CONFIG.returns.fee
    };
  }

  function augmentOffer(offer) {
    if (!offer || typeof offer !== 'object') return false;
    var changed = false;
    if (!offer.shippingDetails) { offer.shippingDetails = buildShipping(); changed = true; }
    if (!offer.hasMerchantReturnPolicy) { offer.hasMerchantReturnPolicy = buildReturns(); changed = true; }
    return changed;
  }

  function augmentProduct(node) {
    if (!isType(node, 'Product')) return false;
    var changed = false;

    if (!node.brand) {
      node.brand = { '@type': 'Brand', name: CONFIG.brand };
      changed = true;
    }

    var offers = node.offers;
    if (Array.isArray(offers)) {
      offers.forEach(function (o) { if (augmentOffer(o)) changed = true; });
    } else if (offers && typeof offers === 'object') {
      if (isType(offers, 'AggregateOffer') && Array.isArray(offers.offers)) {
        offers.offers.forEach(function (o) { if (augmentOffer(o)) changed = true; });
      } else {
        if (augmentOffer(offers)) changed = true;
      }
    }
    return changed;
  }

  // Handles a bare object, an @graph wrapper, or a top-level array of nodes.
  function walk(data) {
    var changed = false;
    if (Array.isArray(data)) {
      data.forEach(function (n) { if (walk(n)) changed = true; });
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data['@graph'])) {
        data['@graph'].forEach(function (n) { if (walk(n)) changed = true; });
      }
      if (augmentProduct(data)) changed = true;
    }
    return changed;
  }

  function run() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (block) {
      var data;
      try {
        data = JSON.parse(block.textContent);
      } catch (e) {
        return; // skip non-JSON / malformed blocks
      }
      if (walk(data)) {
        block.textContent = JSON.stringify(data);
      }
    });
  }

  // Square injects the Product JSON-LD late and replaces it on SPA nav, so
  // run on load, after a couple of settle delays, and on navigation.
  // run() is idempotent: it only re-writes a block when it actually adds a
  // missing field, so repeated calls are cheap.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 600);
  setTimeout(run, 1500);

  var lastUrl = location.href;
  var titleEl = document.querySelector('title');
  if (titleEl) {
    new MutationObserver(function () {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(run, 400);
        setTimeout(run, 1200);
      }
    }).observe(titleEl, { childList: true });
  }
  window.addEventListener('popstate', function () { setTimeout(run, 400); });
  window.addEventListener('hashchange', function () { setTimeout(run, 400); });

})();
