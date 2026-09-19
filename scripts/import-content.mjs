import { readFile, mkdir, writeFile } from 'node:fs/promises';
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

export function importRecord(record, metaById, mediaById) {
  const meta = metaById.get(record.id) || {};
  const media = mediaById.get(record.featuredMediaId);
  return {
    ...record,
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

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function run(sourceDirectory, outputDirectory) {
  const [records, media, terms, rankMath, custom] = await Promise.all([
    readJson(path.join(sourceDirectory, 'records.json')),
    readJson(path.join(sourceDirectory, 'media.json')),
    readJson(path.join(sourceDirectory, 'terms.json')),
    readJson(path.join(sourceDirectory, 'rank-math-postmeta.json')),
    readJson(path.join(sourceDirectory, 'custom-postmeta.json')),
  ]);
  const metaById = groupMeta([...rankMath, ...custom]);
  const mediaById = new Map(media.map((item) => [item.id, item]));
  const imported = records.map((record) => importRecord(record, metaById, mediaById));
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, 'records.json'), `${JSON.stringify(imported, null, 2)}\n`),
    writeFile(path.join(outputDirectory, 'categories.json'), `${JSON.stringify(terms, null, 2)}\n`),
    writeFile(path.join(outputDirectory, 'media.json'), `${JSON.stringify(media.map((item) => ({ ...item, localPath: mediaLocalPath(item) })), null, 2)}\n`),
  ]);
  console.log(`Imported ${imported.length} records and ${media.length} media entries.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = path.resolve(process.argv[2] || 'migration/source');
  const output = path.resolve(process.argv[3] || 'site/src/data');
  run(source, output).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
