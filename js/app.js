// Turkey Time: home screen, grown-up settings, and moving between screens.
import { state, save, kid, esc, daysUntil, resetAll } from './store.js';
import { sfx, speak, confetti, toast } from './fx.js';
import { turkeySVG } from './turkey.js';
import { go, goHome, modal, closeModals, holdButton } from './ui.js';
import { dress } from './dress.js';
import { tree } from './tree.js';
import { match } from './match.js';
import { catchGame } from './catch.js';

const app = document.getElementById('app');
const screens = { home, dress, tree, match, catch: catchGame };
let cleanup = null;

function route() {
  closeModals();
  if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
  const name = (location.hash || '#home').slice(1);
  const screen = screens[name] || home;
  const k = kid();
  document.documentElement.style.setProperty('--kid', k.color);
  document.documentElement.style.setProperty('--kid-soft', k.soft);
  app.className = 'screen-' + (screens[name] ? name : 'home');
  app.innerHTML = '';
  cleanup = screen(app) || null;
}

const TILES = [
  { id: 'dress', icon: '🎩', label: 'Dress the Turkey' },
  { id: 'tree', icon: '🍁', label: 'Thankful Tree' },
  { id: 'match', icon: '🥧', label: 'Pie Match' },
  { id: 'catch', icon: '🌽', label: 'Catch the Feast' },
];

function home(root) {
  const k = kid();
  const d = daysUntil();
  const isDay = d === 0;
  const counting = d > 0 && d <= 8;
  const earned = counting ? 8 - d : 8;

  root.innerHTML = `
    <header class="topbar">
      <div class="kids" role="group" aria-label="Who is playing?">
        ${Object.entries(state.kids).map(([id, x]) => `
          <button class="kidchip${id === state.kid ? ' on' : ''}" data-kid="${id}" style="--k:${x.color};--ks:${x.soft}" aria-pressed="${id === state.kid}">
            <span aria-hidden="true">${x.icon}</span> ${esc(x.name)}
          </button>`).join('')}
      </div>
      <button class="gear" id="gear" aria-label="Grown-ups: press and hold for settings"><span aria-hidden="true">⚙️</span></button>
    </header>
    <main class="home">
      <section class="hero">
        <button class="turkeybtn" id="turkey" aria-label="Tap the turkey">${turkeySVG(k.outfit, { bg: false, earned })}</button>
        <div class="count">
          <p class="hi">Hi, ${esc(k.name)}!</p>
          ${isDay
            ? '<p class="happy">Happy Thanksgiving!</p><p class="note">Gobble gobble!</p>'
            : `<p class="num">${d}</p><p class="sleeps">${d === 1 ? 'sleep' : 'sleeps'} until Thanksgiving!</p>
               ${counting ? '<p class="note">The turkey gets a new feather every day</p>' : ''}`}
        </div>
      </section>
      <nav class="tiles" aria-label="Things to do">
        ${TILES.map((t) => `<button class="tile t-${t.id}" data-go="${t.id}"><span class="ticon" aria-hidden="true">${t.icon}</span><span class="tlabel">${t.label}</span></button>`).join('')}
      </nav>
    </main>`;

  root.querySelector('.kids').addEventListener('click', (e) => {
    const b = e.target.closest('.kidchip');
    if (!b || b.dataset.kid === state.kid) return;
    state.kid = b.dataset.kid;
    save();
    sfx.ding();
    speak(`Hi, ${kid().name}!`);
    route();
  });

  root.querySelector('.tiles').addEventListener('click', (e) => {
    const b = e.target.closest('.tile');
    if (!b) return;
    sfx.tap();
    go(b.dataset.go);
  });

  const turkey = root.querySelector('#turkey');
  turkey.addEventListener('click', () => {
    sfx.gobble();
    turkey.classList.remove('wiggle');
    void turkey.offsetWidth;
    turkey.classList.add('wiggle');
    if (isDay) confetti(24);
  });

  const gear = root.querySelector('#gear');
  let opened = false;
  holdButton(gear, () => { opened = true; openSettings(); }, 1200);
  gear.addEventListener('click', () => {
    if (!opened) toast('Grown-ups: press and hold the gear');
    opened = false;
  });

  if (isDay) setTimeout(() => confetti(40), 400);
}

function openSettings() {
  const kidRows = Object.entries(state.kids).map(([id, x]) => `
    <fieldset class="kidset" data-kid="${id}">
      <legend><span aria-hidden="true">${x.icon}</span> Player</legend>
      <input type="text" class="nameinput" maxlength="14" value="${esc(x.name)}" aria-label="Name">
      <div class="seg" role="group" aria-label="Difficulty">
        <button data-level="little" class="${x.level === 'little' ? 'on' : ''}">Little kid</button>
        <button data-level="big" class="${x.level === 'big' ? 'on' : ''}">Big kid</button>
      </div>
    </fieldset>`).join('');

  const m = modal(`
    <div class="settings">
      <h2>Grown-ups</h2>
      <label class="rowline"><span>Sounds and voice</span><input type="checkbox" id="snd" ${state.sound ? 'checked' : ''}></label>
      ${kidRows}
      <p class="fine">Little kid: slower games, fewer cards, nothing to lose. Big kid: timers, scores and bigger boards.</p>
      <div class="row">
        <button class="quiet" id="cleartree">Hold to clear the Thankful Tree</button>
        <button class="quiet" id="resetall">Hold to reset everything</button>
      </div>
      <p class="fine">Everything is saved only on this tablet. No ads, no accounts, and it works without internet after the first visit.</p>
      <button class="big" data-close>Done</button>
    </div>`, { onClose: route });
  const el = m.el;

  el.querySelector('#snd').addEventListener('change', (e) => {
    state.sound = e.target.checked;
    save();
    if (state.sound) sfx.ding();
  });
  el.querySelectorAll('.kidset').forEach((fs) => {
    const x = state.kids[fs.dataset.kid];
    fs.querySelector('.nameinput').addEventListener('input', (e) => {
      x.name = e.target.value.trim() || x.name;
      save();
    });
    fs.querySelector('.seg').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      x.level = b.dataset.level;
      x.matchSize = x.level === 'little' ? 4 : 12;
      save();
      fs.querySelectorAll('.seg button').forEach((s) => s.classList.toggle('on', s === b));
    });
  });
  holdButton(el.querySelector('#cleartree'), () => { state.leaves = []; save(); toast('Thankful Tree cleared'); });
  holdButton(el.querySelector('#resetall'), () => { resetAll(); m.close(); toast('Everything reset'); });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-home]')) { sfx.tap(); goHome(); }
});
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('input')) e.preventDefault();
});
window.addEventListener('hashchange', route);
route();

// Re-draw the home screen when the tablet wakes up on a new day so the countdown stays right.
let lastDay = new Date().toDateString();
document.addEventListener('visibilitychange', () => {
  const now = new Date().toDateString();
  if (!document.hidden && now !== lastDay) {
    lastDay = now;
    if (!location.hash || location.hash === '#home') route();
  }
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is a bonus */ });
}
