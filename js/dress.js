// Dress the Turkey: tap a category, tap a thing to wear. Nothing to drag, so it works for little hands.
import { kid, save } from './store.js';
import { sfx, toast, confetti } from './fx.js';
import { CATS, turkeySVG, randomOutfit } from './turkey.js';
import { header } from './ui.js';

export function dress(root) {
  const k = kid();
  let cat = CATS[0];

  root.innerHTML = `${header('Dress the Turkey')}
    <main class="dress">
      <div class="stage" id="stage"></div>
      <div class="panel">
        <div class="cats" role="tablist">
          ${CATS.map((c) => `<button class="cat" role="tab" data-cat="${c.id}" aria-label="${c.label}">${c.icon}</button>`).join('')}
        </div>
        <div class="opts" id="opts"></div>
        <div class="actions">
          <button class="big surprise" id="surprise"><span aria-hidden="true">🎲</span> Surprise!</button>
          <button class="big savepic" id="savepic"><span aria-hidden="true">📸</span> Save</button>
        </div>
      </div>
    </main>`;

  const stage = root.querySelector('#stage');
  const opts = root.querySelector('#opts');

  function drawStage(bounce) {
    stage.innerHTML = turkeySVG(k.outfit);
    if (bounce) {
      stage.classList.remove('bounce');
      void stage.offsetWidth;
      stage.classList.add('bounce');
    }
  }

  function drawOpts() {
    root.querySelectorAll('.cat').forEach((b) => {
      const on = b.dataset.cat === cat.id;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    opts.innerHTML = cat.opts.map((o) => `
      <button class="opt${k.outfit[cat.id] === o ? ' on' : ''}" data-opt="${o}" aria-label="${o}">
        ${turkeySVG({ ...k.outfit, [cat.id]: o }, { bg: cat.id === 'bg', view: cat.view })}
      </button>`).join('');
  }

  root.querySelector('.cats').addEventListener('click', (e) => {
    const b = e.target.closest('.cat');
    if (!b) return;
    cat = CATS.find((c) => c.id === b.dataset.cat);
    sfx.tap();
    drawOpts();
  });

  opts.addEventListener('click', (e) => {
    const b = e.target.closest('.opt');
    if (!b) return;
    k.outfit[cat.id] = b.dataset.opt;
    save();
    sfx.pop();
    drawStage(true);
    drawOpts();
  });

  root.querySelector('#surprise').addEventListener('click', () => {
    Object.assign(k.outfit, randomOutfit());
    save();
    sfx.ding();
    drawStage(true);
    drawOpts();
  });

  stage.addEventListener('click', () => { sfx.gobble(); drawStage(true); });

  root.querySelector('#savepic').addEventListener('click', async () => {
    try {
      await savePicture(k);
      sfx.win();
      confetti(18);
      toast('Picture saved!');
    } catch (e) {
      toast('Could not save the picture');
    }
  });

  drawStage(false);
  drawOpts();
}

// Turn the turkey into a PNG with the kid's name on it and save it to the tablet's Downloads.
async function savePicture(k) {
  const S = 1000;
  const svg = turkeySVG(k.outfit, { size: S });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = url; });
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S + 120;
    const g = c.getContext('2d');
    g.fillStyle = '#FFF4E0';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, S, S);
    g.fillStyle = '#5A3418';
    g.font = '600 64px Fredoka, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(`${k.name}'s turkey`, S / 2, S + 60, S - 80);
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${k.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'my'}-turkey.png`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
