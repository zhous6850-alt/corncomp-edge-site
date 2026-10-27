from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageOps

root=Path(__file__).resolve().parent.parent
out=root/'tmp/catalog-audit/originals'
out.mkdir(parents=True,exist_ok=True)
pdf=PdfReader(r'C:\Users\Sam\Desktop\网站素材\catalog\Corncomp Catalogue(1).pdf')
for page in [8,*range(10,26)]:
    thumbs=[]
    for i,item in enumerate(pdf.pages[page-1].images):
        image=item.image.convert('RGB')
        if min(image.size)<60: continue
        name=f'p{page:02}-{i:02}'
        image.save(out/(name+'.png'))
        thumbs.append((name,image))
    canvas=Image.new('RGB',(1400,((len(thumbs)+3)//4)*250),'white')
    for i,(name,image) in enumerate(thumbs):
        image=ImageOps.contain(image,(340,220))
        canvas.paste(image,((i%4)*350,(i//4)*250))
        ImageDraw.Draw(canvas).text(((i%4)*350+5,(i//4)*250+225),name,fill='black')
    canvas.save(out/f'contact-{page:02}.jpg')
