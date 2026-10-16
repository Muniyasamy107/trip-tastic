# Player regression fixture

`player-test.mp4` is an original, synthetic FFmpeg `testsrc2` colour-chart clip
(160×90, 24 fps, 15 seconds). It is not real road footage and is never deployed
under `public/` or selected as the site's hero video.

The browser tests intercept the owner-footage URL to exercise playback, missing
footage, no-loop behaviour, player reparenting and final-frame persistence without
requiring or misrepresenting a real licensed travel clip.
