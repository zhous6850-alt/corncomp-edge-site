import { readFile, writeFile } from 'node:fs/promises';
import { companyCertificates } from '../src/data/certificates.mjs';

// A code-native layout of unmodified certificate scans, not generated certificate artwork.
const keys = ['brcgs-packaging', 'fsc-coc', 'iso-9001', 'bpi-straws'];
const labels = ['BRCGS', 'FSC', 'ISO 9001', 'BPI'];
const certificates = companyCertificates('en');
const panels = await Promise.all(keys.map(async (key, index) => {
  const { image } = certificates.find(certificate => certificate.key === key);
  const bytes = await readFile(new URL('../public' + image.src, import.meta.url));
  const mime = image.src.endsWith('.png') ? 'image/png' : image.src.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const x = 64 + index * 384;
  return `<image x="${x}" y="138" width="320" height="500" preserveAspectRatio="xMidYMid meet" href="data:${mime};base64,${bytes.toString('base64')}"/><text x="${x + 160}" y="714" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="#1d3826">${labels[index]}</text>`;
}));
await writeFile(new URL('../public/media/about/corncomp-certificate-preview.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#e5e8df"/>${panels.join('')}</svg>`);
