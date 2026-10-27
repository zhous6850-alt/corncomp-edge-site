"""Extract bounded product regions from rendered source PDF pages; no synthetic images."""
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
output = root / 'site/public/media/catalogue'
output.mkdir(parents=True, exist_ok=True)
for entry in json.loads((root / 'tmp/catalog-audit/crops.json').read_text(encoding='utf-8')):
    page = entry['page']
    path = root / f'tmp/catalog-audit/images-{page:02}.jpg'
    if not path.exists():
        path = root / f'tmp/catalog-audit/page-{page:02}.jpg'
    image = Image.open(path).convert('RGB')
    x, y, width, height = entry['crop']
    w, h = image.size
    product = image.crop((round(x*w), round(y*h), round((x+width)*w), round((y+height)*h)))
    canvas = Image.new('RGB', (1200, 900), 'white')
    product = ImageOps.contain(product, (1160, 860))
    canvas.paste(product, ((1200-product.width)//2, (900-product.height)//2))
    canvas.save(output / (entry['slug']+'.webp'), quality=88)
print('Extracted product regions:', len(list(output.glob('*.webp'))))
