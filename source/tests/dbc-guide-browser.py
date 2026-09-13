"""Check the built DBC guide; never send QA visits to production analytics."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import re
import threading
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / ".test-artifacts" / "dbc-guide"
PATH = "/learn/dbc-dosyasi-nedir/"
URL = "https://algo-team.com" + PATH
TITLE = "DBC Nedir? CAN Bus Mesajlarını Örnekle Okuyun | ALGO TEAM"
H1 = "DBC nedir? CAN Bus mesajlarını örnekle okuyun"
DESCRIPTION = "DBC dosyası ne işe yarar, nasıl okunur? CAN verisini devir ve sıcaklık gibi değerlere çeviren sinyal tanımlarını örneklerle öğrenin; editörde deneyin."


def normalize(text: str) -> str:
    return " ".join(text.split())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # The original catalogue remains the baseline for all detailed sections.
    # Only the first section heading and first paragraph have been rewritten.
    original = (ROOT / "src/GuidePage.tsx").read_text(encoding="utf-8")
    dbc = original.split('  "dbc-dosyasi-nedir": {', 1)[1].split('  "can-bus-ariza-tespiti": {', 1)[0]
    sections = dbc.split("sections: [", 1)[1]
    baseline = [json.loads(value) for value in re.findall(r'"(?:[^"\\]|\\.)*"', sections)]
    preserved = baseline[2:]
    assert len(preserved) >= 15, "Missing original DBC text baseline"

    sitemap = ET.parse(DIST / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    entries = [entry for entry in sitemap.findall("s:url", ns) if entry.findtext("s:loc", namespaces=ns) == URL]
    assert len(entries) == 1, "DBC must have exactly one sitemap URL"
    assert entries[0].findtext("s:lastmod", namespaces=ns) >= "2026-09-13"
    assert not (DIST / "learn/dbc-nedir").exists(), "Do not create a competing URL"

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(DIST)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    checked = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            for javascript in (False, True):
                context = browser.new_context(java_script_enabled=javascript, viewport={"width": 1440, "height": 1000})
                context.route("**/*", lambda route: route.continue_() if urlparse(route.request.url).hostname == "127.0.0.1" else route.abort())
                page = context.new_page()
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
                response = page.goto(base + PATH, wait_until="networkidle")
                assert response and response.status == 200
                assert page.title() == TITLE
                assert page.locator("h1").count() == 1
                assert page.locator("h1").inner_text() == H1
                assert page.locator('meta[name="description"]').get_attribute("content") == DESCRIPTION
                assert page.locator('meta[property="og:description"]').get_attribute("content") == DESCRIPTION
                assert page.locator('meta[name="twitter:description"]').get_attribute("content") == DESCRIPTION
                assert page.locator('link[rel="canonical"]').get_attribute("href") == URL
                assert page.locator("html").get_attribute("lang") == "tr"
                assert page.locator(".guide-body > section").count() == 6
                visible = normalize(page.locator("article").inner_text())
                for value in preserved:
                    assert normalize(value) in visible, f"Detailed content lost: {value[:80]}"
                assert "CAN Bus mesajlarındaki ham verinin motor devri" in visible
                schema = json.loads(page.locator('script[type="application/ld+json"]').inner_text())
                article = next(item for item in schema["@graph"] if item["@type"] == "Article")
                assert article["headline"] == H1 and article["description"] == DESCRIPTION
                assert article["datePublished"] == "2026-08-23"
                assert article["dateModified"] == "2026-09-13"
                assert article["url"] == URL and article["inLanguage"] == "tr-TR"
                for link in ("/dbc-editor/", "/dbc-ecu-simulator/", "/learn/can-log-analizi/", "/learn/can-bus-ariza-tespiti/", "/learn/j1939-pgn-nedir/", "/learn/j1939-dm1-spn-fmi-cozumleme/"):
                    assert page.locator(f'a[href="{link}"]').count() >= 1, link
                    assert context.request.get(base + link).status == 200, link
                assert not errors, errors
                if javascript:
                    page.screenshot(path=str(OUT / "desktop.png"), full_page=True)
                    page.set_viewport_size({"width": 390, "height": 844})
                    page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
                    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Mobile horizontal overflow"
                    page.locator('.guide-hero a[href="/dbc-editor/"]').click()
                    page.wait_for_load_state("networkidle")
                    assert urlparse(page.url).path == "/dbc-editor/"
                # The shared entry must still mount non-DBC guides correctly.
                response = page.goto(base + "/learn/can-log-analizi/", wait_until="networkidle")
                assert response and response.status == 200
                assert "CAN log analizi" in page.locator("h1").inner_text()
                assert not errors, errors
                checked.append({"javascript": javascript, "preserved_text_fragments": len(preserved), "status": "passed"})
                context.close()
            browser.close()
        (OUT / "report.json").write_text(json.dumps(checked, indent=2), encoding="utf-8")
        print("PASS: DBC metadata, canonical, sitemap, original detailed content, no-JS rendering, hydration, editor navigation, other guide route and 390px layout.")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
