import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, readdir, mkdir, copyFile, access } from 'node:fs/promises';
import { parse } from 'parse5';
import sharp from 'sharp';
import { VISUAL_MEDIA } from '../src/data/visual-media.mjs';

const dist = new URL('../dist/', import.meta.url);
const cache = new URL('../.astro/image-cache/', import.meta.url);
const protectedSources = new Set(VISUAL_MEDIA.filter((image) => image.evidence === 'certificate').map((image) => image.src));
const variants = new Map();
const report = { pages: 0, imageOccurrences: 0, sources: [] };
await mkdir(cache, { recursive: true });
await mkdir(new URL('media/optimized/site/', dist), { recursive: true });

async function responsive(src) {
  if (variants.has(src)) return variants.get(src);
  const file = new URL(src.slice(1), dist);
  const input = await readFile(file);
  const metadata = await sharp(input).metadata();
  if (metadata.width < 600 || metadata.pages > 1 || input.length < 20000) {
    variants.set(src, null);
    return null;
  }
  const hash = createHash('sha256').update(input).update(`site-webp-v1-84-${sharp.versions.sharp}-${sharp.versions.vips}`).digest('hex').slice(0, 16);
  const widths = [...new Set([320, 480, 768, 1200, 1600, Math.min(metadata.width, 1920)].filter((width) => width <= metadata.width))].sort((a, b) => a - b);
  const candidates = [];
  const sizes = [];
  for (const width of widths) {
    const name = `${hash}-${width}.webp`;
    const cached = new URL(name, cache);
    try { await access(cached); } catch {
      await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 100, effort: 4 }).toFile(fileURLToPath(cached));
    }
    await copyFile(cached, new URL(`media/optimized/site/${name}`, dist));
    candidates.push(`/media/optimized/site/${name} ${width}w`);
    sizes.push({ width, bytes: (await readFile(cached)).length });
  }
  const srcset = candidates.join(', ');
  variants.set(src, srcset);
  report.sources.push({ src, originalBytes: input.length, variants: sizes });
  return srcset;
}

async function optimize(file) {
  const html = await readFile(file, 'utf8');
  const images = [];
  function visit(node, protectedParent = false) {
    const attrs = Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
    const protectedNode = protectedParent || node.tagName === 'dialog' || 'data-certificate' in attrs || 'data-overview' in attrs;
    const src = attrs.src;
    if (node.tagName === 'img' && !protectedNode && !attrs.srcset && /^\/media\/.+\.(?:jpe?g|png|webp)$/i.test(src || '') &&
        !protectedSources.has(src) && !/\/optimized\/|\/customers\/|logo|icon|certificate|certificat|brcgs|\bbpi\b|\bfsc\b|din-.+-overview/i.test(src)) {
      images.push({ node, attrs });
    }
    for (const child of node.childNodes || []) visit(child, protectedNode);
  }
  visit(parse(html, { sourceCodeLocationInfo: true }));
  const changes = [];
  for (const { node, attrs } of images) {
    const srcset = await responsive(attrs.src);
    if (!srcset) continue;
    const lazy = attrs.loading === 'lazy';
    // Native auto sizing uses the actual rendered width for lazy images, including cards.
    const sizes = lazy ? 'auto, 100vw' : '100vw';
    const start = node.sourceCodeLocation.startTag;
    const offset = start.endOffset - (html[start.endOffset - 2] === '/' ? 2 : 1);
    changes.push({ offset, text: ` srcset="${srcset}" sizes="${sizes}"` });
    report.imageOccurrences++;
  }
  if (!changes.length) return;
  let updated = html;
  for (const { offset, text } of changes.sort((a, b) => b.offset - a.offset)) updated = updated.slice(0, offset) + text + updated.slice(offset);
  await writeFile(file, updated);
  report.pages++;
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) await walk(url);
    else if (entry.name.endsWith('.html')) await optimize(url);
  }
}
await walk(dist);
await writeFile(new URL('../.astro/image-performance.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`Responsive images: ${report.pages} pages, ${report.imageOccurrences} placements, ${report.sources.length} unique sources. Certificate originals preserved.`);
