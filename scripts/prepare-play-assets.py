import os
import shutil
from PIL import Image, ImageDraw, ImageFont

mockup_base = r"C:\Users\efe_k\Downloads\Satranç Saati\Mockup"
output_dirs = [
    r"C:\Users\efe_k\Downloads\Satranç Saati\Google-Play-Assets",
    r"C:\cevdet\Mobil\tempo-chess-clock\store-assets"
]

for out_dir in output_dirs:
    os.makedirs(os.path.join(out_dir, "1-Telefon"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "2-Tablet-7-Inc"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "3-Tablet-10-Inc"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "4-Ozellik-Grafigi-1024x500"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "5-Simge-512x512"), exist_ok=True)

# -------------------------------------------------------------
# 1. TELEFON EKRAN GÖRÜNTÜLERİ (8 Adet)
# -------------------------------------------------------------
phone_src_dir = os.path.join(mockup_base, "Tempo-Turkce-App-Store-Gorselleri-İphone", "1206x2622")
phone_files = [
    "01-Saat.png", "02-Sureler.png", "03-Hamle-Sureleri.png", "04-Rapor-Paylasimi.png",
    "05-Turnuva.png", "06-Simultane.png", "07-Renkler.png", "08-Ayarlar.png"
]

print("=== 1. Telefon Ekran Görüntüleri İşleniyor ===")
for pf in phone_files:
    src = os.path.join(phone_src_dir, pf)
    if os.path.exists(src):
        im = Image.open(src).convert("RGB")
        for out_dir in output_dirs:
            dst = os.path.join(out_dir, "1-Telefon", pf)
            im.save(dst, "PNG", optimize=True)
        print(f"Telefon: {pf} -> {im.size}")

# -------------------------------------------------------------
# 2. TABLET (7 inç ve 10 inç) EKRAN GÖRÜNTÜLERİ (6 Adet)
# -------------------------------------------------------------
tablet_src_dir = os.path.join(mockup_base, "ipad", "Tempo-iPad-Turkce-6-Gorsel", "2048x2732")
tablet_files = [
    "01-Saat.png", "02-Sureler.png", "03-Hamle-Defteri.png",
    "04-Turnuva.png", "05-Simultane.png", "06-Renkler.png"
]

print("=== 2. Tablet Ekran Görüntüleri İşleniyor ===")
for tf in tablet_files:
    src = os.path.join(tablet_src_dir, tf)
    if os.path.exists(src):
        im = Image.open(src).convert("RGB")
        for out_dir in output_dirs:
            # 10 inch tablet: 2048x2732
            dst_10 = os.path.join(out_dir, "3-Tablet-10-Inc", tf)
            im.save(dst_10, "PNG", optimize=True)
            
            # 7 inch tablet: 1536x2048 (aynı en-boy oranı, optimum ölçek)
            im_7 = im.resize((1536, 2048), Image.Resampling.LANCZOS)
            dst_7 = os.path.join(out_dir, "2-Tablet-7-Inc", tf)
            im_7.save(dst_7, "PNG", optimize=True)
        print(f"Tablet: {tf} -> 10 inc (2048x2732) ve 7 inc (1536x2048)")

# -------------------------------------------------------------
# 3. ÖZELLİK GRAFİĞİ (1024x500) - GOOGLE PLAY FEATURING STANDARDI
# -------------------------------------------------------------
# Google Play Featuring Guidelines Özeti:
# 1) Boyut: Tam 1024x500 px.
# 2) Biçim: JPEG veya 24-bit RGB PNG (Şeffaflık/alpha yok).
# 3) Cihaz Çerçevesi veya Mockup KESİNLİKLE OLMAMALI (Telefon çerçevesi, el vs. yasaktır).
# 4) Doğrudan UI ekran görüntüsü olmamalı.
# 5) Fiyat, promosyon, "İndir", "Ücretsiz", "#1" gibi pazarlama çöplüğü olmamalı.
# 6) Güvenli Bölge: Yazılar ve ana ögeler merkezde olmalı, kenarlardan en az %15 boşluk bırakılmalı.
# 7) Yüksek kaliteli Key Art / Atmosfer görseli kullanılmalı.
print("=== 3. Google Play Featuring Uyumlu Özellik Grafikleri Üretiliyor ===")

# Model 1: Header Artwork'ten Akıllı Kırpma (Hero Artwork)
header_src = os.path.join(mockup_base, "Tempo-Header-Search-Gorselleri", "Header-3840x1646.png")
if os.path.exists(header_src):
    header_im = Image.open(header_src).convert("RGB")
    # 1024 x 500 oranı = 2.048
    # 3840 x 1646 -> genişlikten ortalayarak kırp: 1646 * 2.048 = 3371 px
    crop_w = int(header_im.size[1] * (1024.0 / 500.0))
    crop_x = (header_im.size[0] - crop_w) // 2
    cropped = header_im.crop((crop_x, 0, crop_x + crop_w, header_im.size[1]))
    hero_1024 = cropped.resize((1024, 500), Image.Resampling.LANCZOS)
    
    for out_dir in output_dirs:
        hero_dst = os.path.join(out_dir, "4-Ozellik-Grafigi-1024x500", "01-Hero-Art-Featuring-Standart-1024x500.png")
        hero_1024.save(hero_dst, "PNG")
        # Ayrıca ana klasördeki varsayılan grafik olarak da ayarla:
        hero_1024.save(os.path.join(out_dir, "feature-graphic-1024x500.png"), "PNG")
    print("Oluşturuldu: 01-Hero-Art-Featuring-Standart-1024x500.png (Google Featuring Tam Uyumlu)")

# Model 2: Tipografik & Mekanik Saat Tasarımlı Özellik Grafiği
search_src = os.path.join(mockup_base, "Tempo-Header-Search-Gorselleri", "Search-1920x1280.png")
if os.path.exists(search_src):
    search_im = Image.open(search_src).convert("RGB")
    # 1920 x 1280 -> 1024 x 500 oranı için yükseklikten kırp: 1920 / 2.048 = 937.5 px
    crop_h = int(search_im.size[0] / (1024.0 / 500.0))
    crop_y = (search_im.size[1] - crop_h) // 2
    cropped_s = search_im.crop((0, crop_y, search_im.size[0], crop_y + crop_h))
    search_1024 = cropped_s.resize((1024, 500), Image.Resampling.LANCZOS)
    for out_dir in output_dirs:
        s_dst = os.path.join(out_dir, "4-Ozellik-Grafigi-1024x500", "02-Search-Atmosphere-1024x500.png")
        search_1024.save(s_dst, "PNG")
    print("Oluşturuldu: 02-Search-Atmosphere-1024x500.png")

# -------------------------------------------------------------
# 4. UYGULAMA SİMGESİ (512x512)
# -------------------------------------------------------------
icon_src = r"C:\cevdet\Mobil\tempo-chess-clock\assets\tempo-icon.png"
if os.path.exists(icon_src):
    icon_im = Image.open(icon_src).convert("RGBA")
    icon_512 = icon_im.resize((512, 512), Image.Resampling.LANCZOS)
    for out_dir in output_dirs:
        icon_dst = os.path.join(out_dir, "5-Simge-512x512", "icon-512x512.png")
        icon_512.save(icon_dst, "PNG")
        icon_512.save(os.path.join(out_dir, "icon-512x512.png"), "PNG")
    print("Oluşturuldu: icon-512x512.png")

print("\nTüm görseller Google Play Store ve Featuring standartlarına göre başarıyla üretildi!")
