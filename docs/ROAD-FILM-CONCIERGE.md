# Road-film hero and private enquiry desk

Current edition: 20 October 2026. The owner explicitly selected the curated real
hill-road stock-film option instead of supplying another YouTube link or MP4.
This supersedes earlier documents saying the YouTube film is the default.

## The actual film source changes

`/api/hero-film` now defaults to native/local delivery: the exact installed
`public/media/hero-road-trip.mp4`, if present/non-empty, otherwise the fixed
Pexels 9117219 MP4 by Syam Krishnan. See `public/media/FOOTAGE-LICENSE.md`.
Publisher metadata: 1920 × 1080, 25 fps, about 9 seconds, Kerala/Munnar tags.
Location is not independently GPS verified. It is non-exclusive real stock, not
an AI car animation, exclusive Trip-Tastic commission or endorsement.

The HTML now starts with the **same clip's locally served preview**, not the
previous YouTube thumbnail. Visible credits, byline, transparency and privacy
copy match the new provider. No default YouTube/Google thumbnail/player request
is needed. The previous selection remains explicitly available through
`HERO_FILM_PROVIDER=youtube`; its provider adapter updates its poster/credit and
continues using one persistent iframe. It is not a silent fallback.

The native player keeps one video element across the hero and full-view dialog,
full-cover responsive geometry, no loop, session-completion guard and neutral
expanded playback. Background-only CSS uses a subtle brightness/saturation lift;
no 4K/8K detail is invented. After completion, the current final frame remains;
a safe captured frame or source preview is used on reload, without requesting
and replaying a completed clip in the tab. External-origin frame capture may be
blocked by canvas security, which is handled without losing completion state.

Reduced motion initially defers the MP4 request until explicit film opening or
motion enablement. Route/offscreen/hidden-tab/global-pause controls still apply.
The film additionally pauses behind planning/privacy dialogs and resumes only
when its existing lifecycle permits. Browser autoplay denial offers the visible
Play the film button; a network/media error keeps the real source still and a
useful source link/status, not fake motion. An unavailable stream cannot be
promised away by interface styling.

The sandbox cannot independently play/download the external CDN source. Browser
tests intercept its exact URL with a synthetic fixture kept out of public/dist.
These verify source wiring and state, **not** the source film's current visual
quality, availability, physical-device performance or licence changes. Check the
real clip in an internet-connected browser before public launch. The source
preview is 500 × 281; the film's published 1080p metadata is not the still's size.

## A private enquiry desk

`concierge.css` styles the existing native dialog as a warm-ivory/petrol/champagne
planning desk. Desktop uses a sticky photographic side panel and live brief;
phone uses a compact image header and scrollable, large-control form. The original
logo appears in the main panel. The selected journey changes the local image and
text preview. Images remain AI-created mood references with a visible caveat;
they are not a confirmed stay, supplier, location photo or booking inclusion.

`concierge.js` is presentation-only. It updates date/traveller/budget/pace summaries
using `textContent`, supplies the existing authored responsive image candidates,
and follows the existing wizard step. It does not submit, store private field
values in additional browser storage, or introduce a separate customer database.

- Same three steps and field names, required constraints, per-person budget and
  final explicit contact/storage consent. WhatsApp remains separately optional.
- Actual step meter with `aria-valuenow` and a polite status, not fake loading.
- Step-three review with Edit journey details preserving entered preferences.
- Clear 52px fields, 44px close control, mobile 16px field typography, native
  calendar/selects, focus treatment, progressive entrance and reduced-motion mode.
- Existing real pending spinner, disabled submission guards and API retry retain
  their behaviour. A server error retains entered details.
- Confirmation includes the actual returned reference, explicit next steps,
  reference-copy action with honest clipboard-denied fallback and brief download.
  No payment, instant availability, booking confirmation, promised response time
  or automatic email delivery is fabricated.

The original authenticated Owner Studio, enquiry consent/inbox, manual email /
WhatsApp drafts, pricing and owner contacts are unchanged.

## Tests and operations

`npm run test:concierge` is included in `npm test`. It checks the actual default
metadata, no YouTube host requests, native one-player/full-view/modal lifecycle,
no-loop/session reload, reduced-motion source deferral, network and autoplay
recovery, dynamic preview/summary, three-step progress and review/edit, mocked
API failure/retry/receipt/copy success and denial, and six dialog viewports from
320 to 1440px including landscape. It makes no real enquiry or outgoing message.
The rest of the full suite retains real API/SQLite/admin and existing React/motion
regression coverage. `TEST_URL=http://localhost:4173` tests the built production.

Ignored `.cache/concierge-*` captures were visually reviewed. Hero screenshots in
reduced-motion mode show the real source **preview still**, not proof of live
video. Informational Node SQLite and lazy Three chunk-size warnings remain.

Local setup requires Node 22.13+: `npm ci`, then `npm run dev -- --port 5173`.
For production run `npm run build`, then `PORT=4173 npm start` (PowerShell:
`$env:PORT=4173; npm start`). To install the exact stock film locally, run
`npm run media:download` on an internet-connected machine and rebuild. The MP4
remains Git-ignored and should deploy through the host's media/artifact storage.
Changing to unrelated owner footage needs matching poster, metadata and rights
review; do not mislabel another file as the selected Pexels source.
