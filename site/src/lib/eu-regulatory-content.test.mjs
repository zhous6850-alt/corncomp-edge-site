import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with { type: 'json' };
import { localeData, SUPPORTED_LANGUAGES } from './localization.mjs';

test('EU packaging article distinguishes scope from prohibition and cites reviewed official sources in all languages', () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const body = language === 'en' ? records.find(row => row.id === 336).body : localeData(language).content['post:eu-single-use-plastics-directive-explained'].bodyHtml;
    for (const value of ['2019/904', '2025/40', '1935/2004', 'PLA', 'PE', 'EN 13432', 'ASTM D6400', 'datetime="2026-11-02"', '52026XC04813', 'food.ec.europa.eu']) assert.ok(body.includes(value), `${language}: ${value}`);
    assert.doesNotMatch(body, /these material categories sit outside|equivalent EN 13432|most independent compliance-sector summaries/);
  }
});

test('English EU article does not treat compostability or material labels as a compliance passport', () => {
  const body = records.find(row => row.id === 336).body;
  assert.ok(body.includes('does not mean every product is banned'));
  assert.ok(body.includes('does not exempt a PLA straw'));
  assert.ok(body.includes('does not establish PPWR compliance'));
  assert.ok(body.includes('A US FDA claim is not a substitute'));
});
