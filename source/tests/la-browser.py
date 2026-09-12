"""Smoke-test the actual built production bundle, not a source-only preview."""
import functools, http.server, pathlib, threading, os
import fitz
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE=os.environ.get('LA_TEST_URL','http://127.0.0.1:8812')
server=None
if not os.environ.get('LA_TEST_URL'):
    handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT/'dist'))
    server=http.server.ThreadingHTTPServer(('127.0.0.1',8812),handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as api:
    browser=api.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1536,'height':1040})
    errors=[];bad=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:bad.append((response.status,response.url)) if response.url.startswith(BASE) and response.status>=400 else None)
    path='/hydraulic-simulator/la-power-controller/'
    page.goto(BASE+path,wait_until='load')
    page.wait_for_selector('#value-q')
    def value(key):return float(page.locator('#value-'+key).get_attribute('data-value'))
    def change(key,v):
        el=page.locator('#'+key+'Number');el.fill(str(v));el.dispatch_event('change')
    assert abs(value('q')-101.3175)<.001
    assert page.locator('#envelope').get_attribute('points')
    assert page.locator('#operating-point').count()==1
    change('pressure',200)
    assert abs(value('q')-52.44)<.001 and abs(value('M')-127.323954)<.001 and abs(value('shaft')-20)<.001
    change('speed',1000);assert abs(value('shaft')-13.333333)<.001
    page.locator('#start').click();page.wait_for_timeout(400)
    assert page.locator('#trace-line').count()==1
    page.locator('#pause').click();before=page.locator('#runLabel').text_content();page.wait_for_timeout(200);assert before==page.locator('#runLabel').text_content()
    with page.expect_download() as dl:page.locator('#csv').click()
    assert pathlib.Path(dl.value.path()).read_text().startswith('time_s,pump_pressure_bar')
    page.locator('#reset').click();assert abs(value('q')-101.3175)<.001
    for variant in ['LAD','LADG','LAS','LADS']:
        page.locator('#variant').select_option(variant)
        page.wait_for_function('document.getElementById("schematic").complete && document.getElementById("schematic").naturalWidth > 0')
    change('pressure',100);change('demand',35)
    assert abs(value('p')-114)<.001 and abs(value('q')-35)<.001
    for lang in ['tr','en']:
        page.locator('[data-site-lang="'+lang+'"]').click()
        assert page.locator('#guideDownload').count()==1
        link=page.locator('#guideDownload').get_attribute('href');assert lang+'-revb.pdf' in link
        with page.expect_download() as dl:page.locator('#guideDownload').click()
        doc=fitz.open(dl.value.path());assert len(doc)==15
        assert '127.3' in ''.join(p.get_text() for p in doc).replace(',','.')
    page.reload(wait_until='load');page.wait_for_selector('#value-q')
    assert page.locator('html').get_attribute('lang')=='en'
    assert 'en-revb.pdf' in page.locator('#guideDownload').get_attribute('href')
    page.goto(BASE+'/',wait_until='load');page.wait_for_timeout(600)
    assert page.evaluate('localStorage.getItem("algo-team-language")')=='en'
    page.goto(BASE+'/hydraulic-simulator/',wait_until='load')
    page.wait_for_selector('#laGuideDownload',timeout=12000)
    assert page.locator('#laGuideLinks a[href*="/docs/a10vo-la-"]').count()==1
    assert 'en-revb.pdf' in page.locator('#laGuideDownload').get_attribute('href')
    page.goto(BASE+path,wait_until='load');page.wait_for_selector('#demo');page.locator('#demo').click()
    page.wait_for_function('document.getElementById("runLabel").textContent.includes("PAUSED")',timeout=16000)
    assert value('p')==280 and value('q')==0
    page.screenshot(path=str(ROOT/'la-desktop-check.png'),full_page=True)
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.goto(BASE+path,wait_until='load');mobile.wait_for_selector('#value-q')
    assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
    mobile.screenshot(path=str(ROOT/'la-mobile-check.png'),full_page=True)
    assert not errors,errors
    assert not bad,bad
    print('PASS: production modules, charts, controls, four schematics, TR/EN 15-page downloads, site language, CSV, automatic experiment, 390px mobile.')
    browser.close()
if server:server.shutdown()
