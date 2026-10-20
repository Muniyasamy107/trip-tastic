# Trip-Tastic Holidays — The Personal Edit

A complete, responsive South India travel website with a petrol / champagne / warm
ivory design system, original photoreal creative imagery, cinematic motion and a
working server-backed journey-enquiry flow. Built with Vite, React, React Three
Fiber / Three.js, GSAP/ScrollTrigger, Lenis, Framer Motion and Node's SQLite
database. The new luxury experience uses React islands; existing public routing,
forms and secure Owner Studio are preserved rather than misleadingly claiming a
complete React rewrite of every page.

## South India Atelier visual refresh

The cinematic presentation now has a “Beautifully / elsewhere.” full-cover film
hero, warm ivory/champagne/deep-petrol art direction, alternating asymmetric
editorial collection and refined finder, process, journal and contact/footer UI.
Four new AI-created destination moods complement the retained Munnar/Kerala
images: all six journey cards have distinct visuals. Responsive 640/960/1264px
WebPs avoid requiring the full master on every small-screen view.

The original logo, real-film once-only player behaviour,
React/GSAP/Three Fiber/Lenis/Framer experience, enquiry flow and Owner Studio are
preserved by that visual refresh. The current hero source is documented below; no genuine 8K playback is claimed. The collection visibly
discloses that landscape/stay imagery is AI-created inspiration, not verified
locations or confirmed properties.

See **[Art direction](docs/ART-DIRECTION.md)** and
**[Editorial imagery provenance](public/media/EDITORIAL-IMAGERY.md)**.
`npm run test:art-direction` is included in `npm test` and covers image payloads,
responsive-source selection, seven layouts, desktop card spans and disclosure.

## Premium hover, depth and micro-interactions

The Tactile Atelier layer adds photo-frame perspective tilt and light reflection,
a mouse-follow view cue, anchored magnetic button icons, CTA ripple, save/compare
feedback, FAQ/page/image entrances, real loading states and a short non-blocking
original-logo welcome. Original procedural contour artwork and soft light drift
behind selected editorial sections. Existing cinematic destination images remain.

Mouse-only effects are desktop/fine-pointer only; touch, keyboard, reduced motion
and global pause retain usable static controls. Backgrounds suspend offscreen and
behind modals, while the real enquiry-saving spinner follows the actual busy
state. The film and React-owned transforms are never reused as hover surfaces.
No new runtime dependency is needed. See **[Tactile Atelier](docs/ATELIER-MOTION.md)**.
`npm run test:atelier` is part of the full test suite.

## Run locally

Requires **Node 22.13+** (tested on 22.22). Node 22 may print an informational
`ExperimentalWarning` for its built-in SQLite module.

```sh
npm ci
npm run dev -- --port 5173
```

Vite's middleware runs the enquiry API on the **same origin** as the website.
There is no browser-facing localhost API URL or external font service. The header
streams the selected real Pexels road-trip film, or uses an installed copy of that exact source. The server binds to `0.0.0.0` and permits Arena's
`.e2b.app` preview hosts.

## Super Admin / Owner Studio

The private dashboard is **`/admin.html`**, with consented enquiry inbox,
email/WhatsApp reply drafts, editable journey price ranges, business contact
settings and password/session management. Anonymous visitors' emails cannot be
identified; only submitted enquiries appear. Messages open your own apps and must
be sent there manually—there is no automatic delivery service.

```bash
npm run admin:setup       # run once in your private terminal
# Username: superadmin; unique password is printed once (never hard-coded).
npm run dev -- --port 5173
```

Open http://localhost:5173/admin.html and use the generated credentials. No live
owner account or shared password is shipped. Recovery: `npm run admin:setup -- --reset`.
Setup must run against the same private `DATA_DIR` as your server. Prices/contact
links persist in SQLite and refresh publicly on reload/focus. **Social & contact**
lets you edit call, email, WhatsApp and Instagram channels. Owner-supplied defaults:
**+91 73032 15348**, **triptasticholidays1430@gmail.com** and
**https://www.instagram.com/triptastic_holidays_/**. Tap-to-call is available in the
header and footer; email opens an email app. Calls/emails are not automatically
placed/sent; desktops require a suitable configured app. Existing owner edits and
intentional cleared fields are preserved. The supplied contacts remain the static
HTML fallback if settings cannot load.

Responsive contact checks: `npm run test:contacts` (running app required), covering
10 phone/tablet/laptop/desktop/landscape viewports, 320–1920px widths. These are
browser-emulated layouts, not a guarantee of every physical device/OS.

Full setup/security/messaging/deployment guide: **[docs/ADMIN.md](docs/ADMIN.md)**.

## Production

```sh
npm run build
npm start                 # http://0.0.0.0:3000
# PORT=8080 npm start     # optional
```

`server.mjs` serves the production build and API together, including byte-range
requests for video. Deploy the **Node application**, not just `dist/`, if you want
the enquiry form to work. Use HTTPS through your hosting provider/reverse proxy.

Optional environment variables:

- `PORT`: production HTTP port (default `3000`).
- `HERO_FILM_PROVIDER`: defaults to `local` (installed exact MP4, otherwise fixed Pexels CDN).
  `youtube` explicitly opts into the previous selection. PowerShell: `$env:HERO_FILM_PROVIDER="youtube"`; Bash: `HERO_FILM_PROVIDER=youtube npm run dev`.
- `DATA_DIR`: persistent private database directory (default `.data/`).
- `PUBLIC_ORIGIN`: the canonical full website origin, if different from the
  incoming Host header behind your proxy.
- `TRUST_PROXY=1`: only when your own trusted proxy sanitises `X-Forwarded-For`;
  enables client-IP-based rate limiting behind that proxy.

Mount `DATA_DIR` on a persistent volume and include it in private backups. Do not
put it in Git, a public bucket, or the static `dist/` directory. The application
creates a private directory and uses SQLite WAL mode. This is a small-business,
single-server backend; scale-out needs shared storage or a managed database.

## What works

- Six curated journeys, with landscape filters, free-text place search, duration
  finder, sorting, results count and a useful empty state.
- Shareable hash-route journey pages, day-by-day expandable itineraries,
  keyboard-accessible inclusion tabs and itinerary downloads.
- Saved journeys persisted on the visitor's device.
- Side-by-side comparison of two or three journeys, with a three-item limit.
- Three-step personalised enquiry form with consent, accessible validation,
  loading/error states and real SQLite persistence.
- A server-generated enquiry reference and downloadable personal journey brief.
- Duplicate protection for identical requests within ten minutes.
- Three readable journal pages and a persistent interactive packing checklist.
- Responsive navigation, native focus-trapping dialogs, nested privacy details,
  Escape dismissal, meaningful empty/error/404 states and keyboard focus styles.
- GSAP headline entrances and scroll reveals,
  image/CTA interactions, route tracing, rotating seal, marquee and scroll progress.
- Decorative-motion pause/play, reduced-motion preferences (including live
  changes), a single real-road-film player (optional YouTube mode) with offscreen pausing and an enlarged
  view. A supplied film plays once; it is not looped or duplicated.

## Enquiries: real storage, not a simulated success screen

`POST /api/enquiries` validates the request, requires consent and stores accepted
requests in `.data/enquiries.sqlite`. Public read endpoints are `GET /api/health`
and `GET /api/hero-film` (film availability only). `GET /api/site-settings` exposes
only published prices and business social links. `/api/admin/*` is the private
authenticated owner API; mutations require Origin and CSRF checks. **There is no public enquiry-list or personal-data retrieval API.**

Protections include same-origin checks, JSON-only POSTs, a 16 KB body limit,
server-side field/date/party-size validation, a honeypot, request rate limits,
parameterised SQL, duplicate detection and non-cacheable API responses.

### Owner access

Use server-shell access; enquiry data is intentionally not behind an unprotected
web admin page:

```sh
npm run enquiries              # latest 100 records, private console table
npm run enquiries -- --json     # full details, private JSON output
```

Protect shell access and any exported files. Database deletion/retention is an
owner responsibility; establish a policy before receiving real customer data.

## Important business boundaries before public launch

The enquiry workflow is working, but this is **not an instant booking/payment
engine**. A request records travel preferences; it does not reserve rooms,
vehicles or tickets. No supplier inventory or live prices are invented.

The displayed budgets are authored **indicative planning ranges**, not verified
supplier rates or offers. The UI, receipts, FAQ and planning terms make that clear.

Automatic email/WhatsApp delivery and payments are **not connected**. To launch
publicly, the business owner must supply/approve:

1. Verified business contact details and final marketing copy.
2. Actual supplier-approved prices, inclusions and availability, if advertised.
3. A mail/CRM provider and sender configuration if automatic notifications are
   required. Never put provider secrets in browser code.
4. Final booking/payment/cancellation terms and a legal privacy notice, including
   retention and a verified contact for data-access/deletion requests.
5. Production HTTPS, private backups, access controls and monitoring.

No fabricated reviews, customer counts, certifications or "world #1" claims are
used. The original provided logo remains in the repository and About section.

## Visuals and transparency

### React luxury experience — requested technology stack

| Technology | Actual use |
| --- | --- |
| React + Vite React plugin | Lazy homepage component boundaries; existing secure owner/API flows retained |
| Three.js + React Three Fiber | Real WebGL2 globe, geographic dot mesh, extruded orbiting airplane, floating metallic objects, drag/keyboard/reset controls |
| GSAP + ScrollTrigger | Desktop pinned **Private Edit**, image zoom/crossfade, chapter progress and existing editorial choreography |
| Lenis | Desktop smooth-wheel interpolation synchronized with the GSAP ticker; native touch/keyboard/dialog behavior |
| Framer Motion | React chapter caption fade/slide/reveal and AnimatePresence transitions |

Open `/#world-of-wonder` for the globe, or `/#luxury-chapters` for the three-scene
**Private Edit** (Hills / Waters / Quiet). Pinning is restricted to wide, tall
screens with motion enabled. Mobile/tablet use unpinned chapter buttons. Public
price overrides, journey links, enquiry consent, contacts, logo and once-only hero
film are unchanged.

React/Framer and the Three renderer are loaded on approach, not over the opening
hero. Three/R3F do not load on an initially reduced-motion visit unless the visitor
explicitly resumes. The GPU loop pauses when offscreen, inactive, hidden or behind
a dialog. WebGL failure/context loss falls back to the previous Canvas 2D globe;
a blocked canvas retains the local SVG. No external map, model, HDR or flight API.

The Three engine remains a large **lazy** chunk (Vite's >500KB warning is expected,
not suppressed). Production static JS/CSS/SVG delivery now supports gzip; private
API responses are not compressed. `test:delivery` checks actual gzip bytes,
HEAD/q=0/ranges and compressed entry/engine budgets. See **[docs/REACT-LUXURY.md](docs/REACT-LUXURY.md)**.

### Cinematic scrolling and rotation

The homepage now layers masked, line-by-line titles; perspective-staggered journey
cards; a reversible scroll-linked **Take the long way** type band; traced travel
line; and a rotating travel compass whose needle follows the scroll position.
Editorial manifesto/closing images have restrained depth/parallax; the original
hero video/iframe is **not** transformed, recropped, replaced or restarted by these
effects. Existing editorial sections stay unpinned. Lenis interpolates desktop
wheel scrolling; touch, keyboard and dialogs stay native. Only the dedicated
React Private Edit uses desktop pinning.

Header/globe motion controls pause the same choreography. Reduced motion keeps
text readable and images neutral; hidden tabs and non-home routes release the
scroll scenes, and decorative rotors run only in view. Motion resources are
cleaned up when filters rerender or routes change. See **[docs/MOTION.md](docs/MOTION.md)**.
Run `npm run test:cinematic` against the running app (`TEST_URL` supported).

### Smooth world-flight animation

The **One world. Endless wonder.** section, immediately below the journey finder,
contains a locally drawn emerald/gold globe and an airplane that continuously
orbits in front of and behind it. Use the hero’s **A WORLD OF POSSIBILITY** link or
open `/#world-of-wonder`. The globe rotates independently with geographic land dots,
a subtle South India marker, orbital trail and tangent-aligned aircraft.

Local and header pause/resume controls stay synchronized. Offscreen sections,
background tabs and non-home routes stop drawing. Reduced-motion preferences show
a still globe by default; the visitor can explicitly resume. Canvas-unavailable
browsers retain a local SVG illustration. WebGL2 enables the interactive React
globe; the Canvas/SVG fallback does not require it. No external map or flight API
is used; this is an illustration, not live flight data or a worldwide-service claim.

Geography uses public-domain **Natural Earth 1:110m land** data, sampled into
`world-land.js`; source: [Natural Earth land GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson).
The design preserves the original logo, contact/admin flows and once-only hero film.
See **[docs/MOTION.md](docs/MOTION.md)** for controls, rendering and verification.
`npm run test:luxury` checks the real React/WebGL experience.
`npm run test:world` explicitly blocks WebGL and checks the full fallback orbit,
pause/resume, pixel persistence on resize,
fallback and 10 responsive viewports against the running app.

### Current road-film hero and private enquiry desk

The owner selected the curated real hill-road film option on 20 October 2026.
The default header now uses **[A Jeep Moving on the Road](https://www.pexels.com/video/a-jeep-moving-on-the-road-9117219/)**
by **Syam Krishnan / Pexels**: published 1920 × 1080, 25 fps, about nine seconds.
It is genuine non-exclusive stock, not an AI car composite or brand commission.
Kerala/Munnar tags are publisher metadata, not independently verified GPS data.

`/api/hero-film` defaults to the installed exact `hero-road-trip.mp4`, if present,
otherwise the fixed Pexels CDN URL. The locally served source preview replaces the
old YouTube thumbnail. The full-cover film plays **once**, reuses the same native
video in full view, pauses offscreen/behind dialogs/in hidden tabs, and remembers
completion in session storage. Reduced motion defers the MP4 request until
explicit play or motion enablement. Browser-denied autoplay has a gesture path;
network/media failure keeps the real source still, useful status and source link.
The background has a modest colour/brightness treatment; full view is neutral.
No genuine 4K/8K, universal availability or physical-device performance is claimed.

To install the exact source locally, run `npm run media:download` on an
internet-connected machine and rebuild. The MP4 is Git-ignored: deploy it through
media/artifact storage. The sandbox cannot verify live CDN playback; automated
tests intercept the exact URL with a labelled test fixture that is never shipped.
See [footage provenance](public/media/FOOTAGE-LICENSE.md) and review the linked
Pexels source/licence before launch.

The previous **South India** film by **The Indian Ambience** remains opt-in through
`HERO_FILM_PROVIDER=youtube`, with matching credits/poster, one persistent iframe,
non-looping/session-completion controls and YouTube's native quality selection.
It is not downloaded or silently substituted. Creator-labelled 4K is not verified
8K. YouTube controls branding, embedding and availability; see
[optional YouTube provenance](public/media/YOUTUBE-SOURCE.md).

The enquiry is now a **private planning desk** with responsive image preview,
live date/party/budget summary, actual three-step progress, review/edit controls,
large touch-friendly fields, API-driven retry/success, copyable reference and clear
next steps. It preserves the existing consent, optional WhatsApp permission,
server-backed inbox and secure Owner Studio. No payment, automatic email delivery
or booking confirmation is implied.

See **[Road film & concierge](docs/ROAD-FILM-CONCIERGE.md)**.
`npm run test:concierge` is included in the full test suite.

Other destination/editorial images remain AI-created mood visuals, not proof of an
exact property, vehicle, included activity or destination view. The Visuals &
Transparency panel explains the distinction.

Manrope and Cormorant Garamond fonts are self-hosted under the SIL Open Font
License. Their licences are in `public/fonts/`.

## Verification

With the dev server running (the YouTube suite mocks the provider, not live streaming):

```sh
npm test
npm run build
```

For the production server: `TEST_URL=http://localhost:3000 npm test`.

The separate YouTube suite verifies the selected ID/origin/referrer, single persistent
iframe, modal position preservation, full-cover bounds, motion/route pausing,
scroll unlocking, completion/no repeated embed on reload, reduced-motion deferral,
autoplay-blocked recovery, embed denial and network failure. It mocks the provider
and does not claim live streaming verification. Run it alone with
`npm run test:youtube`.

The browser/API suite uses a small synthetic colour-chart fixture (intercepted
in browser tests only, never deployed as hero footage) to check video playback,
no-loop behaviour, a single shared player, session persistence, fixed CDN-source
allowlisting, local-file preference and the network-failure fallback; filters/search/sorting/finder;
save persistence; comparison limits; route pages; keyboard tabs; downloads; all
three enquiry steps; **the actual saved SQLite record**; nested dialogs; journal;
packing persistence; motion controls; responsive widths (360/390/768/1440); mobile
navigation; reduced motion; a missing route; validation, origin/body-size checks,
idempotency and the absence of a public personal-data API. QA records use reserved
`example.test` addresses and are removed after the test.

`npm run test:admin` uses a separate temporary database to test owner bootstrap,
login/session/CSRF/rate controls, price/settings edits, public propagation,
consent-aware enquiry inbox/contact drafts, deletion/password rotation and
responsive owner UI without seeding a real account or sending messages.

`npm run visual:check` creates ignored desktop/mobile screenshots for review.
The browser helper uses npm-distributed Chromium and its bundled Linux libraries;
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can override the executable.

## Original logo placements

The supplied `trip-tastic-logo.jpeg` is used, uncropped and without colour filters,
in the desktop/mobile/sticky header, footer, About section, enquiry planner and
receipt area, and cinematic player branding. Browser favicons, Apple/home-screen
icons, web-app manifest icons and the share-preview image are generated from the
same original artwork, rather than the former generic road icon. Regenerate them
with `.venv/bin/python scripts/brand-assets.py` (Pillow required).
