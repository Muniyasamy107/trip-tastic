"""
Builds design/hero-frame.svg — a Figma-importable hero frame with the film
poster baked in as a base64 layer and the whole overlay as editable vectors.

    pip install --break-system-packages pillow
    python3 scripts/make-hero-frame.py
"""
from PIL import Image
import base64, io, os

SRC = 'public/video/hero-poster.jpg'
OUT = 'public/design/hero-frame.svg'
W, H = 1440, 900

im = Image.open(SRC).convert('RGB').resize((W, 810), Image.LANCZOS)
buf = io.BytesIO()
im.save(buf, 'JPEG', quality=74, optimize=True, progressive=True)
b64 = base64.b64encode(buf.getvalue()).decode()

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <title>Trip Tastic Holidays — hero frame (desktop 1440×900)</title>
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#040a09" stop-opacity="0.72"/>
      <stop offset="0.26" stop-color="#040a09" stop-opacity="0.16"/>
      <stop offset="0.58" stop-color="#040a09" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#040a09" stop-opacity="0.96"/>
    </linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#040a09" stop-opacity="0.66"/>
      <stop offset="0.58" stop-color="#040a09" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c9a45c"/>
      <stop offset="0.28" stop-color="#f3e2b8"/>
      <stop offset="0.5" stop-color="#ebd3a0"/>
      <stop offset="0.78" stop-color="#c9a45c"/>
      <stop offset="1" stop-color="#f7ecc9"/>
    </linearGradient>
    <radialGradient id="glowwarm">
      <stop offset="0" stop-color="#e06a3d" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#e06a3d" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="frameClip"><rect x="0" y="0" width="{W}" height="{H}"/></clipPath>
  </defs>

  <g clip-path="url(#frameClip)">
    <image x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"
      xlink:href="data:image/jpeg;base64,{b64}"/>
    <rect x="0" y="0" width="{W}" height="{H}" fill="url(#veil)"/>
    <rect x="0" y="0" width="{W}" height="{H}" fill="url(#side)"/>
    <circle cx="1180" cy="150" r="330" fill="url(#glowwarm)"/>
  </g>

  <!-- gold hairline frame + brackets -->
  <rect x="26" y="94" width="{W-52}" height="{H-94-22}" fill="none" stroke="#c9a45c" stroke-opacity="0.22" stroke-width="1"/>
  <g stroke="#c9a45c" stroke-opacity="0.8" stroke-width="1" fill="none">
    <path d="M26 124 V94 H56"/>
    <path d="M{W-56} 94 H{W-26} V124"/>
    <path d="M26 {H-52} V{H-22} H56"/>
    <path d="M{W-56} {H-22} H{W-26} V{H-52}"/>
  </g>

  <!-- announcement strip -->
  <rect x="0" y="0" width="{W}" height="34" fill="#040a09" fill-opacity="0.55"/>
  <line x1="0" y1="34" x2="{W}" y2="34" stroke="#f8f2e5" stroke-opacity="0.1"/>
  <text x="88" y="22" font-family="Manrope, Arial, sans-serif" font-size="8.5" font-weight="800" letter-spacing="3.4" fill="#ebd3a0">NOW BOOKING</text>
  <text x="186" y="22" font-family="Manrope, Arial, sans-serif" font-size="8.5" font-weight="700" letter-spacing="3.2" fill="#f8f2e5" fill-opacity="0.6">WINTER &amp; SPRING 2026</text>
  <text x="{W-88}" y="22" text-anchor="end" font-family="Manrope, Arial, sans-serif" font-size="8.5" font-weight="800" letter-spacing="3.4" fill="#ebd3a0">CONCIERGE · +91 90000 12345</text>

  <!-- nav bar -->
  <g font-family="Manrope, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="3.4" fill="#f8f2e5" fill-opacity="0.72">
    <text x="88" y="76">DESTINATIONS</text>
    <text x="238" y="76">THE HOUSE</text>
    <text x="378" y="76">THE WAY</text>
    <text x="496" y="76">ROUTES</text>
  </g>
  <rect x="1214" y="54" width="138" height="30" fill="#c9a45c"/>
  <text x="1283" y="73" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="8" font-weight="800" letter-spacing="2.4" fill="#040a09">PLAN MY JOURNEY</text>
  <g>
    <rect x="646" y="52" width="30" height="30" rx="3" fill="#f6eed9"/>
    <text x="686" y="67" font-family="Fraunces, Georgia, serif" font-size="17" fill="#f8f2e5">Trip Tastic</text>
    <text x="686" y="79" font-family="Manrope, Arial, sans-serif" font-size="5.5" font-weight="800" letter-spacing="3.4" fill="#c9a45c">HOLIDAYS</text>
  </g>

  <!-- kicker -->
  <g font-family="Manrope, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="3.2">
    <line x1="88" y1="596" x2="152" y2="596" stroke="#c9a45c"/>
    <text x="166" y="600" fill="#f8f2e5" fill-opacity="0.8">PRIVATE JOURNEYS</text>
    <text x="330" y="600" fill="#c9a45c">·</text>
    <text x="348" y="600" fill="#f8f2e5" fill-opacity="0.8">INDIA &amp; BEYOND</text>
  </g>

  <!-- headline -->
  <text x="86" y="686" font-family="Fraunces, Georgia, serif" font-size="104" font-weight="300" letter-spacing="-4.2" fill="#f8f2e5">The art of</text>
  <text x="86" y="784" font-family="Fraunces, Georgia, serif" font-size="104" font-weight="300" font-style="italic" letter-spacing="-4.2" fill="url(#gold)">wandering</text>
  <text x="592" y="784" font-family="Fraunces, Georgia, serif" font-size="104" font-weight="300" font-style="italic" letter-spacing="-4.2" fill="none" stroke="#f8f2e5" stroke-opacity="0.62" stroke-width="1">well</text>

  <!-- lede + hairline -->
  <line x1="88" y1="806" x2="530" y2="806" stroke="#f8f2e5" stroke-opacity="0.18"/>
  <g font-family="Manrope, Arial, sans-serif" font-size="12.5" fill="#f8f2e5" fill-opacity="0.76">
    <text x="88" y="828">Handcrafted holidays across India and beyond —</text>
    <text x="88" y="845">boutique stays, private guides and slow, cinematic</text>
    <text x="88" y="862">itineraries built around the way you travel.</text>
  </g>

  <!-- ctas -->
  <rect x="592" y="806" width="176" height="46" fill="#c9a45c"/>
  <text x="620" y="834" font-family="Manrope, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="2.6" fill="#040a09">PLAN MY JOURNEY ↗</text>
  <rect x="780" y="806" width="204" height="46" fill="none" stroke="#f8f2e5" stroke-opacity="0.34"/>
  <text x="806" y="834" font-family="Manrope, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="2.6" fill="#f8f2e5">EXPLORE DESTINATIONS</text>

  <!-- rotating seal -->
  <g transform="translate(1196, 262)">
    <circle r="66" fill="none" stroke="#f8f2e5" stroke-opacity="0.22"/>
    <circle r="52" fill="none" stroke="#f8f2e5" stroke-opacity="0.12"/>
    <path id="sealPath" d="M0,-56 a56,56 0 1,1 -0.1,0" fill="none"/>
    <text font-family="Manrope, Arial, sans-serif" font-size="7.4" font-weight="800" letter-spacing="2.6" fill="#f8f2e5" fill-opacity="0.72">
      <textPath href="#sealPath" startOffset="2">TRIP TASTIC HOLIDAYS · CRAFTED JOURNEYS · SINCE 2014 ·</textPath>
    </text>
    <circle r="30" fill="#fdf8ea"/>
    <text y="4" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" font-style="italic" fill="#0a1b15">TT</text>
  </g>

  <!-- bottom deck -->
  <line x1="88" y1="880" x2="{W-88}" y2="880" stroke="#f8f2e5" stroke-opacity="0.14"/>
  <g font-family="Manrope, Arial, sans-serif">
    <text x="88" y="892" font-size="6.5" font-weight="800" letter-spacing="2.4" fill="#c9a45c">01</text>
    <text x="112" y="894" font-family="Fraunces, Georgia, serif" font-size="14" fill="#f8f2e5">68</text>
    <text x="136" y="892" font-size="6.5" letter-spacing="2" fill="#f8f2e5" fill-opacity="0.5">DESTINATIONS</text>

    <text x="276" y="892" font-size="6.5" font-weight="800" letter-spacing="2.4" fill="#c9a45c">02</text>
    <text x="300" y="894" font-family="Fraunces, Georgia, serif" font-size="14" fill="#f8f2e5">12</text>
    <text x="320" y="892" font-size="6.5" letter-spacing="2" fill="#f8f2e5" fill-opacity="0.5">YEARS</text>

    <text x="404" y="892" font-size="6.5" font-weight="800" letter-spacing="2.4" fill="#c9a45c">03</text>
    <text x="428" y="894" font-family="Fraunces, Georgia, serif" font-size="14" fill="#f8f2e5">4.9</text>
    <text x="452" y="892" font-size="6.5" letter-spacing="2" fill="#f8f2e5" fill-opacity="0.5">TRIP RATING</text>
  </g>
  <text x="{W-88}" y="892" text-anchor="end" font-family="Manrope, Arial, sans-serif" font-size="6.5" font-weight="800" letter-spacing="2.6" fill="#c9a45c">HERO · DESKTOP 1440×900 · TRIP TASTIC</text>
</svg>
'''
os.makedirs('public/design', exist_ok=True)
open(OUT, 'w').write(svg)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
