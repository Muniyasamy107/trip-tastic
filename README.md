# Trip Tastic Holidays — cinematic travel website

A premium, animation-led website for **Trip Tastic Holidays**, built around the original Trip Tastic badge
logo (hero landscape, waterfall, jeep and wordmark) — now cleaned up, trimmed and turned into a full brand
system (transparent logo, emblem mark, favicon and social card).

The whole experience is a single, smooth-scrolling page: cinematic intro, parallax hero, a pinned
horizontal destination rail, sticky storytelling, a scroll-driven “journey of the month” spotlight,
postcards with a lightbox, testimonials and a working trip enquiry form.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
npm run preview  # preview the production build
```

Requires Node 20+.

### Windows quick start (no terminal needed)

Double-click **`start-site.bat`** — it installs packages the first time, starts the dev server on
`http://localhost:3000` and opens the browser for you.

### Windows / VS Code terminal (copy-paste)

```powershell
cd $HOME\Desktop
git clone -b arena/23d9011d-trip-tastic https://github.com/Muniyasamy107/trip-tastic.git triptastic-site
cd triptastic-site
npm install
npm run dev
```

## Tech

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| UI         | React 19 + Vite 7                             |
| Motion     | GSAP 3 (ScrollTrigger, MotionPath, context)   |
| Smoothness | Lenis smooth scroll, synced to the GSAP ticker |
| Type       | Fraunces Variable (display) + Manrope Variable |
| Styling    | Hand-written CSS with design tokens (no framework) |

Everything is self-hosted: fonts come from Fontsource, images are local WebP files, and there are no
external trackers or CDN calls.

## Design language

Ultra-premium, editorial and cinematic:

- **Palette** — obsidian ink `#040A09`, jade `#103529`, champagne gold `#C9A45C`, saffron `#E06A3D`
  and warm ivory `#F8F2E5`. Hairline rules and gold brackets are used instead of heavy borders.
- **Type** — Fraunces Variable (light weights, optical size 144, italic accents) against Manrope in
  wide-tracked uppercase micro type.
- **Hero** — a full-viewport stage: gold hairline frame with corner brackets, vertical rails, an
  oversized two-line headline (shimmering gold italic + outlined word), a bottom stat deck and a
  featured-journey chip.
- **Navigation** — scrolling announcement strip, centred emblem crest, link groups split left/right,
  a bar that condenses on scroll, and a full-screen menu with a live destination preview.
- **Sections** — every block opens with a numbered index, label, giant serif title and a right-aligned
  aside, so the page reads like a printed travel annual.

## What’s on the page

1. **Intro / preloader** — logo stamp, progress counter, split curtains that hand off to the hero animation.
2. **Hero** — grand editorial stage with gold frame, oversized gold/outlined headline, parallax image,
   rotating seal, stat deck and a featured-journey chip.
3. **Marquee + press strip** — outlined destination ticker that skews with scroll velocity, followed by
   an “as featured in” band.
4. **Why Trip Tastic** — arched image collage with parallax, rotating seal, feature list and count-up stats.
5. **Destinations** — a horizontally pinned rail of eight destinations on desktop (native snap-scroll on
   mobile). Clicking a card carries the destination into the enquiry form.
6. **The Trip Tastic way** — sticky image column with steps that highlight as you scroll.
7. **The route network** — an animated SVG constellation: six routes draw themselves out of the Chennai hub,
   live flight dots travel each arc, and the departure board below links straight to the enquiry form.
8. **Journey of the month** — a sticky, scroll-scrubbed spotlight where the frame expands and the copy
   rises over Ladakh.
9. **Postcards** — editorial masonry gallery with hover captions and a keyboard-friendly lightbox.
10. **Traveller stories** — auto-rotating testimonial carousel with dots and arrows.
11. **Enquiry** — validated trip-brief form with a success state and WhatsApp hand-off.
12. **Footer** — oversized outlined wordmark, newsletter, sitemap and contact details.

Utility layers: ambient **sound toggle** (Web Audio, synthesised on the fly — no audio files, remembered
between visits), a decoding **scramble** effect on micro labels, the fixed **journey rail**, scroll progress
hairline, custom cursor, grain and a floating WhatsApp concierge.

Plus a custom cursor, scroll-progress bar, floating WhatsApp button, grain overlay and a
`prefers-reduced-motion` mode that switches every heavy animation off.

## Where to edit content

| What                                | File                          |
| ----------------------------------- | ----------------------------- |
| Destinations, steps, stats, reviews  | `src/data.js`                 |
| Phone, email, WhatsApp, address      | `src/data.js` → `contact`     |
| Colours, type scale, radii           | `src/styles/base.css` → `:root` |
| Section styles                       | `src/styles/sections.css` and `blocks.css` |
| Section copy                         | the matching component in `src/components/` |
| Routes + prices on the map           | `src/components/RouteMap.jsx` → `routes`    |
| Meta / OG / structured data          | `index.html`                  |

### Hero film + design file

The hero now ships with a real 16-second cinematic loop:

| File | What it is |
| ---- | ---------- |
| `public/video/hero-uhd-4k.mp4` | **3840×2160 UHD master** · 24fps · 19.7s seamless loop · 9.4 MB (6 plates, slower Ken Burns, teal-gold grade, grain) — streams on 4K displays, ships to film/YouTube |
| `public/video/hero-loop-1440.mp4` | 2560×1440 QHD cut · 5.4 MB — what retina laptops stream |
| `public/video/hero-loop.mp4` | 1600×900 · 16s loop · 2.5 MB — legacy lightweight cut |
| `public/video/hero-loop-1080.mp4` | 1920×1080 master of the same loop · 3.2 MB — presentations, ads, YouTube |
| `public/video/hero-reel.mp4` | 1080×1920 vertical cut with safe-area branding · 13s · 4.1 MB — Reels, Shorts, Stories |
| `public/video/brand-intro.mp4` | 1920×1080 title-baked opener · 10s · 1.9 MB — emblem, champagne wordmark, gold rule, tagline |
| `public/video/*-poster.jpg` | Poster frames for every clip |
| `public/design/index.html` | **Design spec sheet** — live frame, annotations, mobile frame, tokens, motion table, video pack (`/design/`) |
| `public/design/hero-frame.svg` | 1440×900 hero frame with the plate baked in — drag into Figma, layers stay editable |

Regenerate either asset locally:

```bash
pip install --break-system-packages pillow imageio-ffmpeg fonttools brotli
python3 scripts/make-font-ttf.py      # once: variable woff2 -> ttf for Pillow
python3 scripts/make-hero-4k.py       # hero 3840×2160 UHD + 2560×1440 QHD (~8 min)
python3 scripts/make-video-pack.py    # hero 900p + 1080p master + 9:16 reel + brand intro (~2.5 min)
python3 scripts/make-hero-frame.py    # rebuilds the Figma SVG frame
```

`make-video-pack.py` reads the site's own WebP plates and the brand emblem, so re-rendering after a photo
swap keeps every clip on-brand. Type is set in the real Fraunces / Manrope variable fonts at their
website optical sizes (opsz 144, weight 330, SOFT 40–60).

The hero streams one of three encodes, chosen before the request goes out: **4K UHD** on displays 1900px
and wider, **1440p** on retina laptops, **1080p** below that. The `<video>` layer is skipped entirely for
`prefers-reduced-motion`, `save-data` and 2G connections, pauses when the tab is hidden, and falls back to the
still crossfade sequence if the file fails.

Because the source photography is ~1.4K, the UHD master is a carefully finished upscale (Lanczos → unsharp
mask → local contrast → grain). Drop real 4K footage into `src/assets` and re-run the script for a true
native master — nothing else has to change.

### Brand assets

The uploaded `trip-tastic-logo.jpeg` is the source of truth. Derived files:

- `public/brand/logo.webp` — transparent, trimmed full badge (intro screen)
- `public/brand/emblem.webp` — the landscape badge used in the nav, footer and rotating seals
- `public/favicon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- `public/og-image.jpg` — social share card

### The enquiry form

The form is intentionally front-end only so the page stays static and instant. On submit it validates the
fields, shows a success state and offers a WhatsApp hand-off. To capture leads, point `onSubmit` in
`src/components/Enquiry.jsx` at your endpoint (Formspree, a serverless function, Zoho/CRM, etc.) — the
`form` state object is already shaped for JSON.

## Motion notes

- **Cinematic hero** — a four-shot sequence (Western Ghats → Ladakh → Ubud → Alleppey) crossfades behind the
  headline every ~7s with a settle zoom, a live shot counter, an editorial caption and a one-off light sweep
  when the intro curtain lifts.
- **Journey rail** — a fixed dashed route with a plane that travels down it as you scroll (1360px+), with
  ticks that light up for the section you're reading and label tooltips on hover.
- **3D tilt cards** — destination portraits and postcards lean toward the pointer with a soft light glare
  (pointer devices only).
- **Curtain reveals** — story and way images wipe open with a clip-path curtain while the photo settles from
  a slow zoom.
- **Route network** — SVG arcs measure themselves with `getTotalLength()` and draw in on scroll; `<animateMotion>`
  dots then fly each route continuously.
- **Ambient sound** — `src/lib/ambience.js` builds two detuned sine pads through a slow filter sweep plus
  filtered noise "wind" with the Web Audio API. Off by default, toggled by the visitor, remembered in
  `localStorage`, and always resumed after a real gesture.
- Lenis drives scrolling and is advanced from the GSAP ticker; every scroll animation uses `ScrollTrigger`.
- `gsap.matchMedia()` owns the pinned destinations rail, so it only builds on desktop and fully reverts on
  resize or when the user prefers reduced motion.
- Reveals, counters, marquees and the spotlight all clean up their triggers on unmount.
- All animation is transform/opacity based; images declare aspect ratios to avoid layout shift.

## Accessibility

Skip link, visible focus rings, labelled form fields and buttons, `aria-live` success message, `inert`
form behind the success panel, Escape-to-close lightbox and menu, and a complete reduced-motion path.
