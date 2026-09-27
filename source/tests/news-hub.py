"""Check the built news hub: curated selection, Makine Nabzı handoff, archive intact."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / ".test-artifacts" / "news-hub"
ROUTE = "/news/"
URL = "https://algo-team.com" + ROUTE
SECTOR_SITE = "https://makinenabzi.com"
SECTOR_NEWS = "https://makinenabzi.com/haberler/"
TITLE = "Haberler: Sektör Gündemi ve Makine Nabzı | ALGO TEAM"
HERO_TR = "Sektör gündemi artık Makine Nabzı'nda."
HERO_EN = "Sector news now lives on Makine Nabzı."
PICK_COUNT = 6

ITEMS = json.loads((ROOT / "src/content/news-archive.json").read_text(encoding="utf-8"))["items"]
ARCHIVE_COUNT = len(ITEMS)
FEED = json.loads((ROOT / "src/content/sector-feed.json").read_text(encoding="utf-8"))
FEED_ITEMS = FEED["items"]


def check_static() -> None:
    html = (DIST / "news/index.html").read_text(encoding="utf-8")
    assert html.count("<h1") == 1, "News hub must keep a single h1"
    assert f"<title>{TITLE}</title>" in html, "News title must describe the Makine Nabzı handoff"
    assert "Makine Nabzı" in re.search(r'<meta name="description" content="([^"]*)"', html).group(1)

    assert '<details class="news-archive">' in html, "Archive must be collapsed by default"
    assert len(re.findall(r'id="pick-[a-z0-9-]+"', html)) == PICK_COUNT, "Selection must show six stories"
    for item in ITEMS:
        assert f'id="news-{item["id"]}"' in html, f"Missing archived story: {item['id']}"

    cta = re.search(r'<a class="news-partner-cta"[^>]*>', html)
    assert cta, "Missing Makine Nabzı call to action"
    assert f'href="{SECTOR_NEWS}"' in cta.group(0), "Call to action must open the news section"
    assert 'target="_blank"' in cta.group(0) and "noopener" in cta.group(0)

    # Haftalık RSS iş akışının ürettiği son başlıklar şeridi.
    assert 1 <= len(FEED_ITEMS) <= 6, "Sector feed must carry between one and six headlines"
    assert FEED["sectionUrl"] == SECTOR_NEWS
    for item in FEED_ITEMS:
        assert item["title"] and item["publishedAt"], "Sector feed items need a title and date"
        assert item["url"].startswith(SECTOR_SITE + "/"), f"Unexpected sector feed URL: {item['url']}"
        assert item["url"] in html and item["title"] in html, f"Missing sector headline: {item['title']}"
    assert html.count(SECTOR_NEWS) >= 3, "Sector links must point at the news section"

    sitemap = ET.parse(DIST / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [entry.findtext("s:loc", namespaces=ns) for entry in sitemap.findall("s:url", ns)]
    assert locs.count(URL) == 1, "News must stay in the sitemap exactly once"


def main() -> None:
    from playwright.sync_api import sync_playwright

    check_static()
    OUT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(DIST)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            # Tests never send QA visits to production analytics or the sister site.
            context.route(
                "**/*",
                lambda route: route.continue_() if urlparse(route.request.url).hostname == "127.0.0.1" else route.abort(),
            )
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            response = page.goto(base + ROUTE, wait_until="networkidle")
            assert response and response.status == 200
            assert page.locator("h1").count() == 1
            assert page.locator("h1").inner_text().strip() == HERO_TR

            # Seçki görünür, arşiv kapalı ama içeriği DOM'da duruyor.
            assert page.locator(".news-picks .news-story").count() == PICK_COUNT
            assert page.locator(".news-picks .news-story").first.is_visible()
            assert page.locator(".sector-feed-list li").count() == len(FEED_ITEMS)
            for href in page.locator(".sector-feed-list a").evaluate_all("els => els.map(el => el.href)"):
                assert href.startswith(SECTOR_SITE + "/")
            assert page.locator(".news-archive .news-story").count() == ARCHIVE_COUNT
            assert page.locator("details.news-archive").evaluate("el => el.open") is False
            assert page.locator(".news-archive .news-feed").is_hidden()
            page.screenshot(path=str(OUT / "desktop.png"), full_page=True)

            # Arşiv açıldığında kategori filtresi çalışmaya devam ediyor.
            page.locator("details.news-archive > summary").click()
            assert page.locator("details.news-archive").evaluate("el => el.open") is True
            # Sayaç metni CSS ile biçimlendirildiği için DOM metni normalize edilir.
            def count_label() -> str:
                return page.locator(".news-result-count").evaluate("el => el.textContent").lower()

            assert "31 haber" in count_label()
            page.get_by_role("button", name="Madencilik Teknolojileri", exact=False).click()
            assert page.locator(".news-archive .news-story").count() == 5
            assert "5 haber" in count_label()
            assert page.evaluate("location.hash") == "#mining"
            page.get_by_role("button", name="Tüm Haberler", exact=False).click()
            assert page.locator(".news-archive .news-story").count() == ARCHIVE_COUNT
            assert page.evaluate("location.hash") == ""

            # Dil seçimi hem başlığı hem seçki metnini çeviriyor.
            page.locator(".rv-lang").get_by_role("button", name="EN", exact=True).click()
            assert page.locator("h1").inner_text().strip() == HERO_EN
            assert "Stories that touch our tools" in page.locator(".news-picks").inner_text()
            page.locator(".rv-lang").get_by_role("button", name="TR", exact=True).click()
            assert page.locator("h1").inner_text().strip() == HERO_TR

            assert not errors, errors

            # Mobil: açılış görünümü (arşiv kapalı) ve arşiv açıkken yatay taşma olmamalı.
            page.set_viewport_size({"width": 390, "height": 844})
            page.reload(wait_until="networkidle")
            assert page.locator("details.news-archive").evaluate("el => el.open") is False
            page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Mobile horizontal overflow"
            page.locator("details.news-archive > summary").click()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), "Mobile archive overflow"

            noonjs = browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
            noonjs.route("**/*", lambda route: route.continue_() if urlparse(route.request.url).hostname == "127.0.0.1" else route.abort())
            static_page = noonjs.new_page()
            static_page.goto(base + ROUTE)
            body = static_page.locator("body").inner_text()
            assert HERO_TR in body and "Tüm haber arşivi" in body
            assert FEED_ITEMS[0]["title"] in body
            assert SECTOR_NEWS in static_page.content()
            browser.close()
        print("PASS: News hub keeps the archive, shows six picks, and hands sector news to Makine Nabzı.")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
