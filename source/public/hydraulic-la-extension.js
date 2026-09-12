(function () {
  "use strict";

  if (window.__algoHydraulicLAExtension) return;
  window.__algoHydraulicLAExtension = true;

  function boot(attempt) {
    if (typeof CATALOG === "undefined" || typeof buildPalette !== "function" || typeof state === "undefined") {
      if (attempt < 80) window.setTimeout(function () { boot(attempt + 1); }, 50);
      return;
    }
    if (CATALOG.pumpLA) return;

    CATALOG.pumpLA = {
      n: "A10VO LA.D güç kontrollü pompa",
      g: "Güç kaynağı",
      w: 112,
      h: 104,
      sim: "pump",
      d:
        '<circle cx="34" cy="48" r="26"/>' +
        '<path d="M34 22V0M34 74V104"/>' +
        '<polygon class="f" points="34,24 23,44 45,44"/>' +
        '<path d="M8 88L60 8" marker-end="url(#ah)"/>' +
        '<rect x="64" y="24" width="36" height="48" rx="3"/>' +
        '<path d="M72 62V36" marker-end="url(#ah)"/>' +
        '<polyline class="thin" points="100,48 104,39 108,57 112,39 116,48"/>' +
        '<path class="dash" d="M34 78H82V72"/>' +
        '<text x="82" y="44" style="font-size:10px">LA</text>' +
        '<text x="82" y="58" style="font-size:8px">D</text>',
      p: [["P", 34, 0, "u"], ["S", 34, 104, "d"]],
      pd: [
        ["VgMax", "Maks. deplasman", "cm³/dev", 71.1, 20, 180],
        ["n", "Devir", "d/dak", 1500, 500, 3000],
        ["Pref", "LA güç ayarı", "kW@1500", 20, 5, 120],
        ["nref", "Referans devir", "d/dak", 1500],
        ["pc", "DR basınç kesme", "bar", 280, 20, 280],
        ["ev", "Volumetrik verim", "", 0.95],
        ["em", "Hid.-mek. verim", "", 0.92]
      ]
    };

    var baseStep = step;
    step = function (dt) {
      if (NET) {
        state.comps.forEach(function (c) {
          if (c.type !== "pumpLA") return;
          var P = c.params || (c.params = {});
          var np = NET.pn[NET.key(c.id, "P")];
          var ns = NET.pn[NET.key(c.id, "S")];
          var dp = Math.max(0, (np ? np.p : 0) - (ns ? ns.p : 0));
          var pbar = dp / 1e5;
          var nref = Math.max(1, P.nref || 1500);
          var Mset = (P.Pref || 20) * 60000 / (2 * Math.PI * nref);
          var Vmax = Math.max(0.01, P.VgMax || 71.1);
          var etaM = Math.max(0.2, P.em || 0.92);
          var Vlim = pbar > 0.01 ? Mset * 20 * Math.PI * etaM / pbar : Vmax;
          P.Vg = Math.max(0, Math.min(Vmax, Vlim));
          c.s = c.s || {};
          c.s.laMset = Mset;
          c.s.laPstart = Mset * 20 * Math.PI * etaM / Vmax;
          c.s.laDisp = P.Vg / Vmax;
        });
      }
      baseStep(dt);
    };

    var baseLabel = compLabel;
    compLabel = function (c) {
      if (c && c.type === "pumpLA") {
        var P = c.params || {};
        return "LA " + (P.Pref || 20) + " kW@" + (P.nref || 1500) + " · " + (P.n || 1500) + " d/dak";
      }
      return baseLabel(c);
    };

    var baseRows = liveRows;
    liveRows = function (c, def) {
      var rows = baseRows(c, def);
      if (c && c.type === "pumpLA" && sim.on && c.s) {
        rows.push(["LA tork ayarı", (c.s.laMset || 0).toFixed(1), "Nm"]);
        rows.push(["Kontrol başlangıcı", (c.s.laPstart || 0).toFixed(1), "bar"]);
        rows.push(["Efektif deplasman", ((c.params && c.params.Vg) || 0).toFixed(1), "cm³/dev"]);
      }
      return rows;
    };

    var baseReset = resetSim;
    resetSim = function () {
      state.comps.forEach(function (c) {
        if (c.type === "pumpLA") {
          c.params = c.params || {};
          c.params.Vg = c.params.VgMax || 71.1;
        }
      });
      baseReset();
    };

    buildPalette((document.getElementById("q") || {}).value || "");

    var topbar = document.querySelector(".bar");
    if (topbar && !document.getElementById("btnLALab")) {
      var lab = document.createElement("a");
      lab.id = "btnLALab";
      lab.className = "btn";
      lab.href = "/hydraulic-simulator/la-power-controller/";
      lab.textContent = "LA Pompa Lab ↗";
      lab.title = "A10VO LA güç kontrolünü ayrı laboratuvarda test et";
      lab.setAttribute("data-analytics-action", "open_la_pump_lab");
      var spacer = topbar.querySelector(".sp");
      topbar.insertBefore(lab, spacer || null);
    }

    var prose = document.querySelector(".prose.wrap");
    if (prose && !document.getElementById("laGuideLinks")) {
      var box = document.createElement("div");
      box.id = "laGuideLinks";
      box.style.cssText = "margin-top:18px;padding:14px 16px;border:1px solid var(--line);border-radius:4px;background:var(--surface);";
      box.innerHTML =
        '<strong style="color:var(--ink)">A10VO LA güç kontrolü</strong>' +
        '<span style="color:var(--ink-2)"> — pompayı paletten ekleyebilir veya detaylı laboratuvarı açabilirsiniz.</span><br>' +
        '<a href="/hydraulic-simulator/la-power-controller/" style="color:var(--accent);text-decoration:underline">Etkileşimli LA laboratuvarı</a>' +
        '<span style="color:var(--muted)"> · </span>' +
        '<a href="/docs/a10vo-la-guide-pdf.html?lang=tr" style="color:var(--accent);text-decoration:underline">TR PDF</a>' +
        '<span style="color:var(--muted)"> · </span>' +
        '<a href="/docs/a10vo-la-guide-pdf.html?lang=en" style="color:var(--accent);text-decoration:underline">EN PDF</a>';
      prose.appendChild(box);
    }
  }

  boot(0);
})();
