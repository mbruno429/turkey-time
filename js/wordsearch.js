// Word Search: find the hidden Thanksgiving words.
// Drag across a word, or tap its first letter and then its last letter.
import { kid, save } from './store.js';
import { sfx, confetti, speak } from './fx.js';
import { header } from './ui.js';
import { WORDS, shuffle, pick } from './words.js';

// dirs are [across, down] steps: right, down, and the two diagonals that read left to right.
const LEVELS = [
  { id: 'easy', face: '🙂', label: 'Easy', size: 6, count: 4, maxLen: 5, dirs: [[1, 0]] },
  { id: 'medium', face: '😀', label: 'Medium', size: 8, count: 6, maxLen: 7, dirs: [[1, 0], [0, 1]] },
  { id: 'hard', face: '🏆', label: 'Hard', size: 10, count: 8, maxLen: 8, dirs: [[1, 0], [0, 1], [1, 1], [1, -1]] },
];
const COLORS = ['#FFD166', '#F7A8C9', '#A8D8F0', '#B8E0A0', '#D9C2F5', '#FFB89A', '#A9E5D9', '#F5E08A'];
// Filler letters have no vowels, so the filler can never spell a word by accident.
const FILL = 'BCDFGHJKLMNPRSTVWY';

export function makeSearch(level) {
  const n = level.size;
  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = Array.from({ length: n }, () => Array(n).fill(''));
    const placed = [];
    for (const [w, e] of shuffle(WORDS.filter(([word]) => word.length <= level.maxLen))) {
      if (placed.length === level.count) break;
      if (placed.some((p) => p.w.includes(w) || w.includes(p.w))) continue; // no CORN hiding inside ACORN
      for (let t = 0; t < 150; t++) {
        const [dc, dr] = pick(level.dirs);
        const L = w.length;
        const rmin = dr < 0 ? L - 1 : 0;
        const rmax = dr > 0 ? n - L : n - 1;
        const cmax = dc > 0 ? n - L : n - 1;
        if (rmax < rmin || cmax < 0) continue;
        const r = rmin + Math.floor(Math.random() * (rmax - rmin + 1));
        const c = Math.floor(Math.random() * (cmax + 1));
        let ok = true;
        for (let i = 0; i < L && ok; i++) {
          const ch = grid[r + dr * i][c + dc * i];
          if (ch && ch !== w[i]) ok = false;
        }
        if (!ok) continue;
        for (let i = 0; i < L; i++) grid[r + dr * i][c + dc * i] = w[i];
        placed.push({ w, e, found: false });
        break;
      }
    }
    if (!best || placed.length > best.placed.length) best = { grid, placed };
    if (placed.length === level.count) break;
  }
  for (const row of best.grid) for (let c = 0; c < n; c++) if (!row[c]) row[c] = pick(FILL);
  return best;
}

export function wordsearch(root) {
  const k = kid();
  let level = LEVELS.find((l) => l.id === k.wsLevel) || LEVELS[k.level === 'little' ? 0 : 1];
  let puz;
  let els = [];
  let anchor = null; // first tapped letter, waiting for the last letter
  let down = null;
  let cur = null;
  let moved = false;
  let timer;

  root.innerHTML = `${header('Word Search')}
    <main class="puzzle">
      <div class="matchbar">
        <div class="sizes" role="group" aria-label="How hard">
          ${LEVELS.map((l) => `<button class="sizebtn" data-l="${l.id}"><span aria-hidden="true">${l.face}</span> ${l.label}</button>`).join('')}
        </div>
        <p class="moves" id="wsleft"></p>
      </div>
      <div class="puzbody">
        <div class="gridwrap" id="wswrap"><div class="wsgrid" id="wsgrid"></div></div>
        <ul class="wslist" id="wslist" aria-label="Words to find"></ul>
      </div>
    </main>`;

  const grid = root.querySelector('#wsgrid');
  const wrap = root.querySelector('#wswrap');
  const list = root.querySelector('#wslist');

  function fit() {
    const room = Math.min(wrap.clientWidth, wrap.clientHeight) - 30;
    grid.style.setProperty('--cell', Math.max(26, Math.min(84, Math.floor(room / level.size))) + 'px');
    grid.style.setProperty('--n', level.size);
  }

  function drawList() {
    list.innerHTML = puz.placed.map((p, i) => `
      <li class="wsword${p.found ? ' found' : ''}" style="--fc:${COLORS[i % COLORS.length]}">
        <span aria-hidden="true">${p.e}</span> ${p.w}</li>`).join('');
    const left = puz.placed.filter((p) => !p.found).length;
    root.querySelector('#wsleft').textContent = left ? `${left} to find` : 'All found!';
  }

  function deal() {
    clearTimeout(timer);
    puz = makeSearch(level);
    anchor = down = cur = null;
    grid.classList.remove('won');
    grid.innerHTML = puz.grid.map((row, r) => row.map((ch, c) => `<span class="wscell" data-r="${r}" data-c="${c}">${ch}</span>`).join('')).join('');
    els = puz.grid.map((row, r) => row.map((_, c) => grid.children[r * level.size + c]));
    root.querySelectorAll('.sizebtn').forEach((b) => b.classList.toggle('on', b.dataset.l === level.id));
    fit();
    drawList();
  }

  function cellAt(e) {
    const first = els[0][0].getBoundingClientRect();
    const size = first.width;
    const c = Math.floor((e.clientX - first.left) / size);
    const r = Math.floor((e.clientY - first.top) / size);
    const clamp = (v) => Math.max(0, Math.min(level.size - 1, v));
    return { r: clamp(r), c: clamp(c) };
  }

  // The straight line of cells from a to b, snapped to the nearest of the 8 directions.
  function line(a, b) {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    if (!dr && !dc) return [a];
    const step = Math.round(Math.atan2(dr, dc) / (Math.PI / 4));
    const [sr, sc] = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]][(step + 8) % 8];
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    const out = [];
    for (let i = 0; i <= len; i++) {
      const r = a.r + sr * i;
      const c = a.c + sc * i;
      if (r < 0 || c < 0 || r >= level.size || c >= level.size) break;
      out.push({ r, c });
    }
    return out;
  }

  function preview(cells) {
    grid.querySelectorAll('.sel').forEach((el) => el.classList.remove('sel'));
    cells.forEach(({ r, c }) => els[r][c].classList.add('sel'));
  }

  function showAnchor() {
    grid.querySelectorAll('.anchor').forEach((el) => el.classList.remove('anchor'));
    if (anchor) els[anchor.r][anchor.c].classList.add('anchor');
  }

  function attempt(cells) {
    const text = cells.map(({ r, c }) => puz.grid[r][c]).join('');
    const back = text.split('').reverse().join('');
    const i = puz.placed.findIndex((p) => !p.found && (p.w === text || p.w === back));
    if (i < 0) {
      if (cells.length > 1) sfx.oops();
      return;
    }
    puz.placed[i].found = true;
    cells.forEach(({ r, c }) => {
      els[r][c].classList.add('found');
      els[r][c].style.setProperty('--fc', COLORS[i % COLORS.length]);
    });
    sfx.ding();
    speak(puz.placed[i].w.toLowerCase());
    drawList();
    if (puz.placed.every((p) => p.found)) {
      sfx.win();
      confetti(40);
      grid.classList.add('won');
      timer = setTimeout(() => { speak(`Great job, ${k.name}!`); }, 900);
      const again = document.createElement('li');
      again.innerHTML = '<button class="big" id="wsagain">New puzzle</button>';
      list.append(again);
      again.querySelector('button').addEventListener('click', () => { sfx.tap(); deal(); });
    }
  }

  const same = (a, b) => a && b && a.r === b.r && a.c === b.c;

  grid.addEventListener('pointerdown', (e) => {
    if (!puz) return;
    e.preventDefault();
    try { grid.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
    down = cur = cellAt(e);
    moved = false;
    preview(anchor ? line(anchor, down) : [down]);
  });
  grid.addEventListener('pointermove', (e) => {
    if (!down) return;
    const now = cellAt(e);
    if (same(now, cur)) return;
    cur = now;
    if (!same(cur, down)) moved = true;
    preview(line(moved ? down : (anchor || down), cur));
  });
  const up = () => {
    if (!down) return;
    if (moved) {
      attempt(line(down, cur));
      anchor = null;
    } else if (anchor && !same(anchor, down)) {
      attempt(line(anchor, down));
      anchor = null;
    } else {
      anchor = same(anchor, down) ? null : down;
      if (anchor) sfx.tap();
    }
    down = cur = null;
    preview([]);
    showAnchor();
  };
  grid.addEventListener('pointerup', up);
  grid.addEventListener('pointercancel', () => { down = cur = null; preview([]); });

  root.querySelector('.sizes').addEventListener('click', (e) => {
    const b = e.target.closest('.sizebtn');
    if (!b) return;
    level = LEVELS.find((l) => l.id === b.dataset.l);
    k.wsLevel = level.id;
    save();
    sfx.tap();
    deal();
  });

  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  deal();
  return () => { ro.disconnect(); clearTimeout(timer); };
}
