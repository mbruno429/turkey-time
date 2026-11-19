// Catch the Feast: slide the basket to catch falling food.
// Little kids: slow, endless, tapping a food also catches it, nothing bad ever happens.
// Big kids: 45 seconds, it speeds up, and stinky socks cost points.
import { kid, save } from './store.js';
import { sfx, confetti, speak } from './fx.js';
import { header } from './ui.js';

const FOODS = ['🌽', '🥧', '🍎', '🍗', '🥕', '🍞', '🍇', '🥔'];
const YUCK = ['🧦', '👞'];
const ROUND = 45;

const BASKET = `<svg viewBox="0 0 120 90" aria-hidden="true">
  <path d="M22 34Q60 -18 98 34" fill="none" stroke="#7A4A22" stroke-width="8" stroke-linecap="round"/>
  <path d="M8 34H112L100 84Q98 88 94 88H26Q22 88 20 84Z" fill="#D99A4E" stroke="#5A3418" stroke-width="4" stroke-linejoin="round"/>
  <path d="M14 50H106M18 66H102M38 36L42 86M60 36V86M82 36L78 86" stroke="#5A3418" stroke-opacity=".45" stroke-width="3"/>
  <rect x="4" y="28" width="112" height="12" rx="6" fill="#B8763A" stroke="#5A3418" stroke-width="4"/>
</svg>`;

export function catchGame(root) {
  const k = kid();
  const little = k.level === 'little';

  root.innerHTML = `${header('Catch the Feast')}
    <main class="catch">
      <div class="hud">
        <span class="score" aria-live="polite"><span aria-hidden="true">⭐</span> <b id="score">0</b></span>
        <span class="timer" id="timer"></span>
      </div>
      <div class="field" id="field">
        <div class="basket" id="basket">${BASKET}</div>
      </div>
    </main>`;

  const field = root.querySelector('#field');
  const basket = root.querySelector('#basket');
  const scoreEl = root.querySelector('#score');
  const timerEl = root.querySelector('#timer');

  let W = 0;
  let H = 0;
  let size = 60; // food size in px
  let items = [];
  let bx = 0.5; // basket centre, 0..1
  let score = 0;
  let left = ROUND;
  let running = false;
  let raf = 0;
  let last = 0;
  let spawnIn = 0.4;
  let elapsed = 0;

  function measure() {
    W = field.clientWidth;
    H = field.clientHeight;
    size = Math.max(44, Math.min(W, H) * (little ? 0.17 : 0.12));
    field.style.setProperty('--food', size + 'px');
    field.style.setProperty('--bw', size * 2.2 + 'px');
    placeBasket();
  }

  function placeBasket() {
    const bw = size * 2.2;
    const x = Math.max(bw / 2, Math.min(W - bw / 2, bx * W));
    basket.style.transform = `translate(${x - bw / 2}px, 0)`;
    return x;
  }

  function setScore(n) {
    score = Math.max(0, n);
    scoreEl.textContent = score;
  }

  function spawn() {
    const bad = !little && Math.random() < 0.18;
    const el = document.createElement('button');
    el.className = 'food' + (bad ? ' bad' : '');
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.textContent = bad ? YUCK[Math.floor(Math.random() * YUCK.length)] : FOODS[Math.floor(Math.random() * FOODS.length)];
    const it = { el, bad, x: size / 2 + Math.random() * (W - size), y: -size, gone: false };
    field.append(el);
    items.push(it);
  }

  function caught(it) {
    if (it.gone) return;
    it.gone = true;
    it.el.classList.add('caught');
    setTimeout(() => it.el.remove(), 250);
    if (it.bad) {
      setScore(score - 2);
      sfx.yuck();
      basket.classList.add('shake');
      setTimeout(() => basket.classList.remove('shake'), 400);
    } else {
      setScore(score + 1);
      sfx.pop();
      if (little && score % 5 === 0) { sfx.ding(); confetti(12, ['⭐', '🍁']); }
    }
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0);
    last = ts;
    if (!running) return;
    elapsed += dt;

    const ramp = little ? 0 : Math.min(1, elapsed / ROUND);
    const speed = H * (little ? 0.17 : 0.3 + 0.38 * ramp);
    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawn();
      spawnIn = little ? 1.5 : 0.95 - 0.5 * ramp;
    }

    const cx = placeBasket();
    const top = H - size * 1.35; // where the basket's opening is
    for (const it of items) {
      if (it.gone) continue;
      it.y += speed * dt;
      it.el.style.transform = `translate(${it.x - size / 2}px, ${it.y}px)`;
      const bottom = it.y + size;
      if (bottom >= top && it.y <= top + size * 0.5 && Math.abs(it.x - cx) < size * 1.15) caught(it);
      else if (it.y > H) { it.gone = true; it.el.remove(); }
    }
    items = items.filter((it) => !it.gone);

    if (!little) {
      left -= dt;
      timerEl.textContent = `⏰ ${Math.max(0, Math.ceil(left))}`;
      if (left <= 0) finish();
    }
  }

  function clearItems() {
    items.forEach((it) => it.el.remove());
    items = [];
  }

  function start() {
    field.querySelector('.card-over')?.remove();
    clearItems();
    setScore(0);
    left = ROUND;
    elapsed = 0;
    spawnIn = 0.4;
    running = true;
  }

  function finish() {
    running = false;
    clearItems();
    const best = Math.max(k.best.catch || 0, score);
    const isBest = score > 0 && score >= best && score > (k.best.catch || 0);
    k.best.catch = best;
    save();
    sfx.win();
    if (isBest) confetti(40);
    speak(`You caught ${score}!`);
    overlay(`<p class="bigline">${isBest ? 'New best!' : "Time's up!"}</p>
      <p class="hugenum">${score}</p>
      <p class="subline">Best: ${best}</p>
      <button class="big" id="go">Play again</button>`);
  }

  function overlay(html) {
    const d = document.createElement('div');
    d.className = 'card-over';
    d.innerHTML = `<div class="sheet">${html}</div>`;
    field.append(d);
    d.querySelector('#go').addEventListener('click', () => { sfx.tap(); start(); });
  }

  const move = (e) => {
    const r = field.getBoundingClientRect();
    bx = (e.clientX - r.left) / r.width;
    if (!running) placeBasket();
  };
  field.addEventListener('pointermove', move);
  field.addEventListener('pointerdown', (e) => {
    move(e);
    if (little && running) {
      const f = e.target.closest('.food');
      const it = f && items.find((i) => i.el === f);
      if (it) caught(it);
    }
  });

  const ro = new ResizeObserver(measure);
  ro.observe(field);
  measure();
  raf = requestAnimationFrame(frame);

  if (little) {
    start();
  } else {
    timerEl.textContent = `⏰ ${ROUND}`;
    overlay(`<p class="bigline">Catch the feast!</p>
      <p class="subline">Slide the basket to catch the food.<br>Watch out for stinky socks <span aria-hidden="true">🧦</span></p>
      <button class="big" id="go">Play</button>`);
  }

  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}
