import "./tool-seo.css";

type ToolKey = "dbc-editor" | "can-viewer" | "dbc-ecu-simulator" | "can-log-analyzer" | "j1939-dtc-decoder";
type Language = "tr" | "en";

const tools = {
  "dbc-editor": {
    name: "Online DBC Editörü",
    path: "/dbc-editor/",
    description: "CAN ve CAN FD mesajlarını, sinyallerini ve bit yerleşimlerini tarayıcıda oluşturup düzenleyen ücretsiz DBC aracı.",
    uses: ["Yeni bir DBC veritabanını sıfırdan oluşturma", "Mesaj, sinyal, ölçek ve offset değerlerini düzenleme", "Intel ve Motorola sinyal yerleşimini görsel olarak doğrulama"],
    steps: ["DBC dosyanızı açın veya boş bir veritabanı oluşturun.", "Mesajı seçip sinyal bitlerini, ölçeği ve birimi düzenleyin.", "Doğrulamayı çalıştırın ve güncel DBC dosyasını indirin."],
    faq: [["Veriler sunucuya yükleniyor mu?", "Hayır. DBC içeriği tarayıcınızda işlenir."], ["Standard ve Extended CAN kimlikleri destekleniyor mu?", "Evet. Mesaj kimliği ve çerçeve biçimi DBC tanımına göre işlenir."], ["CAN FD mesajı oluşturabilir miyim?", "Evet. 8 bayttan uzun veri alanına sahip CAN FD mesajları düzenlenebilir."]],
    guide: "/learn/dbc-dosyasi-nedir/",
    guideLabel: "DBC dosyası rehberi",
  },
  "can-viewer": {
    name: "Online CAN Bus İzleyici",
    path: "/can-viewer/",
    description: "PCAN-USB üzerinden canlı CAN trafiğini izleme, filtreleme, kaydetme ve DBC sinyallerini çözümleme aracı.",
    uses: ["Canlı CAN mesajlarını kimlik, periyot ve veri değişimiyle izleme", "DBC dosyasıyla fiziksel sinyal değerlerini çözümleme", "Manuel, periyodik, sayaç ve checksum alanlı mesaj gönderme"],
    steps: ["PCAN-USB cihazınızı bağlayıp kanal ve bitrate seçin.", "Gerekirse DBC dosyanızı yükleyin ve mesaj filtresi uygulayın.", "Trafiği izleyin; yalnızca güvenli test ortamında mesaj gönderin veya kayıt alın."],
    faq: [["Hangi tarayıcı gerekir?", "WebUSB desteği olan masaüstü Chromium tabanlı bir tarayıcı gerekir."], ["DBC olmadan kullanılabilir mi?", "Evet. Ham CAN kimliği, DLC, veri ve zamanlama bilgileri DBC olmadan da görülebilir."], ["Gönderilen mesaj değiştirilebilir mi?", "Evet. Baytlar hex veya decimal biçimde düzenlenebilir; dinamik alan, sayaç ve checksum kurgulanabilir."]],
    guide: "/learn/can-log-analizi/",
    guideLabel: "CAN log analizi rehberi",
  },
  "dbc-ecu-simulator": {
    name: "DBC ECU Simülatörü",
    path: "/dbc-ecu-simulator/",
    description: "DBC mesajlarını sinyal kontrollerine dönüştürüp PCAN-USB ile Standard veya Extended CAN çerçeveleri gönderen tarayıcı tabanlı ECU simülatörü.",
    uses: ["Bir ECU düğümüne ait DBC mesajlarını seçerek canlandırma", "Fiziksel sinyal değerlerini değiştirip ham baytları otomatik üretme", "Tek seferlik veya tanımlı periyotta Standard ve Extended mesaj gönderme"],
    steps: ["DBC dosyanızı yükleyin ve simüle edilecek düğümü seçin.", "Mesajı açıp sinyal değerlerini güvenli test aralığında belirleyin.", "PCAN kanalına bağlanın ve mesajı tek seferlik ya da periyodik gönderin."],
    faq: [["Extended DBC zorunlu mu?", "Hayır. Araç hem 11 bit Standard hem 29 bit Extended kimlikli mesajları DBC tanımına göre işler."], ["Sinyal değeri bayta nasıl çevrilir?", "Fiziksel değer, DBC içindeki factor, offset, byte order ve signed bilgisi kullanılarak ham değere çevrilir."], ["Gerçek araç üzerinde kullanılabilir mi?", "Aktif mesaj gönderimi risklidir. Yalnızca yetkili, izole ve güvenli test düzeneklerinde kullanılmalıdır."]],
    guide: "/learn/dbc-ile-ecu-simulasyonu/",
    guideLabel: "DBC ile ECU simülasyonu rehberi",
  },
  "can-log-analyzer": {
    name: "Online CAN Log Analiz Programı",
    path: "/can-log-analyzer/",
    description: "TRC, ASC, CSV ve SocketCAN kayıtlarında mesaj periyodu, jitter, kayıp mesaj ve DBC sinyallerini inceleyen ücretsiz analiz aracı.",
    uses: ["Farklı CAN kayıt biçimlerini tek ekranda inceleme", "Mesaj periyodu, jitter ve zamanlama sapmalarını bulma", "DBC ile sinyalleri çözerek fiziksel değerleri karşılaştırma"],
    steps: ["TRC, ASC, CSV veya candump kaydınızı seçin.", "Kimlikleri sıklık ve zamanlama özetine göre daraltın.", "DBC ekleyip ilgili sinyali grafikte ve raporda doğrulayın."],
    faq: [["Hangi log biçimleri destekleniyor?", "PCAN TRC, Vector ASC, yaygın CSV yapıları ve SocketCAN candump satırları desteklenir."], ["Dosya internete gönderiliyor mu?", "Hayır. Analiz tarayıcı içinde yapılır."], ["Jitter neyi gösterir?", "Bir mesajın beklenen gönderim periyodundan ne kadar saptığını gösterir; tek başına arızanın nedenini kanıtlamaz."]],
    guide: "/learn/can-log-analizi/",
    guideLabel: "Adım adım CAN log analizi",
  },
  "j1939-dtc-decoder": {
    name: "J1939 SPN/FMI Arıza Kodu Çözücü",
    path: "/j1939-dtc-decoder/",
    description: "J1939 DM1 mesajlarını ve CAN kayıtlarındaki SPN/FMI arıza bilgilerini tarayıcıda çözümleyen teşhis aracı.",
    uses: ["DM1 çerçevelerinden SPN, FMI ve occurrence count çıkarma", "Kaynak adresine göre ECU arızalarını ayırma", "BAM ve TP.DT ile taşınan çok paketli DM1 trafiğini birleştirme"],
    steps: ["Ham DM1 verisini girin veya bir CAN kayıt dosyası yükleyin.", "Kaynak adresi ve zaman aralığını seçerek arızaları ayırın.", "SPN/FMI sonucunu üretici dokümanı ve fiziksel ölçümle doğrulayın."],
    faq: [["SPN/FMI sonucu tek başına arızalı parçayı gösterir mi?", "Hayır. Kod, arıza türü ve ilgili parametre hakkında yön verir; servis dokümanı ve ölçümle doğrulanmalıdır."], ["Çok paketli DM1 destekleniyor mu?", "Evet. Uyumlu BAM ve TP.DT dizileri birleştirilerek çözümlenir."], ["Özel SPN açıklaması eklenebilir mi?", "Evet. Yerel sözlük ile kuruma veya makineye özgü açıklamalar eklenebilir."]],
    guide: "/learn/can-log-analizi/",
    guideLabel: "CAN kayıtlarını analiz etme rehberi",
  },
} as const;

export default function ToolSeoContent({ tool, language }: { tool: ToolKey; language: Language }) {
  const item = tools[tool];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: item.name,
        url: `https://algo-team.com${item.path}`,
        description: item.description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Windows, macOS, Linux",
        browserRequirements: "Modern desktop web browser; hardware access features may require WebUSB support.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        publisher: { "@type": "Organization", name: "ALGO TEAM", url: "https://algo-team.com/" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ALGO TEAM", item: "https://algo-team.com/" },
          { "@type": "ListItem", position: 2, name: "Engineering Tools", item: "https://algo-team.com/tools/" },
          { "@type": "ListItem", position: 3, name: item.name, item: `https://algo-team.com${item.path}` },
        ],
      },
    ],
  };

  if (language === "en") {
    return (
      <section className="tool-seo" aria-labelledby={`${tool}-about`}>
        <p className="tool-seo-kicker">ALGO TEAM / ENGINEERING TOOL</p>
        <h2 id={`${tool}-about`}>How to use {item.name}</h2>
        <p>{item.description}</p>
        <p>Switch to TR for the detailed workflow, use cases, and frequently asked questions.</p>
        <a className="tool-seo-link" href={item.guide}>Open related guide →</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    );
  }

  return (
    <section className="tool-seo" aria-labelledby={`${tool}-about`}>
      <p className="tool-seo-kicker">ALGO TEAM / ÜCRETSİZ MÜHENDİSLİK ARACI</p>
      <h2 id={`${tool}-about`}>{item.name} ne işe yarar?</h2>
      <p className="tool-seo-lead">{item.description} İşlem içeriği tarayıcıda kalır; araç ücretsizdir ve hesap gerektirmez.</p>
      <div className="tool-seo-grid">
        <article><h3>Hangi işlerde kullanılır?</h3><ul>{item.uses.map((value) => <li key={value}>{value}</li>)}</ul></article>
        <article><h3>Nasıl kullanılır?</h3><ol>{item.steps.map((value) => <li key={value}>{value}</li>)}</ol></article>
      </div>
      <div className="tool-seo-faq">
        <h3>Sık sorulan sorular</h3>
        {item.faq.map(([question, answer]) => <article key={question}><h4>{question}</h4><p>{answer}</p></article>)}
      </div>
      <a className="tool-seo-link" href={item.guide}>{item.guideLabel} →</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </section>
  );
}
