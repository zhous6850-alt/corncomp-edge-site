import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, localizedEntry, routeFor } from './localization.mjs';

const built = (route) => readFile(new URL(`../../dist/${route === '/' ? '' : route.slice(1)}index.html`, import.meta.url), 'utf8');

test('all homepages show the supplied factory photograph and retain localized headings and destinations', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await built(routeFor(language, 'home'));
    const hero = html.match(/<section\b[^>]*class="home-hero"[^>]*>([\s\S]*?)<\/section>/)[1];
    assert.match(hero, /src="\/media\/optimized\/corncomp-factory-exterior.jpg\.[a-f0-9]{12}-1702.webp"/);
    assert.match(hero, /width="1702" height="1276"/);
    assert.doesNotMatch(hero, /beverage service|service des boissons|服务的 Corncomp 纸质食品容器/);
    assert.ok(hero.includes(localizedEntry(language, 'home').hero.heading));
    assert.match(hero, /class="home-hero-emphasis"/);
    assert.ok(hero.includes(`href="${routeFor(language, 'architecture:products')}"`));
    assert.ok(hero.includes(`href="${routeFor(language, 'architecture:contact')}"`));
    assert.match(html, /<header[^>]*class="[^"]*site-header--overlay/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
});

test('inner pages retain their normal header rather than the homepage overlay', async () => {
  const html = await built('/contact/');
  const header = html.match(/<header\b[^>]*>/)[0];
  assert.doesNotMatch(header, /site-header--overlay/);
});

test('factory image gently zooms automatically with a reduced-motion opt-out', async () => {
  const css = await readFile(new URL('../styles/global.css', import.meta.url), 'utf8');
  assert.match(css, /\.home-hero-media img\s*\{[^}]*animation:\s*factory-hero-zoom 20s ease-in-out infinite alternate/);
  assert.match(css, /@keyframes factory-hero-zoom\s*\{\s*from\s*\{\s*transform:\s*scale\(1\);?\s*\}\s*to\s*\{\s*transform:\s*scale\(1\.1\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.home-hero-media img\s*\{[^}]*animation:\s*none/);
});
