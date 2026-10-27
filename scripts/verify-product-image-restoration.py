"""Verify all 95 final assets and retain their provenance/content hashes."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parent.parent
review=root/'tmp/product-image-review'
rows=json.loads((review/'restoration-report.json').read_text(encoding='utf8'))
retouched={x['slug']:x for name in ['straw-retouching.json','extra-retouching.json'] for x in json.loads((review/name).read_text(encoding='utf8'))}
assert len(rows)==95 and len({x['slug'] for x in rows})==95
assert len(retouched)==15
for row in rows:
    asset=root/'site/public'/row['image'].lstrip('/')
    with Image.open(asset) as image:
        image.verify()
    with Image.open(asset) as image:
        row['finalPixelSize']=list(image.size)
    row['sha256']=hashlib.sha256(asset.read_bytes()).hexdigest()
    if row['slug'] in retouched:
        row['status']='ai-restored-reference'
        row['restorationSource']=Path(retouched[row['slug']]['source']).name
    elif row['status']=='needs-further-review':
        assert row['slug'] in ('oval-paper-plate','round-paper-plate','compostable-waste-bag')
        row['status']='reviewed-retained-original'
    row['visualReview']='reviewed-in-labelled-contact-sheet'
counts={status:sum(x['status']==status for x in rows) for status in sorted({x['status'] for x in rows})}
assert len({x['sha256'] for x in rows})==95,'Duplicate product image contents'
assert counts=={'ai-restored-reference':15,'restored-original':77,'reviewed-retained-original':3},counts
for slug in ['cardboard-bamboo-bowl','hot-dog-tray','cardboard-cutlery']:
    assert next(x for x in rows if x['slug']==slug)['status']=='restored-original'
out=root/'docs/qa/2026-10-17-product-image-audit.json'
out.write_text(json.dumps({'counts':counts,'products':rows},ensure_ascii=False,indent=2),encoding='utf8')
print('Verified 95 decodable assets, unique series, provenance, three reported examples:',counts)
