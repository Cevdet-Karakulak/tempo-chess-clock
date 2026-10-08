# Tempo — App Store yayın rehberi

Güncelleme: 4 Ekim 2026. Yayın adayı: **iOS 1.0.0 (6)**. Bundle ID: **com.floppachesscorp.tempo**.

## Mevcut durum

iOS build 6 başarıyla derlendi ve kullanıcı TestFlight'ta yükleyip iPhone'da son bayrak düzeltmesini doğruladı. Başlık, doğrudan Fotoğraflar'a kayıt ve uygulama içi gizlilik geçişleri de kullanıcı tarafından doğrulandı. Kodda yayını engelleyen yeni bir sorun bildirilmedi. Bu hazırlık yalnız mağaza belgelerini günceller; yeni build gerektirmez.

iPad desteği ve dört yön yapılandırması var; tarayıcı düzenleri kontrol edildi. Fiziksel iPad testi ve mağazaya yüklenmiş gerçek iPad ekran görüntüleri henüz doğrulanmadı. App Store incelemesine gönderildiğine dair kanıt yok. App Store Connect'teki tamamlanmış alanlar bu ortamdan görülemiyor.

## App Store Connect'te sırayla

1. Apps > **Tempo** > Distribution > iOS 1.0 sayfasını aç. Mevcut uygulama kaydını ve Expo projesini kullan.
2. App Information'da Türkçe ve English yerelleştirmelerini ekle. Ad/alt başlık `MAGAZA-TR.md` ve `STORE-EN.md` içinde hazır. Ana kategori Utilities; Sports ikincil kategori önerisidir.
3. iOS sürüm sayfasında açıklama, anahtar kelimeler, destek URL ve telif hakkını doldur. Tanıtım metni isteğe bağlıdır. Hazır tek-alan TXT dosyaları yayın paketinin `tr` ve `en` klasörlerinde bulunur. İlk sürümde What's New alanı gösterilmeyebilir.
4. Build bölümünde **1.0.0 (6)** seçip Save yap. Başka build seçiliyse sürümden çıkarıp 6'yı seç. Missing Compliance çıkarsa uygulamanın mevcut şifreleme beyanına göre soruları tamamla; özel/muaf olmayan şifreleme yok. iOS ayarında usesNonExemptEncryption=false.
5. Gerçek iPhone ve iPad ekran görüntülerini ekle. Üç önerilen ekran: Süreler, çalışan saat, Hamle Defteri. Desteklenen ölçüler ve cihaz kontrolü `TESTFLIGHT-KONTROL.md` içinde. Pakette mağazaya hazır gerçek cihaz ekran görüntüsü bulunmuyor.
6. App Privacy bölümünde mevcut işleyişe göre **Data Not Collected / Veri Toplanmıyor** beyanını kaydet/yayımla. Veriler cihazda; analiz/reklam/izleme yok. İsteğe bağlı destek e-postaları yalnız destek amacıyla işlendiği sürece Apple'ın isteğe bağlı açıklama koşullarını değerlendir; başka kullanım varsa beyanı güncelle. Ayrıntılar `GIZLILIK-BEYANI.md` içinde.
7. App Information > Age Rating anketini tamamla. Bu sürümde şiddet, cinsellik, kumar, tıbbi tavsiye, sohbet ve kullanıcı içerikleri yok. Yaş sonucunu Apple hesaplar. Uygulama içi sınırsız web tarayıcısı yok; destek bağlantıları haricî tarayıcıya açılır. Erişilebilirlik etiketlerinde yalnız gerçekten cihazda doğruladığın özellikleri işaretle.
8. Pricing and Availability'de fiyatı ve yayın ülkelerini seç. Mevcut mağaza taslağımız **ücretsiz**. Hesapta sözleşme veya DSA durum alanı eksik uyarısı çıkarsa hesabına uygun bilgileri tamamla; yayın ülkelerini ve hukuki statüyü geliştirici belirler.
9. App Review Information'a gerçek iletişim adın, telefonun ve e-postanı gir. Sign-in required kapalı olmalı; giriş hesabı gerekmiyor. `REVIEW-NOTES.txt` içeriğini Notes'a yapıştır.
10. Sürüm yayın tercihini seç. Hızlı çıkış için **Automatically release this version**; onaydan sonra kendin basmak istersen manual release kullan.
11. **Add for Review** ardından taslak başvuruda **Submit for Review** seç. Yalnız Add for Review yapmak Apple'a göndermez. Gönderimden sonra sürüm durumunu kontrol et.

TestFlight'a yüklemek App Store'a yayınlamak değildir. Haricî TestFlight beta incelemesi ayrı süreçtir; mağaza gönderimi kendi sürüm ve inceleme adımlarından yapılır.

## Gizlilik ve destek bağlantıları

- Türkçe destek: https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/#support
- Türkçe gizlilik: https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/#privacy
- English support: https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/en/#support
- English privacy: https://tempo-satranc-saati-destek.efekaankarakulak.chatgpt.site/en/#privacy
- Destek e-postası: floppatechcorp@gmail.com

Politika uygulama içinde çevrimdışı okunur; mağazada ayrıca herkese açık URL gerekir. Site önceki çalışmada yayımlandı. Bu hazırlıkta web okuma aracı sayfaları açamadığı için güncel erişim doğrulanamadı; bağlantıların bozuk olduğuna dair sonuç çıkarılmadı. Göndermeden önce dört adresi oturum açmadan tarayıcıda açıp doğru dil ve içerik geldiğini kontrol et. Açılmıyorsa yayını göndermeden siteyi düzelt; uygulama içi politika web URL şartının yerini almaz. Barındırmanın süresiz kalacağı garanti edilmiş değildir.

## Kod ve Android

Mevcut build 6'yı değiştiren yeni kod hazırlanmadı. Kaynak ZIP arşivi yedek içindir; mağaza bilgileri için BAT çalıştırman gerekmez. Yerel şablonda buildNumber=1 ve Expo bağlantısı boş olabilir; gerçek hesabındaki autoIncrement ve bağlı proje bilgilerini değiştirme.

Android APK build'inin başarıyla derlendiği görüldü; bu eski APK'nın son F2 düzeltmesini içerdiği veya Android cihazda denendiği doğrulanmadı. Güncel Android paketi ayrı test edilir. APK dosyası iOS App Store başvurusuna eklenmez.

## Resmî kaynaklar

- Gönderim: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app
- Build seçimi: https://developer.apple.com/help/app-store-connect/manage-builds/choose-a-build-to-submit
- Ekran ölçüleri: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Gizlilik beyanı: https://developer.apple.com/app-store/app-privacy-details/
- İnceleme kuralları: https://developer.apple.com/app-store/review/guidelines/
- Yaş anketi: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating
- Güncel SDK şartları: https://developer.apple.com/news/upcoming-requirements/

4 Ekim 2026'da resmî sayfalar kontrol edildi. Mevcut koşul Xcode 26 veya sonrası/iOS 26 SDK ve en az iOS 13 hedefidir. Build 6 yüklemesi tamamlandı; App Store Connect'te ek bir build uyarısı varsa gönderim öncesinde incelenmeli.
