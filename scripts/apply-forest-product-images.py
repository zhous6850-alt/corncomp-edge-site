"""Publish reviewed forest backdrop assets; retain reversible input backups."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

root=Path(__file__).resolve().parent.parent
review=root/'tmp/product-image-review'
entries=json.loads((review/'forest-backgrounds.json').read_text(encoding='utf8'))
assert len(entries)==35 and len({x['slug'] for x in entries})==35
backup=review/'before-forest-backgrounds'
backup.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
for entry in entries:
    target=root/'site/public'/entry['asset'].lstrip('/')
    original=backup/target.name
    if not original.exists(): original.write_bytes(target.read_bytes())
    with Image.open(original) as image: old_size=image.size
    # Format/aspect normalization only; product editing was done by imagegen.
    scale=max(1,1200/old_size[0],900/old_size[1])
    size=tuple(round(x*scale) for x in old_size)
    generated=Image.open(entry['source']).convert('RGB')
    r,g,b=generated.getpixel((0,0))
    assert g>r and g>b and g<130,(entry['slug'],'background is not dark forest green')
    fitted=ImageOps.contain(generated,size,Image.Resampling.LANCZOS)
    canvas=Image.new('RGB',size,'#244936')
    canvas.paste(fitted,((size[0]-fitted.width)//2,(size[1]-fitted.height)//2))
    canvas.save(target,quality=95)
    entry['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
    entry['size']=size
for start in range(0,len(entries),15):
    sheet=Image.new('RGB',(1200,1500),'#eee'); draw=ImageDraw.Draw(sheet)
    for index,entry in enumerate(entries[start:start+15]):
        image=Image.open(root/'site/public'/entry['asset'].lstrip('/'))
        thumb=ImageOps.contain(image,(390,245))
        x,y=index%3*400,index//3*300
        sheet.paste(thumb,(x+(400-thumb.width)//2,y))
        draw.text((x+8,y+253),entry['slug'][:43],font=font,fill='black')
    sheet.save(review/f'forest-final-{start//15+1:02}.jpg',quality=95)
assert len({x['sha256'] for x in entries})==35
(root/'docs/qa/2026-10-17-forest-product-images.json').write_text(json.dumps(entries,indent=2),encoding='utf8')
print('Applied 35 unique forest-background product images; originals backed up.')
