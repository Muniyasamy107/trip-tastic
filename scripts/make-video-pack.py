"""
Trip Tastic — video pack generator.

Renders three clips straight from the site's own photography, so the films and
the website stay in sync:

    1. public/video/hero-loop-1080.mp4   1920x1080 · 16s · seamless hero master
    2. public/video/hero-reel.mp4        1080x1920 · 12.8s · Reels / Shorts / Story
    3. public/video/brand-intro.mp4      1920x1080 · 10s · title-baked opener

Plus a poster frame for each.

Setup
-----
    pip install --break-system-packages pillow imageio-ffmpeg fonttools brotli
    python3 scripts/make-font-ttf.py      # once: woff2 -> ttf for PIL
    python3 scripts/make-video-pack.py

Fonts live in ~/.cache/fonts (created by make-font-ttf.py); they are not
committed because the variable woff2 files already ship in node_modules.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
import numpy as np
import os
import math
import subprocess
import imageio_ffmpeg

FPS = 24
INK = (4, 10, 9)
IVORY = (248, 242, 229)
GOLD = (201, 164, 92)
GOLD_LIGHT = (235, 211, 160)
GOLD_DEEP = (143, 115, 56)
FONT_DIR = os.path.expanduser('~/.cache/fonts')


# --------------------------------------------------------------------------
# typography helpers
# --------------------------------------------------------------------------
def fraunces(size, weight=330, italic=False, opsz=144, soft=40, wonk=1):
    path = os.path.join(FONT_DIR, 'Fraunces-Italic.ttf' if italic else 'Fraunces.ttf')
    f = ImageFont.truetype(path, size)
    f.set_variation_by_axes([opsz, weight, soft, wonk])
    return f


def manrope(size, weight=700):
    f = ImageFont.truetype(os.path.join(FONT_DIR, 'Manrope.ttf'), size)
    f.set_variation_by_axes([weight])
    return f


def _gradient(width, height, stops):
    """horizontal multi-stop gradient as an RGB image"""
    img = Image.new('RGB', (max(1, width), max(1, height)))
    d = ImageDraw.Draw(img)
    for x in range(max(1, width)):
        t = x / max(1, width - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                col = tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
                d.line([(x, 0), (x, height)], fill=col)
                break
    return img


def text_layer(text, font, fill=IVORY, tracking=0, gradient=None):
    """render text with optional letter-spacing and a gradient fill"""
    widths = [font.getlength(ch) for ch in text]
    w = int(sum(widths) + tracking * max(0, len(text) - 1)) + 8
    asc, desc = font.getmetrics()
    h = asc + desc + 8
    lay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    x = 4
    for ch, cw in zip(text, widths):
        d.text((x, 4), ch, font=font, fill=fill + (255,) if len(fill) == 3 else fill)
        x += cw + tracking
    if gradient is not None:
        mask = lay.getchannel('A')
        g = _gradient(w, h, gradient)
        out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        out.paste(g, (0, 0), mask)
        lay = out
    return lay


def place(base, layer, center=None, top_left=None, alpha=1.0, scale=1.0, offset=(0, 0)):
    lay = layer
    if scale != 1.0:
        lay = lay.resize((max(1, int(lay.width * scale)), max(1, int(lay.height * scale))), Image.LANCZOS)
    if alpha < 0.999:
        a = lay.getchannel('A').point(lambda v: int(v * alpha))
        lay = lay.copy()
        lay.putalpha(a)
    if center is not None:
        xy = (int(center[0] - lay.width / 2 + offset[0]), int(center[1] - lay.height / 2 + offset[1]))
    else:
        xy = (int(top_left[0] + offset[0]), int(top_left[1] + offset[1]))
    base.alpha_composite(lay, xy)


def ease_out(t):
    return 1 - (1 - t) ** 3


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def span(t, a, b):
    """0..1 progress of t inside [a, b]"""
    if b == a:
        return 1.0 if t >= b else 0.0
    return max(0.0, min(1.0, (t - a) / (b - a)))


# --------------------------------------------------------------------------
# plate helpers
# --------------------------------------------------------------------------
GOLD_STOPS = [(0.0, (201, 164, 92)), (0.28, (243, 226, 184)), (0.5, (235, 211, 160)), (0.78, (201, 164, 92)), (1.0, (247, 236, 201))]


def cover(path, w, h, zoom=1.22, focus=0.5):
    im = Image.open(path).convert('RGB')
    tr = w / h
    if im.width / im.height > tr:
        nh = im.height
        nw = int(nh * tr)
    else:
        nw = im.width
        nh = int(nw / tr)
    top = int((im.height - nh) * focus)
    im = im.crop(((im.width - nw) // 2, top, (im.width + nw) // 2, top + nh))
    return im.resize((int(w * zoom), int(h * zoom)), Image.LANCZOS)


class Plate:
    def __init__(self, path, w, h, zoom=1.22, focus=0.5):
        self.img = cover(path, w, h, zoom, focus)
        self.w, self.h = w, h

    def at(self, t, amp=0.085, pan=0.02, flip=1):
        z = 1.06 + amp * t
        cw, ch = self.img.width / z, self.img.height / z
        cx = self.img.width / 2 + (pan * (t - 0.5) * 2) * self.img.width * 0.5 * flip
        cy = self.img.height / 2 + (-pan * 0.6 * (t - 0.5) * 2) * self.img.height * 0.5
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        return self.img.resize((self.w, self.h), Image.LANCZOS, box=box)


def grade(im):
    im = ImageEnhance.Color(im).enhance(1.10)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Brightness(im).enhance(0.97)
    veil = Image.new('RGB', im.size, (255, 196, 120))
    return Image.blend(im, veil, 0.045)


def vignette(im, strength=0.95):
    w, h = im.size
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-w * 0.28, -h * 0.34, w * 1.28, h * 1.34), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(int(min(w, h) * 0.18)))
    dark = Image.new('RGB', (w, h), INK)
    out = Image.composite(im, dark, m)
    return Image.blend(im, out, strength)


def darken(im, amount, tint=INK):
    return Image.blend(im, Image.new('RGB', im.size, tint), amount)


def sweep(im, t, strength=46):
    if t < 0.02 or t > 0.30:
        return im
    w, h = im.size
    k = (t - 0.02) / 0.28
    band = 0.55
    xs = -band + k * (1 + 2 * band)
    x0 = int((xs - band / 2) * w)
    x1 = int((xs + band / 2) * w)
    grad = Image.new('L', (w, 1), 0)
    gd = ImageDraw.Draw(grad)
    for x in range(max(0, x0), min(w, x1)):
        u = (x - x0) / max(1, (x1 - x0))
        gd.point((x, 0), fill=int(math.sin(u * math.pi) * strength))
    mask = grad.resize((w, h))
    band_img = Image.new('RGB', (w, h), (255, 246, 226))
    return Image.composite(Image.blend(im, band_img, 0.30), im, mask)


# --------------------------------------------------------------------------
# renderer
# --------------------------------------------------------------------------
class Film:
    def __init__(self, w, h, plates, shot=4.0, fade=1.0, out='out.mp4', crf=29, grain_amt=6.5, overlay=None, seed=7):
        self.w, self.h = w, h
        self.plates = plates
        self.shot = shot
        self.fade = fade
        self.out = out
        self.crf = crf
        self.overlay = overlay
        self.duration = shot * len(plates) - fade * (len(plates) - 1)
        rng = np.random.default_rng(seed)
        self.grain = rng.normal(0, grain_amt, (h + 120, w + 160, 1)).repeat(3, axis=2).astype(np.int16)

    def frame(self, f, t):
        step = self.shot - self.fade
        idx = min(len(self.plates) - 1, int(t // step))
        local = (t - idx * step) / self.shot
        base = self.plates[idx].at(min(1, max(0, local)), flip=1 if idx % 2 == 0 else -1)

        if idx < len(self.plates) - 1 and local > (1 - self.fade / self.shot):
            nl = (t - (idx + 1) * step) / self.shot
            nxt = self.plates[idx + 1].at(min(1, max(0, nl)), flip=-1 if idx % 2 == 0 else 1)
            a = smooth((local - (1 - self.fade / self.shot)) / (self.fade / self.shot))
            base = Image.blend(base, nxt, a)

        base = grade(base)
        if self.overlay:
            base = self.overlay(base, f, t, self.duration)
        base = vignette(base)
        im = base.convert('RGB')
        arr = np.asarray(im).astype(np.int16)
        oy = (f * 37) % 120
        ox = (f * 53) % 160
        arr = np.clip(arr + self.grain[oy:oy + self.h, ox:ox + self.w], 0, 255).astype(np.uint8)
        return Image.fromarray(arr, 'RGB')

    def run(self):
        cmd = [imageio_ffmpeg.get_ffmpeg_exe(), '-y',
               '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{self.w}x{self.h}',
               '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow',
               '-crf', str(self.crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', self.out]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        total = int(self.duration * FPS)
        for f in range(total):
            proc.stdin.write(self.frame(f, f / FPS).tobytes())
        proc.stdin.close()
        proc.wait()
        print(f'  -> {self.out}  {os.path.getsize(self.out) // 1024} KB  ({self.duration:.1f}s)')


def poster(video, out, at=0.4):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff, '-y', '-ss', str(at), '-i', video, '-frames:v', '1', '-q:v', '3', out],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print('  poster ->', out, os.path.getsize(out) // 1024, 'KB')


# --------------------------------------------------------------------------
# overlays
# --------------------------------------------------------------------------
def reel_overlay(base, f, t, dur):
    """minimal, story-safe branding for vertical video"""
    lay = base.convert('RGBA')
    w, h = lay.size

    # soft top + bottom scrims so lettering survives any plate
    scrim = Image.new('RGBA', (w, h), (4, 10, 9, 0))
    sd = ImageDraw.Draw(scrim)
    for y in range(min(460, h)):
        sd.line([(0, y), (w, y)], fill=(4, 10, 9, int(150 * (1 - y / 460))))
    for y in range(520):
        yy = h - 520 + y
        if 0 <= yy < h:
            sd.line([(0, yy), (w, yy)], fill=(4, 10, 9, int(170 * (y / 520))))
    lay = Image.alpha_composite(lay, scrim)

    # wordmark
    a1 = smooth(span(t, 0.25, 1.4))
    mark = text_layer('TRIP TASTIC', fraunces(58, weight=330, soft=60), gradient=GOLD_STOPS, tracking=3)
    place(lay, mark, center=(w / 2, 196), alpha=a1, offset=(0, 16 * (1 - ease_out(a1))))
    hol = text_layer('H O L I D A Y S', manrope(19, 800), IVORY, tracking=10)
    place(lay, hol, center=(w / 2, 258), alpha=0.88 * smooth(span(t, 0.75, 1.8)))

    rule_w = int(150 * ease_out(span(t, 1.0, 2.2)))
    if rule_w:
        d = ImageDraw.Draw(lay)
        d.line([(w / 2 - rule_w / 2, 300), (w / 2 + rule_w / 2, 300)], fill=GOLD + (170,), width=2)

    # bottom caption
    a2 = smooth(span(t, 1.3, 2.4))
    line = text_layer('PRIVATE JOURNEYS · INDIA & BEYOND', manrope(21, 700), IVORY, tracking=6)
    place(lay, line, center=(w / 2, h - 318), alpha=0.62 * a2)

    # slow gold hairline frame
    inset = int(34)
    fa = int(120 * smooth(span(t, 1.6, 3.0)))
    if fa:
        d = ImageDraw.Draw(lay)
        d.rectangle([inset, inset + 120, w - inset, h - inset - 60], outline=GOLD + (fa,), width=2)

    return lay.convert('RGB')


def intro_overlay(base, f, t, dur):
    """brand opener: emblem, wordmark, rule, tagline"""
    lay = base.convert('RGBA')
    w, h = lay.size
    cx = w / 2
    # darken the plate so type reads
    lay = Image.alpha_composite(lay, Image.new('RGBA', (w, h), (4, 10, 9, 118)))

    # emblem
    em = Image.open('public/brand/emblem.webp').convert('RGBA')
    em = em.resize((int(210 * (0.94 + 0.06 * ease_out(span(t, 0.4, 2.0)))), 0) if False else (210, int(210 * em.height / em.width)), Image.LANCZOS)
    place(lay, em, center=(cx, h * 0.31), alpha=smooth(span(t, 0.35, 1.5)))

    # wordmark
    word = text_layer('TRIP TASTIC', fraunces(132, weight=330, soft=60), gradient=GOLD_STOPS, tracking=2)
    y = h * 0.52
    place(lay, word, center=(cx, y), alpha=smooth(span(t, 1.05, 2.2)), offset=(0, 26 * (1 - ease_out(span(t, 1.05, 2.2)))))

    # gold rule
    rw = int(300 * ease_out(span(t, 1.9, 2.9)))
    if rw:
        d = ImageDraw.Draw(lay)
        d.line([(cx - rw / 2, y + 96), (cx + rw / 2, y + 96)], fill=GOLD + (190,), width=2)

    # holidays
    hol = text_layer('HOLIDAYS', manrope(30, 800), IVORY, tracking=20 + 10 * (1 - ease_out(span(t, 2.2, 3.2))))
    place(lay, hol, center=(cx, y + 148), alpha=0.92 * smooth(span(t, 2.2, 3.2)))

    # tagline
    tag = text_layer('The art of wandering well', fraunces(46, weight=330, italic=True, soft=90), IVORY, tracking=0.5)
    place(lay, tag, center=(cx, y + 236), alpha=0.82 * smooth(span(t, 2.8, 3.9)), offset=(0, 18 * (1 - ease_out(span(t, 2.8, 3.9)))))

    # end fade
    fade = smooth(span(t, dur - 1.1, dur - 0.1))
    if fade > 0:
        lay = Image.alpha_composite(lay, Image.new('RGBA', (w, h), (4, 10, 9, int(255 * fade))))
    # opening fade
    fade_in = 1 - smooth(span(t, 0, 0.9))
    if fade_in > 0:
        lay = Image.alpha_composite(lay, Image.new('RGBA', (w, h), (4, 10, 9, int(255 * fade_in))))
    return lay.convert('RGB')


# --------------------------------------------------------------------------
def main():
    os.makedirs('public/video', exist_ok=True)

    print('1/3  hero master 1920x1080')
    hero_plates = [Plate('src/assets/hero.webp', 1920, 1080),
                   Plate('src/assets/ladakh.webp', 1920, 1080),
                   Plate('src/assets/bali.webp', 1920, 1080),
                   Plate('src/assets/kerala.webp', 1920, 1080),
                   Plate('src/assets/hero.webp', 1920, 1080)]
    Film(1920, 1080, hero_plates, shot=4.0, fade=1.0, out='public/video/hero-loop-1080.mp4', crf=29,
         overlay=lambda b, f, t, d: sweep(b, (t % 4.0) / 4.0) if False else b).run()
    poster('public/video/hero-loop-1080.mp4', 'public/video/hero-poster-1080.jpg')

    print('2/3  vertical reel 1080x1920')
    reel_plates = [Plate('src/assets/ladakh.webp', 1080, 1920),
                   Plate('src/assets/bali.webp', 1080, 1920),
                   Plate('src/assets/kerala.webp', 1080, 1920),
                   Plate('src/assets/ooty.webp', 1080, 1920),
                   Plate('src/assets/ladakh.webp', 1080, 1920)]
    Film(1080, 1920, reel_plates, shot=3.4, fade=0.9, out='public/video/hero-reel.mp4', crf=28,
         overlay=reel_overlay).run()
    poster('public/video/hero-reel.mp4', 'public/video/hero-reel-poster.jpg', at=1.6)

    print('3/3  brand intro 1920x1080')
    intro_base = Plate('src/assets/hero.webp', 1920, 1080)
    Film(1920, 1080, [intro_base], shot=10.0, fade=0.0, out='public/video/brand-intro.mp4', crf=28,
         overlay=intro_overlay).run()
    poster('public/video/brand-intro.mp4', 'public/video/brand-intro-poster.jpg', at=6.0)


if __name__ == '__main__':
    main()
