import test from 'node:test';
import assert from 'node:assert/strict';
import { CUSTOM_TRANSLATIONS } from '../data/custom-translations.mjs';

test('custom packaging translations cover the same full set of page copy in every language', () => {
  const keys = Object.keys(CUSTOM_TRANSLATIONS.zh).sort();
  assert.ok(keys.length >= 255);
  for (const [language, dictionary] of Object.entries(CUSTOM_TRANSLATIONS)) {
    assert.deepEqual(Object.keys(dictionary).sort(), keys, language);
    for (const [source, target] of Object.entries(dictionary)) {
      assert.ok(target.trim(), `${language}: ${source}`);
      assert.ok(target !== source || (language === 'fr' && ['Construction', 'Dimensions', 'Documents ↓'].includes(source)), `${language}: untranslated ${source}`);
    }
    for (const title of ['Custom Packaging', 'Custom paper cups', 'Custom paper straws', 'Custom Printed Paper Cups and Lids']) {
      assert.ok(dictionary[title + ' | Corncomp'].endsWith(' | Corncomp'), language);
    }
  }
});

test('localized custom cup commercial terms preserve per-item quantities and lead time', () => {
  const source = 'The minimum order is 50,000 pieces per item for custom printed cups and 30,000 pieces per item for plain cups.';
  for (const [language, dictionary] of Object.entries(CUSTOM_TRANSLATIONS)) {
    assert.match(dictionary[source], /50[,. ]000/, language);
    assert.match(dictionary[source], /30[,. ]000/, language);
    assert.match(dictionary['Lead time: about 30 days from order confirmation.'], /30/, language);
    for (const heading of ['Listed rim (mm)', 'Black PLA reference', 'White PLA reference', 'Sleeves/carton', 'Natural kraft, vertical ripple', 'Natural kraft, horizontal ripple']) assert.ok(dictionary[heading], `${language}: ${heading}`);
  }
});
