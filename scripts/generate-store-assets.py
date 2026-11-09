import os
import shutil
from PIL import Image, ImageDraw, ImageFont

root = r"C:\cevdet\Mobil\tempo-chess-clock"
store_assets_dir = os.path.join(root, "store-assets")
os.makedirs(store_assets_dir, exist_ok=True)

# 1. Generate 512x512 App Icon
icon_src = os.path.join(root, "assets", "tempo-icon.png")
icon_dst = os.path.join(store_assets_dir, "icon-512x512.png")
if os.path.exists(icon_src):
    img = Image.open(icon_src).convert("RGBA")
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(icon_dst, "PNG")
    print(f"Generated: {icon_dst}")

# 2. Copy & prepare screenshots
screenshots_src = os.path.join(root, "docs", "screenshots")
screenshots = [
    ("01-Saat.png", "telefon-1-saat.png"),
    ("02-Sureler.png", "telefon-2-sureler.png"),
    ("03-Hamle-Sureleri.png", "telefon-3-hamle-sureleri.png"),
    ("04-Rapor-Paylasimi.png", "telefon-4-rapor-paylasimi.png"),
    ("05-Turnuva.png", "telefon-5-turnuva.png"),
    ("06-Simultane.png", "telefon-6-simultane.png"),
    ("07-Renkler.png", "telefon-7-renkler.png"),
    ("08-Ayarlar.png", "telefon-8-ayarlar.png"),
]

for src_name, dst_name in screenshots:
    s_path = os.path.join(screenshots_src, src_name)
    d_path = os.path.join(store_assets_dir, dst_name)
    if os.path.exists(s_path):
        # ensure RGB without unnecessary bloated metadata
        im = Image.open(s_path)
        im.save(d_path, "PNG", optimize=True)
        print(f"Prepared screenshot: {dst_name} ({im.size[0]}x{im.size[1]})")

# 3. Generate 1024x500 Feature Graphic
fg_width, fg_height = 1024, 500
feature_img = Image.new("RGB", (fg_width, fg_height), (15, 23, 42)) # Slate 900
draw = ImageDraw.Draw(feature_img)

# Gradient background effect
for y in range(fg_height):
    ratio = y / fg_height
    r = int(15 + ratio * (24 - 15))
    g = int(23 + ratio * (37 - 23))
    b = int(42 + ratio * (65 - 42))
    draw.line([(0, y), (fg_width, y)], fill=(r, g, b))

# Subtle decorative circle / glow behind icon
for radius in range(220, 0, -5):
    alpha_factor = (220 - radius) / 220.0
    glow_color = (
        int(30 + 35 * alpha_factor),
        int(41 + 60 * alpha_factor),
        int(59 + 90 * alpha_factor)
    )
    draw.ellipse([800 - radius, 250 - radius, 800 + radius, 250 + radius], outline=glow_color, width=2)

# Paste app icon on the right side
if os.path.exists(icon_src):
    icon_im = Image.open(icon_src).convert("RGBA")
    icon_resized = icon_im.resize((300, 300), Image.Resampling.LANCZOS)
    # create rounded corner mask for icon
    mask = Image.new("L", (300, 300), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, 300, 300], radius=56, fill=255)
    feature_img.paste(icon_resized, (660, 100), mask)

# Typography on the left side
# Try finding a good system font
def get_font(size, bold=False):
    font_names = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf"
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    return ImageFont.load_default()

title_font = get_font(64, bold=True)
subtitle_font = get_font(28, bold=True)
tagline_font = get_font(20, bold=False)
badge_font = get_font(18, bold=True)

# Badge: FLOPPATECH CORP
badge_text = "FLOPPATECH CORP"
draw.rounded_rectangle([80, 80, 260, 112], radius=8, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
draw.text((95, 87), badge_text, fill=(148, 163, 184), font=badge_font)

# Title: Tempo
draw.text((80, 130), "Tempo", fill=(255, 255, 255), font=title_font)

# Subtitle: Satranç Saati · Chess Clock
draw.text((80, 215), "Satranç Saati  ·  Chess Clock", fill=(226, 232, 240), font=subtitle_font)

# Bullets / Features
features = [
    "⏱️ Fischer, Bronstein, Gecikmeli & Çok Kademeli Tempolar",
    "🏁 Nostaljik Mekanik Bayrak & Hassas Zaman Kontrolü",
    "🏆 Turnuva & Simültane Modları · Çift Dokunuş Koruması",
    "🔒 %100 Çevrimdışı · Sıfır Reklam · Veri Toplanmaz"
]

y_pos = 280
for feat in features:
    draw.text((80, y_pos), feat, fill=(203, 213, 225), font=tagline_font)
    y_pos += 34

# Footer note
draw.text((80, 435), "Resmî Kurumsal Sürüm  |  floppatechcorp.vercel.app", fill=(100, 116, 139), font=get_font(16))

fg_dst = os.path.join(store_assets_dir, "feature-graphic-1024x500.png")
feature_img.save(fg_dst, "PNG")
print(f"Generated feature graphic: {fg_dst}")
