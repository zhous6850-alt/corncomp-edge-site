import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';

function request(body, method = 'POST') {
  return new Request('https://corncomp.com/api/inquiry', {
    method,
    headers: { 'content-type': 'application/json', referer: 'https://corncomp.com/contact-us/' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

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

test('sends a valid inquiry from inquiry@corn-comp.com to the fixed mailbox', async () => {
  let message;
  const response = await worker.fetch(request({ name: 'Buyer', email: 'buyer@example.com', phone: '+1 555', message: 'Need bowls' }), {
    EMAIL: { send: async (value) => { message = value; return { messageId: 'test' }; } },
  });
  assert.equal(response.status, 200);
  assert.equal(message.from, 'inquiry@corn-comp.com');
  assert.equal(message.to, 'zhous6850@gmail.com');
  assert.equal(message.replyTo, 'buyer@example.com');
  assert.match(message.text, /Need bowls/);
});

test('redirects a browser form submission back to its language contact page', async () => {
  const form = new URLSearchParams({ 'your-name': 'Buyer', 'your-email': 'buyer@example.com' });
  const formRequest = new Request('https://corncomp.com/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', referer: 'https://corncomp.com/es/contactenos/' },
    body: form,
  });
  const response = await worker.fetch(formRequest, { EMAIL: { send: async () => ({ messageId: 'test' }) } });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://corncomp.com/es/contactenos/#inquiry-sent');
});

test('redirects retired commerce pages to the product directory', async () => {
  const response = await worker.fetch(new Request('https://corncomp.com/cart/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corncomp.com/shop/');
});

test('redirects legacy translated aliases to the preserved localized route', async () => {
  const response = await worker.fetch(new Request('https://corncomp.com/fr/faq/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corncomp.com/fr/faq-corncomp/');
});

test('redirects legacy translated article aliases to the migrated article', async () => {
  const response = await worker.fetch(new Request('https://corncomp.com/es/pla-vs-bagasse-vs-fsc-paper/'), { ASSETS: { fetch: () => new Response('asset') } });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://corncomp.com/es/pla-vs-bagazo-vs-papel-fsc-como-elegir-el-material-de-envase-compostable-adecuado/');
});
