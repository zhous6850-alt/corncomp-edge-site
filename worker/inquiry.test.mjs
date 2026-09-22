import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './index.mjs';

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

test('sends a valid inquiry through Resend from inquiry@corn-comp.com', async () => {
  const originalFetch = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, options) => {
    call = { url, options };
    return Response.json({ id: 'test' });
  };
  try {
    const response = await worker.fetch(request({ name: 'Buyer', email: 'buyer@example.com', phone: '+1 555', message: 'Need bowls' }), {
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
  } finally {
    globalThis.fetch = originalFetch;
  }
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
    assert.equal(response.headers.get('location'), 'https://corn-comp.com/es/contactenos/#inquiry-sent');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('redirects retired commerce pages to the product directory', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/cart/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/shop/');
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

test('redirects legacy translated aliases to the preserved localized route', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/fr/faq/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/fr/faq-corncomp/');
});

test('redirects legacy translated article aliases to the migrated article', async () => {
  const response = await worker.fetch(new Request('https://corn-comp.com/es/pla-vs-bagasse-vs-fsc-paper/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corn-comp.com/es/pla-vs-bagazo-vs-papel-fsc-como-elegir-el-material-de-envase-compostable-adecuado/');
});
