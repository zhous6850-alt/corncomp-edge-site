import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function downloadMediaItem(media, publicRoot, fetcher = fetch, timeoutMs = 30_000) {
  const response = await fetcher(media.source_url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Media ${media.id} returned ${response.status}`);
  }

  const relativePath = media.localPath.replace(/^\/+/, '');
  const targetPath = path.join(publicRoot, ...relativePath.split('/'));
  const content = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content);

  return {
    id: media.id,
    sourceUrl: media.source_url,
    relativePath,
    bytes: content.byteLength,
    sha256: createHash('sha256').update(content).digest('hex'),
  };
}

async function downloadMediaItemInRanges(media, publicRoot, fetcher = fetch) {
  const chunkSize = 512 * 1024;
  const chunks = [];
  for (let start = 0; start < media.filesize; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, media.filesize - 1);
    let chunk;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetcher(media.source_url, {
          headers: { Range: `bytes=${start}-${end}` },
          signal: AbortSignal.timeout(60_000),
        });
        if (response.status !== 206) throw new Error(`returned ${response.status}`);
        chunk = Buffer.from(await response.arrayBuffer());
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 3) console.warn(`Retrying media ${media.id} range ${start}-${end} (${attempt}/3)`);
      }
    }
    if (!chunk) throw new Error(`Media ${media.id} range ${start}-${end} failed: ${lastError.message}`);
    chunks.push(chunk);
  }

  const relativePath = media.localPath.replace(/^\/+/, '');
  const targetPath = path.join(publicRoot, ...relativePath.split('/'));
  const content = Buffer.concat(chunks);
  if (content.byteLength !== media.filesize) throw new Error(`Media ${media.id} downloaded ${content.byteLength} of ${media.filesize} bytes`);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content);
  return {
    id: media.id,
    sourceUrl: media.source_url,
    relativePath,
    bytes: content.byteLength,
    sha256: createHash('sha256').update(content).digest('hex'),
  };
}

async function existingMediaItem(media, publicRoot) {
  const relativePath = media.localPath.replace(/^\/+/, '');
  const targetPath = path.join(publicRoot, ...relativePath.split('/'));
  try {
    const details = await stat(targetPath);
    if (media.filesize && details.size !== media.filesize) return null;
    const content = await readFile(targetPath);
    return {
      id: media.id,
      sourceUrl: media.source_url,
      relativePath,
      bytes: content.byteLength,
      sha256: createHash('sha256').update(content).digest('hex'),
    };
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function localizeMediaItem(media, publicRoot) {
  const existing = await existingMediaItem(media, publicRoot);
  if (existing) return existing;

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return media.filesize > 10_000_000
        ? await downloadMediaItemInRanges(media, publicRoot)
        : await downloadMediaItem(media, publicRoot);
    } catch (error) {
      lastError = error;
      if (attempt < 3) console.warn(`Retrying media ${media.id} (${attempt}/3): ${error.message}`);
    }
  }
  throw lastError;
}

async function downloadAll(mediaItems, publicRoot, concurrency = 4) {
  const results = new Array(mediaItems.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < mediaItems.length) {
      const index = nextIndex++;
      results[index] = await localizeMediaItem(mediaItems[index], publicRoot);
      process.stdout.write(`Downloaded ${index + 1}/${mediaItems.length}\r`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, mediaItems.length) }, worker));
  process.stdout.write('\n');
  return results;
}

async function main() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const mediaPath = path.join(projectRoot, 'site', 'src', 'data', 'media.json');
  const publicRoot = path.join(projectRoot, 'site', 'public');
  const manifestPath = path.join(projectRoot, 'migration', 'source', 'media-downloads.json');
  const mediaItems = JSON.parse(await readFile(mediaPath, 'utf8'));
  const results = await downloadAll(mediaItems, publicRoot);
  await writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Saved ${results.length} files to ${path.join(publicRoot, 'media', 'wp')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
