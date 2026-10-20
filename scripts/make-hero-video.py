from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np, os, math, subprocess, imageio_ffmpeg

W, H = 1600, 900
FPS = 24
SHOT = 4.0            # seconds per shot
FADE = 1.0            # crossfade seconds
SHOTS = [
    'src/assets/hero.webp',
    'src/assets/ladakh.webp',
    'src/assets/bali.webp',
    'src/assets/kerala.webp',
    'src/assets/hero.webp',   # fade back to the opening frame for a seamless loop
]
OUT = 'public/video/hero-loop.mp4'

def load_plate(path):
    im = Image.open(path).convert('RGB')
    # cover-crop to 16:9 with extra room for ken burns
    target_ratio = W / H
    r = im.width / im.height
    if r > target_ratio:
        nh = im.height
        nw = int(nh * target_ratio)
    else:
        nw = im.width
        nh = int(nw / target_ratio)
    im = im.crop(((im.width - nw)//2, (im.height - nh)//2, (im.width + nw)//2, (im.height + nh)//2))
    # upscale so we can zoom without softness
    return im.resize((int(W*1.22), int(H*1.22)), Image.LANCZOS)

plates = [load_plate(p) for p in SHOTS]

# grain tile
rng = np.random.default_rng(7)
grain = (rng.normal(0, 6.5, (H + 120, W + 160, 1))).repeat(3, axis=2).astype(np.int16)

def grade(im):
    im = ImageEnhance.Color(im).enhance(1.10)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Brightness(im).enhance(0.97)
    # warm highlight veil
    veil = Image.new('RGB', im.size, (255, 196, 120))
    im = Image.blend(im, veil, 0.045)
    return im

def vignette(im):
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-W*0.28, -H*0.34, W*1.28, H*1.34), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(220))
    dark = Image.new('RGB', (W, H), (4, 10, 9))
    return Image.composite(im, dark, m)

def shot_frame(i, t):
    """t in 0..1 within the shot"""
    p = plates[i]
    z = 1.06 + 0.085 * t
    panx = (0.04 * t - 0.02) * (1 if i % 2 == 0 else -1)
    pany = (-0.03 * t + 0.005) * (1 if i < 2 else -1)
    cw, ch = p.width / z, p.height / z
    cx = p.width / 2 + panx * p.width * 0.5
    cy = p.height / 2 + pany * p.height * 0.5
    box = (cx - cw/2, cy - ch/2, cx + cw/2, cy + ch/2)
    return p.resize((W, H), Image.LANCZOS, box=box)

def sweep(im, t):
    """light sweep across the frame once per cycle"""
    if t < 0.02 or t > 0.30:
        return im
    k = (t - 0.02) / 0.28
    band = 0.55
    xs = -band + k * (1 + 2*band)
    x0 = int((xs - band/2) * W); x1 = int((xs + band/2) * W)
    grad = Image.new('L', (W, 1), 0)
    gd = ImageDraw.Draw(grad)
    for x in range(max(0, x0), min(W, x1)):
        u = (x - x0) / max(1, (x1 - x0))
        v = int(math.sin(u * math.pi) * 46)
        gd.point((x, 0), fill=v)
    band_img = Image.new('RGB', (W, H), (255, 246, 226))
    mask = grad.resize((W, H))
    return Image.composite(Image.blend(im, band_img, 0.30), im, mask)

total = SHOT * len(SHOTS) - FADE * (len(SHOTS) - 1)
frames = int(total * FPS)
print('frames:', frames, 'duration:', round(total, 2))

cmd = [imageio_ffmpeg.get_ffmpeg_exe(), '-y',
       '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
       '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '29',
       '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

for f in range(frames):
    tglobal = f / FPS
    # locate shot & local t
    idx = min(len(SHOTS)-1, int(tglobal // (SHOT - FADE*0.0)))
    # simpler timeline: shots overlap by FADE
    step = SHOT - FADE
    idx = min(len(SHOTS)-1, int(tglobal // step))
    local = (tglobal - idx*step) / SHOT
    base = shot_frame(idx, min(1.0, max(0.0, local)))

    # crossfade into next shot near the end of this shot
    if idx < len(SHOTS)-1 and local > (1 - FADE/SHOT):
        nlocal = (tglobal - (idx+1)*step) / SHOT
        nxt = shot_frame(idx+1, min(1.0, max(0.0, nlocal)))
        a = (local - (1 - FADE/SHOT)) / (FADE/SHOT)
        a = a*a*(3-2*a)
        base = Image.blend(base, nxt, a)

    base = grade(base)
    base = sweep(base, local)
    base = vignette(base)

    arr = np.asarray(base).astype(np.int16)
    oy = (f * 37) % 60
    ox = (f * 53) % 80
    g = grain[oy:oy + H, ox:ox + W]
    arr = np.clip(arr + g, 0, 255).astype(np.uint8)
    proc.stdin.write(arr.tobytes())

proc.stdin.close()
proc.wait()
print('done', OUT, os.path.getsize(OUT)//1024, 'KB')
