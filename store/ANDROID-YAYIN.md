# Tempo Android / Google Play hazırlığı

Kontrol tarihi: 23 Ekim 2026  
Kaynak: `Cevdet-Karakulak/tempo-chess-clock`  
Paket adı: `com.floppachesscorp.tempo`

## Hazırlanan ayarlar

- `android-apk`: fiziksel cihazda kurup denemek için APK.
- `android-store`: Google Play kapalı test veya mağaza yüklemesi için AAB.
- AAB profili mevcut `production` profilinden sürüm artırma ve üretim ortamı ayarlarını alır.
- Bu değişiklik derleme başlatmaz veya mağazaya otomatik gönderim yapmaz.

## İmzalama ve proje bağlantısı

Bu depodaki `app.json` içinde mevcut EAS proje kimliği yok. Daha önce APK üretilmiş olduğundan, bulut derlemesinden önce mevcut Tempo projesi ve imzalama anahtarı kullanılmalı. Aynı isimle yeni Expo projesi oluşturma.

Önce mevcut bağlı Tempo çalışma kopyasındaki `extra.eas.projectId` ile Expo panelindeki proje kimliğini eşleştir. İmzalama bilgilerini depoya ekleme. Mevcut keystore ve parola bilgilerini güvenli bir yerde yedekle. Google Play'de bu paket adıyla bir uygulama varsa yükleme anahtarının o uygulamayla eşleşmesi gerekir.

## Windows'ta yerel AAB üretimi

Bu yol EAS bulut derleme kotası veya GitHub Actions dakikası kullanmaz; derleme Windows bilgisayarda çalışır.

1. Node.js, JDK ve Android SDK araçlarının kurulu olduğunu doğrula.
2. Güncel proje klasöründe `npm ci`, `npm test`, `npm run check` ve `node scripts/verify-release-a1.cjs` çalıştır.
3. `npx expo prebuild --platform android` ile native Android projesini oluştur.
4. Expo'nun aşağıdaki resmi yerel üretim yönergesini izleyerek mevcut yükleme anahtarını indir ve Gradle release imzalama yapılandırmasına bağla. İlk kez anahtar üretilecekse bunu bilgisayarda yapıp güvenli şekilde yedekle.
5. Google Play'deki son sürüm kodunu kontrol et; yeni sürüm kodu daha büyük olmalı. İlk mağaza yüklemesiyse bunu uygulama kaydıyla birlikte doğrula.
6. PowerShell'de `cd android`, ardından `.\gradlew.bat app:bundleRelease` çalıştır.
7. AAB çıktısı: `android/app/build/outputs/bundle/release/app-release.aab`.
8. Fiziksel test için aynı imzalama yapılandırmasıyla `.\gradlew.bat app:assembleRelease` çalıştır. APK çıktısı: `android/app/build/outputs/apk/release/app-release.apk`.

Expo'nun yeni oluşturduğu Android projesindeki varsayılan debug imzası mağaza imzası değildir. Release imzalama yapılandırması yapılmadan çıkan dosyayı Google Play'e yükleme.

## İsteğe bağlı EAS bulut derlemesi

Mevcut Tempo EAS projesinin bağlantısı ve bulut kotası doğrulandıktan sonra:

```bash
npx eas-cli build --platform android --profile android-store
```

Cihaza doğrudan kurulacak APK için:

```bash
npx eas-cli build --platform android --profile android-apk
```

Bunlar EAS bulut derlemesi başlatır. Yukarıdaki Windows yerel yöntemi için bu komutlar gerekmez.

## Cihaz doğrulaması ve mağaza kaydı

- Açılış, hazır/özel süreler, iki sayacın geçişi ve artışlar.
- Duraklatma, sıfırlama, çalışan saat sırasında çift dokunma.
- Hamle defteri, PDF paylaşımı ve Fotoğraflar'a resim kaydetme.
- Türkçe/İngilizce, açık/koyu tema, yatay/dikey görünüm.
- Arka plana geçişte duraklama ve geri dönünce doğru süre.
- Play Console'da uygulama adı, kategori, gizlilik, veri güvenliği ve reklam beyanları güncel Android sürümüyle eşleştirilecek.
- Gereken test süreci Play Console hesabındaki koşullara göre tamamlanacak.

## Bu hazırlıkta doğrulananlar

- 72 mevcut otomatik test geçti.
- TypeScript kontrolü geçti.
- A1 kaynak bütünlüğü kontrolü geçti.
- AAB profili yapılandırması kontrol edildi.
- İmzalı APK/AAB üretimi ve fiziksel Android testi henüz yapılmadı.

## Resmi kaynaklar

- Yerel release ve imzalama: https://docs.expo.dev/guides/local-app-production/
- APK / AAB: https://docs.expo.dev/build-reference/apk/
- EAS profil seçenekleri: https://docs.expo.dev/eas/json/
- Google Play uygulama kurulumu: https://support.google.com/googleplay/android-developer/answer/9859152
