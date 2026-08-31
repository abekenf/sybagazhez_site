/* ═══════════════════════════════════════════════════════════════════════
   SYBAGA — логика сайта
   1. Переключение языка   2. Шапка и навигация   3. Меню (вкладки)
   4. Галерея и лайтбокс   5. Появление секций    6. Форма → WhatsApp
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Контакты в одном месте. Поменяли номер — поменяйте и здесь. ─── */
  var WHATSAPP = '77073404444';          // без плюса и пробелов
  var STORE_KEY = 'sybaga-lang';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  var lang = 'kk';
  var t = function (key) { return (window.I18N[lang] && window.I18N[lang][key]) || key; };

  /* ═══════════ 1. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ═══════════ */
  function applyLang(next) {
    lang = (next === 'ru') ? 'ru' : 'kk';
    var dict = window.I18N[lang];

    document.documentElement.lang = lang;
    document.body.setAttribute('data-lang', lang);
    document.title = dict.docTitle;
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', dict.docDesc);

    // Текст элементов
    $$('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v === undefined) return;
      if (v.indexOf('<') > -1) el.innerHTML = v;   // строки с <br>
      else el.textContent = v;
    });
    // Подсказки в полях формы
    $$('[data-i18n-placeholder]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-placeholder')];
      if (v !== undefined) el.placeholder = v;
    });

    // Кнопки ҚАЗ / РУС
    $$('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-lang-btn') === lang);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang-btn') === lang);
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}

    renderMenu();      // разделы меню зависят от языка
    renderGallery();
  }

  $$('[data-lang-btn]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang-btn')); });
  });

  /* ═══════════ 2. ШАПКА, НАВИГАЦИЯ, МОБИЛЬНОЕ МЕНЮ ═══════════ */
  var hdr = $('#hdr');

  /* Кнопки прокрутки: «наверх» — когда ушли ниже экрана,
     «вниз» — пока до конца страницы ещё далеко. */
  var snavUp = $('#snavUp'), snavDown = $('#snavDown');

  var onScroll = function () {
    var y = window.scrollY, vh = window.innerHeight;
    hdr.classList.toggle('is-stuck', y > 20);

    if (!snavUp || !snavDown) return;
    var passedHero = y > vh * 0.6;
    var toBottom = document.documentElement.scrollHeight - (y + vh);
    snavUp.classList.toggle('is-on', passedHero);
    snavDown.classList.toggle('is-on', passedHero && toBottom > 120);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (snavUp) snavUp.addEventListener('click', function () {
    window.scrollTo({ top: 0 });                                     // плавность берётся из CSS
  });
  if (snavDown) snavDown.addEventListener('click', function () {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  });

  var burger = $('#burger'), mnav = $('#mnav');
  function closeMnav() {
    mnav.hidden = true; burger.classList.remove('is-on');
    burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked');
  }
  burger.addEventListener('click', function () {
    var open = mnav.hidden;
    mnav.hidden = !open; burger.classList.toggle('is-on', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', closeMnav); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900 && !mnav.hidden) closeMnav(); });

  // Подсветка активного пункта меню при прокрутке
  var navLinks = $$('.nav a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ═══════════ 3. МЕНЮ: ВКЛАДКИ ═══════════ */
  var tabsBox = $('#menuTabs'), panelsBox = $('#menuPanels');
  var activeCat = (window.MENU && window.MENU[0]) ? window.MENU[0].id : null;

  function renderMenu() {
    if (!tabsBox || !window.MENU) return;

    tabsBox.innerHTML = window.MENU.map(function (c) {
      var on = c.id === activeCat, id = esc(c.id);
      return '<button type="button" class="tab' + (on ? ' is-on' : '') + '" role="tab"' +
             ' id="tab-' + id + '" aria-selected="' + on + '" aria-controls="panel-' + id + '"' +
             ' data-cat="' + id + '">' + esc(c.title[lang]) + '</button>';
    }).join('');

    panelsBox.innerHTML = window.MENU.map(function (c) {
      var items = c.items.map(function (it, i) {
        return '<div class="mi" style="animation-delay:' + (i * 55) + 'ms">' +
                 '<div class="mi__top">' +
                   '<span class="mi__n">' + esc(it.name[lang]) + '</span>' +
                   '<span class="mi__dots"></span>' +
                   '<span class="mi__p">' + esc(it.price) + '</span>' +
                 '</div>' +
                 (it.desc ? '<p class="mi__d">' + esc(it.desc[lang]) + '</p>' : '') +
               '</div>';
      }).join('');

      var id = esc(c.id);
      return '<div class="mpanel" id="panel-' + id + '" role="tabpanel" aria-labelledby="tab-' + id + '"' +
             (c.id === activeCat ? '' : ' hidden') + '>' +
               '<div class="mpanel__media">' +
                 '<img src="' + esc(c.img) + '" alt="' + esc(c.title[lang]) + '" loading="lazy" decoding="async">' +
                 (c.cap ? '<p class="mpanel__cap">' + esc(c.cap[lang]) + '</p>' : '') +
               '</div>' +
               '<div class="mlist">' + items + '</div>' +
             '</div>';
    }).join('');
  }

  // Клик и стрелки на вкладках
  tabsBox && tabsBox.addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    activeCat = b.getAttribute('data-cat');
    $$('.tab', tabsBox).forEach(function (x) {
      var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on);
    });
    $$('.mpanel', panelsBox).forEach(function (p) { p.hidden = (p.id !== 'panel-' + activeCat); });
  });
  tabsBox && tabsBox.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = $$('.tab', tabsBox), i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); n.click();
  });

  /* ═══════════ 4. ГАЛЕРЕЯ И ЛАЙТБОКС ═══════════ */
  var galBox = $('#gal');
  function renderGallery() {
    if (!galBox || !window.GALLERY) return;
    galBox.innerHTML = window.GALLERY.map(function (g, i) {
      var cap = esc(g.cap[lang]);
      return '<a class="gal__i reveal" href="' + esc(g.src) + '" data-i="' + i + '" aria-label="' + cap + '">' +
               '<img src="' + esc(g.src) + '" alt="' + cap + '" loading="lazy" decoding="async">' +
               '<span>' + cap + '</span>' +
             '</a>';
    }).join('');
    observeReveals();
  }

  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbIndex = 0;
  function openLb(i) {
    lbIndex = (i + window.GALLERY.length) % window.GALLERY.length;
    var g = window.GALLERY[lbIndex];
    lbImg.src = g.src; lbImg.alt = g.cap[lang]; lbCap.textContent = g.cap[lang];
    lb.hidden = false; document.body.classList.add('is-locked');
    $('#lbClose').focus();
  }
  function closeLb() { lb.hidden = true; document.body.classList.remove('is-locked'); }

  galBox && galBox.addEventListener('click', function (e) {
    var a = e.target.closest('.gal__i'); if (!a) return;
    e.preventDefault(); openLb(parseInt(a.getAttribute('data-i'), 10));
  });
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { openLb(lbIndex - 1); });
  $('#lbNext').addEventListener('click', function () { openLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
  });
  // Свайп по фото на телефоне
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 55) openLb(lbIndex + (d < 0 ? 1 : -1));
  }, { passive: true });

  /* ═══════════ 5. ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ ПРОКРУТКЕ ═══════════ */
  var revealIO = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries, io) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in'); io.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  function observeReveals() {
    $$('.reveal').forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      if (revealIO) revealIO.observe(el); else el.classList.add('is-in');
    });
  }

  /* ═══════════ 6. ФОРМА БРОНИРОВАНИЯ → WHATSAPP ═══════════ */
  var form = $('#bookForm'), okMsg = $('#formOk');

  // Нельзя выбрать вчерашний день
  var dateInput = form.elements.date;
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);
  if (!dateInput.value) dateInput.value = dateInput.min;

  function setErr(input, msgKey) {
    var fld = input.closest('.fld');
    fld.classList.toggle('is-bad', !!msgKey);
    $('.err', fld).textContent = msgKey ? t(msgKey) : '';
    return !msgKey;
  }

  function validate() {
    var f = form.elements, ok = true;

    ok &= setErr(f.name, f.name.value.trim().length >= 2 ? null : 'errName');

    var digits = f.phone.value.replace(/\D/g, '');
    ok &= setErr(f.phone, digits.length >= 10 && digits.length <= 15 ? null : 'errPhone');

    var dErr = null;
    if (!f.date.value) dErr = 'errDate';
    else if (f.date.value < dateInput.min) dErr = 'errPast';
    ok &= setErr(f.date, dErr);

    ok &= setErr(f.time, f.time.value ? null : 'errTime');

    var g = parseInt(f.guests.value, 10);
    ok &= setErr(f.guests, (g >= 1 && g <= 300) ? null : 'errGuests');

    return !!ok;
  }

  // Прячем ошибку, как только гость начал исправлять поле
  $$('#bookForm input, #bookForm textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var fld = el.closest('.fld');
      if (fld) fld.classList.remove('is-bad');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    okMsg.hidden = true;

    if (!validate()) {
      var bad = $('.fld.is-bad input, .fld.is-bad textarea');
      if (bad) bad.focus();
      return;
    }

    var f = form.elements;
    var d = f.date.value.split('-');                       // 2026-08-22 → 22.08.2026
    var lines = [
      t('waHello'), '',
      t('waName')   + ': ' + f.name.value.trim(),
      t('waPhone')  + ': ' + f.phone.value.trim(),
      t('waDate')   + ': ' + d[2] + '.' + d[1] + '.' + d[0],
      t('waTime')   + ': ' + f.time.value,
      t('waGuests') + ': ' + f.guests.value
    ];
    if (f.note.value.trim()) lines.push(t('waNote') + ': ' + f.note.value.trim());
    lines.push('', '— ' + t('waFrom'));

    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;                    // если браузер заблокировал вкладку

    okMsg.hidden = false;
  });

  /* ═══════════ Мелочи ═══════════ */
  $('#year').textContent = new Date().getFullYear();

  /* ═══════════ Старт ═══════════ */
  var saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
  applyLang(saved || 'kk');      // по умолчанию — казахский
  observeReveals();
})();
