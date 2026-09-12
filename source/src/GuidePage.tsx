import "./guide-page.css";

export type GuideSlug =
  | "dbc-dosyasi-nedir"
  | "can-bus-ariza-tespiti"
  | "can-log-analizi"
  | "j1939-pgn-nedir"
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
  "can-bus-ariza-tespiti": {
    title: "CAN Bus arıza tespiti: 60 Ω, gerilim ve bus-off kontrolü",
    description: "CAN hattında 60 ohm terminasyon, CAN-H/CAN-L gerilimleri, açık ve kısa devre, bitrate, hata sayacı ve bus-off kontrollerini doğru sırayla uygulayın.",
    readTime: "12 dakika",
    datePublished: "2026-09-08",
    dateModified: "2026-09-08",
    updatedLabel: "8 Eylül 2026",
    tool: { href: "/can-viewer/", label: "CAN Viewer'ı aç" },
    relatedTool: { href: "/can-log-analyzer/", label: "CAN Log Analyzer'ı aç" },
    sections: [
      {
        title: "CAN Bus arızasında doğru kontrol sırası",
        paragraphs: [
          "CAN hattında hiç mesaj görülmemesi, iletişimin aralıklı kesilmesi veya bir kontrol ünitesinin bus-off durumuna geçmesi tek başına yazılım arızasını göstermez. Teşhise fiziksel katmandan başlayın: makineyi güvenli duruma alın, hattın enerjisini kesin, CAN-H ile CAN-L arasındaki direnci ölçün; ardından kısa devre kontrollerini, enerjili gerilimleri, bitrate ayarını, hata sayaçlarını ve CAN kaydını sırayla inceleyin.",
          "Bu sıra iki yanıltıcı sonucu önler: enerjili hatta direnç ölçmek ve yaklaşık 60 Ω gördüğünüz için ağın tamamen sağlam olduğunu varsaymak. Doğru terminasyon yalnızca ilk kontroldür; kopuk bir kol, zayıf konnektör, yanlış bitrate veya hatalı bir ECU aynı direnç değeriyle birlikte bulunabilir.",
        ],
      },
      {
        title: "CAN hattında neden yaklaşık 60 Ω ölçülür?",
        paragraphs: [
          "Klasik yüksek hızlı CAN omurgasının iki fiziksel ucunda birer 120 Ω terminasyon bulunur. Hattın enerjisi kapalıyken CAN-H ile CAN-L arasında ölçülen iki direnç paralel olduğu için sonuç yaklaşık 60 Ω olur. Ölçümü kontak ve ana besleme kapalıyken, mümkünse ağın normalde bağlı kalan bir konnektöründen yapın.",
          "Ölçüm toleransı; terminasyon dirençleri, ECU giriş devreleri ve multimetre nedeniyle tam 60 Ω olmayabilir. Makine üreticisinin farklı veya aktif terminasyon kullandığı özel topolojilerde önce elektrik şemasını doğrulayın.",
        ],
        table: {
          columns: ["CAN-H / CAN-L ölçümü", "Muhtemel yorum", "Sonraki kontrol"],
          rows: [
            ["Yaklaşık 60 Ω", "İki adet 120 Ω terminasyon görülüyor", "Kolları, gerilimleri, bitrate'i ve hata sayaçlarını kontrol edin"],
            ["Yaklaşık 120 Ω", "Bir terminasyon eksik veya omurganın bir tarafı kopuk", "İki uç direncini ve aradaki konnektörleri bulun"],
            ["Yaklaşık 40 Ω", "Üç adet 120 Ω terminasyon paralel bağlı olabilir", "Fazladan terminasyonu veya yanlış bağlanan cihazı ayırın"],
            ["Çok düşük / 0 Ω'a yakın", "CAN-H ile CAN-L kısa devreli olabilir", "Kabloyu bölümlere ayırarak kısa devrenin yerini daraltın"],
            ["OL / çok yüksek", "Hat açık, iki terminasyon da görünmüyor veya ölçüm noktası kopuk", "Süreklilik ve konnektör kontrolü yapın"],
          ],
        },
      },
      {
        title: "CAN-H ve CAN-L gerilimleri nasıl yorumlanır?",
        paragraphs: [
          "Hat enerjiliyken yüksek hızlı CAN'ın recessive durumunda CAN-H ve CAN-L çoğunlukla yaklaşık 2,5 V seviyesindedir. Dominant bit sırasında CAN-H yaklaşık 3,5 V'a yükselirken CAN-L yaklaşık 1,5 V'a düşer; iki hat arasında yaklaşık 2 V diferansiyel oluşur. Bunlar tipik referans değerlerdir, kesin kabul sınırı için transceiver ve makine dokümanına bakılmalıdır.",
          "Multimetre hızlı bit geçişlerini göstermez; yalnızca trafiğin yoğunluğuna bağlı ortalama bir değer okur. Bu yüzden CAN-H'nin yaklaşık 2,5–3,5 V, CAN-L'nin yaklaşık 1,5–2,5 V arasında görünmesi mümkündür. İki hattı da ağ toprağına göre ölçün; sinyal biçimi, diferansiyel genlik, ringing ve yansımalar için osiloskop kullanın.",
        ],
      },
      {
        title: "Açık devre ve kısa devre nasıl ayrılır?",
        list: [
          "Enerjiyi kesin; önce CAN-H ile CAN-L, sonra her hattın şasi/ağ toprağı ve besleme hatlarıyla direncini karşılaştırın.",
          "Şemadan omurga ve kol bağlantılarını belirleyin. Konnektörleri kontrollü biçimde ayırarak hattı bölümlere bölün ve ölçümü tekrarlayın.",
          "Bir ECU ayrıldığında direnç veya gerilim normale dönüyorsa yalnız ECU'yu değil, o ECU'nun beslemesini, toprağını, konnektörünü ve kol kablosunu da inceleyin.",
          "Terminasyonların omurganın iki fiziksel ucunda bulunduğunu, yıldız bağlantı yapılmadığını ve kol kablolarının üretici sınırları içinde kısa tutulduğunu doğrulayın.",
          "Konnektörlerde geri kaçmış pin, su, oksit, ekranlama hatası, ezilmiş bükümlü çift ve şasiyle istenmeyen teması kontrol edin.",
        ],
      },
      {
        title: "Bitrate, sample point ve ACK sorunları",
        paragraphs: [
          "250 kbit/s çalışan bir makine ağına 500 kbit/s ayarlı arayüzle bağlanmak, anlamlı mesaj yerine hata çerçeveleri ve artan sayaçlar üretir. Nominal bitrate dışında sample point, oscillator toleransı ve CAN FD kullanılıyorsa data bitrate ayarları da ağla uyumlu olmalıdır. Önce makine dokümanındaki hızı kullanın; bilinmeyen bir hatta deneme amaçlı mesaj göndermeyin.",
          "Tezgâhta tek bir aktif verici varsa başka düğüm ACK biti üretmediği için verici hata sayabilir ve mesajı tekrarlar. Listen-only modundaki analiz arayüzü de ACK göndermez. Bu durum kablo arızasıyla karıştırılmamalı; test düzeninde doğru bitrate'e ayarlı en az bir normal katılımcı bulunduğu doğrulanmalıdır.",
        ],
      },
      {
        title: "SocketCAN ile hata sayaçlarını kontrol etme",
        paragraphs: [
          "Linux üzerinde arayüz durumunu ip -details -statistics link show can1 komutuyla kontrol edin. Çıktıda bitrate, sample-point, ERROR-ACTIVE / ERROR-PASSIVE / BUS-OFF durumu, berr-counter değerleri ve alınan hata istatistikleri birlikte görülür. Trafiği zaman damgası ve hata çerçeveleriyle izlemek için candump -tz -e can1 kullanılabilir.",
          "ERROR-ACTIVE normal çalışma durumudur. Hatalar biriktikçe düğüm ERROR-PASSIVE olabilir; iletim hata sayacı sınırı aştığında BUS-OFF durumuna geçerek ağı korumak için iletimi bırakır. restart-ms ile otomatik toparlanma ayarlamak kök nedeni çözmez ve aralıklı arızayı gizleyebilir; önce yanlış bitrate, terminasyon, kısa devre, toprak farkı ve ACK eksikliğini giderin.",
        ],
        code: [
          "ip -details -statistics link show can1",
          "candump -tz -e can1",
        ],
      },
      {
        title: "Osiloskopta ne aranır?",
        paragraphs: [
          "Osiloskop prob topraklarını güvenli referans noktasına bağlayın ve mümkünse CAN-H ile CAN-L arasını diferansiyel probla inceleyin. Sağlıklı dominant bitlerde iki hat zıt yönde hareket eder. Düşük genlik, yavaş kenarlar, belirgin overshoot/ringing veya bit ortasına kadar süren yansıma; aşırı kol uzunluğu, yanlış terminasyon, kablo empedansı veya bağlantı sorununa işaret edebilir.",
          "Ölçümü yalnız servis konnektöründe değil, arızanın görüldüğü ECU yakınında da tekrarlayın. Sinyal bir noktada temiz, başka bir noktada bozuksa aradaki kablo ve bağlantılar güçlü adaydır. Kabul limitlerini kullanılan transceiver, kablo uzunluğu ve ağ hızına ait dokümanla karşılaştırın.",
        ],
      },
      {
        title: "Belirtiden olası nedene geçiş",
        table: {
          columns: ["Belirti", "Öncelikli kontroller"],
          rows: [
            ["Ağda hiç trafik yok", "ECU beslemeleri, ortak referans, kopuk omurga, bitrate ve transceiver enable"],
            ["Yalnız bir ECU görünmüyor", "İlgili kol, konnektör, ECU besleme/toprak, filtre ve CAN ID"],
            ["Titreşimde iletişim kesiliyor", "Pin tutuculuğu, oksit, kablo kırığı, ekranlama ve şasi teması"],
            ["Yük altında hata artıyor", "Besleme düşümü, toprak farkı, EMI, terminasyon, kol uzunluğu ve ringing"],
            ["İletim başlayınca bus-off oluyor", "Bitrate/sample point, ACK, CAN-H/CAN-L kısa devresi ve ters bağlantı"],
          ],
        },
      },
      {
        title: "Saha kontrol listesi",
        list: [
          "Makineyi ve aktüatörleri güvenli duruma alın; ölçüm noktasını ve şemadaki ağ kolunu belirleyin.",
          "Enerji kapalıyken CAN-H / CAN-L direncini kaydedin ve terminasyon sayısıyla karşılaştırın.",
          "Her iki hattın şasi, ağ toprağı ve besleme ile istenmeyen temasını kontrol edin.",
          "Enerjiyi açıp CAN-H ve CAN-L gerilimlerini aynı referansa göre ölçün.",
          "Bitrate, sample point, CAN/CAN FD modu ve Standard/Extended filtrelerini doğrulayın.",
          "Arayüzün durumunu, TX/RX hata sayaçlarını ve hata çerçevelerini kaydedin.",
          "Sorun aralıklıysa konnektör, titreşim, sıcaklık, yük ve besleme değişimini CAN kaydıyla aynı zaman çizelgesinde karşılaştırın.",
          "Onarım sonrası aynı test koşulunu tekrarlayın; yalnız hata kodunun silinmesini başarı kabul etmeyin.",
        ],
      },
      {
        title: "Sık yapılan hatalar",
        paragraphs: [
          "Enerjili hatta ohm ölçmek, 60 Ω sonucunu bütün ağın sağlamlığı olarak yorumlamak, osiloskop prob toprağını uygunsuz noktaya bağlamak ve bilinmeyen hatta mesaj göndermek sık yapılan hatalardır. Bir başka hata da bus-off durumundaki arayüzü sürekli yeniden başlatıp fiziksel nedeni görünmez hâle getirmektir.",
          "CAN Viewer ile canlı kimlikleri, periyotları ve veri değişimini izleyebilir; CAN Log Analyzer ile kaydedilmiş TRC, ASC, CSV ve candump verilerinde zamanlama sapmalarını inceleyebilirsiniz. Fiziksel ölçümleri, hata sayaçlarını ve kayıt sonucunu aynı teşhis notunda birleştirin.",
        ],
      },
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
    dateModified: "2026-09-10",
    updatedLabel: "10 Eylül 2026",
    tool: { href: "/j1939-dtc-decoder/", label: "J1939 DTC Decoder'ı aç" },
    relatedTool: { href: "/j1939-pgn-calculator/", label: "PGN / CAN ID Hesaplayıcıyı aç" },
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
  "j1939-pgn-nedir": {
    title: "J1939 PGN nedir? 29-bit CAN ID, PDU1 ve PDU2 hesaplama",
    description: "J1939 29-bit CAN kimliğinden PGN, priority, source address ve destination address alanlarını çıkarın; PDU1 ve PDU2 farkını gerçek örneklerle öğrenin.",
    readTime: "11 dakika",
    datePublished: "2026-09-12",
    dateModified: "2026-09-12",
    updatedLabel: "12 Eylül 2026",
    tool: { href: "/j1939-pgn-calculator/", label: "PGN / CAN ID Hesaplayıcıyı aç" },
    relatedTool: { href: "/j1939-dtc-decoder/", label: "J1939 DTC Decoder'ı aç" },
    sections: [
      {
        title: "PGN nedir?",
        paragraphs: [
          "PGN (Parameter Group Number), bir J1939 mesaj grubunun anlamını ve payload düzenini tanımlayan 18 bitlik numaradır. PGN mesajın hangi parametre grubunu taşıdığını söyler; SPN ise bu payload içindeki tek bir parametreyi tanımlar. Örneğin DM1 mesajının PGN değeri 65226'dır; DM1 içindeki arıza parametreleri SPN ve FMI alanlarıyla ayrılır.",
          "PGN, 29-bit Extended CAN kimliğinin tamamı değildir. Priority ve source address CAN ID içinde bulunur ancak PGN'ye dahil değildir. PDU1 mesajlarında destination address de PGN'nin parçası değildir; PDU2 mesajlarında aynı byte group extension olarak yorumlanır ve PGN'ye katılır.",
        ],
      },
      {
        title: "29-bit J1939 CAN ID alanları",
        paragraphs: [
          "J1939 kimliği soldan sağa priority, EDP/R, data page, PDU format, PDU specific ve source address alanlarına ayrılır. Priority değeri CAN arbitration sırasında önceliği etkiler; sayısal değer küçüldükçe öncelik yükselir. PF alanı mesajın PDU1 mi PDU2 mi olduğunu, PS alanının ise hedef adres mi yoksa group extension mı olduğunu belirler.",
        ],
        table: {
          columns: ["Alan", "Bitler", "Görevi"],
          rows: [
            ["Priority", "28–26 / 3 bit", "Arbitration önceliği; PGN'ye dahil değildir"],
            ["EDP/R", "25 / 1 bit", "Extended data page veya reserved alanı; PGN'nin en yüksek bitidir"],
            ["DP", "24 / 1 bit", "Data page seçimi; PGN'ye dahildir"],
            ["PF", "23–16 / 8 bit", "PDU format; PDU1/PDU2 ayrımını belirler"],
            ["PS", "15–8 / 8 bit", "PDU1'de destination address, PDU2'de group extension"],
            ["SA", "7–0 / 8 bit", "Mesajı gönderen ECU'nun source address değeri"],
          ],
        },
      },
      {
        title: "PDU1 ve PDU2 farkı",
        paragraphs: [
          "PF değeri 0–239 arasındaysa mesaj PDU1'dir. PS byte'ı destination address olarak kullanılır; belirli bir ECU hedeflenebilir veya 0xFF global adresi seçilebilir. Hedef adres PGN'ye katılmadığı için PDU1 PGN'sinin en düşük byte'ı her zaman 0x00 kabul edilir.",
          "PF değeri 240–255 arasındaysa mesaj PDU2'dir. Bu biçim yayın mesajları içindir ve PS byte'ı group extension olur. Group extension PGN'nin en düşük byte'ıdır; bu nedenle PDU2'de PS değeri PGN hesabına katılır.",
        ],
        table: {
          columns: ["Özellik", "PDU1", "PDU2"],
          rows: [
            ["PF aralığı", "0–239 / 0x00–0xEF", "240–255 / 0xF0–0xFF"],
            ["PS anlamı", "Destination address", "Group extension"],
            ["İletim", "Hedefe özel veya global", "Broadcast"],
            ["PGN'nin düşük byte'ı", "0x00", "PS değeri"],
          ],
        },
      },
      {
        title: "CAN ID'den PGN nasıl hesaplanır?",
        paragraphs: [
          "Önce 29-bit kimlikten EDP/R, DP, PF, PS ve SA alanlarını ayırın. Ardından PF değerini kontrol edin. PF 240'tan küçükse PGN hesabında PS yerine 0 kullanın; PF 240 veya daha büyükse PS değerini group extension olarak ekleyin.",
          "Genel formül aşağıdaki gibidir. GE değeri PDU1 için 0, PDU2 için PS değeridir. Kimliği yazılımda işlerken signed 32-bit kaydırmaların işaret üretmemesine dikkat edin; sonucu unsigned olarak ele alın ve 0x1FFFFFFF maskesiyle 29 bit içinde doğrulayın.",
        ],
        code: [
          "PGN = (EDP/R × 0x20000) + (DP × 0x10000) + (PF × 0x100) + GE",
          "GE = PF < 240 ? 0 : PS",
          "SA = CAN_ID & 0xFF",
        ],
      },
      {
        title: "PDU2 örneği: 0x18FECA00",
        paragraphs: [
          "0x18FECA00 kimliğinde priority 6, EDP/R 0, DP 0, PF 0xFE, PS 0xCA ve source address 0x00'dır. PF değeri 254 olduğu için mesaj PDU2'dir; PS byte'ı group extension olarak PGN'ye katılır. Sonuç PGN 0xFECA, yani decimal 65226'dır. Bu PGN DM1 aktif arıza mesajını tanımlar.",
          "Aynı 0xFECA PGN'si 0x18FECA03 kimliğiyle gelirse mesaj grubu yine DM1'dir fakat source address 0x03 olur. Kayıt analizinde yalnız PGN'ye göre gruplamak, farklı ECU'ların mesajlarını birleştirebilir; PGN ile source address'i birlikte saklayın.",
        ],
        code: [
          "0x18FECA00 → priority 6 | PF 0xFE | GE 0xCA | SA 0x00",
          "PGN = 0xFECA = 65226",
        ],
      },
      {
        title: "PDU1 örneği: 0x18ECFF00",
        paragraphs: [
          "0x18ECFF00 kimliğinde priority 6, PF 0xEC, PS 0xFF ve source address 0x00'dır. PF değeri 236 olduğu için mesaj PDU1'dir. PS alanı global destination address'tir ve PGN hesabına katılmaz; bu nedenle sonuç 0xEC00, yani decimal 60416'dır. Bu PGN J1939 Transport Protocol Connection Management mesajını tanımlar.",
          "Buradaki 0xFF değerini PGN'nin son byte'ı sanıp 0xECFF sonucuna ulaşmak yaygın bir hatadır. PDU1'de hedef adres değişse bile PGN değişmez: 0x18EC0300 kimliği de destination address 0x03 olan PGN 0xEC00 mesajıdır.",
        ],
        code: [
          "0x18ECFF00 → priority 6 | PF 0xEC | DA 0xFF | SA 0x00",
          "PGN = 0xEC00 = 60416",
        ],
      },
      {
        title: "PGN'den CAN ID oluşturma",
        paragraphs: [
          "Ters işlemde önce PGN'nin PF alanına bakın. PDU2 için PGN'nin düşük byte'ı group extension olarak doğrudan PS alanına yazılır. Örneğin PGN 0xFECA, priority 6 ve source address 0x00 seçildiğinde CAN ID 0x18FECA00 olur.",
          "PDU1 için PGN'nin düşük byte'ı 0x00 olmalıdır ve destination address ayrıca seçilir. PGN 0xEC00, priority 6, destination 0xFF ve source address 0x00 değerleri 0x18ECFF00 kimliğini oluşturur. Priority, hedef ve kaynak adresi mesaj tanımıyla doğrulamadan gerçek bir ağa çerçeve göndermeyin.",
        ],
        code: [
          "PDU2: 0xFECA + priority 6 + SA 0x00 → 0x18FECA00",
          "PDU1: 0xEC00 + priority 6 + DA 0xFF + SA 0x00 → 0x18ECFF00",
        ],
      },
      {
        title: "Sık görülen J1939 PGN örnekleri",
        paragraphs: [
          "Aşağıdaki kısa liste hesaplama kontrolü içindir. PGN adı, payload yerleşimi, yayın periyodu ve SPN tanımları için projenizde geçerli lisanslı SAE J1939DA sürümünü, DBC dosyasını ve üretici dokümanını kullanın.",
        ],
        table: {
          columns: ["PGN", "Hex", "Yaygın ad", "PDU tipi"],
          rows: [
            ["59904", "0xEA00", "Request", "PDU1"],
            ["60160", "0xEB00", "Transport Protocol Data Transfer (TP.DT)", "PDU1"],
            ["60416", "0xEC00", "Transport Protocol Connection Management (TP.CM)", "PDU1"],
            ["60928", "0xEE00", "Address Claimed", "PDU1"],
            ["61444", "0xF004", "Electronic Engine Controller 1 (EEC1)", "PDU2"],
            ["65226", "0xFECA", "Active Diagnostic Trouble Codes (DM1)", "PDU2"],
          ],
        },
      },
      {
        title: "Sık yapılan hatalar",
        list: [
          "29-bit J1939 kimliğini 11-bit Standard CAN kimliği gibi yorumlamak.",
          "PDU1 mesajında PS byte'ını PGN'nin düşük byte'ı sanmak.",
          "Hexadecimal ve decimal değerleri birbirine karıştırmak; örneğin 0xFECA ile 65226'nın aynı PGN olduğunu gözden kaçırmak.",
          "Priority veya source address değiştiğinde PGN'nin de değiştiğini varsaymak.",
          "Farklı source address'lerden gelen aynı PGN'yi tek ECU verisi gibi birleştirmek.",
          "PGN numarasını bulduktan sonra payload'ın otomatik olarak çözüldüğünü sanmak; SPN yerleşimi için doğru J1939DA/DBC sürümü gerekir.",
        ],
      },
      {
        title: "CAN log analizinde pratik iş akışı",
        list: [
          "Kayıtta Extended frame bilgisini, tam 29-bit CAN ID'yi, zaman damgasını, DLC'yi ve payload'ı koruyun.",
          "CAN ID'yi PGN / CAN ID Hesaplayıcıda çözerek priority, PF, PS, source address ve PDU tipini doğrulayın.",
          "PDU1 ise destination address'i; PDU2 ise group extension değerini ayrı kaydedin.",
          "PGN ve source address çiftine göre mesaj periyodunu, kayıpları ve payload değişimini inceleyin.",
          "Sinyal çözümlemesini doğru sürümde J1939DA, DBC veya üretici dokümanıyla yapın; sonucu gerçek sistem davranışıyla doğrulayın.",
        ],
      },
    ],
    sources: [
      { href: "https://www.sae.org/standards/content/j1939_202412", label: "SAE J1939 üst seviye standart dokümanı" },
      { href: "https://www.sae.org/standards/content/J1939DA_202606", label: "SAE J1939 Digital Annex" },
      { href: "https://kvaser.com/about-can/higher-layer-protocols/j1939-introduction/", label: "Kvaser SAE J1939 Introduction" },
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
      { "@type": "Article", headline: guide.title, description: guide.description, url, mainEntityOfPage: url, image: "https://algo-team.com/assets/og-cover.png", inLanguage: "tr-TR", datePublished: guide.datePublished, dateModified: guide.dateModified, citation: "sources" in guide ? guide.sources.map((source) => source.href) : undefined, author: { "@type": "Organization", name: "ALGO TEAM" }, publisher: { "@type": "Organization", name: "ALGO TEAM", url: "https://algo-team.com/", logo: { "@type": "ImageObject", url: "https://algo-team.com/assets/algo-team-logo.png" } } },
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
          {guide.sections.map((section) => <section key={section.title}>
            <h2>{section.title}</h2>
            {"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}
            {"list" in section ? <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            {"table" in section ? <div className="guide-table-wrap"><table><thead><tr>{section.table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{section.table.rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div> : null}
            {"code" in section ? <div className="guide-code-list">{section.code.map((line) => <pre key={line}><code>{line}</code></pre>)}</div> : null}
          </section>)}
          {"sources" in guide ? <section className="guide-sources"><h2>Kaynaklar ve kapsam</h2><div><p>Bu rehber kamuya açık teknik açıklamalar temel alınarak özgün biçimde hazırlanmıştır. Resmî PGN/SPN tanımları ve proje kararları için lisanslı standardın güncel sürümünü esas alın.</p><ul>{guide.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></div></section> : null}
          <aside><h2>Uygulamaya geçin</h2><p>Örneklerinizi güvenli bir test ortamında deneyin; sonucu her zaman ham veri ve bağımsız ölçümle doğrulayın.</p><div className="guide-actions"><a href={guide.tool.href}>{guide.tool.label} →</a>{"relatedTool" in guide ? <a className="secondary" href={guide.relatedTool.href}>{guide.relatedTool.label} →</a> : null}</div></aside>
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
