import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { downloadMediaItem } from './download-media.mjs';

test('downloads a media item to its deterministic local path', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'corncomp-media-'));
  const media = {
    id: 261,
    source_url: 'https://corn-comp.com/wp-content/uploads/2026/07/Bowl.jpg',
    localPath: '/media/wp/261-bowl.jpg',
  };
  const fakeFetch = async () => ({
    ok: true,
    arrayBuffer: async () => new TextEncoder().encode('image-bytes').buffer,
  });

  try {
    const result = await downloadMediaItem(media, directory, fakeFetch);
    assert.equal(result.bytes, 11);
    assert.equal(result.relativePath, 'media/wp/261-bowl.jpg');
    assert.equal(await readFile(path.join(directory, result.relativePath), 'utf8'), 'image-bytes');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects an unsuccessful media response without writing a file', async () => {
  const fakeFetch = async () => ({ ok: false, status: 404 });
  await assert.rejects(
    () => downloadMediaItem({ id: 1, source_url: 'https://corn-comp.com/missing.jpg', localPath: '/media/wp/1-missing.jpg' }, tmpdir(), fakeFetch),
    /Media 1 returned 404/,
  );
});
