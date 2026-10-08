# Tempo’yu GitHub’a yükleme

Bu paketi ayrı bir klasöre açın. İncelemede olan derlemeyi göndermek için kullandığınız çalışma klasörünün üzerine yazmanız gerekmez.

## 1. Depo oluşturma

1. GitHub hesabınıza girin ve https://github.com/new adresini açın.
2. Repository name: `tempo-chess-clock`.
3. Visibility: `Private`. Böylece kaynak kodu herkese açık olmaz.
4. Add README kapalı; .gitignore ve License seçenekleri `None` olsun. README ve Git dosyaları zaten pakette var.
5. `Create repository` düğmesine basın.

## 2. Kaynakları yükleme

1. ZIP’i açıp içindeki `tempo-animated` klasörüne girin.
2. Boş GitHub deposunda `uploading an existing file` bağlantısına basın. Dosyalar varsa `Add file → Upload files` yolunu kullanın.
3. `tempo-animated` klasörünün içindeki dosya ve alt klasörleri yükleme alanına sürükleyin. ZIP dosyasını veya dıştaki klasörü yüklemeyin.
4. `.gitignore` ve `.gitattributes` dosyalarını da dahil edin. Mac’te Finder’da Command + Shift + nokta ile gizli dosyaları gösterebilirsiniz.
5. Yükleme bitince açıklamaya `Initial Tempo source with B1 audio fix` yazın.
6. Ekrandaki `Commit changes` / değişiklikleri kaydet düğmesiyle tamamlayın.

Paket 100 dosya içerir. Tarayıcı bir seferde 100 dosyaya kadar kabul eder; sınır hatası alırsanız iki yükleme halinde ekleyin.

## 3. Son kontrol

Depo ana sayfasında `App.tsx`, `index.js`, `package.json`, `package-lock.json`, `app.json`, `eas.json`, `README.md` ve `src`, `assets`, `locales`, `tests`, `scripts` klasörleri görünmelidir. App.tsx’e ulaşmak için fazladan `tempo-animated` klasörüne girmeniz gerekiyorsa dosyaları bir üst düzeye taşıyın.

`node_modules`, oturum bilgileri, imzalama anahtarları ve IPA/APK derlemelerini kaynak deposuna eklemeyin. `.gitignore`, Git ile yüklemelerde bunları dışarıda tutar; tarayıcıdan elle yüklenen dosyaları otomatik filtrelemez.

GitHub kaynak kodunu saklar. App Store ve TestFlight’a derleme göndermek ayrı bir işlemdir. Mevcut Expo projesini kullanırken kendi hesap ve proje bağlantılarını koruyun.

Resmî kılavuzlar:
- https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
