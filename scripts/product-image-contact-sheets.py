"""Read-only visual audit: make labelled thumbnails without changing site assets."""
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
output = root / 'tmp/product-image-review'
entries = json.loads((output / 'inventory.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
for start in range(0, len(entries), 15):
    batch = entries[start:start+15]
    sheet = Image.new('RGB', (1200, 1500), '#e7e7e7')
    draw = ImageDraw.Draw(sheet)
    for index, entry in enumerate(batch):
        image = Image.open(root / 'site/public' / entry['image'].lstrip('/')).convert('RGB')
        entry['pixelSize'] = list(image.size)
        thumb = ImageOps.contain(image, (380, 244))
        x, y = index % 3 * 400, index // 3 * 300
        draw.rectangle((x+5, y+5, x+395, y+250), fill='white')
        sheet.paste(thumb, (x+(400-thumb.width)//2, y+5+(244-thumb.height)//2))
        label = f"{entry['index']:02} {entry['slug']}"
        draw.text((x+10, y+255), label[:36], font=font, fill='black')
        draw.text((x+10, y+278), f"PDF {entry['pdfPage']} | {image.width}x{image.height}", font=font, fill='black')
    sheet.save(output / f'contact-{start//15+1:02}.jpg', quality=95)
(output / 'inventory.json').write_text(json.dumps(entries, indent=2), encoding='utf-8')
print(f'Audited dimensions of {len(entries)} files; generated {(len(entries)+14)//15} review sheets.')
