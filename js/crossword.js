// Crossword: a fresh little Thanksgiving crossword every time.
// Easy and Medium give a handful of letter buttons for each word; Hard gives the whole alphabet.
import { kid, save, esc } from './store.js';
import { sfx, confetti, speak } from './fx.js';
import { header } from './ui.js';
import { WORDS, shuffle, pick } from './words.js';

const LEVELS = [
  { id: 'easy', face: '🙂', label: 'Easy', count: 4, maxLen: 5, max: 7, decoys: 0 },
  { id: 'medium', face: '😀', label: 'Medium', count: 6, maxLen: 7, max: 9, decoys: 3 },
  { id: 'hard', face: '🏆', label: 'Hard', count: 8, maxLen: 8, max: 11, decoys: -1 }, // -1 = full alphabet
];
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const key = (r, c) => r + ',' + c;

// Lay words out so each new word crosses one already on the board, then number them like a real crossword.
export function makeCrossword(level) {
  const maxR = level.maxRows || level.max;
  const maxC = level.maxCols || level.max;
  let best = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    const pool = shuffle(WORDS.filter(([w]) => w.length <= level.maxLen && w.length <= Math.max(maxR, maxC)));
    const cells = new Map();
    const placed = [];
    const box = { r0: 0, r1: 0, c0: 0, c1: 0 };

    const put = ([w, e, clue], r, c, dir) => {
      const keys = [];
      for (let i = 0; i < w.length; i++) {
        const rr = r + (dir ? i : 0);
        const cc = c + (dir ? 0 : i);
        const cell = cells.get(key(rr, cc)) || { ch: w[i], h: false, v: false };
        cell[dir ? 'v' : 'h'] = true;
        cells.set(key(rr, cc), cell);
        keys.push([rr, cc]);
        box.r0 = Math.min(box.r0, rr); box.r1 = Math.max(box.r1, rr);
        box.c0 = Math.min(box.c0, cc); box.c1 = Math.max(box.c1, cc);
      }
      placed.push({ w, e, clue, r, c, dir, keys });
    };

    const fits = (w, r, c, dir) => {
      const dr = dir ? 1 : 0;
      const dc = dir ? 0 : 1;
      const L = w.length;
      if (cells.has(key(r - dr, c - dc)) || cells.has(key(r + dr * L, c + dc * L))) return false;
      if (Math.max(box.r1, r + dr * (L - 1)) - Math.min(box.r0, r) >= maxR) return false;
      if (Math.max(box.c1, c + dc * (L - 1)) - Math.min(box.c0, c) >= maxC) return false;
      let crosses = 0;
      for (let i = 0; i < L; i++) {
        const rr = r + dr * i;
        const cc = c + dc * i;
        const cell = cells.get(key(rr, cc));
        if (cell) {
          if (cell.ch !== w[i] || cell[dir ? 'v' : 'h']) return false;
          crosses++;
        } else if (cells.has(key(rr + dc, cc + dr)) || cells.has(key(rr - dc, cc - dr))) {
          return false; // would sit right beside another word
        }
      }
      return crosses > 0;
    };

    put(pool.splice(pool.findIndex(([w]) => w.length <= maxC), 1)[0], 0, 0, 0);
    let progress = true;
    while (placed.length < level.count && progress) {
      progress = false;
      for (let p = 0; p < pool.length && placed.length < level.count; p++) {
        const w = pool[p][0];
        if (placed.some((x) => x.w.includes(w) || w.includes(x.w))) continue; // no CORN next to ACORN
        const options = [];
        for (const [k, cell] of cells) {
          if (cell.h && cell.v) continue;
          const dir = cell.h ? 1 : 0;
          const [r, c] = k.split(',').map(Number);
          for (let i = 0; i < w.length; i++) {
            if (w[i] !== cell.ch) continue;
            const sr = r - (dir ? i : 0);
            const sc = c - (dir ? 0 : i);
            if (fits(w, sr, sc, dir)) options.push([sr, sc, dir]);
          }
        }
        if (options.length) {
          const [r, c, dir] = pick(options);
          put(pool[p], r, c, dir);
          pool.splice(p, 1);
          p--;
          progress = true;
        }
      }
    }
    if (!best || placed.length > best.placed.length) best = { placed, box, cells };
    if (placed.length === level.count) break;
  }

  const { placed, box, cells } = best;
  const letters = new Map();
  for (const [k, cell] of cells) {
    const [r, c] = k.split(',').map(Number);
    letters.set(key(r - box.r0, c - box.c0), cell.ch);
  }
  const words = placed.map((p) => ({
    w: p.w, e: p.e, clue: p.clue, dir: p.dir,
    cells: p.keys.map(([r, c]) => key(r - box.r0, c - box.c0)),
    r: p.r - box.r0, c: p.c - box.c0, solved: false,
  }));
  words.sort((a, b) => a.r - b.r || a.c - b.c || a.dir - b.dir);
  let n = 0;
  const nums = new Map();
  for (const word of words) {
    const k = word.cells[0];
    if (!nums.has(k)) nums.set(k, ++n);
    word.num = nums.get(k);
    if (level.decoys < 0) {
      word.bank = ABC.split('');
    } else {
      const own = [...new Set(word.w)];
      const others = shuffle(ABC.split('').filter((ch) => !own.includes(ch))).slice(0, level.decoys);
      word.bank = shuffle([...own, ...others]);
    }
  }
  return { words, letters, nums, rows: box.r1 - box.r0 + 1, cols: box.c1 - box.c0 + 1 };
}

export function crossword(root) {
  const k = kid();
  let level = LEVELS.find((l) => l.id === k.cwLevel) || LEVELS[k.level === 'little' ? 0 : 1];
  let puz;
  let fill = new Map();
  let locked = new Set();
  let cur = 0;
  let pos = 0;
  let busy = false;
  let done = false;
  let timer;

  root.innerHTML = `${header('Crossword')}
    <main class="puzzle">
      <div class="matchbar">
        <div class="sizes" role="group" aria-label="How hard">
          ${LEVELS.map((l) => `<button class="sizebtn" data-l="${l.id}"><span aria-hidden="true">${l.face}</span> ${l.label}</button>`).join('')}
        </div>
        <p class="moves" id="cwleft"></p>
      </div>
      <div class="puzbody cwbody">
        <div class="gridwrap" id="cwwrap"><div class="cwgrid" id="cwgrid"></div></div>
        <div class="cwpanel" id="cwpanel"></div>
      </div>
    </main>`;

  const grid = root.querySelector('#cwgrid');
  const wrap = root.querySelector('#cwwrap');
  const panel = root.querySelector('#cwpanel');

  function fit() {
    if (!puz) return;
    const gap = 4;
    const s = Math.floor(Math.min(
      (wrap.clientWidth - gap * (puz.cols - 1) - 8) / puz.cols,
      (wrap.clientHeight - gap * (puz.rows - 1) - 8) / puz.rows,
      88,
    ));
    grid.style.setProperty('--cell', Math.max(14, s) + 'px');
    grid.style.setProperty('--cols', puz.cols);
    grid.style.setProperty('--rows', puz.rows);
  }

  // On a phone, make a smaller puzzle so its squares stay big enough to tap.
  function sized() {
    if (Math.min(innerWidth, innerHeight) >= 600) return level;
    const portrait = innerHeight >= innerWidth;
    const clamp = (v) => Math.max(5, Math.min(level.max, Math.floor(v / 32)));
    return {
      ...level,
      maxRows: clamp(portrait ? innerHeight - 430 : innerHeight - 150),
      maxCols: clamp(portrait ? innerWidth - 30 : innerWidth * 0.5),
    };
  }

  const word = () => puz.words[cur];

  function firstOpen(w) {
    const i = w.cells.findIndex((c) => !locked.has(c) && !fill.get(c));
    return i < 0 ? Math.max(0, w.cells.findIndex((c) => !locked.has(c))) : i;
  }

  function select(i, at) {
    cur = i;
    pos = at == null ? firstOpen(word()) : at;
    draw();
  }

  function draw() {
    const w = word();
    grid.querySelectorAll('.cwcell').forEach((el) => {
      const c = el.dataset.k;
      el.querySelector('b').textContent = fill.get(c) || '';
      el.classList.remove('bad');
      el.classList.toggle('locked', locked.has(c));
      el.classList.toggle('inword', !done && w.cells.includes(c));
      el.classList.toggle('cursor', !done && w.cells[pos] === c);
    });
    const left = puz.words.filter((x) => !x.solved).length;
    root.querySelector('#cwleft').textContent = left ? `${left} to go` : 'All done!';

    if (done) {
      panel.innerHTML = `<div class="clue"><p class="clueemoji" aria-hidden="true">🎉</p>
        <p class="cluetext">You did it, ${esc(k.name)}!</p></div>
        <button class="big" id="cwagain">New puzzle</button>`;
      return;
    }
    panel.innerHTML = `
      <div class="clue">
        <p class="cluenum">${w.num} ${w.dir ? 'Down ↓' : 'Across →'}</p>
        <p class="clueemoji" aria-hidden="true">${w.e}</p>
        <p class="cluetext">${esc(w.clue)}</p>
      </div>
      <div class="cwtools">
        <button class="round" data-act="prev" aria-label="Previous word">◀</button>
        <button class="round" data-act="say" aria-label="Read the clue out loud">🔊</button>
        <button class="round" data-act="hint" aria-label="Give me a letter">💡</button>
        <button class="round" data-act="next" aria-label="Next word">▶</button>
      </div>
      <div class="keys" style="--kc:${Math.min(9, w.bank.length + 1)}">
        ${w.bank.map((ch) => `<button class="key" data-ch="${ch}">${ch}</button>`).join('')}
        <button class="key del" data-ch="back" aria-label="Rub out">⌫</button>
      </div>`;
  }

  // Lock in any word whose squares are all correct. Returns how many were newly solved.
  function sweep() {
    let n = 0;
    for (const w of puz.words) {
      if (w.solved || !w.cells.every((c) => fill.get(c) === puz.letters.get(c))) continue;
      w.solved = true;
      w.cells.forEach((c) => locked.add(c));
      n++;
    }
    return n;
  }

  function step(dirn) {
    const n = puz.words.length;
    for (let i = 1; i <= n; i++) {
      const j = (cur + dirn * i + n * i) % n;
      if (!puz.words[j].solved) return select(j);
    }
    return draw();
  }

  function afterLetter() {
    const w = word();
    if (sweep()) {
      sfx.ding();
      if (puz.words.every((x) => x.solved)) {
        done = true;
        draw();
        sfx.win();
        confetti(40);
        speak(`You did it, ${k.name}!`);
        return;
      }
      if (w.solved) { speak(w.w.toLowerCase()); return step(1); }
    }
    const open = w.cells.findIndex((c, i) => i > pos && !locked.has(c) && !fill.get(c));
    const anyOpen = w.cells.findIndex((c) => !locked.has(c) && !fill.get(c));
    if (open >= 0) { pos = open; return draw(); }
    if (anyOpen >= 0) { pos = anyOpen; return draw(); }
    // The word is full but not right: show the wrong squares, then rub them out.
    const wrong = w.cells.filter((c) => !locked.has(c) && fill.get(c) !== puz.letters.get(c));
    draw();
    sfx.oops();
    busy = true;
    wrong.forEach((c) => grid.querySelector(`[data-k="${c}"]`).classList.add('bad'));
    timer = setTimeout(() => {
      wrong.forEach((c) => fill.delete(c));
      busy = false;
      pos = firstOpen(w);
      draw();
    }, 800);
  }

  function type(ch) {
    if (done || busy) return;
    const w = word();
    if (ch === 'back') {
      let i = pos;
      if (locked.has(w.cells[i]) || !fill.get(w.cells[i])) {
        do { i--; } while (i >= 0 && locked.has(w.cells[i]));
      }
      if (i >= 0) { fill.delete(w.cells[i]); pos = i; sfx.flip(); }
      return draw();
    }
    if (locked.has(w.cells[pos])) pos = firstOpen(w);
    if (locked.has(w.cells[pos])) return;
    fill.set(w.cells[pos], ch);
    sfx.tap();
    afterLetter();
  }

  function hint() {
    if (done || busy) return;
    const w = word();
    let c = w.cells[pos];
    if (locked.has(c)) c = w.cells.find((x) => !locked.has(x));
    if (!c) return;
    fill.set(c, puz.letters.get(c));
    locked.add(c);
    pos = w.cells.indexOf(c);
    sfx.pop();
    afterLetter();
  }

  function deal() {
    clearTimeout(timer);
    puz = makeCrossword(sized());
    fill = new Map();
    locked = new Set();
    busy = false;
    done = false;
    let html = '';
    for (const [c, ] of puz.letters) {
      const [r, col] = c.split(',').map(Number);
      const num = puz.nums.get(c);
      html += `<button class="cwcell" data-k="${c}" style="grid-row:${r + 1};grid-column:${col + 1}" aria-label="Square row ${r + 1}, column ${col + 1}">${num ? `<i>${num}</i>` : ''}<b></b></button>`;
    }
    grid.innerHTML = html;
    root.querySelectorAll('.sizebtn').forEach((b) => b.classList.toggle('on', b.dataset.l === level.id));
    fit();
    select(0);
  }

  grid.addEventListener('click', (e) => {
    const el = e.target.closest('.cwcell');
    if (!el || done || busy) return;
    const c = el.dataset.k;
    // Only words that still need letters can be picked, so the letter buttons always do something.
    const mine = puz.words.map((w, i) => (w.cells.includes(c) && !w.solved ? i : -1)).filter((i) => i >= 0);
    if (!mine.length) return;
    let next = mine.includes(cur) ? cur : mine[0];
    // Tapping the square you are already on flips between its across and down words.
    if (mine.length > 1 && mine.includes(cur) && word().cells[pos] === c) next = mine.find((i) => i !== cur);
    sfx.tap();
    select(next, puz.words[next].cells.indexOf(c));
  });

  panel.addEventListener('click', (e) => {
    const keyBtn = e.target.closest('.key');
    if (keyBtn) return type(keyBtn.dataset.ch);
    if (e.target.closest('#cwagain')) { sfx.tap(); return deal(); }
    const act = e.target.closest('[data-act]');
    if (!act || busy) return undefined;
    if (act.dataset.act === 'say') return speak(word().clue);
    if (act.dataset.act === 'hint') return hint();
    sfx.tap();
    return step(act.dataset.act === 'next' ? 1 : -1);
  });

  // A real keyboard works too, which is handy on a computer.
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-z]$/i.test(e.key)) type(e.key.toUpperCase());
    else if (e.key === 'Backspace') type('back');
  };
  document.addEventListener('keydown', onKey);

  root.querySelector('.sizes').addEventListener('click', (e) => {
    const b = e.target.closest('.sizebtn');
    if (!b) return;
    level = LEVELS.find((l) => l.id === b.dataset.l);
    k.cwLevel = level.id;
    save();
    sfx.tap();
    deal();
  });

  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  deal();
  return () => { ro.disconnect(); clearTimeout(timer); document.removeEventListener('keydown', onKey); };
}
