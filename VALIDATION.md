# Güncel yayın durumu — 4 Ekim 2026

Yayın adayı iOS 1.0.0 (6). Expo başarılı derleme ve TestFlight yüklemesi sonrası kullanıcı iPhone'da başlık, doğrudan Fotoğraflar'a kayıt, gizlilik sayfası geçişleri ve son F2 bayrak düzeltmesini doğruladı. Fiziksel iPad ve Android cihaz kontrolü ile App Store gönderimi henüz doğrulanmadı. Mağaza belgeleri son davranışlara göre güncellendi; uygulama kaynak kodu değişmedi, yeni iOS build gerekmiyor.

Aşağıdaki kayıtlar önceki aşamaların tarihçesidir. Eski “henüz yüklenmedi/test edilmedi” ifadeleri o aşamalara aittir. Güncel ayrıntılar store/release-status.json ve Tempo-Yayin-Rehberi.md içindedir.

---

## 4 Ekim 2026 — F2 kesintisiz bayrak düşüşü

Kullanıcının iPhone videosunda kırmızı bayrak düşüş sırasında yaklaşık yarım saniye görünmez oluyor, animasyon bittikten sonra tekrar görünüyordu. F2 sahnesinde kamera/bayrak 3D dönüşleri kaldırıldı; 2D dönüş ve sabit katman sırası kullanılıyor. Bayrak görseli animasyonda ve son konumda aynı Animated.View içinde kalır; finalde View türü değiştirilerek yeniden yüklenmez. Düşüş, kalıcı son konum ve Hareketi Azalt davranışı korunur. Yerel iPhone doğrulaması yeni TestFlight sürümünde bekliyor.

TypeScript, release/source ve web export kontrolleri geçti. Tarayıcıda düşüş/yerleşme boyunca 16 ekran örneğinin hepsinde kırmızı bayrak pikseli görüldü ve aynı görüntü düğümü bağlı kaldı. Kalıcı son konum, yatay/iPad düzeni, bitmiş maçı yeniden açma, yeni oyun ve Hareketi Azalt kontrolleri geçti; JS hatası yok.

## 4 Ekim 2026 — APK indirme JSON düzeltmesi

Kullanıcının EAS ekranında Android APK tamamlandı, indirme ise stdout başındaki Failed to... metnini JSON sanarak durdu. İndirme yardımcısı artık EAS başlangıç tanı çıktısından sonra gelen tam JSON dizisini okuyabilir. Eksik/yanlış biçimli yanıtları reddeder; proje/paket/profil/mesaj eşleşmesi korunur. Tempo-APK-Indirme-Duzelt.bat kayıtlı isteği değiştirmeden güncellemeyi uygular ve yalnız indirmeyi çalıştırır, yeni derleme başlatmaz.

## 4 Ekim 2026 — Android ExtraTranslation düzeltmesi

EAS Gradle lint kaydı iki hata bildirdi: NSPhotoLibraryAddUsageDescription Android values-b+en/tr dosyalarında vardı, varsayılan Android dilinde yoktu. Bu Apple izni metni artık locales JSON içindeki ios sözlüğünde bulunur. Güncelleyici önceki düz üst alanı ve varsa Android sözlüğündeki aynı alanı temizler; diğer özel çevirileri korur. Release/source kontrolleri yanlış platform alanını reddeder. Expo’nun gerçek locale çözümleyicisiyle iki regresyon testi eklendi. Android lint devre dışı bırakılmadı.

Doğrulama: 70 test, TypeScript ve release/source kontrolleri geçti. Flat/nested/inline eski çevirilerde güncelleme ve özel alan koruma kontrolleri geçti. Android prebuild sonrası üretilen üç strings.xml dosyasında Apple izin anahtarı yok. EAS Gradle/APK derlemesi kullanıcı hesabında yeniden çalıştırılacak; burada imzalı APK üretilmedi.

## 4 Ekim 2026 — Windows TypeScript kurulum düzeltmesi

Windows ekranında testler geçti, npm run check ise tsc bulunamadığı için durdu; EAS build başlamadı. Android başlatıcısı artık npm ci --include=dev --bin-links=true ile geliştirme bağımlılıklarını ve Windows komutlarını açıkça kurar. Kurulum sonrası yerel TypeScript sürümünü doğrular. A1 kaynak ve paket bütünlük özetleri yeni BAT için güncellendi. Uygulama davranışında değişiklik yok.

## 4 Ekim 2026 — A1 Android APK

- android-apk: internal dağıtım, buildType=apk, autoIncrement; EAS 24.10.0 şemasıyla doğrulandı. Mevcut iOS production profili korunur.
- Windows Android-APK-Windows.bat temiz kurulum/test/check/release kontrolü ardından EAS Android derlemesini bekler; scripts/android-apk.cjs benzersiz mesajla yalnız o çalıştırmanın doğru proje/paket/platform/profil build’ini seçip APK’yı indirir. APK root manifest/dex/ZIP yapısı kontrol edilir. SHA256/kayıt bilgisi yazılır. İndirme ayrı BAT ile yeni build oluşturmadan tekrarlanabilir.
- 68 test başarılı: 4 APK seçim/yanlış platform/AAB/yarım indirme kontrolü ve modern/eski Android izin sınırı dahil. TypeScript, EAS yapılandırma kontrolü, Android prebuild, web/Android/iOS JS export başarılı. Bunlar APK/Gradle imzalı derleme değildir.
- Android 11+ Asset.create scoped storage ile kendi PNG’sini oluşturur; eski Android yazma iznini legacy API üzerinden ister. iOS add-only akışı korunur. Mevcut resimleri okuma/konum izinleri manifest merge için bloke edilir. Android başarı/hata metinleri TR/EN olarak Galeri/Depolama adlarıyla uyarlanır.
- A1 web demosunda 14 TR/EN güvenli alan/başlık hizası kontrolü, çevrimdışı iç politika/Geri, tek düğmeyle PNG indirme ve çalışan kontrol çift dokunuşları yeniden geçti. Web platformu modern Android modülünü açılışta yüklemez; JS hatası yok.
- A1 güncelleyici fixture kontrolleri geçti: mevcut proje/owner/bundle ve özel iOS EAS profili korunur; yeniden uygulama/özel dil dosyaları çalışır; 9 hatalı payload/proje/native klasör/özel APK profili senaryosu yazmadan durur; eski kaynak EAS kapısında reddedilir.
- Bu ortamda EAS whoami Not logged in döndü; Android SDK/JDK derleme araçları yok. Burada gerçek APK/Gradle veya Google Play yüklemesi yapılmadı. Kullanıcının Windows Expo hesabında APK build’i ve fiziksel Android/iPad denemesi bekliyor.

## 4 Ekim 2026 — P1 Fotoğraflar, uygulama içi gizlilik ve kalıcı bayrak

- Kullanıcı H2 başlığını iPhone’da düzgün gördüğünü doğruladı; build numarası bu son geri bildirimde verilmedi.
- Dört kardeş tam ekran iOS modal yerine tek ScreenModal sunucusu ve içeride ayarlar/hamle defteri/destek/politika sayfaları kullanılır. Native güvenli alan sağlayıcısı pencerenin içinde kalır.
- Resim olarak aktar, ayrı önizleme veya paylaşım ekranı açmadan doğrudan Fotoğraflar’a PNG kaydeder. iOS PHAccessLevel.addOnly izni; mevcut fotoğraflar okunmaz. Expo SDK 57 için expo-media-library/legacy kullanılır. Geçici PNG ancak Photos kaydı bitince silinir. İzin reddi/kayıt hatası görünür; tekrar tıklama koruması var.
- Rapor aynı pencere içinde, opak hamle defterinin arkasında oluşturulur; native layout ve iki çizim karesi beklenip cihazın piksel ölçeğinde tam PNG yakalanır. Son 20 basma korunur. Uzun kartın gerçek iPhone/iPad’de kesilmediği kontrolü bekliyor.
- Gizlilik politikası uygulama içinde TR/EN ve çevrimdışı okunur. Geri ile destek, ardından seçili Tema’ya dönülür. Web sürümü ayrı isteğe bağlı düğmedir.
- 63 test, TypeScript/release kontrolü, web/iOS Hermes JS export başarılı. iOS prebuild Info.plist yalnız NSPhotoLibraryAddUsageDescription içerir; tr/en InfoPlist.strings üretildi. MediaLibrary gizlilik manifesti veri toplama beyan etmez.
- CDP safe-area ile 7 ekran x TR/EN 14 logo hizası kontrolü geçti. Yerel politika uçak modu emülasyonunda açıldı; Geri doğru sayfaya döndü. PNG tek düğmeyle indirilirken hamle defteri açık kaldı; ek modal yok. Önceki çift dokunuş ve açılış/yeniden açılış davranışları geçti.
- P1 sonrası temiz npm ci başarılı. Güncelleyici fixture kontrolleri: mevcut EAS/owner/bundle/özel app.json alanlarının korunması; yeniden uygulama ve platforma özel dil dosyalarının korunması; 7 hatalı payload/proje senaryosunda yazmadan durma; EAS kaynak kapısında eski kodu reddetme başarılı.
- Kullanıcı bitişte saat görselinin kaldığını, kırmızı bayrak/ibrenin düşüp kaybolduğunu bildirdi. Düşüş bittiğinde bayrak ayrı, sabit 2D native görünümde tutulur; opacity ve sonuç metni sabitlenir. Yeni oyun sahneyi kaldırır. Düşüş sonrası bekleme, ekran dönüşü/iPad boyutu, kayıtlı bitmiş oyunu yeniden açma tarayıcıda geçti. Fiziksel iOS üzerinde bayrağın kalıcılığı yeni build ile kontrol edilmeli.
- Fiziksel iOS Fotoğraflar kaydı/izin penceresi ve native sayfa geçişleri P1 TestFlight sürümüyle denenmelidir. Burada imzalı IPA veya Apple yüklemesi yapılmadı.

## 4 Ekim 2026 — build 3 kaynak teşhisi ve H2 kurtarma paketi

- Kullanıcı build 3'ü kurdu; logo eski görünüyordu. Tempo-Kontrol çıktısı App.tsx ve release kontrolünün eski, PreparationLogo.tsx'in eksik olduğunu doğruladı. Güvenli alan ve çift dokunuş dosyaları beklenen sürümle eşleşti.
- Tempo-Logo-Duzeltme-H2.zip farklı ad/klasör kullanır. Bütün payload hashleri yazmadan önce ve kopyalanan dosyalar yazmadan sonra doğrulanır; eski kaynaklar/package.json yedeklenir. app.json, EAS proje bağlantısı ve imza ayarları korunur.
- EAS pre-install/post-install hookları kaynak dosyalarının H2 hashlerini kontrol eder; yanlış/eski kaynakla derleme durur. Bağımlılıklar değişmedi.
- Yerel fixture kontrolleri: eski kaynakları güncelleme/proje koruma; eksik/değiştirilmiş payload, bağlantısız/yanlış proje, farklı giriş dosyası ve mevcut yabancı hookta yazmadan durma; EAS aşamasında eski App.tsx'i reddetme geçti.
- Her iki EAS hook'u ve release yapılandırma kontrolü çalıştırıldı. Uygulama arayüz kodu önceki 56 test ve 14 TR/EN düzen kontrolünde doğrulanan kodla aynı.
- H2 kurtarma paketinden oluşturulmuş yeni imzalı build ve cihaz kontrolü bekliyor.

## 4 Ekim 2026 — büyük logo hizalama düzeltmesi

- TestFlight 1.0.0 (2) yüklemesi ve beta Waiting for Review durumu kullanıcı ekranlarında görüldü. Son iPhone görüntüsünde güvenli alan düzeldi; küçük logo geri bildirimi bu değişikliğin nedeni.
- Logo alanı sağdaki iki sıranın yüksekliğini paylaşır. Üst kenar Kapat üstüne, alt kenar iki dil düğmesinin altına hizalanır. Metin büyümesine karşı sağ sıra/düğmeler esner.
- Orijinal tempo-logo.png değişmedi; şah ve yazı oranları korundu. Telefonda alt alta, geniş ekranda orijinal yatay logo kullanılır. Mağaza ikonu değişmedi.
- 56 test, TypeScript/release kontrolü; web/iOS JavaScript export ve TR/EN 14 ekran/safe-area düzeni. Logo/Kapat üst ve logo/dil düğmeleri alt koordinatları 1 px toleransla kontrol edildi; telefon/iPad tarayıcı önizlemeleri görsel olarak incelendi.
- Güncelleyiciye yeni logo bileşeni ve buna uyarlanan release kontrolü dahil. Mevcut EAS proje kimliği ve app.json korunur.
- Son logo düzeltmesinin imzalı build ve iPhone/iPad cihaz kontrolü bekliyor. TestFlight beta incelemesi mağaza yayın onayı değildir.

## 4 Ekim 2026 — TestFlight cihaz geri bildirimi sonrası düzeltme

- Kullanıcı App Store Connect görüntüsünde 1.0.0 (1) build'ini ve iPhone'da çalışan uygulamayı gösterdi. Ayarlar başlığı iOS durum çubuğuyla çakışıyordu.
- Dört tam ekran modal, kendi SafeAreaProvider/SafeAreaView bileşenleriyle dört kenarı korur. İlk pencere initialWindowMetrics ile başlatılır.
- Referans görseldeki gibi logo solda, başlık/Kapat sağda ve açıklama/diller alt sırada. Telefonda ölçüler küçülerek aynı sıra korunur. Uygulama her soğuk açılışta Süreler sekmesini açar; kayıt yüklenmeden saatler gösterilmez. İlk ekran animasyonsuz açılır. Süre seçimi saat ekranına geçirir; kayıtlı maç Kapat ile korunur.
- Yeni kod: TypeScript ve 56 test (5 yeni çift dokunuş davranış testi dahil) geçti; web/iOS JavaScript paketleri üretildi.
- Tarayıcıda CDP safe-area env değerleriyle 20/47/59 px üst boşluk, yatay iPhone yan boşlukları ve iPad senaryoları TR/EN toplam 14 düzen kontrolü geçti; dört modal ve kayıtlı maç sonrası yeniden açılış da kontrol edildi. Bu emülasyon native iOS cihaz testi değildir.
- Küçük Windows güncelleyicisi: mevcut app.json/EAS proje bağlantısını koruma, eski kaynak yedeği ve yanlış/bağlantısız klasörde yazmayı durdurma denemeleri geçti.
- Çalışan saatte yenile/durdur/ayarlar aynı düğmeye 600 ms içinde iki dokunuşla, boşta/duraklatılmış saatte tek dokunuşla çalışır. Farklı düğme, geciken dokunuş ve hamleyle araya girme onayı sıfırlar.
- Son tarayıcı denemesinde tek dokunuşun saati çalışır bırakması, durdur/yenile/ayarlar çift dokunuşu, boşta/duraklatılmış tek dokunuş ve farklı/geciken dokunuşların yok sayılması geçti.
- Yeni kodun TestFlight build'i ve gerçek iPhone/iPad kontrolü bekliyor. Eski sürümün yüklenmesi bu düzeltmenin cihazda doğrulandığı anlamına gelmez.

# Doğrulama · 4 Ekim 2026 · 1.0.0

## Bu teslimde yeniden doğrulananlar

- Başlık eski yatay tempo-logo.png kullanıyor; uygulama ikonu tempo-icon.png ile ayrı tutuluyor. İkon 1024×1024 opak RGB.
- Tema içindeki bitiş deneme düğmesi, önizleme penceresi ve ilgili durum kaldırıldı. Gerçek oyunun süre sonunda FlagFinale sahnesi korunuyor.
- 51 otomatik test, TypeScript kontrolü ve release yapılandırma kontrolü başarılı.
- Temiz npm ci başarılı. Eski kilit dosyasındaki bulunamayan sandbox-cli-detector 0.3.0 referansı, npm’de yayımlanmış 0.2.0 sürümüne override ile sabitlendi; lock integrity değeri doğrulandı.
- Web demo yeniden üretildi; iOS ve Android Hermes JavaScript paketleri yeniden üretildi.
- iOS prebuild yeniden üretildi. iPad dört yönü destekliyor, tam ekran zorunlu değil, mikrofon izni yok, gizlilik manifesti ve şifreleme beyanı mevcut.
- Türkçe/İngilizce, 320/375/390/430/500/680/768/834/1032/1366 genişliklerinde 20 başlık kontrolü geçti. Logo 264×88, başlık 28 px olarak sabit kaldı; dar ekranda düzen alt alta geçti. Kapat ve dil düğmeleri ekran içinde.
- Tarayıcıda Tema ekranında deneme düğmesinin kaldırılması, PDF yazdırma penceresinin açılması ve gerçek PNG indirme doğrulandı. Tarayıcı JavaScript hatası yok.
- Yeni iPhone/iPad hazırlık, tema, saat ve aktarım önizlemeleri preview klasöründe. Bunlar gerçek cihaz görüntüsü değil.
- TR/EN destek ve gizlilik sayfaları HTTP 200 ile açıldı; uygulama içi çevrimdışı gizlilik açıklaması ve mağaza notları kontrol edildi.
- Windows yayın başlatıcısı kurulumu, testleri ve TypeScript kontrolünü yükleme öncesinde çalıştırıyor. Önceki UKD sürecindeki EAS takım seçimi rehbere işlendi; uygulama için yeni bundle ID kullanılıyor.

İmzalı IPA, gerçek iPhone/iPad denemesi, TestFlight yüklemesi ve App Store inceleme gönderimi henüz yapılmadı. Buradaki iOS prebuild Xcode/CocoaPods derlemesi değildir. Native paylaşım, ses/titreşim ve güvenli alan kontrolleri TestFlight cihaz sürümünde tamamlanmalı.

## Önceki çalışmanın doğrulama kaydı

Aşağıdaki çok sayfalı PDF gibi ayrıntılı kontroller önceki çalışmadan korunmuştur.

## Geçen kontroller

- Temiz npm ci kurulumu: başarılı.
- 51 otomatik test: motor, eşik geçişleri, gecikmeler, periyotlar, geri alma, yerel kayıt, renk kontrastı, dil ve PDF/resim raporları.
- TypeScript: tsc --noEmit başarılı.
- release:check: ikon 1024×1024 opak RGB PNG, iPad/yön/Split View, PDF/PNG düğmeleri, gizlilik ve EAS üretim profili doğrulandı.
- Expo web, iOS ve Android JavaScript paketleri üretildi.
- expo prebuild --platform ios --no-install: yerel iOS kaynak projesi üretildi. Info.plist dört iPad yönünü, tam ekran zorunluluğunun kapalı olduğunu ve şifreleme muafiyetini içeriyor; mikrofon izni yok. Uygulama gizlilik manifesti oluşturuldu. Expo Updates kapalı.
- Başlık: 320/375/390/430/500/680/768/834/1032/1366 genişliklerinde Türkçe ve İngilizce toplam 20 kontrol. Logo, başlık ve Kapat aynı yatay yapı içinde; metin ve dil kutuları taşmıyor.
- Aktarma: eski CSV/JSON düğmeleri yok. 320/375/390/768 genişliklerinde PDF/PNG düğmeleri kırpılmıyor. Örnek oyundan PNG indirme ve PDF yazdırma sayfası açılması doğrulandı.
- PNG örneği: 1080 piksel genişliğinde gerçek dosya; okunabilir metin, iki oyuncu özeti ve dört basma. Web çıktısı SVG’den tarayıcı Canvas aracılığıyla PNG’ye dönüştürülür.
- PDF örneği: A4 tek sayfa oluşturuldu, pdftoppm ile render edilip görsel olarak incelendi. 120 basmalı örnek 5 sayfaya bölündü; son kayıt korunuyor ve her sayfada tablo başlığı yineleniyor. Kullanıcı girdileri HTML ve SVG’de kaçışlanır; tüm kayıtlar PDF’de tutulur, PNG son 20 basma olarak açıkça etiketlenir.
- iPad 1032×1376 portre ve 1376×1032 yatay görünümü tarayıcıda incelendi. Saatler ve kontroller ekran içinde; ayarlar ortalanmış, büyük saat rakamları kullanılıyor.
- Yeni kamuya açık TR/EN destek ve gizlilik sitesi yayınlandı; Sites erişimi public ve deployment succeeded.

## Sınırlar

İmzalı IPA, TestFlight upload, Xcode arşiv derlemesi ve App Store incelemesi yapılmadı. Bu çalışma ortamında Expo oturumu yoktur. iOS prebuild kaynak üretimi, CocoaPods veya Xcode derlemesi değildir.

Tarayıcı PNG’leri fiziksel iPhone/iPad veya iOS simülatör ekran görüntüsü değildir. Native ses/titreşim, ekran kilidi, güvenli alan, sistem PDF/PNG paylaşımı ve azaltılmış hareket davranışı gerçek cihazda store/TESTFLIGHT-KONTROL.md ile doğrulanmalıdır. Native PNG, görünümün cihaz çözünürlüğünde yakalanır; iOS’ta büyük kart için renderInContext kullanılır. App Store ekran görüntüleri imzalı sürümden alınmalıdır.

Son 2000 basma cihazda tutulur. PDF saklanan basmaların tamamını içerir; resim okunabilirlik için son 20 basmayı gösterir. Rapor taşların hareketlerini veya PGN hamlelerini içermez.
