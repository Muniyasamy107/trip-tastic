# React luxury experience

**Current source/UI update:** the later [road-film and concierge edition](ROAD-FILM-CONCIERGE.md)
supersedes earlier references below to the YouTube hero default or older enquiry
presentation. The animation/ownership architecture documented here is retained.

## Scope and ownership

This is an incremental, real React integration, **not** a claim that every legacy
page was rewritten. The public Vite shell still owns hash routing, journey cards,
pricing, forms/dialogs, contact links and existing editorial GSAP choreography.
The authenticated Owner Studio and SQLite API are unchanged.

Two lazy React roots own exclusive boundaries:

- `.react-globe-host` inside `#world-globe`: React Three Fiber / Three.js renderer
  and its reset/instruction overlay. Existing SVG/Canvas fallback lives outside
  that root, so failure cannot erase the public contact/enquiry experience.
- `#luxury-chapters`: the **Private Edit** three-scene React story, Framer Motion
  captions and GSAP-controlled image layers. Legacy code never rewrites this tree.

`world-flight.js` is a small external-store/controller boundary. Main motion,
route, visibility and modal state are passed through `useSyncExternalStore`, not
mutable global React DOM state. The old renderer is in `world-flight-fallback.js`.

## The requested technologies, actually used

### Three.js / React Three Fiber

`luxury/GlobeScene.jsx` uses Canvas, useThree and useFrame, not a flat picture
labelled 3D. A lit sphere occludes the back of the 3D orbit and land dots; Natural
Earth samples become a shader-backed geographic point mesh. An extruded airplane
follows a 3D orbital tangent; two small metallic objects float nearby. The
approximately 19-active-second lap and slower globe rotation are illustrative,
not flight data, a live tracker, an advertised route or a worldwide-service claim.

Pointer drag uses Three OrbitControls; arrows rotate a focused globe, Home or the
44px reset button returns the view. Zoom/pan are disabled to avoid losing the
planet. The canvas keeps `touch-action: pan-y`: vertical gestures may scroll the
page rather than trapping a phone visitor in the globe. The accessible group
provides keyboard instructions. No external model, HDR, texture or map API loads.

Three/Fiber download only after the globe is visible and motion is enabled. Initial
reduced-motion visits keep the SVG without importing that renderer; explicit
Resume can enable it. A failed lazy component download keeps the static story and Canvas fallback until
reload instead of repeatedly retrying or running two globe loops. Once mounted,
the GPU renderer survives ordinary SPA route
changes, rather than creating another WebGL context for every visit. Frames stop
in demand mode while paused, offscreen, hidden, behind a modal or on another route.
DPR is capped at 1.5; expensive shadows/postprocessing are not used. Actual device
FPS is not guaranteed. Unsupported WebGL/context loss uses Canvas 2D; if that is
blocked, the SVG remains visible.

### GSAP + ScrollTrigger

`luxury/LuxuryExperience.jsx` owns one context for the Private Edit timeline:

- Desktop pin only at width ≥1100px, height ≥760px, motion enabled and home active.
- Three image layers zoom/crossfade; chapter state changes at progress thresholds,
  not on every frame. The only pin spacer belongs to `#luxury-chapters`.
- Chapter buttons scroll to the selected desktop chapter; mobile/tablet use native,
  unpinned selection. Captions and real journey links stay usable.
- The context reverts on pause, breakpoint/route changes and unmount.
- Exact pin space is reserved before the lazy mount, preventing deep-linked
  sections from jumping down when the spacer appears. The initial static fallback
  is sticky in that reserved space while loading; no-JS/failure stays unpinned.

The real hero film's full-cover geometry, provider/source, brightness and once-only
behavior are untouched. The new images remain labelled **creative mood imagery**,
not a claim about booked properties, actual supplier vehicles or confirmed tours.

### Lenis

`smooth-scroll.js` synchronizes one Lenis RAF callback with the GSAP ticker. It is
restricted to width ≥901px with a fine pointer and motion enabled. Touch stays
native (`syncTouch: false`); keyboard behavior is not intercepted. In-page anchors
are routed once through the existing hash router. Journey routes cancel pending
scroll targets immediately. Inputs/dialogs use native scroll; opening a modal,
pausing motion or hiding the page destroys Lenis and removes its ticker callback.
No stale `stop()` state is allowed to lock the browser after closing a dialog.

### Framer Motion

React chapter copy uses motion elements and AnimatePresence for keyed fade/slide
transitions. Reduced motion removes those transitions. Framer owns text wrappers;
GSAP owns image layers/pinning—both never write the same element's transform.

## Loading and production delivery

React/Framer and the renderer are dynamically imported. Vite emits separately
cacheable react-runtime, motion, react-three-renderer and three-engine chunks.
The initial entry does not statically import those libraries. Three is still a
substantial lazy engine (~766KB raw / ~196KB gzip at the recorded build); Vite's
>500KB warning is left visible rather than hidden. Bundle sizes can change with
locked package updates.

Production static JS/CSS/SVG/HTML supports gzip negotiation and Vary. HEAD, q=0 and
identity byte ranges are preserved. Private API responses remain uncompressed,
no-store and authenticated. No credentials, price-edit permissions or visitor
personal data are moved into React/Three or public build metadata.

`npm run test:delivery` checks the manifest's static import graph, <115KB compressed
initial JS budget and <230KB compressed Three-engine budget, then validates actual
production gzip bytes, decompression, HEAD, q=0, range responses and private API
401/no-store behavior. Compressed estimates are not represented as the raw size.

## Verification / run commands

Requires Node 22.13+, as before:

```bash
npm ci
npm run dev -- --port 5173
# http://localhost:5173/#world-of-wonder
# http://localhost:5173/#luxury-chapters
npm run test:luxury
npm test
npm run build
```

Production (another terminal while the server is running):

```bash
PORT=4173 npm start
TEST_URL=http://localhost:4173 npm run test:luxury
TEST_URL=http://localhost:4173 npm run test:contacts
TEST_URL=http://localhost:4173 npm run test:delivery
```

The new suite verifies actual WebGL2/R3F rendering, deferred imports, orbit progress,
drag/keyboard/reset, shared pause, hidden-tab behavior, persistent GPU identity,
real WebGL context-loss recovery and blocked lazy-component downloads,
Lenis intermediate wheel positions, native modal scrolling, desktop pin and real
chapter links, mobile selection and initially reduced-motion loading. A separately
launched touch-enabled browser verifies vertical touch gestures can scroll over
the globe. Isolated browsers avoid a bundled single-process Chromium limitation
when closing multiple WebGL browser contexts; this does not alter production code.

320, 360, 390, 768, 820, 1024, 1280, 1440, 1920 widths plus 844×390 landscape are
checked for document/title bounds and touch targets. Representative captures are
saved only to ignored `.cache/`. These emulate browsers, not every physical OS.
Existing suites cover original logo, full-cover/once-only video, pricing, customer
consent/enquiry persistence, secure admin and public contacts. No real calls,
emails, WhatsApp messages or flight bookings are triggered by tests.
