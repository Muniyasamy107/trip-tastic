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

## What’s on the page

1. **Intro / preloader** — logo stamp, progress counter, split curtains that hand off to the hero animation.
2. **Hero** — full-bleed parallax image, masked headline reveal, rotating brand seal, floating “this week’s
   favourite” postcard and trust strip.
3. **Marquee** — outlined destination ticker that skews with scroll velocity.
4. **Why Trip Tastic** — arched image collage with parallax, rotating seal, feature list and count-up stats.
5. **Destinations** — a horizontally pinned rail of eight destinations on desktop (native snap-scroll on
   mobile). Clicking a card carries the destination into the enquiry form.
6. **The Trip Tastic way** — sticky image column with steps that highlight as you scroll.
7. **Journey of the month** — a sticky, scroll-scrubbed spotlight where the frame expands and the copy
   rises over Ladakh.
8. **Postcards** — editorial masonry gallery with hover captions and a keyboard-friendly lightbox.
9. **Traveller stories** — auto-rotating testimonial carousel with dots and arrows.
10. **Enquiry** — validated trip-brief form with a success state and WhatsApp hand-off.
11. **Footer** — oversized outlined wordmark, newsletter, sitemap and contact details.

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
| Meta / OG / structured data          | `index.html`                  |

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

- Lenis drives scrolling and is advanced from the GSAP ticker; every scroll animation uses `ScrollTrigger`.
- `gsap.matchMedia()` owns the pinned destinations rail, so it only builds on desktop and fully reverts on
  resize or when the user prefers reduced motion.
- Reveals, counters, marquees and the spotlight all clean up their triggers on unmount.
- All animation is transform/opacity based; images declare aspect ratios to avoid layout shift.

## Accessibility

Skip link, visible focus rings, labelled form fields and buttons, `aria-live` success message, `inert`
form behind the success panel, Escape-to-close lightbox and menu, and a complete reduced-motion path.
