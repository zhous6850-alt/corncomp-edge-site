import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function groupMeta(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const id = Number(row.post_id ?? row.term_id);
    const meta = grouped.get(id) || {};
    meta[row.meta_key] = row.meta_value;
    grouped.set(id, meta);
  }
  return grouped;
}

export function mediaLocalPath(media) {
  const rawName = decodeURIComponent(new URL(media.source_url).pathname.split('/').pop() || `media-${media.id}`);
  const safeName = rawName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
  return `/media/wp/${media.id}-${safeName}`;
}

export function rewriteMediaUrls(html, mediaItems) {
  let rewritten = html;
  for (const media of mediaItems) {
    const localPath = mediaLocalPath(media);
    const urls = [
      media.source_url,
      ...Object.values(media.media_details?.sizes || {}).map((size) => size.source_url),
    ].filter(Boolean);
    for (const url of urls) rewritten = rewritten.replaceAll(url, localPath);
  }
  return rewritten;
}

export function embeddedAssetLocalPath(url) {
  const rawName = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'asset');
  const safeName = rawName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
  const fingerprint = createHash('sha256').update(url).digest('hex').slice(0, 8);
  return `/media/embedded/${fingerprint}-${safeName}`;
}

export function extractEmbeddedAssets(records) {
  const urls = new Set();
  const pattern = /https:\/\/corn-comp\.com\/wp-content\/(?:uploads|uploads-webpc\/uploads)\/[^\s"'<>\)]+/g;
  for (const record of records) {
    for (const field of [record.body, record.excerpt]) {
      for (const match of (field || '').matchAll(pattern)) urls.add(match[0]);
    }
  }
  return [...urls].sort().map((url) => ({
    id: `embedded-${createHash('sha256').update(url).digest('hex').slice(0, 8)}`,
    source_url: url,
    localPath: embeddedAssetLocalPath(url),
  }));
}

export function rewriteInquiryForms(html) {
  return html
    .replace(/<form\s+action="[^"]*wp-json[^"]*"([^>]*)class="([^"]*wpcf7-form[^"]*)"/g, '<form action="/api/inquiry"$1class="$2 corncomp-inquiry-form"')
    .replace(/<fieldset class="hidden-fields-container">[\s\S]*?<\/fieldset>/g, '<input class="inquiry-honeypot" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">')
    .replace(/value="([^"]*)" (type="(?:text|email|tel)" name="your-(?:name|email|phone)")/g, 'value="" placeholder="$1" $2')
    .replace(/<textarea([^>]*name="your-message"[^>]*)>([\s\S]*?)<\/textarea>/g, '<textarea$1 placeholder="$2"></textarea>')
    .replace(/(<form[^>]*corncomp-inquiry-form[\s\S]*?)(<\/form>)/g, '$1<p id="inquiry-sent" class="inquiry-success" role="status">Thank you. Your inquiry has been sent.</p>$2');
}

function rewriteEmbeddedAssets(record, assets) {
  let body = record.body;
  let excerpt = record.excerpt;
  for (const asset of assets) {
    body = body.replaceAll(asset.source_url, asset.localPath);
    excerpt = excerpt.replaceAll(asset.source_url, asset.localPath);
  }
  return { ...record, body, excerpt };
}

export function importRecord(record, metaById, mediaById, mediaItems = []) {
  const meta = metaById.get(record.id) || {};
  const media = mediaById.get(record.featuredMediaId);
  return {
    ...record,
    body: rewriteInquiryForms(rewriteMediaUrls(record.body, mediaItems)),
    excerpt: rewriteMediaUrls(record.excerpt, mediaItems),
    seo: {
      title: meta.rank_math_title || record.seo.title || '',
      description: meta.rank_math_description || record.seo.description || '',
      focusKeyword: meta.rank_math_focus_keyword || '',
      canonical: meta.rank_math_canonical_url || '',
    },
    featuredMedia: media ? {
      id: media.id,
      sourceUrl: media.source_url,
      localPath: mediaLocalPath(media),
      alt: media.alt_text || '',
    } : null,
    custom: Object.fromEntries(Object.entries(meta).filter(([key]) => key.startsWith('_cc_'))),
  };
}

export function importCategory(category, metaById) {
  const meta = metaById.get(category.id) || {};
  return {
    ...category,
    route: new URL(category.link).pathname,
    seo: {
      title: meta.rank_math_title || category.name,
      description: meta.rank_math_description || category.description || '',
      focusKeyword: meta.rank_math_focus_keyword || '',
      canonical: meta.rank_math_canonical_url || '',
    },
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function run(sourceDirectory, outputDirectory) {
  const [records, media, terms, rankMath, termRankMath, custom] = await Promise.all([
    readJson(path.join(sourceDirectory, 'records.json')),
    readJson(path.join(sourceDirectory, 'media.json')),
    readJson(path.join(sourceDirectory, 'terms.json')),
    readJson(path.join(sourceDirectory, 'rank-math-postmeta.json')),
    readJson(path.join(sourceDirectory, 'rank-math-termmeta.json')),
    readJson(path.join(sourceDirectory, 'custom-postmeta.json')),
  ]);
  const metaById = groupMeta([...rankMath, ...custom]);
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const initiallyImported = records.map((record) => importRecord(record, metaById, mediaById, media));
  const embeddedAssets = extractEmbeddedAssets(initiallyImported);
  const imported = initiallyImported.map((record) => rewriteEmbeddedAssets(record, embeddedAssets));
  const importedCategories = terms.map((category) => importCategory(category, groupMeta(termRankMath)));
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, 'records.json'), `${JSON.stringify(imported, null, 2)}\n`),
    writeFile(path.join(outputDirectory, 'categories.json'), `${JSON.stringify(importedCategories, null, 2)}\n`),
    writeFile(path.join(outputDirectory, 'media.json'), `${JSON.stringify(media.map((item) => ({ ...item, localPath: mediaLocalPath(item) })), null, 2)}\n`),
    writeFile(path.join(outputDirectory, 'embedded-assets.json'), `${JSON.stringify(embeddedAssets, null, 2)}\n`),
  ]);
  console.log(`Imported ${imported.length} records, ${media.length} media entries, and ${embeddedAssets.length} embedded assets.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = path.resolve(process.argv[2] || 'migration/source');
  const output = path.resolve(process.argv[3] || 'site/src/data');
  run(source, output).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
