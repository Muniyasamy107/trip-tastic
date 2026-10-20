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

The original logo, selected real YouTube film and once-only player behaviour,
React/GSAP/Three Fiber/Lenis/Framer experience, enquiry flow and Owner Studio are
preserved. No new film or genuine 8K playback is claimed. The collection visibly
discloses that landscape/stay imagery is AI-created inspiration, not verified
locations or confirmed properties.

See **[Art direction](docs/ART-DIRECTION.md)** and
**[Editorial imagery provenance](public/media/EDITORIAL-IMAGERY.md)**.
`npm run test:art-direction` is included in `npm test` and covers image payloads,
responsive-source selection, seven layouts, desktop card spans and disclosure.

## Run locally

Requires **Node 22.13+** (tested on 22.22). Node 22 may print an informational
`ExperimentalWarning` for its built-in SQLite module.

```sh
npm ci
npm run dev -- --port 5173
```

Vite's middleware runs the enquiry API on the **same origin** as the website.
There is no browser-facing localhost API URL or external font service. The header
embeds the selected YouTube film without needing a video download/upload. The server binds to `0.0.0.0` and permits Arena's
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
- `HERO_FILM_PROVIDER`: defaults to `youtube`; `local` explicitly enables legacy media mode.
  PowerShell: `$env:HERO_FILM_PROVIDER="local"`; Bash: `HERO_FILM_PROVIDER=local npm run dev`.
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
  changes), a single user-selected YouTube player with offscreen pausing and an enlarged
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

### Selected YouTube header — no download or upload required

The full-bleed header now embeds the user-selected film:
**[South India – 4K Scenic Nature Drone Relaxation Film](https://www.youtube.com/watch?v=9AJGRwIo66I)**
by **The Indian Ambience**, using the official YouTube IFrame API and a
`youtube-nocookie.com` player. The source description identifies scenic drone footage from Southern India.
It is not a Trip-Tastic commission or endorsement; visible credits reflect the
new source. The approximately **4:11:22** film replaces the prior New Zealand selection.
Source/provenance: [`public/media/YOUTUBE-SOURCE.md`](public/media/YOUTUBE-SOURCE.md).

The opening still is the official YouTube thumbnail, served from `i.ytimg.com`,
not the previous New Zealand screenshot. This thumbnail request occurs on page
load, including reduced-motion and completed-tab views; it is disclosed separately
from API/player loading in the privacy panel. The real film is not downloaded, copied into Git, extracted or
re-hosted. Its ID is fixed in `film-source.js`; no arbitrary embed URL is accepted.
`/api/hero-film` defaults to that YouTube source, even if an old local MP4 exists.

The dark emerald/champagne styling and original logo are retained. The background
iframe covers the whole header responsively with a modest 4% cover margin. A lighter
emerald overlay plus **brightness(1.16)** on the background iframe makes the film
brighter; the enlarged player stays unfiltered and shows the uncropped player canvas.

**Resolution is not fabricated:** the creator titles this source **4K**, not 8K.
No 8K stream has been verified. The app does not use ineffective/deprecated quality
forcing parameters or claim that CSS brightness creates 8K detail. YouTube chooses
adaptive quality; the enlarged player's native Settings menu allows the highest
quality actually offered on that browser/device/connection. Native 8K requires an
actual 8K source plus compatible YouTube playback and sufficient bandwidth.
A single iframe stays inside the **same dialog and stage**: switching its dialog
between nonmodal-background and native-modal presentation never reparents/reloads
that browsing context. Closing the enlarged view preserves its position.

Muted autoplay is attempted when the hero is visible and motion is enabled.
Offscreen/route changes, pause-motion and document hiding pause playback. Reduced
motion initially defers loading the provider entirely until an explicit play or
motion-enable action. If autoplay is blocked, the visible film button lets the
user try playback. If API loading/embedding fails (including owner restrictions),
the official thumbnail, useful status message and **Watch on YouTube** link remain.
YouTube branding, ads and provider restrictions cannot be guaranteed away.

Once the film ends, the iframe is destroyed and completion is stored for this
source revision in session storage. The official thumbnail is shown (YouTube does not
allow canvas final-frame capture). Reloading the completed tab does not load the
API or embed again. Motion toggles, enlargement, scrolling and navigation do not
reset completion. A new tab/source revision can play again; blocked storage means
only the in-memory guard can be guaranteed. Provider-internal requests, thumbnail requests, ads,
manual native controls and playback policies remain YouTube-controlled.

Embedding contacts Google/YouTube services. Privacy-enhanced mode is **not** a
promise of no tracking/storage. This is disclosed in the site's privacy panel.
Before launch, confirm promotional embedding/branding rights with the owner;
a shared link is not permission to download or republish a copyrighted film.

The source watch page and YouTube oEmbed endpoint were checked successfully, but
live streaming from the deployment domain cannot be verified in the restricted
coding environment. `npm run test:youtube` uses an isolated mocked provider API
and iframe, plus a labelled synthetic thumbnail, **never claiming that a synthetic fixture is the real film**. Test
actual playback, browser autoplay and any regional/owner restrictions before launch.

#### Legacy self-hosted/stock mode (not the selected YouTube header)

Set `HERO_FILM_PROVIDER=local` on the server to explicitly opt into the older local
MP4/Pexels controller. A local `public/media/hero-road-trip.mp4` takes priority in
that mode; otherwise the fixed prior Pexels source is used. The existing optional
`npm run media:download` command downloads **only that older licensed Pexels clip**,
never this YouTube film. Do not run it expecting to obtain the selected film.
Legacy provenance: `public/media/FOOTAGE-LICENSE.md`. Never substitute the isolated
player test fixture into public/ or dist/. If changing sources, update visible
credits/poster and verify rights; the production default should remain YouTube
for the current requested design.

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
