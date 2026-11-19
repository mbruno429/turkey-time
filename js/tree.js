// Thankful Tree: both kids add leaves to one family tree by picking a picture, drawing, or typing.
import { state, kid, save, esc } from './store.js';
import { sfx, speak, confetti } from './fx.js';
import { header, modal, holdButton } from './ui.js';

const PICS = [
  ['💞', 'my family'], ['👩', 'Mommy'], ['👨', 'Daddy'], ['👵', 'Grandma'], ['👴', 'Grandpa'],
  ['👧', 'my sister'], ['👦', 'my brother'], ['🧒', 'my friends'], ['🐶', 'dogs'], ['🐱', 'cats'], ['🧸', 'my toys'], ['🏠', 'my home'],
  ['🛏️', 'my cozy bed'], ['🥧', 'pie'], ['🍕', 'yummy food'], ['🍦', 'ice cream'], ['📚', 'books'],
  ['🎵', 'music'], ['🎨', 'art'], ['⚽', 'playing outside'], ['🚲', 'my bike'], ['☀️', 'sunshine'],
  ['🌈', 'rainbows'], ['🤗', 'hugs'],
];
const LEAF_COLORS = ['#E8742C', '#F2B33D', '#C8472B', '#D99A2B', '#8FA63A', '#E0563A'];
const PENS = ['#5A3418', '#E5484D', '#F28C28', '#58B368', '#3BA7D9', '#9B5DE5'];

// 36 spots spread over the treetop. They are handed out farthest-apart first,
// so even a tree with only a few leaves looks full instead of clumped.
const SPOTS = (() => {
  const n = 36;
  const pts = [];
  for (let k = 0; k < n; k++) {
    const r = Math.sqrt((k + 0.6) / n);
    const a = k * 2.39996;
    pts.push({ x: 50 + Math.cos(a) * 40 * r, y: 34 + Math.sin(a) * 27 * r });
  }
  const order = [pts.splice(8, 1)[0]];
  while (pts.length) {
    let best = 0;
    let bestD = -1;
    pts.forEach((p, i) => {
      const d = Math.min(...order.map((o) => (o.x - p.x) ** 2 + ((o.y - p.y) * 0.75) ** 2));
      if (d > bestD) { bestD = d; best = i; }
    });
    order.push(pts.splice(best, 1)[0]);
  }
  return order;
})();

function slot(i) {
  const p = SPOTS[i % SPOTS.length];
  const lap = Math.floor(i / SPOTS.length);
  return { x: p.x + lap * 2.2, y: p.y + lap * 2.2 };
}

const TREE = `<svg viewBox="0 0 800 600" class="treeart" aria-hidden="true">
  <ellipse cx="400" cy="585" rx="330" ry="34" fill="#C9DB8E"/>
  <g fill="none" stroke="#7A4A22" stroke-linecap="round">
    <path d="M400 590V330" stroke-width="62"/>
    <path d="M400 380Q330 300 215 250" stroke-width="34"/><path d="M400 370Q480 290 590 235" stroke-width="34"/>
    <path d="M400 340Q395 220 400 120" stroke-width="30"/>
    <path d="M300 300Q250 220 190 140" stroke-width="20"/><path d="M500 290Q560 200 610 120" stroke-width="20"/>
    <path d="M398 230Q340 170 300 90" stroke-width="16"/><path d="M402 220Q460 160 500 80" stroke-width="16"/>
    <path d="M215 250Q150 250 100 290" stroke-width="16"/><path d="M590 235Q660 230 705 270" stroke-width="16"/>
  </g>
  <path d="M385 560Q392 470 388 400" fill="none" stroke="#5A3418" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
</svg>`;

function leafInner(l) {
  if (l.type === 'emoji') return `<span class="lf-emoji">${l.value}</span>`;
  if (l.type === 'draw') return `<img src="${l.value}" alt="">`;
  return `<span class="lf-text">${esc(l.value)}</span>`;
}

function leafLabel(l) {
  if (l.type === 'draw') return 'this drawing';
  return l.type === 'emoji' ? l.label : l.value;
}

export function tree(root) {
  root.innerHTML = `${header('Thankful Tree')}
    <main class="treepage">
      <div class="treebox" id="treebox">${TREE}<div class="leaves" id="leaves"></div>
        <p class="treehint" id="treehint">What are you thankful for?<br>Tap the big leaf!</p>
      </div>
      <button class="addleaf" id="addleaf" aria-label="Add a leaf"><span aria-hidden="true">🍁</span><b>+</b></button>
      <p class="leafcount" id="leafcount"></p>
    </main>`;

  const box = root.querySelector('#treebox');
  const leavesEl = root.querySelector('#leaves');

  function fit() {
    const page = root.querySelector('.treepage');
    const w = page.clientWidth - 24;
    const h = page.clientHeight - 16;
    const width = Math.max(200, Math.min(w, (h * 4) / 3));
    box.style.width = width + 'px';
    box.style.fontSize = width / 100 + 'px'; // leaves are sized in em so they scale with the tree
  }

  function draw(newest) {
    leavesEl.innerHTML = state.leaves.map((l, i) => {
      const p = slot(i);
      const who = state.kids[l.kid] || kid();
      const rot = ((i * 47) % 50) - 25;
      return `<button class="leaf${i === newest ? ' new' : ''}" data-i="${i}"
        style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%;--c:${LEAF_COLORS[i % LEAF_COLORS.length]};--k:${who.color};--r:${rot}deg"
        aria-label="${esc(who.name)} is thankful for ${esc(leafLabel(l))}"><span class="lf">${leafInner(l)}</span></button>`;
    }).join('');
    root.querySelector('#treehint').hidden = state.leaves.length > 0;
    root.querySelector('.treepage').classList.toggle('empty', state.leaves.length === 0);
    const n = state.leaves.length;
    root.querySelector('#leafcount').textContent = n ? `${n} ${n === 1 ? 'leaf' : 'leaves'}` : '';
  }

  function add(leaf) {
    const k = kid();
    state.leaves.push({ ...leaf, kid: state.kid, at: Date.now() });
    save();
    draw(state.leaves.length - 1);
    sfx.ding();
    confetti(14, ['🍁', '🍂']);
    speak(`${k.name} is thankful for ${leafLabel(leaf)}`);
  }

  leavesEl.addEventListener('click', (e) => {
    const b = e.target.closest('.leaf');
    if (!b) return;
    const i = +b.dataset.i;
    const l = state.leaves[i];
    const who = state.kids[l.kid] || kid();
    sfx.pop();
    speak(`${who.name} is thankful for ${leafLabel(l)}`);
    const m = modal(`
      <div class="leafview" style="--k:${who.color}">
        <div class="lv-pic">${leafInner(l)}</div>
        <p class="lv-who"><span aria-hidden="true">${who.icon}</span> ${esc(who.name)} is thankful for</p>
        <p class="lv-what">${l.type === 'draw' ? 'this drawing' : esc(leafLabel(l))}</p>
        <div class="row">
          <button class="big" data-close>OK!</button>
          <button class="quiet" id="rm">Hold to remove</button>
        </div>
      </div>`);
    holdButton(m.el.querySelector('#rm'), () => {
      state.leaves.splice(i, 1);
      save();
      m.close();
      draw();
    });
  });

  root.querySelector('#addleaf').addEventListener('click', () => { sfx.tap(); openPicker(add); });

  const ro = new ResizeObserver(fit);
  ro.observe(root.querySelector('.treepage'));
  fit();
  draw();
  return () => ro.disconnect();
}

function openPicker(add) {
  const k = kid();
  const m = modal(`
    <div class="picker">
      <h2><span aria-hidden="true">${k.icon}</span> ${esc(k.name)} is thankful for…</h2>
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="pics" role="tab">🖼️ Pick</button>
        <button class="tab" data-tab="draw" role="tab">🖍️ Draw</button>
        <button class="tab" data-tab="words" role="tab">✏️ Write</button>
        <button class="closex" data-close aria-label="Close">✕</button>
      </div>
      <div class="pane" data-pane="pics">
        <div class="picgrid">${PICS.map(([e, label], i) => `<button class="pic" data-i="${i}" aria-label="${label}"><span>${e}</span><small>${label}</small></button>`).join('')}</div>
      </div>
      <div class="pane" data-pane="draw" hidden>
        <div class="drawwrap">
          <canvas id="pad" width="360" height="360" aria-label="Drawing pad"></canvas>
          <div class="pens">
            ${PENS.map((c, i) => `<button class="pen${i ? '' : ' on'}" data-c="${c}" style="--c:${c}" aria-label="Pen color ${i + 1}"></button>`).join('')}
            <button class="quiet" id="clearpad">Start over</button>
          </div>
        </div>
        <button class="big" id="adddraw">Add my leaf</button>
      </div>
      <div class="pane" data-pane="words" hidden>
        <label class="wordlabel" for="words">I am thankful for…</label>
        <input id="words" type="text" maxlength="40" autocomplete="off" autocapitalize="sentences" placeholder="type it here">
        <button class="big" id="addwords">Add my leaf</button>
      </div>
    </div>`);
  const el = m.el;

  el.querySelector('.tabs').addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    sfx.tap();
    el.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b === t));
    el.querySelectorAll('.pane').forEach((p) => { p.hidden = p.dataset.pane !== t.dataset.tab; });
    if (t.dataset.tab === 'words') el.querySelector('#words').focus();
  });

  el.querySelector('.picgrid').addEventListener('click', (e) => {
    const b = e.target.closest('.pic');
    if (!b) return;
    const [value, label] = PICS[+b.dataset.i];
    m.close();
    add({ type: 'emoji', value, label });
  });

  // Drawing pad
  const pad = el.querySelector('#pad');
  const g = pad.getContext('2d');
  let pen = PENS[0];
  let drawing = false;
  let dirty = false;
  g.lineWidth = 14;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const pos = (e) => {
    const r = pad.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * pad.width, ((e.clientY - r.top) / r.height) * pad.height];
  };
  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { pad.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
    drawing = true;
    dirty = true;
    const [x, y] = pos(e);
    g.strokeStyle = pen;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 0.1, y + 0.1);
    g.stroke();
  });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [x, y] = pos(e);
    g.lineTo(x, y);
    g.stroke();
  });
  ['pointerup', 'pointercancel'].forEach((ev) => pad.addEventListener(ev, () => { drawing = false; }));
  el.querySelector('.pens').addEventListener('click', (e) => {
    const b = e.target.closest('.pen');
    if (!b) return;
    pen = b.dataset.c;
    el.querySelectorAll('.pen').forEach((p) => p.classList.toggle('on', p === b));
  });
  el.querySelector('#clearpad').addEventListener('click', () => { g.clearRect(0, 0, pad.width, pad.height); dirty = false; });
  el.querySelector('#adddraw').addEventListener('click', () => {
    if (!dirty) { sfx.oops(); pad.classList.add('shake'); setTimeout(() => pad.classList.remove('shake'), 400); return; }
    // Shrink the drawing so many leaves fit in the tablet's storage.
    const small = document.createElement('canvas');
    small.width = small.height = 160;
    small.getContext('2d').drawImage(pad, 0, 0, 160, 160);
    m.close();
    add({ type: 'draw', value: small.toDataURL('image/png') });
  });

  const words = el.querySelector('#words');
  const addWords = () => {
    const v = words.value.trim();
    if (!v) { sfx.oops(); words.focus(); return; }
    m.close();
    add({ type: 'text', value: v });
  };
  el.querySelector('#addwords').addEventListener('click', addWords);
  words.addEventListener('keydown', (e) => { if (e.key === 'Enter') addWords(); });
}
