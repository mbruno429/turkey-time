// The turkey and everything it can wear, drawn as SVG so it stays sharp at any size.
const O = '#5A3418'; // outline
const ol = `stroke="${O}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

function star(cx, cy, R, r, attrs) {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    p += `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)} `;
  }
  return `<polygon points="${p.trim()}" ${attrs}/>`;
}

function heart(cx, cy, s, attrs) {
  return `<path d="M${cx} ${cy + s * 0.9}C${cx - s * 1.5} ${cy - s * 0.1} ${cx - s * 0.6} ${cy - s * 1.1} ${cx} ${cy - s * 0.35}C${cx + s * 0.6} ${cy - s * 1.1} ${cx + s * 1.5} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z" ${attrs}/>`;
}

const FEATHER_SETS = {
  autumn: ['#C8472B', '#E8742C', '#F2B33D', '#8FA63A', '#8FA63A', '#F2B33D', '#E8742C', '#C8472B'],
  rainbow: ['#E5484D', '#F28C28', '#F6C83B', '#58B368', '#3BA7D9', '#5567D8', '#9B5DE5', '#E85D9A'],
  pink: ['#F7A8C9', '#E85D9A', '#B983F0', '#F7A8C9', '#E85D9A', '#B983F0', '#F7A8C9', '#E85D9A'],
  cool: ['#2F74C9', '#F6C83B', '#3BA7D9', '#F6C83B', '#F6C83B', '#3BA7D9', '#F6C83B', '#2F74C9'],
};

function feathers(set, earned) {
  const cols = FEATHER_SETS[set] || FEATHER_SETS.autumn;
  const shape = 'M0 0C-30 -50 -30 -135 0 -172C30 -135 30 -50 0 0Z';
  let s = '';
  for (let i = 0; i < 8; i++) {
    const a = -77 + i * 22;
    s += `<g transform="translate(200 252) rotate(${a})">`;
    s += i < earned
      ? `<path d="${shape}" fill="${cols[i]}" ${ol}/><path d="M0 -24V-142" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="${shape}" fill="#fff" fill-opacity=".45" stroke="#B89A7A" stroke-width="4" stroke-dasharray="9 9"/>`;
    s += '</g>';
  }
  return s;
}

const HATS = {
  none: '',
  crown: `<path d="M158 134L152 84L178 108L200 70L222 108L248 84L242 134Z" fill="#F6C83B" ${ol}/>
    <circle cx="200" cy="114" r="8" fill="#E5484D"/><circle cx="175" cy="121" r="5.5" fill="#3BA7D9"/><circle cx="225" cy="121" r="5.5" fill="#58B368"/>
    <circle cx="152" cy="84" r="6" fill="#FFF3B0" ${ol}/><circle cx="200" cy="70" r="6" fill="#FFF3B0" ${ol}/><circle cx="248" cy="84" r="6" fill="#FFF3B0" ${ol}/>`,
  pilgrim: `<path d="M169 124L175 66H225L231 124Z" fill="#2B2B33" ${ol}/>
    <path d="M171 100H229L230.500 116H169.500Z" fill="#7A4A22"/>
    <rect x="189" y="97" width="22" height="22" rx="3" fill="none" stroke="#F6C83B" stroke-width="5"/>
    <rect x="144" y="120" width="112" height="15" rx="7.500" fill="#2B2B33" ${ol}/>`,
  party: `<path d="M166 132L200 50L234 132Z" fill="#3BA7D9" ${ol}/>
    <circle cx="200" cy="88" r="6" fill="#F6C83B"/><circle cx="187" cy="113" r="6" fill="#F7A8C9"/><circle cx="213" cy="113" r="6" fill="#B8E986"/>
    <circle cx="200" cy="46" r="12" fill="#F6C83B" ${ol}/>`,
  chef: `<circle cx="174" cy="92" r="23" fill="#fff" ${ol}/><circle cx="226" cy="92" r="23" fill="#fff" ${ol}/><circle cx="200" cy="80" r="27" fill="#fff" ${ol}/>
    <circle cx="200" cy="96" r="22" fill="#fff"/>
    <rect x="170" y="104" width="60" height="28" rx="4" fill="#fff" ${ol}/>`,
  star: `<path d="M156 150Q200 98 244 150" fill="none" stroke="#E5484D" stroke-width="10" stroke-linecap="round"/>
    ${star(200, 104, 32, 14, `fill="#F6C83B" ${ol}`)}`,
  cowboy: `<ellipse cx="200" cy="126" rx="74" ry="14" fill="#A0622D" ${ol}/>
    <path d="M166 124C162 84 184 74 200 88C216 74 238 84 234 124Z" fill="#B8763A" ${ol}/>
    <path d="M167 112Q200 122 233 112" fill="none" stroke="#E5484D" stroke-width="8"/>`,
};

const GLASSES = {
  none: '',
  round: `<circle cx="183" cy="162" r="18" fill="#BDE3FF" fill-opacity=".35" stroke="#2B2B33" stroke-width="5"/>
    <circle cx="217" cy="162" r="18" fill="#BDE3FF" fill-opacity=".35" stroke="#2B2B33" stroke-width="5"/>`,
  shades: `<rect x="160" y="148" width="38" height="28" rx="11" fill="#1F1F29"/><rect x="202" y="148" width="38" height="28" rx="11" fill="#1F1F29"/>
    <path d="M196 156H204" stroke="#1F1F29" stroke-width="6"/>
    <path d="M168 156L176 152M210 156L218 152" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`,
  hearts: `${heart(181, 161, 19, 'fill="#E85D9A" fill-opacity=".55" stroke="#C2185B" stroke-width="4" stroke-linejoin="round"')}
    ${heart(219, 161, 19, 'fill="#E85D9A" fill-opacity=".55" stroke="#C2185B" stroke-width="4" stroke-linejoin="round"')}`,
  stars: `${star(181, 162, 22, 10, 'fill="#F6C83B" fill-opacity=".6" stroke="#B8860B" stroke-width="4" stroke-linejoin="round"')}
    ${star(219, 162, 22, 10, 'fill="#F6C83B" fill-opacity=".6" stroke="#B8860B" stroke-width="4" stroke-linejoin="round"')}`,
};

function pearls() {
  let s = '';
  for (let i = 0; i <= 8; i++) {
    const x = 162 + i * 9.5;
    const y = 222 + 22 * Math.sin((Math.PI * i) / 8);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.500" fill="#FFF8F0" stroke="#B9A593" stroke-width="2"/>`;
  }
  return s + heart(200, 258, 9, 'fill="#E85D9A" stroke="#C2185B" stroke-width="2.500"');
}

const NECK = {
  none: '',
  bowtie: `<path d="M200 236L168 218V254Z" fill="#E5484D" ${ol}/><path d="M200 236L232 218V254Z" fill="#E5484D" ${ol}/>
    <circle cx="200" cy="236" r="9" fill="#B3323B" ${ol}/>`,
  scarf: `<path d="M224 240L240 236L248 290L228 294Z" fill="#58B368" ${ol}/>
    <path d="M156 218Q200 244 244 218L248 236Q200 264 152 236Z" fill="#6CC47C" ${ol}/>
    <path d="M230 262L246 258M231 276L247 272" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>`,
  pearls: pearls(),
  medal: `<path d="M176 218L200 262L224 218" fill="none" stroke="#2F74C9" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="200" cy="272" r="19" fill="#F6C83B" stroke="#B8860B" stroke-width="4"/>
    ${star(200, 272, 11, 5, 'fill="#FFF3B0"')}`,
};

const HOLD = {
  none: '',
  wand: `<path d="M286 298L330 202" stroke="#8E5BD9" stroke-width="8" stroke-linecap="round"/>
    ${star(336, 186, 27, 12, `fill="#F6C83B" ${ol}`)}
    <circle cx="372" cy="160" r="4" fill="#F6C83B"/><circle cx="304" cy="158" r="4" fill="#F6C83B"/><circle cx="368" cy="214" r="3" fill="#F6C83B"/>`,
  mic: `<path d="M284 300L316 232" stroke="#2B2B33" stroke-width="11" stroke-linecap="round"/>
    <circle cx="324" cy="214" r="19" fill="#AEB6C0" stroke="#2B2B33" stroke-width="4"/>
    <path d="M311 206L337 222M316 198L334 230M308 216L330 228" stroke="#2B2B33" stroke-opacity=".45" stroke-width="2.500"/>`,
  pie: `<path d="M300 268q-8 -10 0 -20M316 268q-8 -10 0 -20" fill="none" stroke="#F5E6D0" stroke-width="4" stroke-linecap="round"/>
    <path d="M266 290L277 314H335L346 290Z" fill="#C9CED6" ${ol}/>
    <ellipse cx="306" cy="290" rx="42" ry="13" fill="#E9B872" ${ol}/>
    <ellipse cx="306" cy="289" rx="30" ry="8" fill="#C8621E"/>`,
  balloon: `<path d="M288 288Q296 222 340 172" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
    <path d="M334 166L348 166L341 178Z" fill="#E5484D" ${ol}/>
    <ellipse cx="342" cy="124" rx="35" ry="43" fill="#E5484D" ${ol}/>
    <ellipse cx="330" cy="108" rx="8" ry="13" fill="#fff" fill-opacity=".5"/>`,
};

function pumpkin(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-34" width="8" height="14" rx="3" fill="#4F7A3A"/>
    <ellipse cx="-14" cy="0" rx="18" ry="24" fill="#E8742C"/><ellipse cx="14" cy="0" rx="18" ry="24" fill="#E8742C"/><ellipse cx="0" cy="0" rx="16" ry="26" fill="#F28C28"/></g>`;
}

const BG = {
  dots: `<rect width="400" height="400" fill="#FFE3B8"/>
    <g fill="#F7C886">${[[40, 50], [140, 30], [250, 60], [350, 36], [90, 130], [320, 150], [36, 230], [372, 260], [70, 330], [330, 350], [200, 20]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13"/>`).join('')}</g>`,
  farm: `<rect width="400" height="400" fill="#BFE6F5"/>
    <circle cx="336" cy="62" r="34" fill="#F6C83B"/>
    <g fill="#fff"><ellipse cx="80" cy="70" rx="42" ry="16"/><ellipse cx="104" cy="58" rx="26" ry="16"/><ellipse cx="240" cy="36" rx="32" ry="12"/></g>
    <ellipse cx="200" cy="430" rx="330" ry="120" fill="#8FBF5A"/>
    ${pumpkin(48, 356, 1)}${pumpkin(356, 366, 0.8)}`,
  stage: `<rect width="400" height="400" fill="#2C1B47"/>
    <path d="M200 -30L40 400H360Z" fill="#FFF3B0" fill-opacity=".22"/>
    <rect y="350" width="400" height="50" fill="#7A4A22"/><rect y="350" width="400" height="6" fill="#5A3418"/>
    <path d="M0 0H78Q44 190 62 400H0Z" fill="#B3323B"/><path d="M400 0H322Q356 190 338 400H400Z" fill="#B3323B"/>
    <path d="M0 0H400V26Q200 58 0 26Z" fill="#8E2430"/>
    ${star(110, 90, 9, 4, 'fill="#F6C83B"')}${star(300, 110, 7, 3, 'fill="#F6C83B"')}${star(280, 60, 5, 2.2, 'fill="#F6C83B"')}`,
  castle: `<rect width="400" height="400" fill="#F9D5E8"/><rect y="150" width="400" height="250" fill="#F3C6EC" fill-opacity=".7"/>
    <g fill="#C9A7E8"><rect x="24" y="170" width="62" height="200"/><rect x="314" y="170" width="62" height="200"/><rect x="86" y="230" width="228" height="140"/>
    <rect x="24" y="156" width="14" height="16"/><rect x="48" y="156" width="14" height="16"/><rect x="72" y="156" width="14" height="16"/>
    <rect x="314" y="156" width="14" height="16"/><rect x="338" y="156" width="14" height="16"/><rect x="362" y="156" width="14" height="16"/></g>
    <path d="M14 158L55 92L96 158Z" fill="#E85D9A"/><path d="M304 158L345 92L386 158Z" fill="#E85D9A"/>
    <path d="M55 92V70L72 78L55 86" fill="#F6C83B"/><path d="M345 92V70L362 78L345 86" fill="#F6C83B"/>
    <rect x="44" y="200" width="22" height="34" rx="11" fill="#8E5BD9"/><rect x="334" y="200" width="22" height="34" rx="11" fill="#8E5BD9"/>
    <ellipse cx="200" cy="420" rx="320" ry="80" fill="#A8D08D"/>
    ${star(130, 60, 8, 3.5, 'fill="#fff"')}${star(262, 44, 6, 2.6, 'fill="#fff"')}${star(200, 26, 5, 2.2, 'fill="#fff"')}`,
  night: `<rect width="400" height="400" fill="#1E2A52"/>
    <circle cx="326" cy="72" r="32" fill="#FFF3B0"/><circle cx="312" cy="64" r="28" fill="#1E2A52"/>
    ${[[50, 50, 7], [120, 100, 5], [200, 36, 6], [262, 120, 4], [80, 170, 4], [360, 180, 5], [30, 120, 3], [150, 40, 3]]
    .map(([x, y, r]) => star(x, y, r, r * 0.45, 'fill="#FFF3B0"')).join('')}
    <ellipse cx="200" cy="440" rx="340" ry="120" fill="#2F4A3A"/>`,
};

export const CATS = [
  { id: 'hat', icon: '🎩', label: 'Hats', view: '125 30 150 150', opts: Object.keys(HATS) },
  { id: 'glasses', icon: '👓', label: 'Glasses', view: '140 110 120 120', opts: Object.keys(GLASSES) },
  { id: 'neck', icon: '🎀', label: 'Necklaces', view: '130 175 140 140', opts: Object.keys(NECK) },
  { id: 'hold', icon: '🎈', label: 'Things to hold', view: '190 70 210 270', opts: Object.keys(HOLD) },
  { id: 'feathers', icon: '🌈', label: 'Feathers', view: '0 0 400 400', opts: Object.keys(FEATHER_SETS) },
  { id: 'bg', icon: '🏰', label: 'Places', view: '0 0 400 400', opts: Object.keys(BG) },
];

export function randomOutfit() {
  const o = {};
  for (const c of CATS) o[c.id] = c.opts[Math.floor(Math.random() * c.opts.length)];
  return o;
}

export function turkeySVG(outfit = {}, { bg = true, earned = 8, view = '0 0 400 400', size } = {}) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}"${dims} class="turkey" role="img" aria-label="Turkey">
    ${bg ? BG[outfit.bg] || BG.dots : ''}
    <ellipse cx="200" cy="384" rx="92" ry="11" fill="#000" fill-opacity=".14"/>
    ${feathers(outfit.feathers, earned)}
    <path d="M178 344V374M178 374L162 385M178 374V388M178 374L194 385M222 344V374M222 374L206 385M222 374V388M222 374L238 385" fill="none" stroke="#E8962C" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="200" cy="275" rx="86" ry="80" fill="#8B5A2B" ${ol}/>
    <ellipse cx="200" cy="294" rx="54" ry="50" fill="#A9713A"/>
    <ellipse cx="121" cy="278" rx="24" ry="42" transform="rotate(14 121 278)" fill="#7A4A22" ${ol}/>
    <ellipse cx="279" cy="278" rx="24" ry="42" transform="rotate(-14 279 278)" fill="#7A4A22" ${ol}/>
    ${HOLD[outfit.hold] || ''}
    <circle cx="200" cy="170" r="46" fill="#9A6634" ${ol}/>
    <circle cx="167" cy="188" r="9" fill="#F28C8C" fill-opacity=".65"/><circle cx="233" cy="188" r="9" fill="#F28C8C" fill-opacity=".65"/>
    <circle cx="183" cy="162" r="13" fill="#fff" stroke="${O}" stroke-width="3"/><circle cx="217" cy="162" r="13" fill="#fff" stroke="${O}" stroke-width="3"/>
    <circle cx="185" cy="164" r="6.500" fill="#2B2B33"/><circle cx="215" cy="164" r="6.500" fill="#2B2B33"/>
    <circle cx="187" cy="161.500" r="2.200" fill="#fff"/><circle cx="217" cy="161.500" r="2.200" fill="#fff"/>
    <path d="M205 190C218 192 217 215 209 215C201 215 203 198 205 190Z" fill="#D33A3A" stroke="${O}" stroke-width="3"/>
    <path d="M187 180H213L200 201Z" fill="#F2B33D" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
    ${NECK[outfit.neck] || ''}
    ${GLASSES[outfit.glasses] || ''}
    ${HATS[outfit.hat] || ''}
  </svg>`;
}
