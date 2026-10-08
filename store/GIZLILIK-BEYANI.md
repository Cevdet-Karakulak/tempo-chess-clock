# App Store Connect gizlilik ve yaş soruları

Bu sürümde ayarlar, favoriler ve saat geçmişi yalnızca cihazda tutulur. PNG, kullanıcı Resim olarak aktar seçtiğinde doğrudan Fotoğraflar’a kaydedilir. iOS yalnızca ekleme izni ister; uygulama mevcut fotoğrafları okumaz. iCloud Fotoğrafları eşzamanlaması varsa Apple’ın cihaz ayarları geçerlidir. PDF yalnızca kullanıcının kendi paylaşım seçimiyle başka uygulamaya gider. Geliştiriciye otomatik aktarım yoktur; reklam ve analiz SDK’sı yoktur.

App Privacy: uygulama için “Data Not Collected / Veri Toplanmıyor” yanıtı bu sürümün mevcut işleyişine uygundur. Sonradan analiz, reklam, çevrim içi senkronizasyon veya uzaktan güncelleme eklersen tekrar değerlendir. Destek e-postasının isteğe bağlı işlenmesi gizlilik politikasında ayrıca açıklanır.

Tracking: Hayır. Hesap açma: yok; uygulama içi hesap silme akışı gerekmez. Uygulama içi satın alma: yok. Mikrofon, kamera, kişiler ve konum: kullanılmaz. Gizlilik açıklaması uygulama içinde internet olmadan da okunur.

Yaş derecelendirme anketinde mevcut içerik için şiddet, cinsellik, kumar, tıbbi tavsiye, sohbet ve kullanıcı içerikleri yok olarak yanıtlanabilir. Son yaş derecesini Apple anket sonucuna göre belirler; burada atanmış değildir.

Export Compliance: uygulama özel veya muaf olmayan şifreleme algoritması içermez. iOS usesNonExemptEncryption=false. Sistem HTTPS bağlantıları dışında özel şifreleme yoktur.

PrivacyInfo.xcprivacy, kullanılan yerel depolama için UserDefaults ve dosya zaman damgası nedenlerini içerir. React Native, AsyncStorage ve Expo File System kendi SDK gizlilik manifestlerini de sağlar; nihai birleşmiş manifest Xcode/EAS arşivinde kontrol edilmelidir.
