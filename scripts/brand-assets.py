"""Create browser/share icons from the supplied logo; never redraw or crop it.
Run: .venv/bin/python scripts/brand-assets.py (requires Pillow).
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
source = ImageOps.exif_transpose(Image.open(root / 'trip-tastic-logo.jpeg')).convert('RGB')
public = root / 'public'
folder = public / 'brand'
folder.mkdir(parents=True, exist_ok=True)

def fitted(size):
    image = Image.new('RGB', (size, size), 'white')
    artwork = ImageOps.contain(source, (size, size), Image.Resampling.LANCZOS)
    image.paste(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    return image

for size in (32, 48, 192, 512):
    fitted(size).save(folder / f'favicon-{size}.png')
fitted(180).save(folder / 'apple-touch-icon.png')
fitted(256).save(public / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
cover = Image.new('RGB', (1200, 630), '#f7f5ef')
cover.paste(fitted(560), (320, 35))
cover.save(folder / 'share-logo.jpg', quality=94)
manifest = {
    'id': '/', 'name': 'Trip-Tastic Holidays', 'short_name': 'Trip-Tastic',
    'start_url': '/', 'scope': '/', 'display': 'standalone',
    'theme_color': '#102e32', 'background_color': '#f7f5ef',
    'icons': [{'src': f'/brand/favicon-{size}.png', 'sizes': f'{size}x{size}', 'type': 'image/png', 'purpose': 'any'} for size in (192, 512)]
}
(public / 'site.webmanifest').write_text(json.dumps(manifest, indent=2) + '\n')
print('Original-logo browser icons, home-screen icons and share preview generated.')
