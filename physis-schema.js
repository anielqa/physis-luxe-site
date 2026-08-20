/* ============================================================
   physis-schema.js  —  structured data for Square Online
   ------------------------------------------------------------
   Emits a single connected @graph per page:

     Organization   sitewide, one node, referenced by everything
     WebSite        sitewide, publisher -> Organization
     BreadcrumbList every page except the homepage
     Article        /s/stories/ pages only
     Product/Offer  NOT created here — Square already emits it.
                    This file finds Square's block and fills the
                    gaps Google complains about.

   Load AFTER your existing physis-fixes.js, or fold the
   augmentSquareProduct() function into it and delete the
   duplicate there. Do not run two scripts that both mutate
   Square's Product block.

   Square Online → Website → Settings → Custom code → Head:
   <script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/physis-schema.js?v=1" defer></script>
   ============================================================ */

(function () {
  'use strict';

  var VERSION = 2;

  // ── CONFIG ────────────────────────────────────────────────
  var SITE   = 'https://www.physisluxe.com';
  var ORG_ID = SITE + '/#organization';
  var WEB_ID = SITE + '/#website';

  // No site search on physisluxe.com, so no SearchAction. Turn this
  // on and set the template if a search feature is ever added.
  var SEARCH_URL = '';
  var ENABLE_SEARCH_ACTION = false;

  var LOGO = 'https://82fb67f8560b67b04a4a.cdn6.editmysite.com/uploads/b/82fb67f8560b67b04a4a37febad328089a14e6659f4b24e9ac5c2ec6c67ab369/transparent-logo_1775099194.png?width=2400&optimize=medium';

  // No public social profiles yet. Add the URLs here when they exist —
  // sameAs is how Google ties the brand to its profiles.
  var SOCIAL = [];

  // ── SHIPPING & RETURNS ────────────────────────────────────
  // These values surface directly in Google's product results, so
  // they must match https://www.physisluxe.com/shipping-and-returns
  // exactly. Wrong numbers here mislead shoppers and can get the
  // markup flagged. CONFIRM EVERY LINE BEFORE GOING LIVE.
  var POLICY_URL = SITE + '/shipping-and-returns';

  // Square writes the full query string into the Product @id, so
  // /product/x?cs=true&cst=custom declares a different entity than
  // /product/x. That is what produces conflicting product entities
  // in Search Console. When true, @id and offer URLs are rewritten
  // to the canonical, parameter-free address.
  var NORMALIZE_URLS = true;

  var RETURNS = {
    days: 30,                    // 30-day window on unopened and on opened-under-30%
    freeReturn: false,           // customer pays return postage unless the fault is ours
    method: 'ReturnByMail'       // return authorisation required first
  };

  // Standard shipping only. Google surfaces the cheapest option a
  // shopper can get, so the expedited ($12.95) and express ($29.95)
  // tiers are deliberately left out — listing them adds nothing to
  // the result and gives Google more to disagree with.
  var SHIPPING = {
    freeOver: 75,                // free standard shipping over $75
    flatRate: 5.95,              // USPS Ground Advantage below the threshold
    // handlingTime is deliberately omitted — the time between an order
    // being placed and leaving the studio is not documented, and a
    // guess here becomes a delivery estimate Google shows to shoppers.
    // Add handlingDays: [min, max] once it is known.
    transitDays: [5, 7]          // USPS Ground Advantage, 5-7 business days
  };

  // Publish dates for editorial, keyed by the slug in the URL.
  // Square does not expose a reliable machine-readable date, so
  // these are set explicitly. Add a line each time you publish.
  var ARTICLE_DATES = {
    'hpr-vs-retinol-why-one-peels-and-one-doesnt': {
      published: '2026-08-19',
      modified:  '2026-08-19'
    }
  };

  // Path segments to hide from breadcrumbs (Square's routing noise)
  var SKIP_SEGMENTS = ['s', 'shop', 'product'];

  // Pretty names for segments the slug-to-title conversion gets wrong
  var SEGMENT_NAMES = {
    'stories':        'Journal',
    'glow-recovery':  'Glow Recovery',
    'chrono-reset':   'Chrono-Reset',
    'hpr':            'HPR'
  };

  // ── HELPERS ───────────────────────────────────────────────
  var path = location.pathname.replace(/\/+$/, '') || '/';

  function inject(node, tag) {
    var prior = document.querySelector('script[data-physis-schema="' + tag + '"]');
    if (prior) prior.remove();
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-physis-schema', tag);
    s.textContent = JSON.stringify(node);
    document.head.appendChild(s);
  }

  function meta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"]')
          || document.querySelector('meta[name="' + prop + '"]');
    return el ? el.getAttribute('content') : null;
  }

  function titleCase(slug) {
    if (SEGMENT_NAMES[slug]) return SEGMENT_NAMES[slug];
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function currentName() {
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    return (document.title || '').split('|')[0].trim();
  }

  // ── ORGANIZATION ──────────────────────────────────────────
  function organization() {
    var org = {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Physis Luxe',
      url: SITE + '/',
      logo: { '@type': 'ImageObject', '@id': SITE + '/#logo', url: LOGO, caption: 'Physis Luxe' },
      image: { '@id': SITE + '/#logo' },
      description: 'Clean-clinical luxury skincare. Biologically driven, botanically derived, beyond clean.',
      slogan: 'Biologically Driven. Botanically Derived. Beyond Clean.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Brooklyn',
        addressRegion: 'NY',
        addressCountry: 'US'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'customerservice@physisluxe.com',
        availableLanguage: ['English']
      }
    };
    if (SOCIAL.length) org.sameAs = SOCIAL;
    return org;
  }

  // ── WEBSITE ───────────────────────────────────────────────
  function website() {
    var site = {
      '@type': 'WebSite',
      '@id': WEB_ID,
      url: SITE + '/',
      name: 'Physis Luxe',
      publisher: { '@id': ORG_ID },
      inLanguage: 'en-US'
    };
    if (ENABLE_SEARCH_ACTION) {
      site.potentialAction = {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SEARCH_URL },
        'query-input': 'required name=search_term_string'
      };
    }
    return site;
  }

  // ── BREADCRUMBS ───────────────────────────────────────────
  function breadcrumbs() {
    if (path === '/') return null;

    var items = [{
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE + '/'
    }];

    var segs = path.split('/').filter(Boolean);
    var built = '';

    segs.forEach(function (seg) {
      built += '/' + seg;
      if (SKIP_SEGMENTS.indexOf(seg) !== -1) return;
      var isLast = (built === path);
      var entry = {
        '@type': 'ListItem',
        position: items.length + 1,
        name: isLast ? currentName() : titleCase(seg)
      };
      // The final crumb omits `item` — it is the page you are on
      if (!isLast) entry.item = SITE + built;
      items.push(entry);
    });

    if (items.length < 2) return null;

    return {
      '@type': 'BreadcrumbList',
      '@id': SITE + path + '#breadcrumb',
      itemListElement: items
    };
  }

  // ── ARTICLE ───────────────────────────────────────────────
  function article() {
    if (path.indexOf('/s/stories/') === -1) return null;

    var slug  = path.split('/').pop();
    var dates = ARTICLE_DATES[slug] || {};
    var img   = meta('og:image');
    var desc  = meta('og:description') || meta('description');

    var node = {
      '@type': 'Article',
      '@id': SITE + path + '#article',
      isPartOf: { '@id': WEB_ID },
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + path },
      headline: currentName().slice(0, 110),
      url: SITE + path,
      inLanguage: 'en-US',
      publisher: { '@id': ORG_ID },
      // Swap to a Person node once articles carry a named byline —
      // a named author with a bio page is worth more than an org.
      author: { '@id': ORG_ID }
    };

    if (desc) node.description = desc;
    if (img)  node.image = [img];
    if (dates.published) node.datePublished = dates.published;
    if (dates.modified || dates.published) node.dateModified = dates.modified || dates.published;

    return node;
  }

  // ── PRODUCT AUGMENTATION ──────────────────────────────────
  // Square emits its own Product block via JavaScript. Adding a
  // second one is what causes conflicting-value errors in GSC,
  // so this finds Square's and fills in what it leaves out.
  function canonicalUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    if (link && link.href) return link.href.split('?')[0].split('#')[0];
    return location.origin + location.pathname;
  }

  // Square nests it as WebPage -> mainEntity -> Product, and has
  // moved it before. Walk the whole tree rather than assuming a
  // shape, so a future Square change does not silently break this.
  function findNodes(node, type, found) {
    found = found || [];
    if (!node || typeof node !== 'object') return found;

    if (Array.isArray(node)) {
      node.forEach(function (n) { findNodes(n, type, found); });
      return found;
    }

    var t = node['@type'];
    var isMatch = (t === type) || (Array.isArray(t) && t.indexOf(type) !== -1);
    if (isMatch) found.push(node);

    Object.keys(node).forEach(function (k) {
      if (k === '@type') return;
      findNodes(node[k], type, found);
    });
    return found;
  }

  function augmentSquareProduct() {
    var blocks = document.querySelectorAll('script[type="application/ld+json"]:not([data-physis-schema])');
    var done = false;
    var canon = canonicalUrl();

    Array.prototype.forEach.call(blocks, function (block) {
      var data;
      try { data = JSON.parse(block.textContent); } catch (e) { return; }

      var products = findNodes(data, 'Product');
      if (!products.length) return;

      var changed = false;

      // Tie Square's WebPage wrapper into our graph so the whole
      // page is described by one connected set of entities.
      findNodes(data, 'WebPage').forEach(function (wp) {
        if (!wp.isPartOf) { wp.isPartOf = { '@id': WEB_ID }; changed = true; }
        if (!wp['@id'])   { wp['@id'] = canon + '#webpage'; changed = true; }
      });

      products.forEach(function (n) {
        if (!n.brand) {
          n.brand = { '@type': 'Brand', name: 'Physis Luxe' };
          changed = true;
        }

        if (NORMALIZE_URLS) {
          var wanted = canon + '#product';
          if (n['@id'] !== wanted) { n['@id'] = wanted; changed = true; }
          if (n.url && n.url !== canon) { n.url = canon; changed = true; }
        } else if (!n['@id']) {
          n['@id'] = canon + '#product';
          changed = true;
        }

        var offers = n.offers;
        if (!offers) return;

        var list = Array.isArray(offers) ? offers : [offers];
        list.forEach(function (o) {
          if (!o.priceCurrency)  { o.priceCurrency = 'USD'; changed = true; }
          if (!o.availability)   { o.availability = 'https://schema.org/InStock'; changed = true; }
          if (!o.itemCondition)  { o.itemCondition = 'https://schema.org/NewCondition'; changed = true; }
          if (!o.seller)         { o.seller = { '@id': ORG_ID }; changed = true; }

          if (NORMALIZE_URLS) {
            if (o.url !== canon) { o.url = canon; changed = true; }
          } else if (!o.url) {
            o.url = canon; changed = true;
          }

          if (!o.priceValidUntil) {
            var d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            o.priceValidUntil = d.toISOString().slice(0, 10);
            changed = true;
          }

          if (!o.hasMerchantReturnPolicy) {
            o.hasMerchantReturnPolicy = {
              '@type': 'MerchantReturnPolicy',
              '@id': SITE + '/#returnpolicy',
              applicableCountry: 'US',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: RETURNS.days,
              returnMethod: 'https://schema.org/' + RETURNS.method,
              returnFees: RETURNS.freeReturn
                ? 'https://schema.org/FreeReturn'
                : 'https://schema.org/ReturnShippingFees',
              merchantReturnLink: POLICY_URL
            };
            changed = true;
          }

          if (!o.shippingDetails) {
            var rate = { '@type': 'MonetaryAmount', currency: 'USD', value: SHIPPING.flatRate };
            var dest = { '@type': 'DefinedRegion', addressCountry: 'US' };
            var time = {
              '@type': 'ShippingDeliveryTime',
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: SHIPPING.transitDays[0],
                maxValue: SHIPPING.transitDays[1],
                unitCode: 'DAY'
              }
            };
            if (SHIPPING.handlingDays) {
              time.handlingTime = {
                '@type': 'QuantitativeValue',
                minValue: SHIPPING.handlingDays[0],
                maxValue: SHIPPING.handlingDays[1],
                unitCode: 'DAY'
              };
            }

            if (SHIPPING.freeOver !== null) {
              o.shippingDetails = [
                {
                  '@type': 'OfferShippingDetails',
                  shippingRate: {
                    '@type': 'MonetaryAmount',
                    currency: 'USD',
                    value: 0,
                    eligibleTransactionVolume: {
                      '@type': 'PriceSpecification',
                      priceCurrency: 'USD',
                      minPrice: SHIPPING.freeOver
                    }
                  },
                  shippingDestination: dest,
                  deliveryTime: time
                },
                {
                  '@type': 'OfferShippingDetails',
                  shippingRate: rate,
                  shippingDestination: dest,
                  deliveryTime: time
                }
              ];
            } else {
              o.shippingDetails = {
                '@type': 'OfferShippingDetails',
                shippingRate: rate,
                shippingDestination: dest,
                deliveryTime: time
              };
            }
            changed = true;
          }
        });
      });

      if (changed) {
        block.textContent = JSON.stringify(data);
        done = true;
      }
    });

    if (done) window.physisSchema.productAugmented = true;
    return done;
  }

  // ── EMIT ──────────────────────────────────────────────────
  function emitOwnGraph() {
    var graph = [organization(), website()];

    var crumbs = breadcrumbs();
    if (crumbs) graph.push(crumbs);

    var art = article();
    if (art) graph.push(art);

    inject({ '@context': 'https://schema.org', '@graph': graph }, 'graph');
    window.physisSchema.graphInjected = true;
  }

  // Debug handle. In the console, window.physisSchema tells you which
  // version is live and whether the Product augmentation succeeded —
  // useful for confirming a jsDelivr cache bust actually took effect.
  window.physisSchema = {
    version: VERSION,
    graphInjected: false,
    productAugmented: false
  };

  // Our own nodes do not depend on Square, so emit immediately.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', emitOwnGraph);
  } else {
    emitOwnGraph();
  }

  // Square's Product block arrives late and sometimes gets replaced.
  // Watch for it rather than guessing at a timeout.
  var tries = 0;
  var observer = new MutationObserver(function () {
    if (augmentSquareProduct() || ++tries > 60) observer.disconnect();
  });

  function watchForProduct() {
    if (augmentSquareProduct()) return;
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForProduct);
  } else {
    watchForProduct();
  }
})();
