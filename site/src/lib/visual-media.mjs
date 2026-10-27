import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { VISUAL_MEDIA, CONTENT_MEDIA } from '../data/visual-media.mjs';
import { COMPANY_CERTIFICATES, SUPPLY_CHAIN_DOCUMENTS } from '../data/certificates.mjs';

const LANGUAGES = ['en', 'fr', 'es', 'ar', 'zh', 'de'];
const EVIDENCE = new Set(['product', 'factory', 'certificate', 'application', 'decorative']);
const mediaByKey = new Map(VISUAL_MEDIA.map((entry) => [entry.key, entry]));

const resolved = (entry, language) => entry && ({
  key: entry.key,
  src: entry.src,
  width: entry.width,
  height: entry.height,
  alt: entry.alt[language],
  fit: entry.fit,
  position: entry.position,
  evidence: entry.evidence,
});

const requireLanguage = (language) => {
  if (!LANGUAGES.includes(language)) throw new Error(`Unsupported visual media language: ${language}`);
};

export function mediaListFor(contentKey, language = 'en') {
  requireLanguage(language);
  return (Object.hasOwn(CONTENT_MEDIA, contentKey) ? CONTENT_MEDIA[contentKey] : [])
    .map((key) => resolved(mediaByKey.get(key), language)).filter(Boolean);
}

export function mediaFor(contentKey, language = 'en') {
  return mediaListFor(contentKey, language)[0] ?? null;
}

export function validateVisualMedia({
  publicDir,
  media = VISUAL_MEDIA,
  assignments = CONTENT_MEDIA,
  certificates = [...COMPANY_CERTIFICATES, ...SUPPLY_CHAIN_DOCUMENTS],
}) {
  const errors = [];
  const known = new Map();
  const assetExists = (url) => url?.startsWith('/') && !url.includes('..') && existsSync(join(publicDir, url.slice(1)));

  for (const item of media) {
    if (known.has(item.key)) errors.push(`${item.key}: duplicate media key`);
    known.set(item.key, item.evidence);
    if (!EVIDENCE.has(item.evidence)) errors.push(`${item.key}: invalid evidence value`);
    if (!(item.width > 0 && item.height > 0)) errors.push(`${item.key}: invalid image dimensions`);
    for (const language of LANGUAGES) {
      if (!Object.hasOwn(item.alt ?? {}, language) || (item.evidence !== 'decorative' && !item.alt[language]?.trim())) {
        errors.push(`${item.key}: missing ${language} alt text`);
      }
    }
    if (item.required && !assetExists(item.src)) errors.push(`${item.key}: missing required asset ${item.src}`);
  }
  for (const [contentKey, keys] of Object.entries(assignments)) {
    for (const key of keys) if (!known.has(key)) errors.push(`${contentKey}: unknown media key ${key}`);
  }
  for (const record of certificates) {
    for (const field of ['key', 'title', 'holder', 'certificateNumber', 'standard', 'scope', 'validUntil']) {
      if (!record[field] || (typeof record[field] === 'string' && !record[field].trim())) {
        errors.push(`${record.key ?? 'certificate'}: missing ${field}`);
      }
    }
    for (const field of ['title', 'scope']) {
      for (const language of LANGUAGES) {
        if (!record[field]?.[language]?.trim()) errors.push(`${record.key ?? 'certificate'}: missing ${language} ${field}`);
      }
    }
    if (record.group === 'company') {
      if (!assignments[record.imageKey]?.some((key) => known.get(key) === 'certificate')) errors.push(`${record.key}: missing company certificate image`);
    } else if (record.group === 'supplyChain') {
      if (!record.documentUrl || !assetExists(record.documentUrl)) errors.push(`${record.key}: missing supply-chain document ${record.documentUrl ?? ''}`);
    } else errors.push(`${record.key}: invalid certificate group`);
  }
  return errors;
}
