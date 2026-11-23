/* New Red Monkey Wellness & Spa: site logic (languages, currencies, reservation, scenes) */
(function () {
  'use strict';

  var D = window.RM_DATA, L = window.RM_I18N;
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------------- Language ---------------- */
  var LANGS = ['en', 'ar', 'fr', 'de', 'it'];
  var navLang = (navigator.language || 'en').slice(0, 2);
  var state = {
    lang: LANGS.indexOf(store.get('rm_lang')) >= 0 ? store.get('rm_lang') : (LANGS.indexOf(navLang) >= 0 ? navLang : 'en'),
    cur: D.currencies[store.get('rm_cur')] ? store.get('rm_cur') : 'USD',
    rates: JSON.parse(JSON.stringify(D.fallbackRates))
  };
  function t(k, vars) {
    var s = (L[state.lang] && L[state.lang][k] != null) ? L[state.lang][k] : (L.en[k] != null ? L.en[k] : k);
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, v) { return vars[v] != null ? vars[v] : m; });
    return s;
  }
  function locale() { return state.lang === 'ar' ? 'ar-u-nu-latn' : state.lang; }

  /* ---------------- Currency ---------------- */
  function money(usd) {
    var c = state.cur, v = (Number(usd) || 0) * (state.rates[c] || 1), s;
    if (c === 'TZS') s = 'TSh ' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');
    else s = D.currencies[c].sym + Math.round(v).toLocaleString('en-US');
    return '<bdi>' + s + '</bdi>';
  }
  function moneyText(usd) { return money(usd).replace(/<\/?bdi>/g, ''); }
  function loadRates() {
    fetch('https://open.er-api.com/v6/latest/USD').then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.rates) return;
      ['EUR', 'GBP', 'TZS'].forEach(function (k) { if (j.rates[k]) state.rates[k] = j.rates[k]; });
      if (state.cur !== 'USD') refreshPrices();
    }).catch(function () { /* keep fallback rates */ });
  }

  /* ---------------- Icons ---------------- */
  var P = {
    check: '<path d="M5 12l5 5L20 7"/>', zoom: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    wave: '<path d="M2 12c3-3 6-3 10 0s7 3 10 0"/><path d="M2 17c3-3 6-3 10 0s7 3 10 0"/>',
    bed: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
    fan: '<circle cx="12" cy="12" r="1.5"/><path d="M12 10.5C11 6 13 3 16 4s1 5-4 6.5M13.5 12c4.5-1 7.5 1 6.5 4s-5 1-6.5-4M10.5 12c-4.5 1-7.5-1-6.5-4s5-1 6.5 4"/>',
    safe: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/>',
    pool: '<path d="M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M7 14V5a2 2 0 0 1 4 0M13 14V5a2 2 0 0 1 4 0M7 9h6"/>',
    sun: '<circle cx="12" cy="14" r="4"/><path d="M12 4v3M4.9 7.9 7 10M19.1 7.9 17 10M2 18h20"/>',
    boat: '<path d="M3 15h18l-2.5 4.5a2 2 0 0 1-1.8 1H7.3a2 2 0 0 1-1.8-1Z"/><path d="M12 3v12M12 4l6 9h-6"/>',
    city: '<path d="M3 21h18M5 21V10l4-3v14M9 21V5l6-2v18M15 21V9l4 2v10"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    turtle: '<ellipse cx="12" cy="13" rx="6" ry="4.5"/><path d="M18 12c1.5-.5 3 0 3 1.5S19.5 15 18 14.5M7 16.5 5.5 19M17 16.5 18.5 19M7 9.5 5.5 7M17 9.5 18.5 7M12 8.5v9M8 13h8"/>',
    spice: '<path d="M7 21h10M8 21c-2-3-2-7 0-10h8c2 3 2 7 0 10"/><path d="M12 11V7M10 4c1 1 3 1 4 0"/>',
    mask: '<path d="M3 10a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2a4 4 0 0 1-4 4h-1.5L12 14l-2.5 2H8a4 4 0 0 1-4-4Z"/><path d="M21 9v8a3 3 0 0 1-3 3"/>',
    dolphin: '<path d="M3 15c3-6 8-9 14-8l3-3v5c1 2 1 4 0 6-2-1-4-1-6 0-3 1.5-7 2-11 0Z"/><path d="M10 13c.5 2 0 4-2 6"/>',
    sail: '<path d="M12 3v14M12 3l7 12h-7M12 6 6 15h6"/><path d="M3 18c3 2 6 2 9 0s6-2 9 0"/>',
    plane: '<path d="M2 16l20-6-9 11-2-6Z"/>',
    ferry: '<path d="M4 15h16l-2 5H6Z"/><path d="M6 15V10h12v5M9 10V7h6v3"/><path d="M2 21c3 1 6 1 10 0s7-1 10 0"/>',
    car: '<path d="M3 16v-4l2-5h14l2 5v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M3 12h18"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
    wheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M4.5 15.5l5.3-2.3M19.5 15.5l-5.3-2.3"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5.5 5"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1.5S9 9 12 9Zm0 0c2-4 6-4 6-1.5S15 9 12 9Z"/>'
  };
  function ico(n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24">' + (P[n] || '') + '</svg>'; }

  /* ---------------- Gallery / captions ---------------- */
  var CAP = { 1: 'hotel', 2: 'terrace', 3: 'hotel', 4: 'garden', 5: 'garden', 6: 'garden', 7: 'pool', 9: 'pool', 10: 'swim', 11: 'loungers', 12: 'poolview', 13: 'loungers', 15: 'loungers', 16: 'balcony', 17: 'room', 19: 'room', 20: 'bed', 21: 'room', 22: 'room', 23: 'room', 24: 'wardrobe', 25: 'bath', 27: 'details', 28: 'details', 30: 'family', 31: 'twin', 32: 'family', 33: 'family', 34: 'family', 35: 'twin' };
  function cap(n) { return t('cap.' + (CAP[n] || 'hotel')); }
  var CAT = { hotel: [1, 2, 3, 4, 5, 6, 10], pool: [7, 9, 11, 12, 15] };
  var GALLERY = [3, 21, 12, 20, 1, 16, 9, 28, 4, 33, 11, 22, 2, 25, 7, 35, 15, 17, 5, 27, 10, 31, 6, 24, 19, 30, 23, 32, 34];
  function big(n) { return 'img/h' + pad2(n) + '.jpg'; }
  function med(n) { return 'img/m/h' + pad2(n) + '.jpg'; }
  function catOf(n) { return CAT.hotel.indexOf(n) >= 0 ? 'hotel' : CAT.pool.indexOf(n) >= 0 ? 'pool' : 'rooms'; }

  /* ---------------- Trip (reservation state) ---------------- */
  var trip;
  try { trip = JSON.parse(store.get('rm_trip') || 'null'); } catch (e) { trip = null; }
  if (!trip || typeof trip !== 'object') trip = {};
  trip = Object.assign({ checkin: '', checkout: '', adults: 2, children: 0, rooms: 1, room: 'ocean', program: null, ex: {}, tr: {}, name: '', email: '', phone: '', country: '', notes: '' }, trip);
  function saveTrip() { store.set('rm_trip', JSON.stringify(trip)); updateTripCount(); }
  function iso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(s, n) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); }
  function todayIso() { return iso(new Date()); }
  if (trip.checkin && trip.checkin < todayIso()) { trip.checkin = ''; trip.checkout = ''; }
  function nights() {
    if (!trip.checkin || !trip.checkout) return 0;
    return Math.max(0, Math.round((new Date(trip.checkout + 'T12:00:00') - new Date(trip.checkin + 'T12:00:00')) / 864e5));
  }
  function prog() { return D.programs.filter(function (p) { return p.id === trip.program; })[0] || null; }
  function exById(id) { return D.excursions.filter(function (x) { return x.id === id; })[0]; }
  function trById(id) { return D.transport.filter(function (x) { return x.id === id; })[0]; }
  function tripItems() { return (trip.program ? 1 : 0) + Object.keys(trip.ex).length + Object.keys(trip.tr).length; }
  function estimate() {
    var p = prog(), n = nights(), total = 0, lines = [];
    if (p) { total += p.price * trip.adults; lines.push({ k: t(p.name) + ' × ' + trip.adults, v: p.price * trip.adults }); }
    else if (n) { var r = D.rooms[trip.room]; total += r.rate * n * trip.rooms; lines.push({ k: t(r.name) + ' × ' + n, v: r.rate * n * trip.rooms }); }
    Object.keys(trip.ex).forEach(function (id) { var x = exById(id); if (x) { total += x.price * trip.ex[id]; lines.push({ k: t('ex.' + id) + ' × ' + trip.ex[id], v: x.price * trip.ex[id] }); } });
    Object.keys(trip.tr).forEach(function (id) { var x = trById(id); if (x) { total += x.price * trip.tr[id]; lines.push({ k: t('tr.' + id) + ' × ' + trip.tr[id], v: x.price * trip.tr[id] }); } });
    return { total: total, lines: lines };
  }
  function fmtDate(s) { return s ? new Date(s + 'T12:00:00').toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function updateTripCount() {
    var n = tripItems(), b = $('#tripBtn');
    $('#tripCount').textContent = n;
    b.classList.toggle('has', n > 0);
  }

  /* ---------------- Apply language to static markup ---------------- */
  function splitHeading(el) {
    var idx = 0, out = document.createDocumentFragment();
    function addWord(w, em) {
      var ln = document.createElement('span'); ln.className = 'ln';
      var inner = document.createElement('span'); inner.style.setProperty('--l', idx++);
      if (em) { var e = document.createElement('em'); e.textContent = w; inner.appendChild(e); } else inner.textContent = w;
      ln.appendChild(inner); out.appendChild(ln); out.appendChild(document.createTextNode(' '));
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      (n.textContent || '').split(/\s+/).filter(Boolean).forEach(function (w) { addWord(w, n.nodeType === 1 && n.tagName === 'EM'); });
    });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.innerHTML = ''; el.appendChild(out);
  }
  function applyLang() {
    var dict = L[state.lang];
    doc.lang = state.lang; doc.dir = dict._dir;
    $$('[data-t]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-t')); });
    $$('[data-ta]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-ta'))); });
    $$('.split').forEach(splitHeading);
    $('#langCode').textContent = state.lang.toUpperCase();
    var keys = ['pool', 'hammam', 'sauna', 'massage', 'yoga', 'gym', 'wifi', 'diving', 'kite', 'shuttle'];
    var one = keys.map(function (k) { return '<span>' + esc(t('tk.' + k)) + '</span><i></i>'; }).join('');
    $('#ticker').innerHTML = one + one;
    renderMenus();
    renderRoom(roomKey, false);
    renderOffers();
    renderCatalog();
    renderGallery();
    if (bkOpen) renderBooking();
    dayIdx = -1; if (day) onScroll();
    setTimeout(movePill, 30);
    observe();
  }
  function refreshPrices() {
    $('#curCode').textContent = state.cur;
    renderMenus();
    renderRoom(roomKey, false);
    renderOffers();
    renderCatalog();
    if (bkOpen) renderBooking();
  }

  /* ---------------- Language / currency menus ---------------- */
  function renderMenus() {
    $('#langMenu').innerHTML = LANGS.map(function (k) { return '<button type="button" role="option" class="opt" aria-selected="' + (k === state.lang) + '" data-lang="' + k + '"><span>' + L[k]._name + '</span><small>' + k.toUpperCase() + '</small></button>'; }).join('');
    $('#curMenu').innerHTML = Object.keys(D.currencies).map(function (k) { return '<button type="button" role="option" class="opt" aria-selected="' + (k === state.cur) + '" data-cur="' + k + '"><span>' + k + ' · ' + D.currencies[k].name + '</span><small>' + D.currencies[k].sym + '</small></button>'; }).join('');
    $('#menuTools').innerHTML = '<div class="mt-row">' + LANGS.map(function (k) { return '<button type="button" class="mt-chip' + (k === state.lang ? ' on' : '') + '" data-lang="' + k + '">' + L[k]._name + '</button>'; }).join('') + '</div>' +
      '<div class="mt-row">' + Object.keys(D.currencies).map(function (k) { return '<button type="button" class="mt-chip' + (k === state.cur ? ' on' : '') + '" data-cur="' + k + '">' + k + '</button>'; }).join('') + '</div>';
  }
  function closeDD(except) { $$('.dd.open').forEach(function (d) { if (d !== except) { d.classList.remove('open'); $('.dd-btn', d).setAttribute('aria-expanded', 'false'); } }); }
  $$('.dd-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var dd = b.parentElement, on = !dd.classList.contains('open');
      closeDD(dd); dd.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (!e.target.closest('.dd')) closeDD(null);
    var l = e.target.closest('[data-lang]');
    if (l) { state.lang = l.getAttribute('data-lang'); store.set('rm_lang', state.lang); closeDD(null); applyLang(); return; }
    var c = e.target.closest('[data-cur]');
    if (c) { state.cur = c.getAttribute('data-cur'); store.set('rm_cur', state.cur); closeDD(null); refreshPrices(); return; }
    var bkb = e.target.closest('[data-book]');
    if (bkb) { e.preventDefault(); if (document.body.classList.contains('menu-open')) setMenu(false); openBooking(0); return; }
    var el;
    if ((el = e.target.closest('[data-book-room]'))) { trip.room = el.getAttribute('data-book-room'); trip.program = null; saveTrip(); openBooking(0); }
    else if ((el = e.target.closest('[data-book-program]'))) { selectProgram(el.getAttribute('data-book-program')); openBooking(0); }
    else if ((el = e.target.closest('#catGrid [data-add]'))) { toggleAdd(el.getAttribute('data-add')); renderCatalog(); }
  });

  /* ---------------- Intro + hero ---------------- */
  var hero = $('.hero'), intro = $('#intro');
  var slides = $$('.slide'), cur = 0, slideTimer = null, bar = $('#slideBar'), num = $('#slideNum'), t0 = Date.now();
  function startIntroOut() {
    var wait = Math.max(0, (reduce ? 300 : 2300) - (Date.now() - t0));
    setTimeout(function () {
      intro.classList.add('out');
      document.body.classList.remove('loading');
      setTimeout(function () { hero.classList.add('ready'); runSlides(); }, 350);
      setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 1800);
    }, wait);
  }
  var firstImg = $('.slide.on img');
  var imgReady = new Promise(function (res) {
    if (firstImg.complete && firstImg.naturalWidth) return res();
    firstImg.addEventListener('load', res, { once: true }); firstImg.addEventListener('error', res, { once: true });
  });
  Promise.race([imgReady, new Promise(function (r) { setTimeout(r, 4000); })]).then(startIntroOut);
  function restartBar() { bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); }
  function goSlide(i) {
    var prev = cur; cur = (i + slides.length) % slides.length;
    if (prev === cur) return;
    slides.forEach(function (s, j) { s.classList.remove('out'); s.classList.toggle('on', j === cur); });
    slides[prev].classList.add('out');
    setTimeout(function () { slides[prev].classList.remove('out'); }, 2300);
    num.textContent = pad2(cur + 1); restartBar();
  }
  function runSlides() {
    if (reduce || slides.length < 2) return;
    restartBar(); clearInterval(slideTimer);
    slideTimer = setInterval(function () { goSlide(cur + 1); }, 7000);
  }
  setTimeout(function () { slides.forEach(function (s) { s.querySelector('img').loading = 'eager'; }); }, 1500);

  /* ---------------- Rooms ---------------- */
  var roomImgs = $('#roomImgs'), roomThumbs = $('#roomThumbs'), roomInfo = $('#roomInfo');
  var roomKey = 'ocean', photoIdx = 0, roomTimer = null;
  function renderRoom(key, animate) {
    var keepPhoto = key === roomKey && !animate && roomImgs.children.length;
    roomKey = key; if (!keepPhoto) photoIdx = 0;
    var r = D.rooms[key];
    if (!keepPhoto) {
      roomImgs.innerHTML = r.imgs.map(function (n, j) { return '<img src="' + big(n) + '" alt="' + esc(cap(n)) + '"' + (j === photoIdx ? ' class="on"' : ' loading="lazy"') + '>'; }).join('');
      roomThumbs.innerHTML = r.imgs.map(function (n, j) { return '<button type="button" aria-label="' + (j + 1) + '"' + (j === photoIdx ? ' class="on"' : '') + '><img src="' + med(n) + '" alt="" loading="lazy"></button>'; }).join('');
      $$('button', roomThumbs).forEach(function (b, j) { b.addEventListener('click', function () { showPhoto(j); autoRoom(); }); });
      $$('img', roomImgs).forEach(function (im) { im.addEventListener('click', function () { openLB(D.rooms[roomKey].imgs, photoIdx); }); });
    }
    var html = '<span class="ri-count">' + esc(t(r.count)) + ' &middot; ' + esc(t('room.oceanfront')) + '</span><h3>' + esc(t(r.name)) + '</h3><p>' + esc(t(r.text)) + '</p>' +
      '<ul class="room-feats">' + r.feats.map(function (f) { return '<li>' + ico(f[0]) + esc(t(f[1])) + '</li>'; }).join('') + '</ul>' +
      '<div class="ri-foot"><span class="ri-price">' + t('room.from', { p: money(r.rate) }) + '</span>' +
      '<button type="button" class="btn btn-coral" data-book-room="' + key + '"><span>' + esc(t('room.book')) + '</span>' + ico('arrow', 'flip') + '</button></div>';
    if (animate) {
      roomInfo.classList.add('swap');
      setTimeout(function () { roomInfo.innerHTML = html; requestAnimationFrame(function () { roomInfo.classList.remove('swap'); }); }, 350);
    } else roomInfo.innerHTML = html;
  }
  function showPhoto(j) {
    var imgs = $$('img', roomImgs), th = $$('button', roomThumbs);
    photoIdx = (j + imgs.length) % imgs.length;
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === photoIdx); });
    th.forEach(function (b, k) { b.classList.toggle('on', k === photoIdx); });
  }
  function autoRoom() { clearInterval(roomTimer); if (!reduce) roomTimer = setInterval(function () { showPhoto(photoIdx + 1); }, 5000); }
  var tabs = $$('.room-tab'), pill = $('.room-tab-pill');
  function movePill() {
    var tb = $('.room-tab.on'); if (!tb) return;
    pill.style.width = tb.offsetWidth + 'px';
    pill.style.left = tb.offsetLeft + 'px';
  }
  tabs.forEach(function (tb) {
    tb.addEventListener('click', function () {
      var k = tb.getAttribute('data-room'); if (k === roomKey) return;
      tabs.forEach(function (x) { x.classList.toggle('on', x === tb); x.setAttribute('aria-selected', String(x === tb)); });
      renderRoom(k, true); movePill(); autoRoom();
    });
  });
  $('#roomPrev').addEventListener('click', function () { showPhoto(photoIdx - 1); autoRoom(); });
  $('#roomNext').addEventListener('click', function () { showPhoto(photoIdx + 1); autoRoom(); });
  window.addEventListener('load', movePill); window.addEventListener('resize', movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  /* ---------------- Offers ---------------- */
  function renderOffers() {
    $('#offerGrid').innerHTML = D.programs.map(function (p, i) {
      var save = Math.round((1 - p.price / p.was) * 100);
      return '<article class="offer' + (i === 0 ? ' feature' : '') + '">' +
        '<div class="of-img"><img src="' + med(p.img) + '" alt="" loading="lazy"><span class="of-save">' + esc(t('off.save', { p: save })) + '</span><span class="of-nights">' + ico('cal') + esc(t('off.nights', { n: p.nights })) + '</span></div>' +
        '<div class="of-body"><h3>' + esc(t(p.name)) + '</h3><p>' + esc(t(p.desc)) + '</p>' +
        '<ul>' + p.incl.map(function (k) { return '<li>' + ico('check') + esc(t(k)) + '</li>'; }).join('') + '</ul>' +
        '<div class="of-foot"><div class="of-price"><small>' + esc(t('off.from')) + '</small><span class="of-nums"><s>' + money(p.was) + '</s><b>' + money(p.price) + '</b></span><small>' + esc(t('off.pp')) + '</small></div>' +
        '<button type="button" class="btn btn-coral" data-book-program="' + p.id + '"><span>' + esc(t('off.book')) + '</span>' + ico('arrow', 'flip') + '</button></div></div></article>';
    }).join('');
  }

  /* ---------------- Catalog ---------------- */
  var catMode = 'ex';
  function renderCatalog() {
    var list = catMode === 'ex' ? D.excursions : D.transport, pre = catMode;
    $('#catGrid').innerHTML = list.map(function (x) {
      var added = catMode === 'ex' ? trip.ex[x.id] != null : trip.tr[x.id] != null;
      var price = x.price === 0 ? '<b class="free">' + esc(t('cat.free')) + '</b>' : '<b>' + money(x.price) + '</b><small>' + esc(t(catMode === 'ex' ? 'cat.pp' : 'cat.veh')) + '</small>';
      return '<article class="cat-card spot' + (added ? ' added' : '') + '">' +
        '<div class="cc-top"><span class="cc-ico">' + ico(x.icon) + '</span><span class="cc-time">' + esc(t(x.time)) + '</span></div>' +
        '<h4>' + esc(t(pre + '.' + x.id)) + '</h4><p>' + esc(t(pre + '.' + x.id + 'D')) + '</p>' +
        '<div class="cc-foot"><span class="cc-price">' + price + '</span>' +
        '<button type="button" class="cc-add" data-add="' + catMode + ':' + x.id + '" aria-pressed="' + added + '">' + ico(added ? 'check' : 'plus') + '<span>' + esc(t(added ? 'cat.added' : 'cat.add')) + '</span></button></div></article>';
    }).join('');
    bindSpots($('#catGrid'));
  }
  $$('.cat-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      catMode = b.getAttribute('data-cat');
      $$('.cat-tab').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      var g = $('#catGrid'); g.classList.add('fade');
      setTimeout(function () { renderCatalog(); g.classList.remove('fade'); }, 220);
    });
  });
  function toggleAdd(spec) {
    var p = spec.split(':'), bag = p[0] === 'ex' ? trip.ex : trip.tr;
    if (bag[p[1]] != null) delete bag[p[1]]; else bag[p[1]] = p[0] === 'ex' ? trip.adults : 1;
    saveTrip();
    var btn = $('#tripBtn'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  }

  /* ---------------- Gallery ---------------- */
  var galFilter = 'all';
  function renderGallery() {
    $('#masonry').innerHTML = GALLERY.map(function (n, i) {
      var hide = galFilter !== 'all' && catOf(n) !== galFilter;
      return '<figure class="tile rv in' + (i % 5 === 1 || i % 7 === 4 ? ' tall' : '') + (hide ? ' hidden' : '') + '" data-cat="' + catOf(n) + '" data-n="' + n + '"><img src="' + med(n) + '" alt="' + esc(cap(n)) + '" loading="lazy" width="1100" height="733"><span class="zoom">' + ico('zoom') + '</span></figure>';
    }).join('');
  }
  $$('.filter').forEach(function (f) {
    f.addEventListener('click', function () {
      galFilter = f.getAttribute('data-f');
      $$('.filter').forEach(function (x) { x.classList.toggle('on', x === f); });
      $$('.tile').forEach(function (tl) {
        var show = galFilter === 'all' || tl.getAttribute('data-cat') === galFilter;
        tl.classList.toggle('hidden', !show);
        if (show) { tl.classList.remove('in'); void tl.offsetWidth; tl.classList.add('in'); }
      });
    });
  });
  $('#masonry').addEventListener('click', function (e) {
    var tl = e.target.closest('.tile'); if (!tl) return;
    var list = $$('.tile:not(.hidden)').map(function (x) { return +x.getAttribute('data-n'); });
    openLB(list, list.indexOf(+tl.getAttribute('data-n')));
  });

  /* ---------------- Lightbox ---------------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbList = [], lbI = 0, lastFocus = null;
  function lbShow(i) {
    lbI = (i + lbList.length) % lbList.length;
    var n = lbList[lbI]; lbImg.classList.remove('show');
    var pre = new Image();
    pre.onload = pre.onerror = function () { lbImg.src = big(n); lbImg.alt = cap(n); lbCap.textContent = cap(n) + '  ·  ' + (lbI + 1) + ' / ' + lbList.length; requestAnimationFrame(function () { lbImg.classList.add('show'); }); };
    pre.src = big(n);
  }
  function openLB(list, i) { lbList = list; lastFocus = document.activeElement; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lbShow(i); $('#lbClose').focus(); }
  function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', function () { lbShow(lbI - 1); });
  $('#lbNext').addEventListener('click', function () { lbShow(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1)); });

  /* ---------------- Reservation wizard ---------------- */
  var bk = $('#booking'), bkMain = $('#bkMain'), bkAside = $('#bkAside'), bkStep = 0, bkOpen = false, bkDone = null, bkErr = '';
  var STEPS = ['bk.s1', 'bk.s2', 'bk.s3', 'bk.s4'];
  function openBooking(step) {
    bkOpen = true; bkDone = null; bkErr = ''; bkStep = step || 0;
    if (!trip.checkin) { trip.checkin = addDays(todayIso(), 14); trip.checkout = addDays(trip.checkin, prog() ? prog().nights : 4); saveTrip(); }
    renderBooking();
    bk.classList.add('open'); bk.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var f = $('#bkClose'); if (f) f.focus(); }, 50);
  }
  function closeBooking() {
    bkOpen = false; bk.classList.remove('open'); bk.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    renderCatalog();
  }
  $('#bkClose').addEventListener('click', closeBooking);
  $('#tripBtn').addEventListener('click', function () { openBooking(tripItems() ? 1 : 0); });

  function stepper(k, val, min, max) {
    return '<div class="stepper" data-k="' + k + '"><button type="button" data-step="-1" aria-label="-"' + (val <= min ? ' disabled' : '') + '>' + ico('minus') + '</button><b>' + val + '</b><button type="button" data-step="1" aria-label="+"' + (val >= max ? ' disabled' : '') + '>' + ico('plus') + '</button></div>';
  }
  function validStay() { return trip.checkin && trip.checkout && nights() > 0; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validDetails() { return trip.name.trim().length > 1 && validEmail(trip.email.trim()); }

  function renderSteps() {
    $('#bkSteps').innerHTML = STEPS.map(function (k, i) {
      var cls = bkDone ? 'done' : (i === bkStep ? 'on' : (i < bkStep ? 'done' : ''));
      return '<li class="' + cls + '"><button type="button" data-goto="' + i + '"' + (bkDone ? ' disabled' : '') + '><span>' + (cls === 'done' ? ico('check') : (i + 1)) + '</span><em>' + esc(t(k)) + '</em></button></li>';
    }).join('');
  }
  function stepStay() {
    var p = prog(), n = nights();
    var rooms = Object.keys(D.rooms).map(function (k) {
      var r = D.rooms[k], on = trip.room === k, locked = p && p.room !== k;
      return '<button type="button" class="pick-room' + (on ? ' on' : '') + '" data-room-pick="' + k + '"' + (locked ? ' disabled' : '') + '><img src="' + med(r.imgs[0]) + '" alt=""><span class="pr-body"><b>' + esc(t(r.name)) + '</b><small>' + esc(t(r.count)) + '</small><em>' + money(r.rate) + ' <small>' + esc(t('bk.perNight')) + '</small></em></span><span class="pr-check">' + ico('check') + '</span></button>';
    }).join('');
    var progs = '<button type="button" class="pick-prog' + (!p ? ' on' : '') + '" data-prog-pick=""><span class="pp-ico">' + ico('bed') + '</span><span class="pp-txt"><b>' + esc(t('bk.noProgram')) + '</b></span></button>' +
      D.programs.map(function (x) {
        return '<button type="button" class="pick-prog' + (p && p.id === x.id ? ' on' : '') + '" data-prog-pick="' + x.id + '"><span class="pp-ico">' + ico('gift') + '</span><span class="pp-txt"><b>' + esc(t(x.name)) + '</b><small>' + esc(t('off.nights', { n: x.nights })) + ' · ' + money(x.price) + ' ' + esc(t('off.pp')) + '</small></span></button>';
      }).join('');
    return '<div class="bk-sec"><h3>' + ico('cal') + esc(t('bk.stayLbl')) + '</h3>' +
      '<div class="f2"><label class="fl light"><span>' + esc(t('bk.checkin')) + '</span><input type="date" id="bkIn" min="' + todayIso() + '" value="' + trip.checkin + '"></label>' +
      '<label class="fl light"><span>' + esc(t('bk.checkout')) + '</span><input type="date" id="bkOut" min="' + (trip.checkin ? addDays(trip.checkin, 1) : todayIso()) + '" value="' + trip.checkout + '"' + (p ? ' disabled' : '') + '></label></div>' +
      '<p class="bk-note">' + (n ? esc(n === 1 ? t('bk.night') : t('bk.nights', { n: n })) : esc(t('bk.selectDates'))) + (p ? ' · ' + esc(t('bk.programNote', { n: p.nights })) : '') + '</p></div>' +
      '<div class="bk-sec"><h3>' + ico('users') + esc(t('bk.persons')) + '</h3><div class="steppers">' +
      '<div><span>' + esc(t('bk.adults')) + '</span>' + stepper('adults', trip.adults, 1, 12) + '</div>' +
      '<div><span>' + esc(t('bk.children')) + '</span>' + stepper('children', trip.children, 0, 8) + '</div>' +
      '<div><span>' + esc(t('bk.rooms')) + '</span>' + stepper('rooms', trip.rooms, 1, 6) + '</div></div></div>' +
      '<div class="bk-sec"><h3>' + ico('bed') + esc(t('bk.room')) + '</h3><div class="pick-rooms">' + rooms + '</div></div>' +
      '<div class="bk-sec"><h3>' + ico('gift') + esc(t('bk.program')) + '</h3><div class="pick-progs">' + progs + '</div></div>';
  }
  function stepExtras() {
    function rows(list, kind) {
      return list.map(function (x) {
        var bag = kind === 'ex' ? trip.ex : trip.tr, on = bag[x.id] != null;
        var price = x.price === 0 ? esc(t('bk.free')) : money(x.price) + ' ' + esc(t(kind === 'ex' ? 'cat.pp' : 'cat.veh'));
        return '<div class="xrow' + (on ? ' on' : '') + '"><button type="button" class="xtoggle" data-add="' + kind + ':' + x.id + '" aria-pressed="' + on + '"><span class="xbox">' + ico('check') + '</span><span class="xic">' + ico(x.icon) + '</span><span class="xtxt"><b>' + esc(t(kind + '.' + x.id)) + '</b><small>' + esc(t(x.time)) + ' · ' + price + '</small></span></button>' +
          (on ? '<div class="xqty"><span>' + esc(t(kind === 'ex' ? 'bk.persons' : 'bk.qty')) + '</span>' + stepper(kind + ':' + x.id, bag[x.id], 1, 20) + '</div>' : '') + '</div>';
      }).join('');
    }
    return '<div class="bk-sec"><h3>' + ico('boat') + esc(t('bk.ex')) + '</h3><div class="xlist">' + rows(D.excursions, 'ex') + '</div></div>' +
      '<div class="bk-sec"><h3>' + ico('car') + esc(t('bk.tr')) + '</h3><div class="xlist">' + rows(D.transport, 'tr') + '</div></div>';
  }
  function stepDetails() {
    function fld(k, type, ac, full) {
      return '<label class="fl light' + (full ? ' full' : '') + '"><span>' + esc(t('bk.' + k)) + '</span>' + (type === 'textarea' ? '<textarea data-f="' + k + '" rows="3">' + esc(trip[k]) + '</textarea>' : '<input type="' + type + '" data-f="' + k + '" value="' + esc(trip[k]) + '"' + (ac ? ' autocomplete="' + ac + '"' : '') + '>') + '</label>';
    }
    return '<div class="bk-sec"><h3>' + ico('users') + esc(t('bk.s3')) + '</h3><div class="fgrid">' +
      fld('name', 'text', 'name', true) + fld('email', 'email', 'email') + fld('phone', 'tel', 'tel') + fld('country', 'text', 'country-name', true) + fld('notes', 'textarea', '', true) + '</div></div>';
  }
  function summaryHtml(full) {
    var p = prog(), n = nights(), r = D.rooms[trip.room], e = estimate();
    var guests = trip.children ? t('bk.guestsC', { a: trip.adults, c: trip.children }) : t('bk.guests', { a: trip.adults });
    var extras = Object.keys(trip.ex).map(function (id) { return '<li><span>' + esc(t('ex.' + id)) + ' <small>× ' + trip.ex[id] + '</small></span><b>' + money(exById(id).price * trip.ex[id]) + '</b></li>'; })
      .concat(Object.keys(trip.tr).map(function (id) { var x = trById(id); return '<li><span>' + esc(t('tr.' + id)) + ' <small>× ' + trip.tr[id] + '</small></span><b>' + (x.price ? money(x.price * trip.tr[id]) : esc(t('bk.free'))) + '</b></li>'; })).join('');
    return '<div class="sum-img"><img src="' + med(p ? p.img : r.imgs[0]) + '" alt=""><span>' + esc(t('bk.sum')) + '</span></div>' +
      '<div class="sum-body">' +
      '<div class="sum-row">' + ico('cal') + '<div><b>' + (n ? esc(fmtDate(trip.checkin)) + ' – ' + esc(fmtDate(trip.checkout)) : esc(t('bk.selectDates'))) + '</b><small>' + (n ? esc(n === 1 ? t('bk.night') : t('bk.nights', { n: n })) + ' · ' : '') + esc(guests) + ' · ' + esc(trip.rooms === 1 ? t('bk.room1') : t('bk.roomsN', { n: trip.rooms })) + '</small></div></div>' +
      '<div class="sum-row">' + ico('bed') + '<div><b>' + esc(t(r.name)) + '</b><small>' + (p ? esc(t('room.oceanfront')) : money(r.rate) + ' ' + esc(t('bk.perNight'))) + '</small></div></div>' +
      (p ? '<div class="sum-row">' + ico('gift') + '<div><b>' + esc(t(p.name)) + '</b><small>' + money(p.price) + ' ' + esc(t('off.pp')) + '</small></div></div>' : '') +
      '<div class="sum-extras"><h4>' + esc(t('bk.extrasLbl')) + '</h4>' + (extras ? '<ul>' + extras + '</ul>' : '<p>' + esc(t('bk.empty')) + '</p>') + '</div>' +
      (full ? '<div class="sum-lines">' + e.lines.map(function (l) { return '<div><span>' + esc(l.k) + '</span><b>' + money(l.v) + '</b></div>'; }).join('') + '</div>' : '') +
      '<div class="sum-total"><span>' + esc(t('bk.total')) + '</span><b>' + money(e.total) + '</b></div>' +
      '<p class="sum-note">' + esc(t('bk.est', { c: state.cur })) + '</p></div>';
  }
  function stepReview() {
    var details = '<div class="rv-details"><div><small>' + esc(t('bk.name')) + '</small><b>' + esc(trip.name) + '</b></div><div><small>' + esc(t('bk.email')) + '</small><b>' + esc(trip.email) + '</b></div>' +
      (trip.phone ? '<div><small>' + esc(t('bk.phone')) + '</small><b dir="ltr">' + esc(trip.phone) + '</b></div>' : '') + (trip.country ? '<div><small>' + esc(t('bk.country')) + '</small><b>' + esc(trip.country) + '</b></div>' : '') +
      (trip.notes ? '<div class="full"><small>' + esc(t('bk.notes')) + '</small><b>' + esc(trip.notes) + '</b></div>' : '') + '</div>';
    return '<div class="bk-sec review"><div class="review-card">' + summaryHtml(true) + '</div>' + details + '</div>';
  }
  function doneHtml() {
    return '<div class="bk-done"><span class="done-ic">' + ico('check') + '</span><h3>' + esc(t('bk.done')) + '</h3><p>' + esc(t('bk.doneP', { r: bkDone })).replace(bkDone, '<b dir="ltr">' + bkDone + '</b>') + '</p>' +
      '<button type="button" class="btn btn-coral" data-close-bk><span>' + esc(t('bk.close')) + '</span></button></div>';
  }
  function renderBooking() {
    renderSteps();
    if (bkDone) { bkMain.innerHTML = doneHtml(); bkAside.innerHTML = summaryHtml(false); bk.classList.add('is-done'); return; }
    bk.classList.remove('is-done');
    var body = [stepStay, stepExtras, stepDetails, stepReview][bkStep]();
    var navHtml = '<div class="bk-nav">' + (bkErr ? '<p class="bk-err" role="alert">' + esc(bkErr) + '</p>' : '') +
      (bkStep > 0 ? '<button type="button" class="btn btn-ghost" data-nav="-1">' + ico('back', 'flip') + '<span>' + esc(t('bk.back')) + '</span></button>' : '<span></span>') +
      (bkStep < 3 ? '<button type="button" class="btn btn-coral" data-nav="1"><span>' + esc(t('bk.next')) + '</span>' + ico('arrow', 'flip') + '</button>'
        : '<button type="button" class="btn btn-coral" data-send>' + ico('check') + '<span>' + esc(t('bk.send')) + '</span></button>') + '</div>';
    bkMain.innerHTML = '<div class="bk-step">' + body + '</div>' + navHtml;
    bkAside.innerHTML = summaryHtml(false);
  }
  function goStep(n) {
    if (n > bkStep) {
      if (bkStep <= 0 && n >= 1 && !validStay()) { bkErr = t('bk.errDates'); renderBooking(); return; }
      if (n >= 3 && !validDetails()) { bkStep = 2; bkErr = t('bk.errDetails'); renderBooking(); return; }
    }
    bkErr = ''; bkStep = clamp(n, 0, 3); renderBooking();
    var pnl = $('.bk-body'); if (pnl) pnl.scrollTop = 0;
  }
  function selectProgram(id) {
    trip.program = id || null;
    var p = prog();
    if (p) { trip.room = p.room; if (!trip.checkin) trip.checkin = addDays(todayIso(), 14); trip.checkout = addDays(trip.checkin, p.nights); }
    saveTrip();
  }
  bk.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-close-bk]'))) { closeBooking(); return; }
    if ((el = e.target.closest('[data-goto]'))) { goStep(+el.getAttribute('data-goto')); return; }
    if ((el = e.target.closest('[data-nav]'))) { goStep(bkStep + +el.getAttribute('data-nav')); return; }
    if ((el = e.target.closest('[data-room-pick]'))) { trip.room = el.getAttribute('data-room-pick'); saveTrip(); renderBooking(); return; }
    if ((el = e.target.closest('[data-prog-pick]'))) { selectProgram(el.getAttribute('data-prog-pick')); renderBooking(); return; }
    if ((el = e.target.closest('[data-step]'))) {
      var s = el.closest('.stepper'), k = s.getAttribute('data-k'), d = +el.getAttribute('data-step');
      if (k.indexOf(':') > 0) { var p = k.split(':'), bag = p[0] === 'ex' ? trip.ex : trip.tr; bag[p[1]] = clamp(bag[p[1]] + d, 1, 20); }
      else { var lim = { adults: [1, 12], children: [0, 8], rooms: [1, 6] }[k]; trip[k] = clamp(trip[k] + d, lim[0], lim[1]); }
      saveTrip(); renderBooking(); return;
    }
    if ((el = e.target.closest('[data-add]'))) { toggleAdd(el.getAttribute('data-add')); renderBooking(); return; }
    if ((el = e.target.closest('[data-send]'))) { sendReservation(); return; }
  });
  bk.addEventListener('change', function (e) {
    if (e.target.id === 'bkIn') {
      if (!e.target.value) return;
      trip.checkin = e.target.value;
      var p = prog();
      if (p) trip.checkout = addDays(trip.checkin, p.nights);
      else if (!trip.checkout || trip.checkout <= trip.checkin) trip.checkout = addDays(trip.checkin, 3);
      bkErr = ''; saveTrip(); renderBooking();
    } else if (e.target.id === 'bkOut') {
      trip.checkout = e.target.value; bkErr = ''; saveTrip(); renderBooking();
    }
  });
  bk.addEventListener('input', function (e) {
    var f = e.target.getAttribute && e.target.getAttribute('data-f');
    if (f) { trip[f] = e.target.value; saveTrip(); }
  });
  function sendReservation() {
    if (!validStay()) { bkStep = 0; bkErr = t('bk.errDates'); renderBooking(); return; }
    if (!validDetails()) { bkStep = 2; bkErr = t('bk.errDetails'); renderBooking(); return; }
    var ref = 'RM-' + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
    var p = prog(), r = D.rooms[trip.room], e = estimate(), n = nights(), enT = function (k) { return L.en[k] || k; };
    var usd = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
    var lines = [
      'New reservation request ' + ref, '',
      'Check-in: ' + trip.checkin, 'Check-out: ' + trip.checkout + ' (' + n + ' nights)',
      'Guests: ' + trip.adults + ' adults' + (trip.children ? ', ' + trip.children + ' children' : '') + ', ' + trip.rooms + ' room(s)',
      'Room: ' + enT(r.name)
    ];
    if (p) lines.push('Program: ' + enT(p.name) + ' (' + p.nights + ' nights)');
    var ex = Object.keys(trip.ex).map(function (id) { return '- ' + enT('ex.' + id) + ' x' + trip.ex[id]; });
    var tr = Object.keys(trip.tr).map(function (id) { return '- ' + enT('tr.' + id) + ' x' + trip.tr[id]; });
    if (ex.length) lines.push('', 'Excursions:', ex.join('\n'));
    if (tr.length) lines.push('', 'Transport:', tr.join('\n'));
    lines.push('', 'Estimated total: ' + usd(e.total) + (state.cur !== 'USD' ? ' (about ' + moneyText(e.total) + ')' : ''));
    lines.push('', 'Name: ' + trip.name.trim(), 'Email: ' + trip.email.trim());
    if (trip.phone) lines.push('Phone: ' + trip.phone.trim());
    if (trip.country) lines.push('Country: ' + trip.country.trim());
    if (trip.notes) lines.push('Requests: ' + trip.notes.trim());
    lines.push('', 'Website language: ' + L[state.lang]._name);
    var text = lines.join('\n');
    if (D.contact.whatsapp) window.open('https://wa.me/' + D.contact.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    else if (D.contact.email) window.location.href = 'mailto:' + D.contact.email + '?subject=' + encodeURIComponent('Reservation ' + ref) + '&body=' + encodeURIComponent(text);
    bkDone = ref; renderBooking();
  }

  var quick = $('#quickForm');
  quick.checkin.min = todayIso();
  quick.checkin.addEventListener('change', function () {
    if (!quick.checkin.value) return;
    quick.checkout.min = addDays(quick.checkin.value, 1);
    if (!quick.checkout.value || quick.checkout.value <= quick.checkin.value) quick.checkout.value = addDays(quick.checkin.value, 3);
  });
  quick.addEventListener('submit', function (e) {
    e.preventDefault();
    if (quick.checkin.value) { trip.checkin = quick.checkin.value; trip.checkout = (quick.checkout.value > quick.checkin.value) ? quick.checkout.value : addDays(quick.checkin.value, 3); }
    trip.adults = +quick.adults.value; trip.room = quick.room.value;
    if (prog() && prog().room !== trip.room) trip.program = null;
    if (prog()) trip.checkout = addDays(trip.checkin, prog().nights);
    saveTrip(); openBooking(0);
  });

  /* ---------------- Reveal on scroll ---------------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || el.dataset.done) return;
    el.dataset.done = '1';
    if (reduce) { el.textContent = target; return; }
    var s = null, dur = 1600;
    (function f(ts) {
      if (s === null) s = ts;
      var k = Math.min(1, (ts - s) / dur), ee = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(target * ee);
      if (k < 1) requestAnimationFrame(f);
    })(performance.now());
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      $$('[data-count]', e.target).forEach(countUp);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  function observe() {
    var groups = new Map();
    $$('.rv:not(.in)').forEach(function (el) {
      var p = el.parentElement, n = groups.get(p) || 0; groups.set(p, n + 1);
      el.style.setProperty('--d', (Math.min(n, 6) * 0.09) + 's');
    });
    $$('.rv:not(.in), .split:not(.in), .clip:not(.in)').forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Scroll-driven scenes ---------------- */
  var nav = $('#nav'), progress = $('#progress'), waFloat = $('#waFloat');
  var frame = $('#heroFrame'), media = $('#heroMedia'), copy = $('#heroCopy');
  var parallax = $$('[data-speed]');
  var wellPin = $('#wellPin'), wellTrack = $('#wellTrack'), wellBar = $('#wellBar'), wellBg = $('.well-bg img');
  var day = $('#day'), steps = $$('.day-step'), dots = $$('#dayDots i'), layers = $$('.sky-layer'), sun = $('#sun');
  var pinMQ = window.matchMedia('(min-width: 901px) and (hover: hover)');
  var lastY = window.scrollY, ticking = false, dayIdx = -1;
  var SUN = [{ t: 60, l: 58, s: 1.1 }, { t: 14, l: 76, s: .8 }, { t: 22, l: 84, s: .85 }, { t: 56, l: 74, s: 1.25 }];
  function setDay(i) {
    if (i === dayIdx) return; dayIdx = i;
    steps.forEach(function (s, j) { s.classList.toggle('on', j === i); });
    dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    layers.forEach(function (l, j) { l.classList.toggle('on', j === i); });
    var p = SUN[i], rtl = doc.dir === 'rtl';
    sun.style.top = p.t + '%'; sun.style.left = (rtl ? 100 - p.l : p.l) + '%'; sun.style.transform = 'scale(' + p.s + ')';
  }
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, docH = document.documentElement.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (docH > 0 ? y / docH : 0) + ')';
    var pastHero = y > vh * 0.75;
    nav.classList.toggle('solid', pastHero);
    waFloat.classList.toggle('show', pastHero);
    var menuOpen = document.body.classList.contains('menu-open');
    nav.classList.toggle('hide', !menuOpen && !$('.dd.open') && pastHero && y > lastY + 4 && y > vh * 1.2);
    if (y < lastY - 4) nav.classList.remove('hide');
    lastY = y;
    if (y < vh * 1.2 && !reduce) {
      var p = clamp(y / vh, 0, 1), inset = p * 18, rad = p * 48;
      frame.style.clipPath = 'inset(' + (inset * 0.6) + 'px ' + inset + 'px ' + inset + 'px ' + inset + 'px round ' + rad + 'px)';
      media.style.transform = 'translate3d(0,' + (p * vh * 0.25).toFixed(1) + 'px,0) scale(' + (1 + p * 0.08).toFixed(3) + ')';
      copy.style.opacity = String(clamp(1 - p * 1.6, 0, 1));
      copy.style.transform = 'translate3d(0,' + (-p * 80).toFixed(1) + 'px,0)';
    }
    if (!reduce) parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-speed'))).toFixed(1) + 'px,0)';
    });
    if (wellPin && pinMQ.matches && !reduce) {
      var wr = wellPin.getBoundingClientRect(), span = wellPin.offsetHeight - vh;
      var wp = clamp(-wr.top / span, 0, 1), dist = Math.max(0, wellTrack.scrollWidth - window.innerWidth);
      var sign = doc.dir === 'rtl' ? 1 : -1;
      wellTrack.style.transform = 'translate3d(' + (sign * wp * dist).toFixed(1) + 'px,0,0)';
      wellBar.style.transform = 'scaleX(' + wp + ')';
      wellBg.style.transform = 'scale(' + (1.15 - wp * 0.1).toFixed(3) + ') translateX(' + (sign * wp * 3).toFixed(2) + '%)';
    }
    if (day) {
      var dr = day.getBoundingClientRect();
      setDay(Math.floor(clamp(-dr.top / (day.offsetHeight - vh), 0, 0.999) * steps.length));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  var secIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      $$('.nav-links a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['rooms', 'offers', 'wellness', 'experiences', 'gallery'].forEach(function (id) { var el = document.getElementById(id); if (el) secIO.observe(el); });

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = $('#menuBtn'), menu = $('#menu');
  function setMenu(on) {
    document.body.classList.toggle('menu-open', on);
    menuBtn.setAttribute('aria-expanded', String(on));
    menuBtn.setAttribute('aria-label', t(on ? 'menu.close' : 'menu.open'));
    menu.setAttribute('aria-hidden', String(!on));
    document.body.style.overflow = on ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('#menu nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
    } else if (e.key === 'Escape') {
      if (bkOpen) closeBooking();
      else if (document.body.classList.contains('menu-open')) setMenu(false);
      closeDD(null);
    }
  });

  /* ---------------- Pointer effects ---------------- */
  var fine = window.matchMedia('(hover: hover)').matches && !reduce;
  function bindSpots(rootEl) {
    if (!fine) return;
    $$('.spot', rootEl).forEach(function (c) {
      if (c._spot) return; c._spot = true;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--sx', (e.clientX - r.left) + 'px'); c.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });
  }
  if (fine) {
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn'); if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (b.classList.contains('magnetic')) b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
    });
    $$('.magnetic').forEach(function (b) { b.addEventListener('pointerleave', function () { b.style.transform = ''; }); });
  }

  /* ---------------- Start ---------------- */
  applyLang();
  $('#curCode').textContent = state.cur;
  updateTripCount();
  bindSpots(document);
  autoRoom();
  onScroll();
  loadRates();
  $('#year').textContent = new Date().getFullYear();
})();
