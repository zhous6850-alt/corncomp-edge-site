import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');
const analyticsScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((script) => script.includes('corncomp-analytics-consent'));

test('analytics consent never enables advertising identifiers or automatic user data collection', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/', storage: new Map([['corncomp-analytics-consent', 'granted']]) });
  const commands = page.window.dataLayer.map(entry => Array.from(entry));
  const consent = commands.find(entry => entry[0] === 'consent');
  assert.ok(consent, 'privacy defaults must precede Google configuration');
  assert.equal(consent[2].ad_storage, 'denied');
  assert.equal(consent[2].ad_user_data, 'denied');
  assert.equal(consent[2].ad_personalization, 'denied');
  assert.equal(consent[2].analytics_storage, 'granted');
  const config = commands.find(entry => entry[0] === 'config');
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
  assert.ok(commands.some(entry => entry[0] === 'set' && entry[1] === 'user_data' && entry[2] === null));
  assert.ok(commands.indexOf(consent) < commands.indexOf(config));
});

function runAnalyticsPage({ href, storage, readyState = 'complete', autoIdle = true }) {
  const listeners = new Map();
  const appendedScripts = [];
  const idleTasks = [];
  const banner = { hidden: true };
  const effects = { focus: null, reloads: 0, replacements: [] };
  const allow = { addEventListener: (_, listener) => listeners.set('allow', listener), focus() { effects.focus = 'allow'; } };
  const decline = { addEventListener: (_, listener) => listeners.set('decline', listener) };
  const settings = { addEventListener: (_, listener) => listeners.set('settings', listener), focus() { effects.focus = 'settings'; } };
  const pageUrl = new URL(href);
  const window = {
    addEventListener: (name, listener) => listeners.set(name, listener),
    location: { href, search: pageUrl.search, reload() { effects.reloads += 1; } },
    dataLayer: [],
    requestIdleCallback: (callback) => autoIdle ? callback() : idleTasks.push(callback),
  };
  const document = {
    readyState,
    querySelector(selector) {
      return {
        '[data-analytics-consent]': banner,
        '[data-analytics-allow]': allow,
        '[data-analytics-decline]': decline,
        '[data-analytics-settings]': settings,
      }[selector];
    },
    createElement: () => ({}),
    head: { append: (script) => appendedScripts.push(script) },
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  vm.runInNewContext(analyticsScript, {
    document, window, localStorage, history: { replaceState: (_, __, url) => effects.replacements.push(url) }, URL, URLSearchParams, encodeURIComponent,
  });
  return { window, banner, listeners, appendedScripts, effects, flushIdle: () => idleTasks.splice(0).forEach(callback => callback()) };
}

test('returning consent queues events immediately but waits for load and idle before downloading Analytics', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/', storage: new Map([['corncomp-analytics-consent', 'granted']]), readyState: 'loading', autoIdle: false });
  assert.equal(page.appendedScripts.length, 0);
  page.listeners.get('corncomp:inquiry-sent')();
  assert.equal(page.window.dataLayer.filter(entry => entry[1] === 'generate_lead').length, 1);
  page.listeners.get('load')();
  assert.equal(page.appendedScripts.length, 0);
  page.flushIdle();
  assert.equal(page.appendedScripts.length, 1);
  page.listeners.get('pagehide')();
  assert.equal(page.appendedScripts.length, 1, 'pagehide must not duplicate the tracker');
});

test('revoking consent cancels a pending idle tracker download', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/', storage: new Map([['corncomp-analytics-consent', 'granted']]), autoIdle: false });
  page.listeners.get('decline')();
  page.flushIdle();
  assert.equal(page.appendedScripts.length, 0);
});

test('pending inquiries wait for consent and send only the production GA4 event without lead identifiers', () => {
  const storage = new Map();
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/fr/contactez-nous/?sent=1&lead=private-token&category=cups#inquiry-sent', storage });
  assert.equal(page.window.dataLayer.length, 0);
  assert.equal(storage.has('corncomp-reported-leads'), false);
  page.listeners.get('allow')();
  page.listeners.get('allow')();
  assert.equal(page.appendedScripts.length, 1);
  assert.equal(page.appendedScripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-R1SHNYEBN8');
  const events = page.window.dataLayer.map((entry) => Array.from(entry)).filter((entry) => entry[0] === 'event');
  assert.deepEqual(events, [['event', 'generate_lead']]);
  assert.ok(page.effects.replacements.every((url) => url === '/fr/contactez-nous/?category=cups#inquiry-sent'));
});

test('denied consent clears inquiry markers without loading analytics or reporting a lead', () => {
  const storage = new Map([['corncomp-analytics-consent', 'denied']]);
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/contact/?sent=1&lead=declined#inquiry-sent', storage });
  assert.equal(page.appendedScripts.length, 0);
  assert.equal(page.window.dataLayer.length, 0);
  assert.equal(storage.has('corncomp-reported-leads'), false);
  assert.deepEqual(page.effects.replacements, ['/contact/#inquiry-sent']);
});

test('reopening and revoking consent returns keyboard focus and reloads the loaded tracker', () => {
  const storage = new Map([['corncomp-analytics-consent', 'granted']]);
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/ar/blog/', storage });
  page.listeners.get('settings')();
  assert.equal(page.banner.hidden, false);
  assert.equal(page.effects.focus, 'allow');
  page.listeners.get('decline')();
  assert.equal(page.banner.hidden, true);
  assert.equal(page.effects.focus, 'settings');
  assert.equal(page.effects.reloads, 1);
  assert.equal(storage.get('corncomp-analytics-consent'), 'denied');
});

test('does not load Google Analytics before a visitor allows it', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/', storage: new Map() });

  assert.equal(page.appendedScripts.length, 0);
  assert.equal(page.banner.hidden, false);
  page.listeners.get('allow')();
  assert.equal(page.appendedScripts.length, 1);
  assert.match(page.appendedScripts[0].src, /G-R1SHNYEBN8/);
});

test('reports each successful inquiry token only once across later page loads', () => {
  const storage = new Map([['corncomp-analytics-consent', 'granted']]);
  const pages = ['lead-a', 'lead-b', 'lead-a'].map((lead) => runAnalyticsPage({
    href: `https://corn-comp.com/contact/?sent=1&lead=${lead}#inquiry-sent`,
    storage,
  }));
  const leadEvents = pages.flatMap(({ window }) => window.dataLayer)
    .filter((entry) => entry[0] === 'event' && entry[1] === 'generate_lead');

  assert.equal(leadEvents.length, 2);
});

test('in-place inquiries preserve consent-based conversion tracking without changing the URL', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/contact/', storage: new Map() });
  assert.equal(typeof page.listeners.get('corncomp:inquiry-sent'), 'function');
  page.listeners.get('corncomp:inquiry-sent')();
  assert.equal(page.window.dataLayer.length, 0);
  page.listeners.get('allow')();
  assert.equal(page.window.dataLayer.filter(entry => entry[1] === 'generate_lead').length, 1);
  page.listeners.get('allow')();
  assert.equal(page.window.dataLayer.filter(entry => entry[1] === 'generate_lead').length, 1);
  assert.deepEqual(page.effects.replacements, []);
});
