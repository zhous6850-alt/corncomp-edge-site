import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseFragment } from 'parse5';
import { FACTORY_TRANSLATIONS } from '../data/factory-translations.mjs';
import { FAQ_TRANSLATIONS } from '../data/faq-translations.mjs';
import { FAQ_GROUPS } from '../data/faq.mjs';

const languages = ['fr', 'es', 'ar', 'zh', 'de'];
const items = FAQ_GROUPS.flatMap(group => group.items);
const answer = id => items.find(item => item.id === id).answer;

test('Factory and FAQ dictionaries have exact source-key parity across all five locales', () => {
  for (const dictionaries of [FACTORY_TRANSLATIONS, FAQ_TRANSLATIONS]) {
    assert.deepEqual(Object.keys(dictionaries).sort(), [...languages].sort());
    const keys = Object.keys(dictionaries.fr).sort();
    for (const language of languages) {
      assert.deepEqual(Object.keys(dictionaries[language]).sort(), keys, language);
      for (const [source, translation] of Object.entries(dictionaries[language])) {
        assert.ok(typeof translation === 'string' && translation.trim(), language + ': ' + source);
      }
    }
  }
});

test('every English FAQ topic, question, complete answer and linked label has a translation', () => {
  for (const language of languages) for (const group of FAQ_GROUPS) {
    const dictionary = FAQ_TRANSLATIONS[language];
    for (const source of [group.title, group.description]) assert.ok(dictionary[source], language + ': ' + source);
    for (const item of group.items) {
      for (const source of [item.question, item.answer, ...(item.link ? [item.link[0]] : [])]) {
        assert.ok(dictionary[source], language + ': ' + source);
      }
    }
  }
});

test('Factory and FAQ dictionaries cover static rendered text nodes and accessible labels', () => {
  for (const [component, dictionaries] of [['FactoryPage', FACTORY_TRANSLATIONS], ['FaqPage', FAQ_TRANSLATIONS]]) {
    const source = readFileSync(new URL('../components/' + component + '.astro', import.meta.url), 'utf8');
    const markup = source.split('---')[2];
    const strings = new Set();
    const normalize = value => value.trim().replace(/\s+/g, ' ');
    function visit(node) {
      if (['style', 'script'].includes(node.tagName)) return;
      if (node.nodeName === '#text' && node.value.trim() && !/[{}]/.test(node.value) && /[A-Za-z]/.test(node.value)) {
        strings.add(normalize(node.value));
      }
      for (const attr of node.attrs || []) {
        if (['alt', 'aria-label', 'description'].includes(attr.name) && !attr.value.includes('{')) strings.add(normalize(attr.value));
      }
      for (const child of node.childNodes || []) visit(child);
    }
    visit(parseFragment(markup));
    strings.delete('m²');
    for (const language of languages) for (const string of strings) {
      assert.ok(dictionaries[language][string], component + ' / ' + language + ': ' + string);
    }
  }
});

test('localized technical answers retain numeric limits, named materials and distinct document holders', () => {
  for (const language of languages) {
    const dictionary = FAQ_TRANSLATIONS[language];
    const minimum = dictionary[answer('minimum-order')].replace(/[,.\s]/g, '');
    assert.ok(minimum.includes('30000') && minimum.includes('50000'), language + ': MOQ quantities');
    assert.match(dictionary[answer('lead-time')], /30/, language + ': approximate production time');
    assert.match(dictionary[answer('certificates')], /352/, language + ': BPI grammage limit');
    for (const term of ['BPI', 'DIN']) assert.ok(dictionary[answer('certificates')].includes(term), language + ': ' + term);
    for (const term of ['PP', 'PET']) assert.ok(dictionary[answer('compostability')].includes(term), language + ': ' + term);
    for (const term of ['OEM', 'ODM']) assert.ok(dictionary[answer('oem-odm')].includes(term), language + ': ' + term);
    for (const [source, translated] of Object.entries(FACTORY_TRANSLATIONS[language])) {
      for (const year of ['2018', '2023', '2024', '2026']) {
        if (source.includes(year)) assert.ok(translated.includes(year), language + ': ' + year);
      }
      for (const term of ['Millionpack', 'Plastik', 'Jieyu', 'PLA', 'PP', 'GMP']) {
        if (new RegExp("\\b"+term+"\\b").test(source)) assert.ok(translated.includes(term), language + ': ' + term);
      }
    }
  }
});

test('translations retain the certificate scope qualifications and sample-charge conditions', () => {
  const qualifications = {
    fr: { certificate: [/titulaires différents/, /pas l’ensemble des produits finis/], samples: [/disponibilité/, /éventuels frais/, /avant l’envoi/], compostability: /n’affirmons pas/ },
    es: { certificate: [/titulares distintos/, /no todos los productos terminados/], samples: [/disponibilidad/, /posibles cargos/, /antes del envío/], compostability: /No afirmamos/ },
    ar: { certificate: [/حاملان مختلفان/, /وليس جميع المنتجات النهائية/], samples: [/توافر/, /أي رسوم/, /قبل الإرسال/], compostability: /ولا ندّعي/ },
    zh: { certificate: [/持有人不同/, /并非覆盖所有成品/], samples: [/是否可提供/, /样品费或定制费/, /发出前/], compostability: /不声称/ },
    de: { certificate: [/unterschiedliche Inhaber/, /nicht sämtliche Fertigprodukte/], samples: [/Musterverfügbarkeit/, /etwaige Muster- oder Anpassungskosten/, /vor dem Versand/], compostability: /behaupten nicht/ },
  };
  for (const language of languages) {
    const dictionary = FAQ_TRANSLATIONS[language];
    for (const pattern of qualifications[language].certificate) assert.match(dictionary[answer('certificates')], pattern, language);
    for (const pattern of qualifications[language].samples) assert.match(dictionary[answer('samples')], pattern, language);
    assert.match(dictionary[answer('compostability')], qualifications[language].compostability, language);
  }
});
