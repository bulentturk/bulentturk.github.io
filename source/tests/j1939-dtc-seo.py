from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "dist" / "j1939-dtc-decoder" / "index.html"

EXPECTED_TITLE = "J1939 DM1 Decoder: SPN/FMI Arıza Kodu Çözücü | ALGO TEAM"
EXPECTED_DESCRIPTION = (
    "J1939 DM1 (PGN 65226) mesajını çözün: SPN, FMI, OC, lamba durumları ve "
    "BAM/TP.DT. TRC, ASC, CSV ve SocketCAN kayıtlarını tarayıcıda analiz edin."
)
EXPECTED_CANONICAL = "https://algo-team.com/j1939-dtc-decoder/"


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.og_title = ""
        self.og_description = ""
        self.twitter_title = ""
        self.twitter_description = ""

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            if values.get("name") == "description":
                self.description = values.get("content", "")
            elif values.get("property") == "og:title":
                self.og_title = values.get("content", "")
            elif values.get("property") == "og:description":
                self.og_description = values.get("content", "")
            elif values.get("name") == "twitter:title":
                self.twitter_title = values.get("content", "")
            elif values.get("name") == "twitter:description":
                self.twitter_description = values.get("content", "")
        elif tag == "link" and values.get("rel") == "canonical":
            self.canonical = values.get("href", "")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def main():
    assert PAGE.exists(), f"Missing built page: {PAGE}"
    html = PAGE.read_text(encoding="utf-8")
    head = HeadParser()
    head.feed(html)

    assert head.title == EXPECTED_TITLE
    assert head.description == EXPECTED_DESCRIPTION
    assert head.canonical == EXPECTED_CANONICAL
    assert head.og_title == "J1939 DM1 Decoder: SPN/FMI Arıza Kodu Çözücü"
    assert "DM1 (PGN 65226)" in head.og_description
    assert head.twitter_title == head.og_title
    assert head.twitter_description == head.og_description

    # Important search intent and existing tool content must be present in the prerendered HTML.
    required = [
        "J1939 SPN/FMI Arıza Kodu Çözücü",
        "DM1 mesajlarını ve SPN/FMI arıza kodlarını CAN kayıtlarından çözümleyin",
        "TRC, ASC, CSV veya SocketCAN kaydını yükleyin",
        "DM1 (PGN 65226)",
        "BAM / TP.DT",
        "SPN/FMI sonucu tek başına arızalı parçayı gösterir mi?",
        "/learn/j1939-dm1-spn-fmi-cozumleme/",
    ]
    for fragment in required:
        assert fragment in html, f"Missing prerendered fragment: {fragment}"

    print("PASS: J1939 DM1 decoder title, meta, canonical and prerendered diagnostic content.")


if __name__ == "__main__":
    main()
