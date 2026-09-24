import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './index.mjs';
import { localizedRedirects } from '../site/src/lib/localization.mjs';

test('runs the Worker before static assets so canonical redirects execute', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.assets.run_worker_first, true);
});

function request(body, method = 'POST') {
  return new Request('https://corn-comp.com/api/inquiry', {
    method,
    headers: { 'content-type': 'application/json', referer: 'https://corn-comp.com/contact-us/' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

test('redirects www requests to the canonical root domain', async () => {
  const response = await worker.fetch(new Request('https://www.corn-comp.com/shop/?source=www'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/shop/?source=www');
});

test('rejects invalid inquiry data without sending email', async () => {
  let sent = false;
  const response = await worker.fetch(request({ name: '', email: 'bad' }), { EMAIL: { send: async () => { sent = true; } } });
  assert.equal(response.status, 400);
  assert.equal(sent, false);
});

test('silently accepts honeypot submissions without sending email', async () => {
  let sent = false;
  const response = await worker.fetch(request({ name: 'Bot', email: 'bot@example.com', website: 'spam' }), { EMAIL: { send: async () => { sent = true; } } });
  assert.equal(response.status, 200);
  assert.equal(sent, false);
});

test('sends a valid contextual inquiry through Resend from inquiry@corn-comp.com', async () => {
  const originalFetch = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, options) => {
    call = { url, options };
    return Response.json({ id: 'test' });
  };
  try {
    const response = await worker.fetch(request({ name: 'Buyer', email: 'buyer@example.com', phone: '+1 555', company: 'Buyer Co', country: 'DE', productName: 'Kraft Paper Bowl', productSku: 'CC01KB500', category: 'Salad Bowls', quantity: '50,000', sourcePath: '/products/cups-bowls/salad-bowls/kraft-paper-bowl/', message: 'Need bowls' }), {
      RESEND_API_KEY: 're_test',
    });
    const message = JSON.parse(call.options.body);
    assert.equal(response.status, 200);
    assert.equal(call.url, 'https://api.resend.com/emails');
    assert.equal(call.options.headers.authorization, 'Bearer re_test');
    assert.equal(message.from, 'Corncomp <inquiry@corn-comp.com>');
    assert.deepEqual(message.to, ['zhous6850@gmail.com']);
    assert.equal(message.reply_to, 'buyer@example.com');
    assert.match(message.text, /Need bowls/);
    assert.match(message.text, /Buyer Co/);
    assert.match(message.text, /CC01KB500/);
    assert.match(message.text, /Salad Bowls/);
    assert.match(message.text, /50,000/);
    assert.match(message.text, /\/products\/cups-bowls\/salad-bowls\/kraft-paper-bowl\//);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('redirects legacy English product URLs in one hop and preserves query parameters', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/product/single-wall-white-cardboard-paper-cup/?utm_source=legacy'), { ASSETS: { fetch: () => new Response('asset') } });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/products/cups-bowls/paper-cups/single-wall-white-cardboard-paper-cup/?utm_source=legacy');
});

test('redirects misplaced French-root duplicates to their canonical English products', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/product/gobelet-en-papier-simple-paroi-carton-blanc/'), { ASSETS: { fetch: () => new Response('asset') } });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/products/cups-bowls/paper-cups/single-wall-white-cardboard-paper-cup/');
});

test('redirects a browser form submission back to its language contact page', async () => {
  const form = new URLSearchParams({ 'your-name': 'Buyer', 'your-email': 'buyer@example.com' });
  const formRequest = new Request('https://corn-comp.com/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', referer: 'https://corn-comp.com/es/contactenos/' },
    body: form,
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ id: 'test' });
  try {
    const response = await worker.fetch(formRequest, { RESEND_API_KEY: 're_test' });
    assert.equal(response.status, 303);
    const location = new URL(response.headers.get('location'));
    assert.equal(location.origin, 'https://corn-comp.com');
    assert.equal(location.pathname, '/es/contactenos/');
    assert.equal(location.searchParams.get('sent'), '1');
    assert.match(location.searchParams.get('lead'), /^[0-9a-f-]{36}$/);
    assert.equal(location.hash, '#inquiry-sent');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('keeps inquiry success redirects on the request origin for hostile or missing referrers', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ id: 'test' });
  try {
    for (const referer of ['https://evil.example//evil.example/phishing', null]) {
      const headers = { 'content-type': 'application/x-www-form-urlencoded' };
      if (referer) headers.referer = referer;
      const request = new Request('https://corn-comp.com/api/inquiry', {
        method: 'POST',
        headers,
        body: new URLSearchParams({ 'your-name': 'Buyer', 'your-email': 'buyer@example.com' }),
      });
      const response = await worker.fetch(request, { RESEND_API_KEY: 're_test' });
      const location = new URL(response.headers.get('location'));
      assert.equal(location.origin, 'https://corn-comp.com');
      assert.equal(location.pathname, '/contact/');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('redirects retired commerce pages to the product directory', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/cart/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/products/');
});

test('redirects preserved WordPress category archives to the matching language blog', async () => {
  for (const [source, target] of [
    ['/category/company-industry/', '/blog/'],
    ['/category/material-guides-fr/', '/fr/blog/'],
    ['/es/category/compliance-regulations-es/', '/es/blog/'],
    ['/ar/category/compliance-regulations-ar/', '/ar/blog/'],
  ]) {
    const response = await worker.fetch(new Request(`https://corn-comp.com${source}`), { ASSETS: { fetch: () => new Response('asset') } });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), `https://corn-comp.com${target}`);
  }
});

test('redirects every reviewed localized alias directly to its canonical target with query parameters', async () => {
  for (const [source, target] of localizedRedirects()) {
    assert.equal(localizedRedirects().has(target), false, `redirect chain through ${target}`);
    const response = await worker.fetch(new Request(`https://corn-comp.com${source}?source=alias`), { ASSETS: { fetch: () => new Response('asset') } });
    assert.equal(response.status, 301, source);
    assert.equal(response.headers.get('location'), `https://corn-comp.com${target}?source=alias`, source);
  }
});
