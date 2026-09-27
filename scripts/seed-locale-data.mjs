import { writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import records from '../site/src/data/records.json' with { type: 'json' };
import { englishInventory, normalizeLocalizedRoute, sourceHash } from '../site/src/lib/localization.mjs';
import { pageAlternates } from '../site/src/lib/site-config.mjs';

export function matchImportedRecord(english, records, language) {
  const candidates = records.filter((item) =>
    item.language === language
    && item.type === english.type
    && english.featuredMediaId
    && item.featuredMediaId === english.featuredMediaId);
  if (candidates.length > 1) {
    throw new Error(`Ambiguous ${language} match for ${english.slug}: ${candidates.map(({ slug }) => slug).join(', ')}`);
  }
  return candidates[0] || null;
}

function staticPageMatch(source, language) {
  if (source.type !== 'home' && source.type !== 'architecture') return null;
  const route = pageAlternates(source.route).find((entry) => entry.language === language)?.route;
  if (!route) return null;
  const candidates = records.filter((item) => item.language === language
    && item.type === 'page'
    && normalizeLocalizedRoute(item.route) === normalizeLocalizedRoute(route));
  if (candidates.length > 1) throw new Error(`Ambiguous ${language} route for ${source.contentKey}`);
  return candidates[0] || null;
}

function parseOptions(args) {
  if (args.length !== 4 || args[0] !== '--language' || !['fr', 'es', 'ar'].includes(args[1])
    || args[2] !== '--output' || !args[3]) {
    throw new Error('Usage: node scripts/seed-locale-data.mjs --language fr|es|ar --output <path>');
  }
  const output = resolve(args[3]);
  const localeDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../site/src/data/locales');
  const normalizedOutput = process.platform === 'win32' ? output.toLowerCase() : output;
  const normalizedDirectory = process.platform === 'win32' ? localeDirectory.toLowerCase() : localeDirectory;
  if (normalizedOutput === normalizedDirectory || normalizedOutput.startsWith(`${normalizedDirectory}${sep}`)) {
    throw new Error('Refusing to write inside site/src/data/locales');
  }
  return { language: args[1], output };
}

async function main(args) {
  const { language, output } = parseOptions(args);
  const content = {};
  const report = { matched: 0, unmatched: 0, ambiguous: 0 };
  for (const source of englishInventory()) {
    let imported;
    try {
      imported = staticPageMatch(source, language)
        || (source.type === 'product' || source.type === 'post' ? matchImportedRecord(source, records, language) : null);
    } catch (error) {
      if (!/^Ambiguous /.test(error.message)) throw error;
      report.ambiguous += 1;
      continue;
    }
    if (!imported) {
      report.unmatched += 1;
      continue;
    }
    content[source.contentKey] = {
      route: normalizeLocalizedRoute(imported.route),
      title: imported.title,
      body: imported.body,
      seo: imported.seo,
      sourceHash: sourceHash(source),
    };
    report.matched += 1;
  }
  await writeFile(output, `${JSON.stringify({
    _meta: { language, sourceLanguage: 'en', synchronizedOn: null }, content,
  }, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
