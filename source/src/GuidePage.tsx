import "./guide-page.css";

export type GuideSlug =
  | "dbc-dosyasi-nedir"
  | "can-log-analizi"
  | "j1939-dm1-spn-fmi-cozumleme"
  | "dbc-ile-ecu-simulasyonu";

const guides = {
  "dbc-dosyasi-nedir": {
    title: "DBC dosyası nedir? CAN mesaj ve sinyal rehberi",
    description: "DBC dosyasındaki mesaj, sinyal, factor, offset, byte order ve Standard/Extended CAN alanlarını uygulamalı olarak öğrenin.",
    readTime: "8 dakika",
    datePublished: "2026-08-23",
    dateModified: "2026-08-23",
    updatedLabel: "23 Ağustos 2026",
    tool: { href: "/dbc-editor/", label: "Online DBC Editörünü aç" },
    sections: [
      { title: "Kısa cevap", paragraphs: ["DBC, bir CAN ağındaki ham baytların hangi fiziksel anlamlara geldiğini tanımlayan metin tabanlı bir veritabanıdır. Bir mesajın CAN kimliği, uzunluğu ve gönderici düğümü ile her sinyalin başlangıç biti, bit uzunluğu, byte order, işaret bilgisi, ölçeği, offset değeri, birimi ve sınırları aynı dosyada tutulabilir.", "CAN kaydında gördüğünüz 18 FF 50 E5 gibi bir kimlik ve E0 2E 00 00 gibi baytlar tek başına yalnızca ham veridir. DBC eklendiğinde aynı veri motor devri, sıcaklık veya basınç gibi anlaşılır değerlere dönüşür."] },
      { title: "Mesaj ve sinyal tanımı nasıl okunur?", paragraphs: ["Bir mesaj tanımı CAN ID, mesaj adı, DLC ve gönderici düğümünü içerir. Altındaki sinyal tanımı ise bitlerin nasıl yorumlanacağını söyler. Başlangıç biti ve uzunluk sinyalin payload içindeki yerini; Intel veya Motorola byte order bitlerin sırasını; signed/unsigned seçimi ham sayının işaretli olup olmadığını belirler.", "Fiziksel değer çoğunlukla şu ilişkiyle hesaplanır: fiziksel değer = ham değer × factor + offset. Örneğin ham değer 12000, factor 0,125 ve offset 0 ise sonuç 1500 rpm olur. Kodlama yönünde bunun tersi kullanılır: ham değer = (fiziksel değer − offset) / factor."] },
      { title: "Intel ve Motorola byte order neden önemlidir?", paragraphs: ["Intel (little-endian) sinyallerde düşük anlamlı bayt önce gelir. Motorola (big-endian) sinyallerde bit ilerleme yönü farklıdır ve yalnızca baytları ters çevirmek çoğu zaman doğru sonuç vermez. Özellikle birden fazla bayta yayılan veya bayt sınırında başlamayan sinyallerde bit yerleşimini görsel olarak kontrol etmek hatayı erken yakalar.", "DBC düzenlerken önce başlangıç bitini ve uzunluğu, sonra byte order değerini doğrulayın. Aynı bitleri kullanan iki aktif sinyal varsa multiplexing tanımı yoksa çakışma oluşur."] },
      { title: "Standard ve Extended CAN kimlikleri", paragraphs: ["Standard CAN çerçevesi 11 bit, Extended CAN çerçevesi 29 bit kimlik kullanır. J1939 trafiği tipik olarak 29 bit Extended kimlik taşır; ancak yüklediğiniz DBC yalnızca Extended olmak zorunda değildir. İyi bir araç, çerçeve biçimini dosyadaki mesaj tanımından okuyup her iki yapıyı da ayrı değerlendirmelidir.", "Kimliği yalnızca sayısal değer olarak karşılaştırmak yeterli değildir. Aynı düşük bitlere sahip Standard ve Extended mesajlar farklı çerçevelerdir; kayıt ve gönderim araçlarında format bilgisini de koruyun."] },
      { title: "DBC hazırlarken pratik kontrol listesi", list: ["CAN ID ve Standard/Extended biçimini doğrulayın.", "DLC ile kullanılan en yüksek sinyal bitinin uyumlu olduğundan emin olun.", "Factor, offset, minimum, maximum ve unit alanlarını gerçek mühendislik birimleriyle karşılaştırın.", "Signed sinyallerde negatif sınırları; Motorola sinyallerde bit yönünü örnek veriyle test edin.", "Dosyayı gerçek ağ kaydıyla doğrulayın; yalnızca sentetik örneğe güvenmeyin."] },
      { title: "Sık yapılan hatalar", paragraphs: ["Ondalık CAN kimliğini hexadecimal sanmak, yanlış byte order seçmek, factor ile offset sırasını karıştırmak ve fiziksel sınırı ham değer sınırı gibi kullanmak en sık görülen sorunlardır. Bir diğer hata da DBC dosyasının ağdaki güncel yazılımla aynı sürümde olduğunu doğrulamamaktır.", "Online DBC Editörü ile mesajı ve sinyalleri oluşturabilir, bit yerleşimini kontrol edebilir ve düzenlenmiş dosyayı indirebilirsiniz. Hassas dosyalar tarayıcı içinde işlenir; yine de kurumunuzun veri politikasını uygulayın."] },
    ],
  },
  "can-log-analizi": {
    title: "CAN log analizi nasıl yapılır? TRC, ASC, CSV ve DBC",
    description: "CAN kayıtlarında mesaj periyodu, jitter, kayıp mesaj ve DBC sinyallerini sistemli biçimde incelemek için uygulamalı iş akışı.",
    readTime: "9 dakika",
    datePublished: "2026-08-23",
    dateModified: "2026-08-23",
    updatedLabel: "23 Ağustos 2026",
    tool: { href: "/can-log-analyzer/", label: "CAN Log Analiz aracını aç" },
    sections: [
      { title: "Önce doğru soruyu kurun", paragraphs: ["CAN log analizi, binlerce satır içinde değişen baytı aramaktan ibaret değildir. Önce belirtinin ne zaman oluştuğunu, hangi ECU veya fonksiyonla ilişkili olduğunu ve beklenen davranışı yazın. Kayıtta bu anı işaretleyebilecek operatör komutu, anahtar durumu ya da hata olayı varsa zaman çizelgesini daraltmak kolaylaşır.", "Kayıt hiç mesaj içermiyorsa veya hata yük altında ortaya çıkıyorsa önce fiziksel katmanı doğrulayın: terminasyon, CAN-H/CAN-L seviyeleri, bitrate, toprak referansı ve bağlantı kalitesi yazılım analizinden önce gelir."] },
      { title: "Log biçimleri: TRC, ASC, CSV ve candump", paragraphs: ["PCAN araçları sıklıkla TRC, Vector ekosistemi ASC, özel kayıtçılar CSV ve Linux SocketCAN ise candump biçimi üretir. Başlık, zaman damgası birimi ve kolon sırası sürüme göre değişebilir. Analiz aracı formatı tanısa bile ilk birkaç satırdaki zamanı, CAN ID'yi, yönü, DLC'yi ve payload'ı elle kontrol edin.", "Mutlak tarih yerine başlangıçtan geçen süre verilmiş olabilir. Mikrosaniye ile milisaniyeyi karıştırmak, periyot ve jitter sonuçlarını bin kat hatalı gösterir."] },
      { title: "Mesaj periyodu ve jitter nasıl yorumlanır?", paragraphs: ["Önce CAN ID başına mesaj sayısını ve medyan periyodu çıkarın. Beklenen 100 ms'lik mesajın aralıkları 99–101 ms ise küçük bir zamanlama değişimi vardır. Arada 300 ms boşluk görülmesi iki çevrimin kaçırıldığını düşündürebilir; ancak kayıtçının paket kaybı, bus load ve filtre ayarı da kontrol edilmelidir.", "Jitter, ardışık mesaj aralıklarının beklenen periyottan sapmasıdır. Tek bir yüksek değer arızayı kanıtlamaz. Dağılımı, zaman içindeki kümelenmeyi ve aynı anda diğer mesajlarda oluşan boşlukları birlikte değerlendirin."] },
      { title: "DBC ile sinyal çözümleme", paragraphs: ["DBC yüklediğinizde ham payload içindeki sinyalleri fiziksel değerlere çevirebilirsiniz. Önce mesaj kimliğinin ve çerçeve biçiminin eşleştiğini doğrulayın. Sonra byte order, signed bilgisi, factor ve offset alanlarını bilinen bir çalışma noktasıyla test edin.", "Grafikte görülen ani sıçrama gerçek bir sensör değişimi olmayabilir. Geçersiz/değer-yok kodu, multiplexing seçimi, taşma veya DBC sürüm farkı aynı görüntüyü oluşturabilir. Ham baytı ve çözülmüş değeri yan yana tutmak bu nedenle önemlidir."] },
      { title: "Tekrarlanabilir analiz sırası", list: ["Belirtiyi ve zaman aralığını belirleyin.", "Kayıt biçimi, bitrate ve zaman birimini doğrulayın.", "CAN ID başına sayım, periyot, jitter ve boşluk özetini çıkarın.", "İlgili mesajı ham bayt değişimiyle inceleyin.", "Doğru DBC sürümünü ekleyip sinyali fiziksel birimde karşılaştırın.", "Sonucu bağımsız ölçüm veya kontrollü tekrar testiyle doğrulayın."] },
      { title: "Raporlarken neyi saklamalısınız?", paragraphs: ["Kullanılan DBC sürümünü, kayıt aracını, filtreyi, saat kaynağını ve test koşulunu rapora ekleyin. Sorunu gösteren kısa zaman aralığını paylaşırken müşteri veya proje bilgilerini ayıklayın. CAN Log Analiz aracı kayıtları tarayıcıda işleyerek zamanlama özetini ve sinyal incelemesini tek yerde yapmanıza yardım eder."] },
    ],
  },
  "j1939-dm1-spn-fmi-cozumleme": {
    title: "J1939 DM1 mesajı nasıl çözülür? SPN, FMI ve OC rehberi",
    description: "J1939 DM1 (PGN 65226) mesajında lamba durumlarını, SPN, FMI, OC ve CM alanlarını ham CAN verisinden adım adım çözümleyin.",
    readTime: "10 dakika",
    datePublished: "2026-09-08",
    dateModified: "2026-09-08",
    updatedLabel: "8 Eylül 2026",
    tool: { href: "/j1939-dtc-decoder/", label: "J1939 DTC Decoder'ı aç" },
    sections: [
      { title: "DM1 nedir?", paragraphs: ["DM1, J1939 ağındaki kontrol ünitelerinin o anda aktif olan teşhis arıza kodlarını ve ikaz lambası durumlarını yayımladığı mesajdır. PGN değeri 65226, hexadecimal karşılığı 0xFECA'dır. Bir DM1 kaydını doğru yorumlamak için yalnız SPN ve FMI'ye değil; mesajı gönderen source address'e, lamba durumlarına, occurrence count değerine ve zaman içindeki tekrarına birlikte bakın.", "DM1 aktif arızaları taşır. Geçmişte oluşmuş fakat artık aktif olmayan arızalar için farklı teşhis mesajları kullanılabilir. Bu nedenle kayıtta bir DM1 görememek, ECU'da hiçbir geçmiş arıza olmadığı anlamına gelmez."] },
      { title: "29-bit CAN kimliğinden PGN ve kaynak adresi", paragraphs: ["J1939, 29-bit Extended CAN kimliği içinde priority, data page, PDU format, PDU specific ve source address alanlarını taşır. Örneğin 0x18FECA00 kimliğinde 0xFECA, DM1 PGN'sini; son byte olan 0x00 ise mesajı gönderen ECU'nun source address değerini gösterir.", "Aynı PGN farklı ECU'lardan gelebilir. Motor ECU'su ve başka bir kontrol ünitesi aynı teşhis PGN'sini yayımlıyorsa yalnız PGN'ye göre filtre uygulamak kayıtları birbirine karıştırır. CAN ID ile birlikte source address'i de saklayın."] },
      { title: "DM1 payload yapısı", paragraphs: ["DM1 payload'ının ilk iki byte'ı dört ikaz lambasının komut ve yanıp sönme durumlarını taşır: MIL, kırmızı stop, sarı ikaz ve koruma lambası. Sonraki alanlar dörder byte'lık DTC kayıtlarıdır. Tek bir klasik CAN çerçevesine sığmayan DM1 mesajları J1939 Transport Protocol üzerinden BAM ve TP.DT paketleriyle taşınabilir.", "Bir DTC kaydında ilk 19 bit SPN'yi, sonraki 5 bit FMI'yi taşır. Dördüncü byte'ın alt 7 biti OC değeridir; en yüksek bit ise SPN dönüşüm yöntemini belirten CM alanıdır. 0x7F OC değeri kullanılamıyor veya bilinmiyor anlamına gelebilir."] },
      { title: "SPN, FMI, OC ve CM ne anlatır?", list: ["SPN (Suspect Parameter Number), arızayla ilişkili parametreyi veya fonksiyonu tanımlar.", "FMI (Failure Mode Identifier), değerin yüksek, düşük, düzensiz, devre açık veya kısa devre gibi hangi arıza biçiminde olduğunu belirtir.", "OC (Occurrence Count), ECU'nun ilgili arızanın oluşum sayısı için bildirdiği değerdir; tek başına arıza süresini göstermez.", "CM (Conversion Method), SPN bitlerinin güncel veya eski yerleşim yöntemine göre yorumlanacağını belirtir.", "Source address, arızayı hangi ECU'nun raporladığını ayırır; aynı SPN/FMI farklı kaynaklardan gelebilir."] },
      { title: "Ham DM1 mesajını adım adım çözme", paragraphs: ["Örnek mesaj 0x18FECA00 kimliği ve 04 FF 5B 00 03 02 FF FF payload'ı ile gelsin. Kimlikteki PGN 0xFECA olduğu için mesaj DM1'dir; source address 0x00'dır. İlk iki byte lamba alanıdır. 0x04 komut byte'ı sarı ikaz lambasının aktif olduğunu, 0xFF ise yanıp sönme alanlarında mevcut olmayan veya desteklenmeyen durumları gösterebilir.", "DTC alanı 5B 00 03 02 olarak okunur. Güncel CM=0 yerleşiminde SPN değeri 91, FMI değeri 3 ve OC değeri 2 olur. Bu sonuç, ilgili parametrede gerilim yüksek veya üst hatta kısa devre türünde bir durum raporlandığını söyler; arızalı parçayı tek başına kanıtlamaz."] },
      { title: "Tek paket ve BAM / TP.DT farkı", paragraphs: ["İki lamba byte'ı ve bir DTC kaydı klasik sekiz byte'lık çerçeveye sığabilir. Birden fazla DTC olduğunda veri büyür ve ECU, TP.CM içindeki BAM duyurusunu ardından sıralı TP.DT paketlerini kullanabilir. Analiz sırasında paket sıra numarası, toplam byte sayısı, beklenen paket adedi, source address ve taşınan PGN birlikte doğrulanmalıdır.", "Eksik bir TP.DT paketi veya başka ECU'ya ait paketin yanlış oturuma eklenmesi sahte SPN/FMI sonuçları üretir. Çok paketli mesaj önce eksiksiz birleştirilmeli, DM1 çözümlemesi bundan sonra yapılmalıdır."] },
      { title: "Koddan kök nedene geçiş", list: ["CAN ID, source address, SPN, FMI, OC ve lamba durumunu aynı kayıt içinde saklayın.", "Arızanın ilk ve son görülme zamanını, tekrar sayısını ve aktif kalma süresini çıkarın.", "Aynı anda motor devri, sıcaklık, basınç, besleme gerilimi ve operatör komutu gibi bağlam sinyallerini karşılaştırın.", "SPN açıklamasını ve teşhis adımlarını ilgili üreticinin güncel servis dokümanından doğrulayın.", "Sensör, tesisat, konnektör ve besleme ölçümlerini tamamlamadan yalnız koda bakarak parça değiştirmeyin."] },
      { title: "Sık yapılan hatalar", paragraphs: ["29-bit kimliği Standard CAN gibi yorumlamak, PGN ile source address'i ayırmamak, FMI'yi parça adı sanmak ve OC değerini arızanın süresi gibi okumak en sık görülen hatalardır. Bir başka hata, çok paketli DM1 tamamlanmadan DTC byte'larını çözmeye çalışmaktır.", "SPN adları ve üreticiye özgü servis açıklamaları her zaman kamuya açık değildir. J1939 DTC Decoder ham DM1 yapısını DBC olmadan çözebilir; fakat arıza anındaki motor değerleri ve üreticiye özgü açıklamalar için doğru sürümde lisanslı DBC veya servis dokümanı kullanın."] },
    ],
  },
  "dbc-ile-ecu-simulasyonu": {
    title: "DBC ile ECU simülasyonu: CAN ve J1939 mesajı gönderme",
    description: "DBC dosyasından mesaj seçip sinyal değerlerini fiziksel birimlerle değiştirerek Standard veya Extended CAN çerçevesi üretme rehberi.",
    readTime: "9 dakika",
    datePublished: "2026-08-23",
    dateModified: "2026-08-23",
    updatedLabel: "23 Ağustos 2026",
    tool: { href: "/dbc-ecu-simulator/", label: "DBC ECU Simülatörünü aç" },
    sections: [
      { title: "ECU simülatörü ne yapar?", paragraphs: ["DBC tabanlı ECU simülatörü, bir ağ düğümünün yayınlayacağı mesajları DBC dosyasından bulur ve her sinyal için anlaşılır bir kontrol üretir. Kullanıcı sıcaklık, basınç veya devir gibi fiziksel değeri değiştirir; araç factor, offset, bit uzunluğu, byte order ve signed tanımını kullanarak CAN payload'ını oluşturur.", "Bu yaklaşım HMI, gateway veya kontrol yazılımını gerçek ECU hazır olmadan sınamak için kullanışlıdır. Ancak gerçek araç ağına mesaj enjekte etmek beklenmeyen hareket veya arızaya yol açabilir. İzole tezgâh, doğru terminasyon, acil durdurma ve yetkili test prosedürü şarttır."] },
      { title: "DBC'den mesaj oluşturma akışı", list: ["DBC dosyasını yükleyin ve simüle edeceğiniz ECU düğümünü seçin.", "Gönderilecek mesajı ve Standard/Extended çerçeve biçimini doğrulayın.", "Sinyallerin başlangıç değeri, sınırı ve birimini kontrol edin.", "Fiziksel değerleri ayarlayın ve oluşan ham baytları beklenen örnekle karşılaştırın.", "Önce tek seferlik gönderim yapın; doğrulamadan sonra güvenli bir periyot seçin."] },
      { title: "Fiziksel değerden ham değere örnek", paragraphs: ["Bir motor devri sinyali 16 bit unsigned, Intel byte order, factor 0,125 ve offset 0 olarak tanımlansın. 1500 rpm göndermek için ham değer (1500 − 0) / 0,125 = 12000 olur. 12000 sayısı hexadecimal 0x2EE0'dir; little-endian yerleşimde ilgili iki bayt E0 2E görünür.", "Bu örnek yalnızca sinyal başlangıç biti bayt sınırındaysa doğrudan böyledir. Sinyal farklı bitte başlıyorsa diğer sinyallerle aynı payload içine bit maskesiyle yerleştirilir. Simülatörün gösterdiği ham payload'ı bilinen bir referansla doğrulamak bu yüzden değerlidir."] },
      { title: "Standard, Extended ve J1939 mesajları", paragraphs: ["DBC dosyası 11 bit Standard veya 29 bit Extended kimlikler içerebilir; simülatör ikisini de tanımdaki biçime göre ele almalıdır. J1939, 29 bit kimlik içinde priority, PGN ve source address alanlarını taşır. Aynı PGN farklı kaynak adreslerinden gelebileceği için yalnızca PGN'ye bakarak ECU ayırmak yeterli değildir.", "Gönderim öncesinde bitrate ve kanal ayarı ağla aynı olmalıdır. Yanlış bitrate mesajın anlaşılmamasına, yoğun hata çerçevelerine veya arayüzün bus-off durumuna geçmesine neden olabilir."] },
      { title: "Sayaç ve checksum sınırı", paragraphs: ["Bazı üretici mesajlarında yaşam sayacı ve checksum bulunur. Bunların algoritması her DBC dosyasında yer almaz; DBC çoğunlukla sinyal konumunu tanımlar, özel checksum hesabını değil. Sayaç başlangıcı, artış miktarı, taşma değeri ve checksum kapsamı ayrı teknik bilgiyle doğrulanmalıdır.", "CAN Viewer içindeki dinamik gönderim alanları manuel bayt, sayaç ve checksum denemeleri için uygundur. DBC ECU Simülatörü ise fiziksel sinyallerden mesaj üretmeye odaklanır. Üreticiye özgü E2E koruma kullanılıyorsa algoritma doğrulanmadan gerçek kontrol ünitesini taklit ettiğinizi varsaymayın."] },
      { title: "Güvenli test kontrolü", list: ["Test ağını gerçek makine aktüatörlerinden ayırın.", "Kimlik çakışmasını önlemek için aynı mesajı yayınlayan gerçek ECU'yu yönetin.", "Başlangıç değerlerini güvenli aralıkta tutun ve periyodik gönderimi görünür biçimde durdurabilin.", "Ham payload, CAN ID, çerçeve biçimi ve periyodu kayıt altına alın.", "Sonucu alıcı ECU/HMI davranışı ve bağımsız ölçümle doğrulayın."] },
    ],
  },
} as const;

export default function GuidePage({ slug }: { slug: GuideSlug }) {
  const guide = guides[slug];
  const url = `https://algo-team.com/learn/${slug}/`;
  const relatedGuides = Object.entries(guides)
    .filter(([relatedSlug]) => relatedSlug !== slug)
    .map(([relatedSlug, relatedGuide]) => ({
      href: `/learn/${relatedSlug}/`,
      title: relatedGuide.title,
    }));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description, url, mainEntityOfPage: url, image: "https://algo-team.com/assets/og-cover.png", inLanguage: "tr-TR", datePublished: guide.datePublished, dateModified: guide.dateModified, author: { "@type": "Organization", name: "ALGO TEAM" }, publisher: { "@type": "Organization", name: "ALGO TEAM", url: "https://algo-team.com/", logo: { "@type": "ImageObject", url: "https://algo-team.com/assets/algo-team-logo.png" } } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ALGO TEAM", item: "https://algo-team.com/" }, { "@type": "ListItem", position: 2, name: "Learn", item: "https://algo-team.com/learn/" }, { "@type": "ListItem", position: 3, name: guide.title, item: url }] },
    ],
  };

  return (
    <main className="guide-page">
      <header className="guide-header">
        <a className="guide-brand" href="/"><img src="/assets/algo-team-logo.png" alt="ALGO TEAM" width="1200" height="206" /></a>
        <nav aria-label="Ana menü"><a href="/">Ana Sayfa</a><a href="/learn/">Learn</a><a href="/tools/">Tools</a><a href="/news/">Haberler</a></nav>
      </header>
      <article>
        <header className="guide-hero"><p>ALGO TEAM / CAN & J1939 REHBERİ</p><h1>{guide.title}</h1><span>{guide.readTime} · Güncelleme: {guide.updatedLabel}</span><p>{guide.description}</p><a href={guide.tool.href}>{guide.tool.label} →</a></header>
        <div className="guide-body">
          {guide.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}{"list" in section ? <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}
          <aside><h2>Uygulamaya geçin</h2><p>Örneklerinizi güvenli bir test ortamında deneyin; sonucu her zaman ham veri ve bağımsız ölçümle doğrulayın.</p><a href={guide.tool.href}>{guide.tool.label} →</a></aside>
          <nav className="guide-related" aria-label="İlgili rehberler">
            <h2>İlgili CAN ve J1939 rehberleri</h2>
            <div>{relatedGuides.map((item) => <a href={item.href} key={item.href}>{item.title} →</a>)}</div>
          </nav>
        </div>
      </article>
      <footer><p>ALGO TEAM · LEARN</p><a href="/learn/">Tüm teknik içerikler</a><p>© {new Date().getFullYear()}</p></footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
