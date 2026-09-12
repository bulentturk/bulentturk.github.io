export type LaGuideLanguage = "tr" | "en";
export type LaGuideSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  ordered?: boolean;
  formulas?: string[];
  table?: { columns: string[]; rows: string[][] };
  figures?: { src: string; alt: string; caption: string }[];
  refs: number[];
};
export const laGuidePaths = { tr: "/learn/a10vo-la-guc-kontrolu/", en: "/learn/a10vo-la-power-control/" } as const;
export const laGuidePdfs = {
  tr: "/docs/a10vo-la-guc-kontrolu-detayli-kilavuzu-tr-revb.pdf",
  en: "/docs/a10vo-la-power-controller-detailed-guide-en-revb.pdf",
} as const;
export const laSource = "https://www.hydropart.ru/upload/files/7889c25889a3e1418b1fa701e1950d39.pdf";
const codeRows = [
  ["LA5", "≤ 50", "≤ 42.0", "≤ 67.0", "≤ 94.0", "≤ 132.0", "≤ 167.0"],
  ["LA6", "51–90", "42.1–76.0", "67.1–121.0", "94.1–169.0", "132.1–237.0", "167.1–302.0"],
  ["LA7", "91–160", "76.1–134.0", "121.1–213.0", "169.1–299.0", "237.1–418.0", "302.1–540.0"],
  ["LA8", "161–240", "134.1–202.0", "213.1–319.0", "299.1–449.0", "418.1–629.0", "540.1–810.0"],
  ["LA9", "> 240", "> 202.1", "> 319.1", "> 449.1", "> 629.1", "> 810.1"],
];
export function laExampleRows(language: LaGuideLanguage) {
  const number = (value: number) => value.toLocaleString(language === "tr" ? "tr-TR" : "en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const torque = 20 * 60000 / (2 * Math.PI * 1500);
  return [80, 100, 104, 150, 200, 250].map(p => {
    const vg = Math.min(71.1, torque * 20 * Math.PI * 0.92 / p);
    const m = vg * p / (20 * Math.PI * 0.92);
    return [String(p), number(vg), number(vg * 1500 * 0.95 / 1000), number(m), number(2 * Math.PI * m * 1500 / 60000)];
  });
}
export const laGuideCopy = {
  tr: {
    title: "Bosch Rexroth A10VO LA güç kontrolü nasıl çalışır?",
    description: "A10VO LA pompanın çalışma mantığı: eğik plaka, servo piston, sabit tork, p–Q eğrisi, LA.D / DG / S / DS farkları ve NG71 hesap örneği. Simülatörde deneyin.",
    intro: "Basınç yükselirken pompa neden daha az yağ üretir? 20 kW @ 1500 d/dak ayarı neden her devirde 20 kW anlamına gelmez? Ayrıntılı Rev B kılavuzundaki çalışma mantığını, üretici şemalarını ve hesapları aynı öğrenme akışında inceleyin.",
    eyebrow: "ALGO TEAM / HİDROLİK REHBERİ",
    home: "Ana sayfa", lab: "Laboratuvarda dene", simulator: "Hidrolik devre simülatörü", download: "Ayrıntılı kılavuzu indir", pdfLabel: "Rev B · 15 sayfa · PDF", toc: "Bu rehberde", updated: "12 Eylül 2026 · Yaklaşık 18 dakika",
    reference: "Üretici kaynağı", page: "s.", sourceTitle: "Kaynak, sürüm ve kapsam", curveTitle: "İdeal çalışma zarfı — üretici test eğrisi değildir", curveCaption: "NG71 · 1500 d/dak · 20 kW referans ayarı · ηv=0,95 · ηhm=0,92. Yatay eksen debi, dikey eksen basınçtır. DR geçişi idealize edilmiştir; gerçek kontrol toleransları bu çizimde yoktur.",
    sourceText: "Temel metin: ALGO TEAM A10VO LA Ayrıntılı Kılavuz Rev B. Üretici referansı: Bosch Rexroth RE 92705/2019-03-25, özellikle s. 7 ve 9–14. Bağlantı Hydropart üzerindeki üretici dokümanı kopyasına gider. Bu tarih, kullanılan dokümanın sürümüdür; güncel katalog veya ürün uygunluğu iddiası değildir.",
    sourceNote: "Üretici bilgileri, varsayımlı hesaplar ve işlevsel yorumlar ayrı belirtilmiştir. Şemaların telifi Bosch Rexroth AG’ye aittir. ALGO TEAM bağımsız bir eğitim aracıdır; üreticinin resmî eğitim veya seçim yazılımı değildir. PDF kılavuzlar bu web yayınıyla değiştirilmemiştir.",
    nextTitle: "Aynı davranışı canlı izleyin", nextText: "Laboratuvarda basınç ve devri değiştirin; Vg, debi, tork ve gücü birlikte okuyun. Çalıştır zaman kaydını başlatır, Otomatik dene basıncı değiştirir. Kılavuz, okumakta olduğunuz dilde tek düğmeden iner.",
    sections: [
      { id: "principle", title: "1. LA neyi kontrol eder?", paragraphs: [
        "LA kontrolü, değişen çalışma basınçlarında yaklaşık sabit sürücü torku elde etmek için pompanın eğik plaka açısını ve buna bağlı çıkış debisini değiştirir. Kontrol bölgesinde basınç artarken deplasman ve debi azalır. Sabit devir ve yaklaşık sabit verim altında basınç × debi çarpımı yaklaşık sabit kalır.",
        "LA bir basınç düşürücü veya sürekli ana debi boşaltan emniyet valfi değildir. Yük ağırlaştığında çıkıştaki fazla yağı tanka atmak yerine pompanın daha az yağ üretmesini sağlar. DR basınç kontrolü ise başka bir işi yapar: belirlenen maksimum basınca ulaşıldığında deplasmanı azaltır. LA.D içinde bu iki görev birlikte bulunur.",
        "Düşük basınçta LA her zaman tam ayar gücünü çektirmez. Tork sınırına henüz ulaşılmadığında pompa, başka bir kontrol kısıtlamıyorsa, maksimum deplasmanda çalışabilir. “Sabit güç” ifadesi bütün çalışma alanına değil, uygun koşullardaki LA kontrol bölgesine aittir."
      ], refs: [9, 13] },
      { id: "swashplate", title: "2. Eğik plaka, piston stroku ve servo piston", paragraphs: [
        "A10VO Series 32, açık devre için eğik plakalı eksenel pistonlu değişken deplasmanlı bir pompadır. Tahrik motoru mili ve dönen grubu çevirir. Eğik plaka açısı pistonların bir turdaki ileri–geri strokunu, strok ise bir devirde taşınan geometrik hacmi, yani Vg’yi belirler.",
        "Açı büyüdükçe piston stroku ve Vg artar; aynı devirde debi büyür. Açı küçüldükçe strok, Vg ve debi azalır. Minimum stroka yaklaşırken mil hâlâ dönüyor olabilir. Gerçek pompa bu durumda bile kaçak, pilot tüketimi ve mekanik kayıplar nedeniyle tamamen kayıpsız değildir.",
        "Regülatör, servo düzenindeki hidrolik kuvvet dengesini değiştirerek eğik plakayı daha küçük veya daha büyük deplasmana taşır. Bu, işlevsel bir açıklamadır: kaynak veri sayfası iç valf makarası, yay ve servo geometrisinin bütün ölçülerini vermez. Şemadan açıklanmayan bir iç parça hareketi veya kesin zaman sabiti çıkarılmamalıdır."
      ], refs: [1, 7, 13] },
      { id: "feedback", title: "3. Yük arttığında LA döngüsü nasıl ilerler?", ordered: true, items: [
        "Silindir daha ağır bir yüke veya hidrolik motor daha yüksek karşı torka karşı çalışır; gerekli çalışma basıncı artar.",
        "Pompa çıkışı B’deki basınç kontrol düzenine hidrolik olarak geri beslenir.",
        "Vg aynı kalsaydı M = Vg × Δp / (20π × ηhm) gereği mil torku artacaktı.",
        "Basınç etkisi seçilen LA karakteristiğinin sınırına ulaşınca regülatör servo düzenini daha küçük deplasmana yöneltir.",
        "Eğik plaka açısı küçülür, piston stroku kısalır ve bir devirde taşınan hacim azalır.",
        "Devir sabitse Vg’deki azalma çıkış debisini de düşürür.",
        "Daha yüksek basınç ile daha küçük Vg yeni bir denge kurar; pompa torku yaklaşık LA ayarı civarında kalır.",
        "Yük basıncı tekrar düşerse daha büyük deplasmana izin verilir. Ancak DR veya S kontrolü daha küçük Vg istiyorsa o sınır geçerli kalır."
      ], paragraphs: ["Bu sıralama kılavuzdaki işlevsel kontrol açıklamasıdır; bir elektronik tork sensörü veya yazılım döngüsü bulunduğu anlamına gelmez. Hidromekanik düzenin sonucunu takip etmek için kullanılır."], refs: [11, 13] },
      { id: "equations", title: "4. Debi, tork ve güç denklemleri", formulas: [
        "q = Vg × n × ηv / 1000", "M = Vg × Δp / (20π × ηhm)", "Pmil = 2π × M × n / 60000", "Phid = q × Δp / 600", "ηtoplam = ηv × ηhm"
      ], paragraphs: [
        "Birimler: Vg cm³/dev, n d/dak, Δp bar, q L/dak, M Nm ve güç kW. ηv volumetrik, ηhm hidromekanik verimdir. Δp pompanın basınç farkıdır; aşağıdaki örneklerde emiş tarafı farkı ihmal edilerek pB ile yaklaşık eşit kabul edilmiştir.",
        "Tork bağıntısı M ∝ Vg × Δp der. Yaklaşık sabit tork için basınç iki katına çıktığında Vg yaklaşık yarıya inmelidir. Devir sabitse q da Vg ile orantılıdır; bu nedenle LA bölgesinde q × Δp yaklaşık sabit görünür.",
        "Mil gücü ile hidrolik çıkış gücünü karıştırmayın. Kullanılan verim varsayımlarında 20 kW mil gücü yaklaşık 17,48 kW hidrolik güce karşılık gelir: 20 × 0,95 × 0,92. Bu bir ölçüm değil, belirtilen varsayımların hesap sonucudur."
      ], refs: [7, 13] },
      { id: "reference-speed", title: "5. 20 kW @ 1500 d/dak nasıl okunur?", paragraphs: [
        "Veri sayfası siparişte fabrikada ayarlanacak güç karakteristiğinin referans devirle birlikte belirtilmesini ister; örneği 20 kW, 1500 d/dak’tır. Bu ifade yaklaşık 127,3 Nm tork karakteristiğine karşılık gelir.",
        "Aynı tork ayarı 1000 d/dak’ta yaklaşık 13,3 kW, 1500 d/dak’ta 20,0 kW ve 2000 d/dak’ta 26,7 kW eder. Pompa devri değişince güç de değişir; kontrolün her devirde 20 kW’a ayarlandığını varsaymayın. Bu değerler LA tork sınırına ulaşılmış çalışma için geçerlidir, düşük yükteki her çalışma noktası için değil."
      ], formulas: ["Mset = 20 × 60000 / (2π × 1500) = 127,3 Nm"], refs: [7, 13] },
      { id: "regions", title: "6. Üç çalışma bölgesi ve p–Q haritası", paragraphs: [
        "Birinci bölge tam deplasmandır: yük basıncı LA kontrol başlangıcının altındadır ve başka bir sınırlayıcı yoksa Vg yaklaşık Vgmax’tır. İkinci bölge LA tork/güç sınırıdır: basınç yükselirken Vg ve q azalır. Üçüncü bölge D/DG basınç kontrolüdür: basınç ayarı sınırlayıcı olur ve pompa daha küçük stroka gider.",
        "Üretici grafiğinde yatay eksen qV yüzdesi, dikey eksen çalışma basıncıdır. Tam debi tarafındaki çizgi, kontrol başlangıcından sonra sola döner: daha yüksek basınçta daha az debiye izin vardır. Alt tork grafiği ve ΔqV işaretleri gerçek kontrolün ideal matematiksel çizgiden sapabileceğini hatırlatır.",
        "280 bar bütün LA pompalar için değişmez bir fizik yasası değildir; incelenen sürümde DR’nin standart ayarıdır. Bu grafik öğrenme içindir. Kullanıcının valfi kapatması veya talebin azalması gibi durumlarda çalışma noktası LA sınır eğrisinin altında da olabilir."
      ], refs: [9, 13] },
      { id: "example", title: "7. NG71 sayısal örneği: 80–250 bar", paragraphs: [
        "Vgmax = 71,1 cm³/dev, n = 1500 d/dak, ηv = 0,95, ηhm = 0,92 ve LA ayarı 20 kW @ 1500 d/dak alınmıştır. Bu verimler öğretici varsayımlardır; üretici verim haritası değildir. Kontrol başlangıcı yaklaşık 103,5 bar çıkar.",
        "Tablodaki değerler aynı denklemlerle yeniden hesaplanıp tek ondalığa yuvarlanmıştır. DR geçiş bandı ve gerçek kaçaklar bu örnek tablosunda modellenmez. 250 bar’da LA olmasaydı, tam deplasmandaki pompa yaklaşık 307,5 Nm ve 48,3 kW isterdi; LA ile Vg yaklaşık 29,4 cm³/dev’e inerek tork yaklaşık 127,3 Nm’de kalır."
      ], formulas: ["pbaşlangıç ≈ Mset × 20π × ηhm / Vgmax ≈ 103,5 bar"], table: { columns: ["Δp [bar]", "Vg [cm³/dev]", "q [L/dak]", "M [Nm]", "Pmil [kW]"], rows: laExampleRows("tr") }, refs: [7, 13] },
      { id: "codes", title: "8. LA5–LA9 kodları basınç kesme ayarı değildir", paragraphs: [
        "Tablo, kontrol başlangıç basıncı bandını ve her pompa boyutuna karşılık gelen tork aralığını birlikte verir. LA5’ten LA9’a geçiş daha yüksek kontrol başlangıcı/tork karakteristiği demektir; DR maksimum basınç ayarının değişmesi demek değildir.",
        "NG71 örneğindeki 127,3 Nm, 121,1–213,0 Nm aralığında olduğundan LA7 ile uyumludur. Aynı kW ve devir başka pompa boyutunda farklı kontrol başlangıcı verir. Bu nedenle kod yalnız güç sayısına bakılarak seçilmez; pompa boyutu ve referans devir de gerekir. Aşağıdaki sınırlar kaynaktaki gösterimi korur."
      ], table: { columns: ["Kod", "Başlangıç [bar]", "NG45 [Nm]", "NG71 [Nm]", "NG100 [Nm]", "NG140 [Nm]", "NG180 [Nm]"], rows: codeRows }, refs: [13] },
      { id: "circuit", title: "9. LA.D şemasını portlardan okuyun", figures: [{ src: "/assets/la/lad.svg", alt: "A10VO LA.D üretici şeması: pompa, basınç regülatörü, güç kontrolü ve servo bağlantıları", caption: "Bosch Rexroth RE 92705, s.13 — üretici şemasından alınan vektör görsel. İç parçaların kesit resmi değildir." }], items: [
        "B: ana yüksek basınç çıkışı; çalışma basıncı pB burada oluşur.", "S: pompa emişi.", "L / L1: gövde drenajı/tank bağlantıları; montaj kuralları ayrıca uygulanır.", "MB: yüksek basınç ölçüm bağlantısı; kaynakta port plakaları 22 ve 32 için belirtilmiştir.", "Servo düzeni: regülatör etkisini deplasman değişimine dönüştüren ayar mekanizması.", "LA elemanı: seçilen güç/tork karakteristiğine göre daha küçük Vg yönünde müdahale eder.", "DR elemanı: ayar basıncı aşıldığında daha küçük Vg isteyerek çıkış basıncını sınırlar."
      ], paragraphs: ["Pilot hatlarını ana debi hattıyla karıştırmayın. Kontrol düzeninin görevi servo kuvvet dengesini değiştirmektir. Şemadan bir valfin içindeki makara ölçüleri, yay katsayıları veya kesin hareket süreleri okunamaz."], refs: [9, 13] },
      { id: "variants", title: "10. LA.D, LA.DG, LA.S ve LA.DS", table: { columns: ["Varyant", "Güç/tork", "Basınç", "Debi"], rows: [["LA.D", "LA", "Yerel DR", "—"], ["LA.DG", "LA", "Uzaktan DRG / X", "—"], ["LA.S", "LA", "D fonksiyonu yok", "Ayrı orifisle S"], ["LA.DS", "LA", "DR", "Ayrı orifisle S"]] }, figures: [
        { src: "/assets/la/ladg.svg", alt: "LA.DG uzaktan basınç kesmeli hidrolik devre", caption: "LA.DG — X hattı üzerinden uzaktan basınç kontrolü." },
        { src: "/assets/la/las.svg", alt: "LA.S ayrı debi kontrollü hidrolik devre", caption: "LA.S — güç kontrolü ve ayrı debi kontrolü." },
        { src: "/assets/la/lads.svg", alt: "LA.DS basınç, debi ve güç kontrollü hidrolik devre", caption: "LA.DS — basınç, debi ve güç kontrolü birlikte." }
      ], paragraphs: ["Şemalar RE 92705 s.14’ten alınmıştır. Harici ölçüm orifisi, ilgili hat ve uzak basınç valfi pompa teslimatına otomatik olarak dahil değildir; kaynaktaki sınır ve notlar önemlidir."], refs: [13, 14] },
      { id: "remote", title: "11. LA.DG: X hattı neyi değiştirir?", paragraphs: [
        "LA açıklaması basınç kısmı için DR(G) bölümüne yönlendirir. DRG’de X portuna harici bir basınç tahliye valfi bağlanarak basınç referansı uzaktan belirlenir. Bu valf pompanın ana debisini boşaltan bir ana emniyet valfi gibi okunmamalıdır; kontrol bağlantısının parçasıdır.",
        "İncelenen sürümde standart DRG diferansiyeli 20 bar, ayar aralığı 10–22 bar; X pilot akışı yaklaşık 1,5 L/dak ve önerilen maksimum hat uzunluğu 2 m olarak verilir. X tanka boşaltıldığında standby basıncı, sistem etkileri hariç, ayarlanan diferansiyelden yaklaşık 1–2 bar daha yüksek olabilir.",
        "Bu ayrıntı nedeniyle uzak valf ayarı ile pompanın B basıncını birebir aynı sayı kabul etmeyin. Uzak ayar, kontrol farkı ve hat etkileri birlikte değerlendirilir. Bu sayılar kullanılan 2019 sürümünün verileridir; gerçek sipariş kodu için doğrulanmalıdır."
      ], refs: [10, 13] },
      { id: "flow", title: "12. LA.S / LA.DS: orifis ve fark basıncı", paragraphs: [
        "Debi kontrolü, ayarlanabilir ölçüm orifisinin öncesi ve sonrası arasındaki fark basıncı kullanır. Pompa, bu farkı ayar civarında tutacak deplasmana yönelir; böylece orifis açıklığı tüketicinin debi isteğini temsil eder. LA bölümünün işaret ettiği DRS yapısında standart fark 14 bar, ayar aralığı 14–22 bar’dır.",
        "Debi kontrolü LA güç eğrisinin altında mümkündür. Örneğin orifis yüksek debi istese de mevcut basınçta LA sınırı daha az debiye izin veriyorsa pompa isteği tam karşılayamaz. Laboratuvarın kararlı durum modelinde bu durum gerçekleşen LS marjının azalmasıyla gösterilir; bu son gösterim model yorumudur, üretici geçici rejim testi değildir."
      ], refs: [11, 12, 13] },
      { id: "priority", title: "13. Hangi regülatör önceliklidir?", paragraphs: [
        "Üretici kontrol kombinasyonlarında Vg azaltma yönünün öncelikli olduğunu belirtir. Bunu aşağıdaki min ilişkisiyle düşünmek faydalıdır; hidrolik valflerin yazılımda min() çalıştırdığı anlamına gelmez. Her fonksiyonun izin verdiği deplasmanın en küçüğü çalışma noktasını sınırlar.",
        "Düşük yük ve düşük debi isteğinde S kontrolü belirleyici olabilir. Yük yükselip tork sınırına gelindiğinde LA baskın olur. Basınç DR/DRG sınırına ulaştığında basınç kontrolü daha küçük Vg isteyebilir. Bu yüzden joystick tam açıkken düşük debi görülmesi tek başına pompa arızası kanıtı değildir."
      ], formulas: ["Vg,son ≈ min(Vg,LA; Vg,debi; Vg,basınç)"], refs: [11, 13] },
      { id: "diagnosis", title: "14. Sahadaki davranışı nasıl yorumlarız?", items: [
        "Boşta hızlı hareket, yük altında yavaşlama: LA bölgesine giriş olabilir; basınç ve debiyi birlikte inceleyin.", "Basınç üst ayarda, hareket çok yavaş veya durmuş: DR/DRG basınç sınırlama olasılığını kontrol edin.", "Düşük basınçta düşük debi: S talebi/orifis koşulları veya başka sınırlama olabilir; yalnız LA’ya bağlamayın.", "Devir değişince görünen güç değişiyor: aynı tork karakteristiğinde P = Mω gereği beklenebilir.", "Ölçüm seti: gerçek pompa devri, pB, debi, LA fabrika ayarı, DR/DRG ayarı, talep debisi ve varsa Vg/açı bilgisi."
      ], paragraphs: ["Bunlar kılavuzdaki davranış yorumlarıdır, kesin arıza teşhisi değildir. Servo/pilot koşulları ve gerçek makine ölçümleri değerlendirilmeden ayar değiştirilmemelidir."], refs: [9, 10, 13] },
      { id: "experiments", title: "15. Laboratuvarda altı kısa deney", ordered: true, items: [
        "NG71, 1500 d/dak, 20 kW referans ve 80 bar ile başlayın: tam deplasman, yaklaşık 101,3 L/dak beklenir.", "Basıncı 150, 200 ve 250 bar yapın: Vg/debi azalırken tork yaklaşık 127,3 Nm civarında kalmalıdır.", "LA bölgesinde devri 1000 ve 2000 d/dak yapın: aynı tork ayarında güç ve debinin değişimini izleyin.", "D modunda DR sınırını 280’den 220 bar’a indirin: test yükü sınıra ulaştığında kullanılabilir debinin azalmasını inceleyin.", "S/DS seçip istenen debiyi azaltın: çalışma noktasının LA zarfının altına geçtiğini izleyin. Bu modlarda yük basıncı ile pompa basıncı aynı girdi değildir.", "Aynı basınçta referans güç ayarını 20’den 30 kW’a çıkarın: izin verilen tork ve deplasman büyür; yeni kontrol başlangıcını karşılaştırın."
      ], paragraphs: ["Çalıştır zaman kaydını başlatır; hesaplar önizlemede de okunabilir. Otomatik dene basıncı değiştirir. CSV ile kaydı dışa aktarabilirsiniz. Bu deneyler fiziksel makineye komut göndermez."], refs: [7, 13] },
      { id: "limits", title: "16. Model ve uygulama sınırları", paragraphs: [
        "Laboratuvar, kararlı durum pompa/orifis denklemleriyle çalışır. Gerçek makara-servo geçişleri, histerezis, yay toleransları, yağ sıkışabilirliği, sıcaklık/viskozite etkileri ve ayrıntılı kaçak haritaları çözülmez. Sıfır strokta ekranda sıfır güç görülmesi gerçek pompanın kayıpsız olduğu anlamına gelmez.",
        "Veri sayfası LA pilot tüketimini maksimum yaklaşık 5,5 L/dak olarak verir. DR’nin 20–280 bar ayar aralığı ve standart 280 bar bilgisi de yalnız kaynak sürümünün kontrol verisidir. Bunlar varsayımlı tabloların yerine üretici doğrulamasını koymayı gerektiren ayrıntılardır.",
        "Bu rehber öğrenme ve ön değerlendirme içindir. Nihai pompa seçimi, saha ayarı ve emniyet için uygun sipariş kodunun güncel üretici dokümanı ve uygulamaya özel onay esas alınmalıdır. LA.S’de D fonksiyonunun olmaması gerçek devrenin basınç korumasız bırakılabileceği anlamına gelmez."
      ], refs: [9, 13, 67, 68] }
    ] satisfies LaGuideSection[],
  },
  en: {
    title: "How does Bosch Rexroth A10VO LA power control work?",
    description: "Understand A10VO LA pump operation: swashplate, servo piston, constant torque, p–Q curve, LA.D / DG / S / DS variants and an NG71 worked example. Try the simulator.",
    intro: "Why does the pump deliver less oil as pressure rises? Why does 20 kW at 1500 rpm not mean 20 kW at every speed? Follow the detailed Rev B guide through the operating principle, manufacturer schematics and worked calculations.",
    eyebrow: "ALGO TEAM / HYDRAULICS GUIDE",
    home: "Home", lab: "Try the laboratory", simulator: "Hydraulic circuit simulator", download: "Download detailed guide", pdfLabel: "Rev B · 15 pages · PDF", toc: "In this guide", updated: "12 September 2026 · About 18 minutes",
    reference: "Manufacturer reference", page: "p.", sourceTitle: "Sources, revision and scope", curveTitle: "Ideal operating envelope — not a manufacturer test curve", curveCaption: "NG71 · 1500 rpm · 20 kW reference setting · ηv=0.95 · ηhm=0.92. Flow is horizontal and pressure vertical. The DR transition is idealized; actual control tolerances are not plotted.",
    sourceText: "Basis: ALGO TEAM A10VO LA Detailed Guide, Rev B. Manufacturer reference: Bosch Rexroth RE 92705/2019-03-25, particularly p. 7 and pp. 9–14. The link leads to a copy of the manufacturer's document hosted by Hydropart. The date identifies the source revision, not a claim that it is the current catalogue or that a product is currently available.",
    sourceNote: "Manufacturer information, assumed calculations and functional interpretations are distinguished. Schematics are copyright Bosch Rexroth AG. ALGO TEAM is an independent educational tool, not an official manufacturer training or selection application. This web publication does not modify the existing PDF guides.",
    nextTitle: "Observe the same behaviour live", nextText: "Change pressure and speed in the laboratory and compare displacement, flow, torque and power. Start records samples; Run experiment changes pressure. One download button provides the guide in the language you are reading.",
    sections: [
      { id: "principle", title: "1. What does LA control?", paragraphs: [
        "LA control changes the pump's swashplate angle and output flow to obtain approximately constant drive torque at varying working pressures. Within the control region, displacement and flow decrease as pressure rises. At fixed speed and approximately constant efficiencies, pressure multiplied by flow remains approximately constant.",
        "LA is not a pressure-reducing valve or a relief valve continuously dumping the main flow. Instead of discharging excess oil to tank under a heavier load, it makes the pump produce less oil. DR pressure control serves a different purpose: it reduces displacement when the specified maximum pressure is reached. LA.D combines these two functions.",
        "At low pressure, LA does not force the pump to consume its full rated setting. Before the torque limit is reached, the pump can operate at maximum displacement if another controller does not restrict it. Constant power describes the LA-controlled region under suitable conditions, not the entire operating range."
      ], refs: [9, 13] },
      { id: "swashplate", title: "2. Swashplate, piston stroke and servo piston", paragraphs: [
        "A10VO Series 32 is an axial piston variable-displacement pump of swashplate design for open circuits. The prime mover rotates the shaft and rotary group. Swashplate angle determines the pistons' reciprocating stroke during a revolution; stroke determines the geometric volume displaced per revolution, Vg.",
        "A larger angle increases piston stroke and Vg, producing more flow at the same speed. A smaller angle reduces stroke, displacement and flow. The shaft may still be turning near minimum stroke. Even then a real pump is not lossless: leakage, pilot consumption and mechanical losses remain.",
        "The regulator changes the hydraulic force balance in the servo arrangement, moving the swashplate toward a smaller or larger displacement. This is a functional explanation. The source data sheet does not provide all internal spool, spring and servo dimensions. It cannot establish an undocumented internal part movement or an exact response time."
      ], refs: [1, 7, 13] },
      { id: "feedback", title: "3. How does the LA loop respond to increasing load?", ordered: true, items: [
        "A cylinder works against a heavier load, or a hydraulic motor sees greater resisting torque; the required working pressure rises.",
        "Pressure at pump outlet B is fed hydraulically back to the control arrangement.",
        "If Vg stayed unchanged, shaft torque would rise according to M = Vg × Δp / (20π × ηhm).",
        "When the pressure effect reaches the selected LA characteristic, the regulator directs the servo arrangement toward a smaller displacement.",
        "Swashplate angle decreases, piston stroke shortens and less volume is moved per revolution.",
        "At fixed speed, the decrease in Vg also reduces outlet flow.",
        "Higher pressure and smaller displacement establish a new balance; pump torque remains approximately at the LA setting.",
        "If load pressure falls again, greater displacement is permitted. A smaller displacement requested by DR or S control still takes precedence."
      ], paragraphs: ["This sequence follows the guide's functional control explanation. It does not imply the presence of an electronic torque sensor or a software loop; it is a way to follow the result of the hydromechanical arrangement."], refs: [11, 13] },
      { id: "equations", title: "4. Flow, torque and power equations", formulas: [
        "q = Vg × n × ηv / 1000", "M = Vg × Δp / (20π × ηhm)", "Pshaft = 2π × M × n / 60000", "Phyd = q × Δp / 600", "ηtotal = ηv × ηhm"
      ], paragraphs: [
        "Units are Vg in cm³/rev, n in rpm, Δp in bar, q in L/min, M in Nm and power in kW. ηv is volumetric efficiency and ηhm is hydromechanical efficiency. Δp is the pressure difference across the pump. The examples below neglect the inlet-side difference and treat it as approximately equal to pB.",
        "The torque relation states M ∝ Vg × Δp. For approximately constant torque, doubling pressure requires roughly halving Vg. At fixed speed, flow is proportional to Vg too; therefore q × Δp appears approximately constant within the LA region.",
        "Do not confuse shaft power with hydraulic output power. With the assumed efficiencies, 20 kW shaft power corresponds to approximately 17.48 kW hydraulic power: 20 × 0.95 × 0.92. This is a calculated result of the stated assumptions, not a measured performance value."
      ], refs: [7, 13] },
      { id: "reference-speed", title: "5. What does 20 kW at 1500 rpm mean?", paragraphs: [
        "The data sheet asks customers to state the factory power characteristic together with its reference speed, using 20 kW at 1500 rpm as an example. This represents a torque characteristic of approximately 127.3 Nm.",
        "The same torque setting gives approximately 13.3 kW at 1000 rpm, 20.0 kW at 1500 rpm and 26.7 kW at 2000 rpm. Power changes with pump speed; do not assume the controller maintains a 20 kW limit at all speeds. These values apply when the LA torque limit is reached, not to every lightly loaded operating point."
      ], formulas: ["Mset = 20 × 60000 / (2π × 1500) = 127.3 Nm"], refs: [7, 13] },
      { id: "regions", title: "6. Three operating regions and the p–Q map", paragraphs: [
        "The first region is maximum displacement: pressure is below LA control onset and Vg is approximately Vgmax unless another function limits it. The second is the LA torque/power limit, where Vg and q decrease as pressure rises. The third is D/DG pressure control: the pressure setting becomes limiting and the pump moves toward a smaller stroke.",
        "On the manufacturer chart, the horizontal axis is qV as a percentage and the vertical axis is working pressure. The line at the full-flow side turns left after control onset: less flow is allowed at higher pressure. The lower torque chart and the ΔqV markings are reminders that real control can depart from an ideal mathematical curve.",
        "280 bar is not an immutable physical limit for every LA pump. It is the standard DR setting in the referenced revision. This plot is educational. A valve closing or a lower flow request may place the operating point below the LA envelope."
      ], refs: [9, 13] },
      { id: "example", title: "7. NG71 worked example: 80–250 bar", paragraphs: [
        "Assume Vgmax = 71.1 cm³/rev, n = 1500 rpm, ηv = 0.95, ηhm = 0.92 and an LA setting of 20 kW at 1500 rpm. These efficiencies are teaching assumptions, not manufacturer efficiency maps. Calculated control onset is approximately 103.5 bar.",
        "Values in the table are recalculated from the same equations and rounded to one decimal place. The DR transition band and actual leakage are not modelled in this example table. Without LA, a full-displacement pump at 250 bar would require approximately 307.5 Nm and 48.3 kW. LA reduces Vg to approximately 29.4 cm³/rev, keeping torque near 127.3 Nm."
      ], formulas: ["ponset ≈ Mset × 20π × ηhm / Vgmax ≈ 103.5 bar"], table: { columns: ["Δp [bar]", "Vg [cm³/rev]", "q [L/min]", "M [Nm]", "Pshaft [kW]"], rows: laExampleRows("en") }, refs: [7, 13] },
      { id: "codes", title: "8. LA5–LA9 are not pressure cut-off settings", paragraphs: [
        "The table combines the control-onset pressure band with the torque range for each pump size. Moving from LA5 to LA9 means a higher onset/torque characteristic, not a change to the maximum DR pressure setting.",
        "The NG71 example's 127.3 Nm lies in the 121.1–213.0 Nm range and is therefore consistent with LA7. The same kW and speed on a different pump size give a different control onset. Power alone is not enough to choose the code; pump size and reference speed also matter. The limits below preserve the source's notation."
      ], table: { columns: ["Code", "Onset [bar]", "NG45 [Nm]", "NG71 [Nm]", "NG100 [Nm]", "NG140 [Nm]", "NG180 [Nm]"], rows: codeRows }, refs: [13] },
      { id: "circuit", title: "9. Read the LA.D schematic from its ports", figures: [{ src: "/assets/la/lad.svg", alt: "Manufacturer A10VO LA.D circuit showing the pump, pressure regulator, power control and servo connections", caption: "Bosch Rexroth RE 92705, p.13 — vector image taken from the manufacturer schematic, not a cross-section of its internal components." }], items: [
        "B: main high-pressure outlet, where working pressure pB develops.", "S: pump inlet.", "L / L1: case-drain/tank connections; installation requirements must also be followed.", "MB: high-pressure measuring connection; the source specifies it for port plates 22 and 32.", "Servo arrangement: the adjustment mechanism that converts regulator action into displacement change.", "LA element: acts toward a smaller Vg according to the selected power/torque characteristic.", "DR element: requests a smaller Vg when the pressure setting is exceeded, limiting outlet pressure."
      ], paragraphs: ["Do not confuse pilot lines with the main-flow line. The control arrangement changes the servo force balance. The diagram does not reveal spool dimensions, spring rates or exact movement times."], refs: [9, 13] },
      { id: "variants", title: "10. LA.D, LA.DG, LA.S and LA.DS", table: { columns: ["Variant", "Power/torque", "Pressure", "Flow"], rows: [["LA.D", "LA", "Local DR", "—"], ["LA.DG", "LA", "Remote DRG / X", "—"], ["LA.S", "LA", "No D function", "S with separate orifice"], ["LA.DS", "LA", "DR", "S with separate orifice"]] }, figures: [
        { src: "/assets/la/ladg.svg", alt: "LA.DG hydraulic circuit with remote pressure cut-off", caption: "LA.DG — remote pressure control via the X line." },
        { src: "/assets/la/las.svg", alt: "LA.S hydraulic circuit with separate flow control", caption: "LA.S — power control and separate flow control." },
        { src: "/assets/la/lads.svg", alt: "LA.DS hydraulic circuit with pressure, flow and power control", caption: "LA.DS — combined pressure, flow and power control." }
      ], paragraphs: ["These schematics come from RE 92705 p.14. The external metering orifice, associated line and remote pressure valve are not automatically included in the pump delivery; the source's boundaries and notes matter."], refs: [13, 14] },
      { id: "remote", title: "11. LA.DG: what does the X line change?", paragraphs: [
        "The LA description refers to DR(G) for the pressure-control section. In DRG, an external pressure relief valve is connected to port X to establish the pressure reference remotely. Do not read this as a main relief valve dumping the pump's full delivery; it is part of the control connection.",
        "The referenced revision specifies a standard DRG differential of 20 bar, an adjustment range of 10–22 bar, approximately 1.5 L/min pilot flow at X and a recommended maximum line length of 2 m. With X unloaded to tank, standby pressure can be approximately 1–2 bar above the adjusted differential, excluding system effects.",
        "Consequently, do not assume that the remote valve setting and pressure at pump port B are identical numbers. The remote setting, control differential and line effects need to be considered together. These figures belong to the 2019 source revision and must be checked against the actual order code."
      ], refs: [10, 13] },
      { id: "flow", title: "12. LA.S / LA.DS: orifice and pressure differential", paragraphs: [
        "Flow control uses the pressure difference before and after an adjustable metering orifice. The pump moves toward the displacement that maintains this differential near its setting, making orifice opening represent the consumer's flow request. The DRS arrangement referenced by the LA section specifies a standard differential of 14 bar and an adjustment range of 14–22 bar.",
        "Flow control is possible below the LA power curve. If the orifice requests high flow but the LA limit allows less at the current pressure, the request cannot be fully met. In the laboratory's steady-state model, the actual LS margin can then decrease. That visualization is a model interpretation, not a manufacturer transient test."
      ], refs: [11, 12, 13] },
      { id: "priority", title: "13. Which regulator takes priority?", paragraphs: [
        "The manufacturer states that displacement reduction takes priority in controller combinations. The minimum relation below is a useful engineering interpretation, not a suggestion that hydraulic valves run a software min() function. The smallest permitted displacement limits the operating point.",
        "S control may govern under a low load and low flow request. LA becomes limiting when load rises to the torque envelope. At the DR/DRG pressure limit, pressure control can request an even smaller Vg. A fully commanded joystick with low delivered flow is therefore not sufficient evidence of pump failure."
      ], formulas: ["Vg,final ≈ min(Vg,LA; Vg,flow; Vg,pressure)"], refs: [11, 13] },
      { id: "diagnosis", title: "14. Interpreting behaviour in the field", items: [
        "Fast unloaded movement and slower loaded movement: the pump may have entered the LA region; compare pressure and flow.", "Pressure at the upper setting with very slow or stopped movement: check whether DR/DRG pressure limiting is active.", "Low pressure and low flow: S demand/orifice conditions or another restriction may be involved; do not attribute it to LA alone.", "Apparent power changes with speed: this can be expected from P = Mω with the same torque characteristic.", "Measurement set: actual pump speed, pB, flow, factory LA setting, DR/DRG setting, flow request and Vg/angle information when available."
      ], paragraphs: ["These are behavioural interpretations from the guide, not definitive fault diagnoses. Do not change settings without evaluating the servo/pilot conditions and real machine measurements."], refs: [9, 10, 13] },
      { id: "experiments", title: "15. Six short laboratory experiments", ordered: true, items: [
        "Start with NG71, 1500 rpm, a 20 kW reference setting and 80 bar: expect full displacement and approximately 101.3 L/min.", "Set pressure to 150, 200 and 250 bar: displacement/flow should decrease while torque stays near 127.3 Nm.", "In the LA region, change speed to 1000 and 2000 rpm: observe power and flow changing with the same torque setting.", "In D mode, reduce the DR limit from 280 to 220 bar: examine available flow as test load reaches the setting.", "Select S/DS and lower requested flow: observe the point moving below the LA envelope. In these modes load pressure and pump pressure are not the same input.", "At the same pressure, increase the reference power setting from 20 to 30 kW: permitted torque and displacement rise; compare the new control onset."
      ], paragraphs: ["Start begins time recording; calculations remain visible in preview. Run experiment changes pressure. CSV export saves the recording. These experiments do not send commands to a physical machine."], refs: [7, 13] },
      { id: "limits", title: "16. Model and application limits", paragraphs: [
        "The laboratory uses steady-state pump/orifice equations. Actual spool/servo transients, hysteresis, spring tolerances, oil compressibility, temperature/viscosity effects and detailed leakage maps are not solved. Zero indicated power at zero stroke does not mean that a real pump is lossless.",
        "The data sheet gives a maximum LA pilot consumption of approximately 5.5 L/min. The DR setting range of 20–280 bar and standard setting of 280 bar are also controller data from the source revision. These details are reasons to use manufacturer verification rather than treating the assumed calculations as a complete pump specification.",
        "This guide is for learning and preliminary assessment. Final pump selection, field adjustment and safety require the current manufacturer documentation for the appropriate order code and application-specific approval. The absence of D control in LA.S does not mean that a real circuit can be left without pressure protection."
      ], refs: [9, 13, 67, 68] }
    ] satisfies LaGuideSection[],
  },
} as const;
