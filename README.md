# Trip-Tastic Holidays — The Personal Edit

A complete, responsive South India travel website with a petrol / champagne / warm
ivory design system, original photoreal creative imagery, cinematic motion and a
working server-backed journey-enquiry flow. Built with Vite, vanilla JavaScript,
GSAP/ScrollTrigger and Node's SQLite database.

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
and `GET /api/hero-film` (film availability only). **There is no public enquiry-list or personal-data retrieval API.**

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

### Selected YouTube header — no download or upload required

The full-bleed header now embeds the user-selected film:
**[Above & Beyond – Landrover New Zealand 4K](https://www.youtube.com/watch?v=AXvVH8CeViI)**
by **Jason Charles Hill**, using the official YouTube IFrame API and a
`youtube-nocookie.com` player. The source description identifies New Zealand and
Landrover as the client. It is **not South India footage**, a Trip-Tastic commission,
or an endorsement. Visible credit and location labels reflect this distinction.
Source/provenance: [`public/media/YOUTUBE-SOURCE.md`](public/media/YOUTUBE-SOURCE.md).

The local opening still is the user's supplied screenshot, with black letterbox
bands removed. The real film is not downloaded, copied into Git, extracted or
re-hosted. Its ID is fixed in `film-source.js`; no arbitrary embed URL is accepted.
`/api/hero-film` defaults to that YouTube source, even if an old local MP4 exists.

The dark emerald/champagne styling and original logo are retained. The background
iframe covers the whole header responsively; mild overscan removes this selected
film's internal cinematic bars. Enlarging shows the full uncropped player canvas.
A single iframe stays inside the **same dialog and stage**: switching its dialog
between nonmodal-background and native-modal presentation never reparents/reloads
that browsing context. Closing the enlarged view preserves its position.

Muted autoplay is attempted when the hero is visible and motion is enabled.
Offscreen/route changes, pause-motion and document hiding pause playback. Reduced
motion initially defers loading the provider entirely until an explicit play or
motion-enable action. If autoplay is blocked, the visible film button lets the
user try playback. If API loading/embedding fails (including owner restrictions),
the supplied still, useful status message and **Watch on YouTube** link remain.
YouTube branding, ads and provider restrictions cannot be guaranteed away.

Once the film ends, the iframe is destroyed and completion is stored for this
source revision in session storage. The supplied still is shown (YouTube does not
allow canvas final-frame capture). Reloading the completed tab does not load the
API or embed again. Motion toggles, enlargement, scrolling and navigation do not
reset completion. A new tab/source revision can play again; blocked storage means
only the in-memory guard can be guaranteed. Provider-internal requests, ads,
manual native controls and playback policies remain YouTube-controlled.

Embedding contacts Google/YouTube services. Privacy-enhanced mode is **not** a
promise of no tracking/storage. This is disclosed in the site's privacy panel.
Before launch, confirm promotional embedding/branding rights with the owner;
a shared link is not permission to download or republish a copyrighted film.

The source watch page and YouTube oEmbed endpoint were checked successfully, but
live streaming from the deployment domain cannot be verified in the restricted
coding environment. `npm run test:youtube` uses an isolated mocked provider API
and iframe, **never claiming that a synthetic fixture is the real film**. Test
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
