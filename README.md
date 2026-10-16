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
streams its fixed licensed Pexels film unless you install it locally with
`npm run media:download`. The server binds to `0.0.0.0` and permits Arena's
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
  changes), a single licensed-footage player with offscreen pausing and an enlarged
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

### Real filmed header — Kerala tea-country driving

The header now streams **“A Jeep Moving on the Road” by Syam Krishnan / Pexels**
(clip 9117219), a landscape driving film with Kerala/Munnar publisher metadata.
It is not the rejected photo/car-cutout animation. The poster is an actual preview
of that film, and the full-bleed layout covers the entire header on desktop and phones. Dark emerald
gradients, champagne-gold accents and oversized editorial typography provide the
royal presentation without replacing the filmed movement with animation. Landscape
footage uses responsive cover cropping on narrow screens. A slim progress line
tracks the same single film.

Source and licence: [`public/media/FOOTAGE-LICENSE.md`](public/media/FOOTAGE-LICENSE.md).
This is non-exclusive licensed stock, not a commissioned/exclusive shoot. Its
location is publisher-labelled, not independently GPS-verified. Visible source
credit, licence context and external-CDN privacy disclosure are included.

**It works without a manual MP4 install:** `/api/hero-film` returns the exact fixed
Pexels CDN URL from `film-source.js`. Browser network access to videos.pexels.com
is required. The repository does not contain a fake or unlicensed substitute MP4.
If media fails, the real film’s still remains and the film button is hidden.

For production, self-host the clip instead of depending on third-party availability:

```bash
npm run media:download
npm run build
npm start
```

The optional downloader validates the MP4 container, caps the file at 100 MB, saves
atomically and **never overwrites or re-downloads an existing film**. Downloads are
Git-ignored; include the media in your deployment artifact/storage. The API prefers
`public/media/hero-road-trip.mp4` (or `dist/media/hero-road-trip.mp4` in production).
An owner replacement must have checked rights/location and updated poster/credits.
Do not replace the installed stock film with the test fixture.

There is exactly **one** video element. Enlargement moves that element without
rewinding. It plays once and stops; scrolling, navigation, dialog close and motion
toggles cannot restart it. Completion is stored per revision in session storage:
refreshing the completed tab makes **no new movie request**. A final frame is cached
where canvas security permits; cross-origin streaming can fall back to the real
opening still after refresh. If session storage is blocked, the in-memory guard
still prevents replay on the current page. A new tab or genuinely changed source
revision can play once again. This is not a permanent per-person playback ban.

The restricted development environment cannot independently play/download the
external CDN film. Tests intercept the **exact configured stock URL** with an
isolated synthetic chart to verify playback, once-only state, and no repeated
request on reload. They do not establish live third-party CDN availability or
film picture quality. Verify actual footage in an internet-connected browser;
`npm run media:download` allows fully local playback there.

Other destination/editorial images remain AI-created mood visuals, not proof of an
exact property, vehicle, included activity or destination view. The Visuals &
Transparency panel explains the distinction.

Manrope and Cormorant Garamond fonts are self-hosted under the SIL Open Font
License. Their licences are in `public/fonts/`.

## Verification

With the dev server running:

```sh
npm test
npm run build
```

For the production server: `TEST_URL=http://localhost:3000 npm test`.

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
