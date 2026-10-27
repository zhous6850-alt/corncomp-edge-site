import { mkdir, writeFile } from 'node:fs/promises';
import { englishInventory, routeFor } from '../site/src/lib/localization.mjs';
import coverage from '../site/src/data/catalogue-coverage.json' with { type: 'json' };
const products = englishInventory().filter(item => item.type === 'product');
const entries = products.map((item, index) => ({
  index: index + 1, slug: item.slug, title: item.title, image: item.featuredMedia?.localPath,
  route: routeFor('en', item.contentKey), pdfPage: coverage.find(row => row.productSlug === item.slug)?.pdfPage,
}));
await mkdir('tmp/product-image-review', { recursive: true });
await writeFile('tmp/product-image-review/inventory.json', JSON.stringify(entries, null, 2));
console.log(`Indexed ${entries.length} product main images.`);
