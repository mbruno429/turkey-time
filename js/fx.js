// Sounds (made in the browser, no audio files), speech, confetti and toasts.
import { state } from './store.js';

let ctx;
function ac() {
  if (!state.sound) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}

function tone(freq, at, dur, { type = 'sine', vol = 0.18, to } = {}) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + at;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tap() { tone(520, 0, 0.08, { type: 'triangle', vol: 0.12 }); },
  pop() { tone(380, 0, 0.12, { to: 760 }); },
  flip() { tone(300, 0, 0.07, { type: 'triangle', to: 420, vol: 0.1 }); },
  ding() { tone(880, 0, 0.25); tone(1320, 0.08, 0.3); },
  oops() { tone(260, 0, 0.18, { type: 'triangle', to: 180 }); },
  yuck() { tone(200, 0, 0.3, { type: 'sawtooth', to: 90, vol: 0.1 }); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, { type: 'triangle' }));
    tone(1319, 0.48, 0.5, { type: 'triangle' });
  },
  gobble() {
    for (let i = 0; i < 7; i++) {
      tone(620 - i * 45, i * 0.07, 0.06, { type: 'sawtooth', to: 420 - i * 30, vol: 0.09 });
    }
  },
};

export function speak(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  } catch (e) { /* speech is a bonus */ }
}

export function confetti(n = 30, items = ['🍁', '🍂', '⭐', '🧡']) {
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = items[i % items.length];
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 0.6 + 's';
    s.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
    s.style.fontSize = 22 + Math.random() * 26 + 'px';
    layer.append(s);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 4000);
}

let toastTimer;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
