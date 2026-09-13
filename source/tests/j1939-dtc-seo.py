"""Validate the production build, not only the source template."""
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import xml.etree.ElementTree as ET

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ARTIFACTS = ROOT / ".test-artifacts" / "j1939-dtc"
ROUTE = "/j1939-dtc-decoder/"
CANONICAL = "https://algo-team.com" + ROUTE
NAME = "J1939 DM1 Decoder: SPN/FMI Arıza Kodu Çözücü"
TITLE = NAME + " | ALGO TEAM"
DESCRIPTION = (
    "J1939 DM1 (PGN 65226) mesajını çözün: SPN, FMI, OC, lamba durumları ve "
    "BAM/TP.DT. TRC, ASC, CSV ve SocketCAN kayıtlarını tarayıcıda analiz edin."
)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.in_json = False
        self.json_buffer = ""
        self.schemas = []
        self.meta = {}
        self.canonicals = []
        self.h1s = 0
        self.text = []
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1s += 1
        if tag == "meta":
            self.meta[a.get("name", a.get("property", ""))] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href"))
        if tag == "a":
            self.hrefs.append(a.get("href", ""))
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_json = True
            self.json_buffer = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_json:
            obj = json.loads(self.json_buffer)
            self.schemas.extend(obj.get("@graph", [obj]))
            self.in_json = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_json:
            self.json_buffer += data
        else:
            self.text.append(data)


def assert_static():
    path = DIST / "j1939-dtc-decoder" / "index.html"
    assert path.exists(), f"Missing built page: {path}"
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    assert parser.title == TITLE
    assert parser.meta["description"] == DESCRIPTION
    assert parser.meta["og:title"] == NAME
    assert parser.meta["twitter:title"] == NAME
    assert parser.meta["twitter:description"] == parser.meta["og:description"]
    assert "DM1 (PGN 65226)" in parser.meta["og:description"]
    assert parser.canonicals == [CANONICAL]
    assert "noindex" not in parser.meta.get("robots", "").lower()
    assert parser.h1s == 1
    text = " ".join(parser.text)
    for fragment in [
        "J1939 SPN/FMI Arıza Kodu Çözücü",
        "TRC, ASC, CSV veya SocketCAN kaydını yükleyin",
        "DM1 (PGN 65226)",
        "BAM / TP.DT",
        "DM1 çözümlemek için DBC dosyası gerekir mi?",
        "SPN/FMI sonucu tek başına arızalı parçayı gösterir mi?",
        "Bu araç ECU'daki arızayı siler mi?",
    ]:
        assert fragment in text, f"Missing static content: {fragment}"
    for href in ["/learn/j1939-dm1-spn-fmi-cozumleme/", "/j1939-pgn-calculator/"]:
        assert href in parser.hrefs
    apps = [s for s in parser.schemas if s.get("@type") == "SoftwareApplication"]
    assert len(apps) == 1
    assert apps[0]["name"] == NAME and apps[0]["url"] == CANONICAL
    assert apps[0]["inLanguage"] == "tr"
    assert "WebUSB" not in apps[0]["browserRequirements"]
    assert any(s.get("@type") == "BreadcrumbList" for s in parser.schemas)
    tree = ET.parse(DIST / "sitemap.xml")
    locs = [el.text for el in tree.findall(".//{*}loc")]
    assert locs.count(CANONICAL) == 1
    return {"title": parser.title, "description": parser.meta["description"], "canonical": CANONICAL}


def app_schema(page):
    return page.locator('.tool-seo script[type="application/ld+json"]').evaluate(
        "el => JSON.parse(el.textContent)['@graph'].find(x => x['@type'] === 'SoftwareApplication')"
    )


def main():
    summary = assert_static()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(DIST)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            # Tests never send analytics, private files or CAN data to outside hosts.
            context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base) or route.request.url.startswith("data:") else route.abort())
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = page.goto(base + ROUTE, wait_until="networkidle")
            assert response and response.status == 200
            assert page.title() == TITLE
            assert page.locator("h1").count() == 1
            assert page.locator(".tool-seo-faq article").count() == 5
            page.screenshot(path=str(ARTIFACTS / "desktop.png"), full_page=True)

            page.locator(".jda-language").get_by_role("button", name="EN", exact=True).click()
            assert "Do I need a DBC file to decode DM1?" in page.locator(".tool-seo").inner_text()
            assert "Single Message" in page.locator(".tool-seo").inner_text()
            assert "Switch to TR for the detailed workflow" not in page.locator(".tool-seo").inner_text()
            assert app_schema(page)["inLanguage"] == "en"
            assert app_schema(page)["name"] == "J1939 DM1 Decoder: SPN/FMI Fault Codes"
            page.locator(".jda-language").get_by_role("button", name="TR", exact=True).click()
            assert app_schema(page)["name"] == NAME

            page.get_by_role("button", name="Örnek J1939 kaydını aç", exact=True).click()
            page.wait_for_selector(".jda-kpis article")
            assert int(page.locator(".jda-kpis article strong").nth(2).inner_text().replace(",", "").replace(".", "")) > 0
            assert page.locator(".jda-fault-list button").count() > 0
            page.get_by_role("button", name="Tek Mesaj", exact=True).click()
            inputs = page.locator(".jda-manual-inputs input")
            inputs.nth(0).fill("18FECA00")
            inputs.nth(1).fill("04 FF 5B 00 03 02 FF FF")
            page.wait_for_function("document.querySelector('.jda-manual-dtcs h3')?.textContent === 'SPN 91 · FMI 3'")
            assert "65226" in page.locator(".jda-id-grid").inner_text()
            assert page.locator(".jda-manual-dtcs dl > div").nth(1).locator("dd").inner_text() == "2"
            assert "CM 0" in page.locator(".jda-manual-dtcs").inner_text()
            inputs.nth(1).fill("ZZ")
            assert page.locator(".jda-manual-dtcs").count() == 0
            assert "HEX" in page.locator(".jda-manual .jda-empty").inner_text()
            page.locator(".jda-reset").click()
            assert page.locator(".jda-landing").is_visible()

            # Independently exercise file import with a synthetic, read-only SocketCAN capture.
            fixture = b"(0.000000) can0 18FECA00#04FF5B000302FFFF\n(1.000000) can0 18FECA00#04FF5B000302FFFF\n"
            page.locator('input[type="file"]').nth(0).set_input_files({"name": "dm1-seo-test.log", "mimeType": "text/plain", "buffer": fixture})
            page.wait_for_selector(".jda-fault-list button")
            assert "SPN 91" in page.locator(".jda-fault-list").inner_text()
            assert "FMI 3" in page.locator(".jda-fault-list").inner_text()
            assert not errors, errors

            # Verify initial mobile layout, which is the primary search landing experience.
            page.locator(".jda-reset").click()
            page.set_viewport_size({"width": 390, "height": 844})
            page.screenshot(path=str(ARTIFACTS / "mobile.png"), full_page=True)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Mobile horizontal overflow"
            for href in ["/learn/j1939-dm1-spn-fmi-cozumleme/", "/j1939-pgn-calculator/"]:
                assert context.request.get(base + href).status == 200

            nojs = browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
            nojs.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base) else route.abort())
            static_page = nojs.new_page()
            static_page.goto(base + ROUTE)
            assert "DM1 çözümlemek için DBC dosyası gerekir mi?" in static_page.locator("body").inner_text()
            assert static_page.title() == TITLE
            browser.close()
        summary.update({"no_js": True, "locales": ["tr", "en"], "manual_dtc": {"spn": 91, "fmi": 3, "oc": 2}, "sample_and_file_import": True, "mobile_width": 390})
        (ARTIFACTS / "validation.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
        print("PASS: DTC production metadata, no-JS content, TR/EN help, sample, manual DM1, file import and mobile layout.")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
