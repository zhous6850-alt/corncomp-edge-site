const itemCodePattern = /\b(?:CC[\dA-Z.-]+|MYPLABAG)\b/g;
const numberPattern = /\b\d+(?:\.\d+)?(?:\s*[×x/]\s*\d+(?:\.\d+)?)*(?!\d)/g;

export function factTokens(html = '') {
  const cleaned = html
    .replace(/(\d)\s*(?:&#215;|&#x0*d7;|&times;|×|x)\s*(?=\d)/gi, '$1 x ')
    .replace(/&#\d+;|&#x[\da-f]+;|&[a-z]+;/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return [...new Set([
    ...(html.match(itemCodePattern) || []),
    ...(html.match(itemCodePattern) || []).flatMap((code) => code.match(/\d+\.\d+/g) || []),
    ...(cleaned.match(numberPattern) || []),
  ])].sort();
}

export function assertFactParity(sourceRecord, localizedHtml) {
  const localized = new Set(factTokens(localizedHtml));
  const missing = factTokens(sourceRecord.body).filter((token) => !localized.has(token));
  if (missing.length) throw new Error(`${sourceRecord.slug}: missing facts ${missing.join(', ')}`);
}

const blocks = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((match) => match[1]);
const cellText = (html) => html.replace(/<[^>]+>/g, '').trim();

export function extractProductFacts(record) {
  const tables = blocks(record.body, 'table').map((table) => {
    const heads = blocks(table, 'thead');
    const bodies = blocks(table, 'tbody');
    const headers = heads.length === 1 ? blocks(heads[0], 'th').map(cellText) : [];
    const rows = bodies.length === 1 ? blocks(bodies[0], 'tr').map((row) => blocks(row, 'td').map(cellText)) : [];
    if (heads.length !== 1 || bodies.length !== 1 || !headers.length || !rows.length || rows.some((row) => row.length !== headers.length)) {
      throw new Error(`${record.slug}: inconsistent specification table`);
    }
    return { headers, rows };
  });
  if (tables.length !== (record.body.match(/<table\b/gi) || []).length) {
    throw new Error(`${record.slug}: inconsistent specification table`);
  }
  return { tables, itemCodes: [...new Set(record.body.match(itemCodePattern) || [])] };
}

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function localizedProductBody(entry, facts, ui) {
  const tables = facts.tables.map(({ headers, rows }) => {
    const labels = headers.map((header) => {
      const label = ui.specificationHeaders?.[header];
      if (!label) throw new Error(`Missing localized specification header: ${header}`);
      return `<th>${escapeHtml(label)}</th>`;
    });
    return `<table><thead><tr>${labels.join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  });
  return [
    `<p>${escapeHtml(entry.summary)}</p>`,
    `<h2>${escapeHtml(entry.specificationHeading)}</h2>`,
    ...tables,
    entry.comparisonHtml,
    `<h2>${escapeHtml(entry.orderingHeading)}</h2>`,
    `<p>${escapeHtml(entry.documentScope)}</p>`,
    `<p>${escapeHtml(entry.orderTerms)}</p>`,
    entry.faq,
  ].join('');
}
