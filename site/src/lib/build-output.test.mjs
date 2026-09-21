import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the built homepage includes the global site styles', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /\.content-shell\s*\{/);
});
