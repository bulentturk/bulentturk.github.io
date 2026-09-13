import "./guide-page.css";

const title = "DBC nedir? CAN Bus DBC dosyası nasıl okunur?";
const description = "DBC nedir? CAN mesajlarını sinyallere dönüştüren DBC dosyasını; CAN ID, factor, offset, Intel/Motorola byte order ve örneklerle öğrenin.";
const url = "https://algo-team.com/learn/dbc-dosyasi-nedir/";

export default function DbcGuidePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        image: "https://algo-team.com/assets/og-cover.png",
        inLanguage: "tr-TR",
        datePublished: "2026-08-23",
        dateModified: "2026-09-13",
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
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="guide-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="guide-header">
        <a className="guide-brand" href="/"><img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width="1200" height="206" /></a>
        <nav aria-label="Ana menü"><a href="/">Ana Sayfa</a><a href="/learn/">Learn</a><a href="/tools/">Tools</a><a href="/news/">Haberler</a></nav>
      </header>

      <article>
        <header className="guide-hero">
          <p>ALGO TEAM / CAN & DBC REHBERİ</p>
          <h1>{title}</h1>
          <span>8 dakika · Güncelleme: 13 Eylül 2026</span>
          <p>{description}</p>
          <a href="/dbc-editor/">Online DBC Editörünü aç →</a>
        </header>

        <div className="guide-body">
          <section>
            <h2>DBC nedir?</h2>
            <p><strong>DBC (CAN Database)</strong>, CAN hattındaki ham CAN ID ve veri baytlarını anlamlı mühendislik değerlerine çevirmek için mesaj ve sinyal tanımlarını taşıyan metin tabanlı bir dosyadır. Bir DBC dosyası; mesaj kimliği, DLC, gönderici düğüm, başlangıç biti, bit uzunluğu, Intel/Motorola byte order, signed/unsigned bilgisi, factor, offset, birim ve sınır gibi alanları tanımlar.</p>
            <p>Örneğin CAN kaydında yalnızca <strong>0x18FF50E5</strong> kimliği ve <strong>E0 2E 00 00</strong> gibi ham baytlar görebilirsiniz. Doğru DBC tanımı eklendiğinde bu ham veri motor devri, sıcaklık, basınç veya tork gibi fiziksel değerlere dönüşür. Kısacası DBC, CAN trafiğinin insanlar ve yazılım araçları tarafından okunabilir hale gelmesini sağlayan sözlüktür.</p>
          </section>

          <section>
            <h2>Mesaj ve sinyal tanımı nasıl okunur?</h2>
            <p>Bir mesaj tanımı CAN ID, mesaj adı, DLC ve gönderici düğümünü içerir. Altındaki sinyal tanımı ise bitlerin nasıl yorumlanacağını söyler. Başlangıç biti ve uzunluk sinyalin payload içindeki yerini; Intel veya Motorola byte order bitlerin sırasını; signed/unsigned seçimi ham sayının işaretli olup olmadığını belirler.</p>
            <p>Fiziksel değer çoğunlukla şu ilişkiyle hesaplanır: <strong>fiziksel değer = ham değer × factor + offset</strong>. Örneğin ham değer 12000, factor 0,125 ve offset 0 ise sonuç 1500 rpm olur. Kodlama yönünde bunun tersi kullanılır: <strong>ham değer = (fiziksel değer − offset) / factor</strong>.</p>
          </section>

          <section>
            <h2>Intel ve Motorola byte order neden önemlidir?</h2>
            <p>Intel (little-endian) sinyallerde düşük anlamlı bayt önce gelir. Motorola (big-endian) sinyallerde bit ilerleme yönü farklıdır ve yalnızca baytları ters çevirmek çoğu zaman doğru sonuç vermez. Özellikle birden fazla bayta yayılan veya bayt sınırında başlamayan sinyallerde bit yerleşimini görsel olarak kontrol etmek hatayı erken yakalar.</p>
            <p>DBC düzenlerken önce başlangıç bitini ve uzunluğu, sonra byte order değerini doğrulayın. Aynı bitleri kullanan iki aktif sinyal varsa multiplexing tanımı yoksa çakışma oluşur.</p>
          </section>

          <section>
            <h2>Standard ve Extended CAN kimlikleri</h2>
            <p>Standard CAN çerçevesi 11 bit, Extended CAN çerçevesi 29 bit kimlik kullanır. J1939 trafiği tipik olarak 29 bit Extended kimlik taşır; ancak yüklediğiniz DBC yalnızca Extended olmak zorunda değildir. İyi bir araç, çerçeve biçimini dosyadaki mesaj tanımından okuyup her iki yapıyı da ayrı değerlendirmelidir.</p>
            <p>Kimliği yalnızca sayısal değer olarak karşılaştırmak yeterli değildir. Aynı düşük bitlere sahip Standard ve Extended mesajlar farklı çerçevelerdir; kayıt ve gönderim araçlarında format bilgisini de koruyun.</p>
          </section>

          <section>
            <h2>DBC hazırlarken pratik kontrol listesi</h2>
            <ul>
              <li>CAN ID ve Standard/Extended biçimini doğrulayın.</li>
              <li>DLC ile kullanılan en yüksek sinyal bitinin uyumlu olduğundan emin olun.</li>
              <li>Factor, offset, minimum, maximum ve unit alanlarını gerçek mühendislik birimleriyle karşılaştırın.</li>
              <li>Signed sinyallerde negatif sınırları; Motorola sinyallerde bit yönünü örnek veriyle test edin.</li>
              <li>Dosyayı gerçek ağ kaydıyla doğrulayın; yalnızca sentetik örneğe güvenmeyin.</li>
            </ul>
          </section>

          <section>
            <h2>Sık yapılan hatalar</h2>
            <p>Ondalık CAN kimliğini hexadecimal sanmak, yanlış byte order seçmek, factor ile offset sırasını karıştırmak ve fiziksel sınırı ham değer sınırı gibi kullanmak en sık görülen sorunlardır. Bir diğer hata da DBC dosyasının ağdaki güncel yazılımla aynı sürümde olduğunu doğrulamamaktır.</p>
            <p>Online DBC Editörü ile mesajı ve sinyalleri oluşturabilir, bit yerleşimini kontrol edebilir ve düzenlenmiş dosyayı indirebilirsiniz. Hassas dosyalar tarayıcı içinde işlenir; yine de kurumunuzun veri politikasını uygulayın.</p>
          </section>

          <aside>
            <h2>DBC dosyanızı tarayıcıda inceleyin</h2>
            <p>Mesajları ve sinyalleri görsel olarak düzenleyin; CAN ID, factor, offset, byte order ve Standard/Extended çerçeve bilgisini birlikte kontrol edin.</p>
            <div className="guide-actions">
              <a href="/dbc-editor/">DBC Editörünü aç →</a>
              <a className="secondary" href="/dbc-ecu-simulator/">DBC ECU Simülatörü →</a>
            </div>
          </aside>

          <section className="guide-related">
            <h2>İlgili rehberler</h2>
            <div>
              <a href="/learn/dbc-ile-ecu-simulasyonu/">DBC ile ECU simülasyonu</a>
              <a href="/learn/can-log-analizi/">CAN log analizi nasıl yapılır?</a>
              <a href="/learn/j1939-pgn-nedir/">J1939 PGN nedir?</a>
              <a href="/learn/can-bus-ariza-tespiti/">CAN Bus arıza tespiti</a>
            </div>
          </section>
        </div>
      </article>

      <footer><p>ALGO TEAM · LEARN</p><p>CAN · DBC · J1939</p><p><a href="/learn/">Tüm rehberler</a></p></footer>
    </main>
  );
}
