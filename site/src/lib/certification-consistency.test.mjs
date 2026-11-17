import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import records from '../data/records.json' with { type: 'json' };
import { localeData, SUPPORTED_LANGUAGES } from './localization.mjs';

test('BPI/FSC article keeps explicit company scope and verification links in every language', () => {
  const commercialOnly = { en: 'This document covers commercial compostability only', fr: 'Ce document couvre uniquement le compostage industriel', es: 'Este documento cubre únicamente el compostaje industrial', ar: 'تغطي هذه الوثيقة التسميد الصناعي فقط', zh: '这份证书仅涉及工业堆肥', de: 'Dieses Dokument gilt nur für industrielle Kompostierung' };
  for (const language of SUPPORTED_LANGUAGES) {
    const body = language === 'en' ? records.find(row => row.id === 331).body : localeData(language).content['post:bpi-vs-fsc-certification'].bodyHtml;
    for (const value of ['RINA-COC-001953', '10529571-1', '352 g/m²', 'https://search.fsc.org/', 'https://products.bpiworld.org/companies/ningbo-corncomp-tech-co-ltd']) assert.ok(body.includes(value), `${language}: ${value}`);
    assert.doesNotMatch(body, /PLA and bagasse items carry BPI|claim that doesn’t hold up/);
    assert.ok(body.includes(commercialOnly[language]), `${language}: Corncomp certificate must not imply home certification`);
  }
});

test('Quality page gives buyers official FSC and company-specific BPI verification routes', () => {
  const source = readFileSync(new URL('../components/QualityPage.astro', import.meta.url), 'utf8');
  assert.ok(source.includes('https://search.fsc.org/'));
  assert.ok(source.includes('https://products.bpiworld.org/companies/ningbo-corncomp-tech-co-ltd'));
});
