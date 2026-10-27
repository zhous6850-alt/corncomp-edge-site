import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import sharp from 'sharp';
import { companyCertificates } from '../src/data/certificates.mjs';

const publicRoot = new URL('../public/', import.meta.url);
const sources = [
  ['hero', 'corncomp-factory-exterior.jpg', [640, 960, 1280, 1702], 68],
  ['customer:starbucks', 'customers/starbucks.png', [87], 82],
  ['brand-logo', 'corncomp-logo.png', [111, 222], 85],
  ...['disney', 'dorfin', 'metro', 'bunzl', 'marubeni', 'first-pack', 'gude', 'brenta'].map((name) => [`customer:${name}`, `customers/${name}.png`, [240], 82]),
  ...[1, 2, 3, 4, 5, 6].map((number) => [`trade-show:${number}`, `trade-shows/corncomp-exhibition-${number}.webp`, [400, 800, 1200], 84]),
  ...['v1/cups', 'v2/bowls', 'v1/icecream', 'v2/boxes', 'v1/straws', 'v2/tableware']
    .map((key) => [key, `generated/home-lifestyle-${key}.webp`, [240, 400, 600, 800, 1200], key === 'v2/tableware' ? 74 : 82]),
  ...companyCertificates().map((certificate) => ['certificate:' + certificate.key, certificate.image.src.slice('/media/'.length), [200, 320, 400, 640], 76]),
];
const images = {};
for (const [key, source, widths, quality] of sources) {
  const input = await readFile(new URL(`media/${source}`, publicRoot));
  // Changing either the source or encoding settings gives browsers a new URL.
  const hash = createHash('sha256').update(input).update(`webp-v1-${quality}-${sharp.versions.sharp}-${sharp.versions.vips}`).digest('hex').slice(0, 12);
  const candidates = [];
  for (const width of widths) {
    const src = `/media/optimized/${source}.${hash}-${width}.webp`;
    const destination = new URL(src.slice(1), publicRoot);
    await mkdir(new URL('./', destination), { recursive: true });
    try { await access(destination); } catch {
      await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(fileURLToPath(destination));
    }
    candidates.push(`${src} ${width}w`);
  }
  images[key] = {
    src: candidates.at(key === 'hero' ? -1 : Math.min(2, candidates.length - 1)).split(' ')[0],
    srcset: candidates.join(', '),
  };
}
// At <=480px the hero is at least 720px tall. Keep the existing 34% horizontal framing.
const mobileInput = await readFile(new URL('media/corncomp-factory-exterior.jpg', publicRoot));
const mobileMeta = await sharp(mobileInput).metadata();
const mobileCrop = { left: Math.round((mobileMeta.width - 900) * .34), top: 0, width: 900, height: mobileMeta.height };
const mobileHash = createHash('sha256').update(mobileInput).update(JSON.stringify(mobileCrop) + `mobile-68-${sharp.versions.sharp}-${sharp.versions.vips}`).digest('hex').slice(0, 12);
const mobileCandidates = [];
for (const width of [540, 720, 900]) {
  const src = `/media/optimized/corncomp-factory-mobile.${mobileHash}-${width}.webp`;
  const destination = new URL(src.slice(1), publicRoot);
  try { await access(destination); } catch {
    await sharp(mobileInput).extract(mobileCrop).resize({ width }).webp({ quality: 68, effort: 5 }).toFile(fileURLToPath(destination));
  }
  mobileCandidates.push(`${src} ${width}w`);
}
images.heroMobile = { src: mobileCandidates.at(-1).split(' ')[0], srcset: mobileCandidates.join(', '), width: 900, height: mobileMeta.height };
await writeFile(new URL('../src/data/home-images.json', import.meta.url), JSON.stringify(images, null, 2) + '\n');
console.log(`Prepared responsive WebP variants for ${sources.length} homepage images.`);
