# Player regression fixture

`player-test.mp4` is an original, synthetic FFmpeg `testsrc2` colour-chart clip
(160×90, 24 fps, 15 seconds). It is not real road footage and is never deployed
under `public/` or selected as the site's hero video.

The browser tests intercept both the self-hosted URL and exact configured stock CDN URL to exercise playback, missing
footage, no-loop behaviour, player reparenting and final-frame persistence without
requiring external network access. This verifies the player integration, not live
CDN availability or the stock film’s visual content. Test film-installer checks
also use this fixture privately, never copying it into public/ or dist/.
