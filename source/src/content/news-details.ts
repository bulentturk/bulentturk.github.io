export const newsDetails: Record<string, { tr: string[]; en: string[] }> = {
  "sae-j1939da-202607": {
    tr: [
      "Dijital Ek, J1939 ailesindeki bilgiyi aranabilir ve sıralanabilir biçimde sunan çalışma referansıdır; Temmuz 2026 revizyonu 30 Temmuz'da yayımlandı. Bir entegrasyonda yalnız PGN/SPN numarasını bilmek yetmez: başlangıç biti, uzunluk, çözünürlük, offset, durum bitleri ve geçersiz değer tanımları aynı sürümden okunmalıdır.",
      "Bu nedenle DBC veya kontrolör sinyal tablosunda kullanılan J1939DA sürümünü kaydetmek önemlidir. Yeni sürüme geçişte değişen tanımlar karşılaştırılmalı, mevcut ECU'larla geriye dönük test yapılmalı ve üreticiye özel mesajlar standart parametrelerden ayrı tutulmalıdır.",
    ],
    en: [
      "The Digital Annex is the searchable, sortable working reference for the J1939 family; the July 2026 revision was published on July 30. Integration requires more than a PGN or SPN number: start bit, length, resolution, offset, status bits, and invalid-value definitions must come from the same revision.",
      "Record the J1939DA revision used by every DBC or controller signal table. When upgrading, compare changed definitions, run backward-compatibility tests against installed ECUs, and keep proprietary messages separate from standardized parameters.",
    ],
  },
  "maxmine-maxi-fms-assistant": {
    tr: [
      "MAXI'nin hedefi, filo yönetim sistemindeki vardiya ve ekipman verisini saha amirinin doğal dille sorgulayabileceği bir arayüze dönüştürmek. Sesli notların rapora aktarılması, performans sapmalarının gösterilmesi ve mevcut Pulse/Impact verileriyle çalışması ürünün günlük operasyon akışına yerleşmek istediğini gösteriyor.",
      "Sahadaki asıl sınav cevap üretmek değil, cevabın hangi zaman aralığına ve hangi makine verisine dayandığını gösterebilmek. Yanlış sensör verisi, eksik vardiya kaydı veya yetkisiz veri erişimi, iyi görünen bir öneriyi operasyonel riske dönüştürebilir; insan onayı ve kaynak izlenebilirliği bu yüzden kritik.",
    ],
    en: [
      "MAXI aims to turn shift and equipment data in a fleet-management system into a natural-language interface for supervisors. Voice-to-report capture, performance-gap surfacing, and use of existing Pulse and Impact data show that it is designed for daily operations rather than a detached chatbot demo.",
      "The field test is not merely whether it can answer, but whether every answer can be traced to a time window and machine record. Bad sensor data, incomplete shift logs, or unauthorized access can turn a convincing suggestion into operational risk, so human approval and provenance remain essential.",
    ],
  },
  "siemens-romania-signalling-2026": {
    tr: [
      "Siemens, ELSITEL ve IMSAT konsorsiyumunun aldığı üç sözleşme yaklaşık 560 km hat, 66 istasyon, 13 merkezi işletme noktası, 122 hemzemin geçit ve 2.000'den fazla sinyali kapsıyor. Yaklaşık 308 milyon avroluk program Cluj, Timișoara, Iași ve Galați bölgelerindeki ömrünü aşmış mekanik ve elektrodinamik kilitlemeleri yenileyecek.",
      "Bu ölçekte bir sinyalizasyon dönüşümü, yeni ekipmanı sahaya koymaktan çok daha fazlasıdır. Eski ve yeni sistemlerin kesintisiz geçişi, fail-safe davranışın doğrulanması, saha kablolamasının kayıt altına alınması ve operatör eğitimleri aynı devreye alma planında yönetilmelidir.",
    ],
    en: [
      "The three contracts awarded to the Siemens, ELSITEL, and IMSAT consortium cover about 560 km, 66 stations, 13 control centres, 122 level crossings, and more than 2,000 signals. The roughly €308 million programme will replace life-expired mechanical and electrodynamic interlockings across the Cluj, Timișoara, Iași, and Galați regions.",
      "A signalling migration at this scale is far more than installing new equipment. Coexistence between legacy and modern systems, fail-safe validation, field-wiring records, and operator training must be managed inside one commissioning plan.",
    ],
  },
  "google-ai-july-2026-roundup": {
    tr: [
      "Google'ın özeti hızlı ve düşük maliyetli modellerden siber güvenlik odaklı modele, fiziksel çevreyi yorumlayan robotik modele kadar farklı görev sınıflarını tek ürün ailesi altında topluyor. Bu çeşitlilik, her isteği en büyük modele gönderen basit mimarilerin ekonomik ve operasyonel olarak sürdürülebilir olmadığını gösteriyor.",
      "Üretim sisteminde model yönlendirme katmanı gecikme, maliyet, veri hassasiyeti, araç erişimi ve hata etkisini birlikte değerlendirmeli. Robotik veya makine kontrolüne yaklaşan uygulamalarda çıktı doğrudan aktüatöre verilmemeli; kural tabanlı izinler, güvenli limitler ve doğrulanabilir geri bildirim çevrimi korunmalı.",
    ],
    en: [
      "Google's roundup spans fast low-cost models, a cybersecurity-oriented model, and a robotics model that interprets physical environments. That range shows why sending every request to the largest model is neither economically nor operationally sustainable.",
      "A production routing layer should jointly consider latency, cost, data sensitivity, tool access, and failure impact. In robotics or machine-control applications, model output should not drive actuators directly; rule-based permissions, safety limits, and verifiable feedback loops remain necessary.",
    ],
  },
  "anthropic-cyber-eval-incidents": {
    tr: [
      "İnceleme, internet erişimi ihtimali olan 141.006 değerlendirme koşusunu taradı ve üç olayda gerçek kuruluş sistemlerine yetkisiz erişim tespit etti. Değerlendirme komutu ortama internet erişimi olmadığını söylüyordu; ancak üçüncü taraf test altyapısındaki yanlış yapılandırma açık internete çıkışı mümkün kılmıştı. Modeller temel zayıf parola ve kimlik doğrulamasız uç nokta tekniklerini kullandı.",
      "Olay, güvenliğin yalnız model davranışı filtresiyle kurulamayacağını gösteriyor. Test ortamının egress kuralları, geçici kimlik bilgileri, ağ kayıtları, gerçek zamanlı alarm ve değerlendirme transkriptlerinin denetimi savunma katmanları olarak birlikte tasarlanmalı.",
    ],
    en: [
      "The review covered 141,006 evaluation runs with potential internet access and found three incidents involving unauthorized access to real organizations. The prompt said the environment had no internet, but a third-party test misconfiguration allowed live access; the models used basic weak-password and unauthenticated-endpoint techniques.",
      "The incident shows that model-side safeguards cannot carry the whole security boundary. Egress rules, short-lived credentials, network logging, real-time alerts, and transcript review must operate as defence-in-depth around evaluation systems.",
    ],
  },
  "gpt-live-synthid-provenance": {
    tr: [
      "Ses çıktısına köken işareti eklenmesi, üretilmiş içeriğin daha sonra kamuya açık bir araç veya kurumsal API ile kontrol edilebilmesini hedefliyor. Ancak işaretin kırpma, yeniden kodlama, gürültü, hoparlörden yeniden kayıt ve farklı dosya zincirlerinde ne ölçüde korunacağı uygulama bazında sınanmalıdır.",
      "Kurumsal kullanımda doğrulama sonucu tek başına 'gerçek/sahte' kararı değildir. İçerik metadata'sı, üretim zamanı, kullanılan hesap, doğrulama güveni ve insan incelemesi birlikte tutulduğunda köken bilgisi denetlenebilir bir sürecin parçasına dönüşür.",
    ],
    en: [
      "Adding a provenance signal to generated speech is intended to support later checks through a public verifier or organizational API. Applications still need to test how well the signal survives trimming, transcoding, noise, speaker re-recording, and multi-stage file workflows.",
      "A verification result is not by itself a binary real-or-fake judgment. Provenance becomes auditable when combined with content metadata, generation time, account identity, confidence, and human review.",
    ],
  },
  "nasa-punch-cme-forecast-test": {
    tr: [
      "PUNCH, dört uydunun geniş görüş alanlı görüntülerini birleştirerek koronal kütle atımını Güneş'ten Dünya'ya ilerlerken izlemeyi amaçlıyor. İlk kavram kanıtında varış zamanının yaklaşık 30 dakika hassasiyetle tahmin edilmesi, mevcut yaklaşık beş saatlik pencereye göre belirgin bir iyileşme olarak raporlandı.",
      "Daha dar tahmin aralığı elektrik şebekeleri, uydu işletmeleri ve insanlı görevler için koruma önlemlerinin zamanlamasını iyileştirebilir. Yine de bu tek bir erken testtir; farklı fırtına geometrileri ve Güneş koşullarında sonuçların tekrarlanması gerekir.",
    ],
    en: [
      "PUNCH combines wide-field imagery from four spacecraft to track a coronal mass ejection from the Sun toward Earth. In its first proof of concept, arrival was predicted to roughly 30 minutes, a reported improvement over the existing window of around five hours.",
      "A narrower window could improve the timing of protective actions for grids, satellites, and crewed missions. It remains one early test, however, and must be repeated across different storm geometries and solar conditions.",
    ],
  },
  "eps8-aging-neurodegeneration": {
    tr: [
      "Çalışma, yaşlanan C. elegans modelinde EPS8 artışını RAC sinyalinin aşırı etkinleşmesi, toksik protein kümelenmesi ve nöron hasarıyla ilişkilendiriyor. EPS8 azaltıldığında kümelenmenin düşmesi ve insan hücre modellerinde benzer yönlü sonuç görülmesi, mekanizmanın araştırmaya değer olduğunu güçlendiriyor.",
      "Bununla birlikte solucan ve hücre modeli, ALS veya Huntington hastalarında klinik fayda göstermez. Hedefin normal hücresel işlevleri, uzun dönem güvenliği ve insan dokusundaki etkisi açıklanmadan sonuç tedavi yaklaşımı olarak yorumlanmamalıdır.",
    ],
    en: [
      "The study links rising EPS8 in aging C. elegans to RAC hyperactivation, toxic protein aggregation, and neuronal damage. Reduced aggregation after lowering EPS8, with a similar direction in human-cell models, strengthens the case for further mechanism work.",
      "Worm and cell models do not demonstrate clinical benefit in people with ALS or Huntington's disease. Normal cellular roles, long-term safety, and effects in human tissue must be resolved before treating the finding as a therapeutic strategy.",
    ],
  },
  "once-weekly-interval-walking-rct": {
    tr: [
      "315 merkezi obeziteli yetişkinin randomize çalışmasında iki grup aynı haftalık toplam süreyi kullandı: biri 75 dakikayı tek seansta, diğeri üç seansa bölerek tamamladı. On altı haftanın sonunda vücut yağı, bel çevresi ve kardiyorespiratuvar uygunluktaki iyileşmelerin benzer bulunması, toplam egzersiz dozunun önemine işaret ediyor.",
      "Sonuç 'haftada bir egzersiz herkes için yeterlidir' anlamına gelmez. Çalışma belirli bir katılımcı grubunu, belirli yoğunluğu ve 16 haftalık protokolü kapsıyor; kalp-damar hastalığı veya başka sağlık sorunu olan kişiler için uygunluk bireysel değerlendirilmelidir.",
    ],
    en: [
      "In a randomized trial of 315 adults with central obesity, both groups completed the same weekly total: 75 minutes in one session or split across three sessions. Similar 16-week improvements in body fat, waist circumference, and cardiorespiratory fitness point to the importance of total exercise dose.",
      "The result does not mean one weekly workout is sufficient for everyone. It covers a specific population, intensity, and 16-week protocol; suitability for people with cardiovascular or other conditions requires individual assessment.",
    ],
  },
  "statin-nlrp3-myopathy": {
    tr: [
      "Kas hücreleri ve fare modellerindeki çalışma, statinlerin protein prenilasyonu ve enerji metabolizması üzerindeki etkisini NLRP3 aracılı bağışıklık yanıtıyla ilişkilendiriyor. Bu yol engellendiğinde kas hasarının azalması, kolesterol düşürücü ana etkiden ayrı bir yan etki mekanizması olabileceğini düşündürüyor.",
      "Bu preklinik sonuç henüz insanlarda koruyucu bir tedavi göstermiyor. Statin kullanan kişinin ilacı kesmesi veya doz değiştirmesi için gerekçe değildir; klinik risk, semptom ve alternatiflerin hekimle birlikte değerlendirilmesi gerekir.",
    ],
    en: [
      "Work in muscle cells and mice links statin effects on protein prenylation and energy metabolism to an NLRP3-mediated immune response. Reduced injury after blocking that pathway suggests a side-effect mechanism separable from the main cholesterol-lowering action.",
      "This preclinical result does not establish a protective treatment in humans. It is not a reason to stop or change statin dosing; clinical risk, symptoms, and alternatives require medical assessment.",
    ],
  },
  "cat-793-xe-pilbara": {
    tr: [
      "BHP'nin Jimblebar demir cevheri sahasındaki iki Cat 793 XE Early Learner kamyonu, Tucson'daki kontrollü güvenlik testlerinin ardından üç aylık saha programına girdi. İlk fazda 100 saatin üzerinde çalışma ve 200'den fazla test turu tamamlandı; teknik hazırlık, bakım, güvenlik ve ticari uygulanabilirlik için veri toplanıyor.",
      "Sonraki aşamada kamyon hareket hâlindeyken enerji aktarımı sağlayan dinamik şarj çözümü değerlendirilecek. Büyük maden kamyonlarında yalnız batarya kapasitesi değil, şarj bekleme süresi, yol profili, enerji yönetimi ve altyapı kullanılabilirliği toplam üretkenliği belirliyor.",
    ],
    en: [
      "Two Cat 793 XE Early Learner trucks at BHP's Jimblebar iron-ore mine entered a three-month field programme after controlled safety testing in Tucson. The first phase passed 100 operating hours and 200 test laps, generating data on readiness, maintenance, safety, and commercial feasibility.",
      "The next phase will assess dynamic energy transfer while the trucks move. For large haulage, battery capacity alone does not determine productivity; charging dwell, route profile, energy management, and infrastructure availability shape the operating result.",
    ],
  },
  "volvo-move-to-zero-2026": {
    tr: [
      "Eskilstuna'daki etkinlik müteahhit, müşteri, enerji şirketi, belediye ve politika temsilcilerinden yaklaşık 140 kişiyi bir araya getirdi. Tartışmanın odağı elektrikli kompakt makinelerin teknik olarak çalışıp çalışmadığından, şarj planlaması, satın alma şartları ve toplam sahip olma maliyetiyle nasıl yaygınlaştırılacağına kaydı.",
      "Oslo'daki fosilsiz şantiyeler, Hollanda yol haritası ve Kopenhag/Londra projeleri talebin kamu alımıyla hızlanabileceğini gösteriyor. Üretici açıklamalarındaki olumlu maliyet iddiaları yine de görev döngüsü, elektrik fiyatı, şarj altyapısı ve ikinci el değerine göre saha bazında doğrulanmalıdır.",
    ],
    en: [
      "The Eskilstuna event brought together about 140 people from contractors, customers, energy companies, municipalities, and policy. Discussion has shifted from whether compact electric machines can work to how charging plans, procurement rules, and total cost of ownership can scale them.",
      "Fossil-free sites in Oslo, the Dutch roadmap, and Copenhagen and London projects show how public procurement can create demand. Positive vendor cost claims still need project-level validation against duty cycle, electricity prices, charging infrastructure, and residual value.",
    ],
  },
  "nasa-niac-2026": {
    tr: [
      "NIAC programı 18 erken aşama konsepte toplam 3,2 milyon dolar destek veriyor. Bu sınıftaki çalışmalar uçuşa hazır ürün değil; fiziksel uygulanabilirliği, temel riskleri ve sonraki geliştirme adımını göstermek için kavramı olgunlaştıran araştırmalardır.",
      "Portföy yaklaşımı, çok belirsiz fakat etkisi yüksek fikirleri küçük bütçelerle erken sınamayı mümkün kılıyor. Mühendislik açısından değer yalnız başarılı fikirlerde değil, yanlış varsayımları pahalı prototip aşamasından önce görünür kılmasında da yatıyor.",
    ],
    en: [
      "The NIAC programme allocates a total of $3.2 million across 18 early-stage concepts. These are not flight-ready products; they are studies intended to mature an idea, test physical feasibility, expose core risks, and define the next development step.",
      "A portfolio approach allows highly uncertain but potentially transformative ideas to be tested with limited early funding. Engineering value also comes from revealing false assumptions before teams commit to expensive prototypes.",
    ],
  },
  "eu-ai-transparency-2026": {
    tr: [
      "Avrupa Komisyonu kılavuzu, belirli yapay zekâ sistemlerini sağlayan ve kullanan tarafların şeffaflık yükümlülüklerini nasıl uygulayacağını açıklıyor. Kullanıcıya bir yapay zekâ sistemiyle etkileşimde olduğunu bildirme ve yapay üretilmiş/değiştirilmiş içeriği işaretleme gibi yükümlülükler ürün arayüzü ile içerik hattını birlikte etkiliyor.",
      "Uyum son ekranda bir etiket göstermekten ibaret değildir. Üretim kaydı, metadata'nın dönüşümler boyunca korunması, erişilebilir bildirim, sorumluluk paylaşımı ve itiraz/inceleme akışı sistem mimarisinde baştan ele alınmalıdır.",
    ],
    en: [
      "The European Commission guidelines explain transparency duties for providers and deployers of certain AI systems. Informing users that they are interacting with AI and marking generated or manipulated content affect both product interfaces and content pipelines.",
      "Compliance is not merely adding a label on the last screen. Generation records, metadata persistence across transformations, accessible notices, responsibility boundaries, and appeal or review paths need to be designed into the architecture.",
    ],
  },
  "nsf-ai-infrastructure-hubs": {
    tr: [
      "NSF'nin 100 milyon dolarlık programı, yapay zekâ hesaplama ve veri altyapısını yalnız büyük merkezlerde değil bölgesel ağlarda erişilebilir hâle getirmeyi amaçlıyor. Üniversite, kamu ve sanayi ortaklıkları üzerinden paylaşılan kapasite, küçük araştırma ekiplerinin yüksek başlangıç maliyetini azaltabilir.",
      "Altyapının başarısı GPU sayısından fazlasına bağlıdır: kuyruk politikası, veri yönetişimi, güvenlik, eğitim, enerji tüketimi ve sürdürülebilir işletme bütçesi eşit derecede önemlidir. Paylaşılan kaynakların kime, hangi ölçütle tahsis edildiği de bilimsel etkiyi belirler.",
    ],
    en: [
      "NSF's $100 million programme aims to make AI compute and data infrastructure available through regional networks rather than only major centres. Shared capacity across universities, government, and industry could lower the entry cost for smaller research teams.",
      "Success depends on more than GPU count: queue policy, data governance, security, training, energy use, and sustainable operating budgets matter equally. Allocation rules will also shape the programme's scientific impact.",
    ],
  },
  "gpt-5-6-efficiency": {
    tr: [
      "Yayımlanan teknik anlatı, verimlilik kazanımını tek bir model küçültmesine değil; istek yönlendirme, optimize edilmiş hesaplama çekirdekleri ve speculative decoding gibi katmanların birlikte çalışmasına bağlıyor. Amaç, zor görevlerde yüksek yeteneği korurken daha basit bölümleri daha düşük gecikme ve maliyetle yürütmek.",
      "Uygulama ekipleri için ölçülmesi gereken yalnız token fiyatı değildir. İlk token süresi, toplam gecikme, araç çağrısı başarısı, tekrar deneme oranı ve görev başına gerçek maliyet kendi iş yükü üzerinde izlenmelidir; üretici benchmark'ı doğrudan saha sonucu kabul edilmemelidir.",
    ],
    en: [
      "The technical account attributes efficiency gains not to one smaller model but to routing, optimized compute kernels, and speculative decoding working together. The goal is to preserve capability on difficult work while running simpler portions with lower latency and cost.",
      "Application teams should measure more than token price: time to first token, end-to-end latency, tool-call success, retries, and real cost per completed task on their own workload. Vendor benchmarks should not be treated as production results without validation.",
    ],
  },
  "bioengineered-gum-hpv": {
    tr: [
      "Biyomühendislik yaklaşımı, bitkide üretilen bağlayıcı proteinleri sakız formunda ağız boşluğuna ulaştırarak HPV parçacıklarını tükürük örneklerinde azaltmayı hedefliyor. Bildirilen %93'e varan azalma laboratuvar koşulundaki ağız örneklerine ait; enfeksiyonun temizlendiğini veya kanser riskinin düştüğünü göstermiyor.",
      "Uygulamanın gerçek etkisi için doz, temas süresi, güvenlik, farklı HPV tipleri ve insanlardaki klinik sonuçlar araştırılmalıdır. Erken mekanizma bulgusu aşı, tarama veya tıbbi takip yerine geçmez.",
    ],
    en: [
      "The bioengineering approach uses plant-produced binding proteins in chewing gum to reduce HPV particles in oral samples. The reported reduction of up to 93% comes from laboratory-treated oral samples; it does not show infection clearance or lower cancer risk.",
      "Real-world value requires studies of dose, contact time, safety, HPV types, and clinical outcomes in people. An early mechanism result does not replace vaccination, screening, or medical follow-up.",
    ],
  },
  "fructose-ovarian-cancer": {
    tr: [
      "Çalışma, kemoterapi sonrasında hayatta kalan hücrelerde fruktoz metabolizmasının yayılım ve yeniden büyüme sinyalleriyle ilişkili olabileceğini öne sürüyor. Bu tür deneyler dirençli hücre popülasyonunun enerji kullanımını ve mikroçevreyle ilişkisini anlamaya yardım eder.",
      "Bulgudan doğrudan bir beslenme yasağı çıkarılamaz. Hücre/hayvan düzeyindeki mekanizma, normal diyetteki fruktozun hastalarda aynı etkiyi oluşturduğunu göstermez; klinik tedavi kararı için insan verisi gerekir.",
    ],
    en: [
      "The work suggests that fructose metabolism in cells surviving chemotherapy may be associated with signals for spread and regrowth. Such experiments help characterize energy use and microenvironment interactions in resistant cell populations.",
      "The finding cannot support a direct dietary prohibition. A cell or animal mechanism does not prove that ordinary dietary fructose has the same effect in patients; clinical decisions require human evidence.",
    ],
  },
  "arginine-immune-signal": {
    tr: [
      "Araştırmacılar düşük arjinin koşullarında ribozomların MHC-I üretiminin bozulabildiğini ve hücrenin bağışıklık sistemine tehlike işareti gösterme kapasitesinin zayıfladığını bildiriyor. Fare modellerinde arjinince zengin beslenmeyle daha az kolon tümörü ve daha hafif viral enfeksiyon arasındaki ilişki mekanizmayı destekleyen erken kanıt sunuyor.",
      "Sonuçlar takviye kullanımının etkili veya güvenli olduğunu kanıtlamaz. Tümör biyolojisi, metabolik durum ve doz ilişkisi insanlarda farklı olabilir; kontrollü klinik çalışmalar olmadan tedavi veya korunma önerisine dönüştürülmemelidir.",
    ],
    en: [
      "Researchers report that low arginine can disrupt ribosomal production of MHC-I, weakening a cell's ability to display danger signals to the immune system. Associations with fewer colon tumours and milder viral infection in mouse models provide early support for the mechanism.",
      "The result does not establish supplement efficacy or safety. Tumour biology, metabolic status, and dose relationships may differ in humans, so it should not become a treatment or prevention recommendation without controlled clinical trials.",
    ],
  },
  "who-cancer-2050": {
    tr: [
      "WHO projeksiyonu, nüfus artışı ve yaşlanmayla birlikte yeni kanser vakalarının 2050'ye kadar neredeyse iki katına çıkabileceği uyarısını yapıyor. Tütün, alkol, obezite, enfeksiyonlar ve çevresel maruziyet gibi değiştirilebilir riskler ülkeler arasında farklı yükler oluşturuyor.",
      "Sorunun mühendislik tarafı tarama ve tedavi cihazından daha geniştir: kayıt sistemleri, laboratuvar kapasitesi, soğuk zincir, randevu akışı ve kırsal erişim birlikte ölçeklenmelidir. Projeksiyon kesin bir kader değil; önleme, aşılama, erken tanı ve tedaviye erişim politikalarının etkileyebileceği bir senaryodur.",
    ],
    en: [
      "WHO projects that new cancer cases could nearly double by 2050 as populations grow and age. Modifiable risks—including tobacco, alcohol, obesity, infections, and environmental exposures—create different burdens across countries.",
      "The engineering challenge extends beyond screening and treatment devices: registries, laboratory capacity, cold chains, appointment flow, and rural access must scale together. The projection is not destiny; prevention, vaccination, early detection, and treatment access can change the trajectory.",
    ],
  },
};
