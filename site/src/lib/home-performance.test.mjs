import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync }from 'node:fs';
const home=readFileSync(new URL('../components/HomePage.astro',import.meta.url),'utf8');
const layout=readFileSync(new URL('../layouts/BaseLayout.astro',import.meta.url),'utf8');
test('home requests a small-screen source and mutually exclusive responsive image preloads',()=>{
 assert.match(home,/<picture>/);
 assert.match(home,/heroMobile/);
 assert.equal((home.match(/rel="preload"/g)||[]).length,2);
 assert.ok(home.includes('(max-width: 480px)'));
 assert.ok(home.includes('not all and (max-width: 480px)'));
 assert.equal((home.match(/imagesrcset=/g)||[]).length,2);
 assert.ok(layout.indexOf('<slot name="head"')<layout.indexOf('<style is:inline'));
});
test('original factory area, image alt, desktop source and motion styling remain',()=>{
 assert.ok(home.includes('6,800 m²'));
 assert.ok(home.includes('alt={factoryAlt}'));
 assert.ok(home.includes('{...homeImages.hero}'));
 const css=readFileSync(new URL('../styles/global.css',import.meta.url),'utf8');
 assert.ok(css.includes('object-position: 34% center'));
 assert.ok(css.includes('animation: factory-hero-zoom'));
});
