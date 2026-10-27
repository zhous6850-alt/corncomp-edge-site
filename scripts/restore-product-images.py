"""Restore reviewed catalogue objects, retaining existing public URLs and dimensions.

Crop coordinates address the original transparent image, not the printed page.
No generative reconstruction or artificial detail is applied.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps
from collections import deque
from functools import lru_cache

@lru_cache(maxsize=None)
def source_components(source):
    """Find separated original objects, so selection never cuts an object in half."""
    image=Image.open(SOURCES/f'{source}.png').convert('RGBA')
    alpha=ImageOps.contain(image.getchannel('A'),(600,600))
    w,h=alpha.size
    pixels=bytearray(1 if v>30 else 0 for v in alpha.tobytes())
    components=[]
    for pos in range(w*h):
        if not pixels[pos]: continue
        pixels[pos]=0
        queue=deque([pos]); count=0; left=w; top=h; right=bottom=0
        while queue:
            p=queue.popleft(); x=p%w; y=p//w; count+=1
            left=min(left,x); top=min(top,y); right=max(right,x); bottom=max(bottom,y)
            for n in ((p-1 if x else -1),(p+1 if x<w-1 else -1),p-w,p+w):
                if 0<=n<w*h and pixels[n]:
                    pixels[n]=0; queue.append(n)
        if count>=12:
            # A small safety border retains the original antialiased/translucent edges.
            components.append((max(0,(left-3)/w),max(0,(top-3)/h),min(1,(right+4)/w),min(1,(bottom+4)/h)))
    return image,components

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'tmp/product-image-review/pdf-originals'
MAPPING = {}

def add(source, slug, crop=None):
    MAPPING[slug] = (source, crop)

for source, slug in [
 ('p03-01','kraft-paper-bowl'), ('p04-04','cardboard-bamboo-bowl'),
 ('p04-00','pet-lid'), ('p04-01','pla-lid'), ('p04-02','pp-lid'), ('p04-03','paper-lid'),
 ('p05-00','cardboard-soup-cup'), ('p05-01','natural-kraft-soup-cup'), ('p05-02','bamboo-paper-soup-cup'),
 ('p10-00','hot-dog-tray'), ('p10-01','kraft-paper-tray'), ('p10-04','two-compartment-paper-tray'),
 ('p13-01','cardboard-cutlery'), ('p13-02','wooden-bamboo-cutlery'), ('p13-03','cpla-cutlery'),
 ('p20-00','bagasse-round-plate'), ('p20-01','bagasse-three-compartment-plate'), ('p20-02','bagasse-natural-round-plate'),
 ('p21-00','bagasse-round-bowl'), ('p21-01','bagasse-natural-round-bowl'), ('p21-02','bagasse-shallow-round-bowl'),
 ('p21-03','bagasse-two-compartment-tray'), ('p21-04','bagasse-square-plate'),
 ('p22-00','bagasse-three-compartment-clamshell'), ('p22-01','bagasse-clamshell'),
 ('p24-01','pla-lid-for-coffee-cup-black'), ('p24-02','pla-lid-for-coffee-cup-white'),
 ('p24-03','corrugated-board-cup-sleeve-8-12-16-20oz'),
]:
    add(source, slug)

for slug, box in [
 ('cardboard-lid',(0,0,1,.36)), ('natural-kraft-lid',(0,.36,1,.60)), ('pla-lid-2',(0,.60,1,1))
]: add('p05-03',slug,box)

for slug, box in [
 ('kraft-colour-ice-cream-cup',(.47,0,1,.52)),
 ('cardboard-ice-cream-cup',(0,.42,.53,1)), ('pla-ice-cream-lid',(.52,.65,1,1))
]: add('p10-02',slug,box)

# Multi-object source sheets: rectangles include every associated open/closed piece.
for source, entries in {
 'p11-00': [
  ('kraft-square-food-box',(0,.47,.25,.64)),
  ('kraft-square-food-bow-pp-handle',(.25,.56,.46,.83)),
  ('kraft-square-food-box-wire-handle',(0,.73,.25,.98)),
  ('white-cardboard-food-box',(.53,.05,.75,.29)),
  ('white-cardboard-food-box-pp-handle',(.75,.29,.98,.53)),
  ('white-cardboard-box-wire-handle',(.53,.46,.75,.68))],
 'p12-00': [
  ('doner-box',(.53,.06,.75,.29)), ('kraft-round-food-box',(.77,.24,.98,.47)),
  ('white-round-food-box',(.53,.45,.74,.66))],
 'p13-00': [
  ('natural-kraft-menu-box',(.48,0,.96,.39)), ('white-cardboard-menu-box',(.09,.40,.62,.65))],
 'p14-00': [
  ('natural-kraft-hamburger-box',(.69,0,.98,.39)), ('corrugated-hamburger-box',(.69,.48,.98,.84))],
 'p15-00': [
  ('natural-kraft-sandwich-box-pla-window',(0,0,.25,.34)),
  ('cardboard-sandwich-box-pla-window',(.29,.2,.46,.46)),
  ('brown-triangle-box-pla-window',(0,.42,.30,.74)),
  ('cardboard-triangle-box-pla-window',(.18,.73,.48,.99)),
  ('kraft-wrap-box-pla-window',(.76,0,1,.34)),
  ('cardboard-wrap-box-pla-window',(.53,.19,.74,.46)),
  ('cardboard-window-food-box',(.77,.44,1,.63))],
 'p16-01': [('black-white-cardboard-sushi-box-pla-window',(.5,.59,.98,.95))],
 'p17-00': [
  ('multi-window-salad-box',(.13,0,.45,.34)),
  ('kraft-paper-salad-box-pla-window',(0,.35,.30,.68)),
  ('two-piece-window-food-box',(.26,.68,.50,.97)),
  ('rectangular-pla-window-box',(.53,0,.77,.34)),
  ('kraft-paper-box-pet-window',(.76,.35,1,.67)),
  ('kraft-window-menu-box',(.54,.65,.78,.83))],
 'p18-00': [
  ('frite-cone-white',(.57,0,.70,.31)), ('frite-cone-kraft',(.84,.22,.99,.51)),
  ('frite-cone-black',(.58,.49,.72,.79)), ('frite-cone-kraft-cardboard',(.83,.70,1,.98))],
 'p19-00': [
  ('white-open-wrap-cup',(.15,0,.48,.39)),
  ('cardboard-open-wrap-cup',(0,.39,.35,.72)),
  ('cardboard-closed-snack-cup',(.68,.02,.99,.39)),
  ('natural-kraft-closed-snack-cup',(.54,.38,.86,.68)),
  ('kraft-french-fries-box',(.80,.69,.98,.96))],
 'p23-00': [
  ('single-wall-white-cardboard-paper-cup',(.83,0,.97,.25)),
  ('double-wall-white-cardboard-paper-cup',(.57,.21,.69,.43)),
  ('ripple-white-paper-cup-vertical',(.83,.39,.97,.62)),
  ('ripple-white-paper-cup-horizontal',(.56,.58,.70,.83)),
  ('single-wall-bagasse-paper-cup',(.83,.75,.97,.99))],
 'p24-00': [
  ('single-wall-kraft-paper-cup',(.04,0,.39,.30)),
  ('double-wall-kraft-paper-cup',(.57,.26,.91,.53)),
  ('ripple-natural-kraft-paper-cup-vertical-style',(.03,.53,.39,.79)),
  ('ripple-natural-kraft-paper-cup-horizon-style',(.63,.71,.99,1))],
 'p25-00': [
  ('white-handle-paper-bag',(.53,.17,.71,.51)),
  ('kraft-handle-paper-bag',(.79,.04,.97,.40)),
  ('white-paper-bag',(.53,.57,.71,.91)),
  ('kraft-paper-bag',(.79,.47,.97,.81))],
}.items():
    for slug, box in entries: add(source,slug,box)

inventory = json.loads((ROOT/'tmp/product-image-review/inventory.json').read_text(encoding='utf8'))
report = []
for entry in inventory:
    if entry['slug'] not in MAPPING:
        report.append({**entry,'status':'needs-further-review'})
        continue
    source, crop = MAPPING[entry['slug']]
    image,components = source_components(source)
    if crop:
        w,h=image.size
        selected=[b for b in components if crop[0]<(b[0]+b[2])/2<crop[2] and crop[1]<(b[1]+b[3])/2<crop[3]]
        if not selected:
            # In this source the lifestyle photo physically overlaps the open box.
            # Keep the bounded source for the separately reviewed background cleanup.
            assert entry['slug'] in ('kraft-square-food-box','white-cardboard-menu-box'),entry['slug']
            box=tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(crop))
            selected=[crop]
        isolated=Image.new('RGBA',image.size)
        for b in selected:
            box=tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(b))
            isolated.paste(image.crop(box),box[:2])
        if entry['slug']=='natural-kraft-closed-snack-cup':
            isolated.paste((0,0,0,0),(round(.68*w),0,w,round(.39*h)))
        image=isolated
    # Alpha bounding box, never a color threshold: pale/transparent lids survive.
    bounds=image.getchannel('A').getbbox()
    assert bounds,entry['slug']
    image=image.crop(bounds)
    target=ROOT/'site/public'/entry['image'].lstrip('/')
    with Image.open(target) as old:
        size=old.size
    white=Image.new('RGB',size,'white')
    fitted=ImageOps.contain(image,(round(size[0]*.88),round(size[1]*.88)),Image.Resampling.LANCZOS)
    white.paste(fitted,((size[0]-fitted.width)//2,(size[1]-fitted.height)//2),fitted)
    white.save(target,quality=95)
    report.append({**entry,'status':'restored-original','source':source,'crop':crop,'nativeProductSize':image.size})
(ROOT/'tmp/product-image-review/restoration-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print('Restored',sum(x['status']=='restored-original' for x in report),'of',len(report),'images; remaining entries require review.')
