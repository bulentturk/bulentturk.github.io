import "./guide-page.css";
import "./a10vo-la-guide.css";

const sourcePdf = "https://www.hydropart.ru/upload/files/7889c25889a3e1418b1fa701e1950d39.pdf";

export default function A10voLaGuidePage() {
  const url = "https://algo-team.com/learn/a10vo-la-guc-kontrolu/";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Bosch Rexroth A10VO LA güç kontrolü nasıl çalışır?",
        description: "A10VO Series 32 LA güç kontrolünde eğik plaka, deplasman, basınç, debi, tork ve DR basınç kesmenin nasıl birlikte çalıştığını örneklerle öğrenin.",
        url,
        mainEntityOfPage: url,
        image: "https://algo-team.com/assets/og-cover.png",
        inLanguage: "tr-TR",
        datePublished: "2026-09-12",
        dateModified: "2026-09-12",
        citation: [sourcePdf],
        author: { "@type": "Organization", name: "ALGO TEAM" },
        publisher: {
          "@type": "Organization",
          name: "ALGO TEAM",
          url: "https://algo-team.com/",
          logo: { "@type": "ImageObject", url: "https://algo-team.com/assets/algo-team-logo.png" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ALGO TEAM", item: "https://algo-team.com/" },
          { "@type": "ListItem", position: 2, name: "Learn", item: "https://algo-team.com/learn/" },
          { "@type": "ListItem", position: 3, name: "A10VO LA güç kontrolü", item: url },
        ],
      },
    ],
  };

  return (
    <main className="guide-page la-guide-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="guide-header">
        <a className="guide-brand" href="/"><img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width="1200" height="206" /></a>
        <nav aria-label="Ana menü"><a href="/">Ana Sayfa</a><a href="/learn/">Learn</a><a href="/tools/">Tools</a><a href="/hydraulic-simulator/">Hidrolik Simülatör</a></nav>
      </header>

      <article>
        <header className="guide-hero">
          <p>ALGO TEAM / HİDROLİK REHBERİ</p>
          <h1>Bosch Rexroth A10VO LA güç kontrolü nasıl çalışır?</h1>
          <span>Yaklaşık 18 dakika · Güncelleme: 12 Eylül 2026</span>
          <p>A10VO Series 32 değişken deplasmanlı pompadaki LA regülatörünü; eğik plaka hareketinden sabit tork bölgesine, DR basınç kesmeden LA.DG / LA.S / LA.DS varyantlarına kadar adım adım inceleyin.</p>
          <div className="la-hero-actions">
            <a href="/hydraulic-simulator/la-power-controller/">A10VO LA laboratuvarını aç →</a>
            <div id="laGuideLinks"><a className="secondary" href="/docs/a10vo-la-guc-kontrolu-detayli-kilavuzu-tr-revb.pdf" download>Ayrıntılı kılavuzu indir (Rev B)</a></div>
          </div>
        </header>

        <div className="guide-body">
          <section>
            <h2>Kısa cevap: LA neyi sınırlar?</h2>
            <p>LA regülatörünün temel görevi, pompanın sürücüden istediği torku belirlenmiş karakteristiğin üzerinde büyütmemektir. Basınç yükseldiğinde pompa aynı maksimum deplasmanda kalırsa mil torku hızla artar. LA kontrolü bu noktada eğik plaka açısını küçültür, efektif deplasmanı ve debiyi azaltır; böylece basınç artsa bile mil torku yaklaşık ayar değerinde tutulur.</p>
            <p>Üretici dokümanı bu davranışı “varying pressure with constant drive torque” yaklaşımıyla tanımlar. Sabit devirde tork sabit tutulduğunda mil gücü de yaklaşık sabit görünür. Ancak devir değişirse aynı tork ayarında güç de devirle birlikte değişir. Bu yüzden LA’yı yalnızca “20 kW regülatörü” diye düşünmek eksiktir; özünde bir tork sınırlayıcıdır.</p>
          </section>

          <section>
            <h2>Değişken deplasmanlı A10VO’nun temeli</h2>
            <p>A10VO eksenel pistonlu, eğik plakalı değişken deplasmanlı bir pompadır. Mil döndükçe pistonlar silindir bloğuyla birlikte döner; eğik plakanın açısı pistonların bir turdaki strokunu belirler. Eğik plaka açısı büyüdükçe piston stroku ve bir devirde taşınan yağ hacmi artar. Açı küçüldükçe strok ve deplasman azalır.</p>
            <ul>
              <li><strong>Vg büyük:</strong> bir devirde daha fazla hacim taşınır, debi yükselir.</li>
              <li><strong>Vg küçük:</strong> piston stroku kısalır, debi düşer.</li>
              <li><strong>Vg minimuma yaklaşır:</strong> pompa dönmeye devam eder ancak sisteme yalnız kayıpları karşılayacak kadar debi verir.</li>
            </ul>
            <p>Pompanın debisi yaklaşık olarak <strong>q = Vg · n · ηv / 1000</strong> bağıntısıyla; gerekli mil torku ise <strong>M = Vg · Δp / (20π · ηhm)</strong> bağıntısıyla ilişkilendirilebilir. LA regülatörü doğrudan bu ikinci ilişkinin kritik sonucu üzerinde çalışır: basınç büyürken Vg küçültülürse tork sınırlanabilir.</p>
          </section>

          <section>
            <h2>LA.D devre sembolünü okuyalım</h2>
            <figure className="la-figure">
              <img src="/assets/la/lad.svg" alt="Bosch Rexroth A10VO LA.D güç ve basınç kontrolü hidrolik devre sembolü" loading="lazy" />
              <figcaption>LA.D — güç kontrolü ile yerel basınç kesmenin birlikte kullanıldığı üretici devre gösterimi. Şema, Rexroth RE 92705 veri sayfasındaki kontrol yapısından türetilen web görselidir.</figcaption>
            </figure>
            <p>Şemadaki ana pompa elemanı değişken deplasmanlı A10VO’dur. LA tarafı pompa basıncından aldığı hidrolik etki ile ayar yayı/karakteristiği arasında denge kurar. D tarafındaki basınç regülatörü ise ayrı bir üst basınç sınırı oluşturur. Bu iki kontrol aynı eğik plaka mekanizmasına etki eder; hangi kontrol daha küçük deplasman istiyorsa pompa o yönde destroke olur.</p>
            <p>Burada kritik nokta şudur: LA ve DR aynı şey değildir. LA motoru aşırı torktan korumak için basınca bağlı bir <em>deplasman eğrisi</em> oluşturur. DR ise sistem basıncı ayar değerine ulaştığında pompayı minimum deplasmana doğru götürerek maksimum basıncı sınırlar.</p>
          </section>

          <section>
            <h2>Kontrol sırası: basınç yükselirken ne olur?</h2>
            <ol className="la-steps">
              <li><strong>Düşük basınç:</strong> LA regülatörü henüz sınırlandırma yapmaz. Pompa maksimum deplasmana yakın çalışır ve debi büyük ölçüde Vgmax ile devir tarafından belirlenir.</li>
              <li><strong>Kontrol başlangıcı:</strong> basınç arttıkça pompanın istediği tork LA ayarına yaklaşır. Regülatör bu noktadan sonra eğik plakayı küçültmeye başlar.</li>
              <li><strong>Sabit tork bölgesi:</strong> basınç yükselmeye devam ederken Vg azalır. Sonuç olarak debi düşer fakat pompa milindeki tork yaklaşık aynı seviyede kalır.</li>
              <li><strong>Basınç kesme:</strong> LA.D veya LA.DG’de sistem basıncı DR/DRG ayarına ulaştığında basınç regülatörü öncelik kazanır ve pompayı minimum stroka doğru götürür.</li>
            </ol>
            <p>Bu davranışın makinedeki sonucu çok nettir: yük ağırlaştığında aktüatör hızının düşmesi her zaman “pompa yetersiz” anlamına gelmez. Pompa, dizel motoru veya elektrik motorunu aşırı torktan korumak için bilinçli olarak debiyi azaltıyor olabilir.</p>
          </section>

          <section>
            <h2>Neden “20 kW @ 1500 d/dak” aslında tork ayarıdır?</h2>
            <p>Örnek bir fabrika ayarı 20 kW @ 1500 d/dak olsun. Güç-tork ilişkisi <strong>P = 2π · M · n / 60000</strong> olduğundan bu ayar yaklaşık <strong>127,3 Nm</strong> torka karşılık gelir.</p>
            <div className="guide-code-list">
              <pre><code>Mset = 20 × 60000 / (2π × 1500) ≈ 127,3 Nm</code></pre>
              <pre><code>1000 d/dak → aynı 127,3 Nm ≈ 13,3 kW</code></pre>
              <pre><code>1500 d/dak → aynı 127,3 Nm ≈ 20,0 kW</code></pre>
              <pre><code>2000 d/dak → aynı 127,3 Nm ≈ 26,7 kW</code></pre>
            </div>
            <p>Bu nedenle motor devri değişken bir mobil makinede “LA pompa her koşulda 20 kW çeker” demek doğru değildir. Sabit kalan karakteristik torktur; güç, gerçek pompa devrine göre değişir.</p>
          </section>

          <section>
            <h2>NG71 için çalışma örneği</h2>
            <p>NG71 pompa, 71,1 cm³/dev maksimum deplasman, 1500 d/dak, ηv = 0,95 ve ηhm = 0,92 varsayalım. LA ayarı 20 kW @ 1500 d/dak olduğunda tork limiti yaklaşık 127,3 Nm ve kontrol başlangıcı yaklaşık 103,5 bar çıkar.</p>
            <div className="guide-table-wrap"><table><thead><tr><th>Basınç</th><th>Efektif Vg</th><th>Yaklaşık debi</th><th>Mil torku</th><th>Mil gücü</th></tr></thead><tbody>
              <tr><td>80 bar</td><td>71,1 cm³/dev</td><td>101,3 L/dak</td><td>98,4 Nm</td><td>15,5 kW</td></tr>
              <tr><td>104 bar</td><td>≈70,8 cm³/dev</td><td>≈100,9 L/dak</td><td>≈127,3 Nm</td><td>≈20,0 kW</td></tr>
              <tr><td>150 bar</td><td>≈49,1 cm³/dev</td><td>≈69,9 L/dak</td><td>≈127,3 Nm</td><td>≈20,0 kW</td></tr>
              <tr><td>200 bar</td><td>≈36,8 cm³/dev</td><td>≈52,4 L/dak</td><td>≈127,3 Nm</td><td>≈20,0 kW</td></tr>
              <tr><td>250 bar</td><td>≈29,4 cm³/dev</td><td>≈42,0 L/dak</td><td>≈127,3 Nm</td><td>≈20,0 kW</td></tr>
            </tbody></table></div>
            <p>250 bar’da LA müdahalesi olmasaydı pompa 71,1 cm³/dev tam deplasmanda yaklaşık 307,5 Nm mil torku ve 48 kW’ın üzerinde mil gücü isteyebilirdi. LA kontrolünün makine motorunu koruyan etkisi bu karşılaştırmada açıkça görülür.</p>
          </section>

          <section>
            <h2>LA5, LA6, LA7, LA8 ve LA9 ne ifade eder?</h2>
            <p>Veri sayfasındaki LA5–LA9 seçenekleri tek başına bir güç değeri değildir. Pompa boyutuna bağlı izin verilen tork aralığı ve buna karşılık gelen kontrol başlangıç basıncı bölgelerini tanımlar. NG71 için örnek 127,3 Nm ayar, veri sayfasındaki LA7 aralığına düşer.</p>
            <div className="guide-table-wrap"><table><thead><tr><th>Sınıf</th><th>Kontrol başlangıcı</th><th>NG71 tork aralığı</th></tr></thead><tbody>
              <tr><td>LA5</td><td>≤ 50 bar</td><td>≤ 67 Nm</td></tr>
              <tr><td>LA6</td><td>51–90 bar</td><td>67,1–121 Nm</td></tr>
              <tr><td>LA7</td><td>91–160 bar</td><td>121,1–213 Nm</td></tr>
              <tr><td>LA8</td><td>161–240 bar</td><td>213,1–319 Nm</td></tr>
              <tr><td>LA9</td><td>&gt; 240 bar</td><td>&gt; 319,1 Nm</td></tr>
            </tbody></table></div>
            <p>Pompa sipariş kodunda doğru LA sınıfı seçilirken yalnız nominal motor gücüne değil; gerçek pompa devrine, izin verilen sürekli/tepe torka, maksimum sistem basıncına ve üreticinin karakteristik eğrilerine birlikte bakılmalıdır.</p>
          </section>

          <section>
            <h2>LA.DG, LA.S ve LA.DS farkları</h2>
            <div className="la-variant-grid">
              <figure className="la-figure"><img src="/assets/la/ladg.svg" alt="A10VO LA.DG uzaktan basınç kesme devresi" loading="lazy" /><figcaption><strong>LA.DG:</strong> güç kontrolü + X hattı üzerinden uzaktan ayarlanabilen basınç kesme.</figcaption></figure>
              <figure className="la-figure"><img src="/assets/la/las.svg" alt="A10VO LA.S debi kontrolü devresi" loading="lazy" /><figcaption><strong>LA.S:</strong> güç kontrolüne ek olarak harici ölçüm orifisi üzerinden debi kontrolü.</figcaption></figure>
              <figure className="la-figure"><img src="/assets/la/lads.svg" alt="A10VO LA.DS basınç ve debi kontrolü devresi" loading="lazy" /><figcaption><strong>LA.DS:</strong> güç kontrolü, basınç kesme ve debi kontrolünün birlikte kullanıldığı kombinasyon.</figcaption></figure>
            </div>
            <p>LA.S / LA.DS tarafındaki debi kontrolü, ölçüm orifisi üzerindeki basınç farkına göre pompanın deplasmanını talebe uydurur. Veri sayfası bu kombinasyonlarda deplasmanı azaltan kontrolün öncelikli olduğunu belirtir. Yani güç kontrolü daha küçük Vg istiyorsa debi kontrolünün istediği daha yüksek deplasman uygulanmaz; tork sınırı korunur.</p>
          </section>

          <section>
            <h2>DR ve DRG basınç kesmeyi LA’dan ayırın</h2>
            <p>DR kontrolü pompanın maksimum çıkış basıncını sınırlar. Basınç ayar noktasına yaklaştığında pompa minimum deplasmana doğru destroke edilir. Veri sayfasındaki standart ayar 280 bar olarak verilir. DRG varyantında basınç referansı X portundan harici bir basınç tahliye valfi ile uzaktan belirlenebilir.</p>
            <p>DRG için veri sayfası standart kontrol farkını yaklaşık 20 bar olarak verir; X hattının tanka açılması pompayı yaklaşık bu fark basıncı seviyesinde standby durumuna götürebilir. Gerçek sistemde hat kayıpları, harici valf karakteristiği ve pilot tüketimi sonucu etkiler.</p>
          </section>

          <section>
            <h2>Sahada hangi belirtiler ne anlatır?</h2>
            <ul>
              <li>Basınç yükselirken debi düşüyor ve motor yükü sınırlı kalıyorsa LA kontrol bölgesinde olabilirsiniz.</li>
              <li>Basınç kontrol ayarına yaklaşıp debi neredeyse sıfıra düşüyorsa DR/DRG basınç kesme devrededir.</li>
              <li>Basınç düşük olduğu halde debi talebe göre sınırlanıyorsa LA.S / LA.DS debi kontrolü veya harici orifis koşulları incelenmelidir.</li>
              <li>Pompa beklenenden erken destroke oluyorsa LA tork ayarı, gerçek pompa devri, pilot basıncı ve mekanik yük birlikte kontrol edilmelidir.</li>
              <li>Teşhiste yalnız basınca bakmayın; pompa devri, debi, motor tork/yük yüzdesi ve mümkünse eğik plaka/deplasman bilgisi aynı zaman ekseninde değerlendirilmelidir.</li>
            </ul>
          </section>

          <section>
            <h2>Simülatörde deneyin</h2>
            <p>ALGO TEAM A10VO LA laboratuvarında pompa boyutunu, çalışma basıncını, devri, LA tork/güç ayarını ve kontrol varyantını değiştirerek aynı davranışı sayısal olarak gözlemleyebilirsiniz. p–Q haritasındaki çalışma noktasıyla debi, Vg, tork, mil gücü ve hidrolik gücü birlikte izleyin.</p>
            <p>Başlangıç deneyi olarak NG71, 1500 d/dak ve 20 kW @ 1500 ayarını seçin. Basıncı 80 bar’dan 200 bar’a yükselttiğinizde yaklaşık 103–104 bar sonrasında Vg ve debinin düşmeye başladığını; torkun ise yaklaşık 127 Nm civarında kaldığını görmelisiniz.</p>
          </section>

          <section>
            <h2>Modelin sınırı</h2>
            <p>Bu rehber ve çevrimiçi laboratuvar eğitim amaçlı yarı-statik bir modeldir. Gerçek spool/servo geçici rejimi, yay toleransları, hidrolik sıkışabilirlik, detaylı kaçak haritaları, pilot hattı dinamiği ve sıcaklığa bağlı verim değişimleri birebir çözülmez. Nihai pompa seçimi ve makine emniyeti için güncel Bosch Rexroth teknik verisi, sipariş kodu ve makinenin gerçek çalışma ölçümleri kullanılmalıdır.</p>
          </section>

          <section className="guide-sources">
            <h2>Kaynaklar ve kapsam</h2>
            <div>
              <p>Bu sayfadaki pompa denklemleri, LA kontrol prensibi, LA5–LA9 bölgeleri ve LA.D / LA.DG / LA.S / LA.DS yapılandırmaları Bosch Rexroth A10VO Series 32 veri sayfasındaki bilgiler temel alınarak özgün biçimde açıklanmıştır. Hesap örnekleri aynı denklemlerden türetilmiştir.</p>
              <ul>
                <li><a href={sourcePdf} rel="noreferrer">Bosch Rexroth — A10VO Series 32, RE 92705/2019-03-25 (PDF)</a></li>
                <li><a href="/hydraulic-simulator/la-power-controller/">ALGO TEAM — A10VO LA etkileşimli laboratuvarı</a></li>
              </ul>
            </div>
          </section>

          <aside>
            <h2>Şimdi davranışı canlı görün</h2>
            <p>Teoriyi okuduktan sonra aynı ayarları laboratuvarda değiştirin. Özellikle kontrol başlangıç basıncı, sabit tork bölgesi ve DR kesme bölgesini art arda deneyin.</p>
            <div className="guide-actions"><a href="/hydraulic-simulator/la-power-controller/">LA laboratuvarını aç →</a><a className="secondary" href="/hydraulic-simulator/">Tam hidrolik simülatör →</a></div>
          </aside>
        </div>
      </article>

      <footer><p>ALGO TEAM · LEARN</p><p>Hidrolik · Mobil iş makineleri · Sistem davranışı</p><p><a href="/learn/">Tüm rehberler</a></p></footer>
    </main>
  );
}
