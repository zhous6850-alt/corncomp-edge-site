import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('shared footer groups navigation separately from business contact details in every language', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    for (const key of ['home', 'architecture:contact']) {
      const route = routeFor(language, key);
      const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
      const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0] || '';
      assert.equal((footer.match(/<nav\b/g) || []).length, 2, `${language}: two navigation groups`);
      assert.match(footer, /<address\b/);
      assert.match(footer, /href="mailto:zhous6850@gmail.com"/);
      assert.match(footer, />zhous6850@gmail.com<\/a>/);
      assert.doesNotMatch(footer, /inquiry@corn-comp\.com/);
      assert.match(footer, /data-analytics-settings/);
      const social = footer.match(/<div[^>]*class="social-links"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
      assert.equal((social.match(/<img\b/g) || []).length, 4, `${language}: four brand icons`);
      for (const name of ['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp']) assert.ok(social.includes(`aria-label="${name}"`));
      const certificates = footer.match(/<div[^>]*class="footer-certificates"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
      for (const label of ['BRCGS', 'FSC', 'ISO 9001', 'BPI']) assert.ok(certificates.includes(label), `${language}: ${label} footer link`);
      assert.equal((certificates.match(/<a\b/g) || []).length, 4);
      assert.ok(certificates.includes(`href="${routeFor(language, 'architecture:quality')}#documents"`));
      assert.equal((footer.match(/data-support-topic/g) || []).length, 3, `${language}: three practical support topics`);
      assert.ok(footer.indexOf('footer-support') < footer.indexOf('footer-bottom'));
    }
  }
});
