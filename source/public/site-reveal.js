/* Sitede kaydırma geçişleri — ana sayfa dışındaki sayfalar için.
   Ana sayfa kendi rv-reveal sistemini kullanır (App.tsx + home.css);
   bu script yalnızca eşleşen kart/liste öğelerine hafif bir fade-up
   uygular. JS kapalıysa içerik olduğu gibi görünür. */
(function () {
  "use strict";

  var SELECTOR = [
    ".hub-category-grid > *",
    ".hub-article-list > *",
    ".tools-hub-list > *",
    ".news-story",
    ".blog-article"
  ].join(",");

  var style = document.createElement("style");
  style.textContent =
    ".rv-reveal{opacity:0;transform:translateY(18px);transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}" +
    '.rv-reveal[data-reveal="in"]{opacity:1;transform:translateY(0)}' +
    "@media (prefers-reduced-motion:reduce){.rv-reveal{opacity:1;transform:none;transition:none}}";
  document.head.appendChild(style);

  function init() {
    var items;
    try {
      items = document.querySelectorAll(SELECTOR);
    } catch (e) {
      return;
    }
    if (!items.length) return;
    if (typeof IntersectionObserver === "undefined") return; // içerik görünür kalsın

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              el.setAttribute("data-reveal", "in");
            });
          });
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    items.forEach(function (el) {
      if (el.getAttribute("data-reveal")) return;
      el.classList.add("rv-reveal");
      el.setAttribute("data-reveal", "out");
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
