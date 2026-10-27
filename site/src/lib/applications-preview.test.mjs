import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('applications preview exposes five scenes and contextual supermarket enquiry',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/index.html',import.meta.url),'utf8');
 assert.equal((html.match(/class="scene-card/g)||[]).length,5);
 assert.ok(html.includes('Supermarket'));
 assert.ok(html.includes('category=Supermarket'));
 assert.ok(html.includes('id="scene-5"'));
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.includes('<table'));
 const submenu=html.match(/<details class="applications-menu"[\s\S]*?<\/details>/)?.[0];
 assert.ok(submenu);
 assert.equal((submenu.match(/<a /g)||[]).length,6);
 assert.ok(submenu.includes('/design-preview/applications/supermarket-packaging/'));
 for(const label of ['Takeaway','Restaurant','Fast Food','Ice Cream','Supermarket'])assert.ok(submenu.includes(label));
 const images=[...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.includes('logo'));
 assert.equal(new Set(images).size,images.length);
});
