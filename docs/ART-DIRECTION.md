# South India Atelier — cinematic visual refresh

The refresh changes the site's visual system, not just its dependency list.
`art-direction.css`, imported last in the public entry, art-directs the existing
shell without taking ownership of React islands, API, routing or player state.

## Visual language

- Warm ivory `#f3eee5`, paper `#eae4d9`, deep petrol `#0b282c`, champagne `#dcc18e`.
- Original supplied logo retained in navigation and other existing placements.
- “Beautifully / elsewhere.” hero, large self-hosted Cormorant type, quiet
  Manrope labels, viewfinder corners and a decorative desktop film note.
- A real full-cover YouTube player remains behind the interface. No card-framed
  replacement, photo/composite car animation, duplicate player or fake 8K.
- Finder, collection controls, process panels, journal, FAQ and social/contact
  footer share the same material and typography treatment.
- The new art-direction stylesheet sets metadata no smaller than 9 CSS pixels;
  primary controls retain usable
  target sizes, including 44px save/compare controls. This is not a blanket WCAG
  conformance claim; inspect the final film and complete an independent audit.

## Editorial collection and images

Desktop above 1100px uses twelve tracks and alternating 7/5 then 5/7 spans.
Cards share image heights within a row. Tablet uses the existing two columns;
phone is a single generous portrait-image column. GSAP's card stagger now follows
the two visible collection columns rather than the previous three-column rhythm.

Four new optimized WebP image families complement the retained Munnar/Kerala
moods, so all six journeys have distinct images. Each family has 640, 960 and
1264px-wide sources. `editorial-media.js` only creates candidates for the four
explicitly authored local assets; it does not transform arbitrary URLs. Cards,
details, journal, manifesto and the React Quiet chapter use responsive sources.
Images use lazy loading where appropriate; the hero's real-video source is
untouched. See `public/media/EDITORIAL-IMAGERY.md` for provenance and limitations.

## Motion and preservation

React / GSAP ScrollTrigger pinning and zoom / Three.js + React Three Fiber globe
and floating objects / Lenis / Framer Motion remain the actual implementation.
Desktop-only chapter pinning, keyboard and drag interaction, native mobile
scrolling, reduced-motion and global pause, offscreen/tab/route suspension, and
WebGL/SVG/Canvas recovery are preserved. See `REACT-LUXURY.md` and `MOTION.md`.
Enquiry consent, pricing, Owner Studio, email/WhatsApp drafts and real owner
contacts are unchanged. This is not a full legacy-to-React rewrite.

## Verification

`npm run test:art-direction` checks:

- six unique image URLs and bounded authored WebP payloads;
- phone selection of the small responsive source in a fresh DPR-1 browser;
- seven viewports from 320 to 1920px, including tablet and landscape;
- title/header navigation bounds, card bounds, alternating desktop spans and
  single-column mobile layout;
- visible AI-image disclosure and the corresponding transparency dialog;
- no page runtime errors, plus saved hero/collection screenshots in ignored
  `.cache/` for visual inspection.

It is included in `npm test`. The full suite additionally covers the API,
authenticated admin, YouTube lifecycle, contacts, the globe, cinematic movement,
React/R3F/Lenis/Framer behaviour and ten-width responsive regression checks.
Production tests can use `TEST_URL=http://localhost:4173`; the separate
`npm run test:delivery` checks production compression/lazy-chunk budgets.

Screenshots use a labelled synthetic offline thumbnail fixture. They do **not**
verify live YouTube streaming or replace the deployed footage. Device emulation
is not testing on physical phones/tablets or an FPS guarantee. Production still
has the documented Vite warning for the lazily loaded Three engine chunk and
Node's informational SQLite ExperimentalWarning.
