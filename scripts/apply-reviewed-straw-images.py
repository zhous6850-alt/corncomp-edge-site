"""Apply visually reviewed AI restorations, retaining original paths/aspect ratios."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/(sys.argv[1] if len(sys.argv)>1 else 'tmp/product-image-review/straw-retouching.json')).read_text(encoding='utf8'))
backup=root/'tmp/product-image-review/straw-original-backups'
backup.mkdir(exist_ok=True)
for entry in manifest:
    target=Path(entry['target'])
    original=Image.open(target)
    if not (backup/target.name).exists():
        (backup/target.name).write_bytes(target.read_bytes())
    # Retain the existing aspect ratio declared by the shared media inventory.
    scale=max(1,1200/original.width,900/original.height)
    size=tuple(round(v*scale) for v in original.size)
    image=Image.open(entry['source']).convert('RGB')
    fitted=ImageOps.contain(image,(round(size[0]*.94),round(size[1]*.94)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGB',size,'white')
    canvas.paste(fitted,((size[0]-fitted.width)//2,(size[1]-fitted.height)//2))
    canvas.save(target,quality=95)
print(f'Applied {len(manifest)} reviewed restorations; originals retained in {backup}.')
