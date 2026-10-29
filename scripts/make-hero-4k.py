"""
Trip Tastic — ULTRA HD hero film.

Renders the hero loop at two resolutions from the site's own photography:

    public/video/hero-uhd-4k.mp4    3840x2160  master / YouTube / OTT
    public/video/hero-loop-1440.mp4 2560x1440  what large screens stream
    public/video/hero-loop-1080.mp4 1920x1080  fallback (kept from the pack)

The photography is ~1.4K, so the UHD render is a careful upscale:
Lanczos → unsharp mask → local contrast → film grain. Grain and the warm
grade hide the interpolation, which is how most travel reels are finished.

    pip install --break-system-packages pillow imageio-ffmpeg fonttools brotli
    python3 scripts/make-font-ttf.py      # once
    python3 scripts/make-hero-4k.py       # ~10 min for both renders
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import os
import subprocess
import imageio_ffmpeg

FPS = 24
SHOT = 4.2          # seconds per plate
FADE = 1.1          # crossfade
INK = (4, 10, 9)

# six plates, first == last so the loop is seamless
PLATES = [
    ('src/assets/hero.webp', 0.50),
    ('src/assets/ladakh.webp', 0.46),
    ('src/assets/bali.webp', 0.52),
    ('src/assets/kerala.webp', 0.50),
    ('src/assets/himachal.webp', 0.48),
    ('src/assets/hero.webp', 0.50),
]


def clean_chroma(im, radius=1.4):
    """the source webp is 768px wide with 4:2:0 chroma — smooth the colour
    blotches first, otherwise an upscale turns them into visible squares"""
    y, cb, cr = im.convert('YCbCr').split()
    cb = cb.filter(ImageFilter.GaussianBlur(radius))
    cr = cr.filter(ImageFilter.GaussianBlur(radius))
    return Image.merge('YCbCr', (y, cb, cr)).convert('RGB')


def staged_upscale(im, target_w, target_h, steps=2):
    """small hops of Lanczos + light unsharp beat one huge jump (fewer halos)"""
    cur = im
    for i in range(steps):
        k = (i + 1) / steps
        nw = int(im.width + (target_w - im.width) * k)
        nh = int(im.height + (target_h - im.height) * k)
        cur = cur.resize((nw, nh), Image.LANCZOS)
        cur = cur.filter(ImageFilter.UnsharpMask(radius=1.4, percent=34, threshold=3))
    return cur


def cover(path, w, h, zoom=1.3, focus=0.5):
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
    im = clean_chroma(im)
    big = staged_upscale(im, int(w * zoom), int(h * zoom))
    # final, restrained sharpen — the grain pass hides the rest
    big = big.filter(ImageFilter.UnsharpMask(radius=1.8, percent=40, threshold=4))
    big = ImageEnhance.Sharpness(big).enhance(1.02)
    return big


class Plate:
    def __init__(self, path, w, h, focus=0.5):
        self.img = cover(path, w, h, 1.3, focus)
        self.w, self.h = w, h

    def at(self, t, amp=0.075, pan=0.018, flip=1):
        z = 1.05 + amp * t
        cw, ch = self.img.width / z, self.img.height / z
        cx = self.img.width / 2 + (pan * (t - 0.5) * 2) * self.img.width * 0.5 * flip
        cy = self.img.height / 2 + (-pan * 0.55 * (t - 0.5) * 2) * self.img.height * 0.5
        box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
        return self.img.resize((self.w, self.h), Image.LANCZOS, box=box)


def grade(im):
    """warm highlights, teal-leaning shadows, gentle contrast"""
    im = ImageEnhance.Color(im).enhance(1.11)
    im = ImageEnhance.Contrast(im).enhance(1.07)
    im = ImageEnhance.Brightness(im).enhance(0.97)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.035 + 3)))
    g = g.point(lambda v: min(255, int(v * 1.0 + 1)))
    b = b.point(lambda v: min(255, int(v * 0.985 + 4)))
    im = Image.merge('RGB', (r, g, b))
    veil = Image.new('RGB', im.size, (255, 198, 126))
    return Image.blend(im, veil, 0.04)


def vignette(im):
    w, h = im.size
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-w * 0.3, -h * 0.36, w * 1.3, h * 1.36), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(int(min(w, h) * 0.17)))
    dark = Image.new('RGB', (w, h), INK)
    out = Image.composite(im, dark, m)
    return Image.blend(im, out, 0.9)


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def render(w, h, out, crf=30, preset='medium', duration=None, grain_amt=5.0, seed=11):
    plates = [Plate(p, w, h, focus) for p, focus in PLATES]
    step = SHOT - FADE
    total = SHOT * len(plates) - FADE * (len(plates) - 1)
    frames = int(total * FPS)

    rng = np.random.default_rng(seed)
    grain = rng.normal(0, grain_amt, (h + 120, w + 160, 1)).repeat(3, axis=2).astype(np.int16)

    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), '-y',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', str(FPS), '-i', '-',
           '-an', '-c:v', 'libx264', '-preset', preset, '-crf', str(crf),
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
           '-x264-params', 'keyint=48:min-keyint=24', out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    for f in range(frames):
        t = f / FPS
        idx = min(len(plates) - 1, int(t // step))
        local = (t - idx * step) / SHOT
        base = plates[idx].at(min(1, max(0, local)), flip=1 if idx % 2 == 0 else -1)

        if idx < len(plates) - 1 and local > (1 - FADE / SHOT):
            nl = (t - (idx + 1) * step) / SHOT
            nxt = plates[idx + 1].at(min(1, max(0, nl)), flip=-1 if idx % 2 == 0 else 1)
            base = Image.blend(base, nxt, smooth((local - (1 - FADE / SHOT)) / (FADE / SHOT)))

        base = vignette(grade(base))
        arr = np.asarray(base).astype(np.int16)
        oy = (f * 37) % 120
        ox = (f * 53) % 160
        arr = np.clip(arr + grain[oy:oy + h, ox:ox + w], 0, 255).astype(np.uint8)
        proc.stdin.write(arr.tobytes())

        if f % 48 == 0:
            print(f'   {out}  {f}/{frames} frames', flush=True)

    proc.stdin.close()
    proc.wait()
    print(f'-> {out}  {os.path.getsize(out) / 1e6:.1f} MB  ({total:.1f}s)')


def poster(video, out, at=0.4, width=2560):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = '/tmp/_poster.png'
    subprocess.run([ff, '-y', '-ss', str(at), '-i', video, '-frames:v', '1', tmp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    im = Image.open(tmp).convert('RGB')
    if im.width > width:
        im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    im.save(out, 'JPEG', quality=78, optimize=True, progressive=True)
    print(f'-> {out}  {os.path.getsize(out) / 1024:.0f} KB  {im.size}')


if __name__ == '__main__':
    import sys
    os.makedirs('public/video', exist_ok=True)
    only = sys.argv[1] if len(sys.argv) > 1 else 'all'

    if only in ('all', '4k'):
        print('1/2  UHD 3840x2160 master')
        render(3840, 2160, 'public/video/hero-uhd-4k.mp4', crf=30, preset='medium')
        poster('public/video/hero-uhd-4k.mp4', 'public/video/hero-poster-4k.jpg', at=0.5, width=1920)

    if only in ('all', '1440'):
        print('2/2  2560x1440 web master')
        render(2560, 1440, 'public/video/hero-loop-1440.mp4', crf=27, preset='slow')
        poster('public/video/hero-loop-1440.mp4', 'public/video/hero-poster-1440.jpg', at=0.5, width=1600)
