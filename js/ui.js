// Small pieces shared by every screen.
import { kid, esc } from './store.js';

let cameFromHome = false;

export function go(name) {
  cameFromHome = true;
  location.hash = '#' + name;
}

export function goHome() {
  if (cameFromHome && history.length > 1) {
    cameFromHome = false;
    history.back();
  } else {
    location.replace('#home');
  }
}

export function header(title) {
  const k = kid();
  return `<header class="topbar">
    <button class="homebtn" data-home aria-label="Back to home"><span aria-hidden="true">🏠</span></button>
    <h1>${esc(title)}</h1>
    <span class="who"><span aria-hidden="true">${k.icon}</span> ${esc(k.name)}</span>
  </header>`;
}

// A pop-up card. Returns { el, close }. Tapping the dim area closes it.
export function modal(html, { onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => {
    wrap.remove();
    if (onClose) onClose();
  };
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap || e.target.closest('[data-close]')) close();
  });
  document.body.append(wrap);
  return { el: wrap.firstElementChild, close };
}

export function closeModals() {
  document.querySelectorAll('.modal').forEach((m) => m.remove());
}

// A button that only fires after being held for about a second, so little fingers don't delete things.
export function holdButton(btn, fn, ms = 1100) {
  let t;
  const start = (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    btn.style.setProperty('--hold', ms + 'ms');
    t = setTimeout(() => { btn.classList.remove('holding'); fn(); }, ms);
  };
  const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
