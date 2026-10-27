"""Export original embedded PDF image objects unchanged for source review."""
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
out = root / 'tmp/product-image-review/pdf-originals'
out.mkdir(parents=True, exist_ok=True)
reader = PdfReader(r'C:/Users/Sam/Desktop/网站素材/catalog/Corncomp Catalogue(1).pdf')
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
for page_no in range(2, 26):
    images = []
    for index, item in enumerate(reader.pages[page_no-1].images):
        image = item.image
        if min(image.size) < 60:
            continue
        name = f'p{page_no:02}-{index:02}'
        image.save(out / f'{name}{".tiff" if image.mode == "CMYK" else ".png"}')
        images.append((name, image))
    if not images:
        continue
    sheet = Image.new('RGB', (1200, ((len(images)+2)//3)*360), '#e7e7e7')
    draw = ImageDraw.Draw(sheet)
    for index, (name, image) in enumerate(images):
        x, y = index % 3 * 400, index // 3 * 360
        draw.rectangle((x+5,y+5,x+395,y+315),fill='white')
        thumb = ImageOps.contain(image.convert('RGB') if image.mode=='CMYK' else image, (380,300))
        pos = (x+(400-thumb.width)//2,y+5+(300-thumb.height)//2)
        sheet.paste(thumb,pos,thumb if thumb.mode=='RGBA' else None)
        draw.text((x+10,y+320),f'{name} {image.width}x{image.height}',font=font,fill='black')
    sheet.save(out / f'contact-{page_no:02}.jpg',quality=95)
print('Exported embedded source objects with their original transparency.')
