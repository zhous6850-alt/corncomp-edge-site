export function initializeHeroVideo() {
  const hero = document.querySelector('[data-hero-video]');
  if (!hero) return;
  const video = hero.querySelector('video');
  const button = hero.querySelector('button');
  const play = () => {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.play().catch(() => {});
  };

  button.hidden = false;
  button.addEventListener('click', () => {
    if (video.paused) play();
    else video.pause();
  });
  video.addEventListener('playing', () => {
    hero.classList.add('is-playing');
    button.textContent = button.dataset.pause;
  });
  video.addEventListener('pause', () => { button.textContent = button.dataset.play; });
  video.addEventListener('error', () => { hero.classList.remove('is-playing'); });

  const manual = matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches ||
    navigator.connection?.saveData || /^(slow-2g|2g|3g)$/.test(navigator.connection?.effectiveType || '');
  if (manual) return;

  const schedule = () => {
    if (window.requestIdleCallback) window.requestIdleCallback(play, { timeout: 1500 });
    else window.setTimeout(play, 0);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}
