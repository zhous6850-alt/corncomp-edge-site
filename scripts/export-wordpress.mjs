import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const SITE = 'https://corn-comp.com';

export function normalizeRecord(record) {
  const url = new URL(record.link, SITE);
  const routeLanguage = url.pathname.match(/^\/(es|fr|ar)(?:\/|$)/)?.[1];
  return {
    id: record.id,
    type: record.type,
    slug: record.slug,
    language: record.lang || routeLanguage || 'en',
    route: url.pathname,
    title: record.title?.rendered || '',
    body: record.content?.rendered || '',
    excerpt: record.excerpt?.rendered || '',
    featuredMediaId: record.featured_media || 0,
    seo: {
      title: record.meta?.rank_math_title || '',
      description: record.meta?.rank_math_description || '',
    },
  };
}

export async function fetchAllPages(endpoint, fetcher = fetch) {
  const records = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(endpoint, SITE);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`WordPress REST ${response.status}: ${url.pathname}`);
    records.push(...await response.json());
    totalPages = Number(response.headers.get('x-wp-totalpages') || 1);
    page += 1;
  } while (page <= totalPages);

  return records;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function exportSite(outputDirectory) {
  const [pages, posts, products, categories, media] = await Promise.all([
    fetchAllPages('/wp-json/wp/v2/pages?status=publish'),
    fetchAllPages('/wp-json/wp/v2/posts?status=publish'),
    fetchAllPages('/wp-json/wp/v2/product?status=publish'),
    fetchAllPages('/wp-json/wp/v2/product_cat?hide_empty=false'),
    fetchAllPages('/wp-json/wp/v2/media?status=inherit'),
  ]);
  const normalized = [...pages, ...posts, ...products].map(normalizeRecord);
  const routes = normalized.map(({ id, type, language, route, title }) => ({ id, type, language, route, title }));
  const files = {
    'site-info.json': stableJson({ source: SITE, exportedAt: new Date().toISOString(), counts: { pages: pages.length, posts: posts.length, products: products.length, categories: categories.length, media: media.length } }),
    'routes.json': stableJson(routes),
    'records.json': stableJson(normalized),
    'terms.json': stableJson(categories),
    'media.json': stableJson(media),
  };

  await mkdir(outputDirectory, { recursive: true });
  const checksums = [];
  for (const [name, contents] of Object.entries(files)) {
    await writeFile(path.join(outputDirectory, name), contents, 'utf8');
    checksums.push(`${createHash('sha256').update(contents).digest('hex')}  ${name}`);
  }
  await writeFile(path.join(outputDirectory, 'checksums.sha256'), `${checksums.join('\n')}\n`, 'utf8');
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputDirectory = path.resolve(process.argv[2] || 'migration/source');
  exportSite(outputDirectory)
    .then((files) => console.log(`Exported ${Object.keys(files).length} files to ${outputDirectory}`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
