const RECIPIENT = 'zhous6850@gmail.com';
const SENDER = 'inquiry@corncomp.com';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

async function inquiryData(request) {
  if ((request.headers.get('content-type') || '').includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form);
}

function field(data, name) {
  return String(data[name] ?? data[`your-${name}`] ?? '').trim();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/inquiry') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

    const data = await inquiryData(request);
    if (field(data, 'website')) return json({ ok: true });

    const name = field(data, 'name').slice(0, 200);
    const email = field(data, 'email').slice(0, 320);
    const phone = field(data, 'phone').slice(0, 100);
    const message = field(data, 'message').slice(0, 5000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid name and email.' }, 400);

    const source = request.headers.get('referer') || 'Unknown page';
    const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nPage: ${source}\n\n${message || 'No message provided'}`;
    await env.EMAIL.send({
      to: RECIPIENT,
      from: SENDER,
      replyTo: email,
      subject: `Corncomp inquiry from ${name}`,
      text,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p><p><strong>Page:</strong> ${escapeHtml(source)}</p><p>${escapeHtml(message || 'No message provided').replace(/\n/g, '<br>')}</p>`,
    });
    if ((request.headers.get('content-type') || '').includes('application/json')) return json({ ok: true });
    const page = new URL(source, request.url);
    return new Response(null, { status: 303, headers: { location: `${url.origin}${page.pathname}#inquiry-sent` } });
  },
};
