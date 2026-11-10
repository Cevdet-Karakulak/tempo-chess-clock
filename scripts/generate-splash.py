import os
import subprocess
from PIL import Image

root = r"C:\cevdet\Mobil\tempo-chess-clock"
assets_dir = os.path.join(root, "assets")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# 1. HTML for 1284 x 2778 Full Splash Screen
html_full_splash = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1284px;
    height: 2778px;
    background: radial-gradient(circle at 50% 43%, rgba(132, 227, 71, 0.12) 0%, rgba(56, 189, 248, 0.08) 28%, rgba(18, 22, 26, 0) 65%),
                linear-gradient(180deg, #0A0E12 0%, #12171D 50%, #0E1317 100%);
    color: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 180px 0 140px 0;
    overflow: hidden;
    position: relative;
  }

  /* Subtle background grid / texture */
  .bg-glow {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(132, 227, 71, 0.08) 0%, rgba(56, 189, 248, 0.04) 40%, transparent 70%);
    pointer-events: none;
    border-radius: 50%;
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    margin-top: 280px;
  }

  .clock-wrapper {
    position: relative;
    margin-bottom: 54px;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 30px rgba(132, 227, 71, 0.15));
  }

  .branding {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .wordmark-row {
    display: flex;
    align-items: baseline;
    position: relative;
  }

  .wordmark {
    font-size: 136px;
    font-weight: 900;
    letter-spacing: -4px;
    color: #F8FAFC;
    line-height: 1;
  }

  .lime-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #84E347;
    margin-left: 6px;
    box-shadow: 0 0 20px #84E347, 0 0 40px rgba(132, 227, 71, 0.6);
    margin-bottom: 22px;
  }

  .subtitle {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 10px;
    color: #94A3B8;
    margin-top: 18px;
    margin-left: 10px;
    text-transform: uppercase;
  }

  .accent-bar {
    width: 80px;
    height: 5px;
    border-radius: 3px;
    background: linear-gradient(90deg, #84E347, #38BDF8);
    margin-top: 26px;
    box-shadow: 0 0 15px rgba(132, 227, 71, 0.5);
  }

  .tagline {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 5px;
    color: #64748B;
    margin-top: 24px;
    text-transform: uppercase;
  }

  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 2;
  }

  .corp-name {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 7px;
    color: #64748B;
    text-transform: uppercase;
  }

  .corp-sub {
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 3px;
    color: #475569;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>

  <div class="center-content">
    <div class="clock-wrapper">
      <svg width="340" height="290" viewBox="0 0 170 145" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lime" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#84E347"/>
            <stop offset="100%" stop-color="#A5F266"/>
          </linearGradient>
          <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#0284C7"/>
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1F2832"/>
            <stop offset="100%" stop-color="#141B22"/>
          </linearGradient>
        </defs>

        <!-- Housing Body -->
        <rect x="5" y="24" width="160" height="116" rx="30" fill="url(#bodyGrad)" stroke="#2C3B49" stroke-width="3"/>

        <!-- Left Plunger (Player 1 - Up / Blue) -->
        <rect x="28" y="10" width="46" height="16" rx="5" fill="url(#blue)"/>

        <!-- Right Plunger (Player 2 - Down / Lime) -->
        <rect x="96" y="2" width="46" height="24" rx="5" fill="url(#lime)"/>

        <!-- Clock Face Dial -->
        <circle cx="85" cy="82" r="48" fill="#11161B" stroke="#25323E" stroke-width="2.5"/>

        <!-- Clock Dial Ticks -->
        <circle cx="85" cy="39" r="2.5" fill="#475569"/>
        <circle cx="128" cy="82" r="2.5" fill="#475569"/>
        <circle cx="85" cy="125" r="2.5" fill="#475569"/>
        <circle cx="42" cy="82" r="2.5" fill="#475569"/>

        <!-- Lime Progress Arc -->
        <path d="M85 38 A44 44 0 1 1 46 104" fill="none" stroke="url(#lime)" stroke-width="5" stroke-linecap="round"/>
        <circle cx="46" cy="104" r="5" fill="#38BDF8"/>

        <!-- King Chess Piece Silhouette & Mechanical Flag -->
        <g transform="translate(85, 83) scale(1.05)">
          <!-- Crown cross -->
          <rect x="-2.5" y="-31" width="5" height="14" rx="1.5" fill="#F8FAFC"/>
          <rect x="-7" y="-27" width="14" height="4" rx="1.5" fill="#F8FAFC"/>
          <!-- Head / Coronet -->
          <path d="M-14 -18 C-12 -22 12 -22 14 -18 C16 -14 15 -10 13 -8 C9 -5 -9 -5 -13 -8 C-15 -10 -16 -14 -14 -18 Z" fill="#F8FAFC"/>
          <!-- Neck / Collar with lime accent -->
          <rect x="-11" y="-7" width="22" height="3.5" rx="1.7" fill="#84E347"/>
          <!-- Body -->
          <path d="M-10 -3.5 C-8 9 -12 14 -15 18 H15 C12 14 8 9 10 -3.5 Z" fill="#F8FAFC"/>
          <rect x="-1.8" y="1" width="3.6" height="11" rx="1.8" fill="#11161B"/>
          <!-- Base rings -->
          <rect x="-18" y="18.5" width="36" height="4.5" rx="2.2" fill="#F8FAFC"/>
          <rect x="-22" y="23.5" width="44" height="5.5" rx="2.7" fill="#F8FAFC"/>
        </g>
      </svg>
    </div>

    <div class="branding">
      <div class="wordmark-row">
        <span class="wordmark">tempo</span>
        <div class="lime-dot"></div>
      </div>
      <div class="subtitle">Satranç Saati</div>
      <div class="accent-bar"></div>
      <div class="tagline">Hassas Zaman Kontrolü</div>
    </div>
  </div>

  <div class="footer">
    <div class="corp-name">FloppaTech Corp</div>
    <div class="corp-sub">Precision Chess Engine</div>
  </div>
</body>
</html>
"""

# 2. HTML for 1024 x 1024 Splash Icon (Center Adaptive Icon on Transparent BG)
html_splash_icon = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1024px;
    height: 1024px;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .clock-wrapper {
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 35px rgba(132, 227, 71, 0.25));
  }
</style>
</head>
<body>
  <div class="clock-wrapper">
    <svg width="680" height="580" viewBox="0 0 170 145" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lime" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#84E347"/>
          <stop offset="100%" stop-color="#A5F266"/>
        </linearGradient>
        <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1F2832"/>
          <stop offset="100%" stop-color="#141B22"/>
        </linearGradient>
      </defs>

      <!-- Housing Body -->
      <rect x="5" y="24" width="160" height="116" rx="30" fill="url(#bodyGrad)" stroke="#2C3B49" stroke-width="3"/>

      <!-- Left Plunger (Blue) -->
      <rect x="28" y="10" width="46" height="16" rx="5" fill="url(#blue)"/>

      <!-- Right Plunger (Lime) -->
      <rect x="96" y="2" width="46" height="24" rx="5" fill="url(#lime)"/>

      <!-- Clock Face Dial -->
      <circle cx="85" cy="82" r="48" fill="#11161B" stroke="#25323E" stroke-width="2.5"/>

      <!-- Ticks -->
      <circle cx="85" cy="39" r="2.5" fill="#475569"/>
      <circle cx="128" cy="82" r="2.5" fill="#475569"/>
      <circle cx="85" cy="125" r="2.5" fill="#475569"/>
      <circle cx="42" cy="82" r="2.5" fill="#475569"/>

      <!-- Lime Progress Arc -->
      <path d="M85 38 A44 44 0 1 1 46 104" fill="none" stroke="url(#lime)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="46" cy="104" r="5" fill="#38BDF8"/>

      <!-- King Chess Piece Silhouette -->
      <g transform="translate(85, 83) scale(1.05)">
        <rect x="-2.5" y="-31" width="5" height="14" rx="1.5" fill="#F8FAFC"/>
        <rect x="-7" y="-27" width="14" height="4" rx="1.5" fill="#F8FAFC"/>
        <path d="M-14 -18 C-12 -22 12 -22 14 -18 C16 -14 15 -10 13 -8 C9 -5 -9 -5 -13 -8 C-15 -10 -16 -14 -14 -18 Z" fill="#F8FAFC"/>
        <rect x="-11" y="-7" width="22" height="3.5" rx="1.7" fill="#84E347"/>
        <path d="M-10 -3.5 C-8 9 -12 14 -15 18 H15 C12 14 8 9 10 -3.5 Z" fill="#F8FAFC"/>
        <rect x="-1.8" y="1" width="3.6" height="11" rx="1.8" fill="#11161B"/>
        <rect x="-18" y="18.5" width="36" height="4.5" rx="2.2" fill="#F8FAFC"/>
        <rect x="-22" y="23.5" width="44" height="5.5" rx="2.7" fill="#F8FAFC"/>
      </g>
    </svg>
  </div>
</body>
</html>
"""

temp_full_html = os.path.join(root, "temp-full-splash.html")
temp_icon_html = os.path.join(root, "temp-icon-splash.html")

with open(temp_full_html, "w", encoding="utf-8") as f:
    f.write(html_full_splash)

with open(temp_icon_html, "w", encoding="utf-8") as f:
    f.write(html_splash_icon)

splash_png = os.path.join(assets_dir, "splash.png")
splash_icon_png = os.path.join(assets_dir, "splash-icon.png")

# Render full splash
subprocess.run([
    chrome_path, "--headless=new", "--disable-gpu",
    f"--screenshot={splash_png}", "--window-size=1284,2778",
    f"file:///{temp_full_html.replace(os.sep, '/')}"
], check=True)
print(f"Generated: {splash_png}")

# Render splash icon
subprocess.run([
    chrome_path, "--headless=new", "--disable-gpu", "--default-background-color=00000000",
    f"--screenshot={splash_icon_png}", "--window-size=1024,1024",
    f"file:///{temp_icon_html.replace(os.sep, '/')}"
], check=True)
print(f"Generated: {splash_icon_png}")

# Cleanup temp htmls
os.remove(temp_full_html)
os.remove(temp_icon_html)

# Generate Android drawable densities from splash-icon.png
drawable_sizes = {
    "drawable-mdpi": 288,
    "drawable-hdpi": 432,
    "drawable-xhdpi": 576,
    "drawable-xxhdpi": 864,
    "drawable-xxxhdpi": 1152
}

icon_img = Image.open(splash_icon_png).convert("RGBA")
for folder, size in drawable_sizes.items():
    folder_path = os.path.join(root, "android", "app", "src", "main", "res", folder)
    if os.path.exists(folder_path):
        target_path = os.path.join(folder_path, "splashscreen_logo.png")
        resized = icon_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(target_path, "PNG", optimize=True)
        print(f"Updated Android drawable: {folder}/splashscreen_logo.png ({size}x{size})")

print("All splash graphics successfully created!")
