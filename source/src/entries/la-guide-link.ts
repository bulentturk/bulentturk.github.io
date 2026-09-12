// Navigation-only enhancement. It does not read or modify laboratory parameters.
const guidePaths = { tr: "/learn/a10vo-la-guc-kontrolu/", en: "/learn/a10vo-la-power-control/" };
function connectGuide() {
  const intro = document.querySelector("#app .intro");
  if (!intro) return;
  const language = document.documentElement.lang === "en" ? "en" : "tr";
  let link = document.getElementById("laLearnLink") as HTMLAnchorElement | null;
  if (!link) {
    const paragraph = document.createElement("p");
    paragraph.className = "la-learn-backlink";
    link = document.createElement("a");
    link.id = "laLearnLink";
    link.style.cssText = "color:#087f8c;font-weight:650;text-underline-offset:3px";
    paragraph.appendChild(link);
    intro.appendChild(paragraph);
  }
  const label = language === "en" ? "Read the detailed operating guide →" : "Ayrıntılı çalışma mantığını oku →";
  if (link.getAttribute("href") !== guidePaths[language]) link.setAttribute("href", guidePaths[language]);
  if (link.textContent !== label) link.textContent = label;
}
const app = document.getElementById("app");
if (app) {
  // The lab replaces its shell when its language changes. Reinsert only after that change.
  const observer = new MutationObserver(() => { if (!document.getElementById("laLearnLink")) connectGuide(); });
  observer.observe(app, { childList: true });
}
window.addEventListener("site-language-changed", () => requestAnimationFrame(connectGuide));
connectGuide();
export {};
