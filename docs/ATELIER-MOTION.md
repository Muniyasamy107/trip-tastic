# Tactile Atelier — premium interaction layer

**Current source/UI update:** the later [road-film and concierge edition](ROAD-FILM-CONCIERGE.md)
supersedes earlier references below to the YouTube hero default or older enquiry
presentation. The animation/ownership architecture documented here is retained.

This is a progressive-enhancement layer in `atelier-motion.js` and
`atelier-motion.css`. There are no new runtime dependencies. The existing React /
GSAP ScrollTrigger / Three Fiber / Lenis / Framer experience is retained.

## Designed interactions

| Requested effect | Implementation |
| --- | --- |
| Premium hover | Soft photo highlights, quiet navigation underlines, restrained elevation, social-icon rotation, saved/compare state accents |
| 3D effects | Pointer-driven CSS perspective on photo frames, approximately ±3.5° X / ±4° Y, with existing image zoom; actual React Three Fiber globe/floating objects remain separate |
| Loading animation | Non-blocking original-logo welcome signature, real image-pending shimmer, real enquiry-saving busy spinner |
| Entrance animation | Existing masked GSAP hero/scroll entrances, brief image reveal after load, new bounded journey/article page entrances, FAQ response |
| Micro-interactions | Heart response for save/unsave, cleaned-up CTA ripple, button press, clear selected and keyboard-focus states |
| Background animation | Original procedural contour SVG with a soft drifting light in introduction, process and journal sections |
| Mouse animation | Champagne follow-ring with image-view cue, frame tilt/glare and magnetic CTA icons; native pointer is never hidden |

The design intentionally stays in warm ivory, deep petrol and champagne. The
existing cinematic destination imagery is retained and treated consistently;
there is no noisy particle field, replacement cartoon film or unrelated stock
background. `public/media/atelier-contours.svg` is original procedural decorative
linework, not geographic data, a real map, or evidence of any destination.

## Ownership and performance boundaries

- GSAP owns `.journey-card` reveal transforms. This controller only tilts the
  nested `.card-image` and `.journal-image` frames, never the parent.
- The magnetic effect moves the **icon**, at most about 5px horizontally / 4px
  vertically. The button's actual hit area stays anchored.
- Native mouse cursors, links, focus order, touch scrolling, forms and all
  consent/enquiry semantics are preserved. No click, wheel or key is hijacked.
- A single demand-driven animation-frame request interpolates the follower. It
  sleeps after settling; pointer movement wakes it. It is not an idle page-wide
  render loop. Card geometry is cached for the hover and reset on scroll/resize.
- Long-running ambient CSS transforms and pending-image shimmer run only while
  their observed section/frame is visible and enabled. Three sections get a
  contained decorative layer, not a document-sized effect canvas.
- Temporary Web Animations are bounded and tracked, with timeout cleanup as well
  as completion/cancellation handlers. Filtered-out cards do not retain a hovered
  element, and removed pending-image frames are unobserved.
- HMR disposal aborts delegated listeners, disconnects observers, cancels effects,
  restores pending-image visibility and removes owned decorative elements.

## Loading is honest

The welcome badge lasts at most about 1.5 seconds. It has `aria-hidden` and
`pointer-events:none`: it never intercepts clicks, locks scrolling, waits for an
external video/font, invents a percentage, or implies that a booking is being
confirmed. It does not replay on hash routes or BFCache restoration. Deep links
and reduced-motion/paused starts skip it.

Image placeholders track actual image load/error events, including responsive
candidates and dynamically filtered cards. Errors remove the pending state so a
broken source does not remain permanently invisible behind a loading shimmer.
Loaded-image effects finish without retaining animation overrides on the photo.

The enquiry form now exposes `aria-busy=true` while the existing request is
pending. Its submit/back controls remain disabled by the existing application.
The spinner complements the real “Saving your enquiry…” label; success, failure
and retry still depend on the actual API response, never an animation timer.

## Accessibility and lifecycle

- Mouse-only effects require a fine, hovering pointer and width above 1100px.
  Touch and smaller screens retain normal tap targets without a fake cursor.
- Reduced motion and the site's shared Pause Motion controls stop the new
  decorative effects and preserve readable content/static selected states.
- `data-atelier-motion` gates ambient effects; `data-atelier-pointer` gates mouse
  effects. Both suspend on hidden documents, overlays and pagehide.
- `data-atelier-feedback` separately allows the **functional** saving spinner and
  button feedback inside a modal while background motion is suspended. It still
  respects reduced motion, global pause and document visibility.
- Keyboard navigation removes the follower; native keyboard activation still
  saves/unsaves journeys. Focus rings are visible independently of hover.
- Decorative artwork, cursor, welcome and ripples are hidden from assistive
  technology. This is not a blanket accessibility-conformance certification.

The real hero film/player/source/geometry/once-only behaviour, original logo,
contacts, pricing, secure Owner Studio and enquiry API are unchanged. The image
provenance disclosures remain visible. No new film or genuine 8K is claimed.

## Verification

`npm run test:atelier` is included in `npm test`. It verifies pointer-driven 3D
matrices, glare/follower state, anchored CTA bounds, ripple cleanup, native
keyboard save/unsave, visible/offscreen animation states, pause and modal
suspension, actual image-pending success/error recovery, mocked enquiry busy/error
states, hidden-document handling, route entrance, reduced motion, responsive
fallbacks, isolated controller disposal and a separate touch-browser tap check.
It creates no real customer record or email/WhatsApp message.

Ignored `.cache/atelier-pointer-depth.png`, `atelier-ambient-light.png` and
`atelier-motion-phone.png` provide visual review captures. Offline provider
fixtures are explicitly labelled; they do not verify the live YouTube film.
The existing full suite covers actual WebGL2/R3F interaction, ScrollTrigger,
Lenis/Framer, responsive contacts, owner authentication and enquiry/API behaviour.
Built production can be checked with `TEST_URL=http://localhost:4173` and
`npm run test:delivery` for compressed/lazy-chunk budgets.

Browser emulation is not physical-device or FPS testing. Existing SQLite and
lazy Three chunk-size informational warnings remain documented; no universal
performance guarantee is made.
