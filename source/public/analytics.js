(function () {
  "use strict";

  var measurementId = "G-46MHTW1W3D";
  var productionHosts = ["algo-team.com", "www.algo-team.com"];

  if (!productionHosts.includes(window.location.hostname)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: "SameSite=Lax;Secure",
  });

  var googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(googleTag);

  var normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  var toolNames = {
    "/can-viewer": "can_viewer",
    "/can-log-analyzer": "can_log_analyzer",
    "/dbc-editor": "dbc_editor",
    "/dbc-ecu-simulator": "dbc_ecu_simulator",
    "/j1939-dtc-decoder": "j1939_dtc_decoder",
    "/hydraulic-simulator": "hydraulic_simulator",
  };

  if (toolNames[normalizedPath]) {
    window.gtag("event", "tool_open", {
      tool_name: toolNames[normalizedPath],
      page_path: normalizedPath,
    });
  }

  if (normalizedPath.indexOf("/learn/") === 0 && normalizedPath !== "/learn") {
    window.gtag("event", "guide_open", {
      guide_slug: normalizedPath.split("/").filter(Boolean).pop(),
    });
  }

  document.addEventListener("click", function (event) {
    var target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    var actionTarget = target.closest("[data-analytics-action]");
    if (actionTarget && toolNames[normalizedPath]) {
      window.gtag("event", "tool_action", {
        tool_name: toolNames[normalizedPath],
        action_name: actionTarget.getAttribute("data-analytics-action"),
      });
    }

    var contactLink = target.closest('a[href^="mailto:"], a[href^="tel:"], a[href="#contact"]');
    if (contactLink) {
      var href = contactLink.getAttribute("href") || "";
      var contactType = href.indexOf("mailto:") === 0
        ? "email"
        : href.indexOf("tel:") === 0
          ? "phone"
          : "contact_section";

      window.gtag("event", "contact_click", {
        contact_type: contactType,
      });
    }

    var languageButton = target.closest("button");
    if (!languageButton) return;

    var language = (languageButton.textContent || "").trim().toLowerCase();
    if (language !== "tr" && language !== "en") return;

    window.gtag("event", "language_change", {
      language: language,
    });
  });
})();
