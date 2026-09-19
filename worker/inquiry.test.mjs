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

test('sends a valid inquiry from inquiry@corncomp.com to the fixed mailbox', async () => {
  let message;
  const response = await worker.fetch(request({ name: 'Buyer', email: 'buyer@example.com', phone: '+1 555', message: 'Need bowls' }), {
    EMAIL: { send: async (value) => { message = value; return { messageId: 'test' }; } },
  });
  assert.equal(response.status, 200);
  assert.equal(message.from, 'inquiry@corncomp.com');
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
