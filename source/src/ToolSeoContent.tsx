import "./tool-seo.css";

type ToolKey = "dbc-editor" | "can-viewer" | "dbc-ecu-simulator" | "can-log-analyzer" | "j1939-dtc-decoder" | "j1939-pgn-calculator";
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
    guide: "/learn/can-bus-ariza-tespiti/",
    guideLabel: "CAN Bus arıza tespiti rehberi",
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
    name: "J1939 DM1 Decoder: SPN/FMI Arıza Kodu Çözücü",
    nameEn: "J1939 DM1 Decoder: SPN/FMI Fault Codes",
    path: "/j1939-dtc-decoder/",
    description: "J1939 DM1 (PGN 65226) kayıtlarından SPN, FMI, oluşum sayısı (OC), lamba durumları ve kaynak ECU bilgisini çözümleyin. CAN kaydınızı seçin veya örnek kayıtla deneyin; BAM/TP.DT paketlerini ve arıza zaman çizelgesini birlikte inceleyin.",
    descriptionEn: "Decode SPN, FMI, occurrence count (OC), lamp states and source ECU information from J1939 DM1 (PGN 65226). Select a CAN capture or try the sample; inspect BAM/TP.DT packets alongside the fault timeline.",
    uses: ["DM1 çerçevelerinden SPN, FMI, OC ve lamba durumlarını çıkarma", "Kaynak ECU adresine göre arızaları ve aktiflik zaman çizelgesini ayırma", "BAM ve TP.DT ile taşınan çok paketli DM1 kayıtlarını birleştirme"],
    usesEn: ["Extract SPN, FMI, OC and lamp states from DM1 frames", "Separate faults and active-state timelines by source ECU address", "Reassemble multi-packet DM1 captures transported with BAM and TP.DT"],
    steps: ["TRC, ASC, CSV veya SocketCAN kaydınızı seçin. Dosyanız yoksa ‘Örnek J1939 kaydını aç’ düğmesiyle başlayın.", "Tek bir DM1 mesajı için kayıt açıldıktan sonra ‘Tek Mesaj’ sekmesine geçin; 29-bit CAN ID ve HEX veri baytlarını girin.", "SPN, FMI, OC, lamba ve kaynak ECU sonuçlarını inceleyin. Kodları üretici servis dokümanı ve fiziksel ölçümle doğrulayın."],
    stepsEn: ["Select a TRC, ASC, CSV or SocketCAN capture. Without a file, start with ‘Open sample J1939 capture’.", "For an individual DM1 frame, open a capture first, then choose ‘Single Message’ and enter the 29-bit CAN ID and HEX data bytes.", "Inspect SPN, FMI, OC, lamp states and source ECU results. Validate codes against manufacturer service information and physical measurements."],
    faq: [["DM1 çözümlemek için DBC dosyası gerekir mi?", "Temel DM1 arıza alanlarını çözmek için DBC gerekmez. Arıza anındaki devir, tork, sıcaklık gibi çalışma sinyallerini eklemek için doğru sürümde kendi J1939 DBC dosyanızı yükleyin."], ["SPN/FMI sonucu tek başına arızalı parçayı gösterir mi?", "Hayır. Kod, ilgili parametre ve arıza biçimi hakkında yön verir; parça değişimi kararı servis dokümanı ve ölçümle doğrulanmalıdır."], ["Çok paketli DM1 destekleniyor mu?", "Evet. Uyumlu BAM ve TP.DT dizileri birleştirilerek çözümlenir. Eksik paketler ve kaynak ECU bilgisi de değerlendirilmelidir."], ["Bütün SPN açıklamaları ve üretici kodları hazır mı?", "Hayır. Sayısal kodun çözülmesi, her üreticiye ait açıklamanın bulunduğu anlamına gelmez. CSV/Excel SPN sözlüğünüzle özel ad ve servis notları ekleyebilirsiniz."], ["Bu araç ECU'daki arızayı siler mi?", "Hayır. Bu bir kayıt ve mesaj çözümleme aracıdır; ECU'ya arıza silme veya kontrol komutu göndermez."]],
    faqEn: [["Do I need a DBC file to decode DM1?", "A DBC is not required for the basic DM1 fault fields. Load the correct version of your own J1939 DBC to add operating signals such as speed, torque and temperature at fault onset."], ["Does an SPN/FMI result identify the failed part on its own?", "No. A code points to a parameter and failure mode; confirm replacement decisions using service documentation and measurements."], ["Are multi-packet DM1 messages supported?", "Yes. Compatible BAM and TP.DT sequences are reassembled for decoding. Missing packets and the source ECU must also be considered."], ["Are all SPN descriptions and manufacturer codes included?", "No. Decoding a numeric code does not provide every manufacturer's description. Add specific names and service notes using your CSV/Excel SPN dictionary."], ["Can this tool clear faults in an ECU?", "No. It analyzes captures and messages; it does not transmit fault-clear or control commands to an ECU."]],
    guide: "/learn/j1939-dm1-spn-fmi-cozumleme/",
    guideLabel: "DM1, SPN ve FMI çözümleme rehberi",
    guideLabelEn: "Read the DM1, SPN and FMI guide (Turkish)",
  },
  "j1939-pgn-calculator": {
    name: "J1939 PGN / CAN ID Hesaplayıcı",
    nameEn: "J1939 PGN / CAN ID Calculator",
    path: "/j1939-pgn-calculator/",
    description: "29-bit J1939 CAN kimliklerini priority, EDP/R, data page, PDU format, PDU specific, source address ve PGN alanlarına ayıran ücretsiz çevrimiçi hesaplayıcı.",
    descriptionEn: "A free online calculator that breaks 29-bit J1939 CAN identifiers into priority, EDP/R, data page, PDU format, PDU specific, source address, and PGN fields.",
    uses: ["29-bit CAN ID içinden PGN ve kaynak adresini bulma", "PDU1 mesajında hedef adresini, PDU2 mesajında group extension alanını ayırma", "PGN, priority ve adreslerden gönderilecek CAN kimliğini oluşturma", "Birden fazla CAN ID'yi toplu çözümleyip CSV olarak indirme"],
    steps: ["CAN ID → PGN sekmesinde kimliği HEX veya decimal biçimde girin.", "Priority, PF, PS, source address, PDU tipi ve hesaplanan PGN sonucunu kontrol edin.", "Ters işlem için PGN → CAN ID sekmesinde PGN, priority ve adres alanlarını doldurun."],
    faq: [["PGN ile SPN arasındaki fark nedir?", "PGN bir J1939 mesaj grubunu tanımlar; SPN ise o mesajın payload'ı içindeki tek bir parametredir."], ["PDU1 ve PDU2 hesaplaması neden farklıdır?", "PDU1'de PS byte'ı hedef adrestir ve PGN'nin son byte'ı 00 kabul edilir. PDU2'de PS, PGN'nin group extension alanına katılır."], ["Araç bütün PGN ve SPN adlarını içeriyor mu?", "Hayır. Araç 29-bit kimliğin matematiksel yapısını çözer. Resmî parametre adları ve sinyal tanımları için lisanslı SAE J1939DA veya size ait DBC dosyası gerekir."]],
    guide: "/learn/j1939-pgn-nedir/",
    guideLabel: "J1939 PGN ve 29-bit CAN ID rehberi",
  },
} as const;

export default function ToolSeoContent({ tool, language }: { tool: ToolKey; language: Language }) {
  const item = tools[tool];
  const displayName = language === "en" && "nameEn" in item ? item.nameEn : item.name;
  const displayDescription = language === "en" && "descriptionEn" in item ? item.descriptionEn : item.description;
  const isDtc = tool === "j1939-dtc-decoder";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: isDtc ? displayName : item.name,
        url: `https://algo-team.com${item.path}`,
        description: isDtc ? displayDescription : item.description,
        ...(isDtc ? { inLanguage: language } : {}),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Windows, macOS, Linux",
        browserRequirements: tool === "j1939-pgn-calculator" || isDtc
          ? "Modern web browser with JavaScript enabled."
          : "Modern desktop web browser; hardware access features may require WebUSB support.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        publisher: { "@type": "Organization", name: "ALGO TEAM", url: "https://algo-team.com/" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ALGO TEAM", item: "https://algo-team.com/" },
          { "@type": "ListItem", position: 2, name: "Engineering Tools", item: "https://algo-team.com/tools/" },
          { "@type": "ListItem", position: 3, name: isDtc ? displayName : item.name, item: `https://algo-team.com${item.path}` },
        ],
      },
    ],
  };

  if (language === "en" && !isDtc) {
    return (
      <section className="tool-seo" aria-labelledby={`${tool}-about`}>
        <p className="tool-seo-kicker">ALGO TEAM / ENGINEERING TOOL</p>
        <h2 id={`${tool}-about`}>How to use {displayName}</h2>
        <p>{displayDescription}</p>
        <p>Switch to TR for the detailed workflow, use cases, and frequently asked questions.</p>
        <a className="tool-seo-link" href={item.guide}>Open related guide →</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    );
  }

  const english = language === "en";
  const uses = english && "usesEn" in item ? item.usesEn : item.uses;
  const steps = english && "stepsEn" in item ? item.stepsEn : item.steps;
  const faq = english && "faqEn" in item ? item.faqEn : item.faq;
  const guideLabel = english && "guideLabelEn" in item ? item.guideLabelEn : item.guideLabel;

  return (
    <section className="tool-seo" aria-labelledby={`${tool}-about`}>
      <p className="tool-seo-kicker">{english ? "ALGO TEAM / FREE ENGINEERING TOOL" : "ALGO TEAM / ÜCRETSİZ MÜHENDİSLİK ARACI"}</p>
      <h2 id={`${tool}-about`}>{english ? `How to use ${displayName}` : `${item.name} ne işe yarar?`}</h2>
      <p className="tool-seo-lead">{displayDescription} {english ? "File contents stay in your browser; the tool is free and requires no account." : "İşlem içeriği tarayıcıda kalır; araç ücretsizdir ve hesap gerektirmez."}</p>
      <div className="tool-seo-grid">
        <article><h3>{english ? "What can I use it for?" : "Hangi işlerde kullanılır?"}</h3><ul>{uses.map((value) => <li key={value}>{value}</li>)}</ul></article>
        <article><h3>{english ? "How do I start?" : "Nasıl kullanılır?"}</h3><ol>{steps.map((value) => <li key={value}>{value}</li>)}</ol></article>
      </div>
      <div className="tool-seo-faq">
        <h3>{english ? "Frequently asked questions" : "Sık sorulan sorular"}</h3>
        {faq.map(([question, answer]) => <article key={question}><h4>{question}</h4><p>{answer}</p></article>)}
      </div>
      <a className="tool-seo-link" href={item.guide}>{guideLabel} →</a>
      {isDtc ? <p><a className="tool-seo-link" href="/j1939-pgn-calculator/">{english ? "Check the PGN and source address from a CAN ID" : "CAN ID'den PGN ve kaynak adresini kontrol edin"} →</a></p> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </section>
  );
}
