"""
Convert the variable woff2 fonts shipped in node_modules into TTFs that Pillow
(and therefore the video renderer) can read.

    pip install --break-system-packages fonttools brotli
    python3 scripts/make-font-ttf.py
"""
import os
from fontTools.ttLib import TTFont

OUT = os.path.expanduser('~/.cache/fonts')
os.makedirs(OUT, exist_ok=True)

PAIRS = [
    ('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2', 'Fraunces.ttf'),
    ('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2', 'Fraunces-Italic.ttf'),
    ('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'Manrope.ttf'),
]

for src, name in PAIRS:
    f = TTFont(src)
    f.flavor = None
    dst = os.path.join(OUT, name)
    f.save(dst)
    print('wrote', dst)
