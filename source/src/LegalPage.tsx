type LegalSlug = "gizlilik-politikasi" | "cerez-politikasi" | "kvkk-aydinlatma-metni";

const CONTACT_EMAIL = "info@algo-team.com";
const UPDATED = "23 Eylül 2026";

interface Section {
  heading: string;
  /** "p": paragraphs, "list": bullet list, "table": cookie table */
  body: Array<
    | { kind: "p"; text: string }
    | { kind: "list"; items: string[] }
    | {
        kind: "table";
        head: string[];
        rows: string[][];
      }
  >;
}

const CONTENT: Record<
  LegalSlug,
  { kicker: string; title: string; intro: string; sections: Section[] }
> = {
  "gizlilik-politikasi": {
    kicker: "ALGO TEAM · GİZLİLİK",
    title: "Gizlilik Politikası",
    intro:
      "Bu politika, algo-team.com'u kullanırken hangi kişisel verileri işlediğimizi, amaçlarını ve haklarınızı özetler.",
    sections: [
      {
        heading: "1. Araç verileri cihazınızda kalır",
        body: [
          {
            kind: "p",
            text: "DBC dosyaları, CAN logları (TRC, ASC, CSV, SocketCAN) ve simülatör girdileri tarayıcınızda işlenir. Araç verileri sunucularımıza gönderilmez, saklanmaz ve üçüncü taraflarla paylaşılmaz.",
          },
        ],
      },
      {
        heading: "2. İletişim verileri",
        body: [
          {
            kind: "p",
            text: `İletişim formunu veya e-posta ile bize ulaştığınızda ilettiğiniz ad, e-posta adresi ve mesaj içeriğini yalnızca talebinize dönüş yapmak için işleriz. Bu veriler bir veritabanında tutulmaz; e-posta yazışmanız size dönüş yapılana kadar e-posta kutumuzda kalır.`,
          },
        ],
      },
      {
        heading: "3. Analitik verileri",
        body: [
          {
            kind: "p",
            text: "Site kullanımını anonim olarak ölçmek için Google Analytics 4 kullanılır. Ölçümleme, çerez politikamızda listelenen çerezler aracılığıyla yapılır; reklam kişiselleştirme sinyalleri kapalıdır.",
          },
        ],
      },
      {
        heading: "4. Saklama ve silme",
        body: [
          {
            kind: "p",
            text: "E-posta yazışmaları, konunun çözümü ve olası uyuşmazlıklarda hakkımızı koruma amacıyla makul süre boyunca saklanır. Silinmesini istediğiniz yazışmaları tek bir e-posta ile kaldırırız.",
          },
        ],
      },
      {
        heading: "5. Haklarınız",
        body: [
          {
            kind: "p",
            text: `Kişisel verilerinizle ilgili haklarınızı (erişim, düzeltme, silme, itiraz vb.) ${CONTACT_EMAIL} adresine yazarak kullanabilirsiniz. Ayrıntılar için KVKK Aydınlatma Metni sayfasına bakabilirsiniz.`,
          },
        ],
      },
      {
        heading: "Güncelleme",
        body: [
          {
            kind: "p",
            text: `Bu politika ${UPDATED} tarihinde güncellenmiştir. Önemli değişikliklerde bu sayfada duyuru yapılır.`,
          },
        ],
      },
    ],
  },

  "cerez-politikasi": {
    kicker: "ALGO TEAM · ÇEREZLER",
    title: "Çerez Politikası",
    intro:
      "Sitede hangi çerezlerin ne amaçla kullanıldığını ve bunları nasıl yönetebileceğinizi açıklarız.",
    sections: [
      {
        heading: "1. Zorunlu çerezler",
        body: [
          {
            kind: "p",
            text: "Sitede hesap sistemi bulunmadığından oturum çerezi kullanılmaz. Araçların çalışması için çerez gerekmez.",
          },
        ],
      },
      {
        heading: "2. Analitik çerezleri (Google Analytics 4)",
        body: [
          {
            kind: "p",
            text: "Hangi araçların ne kadar kullanıldığını anonim biçimde ölçmek için Google Analytics 4 kullanılır. Ölçümleme yalnızca üretim alan adında (algo-team.com) çalışır.",
          },
          {
            kind: "table",
            head: ["Çerez", "Sağlayıcı", "Süre", "Amaç"],
            rows: [
              ["_ga", "Google", "2 yıl", "Ziyaretçi sayımını ayırt etme (anonim)"],
              ["_ga_<kapsayıcı>", "Google", "2 yıl", "Oturum/etkinlik ayrımı"],
            ],
          },
          {
            kind: "p",
            text: "Çerezler SameSite=Lax ve Secure bayraklarıyla ayarlanır; reklam sinyalleri ve reklam kişiselleştirmesi kapalıdır.",
          },
        ],
      },
      {
        heading: "3. Çerezleri yönetme",
        body: [
          {
            kind: "p",
            text: "Tarayıcı ayarlarınızdan analitik çerezleri silebilir veya engelleyebilirsiniz. Çerezleri engellemek araçların çalışmasını etkilemez; yalnızca site iyileştirmesine katkımız azalır.",
          },
        ],
      },
      {
        heading: "Güncelleme",
        body: [
          {
            kind: "p",
            text: `Bu politika ${UPDATED} tarihinde güncellenmiştir. Sorularınız için: ${CONTACT_EMAIL}`,
          },
        ],
      },
    ],
  },

  "kvkk-aydinlatma-metni": {
    kicker: "ALGO TEAM · KVKK",
    title: "KVKK Aydınlatma Metni",
    intro:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") kapsamında veri sorumlusu sıfatıyla bu aydınlatma metnini sunarız.",
    sections: [
      {
        heading: "1. Veri sorumlusu",
        body: [
          {
            kind: "p",
            text: `ALGO TEAM — algo-team.com. Başvurularınız için: ${CONTACT_EMAIL}`,
          },
        ],
      },
      {
        heading: "2. İşlenen kişisel veriler ve amaçları",
        body: [
          {
            kind: "list",
            items: [
              "İletişim verileri (ad, e-posta, mesaj içeriği): talep ve şikâyetlerin yönetimi, sorularınıza dönüş yapılması.",
              "İşlem güvenliği / anonim analitik verileri (IP, cihaz ve tarayıcı bilgisi, sayfa etkileşimleri, Google Analytics 4 üzerinden): sitenin güvenliğinin sağlanması ve kullanımın iyileştirilmesi.",
            ],
          },
          {
            kind: "p",
            text: "Araçlarda işlediğiniz dosya ve CAN verileri cihazınızda kaldığı için bu veriler tarafımızca işlenmez.",
          },
        ],
      },
      {
        heading: "3. Hukuki sebepler",
        body: [
          {
            kind: "list",
            items: [
              "KVKK m.5/2-(c): iletişim talebinizin karşılıklı olarak karşılanması (meşru menfaat ve bağlantı kurulması).",
              "KVKK m.5/2-(e): hakkının tesisi, kullanılması veya korunması.",
              "KVKK m.5/2-(f): site güvenliği ve anonim kullanım ölçümü (meşru menfaat).",
            ],
          },
        ],
      },
      {
        heading: "4. Aktarım",
        body: [
          {
            kind: "p",
            text: "Anonim analitik amacıyla ölçüm verileri, Google Analytics hizmeti kapsamında Google LLC'ye (yurt dışı) aktarılabilir; aktarım KVKK m.9'daki şartlar çerçevesinde yapılır. Araç verileriniz hiçbir tarafa aktarılmaz.",
          },
        ],
      },
      {
        heading: "5. Saklama süreleri",
        body: [
          {
            kind: "p",
            text: "İletişim yazışmaları, konunun kapanmasından itibaren makul süre; analitik kayıtları Google Analytics'in varsayılan saklama süresince tutulur.",
          },
        ],
      },
      {
        heading: "6. KVKK m.11 kapsamındaki haklarınız",
        body: [
          {
            kind: "list",
            items: [
              "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
              "İşlenmişse buna ilişkin bilgi talep etme",
              "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
              "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
              "Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme",
              "Silinmesini veya yok edilmesini isteme ve üçüncü kişilere bildirilmesini talep etme",
              "Otomatik sistemlerle analiz sonucuna itiraz etme",
              "Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
            ],
          },
          {
            kind: "p",
            text: `Başvurularınızı ${CONTACT_EMAIL} adresine iletebilirsiniz; en geç 30 gün içinde yanıtlanır.`,
          },
        ],
      },
      {
        heading: "Güncelleme",
        body: [
          {
            kind: "p",
            text: `Bu metin ${UPDATED} tarihinde güncellenmiştir.`,
          },
        ],
      },
    ],
  },
};

function Body({ body }: { body: Section["body"][number] }) {
  if (body.kind === "p") return <p>{body.text}</p>;
  if (body.kind === "list")
    return (
      <ul>
        {body.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  return (
    <div className="legal-table" role="region" tabIndex={0} aria-label="Çerez tablosu">
      <table>
        <thead>
          <tr>
            {body.head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const page = CONTENT[slug];
  return (
    <main>
      <header className="legal-header">
        <a className="legal-brand" href="/">
          ALGO TEAM
        </a>
        <a className="legal-back" href="/">
          ← Ana sayfa
        </a>
      </header>
      <article className="legal-page">
        <p className="legal-kicker">{page.kicker}</p>
        <h1>{page.title}</h1>
        <p className="legal-intro">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((body, i) => (
              <Body key={i} body={body} />
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
