(function () {
  'use strict';
  if (window.AlgoLanguage) return;
  var key = 'algo-team-language', userSelected = false, restored = false;
  var ready = document.readyState === 'complete';
  function get() { try { return localStorage.getItem(key) === 'en' ? 'en' : 'tr'; } catch (_) { return document.documentElement.lang === 'en' ? 'en' : 'tr'; } }
  var initial = get();
  function guide() { return '/docs/' + (get() === 'en' ? 'a10vo-la-power-controller-detailed-guide-en-revb.pdf' : 'a10vo-la-guc-kontrolu-detayli-kilavuzu-tr-revb.pdf'); }
  function repairGuideLinks() {
    var box = document.getElementById('laGuideLinks');
    if (!box) return;
    var links = box.querySelectorAll('a[href*="/docs/a10vo-la-"]');
    links.forEach(function (a, i) { if (i > 0) a.remove(); });
    var a = links[0];
    if (a) {
      var href = guide(), label = get() === 'en' ? 'Download detailed guide (Rev B)' : 'Ayrıntılı kılavuzu indir (Rev B)';
      if (a.getAttribute('href') !== href) a.setAttribute('href', href);
      if (a.textContent !== label) a.textContent = label;
      if (!a.hasAttribute('download')) a.setAttribute('download', '');
      a.id = 'laGuideDownload';
    }
    var separators = box.querySelectorAll('span');
    if (separators.length > 2) separators[separators.length - 1].remove();
  }
  function set(value) {
    if (value !== 'tr' && value !== 'en') return;
    try { localStorage.setItem(key, value); } catch (_) {}
    document.documentElement.lang = value;
    repairGuideLinks();
    window.dispatchEvent(new CustomEvent('site-language-changed', { detail: value }));
  }
  window.AlgoLanguage = { get: get, set: set, guide: guide };
  document.documentElement.lang = initial;
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target) return;
    var value = target.getAttribute('data-site-lang') || (target.textContent || '').trim().toLowerCase();
    if (value === 'tr' || value === 'en') { userSelected = true; set(value); }
  });
  function restore() {
    repairGuideLinks();
    if (!ready || restored || userSelected || document.querySelector('[data-site-lang]')) return;
    var button = Array.from(document.querySelectorAll('button')).find(function (b) { return b.textContent.trim().toLowerCase() === initial; });
    if (button) { restored = true; button.click(); }
  }
  var observer = new MutationObserver(restore);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', function () { ready = true; requestAnimationFrame(function () { requestAnimationFrame(restore); }); }, { once: true });
  restore();
  window.setTimeout(function () { observer.disconnect(); repairGuideLinks(); }, 10000);
  window.addEventListener('storage', function (event) { if (event.key === key) set(get()); });
})();
