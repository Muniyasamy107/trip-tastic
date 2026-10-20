# World-flight motion

## Experience

The new section follows the journey finder and precedes the introduction. The
hero's down-arrow links to `#world-of-wonder`. Emerald oceans, geographic champagne
land dots, meridians, a South India origin marker and an inclined orbital trail
create a dimensional globe. The aircraft rotates along its tangent; the planet
occludes the back half of the orbit. A lap takes approximately 19 active seconds;
the planet rotates more slowly, approximately once per 85 active seconds. Pauses
and background/offscreen time do not advance the simulation.

This is an authored illustration, not actual flight data, a bookable route or a
claim that Trip-Tastic offers trips worldwide. South India remains the collection.
The original header film still plays only once; looping the decorative aircraft
neither loops nor reloads the film.

## Motion / performance

- Native requestAnimationFrame timing, bounded frame deltas and shared GSAP lag
  smoothing avoid fast-forward jumps after a stall. Scroll reveals use gentler
  1.2-second easing; hover movement is restricted to hover-capable devices.
- Latitude/longitude vectors and grid lines are precomputed. Land is batched into
  six depth bands instead of individually submitting each point's fill.
- A small CPU-raster Canvas 2D illustration avoids software-GPU bottlenecks; DPR is
  capped at 2. No Three.js/WebGL stack, animation library or map provider is added.
- IntersectionObserver stops offscreen frames; Page Visibility and route state
  stop inactive drawing. ResizeObserver redraws even when motion is paused.
- Normal compositing is intentional: desynchronized canvases can disappear from
  screenshots/embedded views after resize, despite containing valid pixels.
- Local Pause/Resume and the header motion control change the same state.
  Reduced-motion preferences pause from the first load and when changed at runtime.
  A visitor can explicitly resume. Controls use native buttons and pressed states.
- Unsupported/blocked canvas retains `public/brand/world-flight-poster.svg`.
  Missing JavaScript still leaves the static globe, text and enquiry CTA visible.

## Geography and attribution

`world-land.js` contains 2,459 sampled land points derived from Natural Earth's
public-domain 1:110m land polygons, not invented continent silhouettes.
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson

Sampling uses an equal-area Fibonacci sphere and point-in-polygon land inclusion.
No political boundaries, sensitive user locations or visitor tracking are used.
Coimbatore's approximate 11.0168°N, 76.9558°E origin is illustrative, not a live GPS
fix. The fallback SVG uses the same points and orthographic projection. The small
local assets need no map licence key, network calls or runtime geolocation.

## Verification

With the site running:

```bash
npm run test:world
# Production or another local address:
TEST_URL=http://localhost:4173 npm run test:world
```

The browser suite verifies a full front/back/front orbit, phase progression,
identical paused canvas pixels, shared control state, hidden-tab/route/offscreen
suspension, reduced-motion on first load and preference change, planner launch and
canvas-unavailable SVG fallback. It checks document/globe bounds and rendered
pixels after resize at 320, 360, 390, 768, 820, 1024, 1280, 1440 and 1920px widths,
plus 844×390 landscape. Representative screenshots are written to ignored `.cache/`.
These are emulated browser layouts, not a guarantee of every physical device/OS.

`npm test` also runs the existing journey, logo, enquiry, video-once, secure-admin
and contact suites. `npm run build` verifies production bundling.
