# Selected real road-trip footage — Syam Krishnan / Pexels

On 20 October 2026 the owner chose the curated real hill-road stock-film option.
The default native mode uses an installed copy of this exact source, otherwise
the fixed CDN URL below. The previous YouTube selection is opt-in only through
`HERO_FILM_PROVIDER=youtube`; see `YOUTUBE-SOURCE.md`. Source/licence review dates
below refer to the earlier research, not a claim of newly verified live playback.

- Title: A Jeep Moving on the Road
- Filmmaker: Syam Krishnan (@adifferentmallu)
- Publisher / clip: Pexels, 9117219
- Source: https://www.pexels.com/video/a-jeep-moving-on-the-road-9117219/
- Creator: https://www.pexels.com/@adifferentmallu/
- Licence: https://www.pexels.com/license/
- Source and licence reviewed: 17 October 2026
- Source metadata: 1920 × 1080, 25 fps, approximately 9 seconds; published 9 August 2021.
- Location basis: the publisher's Kerala/Munnar filename and tags, not independently geolocated survey data. Do not represent this as a verified GPS shooting point.
- Fixed MP4 URL, published in the source page's edit-in-Canva link:
  https://videos.pexels.com/video-files/9117219/9117219-hd_1920_1080_25fps.mp4
- `hero-road-trip-poster.jpg` is the publisher's preview of that same clip, retrieved via image search (500 × 281). It is not an AI replacement or a fabricated car composite.

The reviewed Pexels licence permits free website/commercial use and modification;
attribution is optional, but the site credits the filmmaker and links to the source.
This is NON-EXCLUSIVE licensed stock, not a commissioned/exclusive Trip-Tastic shoot
and not an endorsement by Pexels, the filmmaker or a visible vehicle manufacturer.
Do not resell/redistribute the unaltered clip as a stock product or imply endorsement.
Review the full linked licence before any new use.

Default native mode falls back to browser-side streaming of this exact CDN URL. No MP4 binary is
committed. For self-hosting, run `npm run media:download` locally before building.
It downloads this source once, validates the MP4 container and preserves any existing
`public/media/hero-road-trip.mp4` without re-downloading or overwriting it.
The API prefers that local file. `npm run build` then copies it into dist/media.
The downloaded film is Git-ignored to keep large binaries out of the source repository.
Back it up/deploy it through your hosting's media/artifact storage.

The restricted coding sandbox cannot download or independently play the third-party
MP4. Automated playback tests intercept its exact URL with a synthetic test fixture;
these verify integration/state, NOT the stock clip's picture quality or current CDN
availability. Check real playback in an internet-connected browser before launch.

Replacing the film with a different owner clip requires fresh rights/location checks,
updated poster and visible credits. Other destination imagery is separately disclosed
as AI-created mood imagery in the site's Visuals & Transparency panel.
