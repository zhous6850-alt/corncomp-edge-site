import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from '../../../worker/index.mjs';
import { SUPPORTED_LANGUAGES, contentKeyFromRoute, normalizeLocalizedRoute, routeFor } from './localization.mjs';
import { languageFromPath } from './routes.mjs';

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

test('every rebuilt English internal link resolves directly without a redirect hop', () => {
  const broken = [];
  for (const file of htmlFiles(dist)) {
    const relative = path.relative(fileURLToPath(dist), fileURLToPath(file));
    if (/^(fr|es|ar)[\\/]/.test(relative)) continue;
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      const route = match[1].replaceAll('&amp;', '&').split(/[?#]/)[0];
      if (!route || route === '/' || route === '/api/inquiry' || routeExists(route)) continue;
      broken.push(`${file.pathname}: ${route}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('ordinary built content links never target a Worker redirect source', () => {
  const redirecting = [];
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    for (const match of main.matchAll(/<a\b([^>]*)href="(\/[^"?#]*)(?:[?#][^"]*)?"[^>]*>/g)) {
      const target = normalizeLocalizedRoute(match[2]);
      if (REDIRECTS.has(target)) redirecting.push(`${file.pathname}: ${target}`);
    }
  }
  assert.deepEqual(redirecting, []);
});

test('localized built-page internal links stay in the selected canonical language when synchronized', () => {
  const wrongLanguage = [];
  for (const file of htmlFiles(dist)) {
    const relative = path.relative(fileURLToPath(dist), fileURLToPath(file)).replaceAll('\\', '/');
    if (relative === '404.html') continue;
    const pageRoute = normalizeLocalizedRoute(relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '')}`);
    const language = languageFromPath(pageRoute);
    if (!SUPPORTED_LANGUAGES.includes(language)) continue;
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<a\b([^>]*)href="(\/[^"?#]*)(?:[?#][^"]*)?"[^>]*>/g)) {
      if (/\blang="(?:en|fr|es|ar)"/.test(match[0])) continue;
      const target = normalizeLocalizedRoute(match[2]);
      const contentKey = contentKeyFromRoute(target);
      if (!contentKey) continue;
      const expected = routeFor(language, contentKey);
      if (target !== expected) wrongLanguage.push(`${pageRoute}: ${target} -> ${expected}`);
    }
  }
  assert.deepEqual(wrongLanguage, []);
});
