// Everything the app remembers lives in this one object, saved on the tablet only.
const KEY = 'turkey-time-v1';

function fresh() {
  return {
    kid: 'k1',
    sound: true,
    kids: {
      k1: {
        name: 'Princess', icon: '👑', color: '#D9488B', soft: '#FBD9E8', level: 'little',
        outfit: { hat: 'crown', glasses: 'none', neck: 'pearls', hold: 'wand', feathers: 'pink', bg: 'castle' },
        best: {}, matchSize: 4,
      },
      k2: {
        name: 'Superstar', icon: '⭐', color: '#2F74C9', soft: '#D6E6FA', level: 'big',
        outfit: { hat: 'star', glasses: 'shades', neck: 'medal', hold: 'mic', feathers: 'cool', bg: 'stage' },
        best: {}, matchSize: 12,
      },
    },
    leaves: [],
  };
}

function load() {
  const f = fresh();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && raw.kids) {
      const out = { ...f, ...raw, kids: {} };
      for (const id of Object.keys(f.kids)) {
        const r = raw.kids[id] || {};
        out.kids[id] = {
          ...f.kids[id], ...r,
          outfit: { ...f.kids[id].outfit, ...(r.outfit || {}) },
          best: { ...(r.best || {}) },
        };
      }
      if (!out.kids[out.kid]) out.kid = 'k1';
      if (!Array.isArray(out.leaves)) out.leaves = [];
      return out;
    }
  } catch (e) { /* storage blocked or corrupt: start fresh */ }
  return f;
}

export const state = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export const kid = () => state.kids[state.kid];

export function resetAll() {
  const f = fresh();
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, f);
  save();
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Thanksgiving is the fourth Thursday of November.
export function thanksgiving(year) {
  const first = new Date(year, 10, 1);
  const firstThu = 1 + ((4 - first.getDay() + 7) % 7);
  return new Date(year, 10, firstThu + 21);
}

export function today() {
  // ?date=2026-11-26 lets a grown-up preview another day.
  const m = /[?&]date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function daysUntil() {
  const t = today();
  let day = thanksgiving(t.getFullYear());
  if (day < t) day = thanksgiving(t.getFullYear() + 1);
  return Math.round((day - t) / 864e5);
}
