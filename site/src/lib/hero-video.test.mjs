import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./hero-video.mjs', import.meta.url), 'utf8').replace('export function', 'function');

test('desktop waits for page load and idle; mobile and reduced-data visitors can play manually', () => {
  for (const [mediaMatches, connection] of [[false, {}], [true, {}], [false, { saveData: true }], [false, { effectiveType: '3g' }]]) {
    const button = { hidden: true, dataset: { play: 'Play', pause: 'Pause' }, addEventListener(_, fn) { this.click = fn; } };
    const handlers = {};
    const video = {
      paused: true, dataset: { src: '/media/factory-hero-loop.mp4' },
      getAttribute() { return this.src; },
      play() { this.paused = false; handlers.playing(); return Promise.resolve(); },
      pause() { this.paused = true; handlers.pause(); },
      addEventListener(name, fn) { handlers[name] = fn; },
    };
    const classes = new Set();
    const hero = { querySelector: tag => tag === 'video' ? video : button, classList: classes };
    let load, idle;
    vm.runInNewContext(source + ';initializeHeroVideo();', {
      document: { querySelector: () => hero, readyState: 'loading' },
      window: { addEventListener: (_, fn) => { load = fn; }, requestIdleCallback: fn => { idle = fn; } },
      matchMedia: () => ({ matches: mediaMatches }),
      navigator: { connection },
    });
    assert.equal(video.src, undefined);
    assert.equal(button.hidden, false);
    if (mediaMatches || Object.keys(connection).length) {
      assert.equal(load, undefined);
      button.click();
    } else {
      load();
      assert.equal(video.src, undefined);
      idle();
    }
    assert.equal(video.src, video.dataset.src);
    assert.ok(classes.has('is-playing'));
    assert.equal(button.textContent, 'Pause');
    button.click();
    assert.equal(button.textContent, 'Play');
  }
});
