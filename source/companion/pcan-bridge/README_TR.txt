ALGO TEAM CAN VIEWER — PCAN LOCAL BRIDGE v1.2.0
==================================================

Bu küçük köprü, algo-team.com üzerindeki CAN Viewer ile PEAK PCAN-Basic
Windows sürücüsü arasında yalnızca yerel bilgisayarınızda bağlantı kurar.

KURULUM
1. PEAK-System Windows sürücüsünü kurun:
   https://www.peak-system.com/quick/DL-Driver-E
2. PCAN-USB cihazını bilgisayara ve CAN hattına bağlayın.
3. Bu ZIP dosyasını bir klasöre tamamen çıkarın.
4. Start-PCAN-Bridge.cmd dosyasına çift tıklayın.
5. Siyah pencereyi açık bırakın.
6. Chrome veya Edge ile şu adresi açın:
   https://algo-team.com/can-viewer/
7. PCAN kanalı ve CAN bit hızını seçip “CAN hattına bağlan” düğmesine basın.
8. Güvenli izleme için “Yalnız dinle” modunu kullanın. Mesaj gönderecekseniz
   “Gönderme açık” modunu seçip ekrandaki güvenlik onayını verin.

GÜVENLİK VE GİZLİLİK
- Köprü yalnızca 127.0.0.1:8765 üzerinde, yani kendi bilgisayarınızda çalışır.
- Yalnız algo-team.com ve yerel geliştirme adreslerinden gelen tarayıcı
  isteklerini kabul eder.
- Varsayılan bağlantı listen-only modunda açılır.
- CAN mesajı gönderme yalnız kullanıcı “Gönderme açık” modunu seçip açık
  güvenlik onayı verdiğinde kullanılabilir.
- Gönderme modu bağlı makinede beklenmeyen hareket veya fonksiyon oluşturabilir.
  Doğru CAN ID, veri ve makine durumunu doğrulamadan kullanmayın.
- DBC dosyanız ve CAN veriniz herhangi bir sunucuya yüklenmez.
- CAN kaydı tarayıcınızın belleğinde tutulur ve yalnız siz TRC/CSV indirirseniz
  bilgisayarınıza kaydedilir.
- Köprüyü kapatmak için siyah pencerede Ctrl+C tuşlarına basın veya pencereyi
  kapatın.

NOTLAR
- Windows 10/11 ve 64-bit Windows PowerShell hedeflenmiştir.
- PCAN-View veya başka bir PCAN-Basic uygulaması aynı kanalı kullanıyorsa önce
  onu kapatmanız gerekebilir.
- CAN hattında doğru bit hızını ve iki uçta 120 ohm sonlandırmayı doğrulayın.
- PEAK sürücüsü ve PCANBasic.dll bu ZIP dosyasına dahil değildir.

PCAN, PEAK-System Technik GmbH şirketinin ticari markasıdır.
Bu yardımcı araç PEAK-System tarafından geliştirilmiş veya onaylanmış değildir.
