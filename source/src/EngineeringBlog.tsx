"use client";

import { useEffect, useState } from "react";

type Language = "tr" | "en";

const articles = {
  tr: [
    {
      id: "can-analizi",
      code: "CAN / 01",
      title: "CAN hattında mesaj analizine nereden başlanır?",
      lead: "Bir CAN sorununda ilk hedef mesajları yorumlamak değil, hattın fiziksel ve zamansal olarak sağlıklı olduğunu doğrulamaktır.",
      details: [
        "Analiz fiziksel katman, veri bağı ve uygulama katmanı olarak üçe ayrılmalıdır. Önce terminasyon, bit hızı, toprak referansı ve hata sayaçları doğrulanır; ardından ID, DLC ve çevrim süreleri çıkarılır. Sinyal ölçeklendirmesi ancak bu iki katman sağlıklıysa anlamlıdır.",
        "J1939 ağında 29 bit kimlik yalnız mesaj numarası değildir; öncelik, PGN ve kaynak adresini birlikte taşır. Bu nedenle aynı PGN'nin farklı ECU'lardan gelebileceği, adres talebi ve BAM/TP gibi çok paketli taşıma yöntemlerinin trace analizini etkileyebileceği unutulmamalıdır.",
      ],
      points: [
        "Bit hızını ve örnekleme ayarını cihazlarla eşleştir.",
        "Enerji kapalıyken CAN-H ile CAN-L arasında yaklaşık 60 Ω terminasyon kontrolü yap.",
        "Mesaj çevrim zamanlarını ölç; yalnız ortalamaya değil jitter ve kayıp periyotlara da bak.",
        "Alive counter ve checksum varsa önce bu alanların gerçekten nasıl değiştiğini belirle.",
      ],
      note: "Sağlıklı görünen bir trace, doğru ölçeklendirilmiş bir trace anlamına gelmez. Byte order, factor ve offset ayrı doğrulanmalıdır.",
    },
    {
      id: "olay-tabanli-telemetri",
      code: "TELEMETRY / 02",
      title: "Her veriyi değil, doğru olayı kaydetmek",
      lead: "Telemetride depolama ihtiyacını asıl büyüten sinyal sayısı değil; örnekleme sıklığı, olay öncesi/sonrası pencere ve çevrimdışı kalma süresidir.",
      details: [
        "İyi bir kayıt mimarisi üç veri sınıfını ayırır: düşük frekanslı durum özeti, olay anındaki yüksek çözünürlüklü pencere ve teşhis için ham haberleşme kaydı. Her sınıfın saklama süresi, sıkıştırma ve yükleme politikası farklı olmalıdır.",
        "Cihaz çevrimdışıyken verinin kaybolmaması kadar belleğin dolduğunda ne olacağı da tasarlanmalıdır. Rotation policy en eski dosyanın ne zaman silineceğini; retention policy hangi verinin ne kadar tutulacağını; compression ise işlemci yükü ile depolama kazancı arasındaki dengeyi belirler.",
      ],
      points: [
        "Sürekli sinyalleri düşük ve gerekçeli bir temel frekansta tut.",
        "Eşik aşımı, durum geçişi ve hata oluşumu gibi olayları ayrı tanımla.",
        "Olaydan önceki kısa tamponu ve olay sonrası gözlem süresini birlikte kaydet.",
        "Sunucuya aktarım ile cihaz içi ham kayıt gereksinimini birbirinden ayır.",
      ],
      note: "İyi bir olay kütüphanesi; olay adı, tetik koşulu, debounce süresi, öncelik, kaydedilecek sinyaller ve kapanış koşulunu açıkça tanımlar.",
    },
    {
      id: "saha-dogrulamasi",
      code: "FIELD / 03",
      title: "Hesap doğruysa makine neden farklı davranır?",
      lead: "Kâğıt üzerindeki sonuç ile makine davranışı arasındaki fark çoğu zaman tek bir büyük hatadan değil, küçük varsayımların üst üste binmesinden çıkar.",
      details: [
        "Bir test yalnız sonuç sayısından ibaret değildir. Komut, ham sensör değeri, ölçeklenmiş değer, kontrol çıkışı ve fiziksel ölçüm aynı zaman tabanında kaydedilirse sapmanın sensörden mi, yazılımdan mı yoksa aktüatörden mi geldiği ayrıştırılabilir.",
        "Kabul kriteri test başlamadan yazılmalıdır. Örneğin yalnız 'hız doğru' demek yerine kararlı hâl hatası, izin verilen aşım, yerleşme süresi ve farklı sıcaklık/yük noktaları tanımlanır. Böylece saha gözlemi tekrarlanabilir bir mühendislik kanıtına dönüşür.",
      ],
      points: [
        "Komut edilen değer ile ölçülen fiziksel değeri bağımsız bir cihazla karşılaştır.",
        "Ham CAN değerini ölçeklenmiş değerden ayır ve iki aşamayı ayrı doğrula.",
        "Sensör toleransı, filtre gecikmesi ve kontrol çevrim süresini hesaba kat.",
        "Test koşullarını; sıcaklık, yük, besleme gerilimi ve makine durumuyla birlikte kaydet.",
      ],
      note: "Doğrulama kaydı tekrar üretilebilir olmalıdır: yazılım sürümü, parametre seti, test adımı ve kabul kriteri aynı yerde bulunmalıdır.",
    },
    {
      id: "gcan-modbus-can-esleme",
      code: "GATEWAY / 04",
      title: "GCAN-205 ile Modbus verisini CAN mesajına güvenli eşlemek",
      lead: "Bir gateway projesinde en sık hata bağlantıda değil; register sırası, byte order, ölçek ve gönderim tetikleme mantığının birbirine karıştırılmasında oluşur.",
      details: [
        "Önce mesaj sözleşmesi tek tabloda dondurulur: CAN ID, DLC, byte/bit konumu, veri tipi, factor, offset, fiziksel aralık, geçersiz değer ve gönderim periyodu. Ardından her Modbus register'ının bu sözleşmedeki hangi ham alanı beslediği açıkça yazılır.",
        "Örneğin 0–2500 rpm hız ve 0–100 tork isteği 0x205 mesajında taşınacaksa, fiziksel değer doğrudan register'a yazılmamalıdır. Önce seçilen çözünürlüğe göre ham tam sayıya çevrilir, sınırlandırılır ve little/big endian sırası test vektörleriyle doğrulanır. 100 ms gönderim zamanlayıcısı veri güncellenmese bile aynı çerçeveyi periyodik üretmelidir; stale data için ayrıca timeout davranışı tanımlanmalıdır.",
      ],
      points: [
        "Tek bir bilinen test değeri yerine 0, orta değer, maksimum ve aralık dışı değerlerle test yap.",
        "Modbus register görüntüsü, gateway çıkış trace'i ve alıcı ECU'nun çözdüğü değeri aynı test kaydında karşılaştır.",
        "Register adreslemesinde 0 tabanlı/1 tabanlı gösterim farkını ve 16 bit word sırasını ayrı doğrula.",
        "Haberleşme kesilince son değeri tutma, sıfırlama veya güvenli değere geçme kararını uygulamaya göre açıkça tanımla.",
      ],
      note: "CAN verisinin sürekli sıfır çıkması çoğu zaman mesaj tanımından değil, yanlış register adresi, tetikleme koşulu veya ham/fiziksel değer dönüşümünün eksik olmasından kaynaklanır.",
    },
    {
      id: "hibrit-mikser-guvenli-gecis",
      code: "HYBRID / 05",
      title: "Hibrit mikserde dizel ve elektrik modu arasında güvenli geçiş",
      lead: "Aynı hidrolik yükü iki farklı güç kaynağının sürebildiği bir makinede güvenlik, kontaktör seçiminden önce durum makinesi ve geçiş sırasıyla başlar.",
      details: [
        "Elektrikli mikser aktifken dizel motor beklenmedik biçimde çalışırsa iki pompa hattı aynı anda yüklenmemelidir. Elektrik motorunun hız/tork isteği rampa ile sıfıra indirilir, gerçek hızın düşük olduğu doğrulanır, motor enable kapatılır ve ancak bundan sonra hidrolik seçici valf dizel pompa hattına alınır.",
        "Şebeke şarjında enerji kaynağı önceliği de deterministik olmalıdır. 380 Vac bağlıyken 220 Vac araç üstü inverter hattı şarj cihazından elektriksel olarak ayrılır; elektrikli mikser modu kilitlenir ve gerekiyorsa karıştırma dizel pompa üzerinden yapılır. Operatör komutu geçiş sonrasında otomatik devam etmez, yeni komut beklenir.",
      ],
      points: [
        "Her çalışma durumunu; izinler, kontaktörler, valf konumu ve beklenen geri bildirimlerle bir durum tablosunda tanımla.",
        "Precharge tamamlanmadan ana kontaktörü ve yüksek güçlü yükleri devreye alma.",
        "Komut edilen hız yerine gerçek motor hızını ve valf geri bildirimini geçiş koşulu olarak kullan.",
        "Timeout, kaynak çakışması ve beklenmeyen diesel_running gibi durumları ayrı arıza sınıfları olarak ele al.",
      ],
      note: "Güvenli geçişin özü 'önce torku kaldır, sonra mekanik/hidrolik yolu değiştir' ilkesidir; yazılım bu sırayı geri bildirimlerle kanıtlamadan sonraki adıma geçmemelidir.",
    },
    {
      id: "sanziman-test-unitesi",
      code: "TEST BENCH / 06",
      title: "Şanzıman test ünitesinde kontrol ve ölçüm mimarisi",
      lead: "Bir şanzıman test tezgâhı yalnız motoru döndüren bir sistem değildir; kontrollü yük, yağlama, basınç, sıcaklık ve emniyet zincirinin birlikte doğrulandığı bir ölçüm platformudur.",
      details: [
        "BODAS kontrolörü valfleri ve test sırasını yönetirken, sürücüye analog/dijital komut veya saha haberleşmesi üzerinden hız ve tork referansı verebilir. PC tarafı operatör arayüzü, reçete ve kayıt görevini üstlenir; CAN–Modbus gateway ise test kontrolünün tek güvenlik katmanı değil, veri köprüsü olarak kalmalıdır.",
        "Her kavrama adımı için dolum süresi, basınç yükselme eğimi, kararlı basınç, giriş/çıkış hızı ve sıcaklık birlikte kaydedilir. Böylece yalnız 'vites geçti' sonucu değil, kavrama kalitesi ve olası kaçak/sürtünme problemi de karşılaştırılabilir hâle gelir.",
      ],
      points: [
        "Maksimum hız ve tork limitlerini hem sürücüde hem kontrolörde bağımsız sınırla.",
        "Yağ basıncı, yağ sıcaklığı, acil durdurma ve kapak/koruma sinyallerini doğrudan emniyet zincirine bağla.",
        "Test reçetesini adım, hedef, rampa, bekleme, kabul kriteri ve arıza tepkisiyle tanımla.",
        "Ham sensör ve CAN verisini zaman damgasıyla sakla; rapor değerlerini sonradan aynı kayıttan yeniden üretebil.",
      ],
      note: "Test tezgâhında otomasyonun görevi operatörün kararını gizlemek değil, her adımı aynı koşullarda tekrar edilebilir ve izlenebilir hâle getirmektir.",
    },
    {
      id: "j1939-spn-pgn-okuma",
      code: "J1939 / 07",
      title: "J1939 arıza kodunu SPN ve FMI üzerinden okumak",
      lead: "Bir J1939 arıza kaydında SPN hangi parametrede sorun görüldüğünü, FMI ise kontrolörün o parametrede nasıl bir hata algıladığını anlatır; ikisi birlikte yorumlanmalıdır.",
      details: [
        "DM1 mesajı aktif arızaları, DM2 ise daha önce aktif olup artık pasif kalan arızaları taşır. SPN numarası tek başına parçayı değiştirme talimatı değildir. Örneğin motor devriyle ilgili bir SPN; sensör, kablo, besleme, hava aralığı, dişli çember veya sinyal tutarlılığı sorunlarından herhangi birini gösterebilir.",
        "FMI 2 gibi 'erratic/intermittent/incorrect' sınıfları açık devreyle aynı değildir. Teşhis; arıza anındaki motor durumu, diğer hız kaynakları, sinyalin ham değişimi ve arızanın occurrence count bilgisiyle desteklenmelidir. Üreticiye özel SPN yorumları için motor ECU'sunun servis dokümanı temel alınmalıdır.",
      ],
      points: [
        "DM1/DM2 çerçevesinden SPN, FMI, occurrence count ve lamba durumlarını birlikte çıkar.",
        "SPN tanımını kullanılan J1939DA sürümü ve üretici servis dokümanıyla çapraz kontrol et.",
        "Arızayı silmeden önce freeze-frame benzeri çalışma koşullarını ve CAN trace'ini kaydet.",
        "Sensör değişiminden önce besleme, şase, konnektör, kablo sürekliliği ve sinyal biçimini ölç.",
      ],
      note: "Arıza kodu teşhisin başlangıç noktasıdır. Doğru parça kararı, kodun fiziksel ölçüm ve çalışma koşuluyla doğrulanmasından sonra verilir.",
    },
  ],
  en: [
    {
      id: "can-analizi",
      code: "CAN / 01",
      title: "Where should CAN message analysis begin?",
      lead: "The first goal in a CAN investigation is not decoding messages; it is proving that the bus is physically and temporally healthy.",
      details: [
        "Split the investigation into physical, data-link, and application layers. Verify termination, bitrate, ground reference, and error counters first; then extract identifiers, DLC values, and timing. Signal scaling becomes meaningful only after those layers are healthy.",
        "A 29-bit J1939 identifier carries priority, PGN, and source address—not just a message number. The same PGN may therefore arrive from different ECUs, while address claims and BAM/TP transfers can materially change how a trace should be interpreted.",
      ],
      points: [
        "Match bitrate and sampling settings across all participating devices.",
        "With power off, verify roughly 60 Ω between CAN-H and CAN-L.",
        "Measure message cycle times; inspect jitter and missing periods, not only averages.",
        "When alive counters or checksums exist, determine how those fields actually change first.",
      ],
      note: "A clean-looking trace is not necessarily a correctly scaled trace. Byte order, factor, and offset require separate validation.",
    },
    {
      id: "olay-tabanli-telemetri",
      code: "TELEMETRY / 02",
      title: "Record the right event, not every value",
      lead: "Telemetry storage is driven less by signal count than by sample rate, pre/post-event windows, and expected offline duration.",
      details: [
        "A sound logging architecture separates three data classes: low-rate state summaries, high-resolution event windows, and raw communications captures for diagnostics. Each class needs its own retention, compression, and upload policy.",
        "Offline operation must define what happens when storage fills. Rotation controls which files are replaced, retention defines how long evidence is kept, and compression balances CPU load against storage savings.",
      ],
      points: [
        "Keep continuous signals at a low, justified baseline rate.",
        "Define threshold crossings, state transitions, and fault onset as separate events.",
        "Capture a short pre-event buffer together with a useful post-event window.",
        "Separate cloud transfer requirements from raw on-device recording.",
      ],
      note: "A useful event library defines the trigger, debounce, priority, captured signals, and clear condition for every event.",
    },
    {
      id: "saha-dogrulamasi",
      code: "FIELD / 03",
      title: "Why does the machine behave differently when the math is right?",
      lead: "The gap between a calculation and machine behavior often comes from stacked small assumptions rather than one large error.",
      details: [
        "A test is more than its final number. Logging command, raw sensor value, scaled value, controller output, and an independent physical measurement on one timeline makes it possible to isolate sensor, software, and actuator errors.",
        "Acceptance criteria should be written before the test: steady-state error, overshoot, settling time, and operating points across temperature and load. This turns a field observation into repeatable engineering evidence.",
      ],
      points: [
        "Compare the commanded value with an independently measured physical value.",
        "Separate the raw CAN value from its scaled engineering value and validate both.",
        "Account for sensor tolerance, filter delay, and control-loop period.",
        "Record temperature, load, supply voltage, and machine state with the test.",
      ],
      note: "Validation must be repeatable: software version, parameters, test step, and acceptance criteria belong in the same record.",
    },
    {
      id: "gcan-modbus-can-esleme",
      code: "GATEWAY / 04",
      title: "Mapping Modbus data to CAN safely with a GCAN-205",
      lead: "Most gateway failures are not connection failures; they come from mixing register order, byte order, scaling, and transmission triggers.",
      details: [
        "Freeze the message contract in one table: CAN ID, DLC, byte/bit position, type, factor, offset, physical range, invalid value, and cycle time. Then map every Modbus register to an explicit raw field in that contract.",
        "For a 0–2500 rpm speed request and 0–100 torque request in CAN ID 0x205, convert physical values into bounded raw integers before writing registers. Validate byte order with known vectors. A 100 ms timer should transmit periodically even when data is unchanged, while stale-data timeout behavior is specified separately.",
      ],
      points: [
        "Test zero, midpoint, maximum, and out-of-range values instead of one convenient example.",
        "Compare the Modbus register view, gateway CAN trace, and receiver-decoded value in one record.",
        "Verify zero-based versus one-based register notation and 16-bit word order separately.",
        "Define whether a communications timeout holds the last value, writes zero, or enters a safe state.",
      ],
      note: "An all-zero CAN payload usually points to the wrong register, an unmet trigger condition, or a missing raw-to-physical conversion—not necessarily a bad CAN definition.",
    },
    {
      id: "hibrit-mikser-guvenli-gecis",
      code: "HYBRID / 05",
      title: "Safe transitions between diesel and electric mixer modes",
      lead: "When two power sources can drive the same hydraulic load, safety begins with the state machine and transition sequence before contactor selection.",
      details: [
        "If the diesel starts unexpectedly while electric mixing is active, the two pump paths must not load the circuit together. Ramp electric torque and speed request to zero, confirm low actual speed, remove motor enable, and only then switch the hydraulic selector to the diesel pump.",
        "Grid charging also needs deterministic source priority. While 380 Vac is connected, isolate the onboard 220 Vac inverter feed from the charger, lock electric mixing, and use the diesel pump if rotation is required. Do not resume the previous operator command automatically after a transition.",
      ],
      points: [
        "Define every state with its permissions, contactors, valve position, and expected feedback.",
        "Do not close the main contactor or apply a high-power load before precharge is confirmed.",
        "Use actual motor speed and valve feedback—not only commands—as transition conditions.",
        "Handle timeout, source conflict, and unexpected diesel_running as separate fault classes.",
      ],
      note: "The core rule is remove torque before changing the hydraulic path. Software must prove each step through feedback before advancing.",
    },
    {
      id: "sanziman-test-unitesi",
      code: "TEST BENCH / 06",
      title: "Control and measurement architecture for a transmission test bench",
      lead: "A transmission test bench is not just a motor that turns a gearbox; it is a measurement platform that validates controlled load, lubrication, pressure, temperature, and safety together.",
      details: [
        "A BODAS controller can manage valves and test sequencing while sending speed or torque references to the drive. The PC handles recipes, operator interaction, and records; a CAN–Modbus gateway remains a data bridge rather than the only safety layer.",
        "For each clutch step, log fill time, pressure slope, stabilized pressure, input/output speed, and temperature together. This shows not only whether a gear engaged but also whether clutch quality suggests leakage or friction problems.",
      ],
      points: [
        "Limit maximum speed and torque independently in both drive and controller.",
        "Put oil pressure, oil temperature, emergency stop, and guard signals in the safety chain.",
        "Define recipes with target, ramp, dwell, acceptance criteria, and fault response for every step.",
        "Timestamp raw sensor and CAN data so reports can be reproduced from the original record.",
      ],
      note: "Automation should not hide operator judgment; it should make every test step repeatable, comparable, and traceable.",
    },
    {
      id: "j1939-spn-pgn-okuma",
      code: "J1939 / 07",
      title: "Reading J1939 faults through SPN and FMI",
      lead: "In a J1939 fault record, the SPN identifies the affected parameter and the FMI describes how the controller believes it failed; they must be interpreted together.",
      details: [
        "DM1 carries active faults and DM2 previously active faults. An SPN is not a direct instruction to replace a component. An engine-speed SPN, for example, may originate in the sensor, wiring, supply, air gap, tone wheel, or signal plausibility logic.",
        "FMI 2, an erratic/intermittent/incorrect class, is different from an open circuit. Diagnosis should include machine state, other speed sources, raw signal behavior, and occurrence count. Manufacturer service information remains authoritative for proprietary interpretations.",
      ],
      points: [
        "Extract SPN, FMI, occurrence count, and lamp state together from DM1/DM2.",
        "Cross-check the SPN against the selected J1939DA revision and OEM service documentation.",
        "Capture operating conditions and CAN trace before clearing the fault.",
        "Measure supply, ground, connector, continuity, and waveform before replacing a sensor.",
      ],
      note: "A fault code is the start of diagnosis. Component decisions come only after confirming the code with physical measurements and operating context.",
    },
  ],
} as const;

export default function EngineeringBlog() {
  const [language, setLanguage] = useState<Language>("tr");
  const items = articles[language];
  const labels = language === "tr"
    ? {
        back: "Araçlara dön",
        overline: "ALGO TEAM / MÜHENDİSLİK BLOGU",
        title: "Teknik makaleler ve mühendislik notları.",
        intro: "CAN, J1939, telemetri, kontrol ve saha doğrulaması üzerine; araştırmaya, ölçüme ve gerçek uygulamaya dayanan kalıcı içerikler.",
        archive: "Teknik makaleler ve araştırmalar",
        archiveIntro: "Sahada tekrar kullanılabilecek açıklamalar, kontrol sıraları ve doğrulama notları.",
        checklist: "Kontrol sırası",
        fieldNote: "Saha notu",
      }
    : {
        back: "Back to tools",
        overline: "ALGO TEAM / ENGINEERING BLOG",
        title: "Technical articles and engineering notes.",
        intro: "Evergreen work grounded in research, measurement, and real applications across CAN, J1939, telemetry, controls, and field validation.",
        archive: "Technical articles and research",
        archiveIntro: "Explanations, check sequences, and validation notes designed for repeated use in the field.",
        checklist: "Check sequence",
        fieldNote: "Field note",
      };

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr"
      ? "Mühendislik Blogu | Engineering Tools"
      : "Engineering Blog | Engineering Tools";
  }, [language]);

  return (
    <main className="blog-page">
      <header className="site-header blog-header">
        <a className="brand" href="/" aria-label="ALGO TEAM ana sayfa">ALGO<span>TEAM</span></a>
        <a className="blog-back" href="/">← {labels.back}</a>
        <div className="language-switch" aria-label="Dil seçimi">
          <button className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")} type="button">TR</button>
          <span>/</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
        </div>
      </header>

      <section className="blog-hero">
        <p className="overline">{labels.overline}</p>
        <h1>{labels.title}</h1>
        <p>{labels.intro}</p>
      </section>

      <section className="blog-archive-head">
        <p className="section-kicker">{labels.archive}</p>
        <h2>{labels.archive}</h2>
        <p>{labels.archiveIntro}</p>
      </section>

      <section className="blog-articles">
        {items.map((article) => (
          <article id={article.id} className="blog-article" key={article.id}>
            <div className="blog-article-code">{article.code}</div>
            <div className="blog-article-content">
              <h2>{article.title}</h2>
              <p className="blog-lead">{article.lead}</p>
              <div className="blog-detail">
                {article.details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <h3>{labels.checklist}</h3>
              <ol>
                {article.points.map((point) => <li key={point}>{point}</li>)}
              </ol>
              <aside>
                <strong>{labels.fieldNote}</strong>
                <p>{article.note}</p>
              </aside>
            </div>
          </article>
        ))}
      </section>

      <footer>
        <p>ALGO TEAM · ENGINEERING TOOLS</p>
        <p>CAN · J1939 · TELEMETRY · MOBILE MACHINES</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
