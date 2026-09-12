"""Check the published HTML, locale links, complete PDFs and the unchanged live lab."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit
import json
import re
import xml.etree.ElementTree as ET
import fitz
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT / '.test-artifacts' / 'la-guide'
OUT.mkdir(parents=True, exist_ok=True)
ORIGIN = 'https://algo-team.com'
ROUTES = {'tr': '/learn/a10vo-la-guc-kontrolu/', 'en': '/learn/a10vo-la-power-control/'}
PDFS = {'tr': '/docs/a10vo-la-guc-kontrolu-detayli-kilavuzu-tr-revb.pdf', 'en': '/docs/a10vo-la-power-controller-detailed-guide-en-revb.pdf'}
LAB = '/hydraulic-simulator/la-power-controller/'

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

# Verify both new routes and previously published guides are still in the sitemap.
xml = ET.fromstring((DIST / 'sitemap.xml').read_text())
urls = [node.text for node in xml.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls) == len(set(urls)), 'Duplicate sitemap URLs'
for route in [*ROUTES.values(), LAB, '/learn/j1939-pgn-nedir/', '/learn/can-bus-ariza-tespiti/', '/learn/dbc-dosyasi-nedir/']:
    assert ORIGIN + route in urls, route
    assert (DIST / route.strip('/') / 'index.html').is_file(), route

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(DIST)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
report = {'checks': [], 'word_counts': {}}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ids = None
        # Prerender means the article, source links, PDF and diagram all exist without JS.
        for lang, route in ROUTES.items():
            ctx = browser.new_context(java_script_enabled=False)
            page = ctx.new_page()
            response = page.goto(base + route, wait_until='load')
            assert response.status == 200
            expect(page.locator('html')).to_have_attribute('lang', lang)
            expect(page.locator('h1')).to_have_count(1)
            expect(page.locator('.la-guide-section')).to_have_count(17)
            expect(page.locator('.la-guide-toc li')).to_have_count(16)
            expect(page.locator('[data-la-download]')).to_have_count(1)
            expect(page.locator('[data-la-download]')).to_have_attribute('href', PDFS[lang])
            expect(page.locator('link[rel="canonical"]')).to_have_attribute('href', ORIGIN + route)
            for alternate, target in ROUTES.items():
                expect(page.locator(f'link[rel="alternate"][hreflang="{alternate}"]')).to_have_attribute('href', ORIGIN + target)
            expect(page.locator('link[hreflang="x-default"]')).to_have_attribute('href', ORIGIN + ROUTES['tr'])
            count = len(re.findall(r'\S+', page.locator('article').inner_text()))
            assert count > 1400, f'{lang}: article was abbreviated ({count} words)'
            report['word_counts'][lang] = count
            section_ids = page.locator('.la-guide-section').evaluate_all('(elements) => elements.map(e => e.id)')
            assert len(section_ids) == len(set(section_ids))
            if ids is None:
                ids = section_ids
            else:
                assert ids == section_ids, 'TR/EN section coverage differs'
            for anchor in page.locator('.la-guide-toc a').all():
                expect(page.locator(anchor.get_attribute('href'))).to_have_count(1)
            schema = json.loads(page.locator('script[type="application/ld+json"]').inner_text())
            article = next(item for item in schema['@graph'] if item['@type'] == 'Article')
            assert article['url'] == ORIGIN + route
            assert article['inLanguage'] == ('tr-TR' if lang == 'tr' else 'en')
            assert len(article['citation']) == 2
            expect(page.locator('.la-guide-figures img')).to_have_count(4)
            for img in page.locator('.la-guide-figures img').all():
                asset = ctx.request.get(base + img.get_attribute('src'))
                assert asset.status == 200 and b'<svg' in asset.body()
            pdf = ctx.request.get(base + PDFS[lang])
            assert pdf.status == 200 and pdf.body().startswith(b'%PDF')
            with fitz.open(stream=pdf.body(), filetype='pdf') as doc:
                assert len(doc) == 15
                assert 'LA' in doc[0].get_text()
            ctx.close()
        report['checks'].append('Both full articles, reciprocal hreflang, canonical, Article/Breadcrumb, source diagrams and 15-page PDF links work without JavaScript')

        # Explicit route locale must override a previously selected different site language.
        for lang in ROUTES:
            ctx = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
            opposite = 'en' if lang == 'tr' else 'tr'
            ctx.add_init_script(f"if(!sessionStorage.getItem('seeded')){{localStorage.setItem('algo-team-language','{opposite}');sessionStorage.setItem('seeded','1');}}")
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
            page.goto(base + ROUTES[lang], wait_until='networkidle')
            expect(page.locator('html')).to_have_attribute('lang', lang)
            assert page.evaluate("localStorage.getItem('algo-team-language')") == lang
            expect(page.locator('[data-la-download]')).to_have_attribute('href', PDFS[lang])
            with page.expect_download() as download_info:
                page.locator('[data-la-download]').click()
            download = download_info.value
            assert download.suggested_filename == PDFS[lang].split('/')[-1]
            with fitz.open(download.path()) as doc:
                assert len(doc) == 15
            page.screenshot(path=str(OUT / f'{lang}-desktop.png'))
            page.locator('#circuit').scroll_into_view_if_needed()
            page.wait_for_function("Array.from(document.querySelectorAll('#circuit img')).every(i=>i.complete && i.naturalWidth>0)")
            page.locator('#circuit').screenshot(path=str(OUT / f'{lang}-schematic.png'))
            page.locator('#variants').scroll_into_view_if_needed()
            page.wait_for_function("Array.from(document.querySelectorAll('#variants img')).every(i=>i.complete && i.naturalWidth>0)")
            page.locator('#variants').screenshot(path=str(OUT / f'{lang}-variants.png'))
            page.locator('#example').screenshot(path=str(OUT / f'{lang}-example.png'))
            page.locator(f'[data-guide-locale="{opposite}"]').click()
            expect(page.locator('html')).to_have_attribute('lang', opposite)
            expect(page.locator('[data-la-download]')).to_have_attribute('href', PDFS[opposite])
            assert urlsplit(page.url).path == ROUTES[opposite]
            assert not errors, errors
            ctx.close()
        report['checks'].append('Hydration, route-selected language, single real PDF download, reciprocal language switch: passed')

        ctx = browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + ROUTES['en'], wait_until='networkidle')
        page.goto(base + '/learn/', wait_until='networkidle')
        expect(page.locator('[data-la-learn]')).to_have_attribute('href', ROUTES['en'])
        page.locator('[data-la-learn]').click()
        expect(page.locator('[data-guide-language]')).to_have_attribute('data-guide-language', 'en')
        page.locator('[data-guide-lab]').click()
        expect(page.locator('#laLearnLink')).to_have_attribute('href', ROUTES['en'])
        expect(page.locator('#value-q')).not_to_have_text('0')
        page.locator('#pressureNumber').fill('200')
        page.locator('#pressureNumber').dispatch_event('change')
        expect(page.locator('#value-q')).to_have_text('52.4')
        page.get_by_role('button', name='TR', exact=True).click()
        expect(page.locator('#laLearnLink')).to_have_attribute('href', ROUTES['tr'])
        expect(page.locator('#value-q')).to_have_text('52,4')
        page.locator('#start').click()
        expect(page.locator('#pause')).to_be_enabled()
        page.locator('#pause').click()
        page.locator('#laLearnLink').click()
        expect(page.locator('[data-la-download]')).to_have_attribute('href', PDFS['tr'])
        assert not errors, errors
        ctx.close()
        report['checks'].append('Learn → article → live lab → article, locale persistence and live 200 bar / 52.4 L/min calculation: passed')

        for lang, route in ROUTES.items():
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.goto(base + route, wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'Mobile page overflow'
            page.screenshot(path=str(OUT / f'{lang}-mobile.png'))
            page.locator('#codes').scroll_into_view_if_needed()
            table = page.locator('#codes .la-guide-table')
            assert table.evaluate('(e) => e.scrollWidth > e.clientWidth'), 'Wide table should scroll inside its container'
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
            page.locator('#codes').screenshot(path=str(OUT / f'{lang}-mobile-table.png'))
            page.locator('#circuit').scroll_into_view_if_needed()
            page.wait_for_function("Array.from(document.querySelectorAll('#circuit img')).every(i=>i.complete && i.naturalWidth>0)")
            page.locator('#circuit').screenshot(path=str(OUT / f'{lang}-mobile-schematic.png'))
            ctx.close()
        report['checks'].append('390px mobile in both languages: no page overflow, readable source schematics, independently scrolling technical table')
        browser.close()
    (OUT / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print('PASS: full TR/EN prerendered guides, SEO metadata, sources, complete PDFs, locale switching, Learn/lab navigation and mobile layout.')
    print(json.dumps(report, ensure_ascii=False))
finally:
    server.shutdown()
    server.server_close()
