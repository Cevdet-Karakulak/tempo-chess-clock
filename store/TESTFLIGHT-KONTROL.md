# Tempo 1.0.0 (6) — gerçek cihaz son kontrolü

4 Ekim 2026: Kullanıcı iPhone'da başlık düzenini, doğrudan Fotoğraflar'a kayıt ve gizlilik sayfası geçişlerini doğruladı. Son F2 build 1.0.0 (6) yüklemesi ve bayrak düzeltmesi kullanıcı tarafından doğrulandı. Bu, bütün cihaz ve özelliklerin test edildiği anlamına gelmez. Fiziksel iPad testi henüz bildirilmedi.

## Yayına göndermeden kısa kontrol

1. iPad'e TestFlight build 6'yı kur. Dikey, yatay ve Split View'da hazırlık başlığını, saatleri ve düğmeleri kontrol et. Türkçe/İngilizce metinler kesilmemeli.
2. 3 + 2 seçip birkaç hamle yap. Saat panelleri tek dokunuşla sıra değiştirmeli. Saat çalışırken ortadaki duraklat/ayarlar/yenile düğmeleri aynı düğmeye 600 ms içinde iki dokunuşla çalışmalı; duraklatılmışken tek dokunuş yeterli olmalı.
3. iPad Hamle Defteri'nde resim kaydet ve Fotoğraflar'da aç. PDF'yi paylaşım penceresiyle Dosyalar'a kaydedip aç. 20'den fazla basmada resim son 20 kaydı, PDF tüm kayıtları içermeli; alt satırlar kesilmemeli. Fotoğraf izni reddedildiğinde anlaşılır hata görünmeli; uygulama kullanılmaya devam etmeli.
4. Tema > Gizlilik ve destek > Gizlilik politikası uçak modunda açılmalı. Geri destek sayfasına, tekrar Geri Tema'ya dönmeli. İnternet açıkken isteğe bağlı web bağlantıları açılmalı.
5. Kısa bir oyunu süre dolarak bitir. Düşen bayrak kaybolmamalı; 10 saniye sonra ve ekranı çevirince görünür kalmalı. Hareketi Azalt açıkken sabit bitiş görünmeli. Yeni maç sahneyi kaldırmalı.
6. Kilitle/aç ve uygulamadan çık/dön: saat duraklamış olmalı. Uygulamayı kapatıp yeniden aç: Süreler açılmalı, ayarlar/favoriler ve kayıtlı maç korunmalı. Ses/titreşim destekleyen cihazda çalışmalı.
7. Turnuva eşiğini test için 2 hamle yap: her oyuncuya yalnız kendi ikinci basmasında süre eklenmeli.

## Gerçek mağaza görüntüleri

Görüntüleri build 6'dan al: Süreler, çalışan saat ve Hamle Defteri. Her dil için aynı sırayı kullan. İlk görüntü uygulamayı kullanım halinde göstermeli. Ekran kaydı videosu isteğe bağlıdır.

| Yuva | Kabul edilen dikey boyutlar |
| --- | --- |
| iPhone 6,9 inç | 1320×2868, 1290×2796 veya 1260×2736 |
| iPhone 6,5 inç, 6,9 görüntüsü yoksa | 1284×2778 veya 1242×2688 |
| iPad 13 inç | 2064×2752 veya 2048×2732 |

Yatay eşdeğerleri kabul edilir. Her gerekli cihaz yuvasına 1–10 JPEG/JPG/PNG yüklenir; saydamlık kullanma. iPad desteklendiğinden iPad yuvası da gerekir. Cihaz veya iOS simülatöründen gerçek görüntü kullan; tarayıcı taslaklarını mağaza ekran görüntüsü olarak kullanma. Başka ölçüde görüntü varsa kırpmadan/esnetmeden önce ölçüsünü kontrol et.

Kaynak: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
