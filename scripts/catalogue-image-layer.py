"""PDF extraction: retain original image placements while omitting typography/vector tables."""
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, NameObject

root=Path(__file__).resolve().parent.parent
reader=PdfReader(r'C:\Users\Sam\Desktop\网站素材\catalog\Corncomp Catalogue(1).pdf')
writer=PdfWriter()
for source in reader.pages:
    page=writer.add_page(source)
    stream=ContentStream(page.get_contents(),writer)
    stream.operations=[(args,op) for args,op in stream.operations if op in {b'q',b'Q',b'cm',b'Do',b'gs',b'ri'}]
    page[NameObject('/Contents')]=writer._add_object(stream)
with (root/'tmp/catalog-audit/image-layer.pdf').open('wb') as output:
    writer.write(output)
