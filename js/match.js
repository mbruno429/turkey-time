// Pie Match: flip two cards, find the pairs. Small boards for little kids, bigger ones for big kids.
import { kid, save } from './store.js';
import { sfx, confetti, speak } from './fx.js';
import { header } from './ui.js';

const FOODS = ['🦃', '🥧', '🌽', '🍎', '🍗', '🥕', '🍞', '🍇'];
const SIZES = [
  { n: 4, cols: 2, rows: 2, face: '🙂' },
  { n: 8, cols: 4, rows: 2, face: '😀' },
  { n: 12, cols: 4, rows: 3, face: '🤩' },
  { n: 16, cols: 4, rows: 4, face: '🏆' },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function match(root) {
  const k = kid();
  const little = k.level === 'little';
  let size = SIZES.find((s) => s.n === k.matchSize) || SIZES[little ? 0 : 2];
  let open = [];
  let locked = false;
  let found = 0;
  let moves = 0;
  let timer;

  root.innerHTML = `${header('Pie Match')}
    <main class="match">
      <div class="matchbar">
        <div class="sizes" role="group" aria-label="How many cards">
          ${SIZES.map((s) => `<button class="sizebtn" data-n="${s.n}" aria-label="${s.n} cards"><span aria-hidden="true">${s.face}</span> ${s.n}</button>`).join('')}
        </div>
        <p class="moves" id="moves"></p>
      </div>
      <div class="boardwrap" id="boardwrap"><div class="board" id="board"></div></div>
    </main>`;

  const board = root.querySelector('#board');
  const wrap = root.querySelector('#boardwrap');
  const movesEl = root.querySelector('#moves');

  function fit() {
    const gap = 12;
    const s = Math.floor(Math.min(
      (wrap.clientWidth - gap * (size.cols - 1)) / size.cols,
      (wrap.clientHeight - gap * (size.rows - 1)) / size.rows,
      230,
    ));
    board.style.setProperty('--s', Math.max(30, s) + 'px');
    board.style.setProperty('--cols', size.cols);
  }

  function showMoves() {
    if (little) { movesEl.textContent = ''; return; }
    const best = k.best['match' + size.n];
    movesEl.textContent = `Turns: ${moves}${best ? `  ·  Best: ${best}` : ''}`;
  }

  function deal() {
    clearTimeout(timer);
    open = [];
    locked = false;
    found = 0;
    moves = 0;
    const faces = shuffle(FOODS.slice()).slice(0, size.n / 2);
    const cards = shuffle([...faces, ...faces]);
    board.innerHTML = cards.map((f, i) => `
      <button class="card" data-f="${f}" aria-label="Card ${i + 1}">
        <span class="inner"><span class="back" aria-hidden="true">🍁</span><span class="front" aria-hidden="true">${f}</span></span>
      </button>`).join('');
    root.querySelectorAll('.sizebtn').forEach((b) => b.classList.toggle('on', +b.dataset.n === size.n));
    fit();
    showMoves();
  }

  function win() {
    sfx.win();
    confetti(40);
    if (!little) {
      const key = 'match' + size.n;
      if (!k.best[key] || moves < k.best[key]) k.best[key] = moves;
      save();
      showMoves();
    }
    speak(`Great job, ${k.name}!`);
    board.classList.add('won');
    timer = setTimeout(() => { board.classList.remove('won'); deal(); }, 3600);
  }

  board.addEventListener('click', (e) => {
    const c = e.target.closest('.card');
    if (!c || locked || c.classList.contains('up') || c.classList.contains('done')) return;
    c.classList.add('up');
    sfx.flip();
    open.push(c);
    if (open.length < 2) return;
    moves++;
    showMoves();
    const [a, b] = open;
    open = [];
    if (a.dataset.f === b.dataset.f) {
      found += 2;
      setTimeout(() => {
        a.classList.add('done');
        b.classList.add('done');
        sfx.ding();
        if (found === size.n) win();
      }, 350);
    } else {
      locked = true;
      timer = setTimeout(() => {
        a.classList.remove('up');
        b.classList.remove('up');
        locked = false;
      }, little ? 1500 : 900);
    }
  });

  root.querySelector('.sizes').addEventListener('click', (e) => {
    const b = e.target.closest('.sizebtn');
    if (!b) return;
    size = SIZES.find((s) => s.n === +b.dataset.n);
    k.matchSize = size.n;
    save();
    sfx.tap();
    board.classList.remove('won');
    deal();
  });

  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  deal();
  return () => { ro.disconnect(); clearTimeout(timer); };
}
