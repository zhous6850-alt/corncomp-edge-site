import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from '../../../worker/index.mjs';

const dist = new URL('../../dist/', import.meta.url);

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    return entry.isDirectory() ? htmlFiles(location) : entry.name.endsWith('.html') ? [location] : [];
  });
}

function routeExists(route) {
  let decoded = route;
  try { decoded = decodeURIComponent(route); } catch {}
  const target = path.join(fileURLToPath(dist), decoded.replace(/^\//, ''));
  return existsSync(target) || existsSync(`${target}.html`) || existsSync(path.join(target, 'index.html'));
}

test('every rebuilt English internal link resolves to a page, asset, API endpoint or one-hop redirect', () => {
  const broken = [];
  for (const file of htmlFiles(dist)) {
    const relative = path.relative(fileURLToPath(dist), fileURLToPath(file));
    if (/^(fr|es|ar)[\\/]/.test(relative)) continue;
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      const route = match[1].replaceAll('&amp;', '&').split(/[?#]/)[0];
      if (!route || route === '/' || route === '/api/inquiry' || routeExists(route) || REDIRECTS.has(route)) continue;
      broken.push(`${file.pathname}: ${route}`);
    }
  }
  assert.deepEqual(broken, []);
});
