/* GymLog – Web-Version der iOS-App (SwiftUI → HTML/JS).
 * Alle Daten liegen lokal im Browser (localStorage). Das Backup-Format ist
 * identisch mit dem der iOS-App, d. h. Backups lassen sich hin und her importieren. */
'use strict';

/* =========================================================================
   Utils
   ========================================================================= */

const KEY_PREFIX = 'gymlog:';
const store = {
  get(key, def) {
    try {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      return raw == null ? def : JSON.parse(raw);
    } catch (e) { return def; }
  },
  set(key, value) {
    try { localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value)); }
    catch (e) { toast('Speichern fehlgeschlagen – Speicher voll?'); }
  },
  has(key) { try { return localStorage.getItem(KEY_PREFIX + key) != null; } catch (e) { return false; } },
  del(key) { try { localStorage.removeItem(KEY_PREFIX + key); } catch (e) {} },
  keys() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(KEY_PREFIX)) out.push(k.slice(KEY_PREFIX.length));
      }
    } catch (e) {}
    return out;
  }
};

const uuid = () => {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID().toUpperCase();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Swift kodiert Daten entweder als ISO-String (Backup) oder als Sekunden seit 2001.
const toDate = v => (typeof v === 'number' ? new Date((v + 978307200) * 1000) : new Date(v));
const iso = d => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
const now = () => new Date();

const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => { a = new Date(a); b = new Date(b); return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
const mondayOffset = d => (new Date(d).getDay() + 6) % 7;

const dfDate = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
const dfTime = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dfFull = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const dfMonth = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const dfDayMonth = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' });
const fDate = d => dfDate.format(toDate(d));
const fTime = d => dfTime.format(toDate(d));
const fDateTime = d => `${fDate(d)}, ${fTime(d)}`;
const fFull = d => `${dfFull.format(toDate(d))} um ${fTime(d)}`;
const NARROW_WEEKDAYS = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];

const pad2 = n => String(n).padStart(2, '0');
const fmtW = v => (Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toFixed(1));
const timeString = s => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(r)}` : `${pad2(m)}:${pad2(r)}`;
};
const fmtDistance = v => (Number.isInteger(v) ? String(v) : v.toFixed(2));
const fmtRunDuration = t => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
};
const fmtPace = spk => {
  if (!isFinite(spk) || spk <= 0) return '–';
  const t = Math.floor(spk);
  return `${Math.floor(t / 60)}:${pad2(t % 60)}`;
};
const fmtMinSec = t => `${Math.floor(t / 60)}:${pad2(t % 60)} min`;
const parseNum = s => parseFloat(String(s ?? '').replace(',', '.'));
const parseIntSafe = s => { const n = parseInt(String(s ?? '').trim(), 10); return isNaN(n) ? 0 : n; };
const oneRM = (w, r) => (r > 0 ? w * (1 + r / 30) : 0);
const setsText = sets => sets.map(s => `${fmtW(s.weight)} kg × ${s.reps}`).join('   •   ');
const TIMED = new Set(['Planks', 'Dead Hang']);
const setLabel = (name, s) => (TIMED.has(name) ? fmtMinSec(s.reps) : `${fmtW(s.weight)} kg × ${s.reps}`);
const sortStr = arr => [...arr].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

function toast(msg) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* =========================================================================
   Icons (SVG-Ersatz für SF Symbols)
   ========================================================================= */

const ICONS = {
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  chart: '<path d="M5.5 20v-7M12 20V5M18.5 20v-10" stroke-width="3.2"/>',
  more: '<circle cx="12" cy="12" r="9.5"/><circle cx="7.6" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="16.4" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevR: '<path d="m9 5 7 7-7 7"/>',
  chevL: '<path d="m15 4.5-7.5 7.5 7.5 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plusCircle: '<circle cx="12" cy="12" r="9.5"/><path d="M12 8v8M8 12h8"/>',
  check: '<path d="M5 12.5 10 17.5 19 7"/>',
  checkCircle: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m7.5 12.3 3 3 6-6.3" stroke="#0a0a0d" stroke-width="2.4"/>',
  circle: '<circle cx="12" cy="12" r="9.5"/>',
  trash: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6 6.5l1 14h10l1-14M10 10.5v6M14 10.5v6"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M18 6.5l1.5-1.5"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/>',
  trophy: '<path d="M8 3.5h8V9a4 4 0 0 1-8 0zM8 5.5H4.5c0 2.5 1.5 4 3.7 4.3M16 5.5h3.5c0 2.5-1.5 4-3.7 4.3M12 13v3.5M8.5 20.5h7M9.5 16.5h5v4h-5z"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="M7.5 21l3.2-6.2 3.3 2.7V22M5.5 12l3-3.5 4.5 1.2 2.3 3.3 3.2.5M10.7 14.8l2.3-5.1"/>',
  bolt: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z" fill="currentColor"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l2 2M10 9.5l2 2M13 6.5l2 2"/>',
  hash: '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4.5 9h16M3.5 15h16"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17.5" rx="2"/><path d="M9 2.5h6v3H9zM8.5 10h7M8.5 14h7M8.5 18h4"/>',
  checklist: '<path d="m3.5 6 1.5 1.5 3-3M3.5 12.5 5 14l3-3M3.5 19 5 20.5l3-3M11 6h9.5M11 12.5h9.5M11 19h9.5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  backup: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.6a4 4 0 0 1-.5 9.9z"/><path d="M12 11v6M9.5 13.5 12 11l2.5 2.5"/>',
  upload: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 13v6.5h14V13"/>',
  download: '<path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5M5 13v6.5h14V13"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  resume: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M16.5 12a4.5 4.5 0 1 1-1.3-3.2M16.5 7v3h-3" stroke="#0a0a0d" stroke-width="2"/>',
  stack: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  chartUp: '<path d="M3.5 20.5h17M5 16l5-5 3.5 3.5L20 8M15.5 8H20v4.5"/>',
  share: '<path d="M12 3.5v11M8 7.5l4-4 4 4M7 10.5H5.5v10h13v-10H17"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  runCircle: '<circle cx="12" cy="12" r="10"/><circle cx="13.6" cy="6.8" r="1.4"/><path d="M8.5 18l2.2-4.3 2.3 1.9V19M7.3 11.5l2.1-2.4 3.1.8 1.6 2.3 2.2.4M10.7 13.7l1.6-3.6"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.5"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v14c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v14"/>'
};
const ic = (name, extra = '') =>
  `<svg class="i ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* =========================================================================
   Theme (Akzentfarbe)
   ========================================================================= */

const ACCENTS = {
  red: { name: 'Rot', rgb: [255, 69, 59] },
  blue: { name: 'Blau', rgb: [51, 122, 255] },
  green: { name: 'Grün', rgb: [51, 217, 115] },
  orange: { name: 'Orange', rgb: [255, 148, 0] },
  purple: { name: 'Lila', rgb: [176, 82, 222] },
  teal: { name: 'Türkis', rgb: [48, 176, 199] },
  pink: { name: 'Pink', rgb: [255, 46, 145] },
  yellow: { name: 'Gelb', rgb: [255, 204, 0] }
};
function currentAccent() { const a = store.get('selectedAccentColor', 'red'); return ACCENTS[a] ? a : 'red'; }
function applyTheme() {
  const a = ACCENTS[currentAccent()];
  const root = document.documentElement.style;
  root.setProperty('--accent', `rgb(${a.rgb.join(',')})`);
  root.setProperty('--accent-rgb', a.rgb.join(', '));
}

/* =========================================================================
   Übungen & Stores (1:1 aus den Swift-Dateien)
   ========================================================================= */

const MUSCLES = ['Brust', 'Schulter', 'Trizeps', 'Bizeps', 'Rücken', 'Beine', 'Unterarme', 'Abs'];

const BUILTIN = [
  ['Incline Chest Press', 'Brust', 'eq_barbell'], ['Kurzhantel Chest Press', 'Brust', 'eq_dumbbell'],
  ['Pec Fly', 'Brust', 'eq_machine'], ['Flachbankdrücken Langhantel', 'Brust', 'eq_barbell_bench'],
  ['Schrägbankdrücken Langhantel', 'Brust', 'eq_barbell_bench'], ['Negativbankdrücken', 'Brust', 'eq_barbell_bench'],
  ['Kurzhantel Fliegende', 'Brust', 'eq_dumbbell'], ['Schräge Kurzhantel Fliegende', 'Brust', 'eq_dumbbell'],
  ['Butterfly Maschine', 'Brust', 'eq_machine'], ['Cable Crossover', 'Brust', 'eq_cable'],
  ['Liegestütze', 'Brust', 'eq_bodyweight'], ['Dips (Brust)', 'Brust', 'eq_bodyweight'],

  ['Schulterpresse', 'Schulter', 'eq_barbell'], ['Einarmiges Seitheben', 'Schulter', 'eq_dumbbell'],
  ['Langhantel Überkopfdrücken', 'Schulter', 'eq_barbell'], ['Kurzhantel Überkopfdrücken', 'Schulter', 'eq_dumbbell'],
  ['Arnold Press', 'Schulter', 'eq_barbell'], ['Seitheben Kurzhantel', 'Schulter', 'eq_dumbbell'],
  ['Seitheben Kabelzug', 'Schulter', 'eq_cable'], ['Seitheben Maschine', 'Schulter', 'eq_machine'],
  ['Frontheben Kurzhantel', 'Schulter', 'eq_dumbbell'], ['Reverse Butterfly', 'Schulter', 'eq_machine'],
  ['Face Pulls', 'Schulter', 'eq_cable'], ['Aufrechtes Rudern', 'Schulter', 'eq_barbell'],

  ['Pushdowns', 'Trizeps', 'eq_cable'], ['Overhead Push', 'Trizeps', 'eq_cable'],
  ['Enges Bankdrücken', 'Trizeps', 'eq_barbell_bench'], ['French Press Langhantel', 'Trizeps', 'eq_barbell'],
  ['French Press Kurzhantel', 'Trizeps', 'eq_dumbbell'], ['Kickbacks', 'Trizeps', 'eq_dumbbell'],
  ['Dips (Trizeps)', 'Trizeps', 'eq_bodyweight'], ['Seil-Pushdowns', 'Trizeps', 'eq_cable'],
  ['Enge Liegestütze', 'Trizeps', 'eq_bodyweight'], ['Bankdips', 'Trizeps', 'eq_barbell_bench'],

  ['Preacher Curl', 'Bizeps', 'eq_barbell'], ['Kurzhantel Finisher', 'Bizeps', 'eq_dumbbell'],
  ['Langhantel Curls', 'Bizeps', 'eq_barbell'], ['Kurzhantel Curls', 'Bizeps', 'eq_dumbbell'],
  ['Hammer Curls', 'Bizeps', 'eq_barbell'], ['Konzentrationscurls', 'Bizeps', 'eq_barbell'],
  ['Kabelcurls', 'Bizeps', 'eq_cable'], ['Bizeps-Curl Maschine', 'Bizeps', 'eq_machine'],
  ['Schräghantelbank Curls', 'Bizeps', 'eq_barbell'], ['21er Curls', 'Bizeps', 'eq_barbell'],

  ['Enger Latzug', 'Rücken', 'eq_cable'], ['Breiter Latzug', 'Rücken', 'eq_cable'],
  ['Enges Rudern', 'Rücken', 'eq_barbell'], ['unterer Rückenstrecker', 'Rücken', 'eq_machine'],
  ['T-Bar', 'Rücken', 'eq_machine'], ['Langhantelrudern vorgebeugt', 'Rücken', 'eq_barbell'],
  ['Kurzhantelrudern einarmig', 'Rücken', 'eq_dumbbell'], ['Sitzendes Kabelrudern', 'Rücken', 'eq_cable'],
  ['Chest Supported Rudern', 'Rücken', 'eq_machine'], ['Shrugs', 'Rücken', 'eq_barbell'],
  ['Kreuzheben', 'Rücken', 'eq_barbell'], ['Klimmzüge Untergriff', 'Rücken', 'eq_pullupbar'],

  ['Beinpresse', 'Beine', 'eq_machine'], ['Beinstrecker', 'Beine', 'eq_machine'],
  ['Beinbeuger', 'Beine', 'eq_machine'], ['Adduktoren', 'Beine', 'eq_machine'],
  ['Kniebeugen Langhantel', 'Beine', 'eq_barbell'], ['Kniebeugen Kurzhantel', 'Beine', 'eq_dumbbell'],
  ['Frontkniebeugen', 'Beine', 'eq_barbell'], ['Ausfallschritte', 'Beine', 'eq_dumbbell'],
  ['Bulgarian Split Squat', 'Beine', 'eq_dumbbell'], ['Rumänisches Kreuzheben', 'Beine', 'eq_barbell'],
  ['Hüftstoßen', 'Beine', 'eq_barbell'], ['Abduktoren', 'Beine', 'eq_machine'],
  ['Wadenheben stehend', 'Beine', 'eq_machine'], ['Wadenheben sitzend', 'Beine', 'eq_machine'],
  ['Hack Squat Maschine', 'Beine', 'eq_machine'], ['Good Mornings', 'Beine', 'eq_barbell'],

  ['Wrist Extensions', 'Unterarme', 'eq_barbell'], ['Wrist Curl', 'Unterarme', 'eq_barbell'],
  ["Farmer's Walk", 'Unterarme', 'eq_dumbbell'], ['Unterarmroller', 'Unterarme', 'eq_barbell'],
  ['Reverse Curls', 'Unterarme', 'eq_barbell'],

  ['Leg Raise', 'Abs', 'eq_bodyweight'], ['Cable Crunches', 'Abs', 'eq_cable'],
  ['Crunches', 'Abs', 'eq_bodyweight'], ['Sit-Ups', 'Abs', 'eq_bodyweight'],
  ['Russian Twists', 'Abs', 'eq_bodyweight'], ['Hängendes Beinheben', 'Abs', 'eq_pullupbar'],
  ['Ab Wheel Rollout', 'Abs', 'eq_bodyweight'], ['Seitliche Planks', 'Abs', 'eq_bodyweight'],
  ['Mountain Climbers', 'Abs', 'eq_bodyweight'],

  // Spezial-Übungen (eigene Erfassung)
  ['Klimmzüge', 'Rücken', 'eq_pullupbar'], ['Bench Press', 'Brust', 'eq_barbell_bench'],
  ['Planks', 'Abs', 'eq_bodyweight'], ['Dead Hang', 'Unterarme', 'eq_pullupbar']
].map(([name, muscle, imageName]) => ({ name, muscle, imageName, isCustom: false }));

// Übungen mit eigener Erfassung (Bench Press läuft hier über die normale,
// voll funktionsfähige Gewicht/Wdh.-Eingabe – in der iOS-App fehlte dort noch das Speichern).
const SPECIAL = new Set(['Klimmzüge', 'Planks', 'Dead Hang']);
const ADDABLE_SPECIAL = ['Klimmzüge', 'Bench Press', 'Planks', 'Dead Hang'];

const LEGACY_ACTIVE = [
  'Incline Chest Press', 'Kurzhantel Chest Press', 'Pec Fly', 'Schulterpresse', 'Einarmiges Seitheben',
  'Pushdowns', 'Overhead Push', 'Preacher Curl', 'Kurzhantel Finisher', 'Enger Latzug', 'Breiter Latzug',
  'Enges Rudern', 'unterer Rückenstrecker', 'T-Bar', 'Beinpresse', 'Beinstrecker', 'Beinbeuger', 'Adduktoren',
  'Wrist Extensions', 'Wrist Curl', 'Leg Raise', 'Cable Crunches', 'Klimmzüge', 'Bench Press', 'Planks', 'Dead Hang'
];

const PREBUILT_PLANS = [
  ['Push Day', ['Flachbankdrücken Langhantel', 'Schrägbankdrücken Langhantel', 'Langhantel Überkopfdrücken', 'Seitheben Kurzhantel', 'Pushdowns', 'French Press Kurzhantel']],
  ['Pull Day', ['Langhantelrudern vorgebeugt', 'Breiter Latzug', 'Sitzendes Kabelrudern', 'Face Pulls', 'Langhantel Curls', 'Hammer Curls']],
  ['Leg Day', ['Kniebeugen Langhantel', 'Rumänisches Kreuzheben', 'Beinpresse', 'Beinstrecker', 'Beinbeuger', 'Wadenheben stehend']],
  ['Upper Body', ['Flachbankdrücken Langhantel', 'Breiter Latzug', 'Langhantel Überkopfdrücken', 'Langhantelrudern vorgebeugt', 'Langhantel Curls', 'Pushdowns']],
  ['Lower Body', ['Kniebeugen Langhantel', 'Rumänisches Kreuzheben', 'Beinpresse', 'Beinbeuger', 'Wadenheben stehend', 'Leg Raise']],
  ['Ganzkörper', ['Kniebeugen Langhantel', 'Flachbankdrücken Langhantel', 'Breiter Latzug', 'Schulterpresse', 'Hammer Curls', 'Pushdowns']]
];

const Pool = {
  custom() { return store.get('customExercises', []).map(e => ({ ...e, isCustom: true })); },
  saveCustom(list) { store.set('customExercises', list); },
  all() { return BUILTIN.concat(Pool.custom()); },
  find(name) { return Pool.all().find(e => e.name === name); },
  active() { const a = Active.names(); return Pool.all().filter(e => a.has(e.name)); },
  addCustom(name, muscle) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    if (Pool.all().some(e => e.name.toLowerCase() === trimmed.toLowerCase())) return null;
    const ex = { id: uuid(), name: trimmed, muscle, imageName: '', fallbackIcon: 'dumbbell.fill', isCustom: true };
    const list = store.get('customExercises', []);
    list.push(ex);
    Pool.saveCustom(list);
    Active.set(ex.name, true);
    return ex;
  }
};

const Active = {
  seed() {
    if (store.get('activeExerciseNamesSeeded', false)) return;
    const custom = Pool.custom().map(e => e.name);
    store.set('activeExerciseNames', [...new Set(LEGACY_ACTIVE.concat(custom))]);
    store.set('activeExerciseNamesSeeded', true);
  },
  names() { Active.seed(); return new Set(store.get('activeExerciseNames', [])); },
  save(set) { store.set('activeExerciseNames', [...set]); },
  set(name, on) { const s = Active.names(); on ? s.add(name) : s.delete(name); Active.save(s); }
};

const Plans = {
  load() { return store.get('trainingPlans', []); },
  save(p) { store.set('trainingPlans', p); },
  add(plan) { const p = Plans.load(); p.push(plan); Plans.save(p); },
  update(plan) { const p = Plans.load(); const i = p.findIndex(x => x.id === plan.id); if (i >= 0) p[i] = plan; Plans.save(p); },
  remove(plan) { Plans.save(Plans.load().filter(x => x.id !== plan.id)); },
  seed() {
    if (store.get('prebuiltPlansSeeded', false)) return;
    const existing = Plans.load();
    for (const [name, exerciseNames] of PREBUILT_PLANS) {
      if (!existing.some(p => p.name === name)) existing.push({ id: uuid(), name, exerciseNames });
    }
    Plans.save(existing);
    const active = Active.names();
    PREBUILT_PLANS.forEach(([, names]) => names.forEach(n => active.add(n)));
    Active.save(active);
    store.set('prebuiltPlansSeeded', true);
  }
};

const Data = {
  sessions() { return store.get('sessionHistory', []); },
  saveSessions(v) { store.set('sessionHistory', v); },
  details() { return store.get('sessionDetailHistory', []); },
  saveDetails(v) { store.set('sessionDetailHistory', v); },
  history(name) { return store.get('history_' + name, []); },
  saveHistory(name, v) { store.set('history_' + name, v); },
  deadHang() { return store.get('deadHangHistory', []); },
  saveDeadHang(v) { store.set('deadHangHistory', v); },
  planks() { return store.get('plankHistory', []); },
  savePlanks(v) { store.set('plankHistory', v); },
  runs() { return store.get('runHistory', []); },
  saveRuns(v) { store.set('runHistory', v); },

  /** Findet die Session (Details), in deren Zeitfenster ein Übungs-Durchgang fällt. */
  findDetailIndex(details, exerciseName, date) {
    const t = toDate(date).getTime();
    return details.findIndex(d => {
      const start = toDate(d.date).getTime();
      const end = start + (d.duration + 5) * 1000;
      return t >= start - 1000 && t <= end && d.exercises.some(e => e.exerciseName === exerciseName);
    });
  },

  deleteExerciseWorkout(exerciseName, workout) {
    Data.saveHistory(exerciseName, Data.history(exerciseName).filter(w => w.id !== workout.id));
    Data.removeExerciseFromSessions(exerciseName, workout.date);
  },

  removeExerciseFromSessions(exerciseName, date) {
    const sessions = Data.sessions();
    const details = Data.details();
    const idx = Data.findDetailIndex(details, exerciseName, date);
    if (idx < 0) return false;
    const detail = details[idx];
    const removed = (detail.exercises.find(e => e.exerciseName === exerciseName) || {}).setCount || 0;
    detail.exercises = detail.exercises.filter(e => e.exerciseName !== exerciseName);
    let newSessions = sessions;
    if (detail.exercises.length === 0) {
      details.splice(idx, 1);
      newSessions = sessions.filter(s => s.id !== detail.id);
    } else {
      const s = sessions.find(x => x.id === detail.id);
      if (s) s.sets.splice(Math.max(0, s.sets.length - Math.min(removed, s.sets.length)));
    }
    Data.saveSessions(newSessions);
    Data.saveDetails(details);
    return true;
  },

  updateExerciseWorkout(exerciseName, workoutID, newSets) {
    const history = Data.history(exerciseName);
    const hi = history.findIndex(w => w.id === workoutID);
    if (hi < 0) return;
    const oldCount = history[hi].sets.length;
    const workoutDate = history[hi].date;
    history[hi].sets = newSets;
    Data.saveHistory(exerciseName, history);

    const sessions = Data.sessions();
    const details = Data.details();
    const di = Data.findDetailIndex(details, exerciseName, workoutDate);
    if (di < 0) return;
    const ex = details[di].exercises.find(e => e.exerciseName === exerciseName);
    if (!ex) return;
    ex.sets = newSets.map(s => ({ id: uuid(), weight: s.weight, reps: s.reps }));
    ex.setCount = ex.sets.length;
    const s = sessions.find(x => x.id === details[di].id);
    if (s) {
      const delta = newSets.length - oldCount;
      if (delta > 0) for (let i = 0; i < delta; i++) s.sets.push({ id: uuid(), weight: 0, reps: 0 });
      else if (delta < 0) s.sets.splice(Math.max(0, s.sets.length - Math.min(-delta, s.sets.length)));
    }
    Data.saveSessions(sessions);
    Data.saveDetails(details);
  },

  deleteSession(session) {
    const details = Data.details();
    const deleted = details.find(d => d.id === session.id);
    Data.saveSessions(Data.sessions().filter(s => s.id !== session.id));
    Data.saveDetails(details.filter(d => d.id !== session.id));
    if (deleted) {
      const start = toDate(session.date).getTime() - 1000;
      const end = toDate(session.date).getTime() + (deleted.duration + 5) * 1000;
      const inWindow = w => { const t = toDate(w.date).getTime(); return t >= start && t <= end; };
      for (const ex of deleted.exercises) {
        const h = Data.history(ex.exerciseName);
        const filtered = h.filter(w => !inWindow(w));
        if (filtered.length !== h.length) Data.saveHistory(ex.exerciseName, filtered);
        if (ex.exerciseName === 'Dead Hang') Data.saveDeadHang(Data.deadHang().filter(w => !inWindow(w)));
        if (ex.exerciseName === 'Planks') Data.savePlanks(Data.planks().filter(w => !inWindow(w)));
      }
    }
  }
};

/* =========================================================================
   Backup (kompatibel mit GymLogBackup der iOS-App)
   ========================================================================= */

const Backup = {
  current() {
    const exerciseHistories = {};
    for (const ex of Pool.all()) {
      if (store.has('history_' + ex.name)) exerciseHistories[ex.name] = Data.history(ex.name);
    }
    const norm = v => JSON.parse(JSON.stringify(v), (k, val) => (k === 'date' || k === 'exportedAt') ? iso(toDate(val)) : val);
    return norm({
      exportedAt: iso(now()),
      sessionHistory: Data.sessions(),
      sessionDetailHistory: Data.details(),
      runHistory: Data.runs(),
      exerciseHistories,
      deadHangHistory: Data.deadHang(),
      plankHistory: Data.planks(),
      customExercises: store.get('customExercises', []),
      trainingPlans: Plans.load(),
      // Nur Web-App (die iOS-App ignoriert diese Felder beim Import):
      mealLog: store.get('mealLog', []),
      mealFoods: store.get('mealFoods', []),
      mealPrices: store.get('mealPrices', {}),
      mealGoal: store.get('mealGoal', null)
    });
  },
  apply(b) {
    if (!b || !Array.isArray(b.sessionHistory) || !Array.isArray(b.sessionDetailHistory)) throw new Error('Keine gültige GymLog-Backup-Datei.');
    Data.saveSessions(b.sessionHistory);
    Data.saveDetails(b.sessionDetailHistory);
    Data.saveRuns(b.runHistory || []);
    for (const [name, hist] of Object.entries(b.exerciseHistories || {})) Data.saveHistory(name, hist);
    Data.saveDeadHang(b.deadHangHistory || []);
    Data.savePlanks(b.plankHistory || []);
    Pool.saveCustom(b.customExercises || []);
    Plans.save(b.trainingPlans || []);
    if (Array.isArray(b.mealLog)) store.set('mealLog', b.mealLog);
    if (Array.isArray(b.mealFoods)) store.set('mealFoods', b.mealFoods);
    if (b.mealPrices) store.set('mealPrices', b.mealPrices);
    if (b.mealGoal) store.set('mealGoal', b.mealGoal);
    const active = Active.names();
    (b.customExercises || []).forEach(e => active.add(e.name));
    (b.trainingPlans || []).forEach(p => p.exerciseNames.forEach(n => active.add(n)));
    Active.save(active);
  }
};

/* =========================================================================
   Mini-Framework: Hosts (Event-Handler), Navigation-Stacks, Sheets, Alerts
   ========================================================================= */

const HOSTS = {};
let hostSeq = 0;
class Host {
  constructor(id) { this.id = id; this.h = {}; this.n = 0; HOSTS[id] = this; }
  reset() { this.h = {}; this.n = 0; }
  on(fn) { const k = `${this.id}:${this.n++}`; this.h[k] = fn; return k; }
  destroy() { delete HOSTS[this.id]; }
}
const dispatch = attr => e => {
  const el = e.target.closest(`[${attr}]`);
  if (!el) return;
  const key = el.getAttribute(attr);
  const host = HOSTS[key.split(':')[0]];
  const fn = host && host.h[key];
  if (fn) fn(el, e);
};
document.addEventListener('click', dispatch('data-on'));
document.addEventListener('input', dispatch('data-in'));
document.addEventListener('change', dispatch('data-change'));

const TABS = [
  { id: 'home', label: 'Home', icon: 'home', root: 'home' },
  { id: 'calendar', label: 'Kalender', icon: 'calendar', root: 'calendar' },
  { id: 'meal', label: 'Essen', icon: 'meal', root: 'meal' },
  { id: 'progress', label: 'Progress', icon: 'chart', root: 'progressHub' },
  { id: 'more', label: 'Mehr', icon: 'more', root: 'more' }
];
const stacks = {};
TABS.forEach(t => { stacks[t.id] = [{ name: t.root, params: {}, state: {} }]; });
let currentTab = 'home';
const screenEl = () => document.getElementById('screen');
const screenHost = new Host('scr');
const stack = () => stacks[currentTab];
const topEntry = () => stack()[stack().length - 1];

function push(name, params = {}) {
  topEntry().scroll = screenEl().scrollTop;
  stack().push({ name, params, state: {} });
  renderScreen('push');
}
function pop() {
  if (stack().length <= 1) return;
  const e = stack().pop();
  if (e.onPop) e.onPop();
  renderScreen('pop');
}
function popToRoot() {
  while (stack().length > 1) { const e = stack().pop(); if (e.onPop) e.onPop(); }
  renderScreen('pop');
}
function switchTab(id) {
  if (id === currentTab) { if (stack().length > 1) popToRoot(); else screenEl().scrollTo({ top: 0, behavior: 'smooth' }); return; }
  topEntry().scroll = screenEl().scrollTop;
  currentTab = id;
  renderTabbar();
  renderScreen('tab');
}
function renderTabbar() {
  const host = HOSTS.tab || new Host('tab');
  host.reset();
  document.getElementById('tabbar').innerHTML = TABS.map(t =>
    `<button class="${t.id === currentTab ? 'on' : ''}" data-on="${host.on(() => switchTab(t.id))}">${ic(t.icon)}<span>${t.label}</span></button>`
  ).join('');
}

function navbarHTML(v, host, { canBack, backLabel, sheet }) {
  const left = v.left != null ? v.left
    : (canBack ? `<button class="nb-btn" data-on="${host.on(() => (v.onBack ? v.onBack() : pop()))}">${ic('chevL')}<span>${esc(backLabel || 'Zurück')}</span></button>` : '');
  return `<div class="navbar ${sheet ? '' : 'main'}">
    <div class="nb-left">${left}</div>
    <div class="nb-title" ${v.large ? 'data-large-title style="opacity:0"' : ''}>${esc(v.title || '')}</div>
    <div class="nb-right">${v.right || ''}</div>
  </div>`;
}

function renderScreen(mode) {
  const entry = topEntry();
  const el = screenEl();
  const keepScroll = mode === 'refresh' ? el.scrollTop : null;
  screenHost.reset();
  const v = SCREENS[entry.name](entry, screenHost);
  entry.title = v.title;
  const prev = stack()[stack().length - 2];
  const backLabel = prev && prev.title && prev.title.length <= 14 ? prev.title : 'Zurück';
  el.innerHTML = `<div class="${mode === 'push' ? 'push-in' : mode === 'pop' ? 'pop-in' : ''}">
      ${navbarHTML(v, screenHost, { canBack: stack().length > 1, backLabel })}
      ${v.large ? `<div class="large-title">${esc(v.title)}</div>` : ''}
      <div class="content ${v.tight ? 'tight' : ''}">${v.body}</div>
    </div>`;
  if (keepScroll != null) el.scrollTop = keepScroll;
  else if (mode === 'pop' || mode === 'tab') el.scrollTop = entry.scroll || 0;
  else el.scrollTop = 0;
  onScreenScroll();
  if (v.after) v.after(el);
}
const refresh = () => renderScreen('refresh');

function onScreenScroll() {
  const el = screenEl();
  const nb = el.querySelector('.navbar');
  if (!nb) return;
  nb.classList.toggle('scrolled', el.scrollTop > 4);
  const lt = nb.querySelector('[data-large-title]');
  if (lt) lt.style.opacity = el.scrollTop > 40 ? '1' : '0';
}

// ---------- Sheets ----------
const sheets = [];
function openSheet(viewFn, opts = {}) {
  const id = 'sh' + (++hostSeq);
  const host = new Host(id);
  const wrap = document.createElement('div');
  wrap.className = 'ov';
  wrap.innerHTML = `<div class="backdrop"></div><div class="sheet ${opts.grouped ? 'grouped' : ''}"><div class="grabber"></div><div class="sheet-inner"></div></div>`;
  document.getElementById('overlays').appendChild(wrap);
  const sheet = {
    host, el: wrap, state: opts.state || {},
    render() {
      const sb = wrap.querySelector('.sheet-body');
      const scroll = sb ? sb.scrollTop : 0;
      host.reset();
      const v = viewFn(sheet, host);
      wrap.querySelector('.sheet-inner').outerHTML = `<div class="sheet-inner" style="display:flex;flex-direction:column;flex:1;min-height:0">
        ${navbarHTML(v, host, { canBack: false, sheet: true })}
        <div class="sheet-body"><div class="content ${v.tight ? 'tight' : ''}">${v.body}</div></div></div>`;
      wrap.querySelector('.sheet-body').scrollTop = scroll;
      if (v.after) v.after(wrap);
    },
    close() {
      wrap.classList.remove('show');
      const i = sheets.indexOf(sheet);
      if (i >= 0) sheets.splice(i, 1);
      setTimeout(() => { wrap.remove(); host.destroy(); }, 320);
      if (opts.onClose) opts.onClose();
    }
  };
  if (!opts.modal) wrap.querySelector('.backdrop').addEventListener('click', () => sheet.close());
  sheets.push(sheet);
  sheet.render();
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('show')));
  return sheet;
}

// ---------- Alerts / Confirmation dialogs ----------
function alertDialog({ title, message, buttons }) {
  const id = 'al' + (++hostSeq);
  const host = new Host(id);
  const wrap = document.createElement('div');
  wrap.className = 'ov';
  const close = () => { wrap.classList.remove('show'); setTimeout(() => { wrap.remove(); host.destroy(); }, 220); };
  wrap.innerHTML = `<div class="backdrop"></div><div class="alert-box">
      <div class="at">${esc(title)}</div>${message ? `<div class="am">${esc(message)}</div>` : '<div class="am"></div>'}
      <div class="ab">${buttons.map(b => `<button class="${b.role || ''}" data-on="${host.on(() => { close(); b.action && b.action(); })}">${esc(b.label)}</button>`).join('')}</div>
    </div>`;
  document.getElementById('overlays').appendChild(wrap);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('show')));
}
function confirmTwice({ title1, msg1, title2, msg2, confirmLabel = 'Endgültig löschen', onConfirm, onCancel }) {
  alertDialog({
    title: title1, message: msg1,
    buttons: [
      { label: 'Abbrechen', role: 'cancel', action: onCancel },
      { label: 'Weiter', role: 'destructive', action: () => alertDialog({
        title: title2, message: msg2,
        buttons: [{ label: 'Abbrechen', role: 'cancel', action: onCancel }, { label: confirmLabel, role: 'destructive', action: onConfirm }]
      }) }
    ]
  });
}
function actionSheet({ title, actions }) {
  const id = 'as' + (++hostSeq);
  const host = new Host(id);
  const wrap = document.createElement('div');
  wrap.className = 'ov';
  const close = () => { wrap.classList.remove('show'); setTimeout(() => { wrap.remove(); host.destroy(); }, 300); };
  wrap.innerHTML = `<div class="backdrop" data-on="${host.on(close)}"></div><div class="action-sheet">
      <div class="grp">${title ? `<div class="ttl">${esc(title)}</div>` : ''}${actions.map(a => `<button class="${a.role || ''}" data-on="${host.on(() => { close(); a.action(); })}">${esc(a.label)}</button>`).join('')}</div>
      <div class="grp"><button data-on="${host.on(close)}">Abbrechen</button></div>
    </div>`;
  document.getElementById('overlays').appendChild(wrap);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('show')));
}

// ---------- Globaler Sekundentakt (Session-Timer, Planks-Stoppuhr) ----------
const tickers = new Set();
setInterval(() => tickers.forEach(fn => { try { fn(); } catch (e) {} }), 1000);

/* =========================================================================
   Gemeinsame UI-Bausteine
   ========================================================================= */

function exImage(ex, size) {
  const inner = ex && ex.imageName
    ? `<div class="m" style="-webkit-mask-image:url(img/${ex.imageName}.png);mask-image:url(img/${ex.imageName}.png)"></div>`
    : ic('dumbbell');
  return `<div class="eximg" style="width:${size}px;height:${size}px">${inner}</div>`;
}
function miniBars(values, height) {
  const max = Math.max(0, ...values);
  return `<div class="bars" style="height:${height}px">${values.map(v =>
    `<div class="b ${v <= 0 ? 'zero' : ''}" style="height:${max > 0 ? Math.max(4, (v / max) * 100) : 0}%"></div>`).join('')}</div>`;
}
function emptyState(icon, title, text) {
  return `<div class="card empty">${ic(icon)}<div class="headline">${esc(title)}</div><div class="sub muted">${esc(text)}</div></div>`;
}
function menuRow(icon, title, subtitle, onKey) {
  return `<div class="card row tap" data-on="${onKey}">
    <span class="accent" style="font-size:24px;display:flex">${ic(icon)}</span>
    <div class="col g4" style="flex:1"><div class="headline">${esc(title)}</div><div class="sub muted">${esc(subtitle)}</div></div>
    <span class="muted">${ic('chevR')}</span></div>`;
}

/* =========================================================================
   Aktive Session (SessionView)
   ========================================================================= */

let ACTIVE = null; // aktuell geöffnete Session (State-Objekt)

function newSessionState() {
  return {
    startDate: now(), elapsed: 0, started: false, trainingStarted: false,
    selectedMuscles: new Set(), selectedExerciseNames: new Set(),
    completedMuscles: new Set(), completedExercises: new Set(), completedStandalone: new Set(),
    completedSetCount: 0, sessionExercises: [], didApply: false
  };
}
const ActiveSessionStore = {
  save(S) {
    if (!S.trainingStarted) return;
    store.set('activeSessionSnapshot', {
      startDate: iso(S.startDate),
      selectedMuscles: [...S.selectedMuscles],
      selectedExerciseNames: [...S.selectedExerciseNames],
      completedMuscles: [...S.completedMuscles],
      completedExerciseNames: [...S.completedExercises],
      completedStandaloneExercises: [...S.completedStandalone],
      completedSetCount: S.completedSetCount,
      sessionExercises: S.sessionExercises
    });
  },
  load() { return store.get('activeSessionSnapshot', null); },
  clear() { store.del('activeSessionSnapshot'); },
  has() { return store.has('activeSessionSnapshot'); }
};

const sessionTick = () => {
  const S = ACTIVE;
  if (!S || !S.started) return;
  S.elapsed = Math.max(0, Math.floor((Date.now() - S.startDate.getTime()) / 1000));
  document.querySelectorAll('[data-session-timer]').forEach(el => { el.textContent = timeString(S.elapsed); });
  ActiveSessionStore.save(S);
};
tickers.add(sessionTick);

function startSession(S, resetStart = true) {
  if (S.started) return;
  S.started = true;
  if (resetStart) S.startDate = now();
  S.elapsed = Math.floor((Date.now() - S.startDate.getTime()) / 1000);
  ActiveSessionStore.save(S);
}

const Session = {
  addExercise(S, name, muscle, sets) {
    const ss = sets.map(s => ({ id: uuid(), weight: s.weight, reps: s.reps }));
    const existing = S.sessionExercises.find(e => e.exerciseName === name);
    if (existing) { existing.setCount += sets.length; existing.sets.push(...ss); }
    else S.sessionExercises.push({ id: uuid(), muscle, exerciseName: name, setCount: sets.length, sets: ss });
  },
  normalSaved(S, ex, sets) {
    S.completedExercises.add(ex.name);
    if (S.selectedMuscles.has(ex.muscle)) S.completedMuscles.add(ex.muscle);
    S.completedSetCount += sets.length;
    Session.addExercise(S, ex.name, ex.muscle, sets);
    ActiveSessionStore.save(S);
  },
  standaloneSaved(S, name, muscle, sets) {
    S.completedSetCount += sets.length;
    S.completedStandalone.add(name);
    Session.addExercise(S, name, muscle, sets);
    S.completedMuscles.add(muscle);
    ActiveSessionStore.save(S);
  },
  removeStandalone(S, name) {
    const i = S.sessionExercises.findIndex(e => e.exerciseName === name);
    if (i >= 0) {
      S.completedSetCount = Math.max(0, S.completedSetCount - S.sessionExercises[i].setCount);
      S.sessionExercises.splice(i, 1);
    }
    S.selectedExerciseNames.delete(name);
    S.completedStandalone.delete(name);
    ActiveSessionStore.save(S);
  },
  end(S) {
    S.elapsed = Math.floor((Date.now() - S.startDate.getTime()) / 1000);
    S.started = false;
    ActiveSessionStore.clear();
    if (S.completedSetCount > 0) {
      const id = uuid();
      const sessions = Data.sessions();
      sessions.push({ id, date: iso(S.startDate), sets: Array.from({ length: S.completedSetCount }, () => ({ id: uuid(), weight: 0, reps: 0 })) });
      Data.saveSessions(sessions);
      const details = Data.details();
      details.push({ id, date: iso(S.startDate), duration: S.elapsed, muscles: sortStr(S.completedMuscles), exercises: S.sessionExercises });
      Data.saveDetails(details);
    }
  },
  restore(S, saved) {
    S.selectedMuscles = new Set(saved.selectedMuscles || []);
    S.selectedExerciseNames = new Set(saved.selectedExerciseNames || []);
    S.completedMuscles = new Set(saved.completedMuscles || []);
    S.completedStandalone = new Set(saved.completedStandaloneExercises || []);
    S.completedSetCount = saved.completedSetCount || 0;
    S.sessionExercises = saved.sessionExercises || [];
    S.completedExercises = new Set(saved.completedExerciseNames || []);
    S.startDate = toDate(saved.startDate);
    startSession(S, false);
    S.trainingStarted = true;
  }
};

/* =========================================================================
   Entwürfe (noch nicht gespeicherte Sätze), Pausen-Timer
   ========================================================================= */

// Eingetragene, aber noch nicht gespeicherte Sätze werden sofort mitgesichert,
// damit nichts verloren geht (Zurück-Tippen, App geschlossen, Akku leer …).
const Drafts = {
  all() { return store.get('drafts', {}); },
  get(name) { const d = Drafts.all()[name]; return d ? d.sets : null; },
  set(name, kind, sets) {
    const d = Drafts.all();
    if (sets && sets.length) d[name] = { kind, sets }; else delete d[name];
    store.set('drafts', d);
  },
  clear(name) { Drafts.set(name, null, []); },
  clearAll() { store.del('drafts'); }
};
const draftHint = name => {
  const d = Drafts.all()[name];
  return d && d.sets.length ? `<div class="caption accent">${d.sets.length} ${d.sets.length === 1 ? 'Satz' : 'Sätze'} nicht gespeichert</div>` : '';
};

/** Speichert Sätze einer Übung endgültig (Verlauf + laufende Session). */
function commitSets(name, kind, sets, inSession) {
  if (!sets || !sets.length) { Drafts.clear(name); return; }
  const date = iso(now());
  if (kind === 'normal' || kind === 'pullups') {
    const h = Data.history(name);
    h.push({ id: uuid(), date, sets });
    Data.saveHistory(name, h);
  }
  if (kind === 'deadhang') { const l = Data.deadHang(); l.push({ id: uuid(), date, sets: sets.map(x => ({ id: uuid(), seconds: x })) }); Data.saveDeadHang(l); }
  if (kind === 'planks') { const l = Data.planks(); l.push({ id: uuid(), date, sets: sets.map(x => ({ id: uuid(), seconds: x })) }); Data.savePlanks(l); }
  if (inSession && ACTIVE) {
    if (kind === 'normal') Session.normalSaved(ACTIVE, Pool.find(name) || { name, muscle: '' }, sets);
    if (kind === 'pullups') Session.standaloneSaved(ACTIVE, 'Klimmzüge', 'Rücken', sets);
    if (kind === 'deadhang') Session.standaloneSaved(ACTIVE, 'Dead Hang', 'Unterarme', sets.map(x => ({ weight: 0, reps: x })));
    if (kind === 'planks') Session.standaloneSaved(ACTIVE, 'Planks', 'Abs', sets.map(x => ({ weight: 0, reps: x })));
  }
  Drafts.clear(name);
}

/** Zurück-Navigation mit Nachfrage, falls noch ungespeicherte Sätze da sind. */
function guardBack(count, onSave, onDiscard) {
  if (!count) { pop(); return; }
  actionSheet({
    title: `Du hast ${count} ${count === 1 ? 'Satz' : 'Sätze'} eingetragen, aber noch nicht gespeichert.`,
    actions: [
      { label: 'Speichern', action: () => { onSave(); toast('Training gespeichert'); pop(); } },
      { label: 'Verwerfen', role: 'destructive', action: () => { onDiscard(); pop(); } }
    ]
  });
}

// Lautloser Pausen-Timer (bewusst ohne Ton und Vibration – nur visuell).
const REST_OPTIONS = [[0, 'Aus'], [60, '1:00'], [90, '1:30'], [120, '2:00'], [180, '3:00']];
const Rest = {
  endAt: null, doneAt: null, total: 0,
  seconds() { return store.get('restSeconds', 90); },
  start() {
    const sec = Rest.seconds();
    if (!sec) return;
    Rest.total = sec; Rest.endAt = Date.now() + sec * 1000; Rest.doneAt = null; Rest.render(true);
  },
  add(d) {
    if (!Rest.endAt) return;
    Rest.endAt = Math.max(Date.now() + 1000, Rest.endAt + d * 1000);
    Rest.total = Math.max(Rest.total, Math.ceil((Rest.endAt - Date.now()) / 1000));
    Rest.render();
  },
  stop() { Rest.endAt = null; Rest.doneAt = null; Rest.render(); },
  tick() {
    if (Rest.endAt && Date.now() >= Rest.endAt) { Rest.endAt = null; Rest.doneAt = Date.now(); }
    if (Rest.doneAt && Date.now() - Rest.doneAt > 12000) Rest.doneAt = null;
    Rest.render();
  },
  render(force) {
    const el = document.getElementById('restbar');
    if (!el) return;
    const mode = Rest.endAt ? 'run' : Rest.doneAt ? 'done' : '';
    document.body.classList.toggle('resting', !!mode);
    if (!mode) { el.innerHTML = ''; el.dataset.mode = ''; return; }
    const host = HOSTS.rest || new Host('rest');
    if (force || el.dataset.mode !== mode) {
      host.reset();
      el.dataset.mode = mode;
      el.innerHTML = mode === 'run'
        ? `<div class="rest-pill"><div class="rest-prog" data-rest-prog></div>
            <div class="col" style="gap:0"><span class="caption2 muted">PAUSE</span><span class="rest-time" data-rest-time></span></div>
            <span class="spacer"></span>
            <button class="rest-btn" data-on="${host.on(() => Rest.add(-15))}">−15</button>
            <button class="rest-btn" data-on="${host.on(() => Rest.add(15))}">+15</button>
            <button class="rest-btn" data-on="${host.on(() => Rest.stop())}">${ic('x')}</button></div>`
        : `<div class="rest-pill done" data-on="${host.on(() => Rest.stop())}"><span style="font-size:22px;display:flex">${ic('check')}</span>
            <span class="headline" style="flex:1">Pause vorbei – nächster Satz!</span><span style="display:flex">${ic('x')}</span></div>`;
    }
    if (mode === 'run') {
      const left = Math.max(0, Math.ceil((Rest.endAt - Date.now()) / 1000));
      const t = el.querySelector('[data-rest-time]'); if (t) t.textContent = `${Math.floor(left / 60)}:${pad2(left % 60)}`;
      const pr = el.querySelector('[data-rest-prog]'); if (pr) pr.style.width = `${Math.min(100, (1 - left / Math.max(1, Rest.total)) * 100)}%`;
    }
  }
};
tickers.add(() => Rest.tick());

/* =========================================================================
   Screens
   ========================================================================= */

const SCREENS = {};

/* ---------- Home ---------- */
const QUOTES = ['Disziplin schlägt Motivation.', 'Kleine Schritte, große Wirkung.', 'Dein einziger Konkurrent bist du von gestern.', 'Konsistenz schlägt Intensität.', 'Der beste Zeitpunkt anzufangen ist jetzt.'];

function isStandalone() {
  return window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
}

SCREENS.home = (entry, host) => {
  const details = Data.details();
  const plans = Plans.load();
  const today = startOfDay(now());
  const monday = addDays(today, -mondayOffset(today));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekEnd = addDays(monday, 7);
  const thisWeek = details.filter(d => { const t = toDate(d.date); return t >= monday && t < weekEnd; });
  const totalSec = thisWeek.reduce((a, d) => a + d.duration, 0);
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60);
  const durText = h > 0 ? `${h}h ${m}m` : `${m}m`;
  const daily = week.map(day => details.filter(d => sameDay(toDate(d.date), day)).reduce((a, d) => a + d.duration, 0) / 60);
  const hour = now().getHours();
  const greeting = hour >= 5 && hour < 12 ? 'Guten Morgen' : hour >= 12 && hour < 18 ? 'Guten Tag' : 'Guten Abend';
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const planMuscles = plan => sortStr(new Set(Pool.all().filter(e => plan.exerciseNames.includes(e.name)).map(e => e.muscle))).join(' · ');

  const installHint = (!isStandalone() && !store.get('installHintDismissed', false))
    ? `<div class="install-hint">${ic('share')}<div style="flex:1">Für die volle App: in Safari auf <b>Teilen</b> tippen → <b>Zum Home-Bildschirm</b>. Dann startet GymLog wie eine normale App.</div>
        <button class="muted" data-on="${host.on(() => { store.set('installHintDismissed', true); refresh(); })}">${ic('x')}</button></div>` : '';

  const resume = ActiveSessionStore.has() ? `
    <div class="card r22 tinted-12 outlined row tap" data-on="${host.on(() => push('session', { resume: true }))}">
      <span class="accent" style="font-size:28px;display:flex">${ic('resume')}</span>
      <div class="col g4" style="flex:1"><div class="headline">Aktives Training fortsetzen</div><div class="sub muted">Du hast eine unterbrochene Session</div></div>
      <span class="muted">${ic('chevR')}</span>
    </div>` : '';

  const lastBackup = store.get('lastBackupAt', null);
  const daysSince = lastBackup ? Math.floor((Date.now() - toDate(lastBackup).getTime()) / 864e5) : null;
  const needBackup = details.length > 0 && Date.now() > store.get('backupSnoozeUntil', 0) && (daysSince == null || daysSince >= 14);
  const backupCard = needBackup ? `
    <div class="install-hint">${ic('backup')}<div class="col g8" style="flex:1">
      <div><b>${daysSince == null ? 'Noch kein Backup' : `Letztes Backup vor ${daysSince} Tagen`}</b><br>Deine Trainings liegen nur auf diesem Handy – sichere sie ab und zu als Datei.</div>
      <div class="row"><button class="btn-tinted small" data-on="${host.on(openBackupSheet)}">Jetzt sichern</button>
        <button class="sub muted" style="padding:6px" data-on="${host.on(() => { store.set('backupSnoozeUntil', Date.now() + 3 * 864e5); refresh(); })}">Später</button></div>
    </div></div>` : '';

  const start = plans.length ? `
    <div class="card r22 col g14 tap" data-on="${host.on(() => push('session', { planId: plans[0].id }))}">
      <div class="row"><span class="sub muted">Trainingsplan</span><span class="spacer"></span>
        <button class="link" data-on="${host.on(() => push('plans'))}">Alle Pläne</button></div>
      <div class="h2">${esc(plans[0].name)}</div>
      <div class="sub muted">${esc(planMuscles(plans[0]))}</div>
      <div class="btn-primary">${ic('play')}<span>Training starten</span><span class="spacer"></span>${ic('arrowR')}</div>
    </div>`
    : `<button class="btn-primary" data-on="${host.on(() => push('session', {}))}">${ic('play')}<span>Session starten</span><span class="spacer"></span>${ic('arrowR')}</button>`;

  return {
    title: '',
    body: `
      ${installHint}
      <div class="col g4" style="padding-top:8px"><div class="h1">${greeting}</div><div class="muted">Zeit, stärker zu werden.</div></div>
      <div class="week">${week.map((d, i) => {
        const has = details.some(x => sameDay(toDate(x.date), d));
        return `<div class="d"><span class="caption2 muted">${NARROW_WEEKDAYS[i]}</span><span class="n ${sameDay(d, today) ? 'today' : has ? 'has' : ''}">${d.getDate()}</span></div>`;
      }).join('')}</div>
      ${resume}
      ${backupCard}
      ${start}
      <div class="hstack-stats">
        <div class="card r18 col g8"><span class="caption muted">Diese Woche</span><span class="h1" style="font-size:28px">${thisWeek.length}</span><span class="caption muted">${thisWeek.length === 1 ? 'Training' : 'Trainings'}</span></div>
        <div class="card r18 col g8"><span class="caption muted">Gesamtzeit</span><span class="h1" style="font-size:28px">${durText}</span>${miniBars(daily, 28)}</div>
      </div>
      ${typeof mealHomeCard === 'function' ? mealHomeCard(host) : ''}
      <div class="card r18 center sub italic">${esc(quote)}</div>
      ${(() => { const arts = LEX().articles; if (!arts.length) return ''; const a = arts[dayOfYear % arts.length];
        return `<div class="card r18 col g8 tap" data-on="${host.on(() => push('lexArticle', { id: a.id }))}">
          <div class="row"><span class="accent" style="display:flex">${ic('book')}</span><span class="caption bold accent" style="text-transform:uppercase;letter-spacing:.4px;flex:1">Wissen für heute</span><span class="muted">${ic('chevR')}</span></div>
          <div class="headline">${esc(a.title)}</div><div class="sub muted">${esc(a.teaser)}</div></div>`; })()}`
  };
};

/* ---------- Session ---------- */
SCREENS.session = (entry, host) => {
  if (!entry.state.S) {
    const S = newSessionState();
    entry.state.S = S;
    if (entry.params.resume) {
      const saved = ActiveSessionStore.load();
      if (saved) Session.restore(S, saved);
    } else if (entry.params.planId) {
      const plan = Plans.load().find(p => p.id === entry.params.planId);
      if (plan) {
        S.selectedMuscles = new Set(Pool.all().filter(e => plan.exerciseNames.includes(e.name)).map(e => e.muscle));
        S.selectedExerciseNames = new Set(plan.exerciseNames);
      }
    }
    entry.onPop = () => { if (ACTIVE === S) ACTIVE = null; S.started = false; };
  }
  const S = entry.state.S;
  ACTIVE = S;
  return S.trainingStarted ? activeTrainingView(S, entry, host) : muscleSelectionView(S, entry, host);
};

function muscleSelectionView(S, entry, host) {
  const toggle = m => {
    const names = Pool.active().filter(e => e.muscle === m).map(e => e.name);
    if (S.selectedMuscles.has(m)) { S.selectedMuscles.delete(m); names.forEach(n => S.selectedExerciseNames.delete(n)); }
    else { S.selectedMuscles.add(m); names.forEach(n => S.selectedExerciseNames.add(n)); }
    refresh();
  };
  const startTraining = () => {
    openExercisePicker({
      title: 'Übungen wählen', confirmLabel: "Los geht's",
      muscles: sortStr(S.selectedMuscles), selected: S.selectedExerciseNames,
      onConfirm: sel => {
        S.selectedExerciseNames = sel;
        S.completedMuscles.clear(); S.completedExercises.clear(); S.completedStandalone.clear();
        S.sessionExercises = []; S.completedSetCount = 0;
        Drafts.clearAll();
        startSession(S);
        S.trainingStarted = true;
        ActiveSessionStore.save(S);
        refresh();
      }
    });
  };
  return {
    title: 'Neue Session',
    body: `
      <div class="timer-34" data-session-timer>${timeString(S.elapsed)}</div>
      <div class="col g8"><div class="h1">Was trainierst du heute?</div><div class="muted">Wähle die Muskelgruppen aus, die du heute trainieren möchtest.</div></div>
      <div class="grid2">${MUSCLES.map(m => `<button class="muscle-btn ${S.selectedMuscles.has(m) ? 'on' : ''}" data-on="${host.on(() => toggle(m))}">
          <span>${m}</span><span class="spacer"></span>${S.selectedMuscles.has(m) ? ic('checkCircle') : ''}</button>`).join('')}</div>
      <button class="btn-fill" style="margin-top:12px;justify-content:space-between;padding:16px 18px" ${S.selectedMuscles.size ? '' : 'disabled'} data-on="${host.on(startTraining)}">
        <span>Training starten</span>${ic('arrowR')}</button>`
  };
}

function activeTrainingView(S, entry, host) {
  const exercisesFor = m => Pool.all().filter(e => e.muscle === m && S.selectedExerciseNames.has(e.name));
  const row = ex => {
    if (SPECIAL.has(ex.name)) {
      const done = S.completedStandalone.has(ex.name);
      const open = () => push(ex.name === 'Klimmzüge' ? 'pullups' : ex.name === 'Planks' ? 'planks' : 'deadhang', { inSession: true });
      const del = () => confirmTwice({
        title1: 'Übung entfernen?', msg1: 'Möchtest du diese zusätzliche Übung wirklich entfernen?',
        title2: 'Wirklich entfernen?', msg2: 'Die Übung und ihre bereits eingetragenen Sätze werden aus dieser Session entfernt.',
        onConfirm: () => { Session.removeStandalone(S, ex.name); refresh(); }
      });
      return `<div class="card r16 row ${done ? 'done' : ''}">
          <div class="row tap" style="flex:1" data-on="${host.on(open)}">
            <span style="font-size:24px;display:flex" class="${done ? 'green' : 'accent'}">${ic('dumbbell')}</span>
            <div class="col g4" style="flex:1"><div class="headline">${esc(ex.name)}</div>${done ? '<div class="caption green">Abgeschlossen</div>' : ''}${draftHint(ex.name)}</div>
            <span class="${done ? 'green' : 'muted'}" style="display:flex;font-size:${done ? 22 : 17}px">${ic(done ? 'checkCircle' : 'chevR')}</span>
          </div>
          <button class="icon-btn trash" style="width:42px;height:42px" data-on="${host.on(del)}">${ic('trash')}</button>
        </div>`;
    }
    const done = S.completedExercises.has(ex.name);
    return `<div class="card r16 row tap ${done ? 'done' : ''}" data-on="${host.on(() => push('exercise', { name: ex.name, inSession: true }))}">
        ${exImage(ex, 70)}
        <div class="col g4" style="flex:1"><div class="headline">${esc(ex.name)}</div>${done ? '<div class="caption green">Abgeschlossen</div>' : ''}${draftHint(ex.name)}</div>
        <span class="muted">${ic('chevR')}</span>
      </div>`;
  };
  const addExercise = () => openAddSpecialSheet(S, () => {
    for (const ex of Pool.all()) if (ADDABLE_SPECIAL.includes(ex.name) && S.selectedExerciseNames.has(ex.name)) S.selectedMuscles.add(ex.muscle);
    ActiveSessionStore.save(S);
    refresh();
  });
  const finish = () => {
    Rest.stop();
    Session.end(S);
    Drafts.clearAll();
    openSummarySheet(S, () => { ACTIVE = null; popToRoot(); });
  };
  const end = () => actionSheet({
    title: 'Training wirklich beenden?',
    actions: [{ label: 'Training beenden', role: 'destructive', action: () => {
      const pending = Object.entries(Drafts.all()).filter(([n, d]) => S.selectedExerciseNames.has(n) && d.sets.length);
      if (!pending.length) { finish(); return; }
      alertDialog({
        title: 'Ungespeicherte Sätze',
        message: `Bei ${pending.map(([n]) => n).join(', ')} hast du Sätze eingetragen, aber noch nicht gespeichert.`,
        buttons: [
          { label: 'Verwerfen', role: 'destructive', action: finish },
          { label: 'Mitspeichern', role: 'cancel', action: () => { pending.forEach(([n, d]) => commitSets(n, d.kind, d.sets, true)); finish(); } }
        ]
      });
    } }]
  });
  return {
    title: 'Training',
    onBack: () => { pop(); },
    body: `
      <div class="card r16 row"><span style="font-size:22px;display:flex">${ic('timer')}</span><span class="timer-24" data-session-timer>${timeString(S.elapsed)}</span></div>
      <div class="row"><div class="h2">Dein Training</div><span class="spacer"></span>
        <button class="row accent sub bold" style="gap:5px" data-on="${host.on(addExercise)}">${ic('plusCircle')}<span>Übung hinzufügen</span></button></div>
      ${sortStr(S.selectedMuscles).map(m => `
        <div class="col g12">
          <div class="row"><div class="h3">${m}</div><span class="spacer"></span>${S.completedMuscles.has(m) ? `<span class="green" style="display:flex;font-size:22px">${ic('checkCircle')}</span>` : ''}</div>
          ${exercisesFor(m).map(row).join('')}
        </div>`).join('')}
      <button class="btn-fill" style="margin-top:8px" data-on="${host.on(end)}">${ic('check')}<span>Training beenden</span></button>`
  };
}

function openAddSpecialSheet(S, onDone) {
  openSheet((sh, host) => ({
    title: 'Übungen hinzufügen',
    left: '',
    right: `<button class="nb-btn bold" data-on="${host.on(() => sh.close())}">Hinzufügen</button>`,
    body: `<div class="group">${ADDABLE_SPECIAL.map(n => `<button class="li" data-on="${host.on(() => {
        S.selectedExerciseNames.has(n) ? S.selectedExerciseNames.delete(n) : S.selectedExerciseNames.add(n); sh.render();
      })}"><span style="flex:1">${esc(n)}</span>${S.selectedExerciseNames.has(n) ? `<span class="accent">${ic('check')}</span>` : ''}</button>`).join('')}</div>`
  }), { grouped: true, onClose: onDone });
}

function openSummarySheet(S, onHome) {
  openSheet((sh, host) => {
    const muscles = sortStr(S.completedMuscles);
    const stat = (icon, label, val) => `<div class="card r16 col g8" style="align-items:center;padding:14px 8px">
        <span class="accent" style="font-size:24px;display:flex">${ic(icon)}</span><span class="caption muted">${label}</span><span class="headline bold">${val}</span></div>`;
    return {
      title: 'Zusammenfassung', left: '',
      right: `<button class="nb-btn" data-on="${host.on(() => { sh.close(); onHome(); })}">${ic('home')}</button>`,
      body: `
        <div class="col g16" style="align-items:center;text-align:center">
          <span class="green" style="font-size:70px;display:flex">${ic('checkCircle')}</span>
          <div class="h1">Training geschafft! 💪</div>
          <div class="sub muted">Starke Session. Hier ist deine Zusammenfassung.</div>
          <div class="col g4" style="align-items:center"><span class="headline muted">Dauer</span><span style="font-size:36px;font-weight:700" class="mono">${timeString(S.elapsed)}</span></div>
        </div>
        <div class="grid3">${stat('clock', 'Dauer', timeString(S.elapsed))}${stat('dumbbell', 'Übungen', S.sessionExercises.length)}${stat('stack', 'Sätze', S.completedSetCount)}</div>
        <div class="col g16">
          <div class="h2">Training</div>
          ${muscles.map(m => `<div class="card r16 col g14">
              <div class="row"><div class="h3">${m}</div><span class="spacer"></span><span class="green" style="display:flex;font-size:22px">${ic('checkCircle')}</span></div>
              ${S.sessionExercises.filter(e => e.muscle === m).map(e => `<div class="card r12 inner col g8">
                  <div class="row"><span class="headline" style="flex:1">${esc(e.exerciseName)}</span><span class="sub muted">${e.setCount === 1 ? '1 Satz' : e.setCount + ' Sätze'}</span></div>
                  ${e.sets.map((s, i) => `<div class="row sub"><span class="muted" style="flex:1">Satz ${i + 1}</span><span class="semibold">${setLabel(e.exerciseName, s)}</span></div>`).join('')}
                </div>`).join('')}
            </div>`).join('')}
        </div>
        <div class="h3 center" style="margin-top:12px">Starkes Training! 💪</div>
        <button class="btn-fill" data-on="${host.on(() => { sh.close(); onHome(); })}">${ic('home')}<span>Zurück zu Home</span></button>`
    };
  }, { modal: true });
}

/* ---------- Übungsdetail (Satz-Erfassung) ---------- */
SCREENS.exercise = (entry, host) => {
  const ex = Pool.find(entry.params.name) || { name: entry.params.name, muscle: '', imageName: '' };
  const st = entry.state;
  const history = Data.history(ex.name);
  const last = history[history.length - 1];
  // Referenz-Satz zum Vorausfüllen: letzter Satz von heute, sonst erster Satz vom letzten Training.
  const refSet = () => (st.currentSets.length ? st.currentSets[st.currentSets.length - 1] : (last && last.sets[0]) || null);
  if (!st.currentSets) {
    Object.assign(st, { currentSets: Drafts.get(ex.name) || [], editingIndex: null, editingWorkoutID: null, editingSets: [], reps: '' });
    const r0 = refSet(); st.weight = r0 ? fmtW(r0.weight) : '';
  }
  Drafts.set(ex.name, 'normal', st.currentSets);
  const ref = refSet();
  const root = () => screenEl();
  const readInputs = () => {
    st.weight = root().querySelector('#in-weight')?.value ?? st.weight;
    st.reps = root().querySelector('#in-reps')?.value ?? st.reps;
  };
  const syncEditing = () => {
    root().querySelectorAll('[data-edit-row]').forEach(r => {
      const s = st.editingSets[+r.dataset.editRow];
      if (!s) return;
      const w = parseNum(r.querySelector('.ew').value); const rp = parseIntSafe(r.querySelector('.er').value);
      s.weight = isNaN(w) ? 0 : w; s.reps = rp;
    });
  };
  const commit = () => {
    readInputs();
    const w = parseNum(st.weight); const r = parseIntSafe(st.reps);
    if (r <= 0) { toast('Bitte Wiederholungen eintragen'); return; }
    const weight = isNaN(w) ? 0 : w;
    if (st.editingIndex != null && st.currentSets[st.editingIndex]) {
      Object.assign(st.currentSets[st.editingIndex], { weight, reps: r });
      st.editingIndex = null;
    } else { st.currentSets.push({ id: uuid(), weight, reps: r }); Rest.start(); }
    st.weight = fmtW(weight); st.reps = '';
    refresh();
    setTimeout(() => root().querySelector('#in-weight')?.blur(), 0);
  };
  const save = () => {
    if (!st.currentSets.length) return;
    commitSets(ex.name, 'normal', st.currentSets, entry.params.inSession);
    st.currentSets = []; st.editingIndex = null;
    toast('Training gespeichert');
    refresh();
  };
  const curRows = st.currentSets.map((s, i) => `
    <div class="card r14 row ${st.editingIndex === i ? 'editing' : ''}">
      <div class="row tap" style="flex:1" data-on="${host.on(() => { st.weight = fmtW(s.weight); st.reps = String(s.reps); st.editingIndex = i; refresh(); })}">
        <span class="headline" style="flex:1">Satz ${i + 1}</span><span class="semibold">${fmtW(s.weight)} kg × ${s.reps}</span><span class="muted caption2">${ic('pencil')}</span></div>
      <button class="icon-btn trash" data-on="${host.on(() => { readInputs(); if (st.editingIndex === i) { st.editingIndex = null; st.weight = ref ? fmtW(ref.weight) : ''; st.reps = ''; } st.currentSets.splice(i, 1); refresh(); })}">${ic('trash')}</button>
    </div>`).join('');

  const histRows = [...history].reverse().map(w => {
    const editing = st.editingWorkoutID === w.id;
    const del = () => alertDialog({
      title: 'Eintrag löschen?', message: 'Dieser Trainingseintrag wird endgültig gelöscht – auch aus dem zugehörigen Training im Kalender, falls vorhanden.',
      buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Löschen', role: 'destructive', action: () => {
        if (editing) { st.editingWorkoutID = null; st.editingSets = []; }
        Data.deleteExerciseWorkout(ex.name, w); refresh();
      } }]
    });
    const editBody = editing ? `<div class="card r14 tinted col g8">
        ${st.editingSets.map((s, i) => `<div class="row" data-edit-row="${i}" style="gap:8px">
            <label class="field small" style="flex:1"><input class="ew" inputmode="decimal" value="${esc(fmtW(s.weight))}" placeholder="kg"></label>
            <span class="caption muted">kg ×</span>
            <label class="field small" style="flex:1"><input class="er" inputmode="numeric" pattern="[0-9]*" value="${s.reps || ''}" placeholder="Wdh."></label>
            <button class="icon-btn trash" data-on="${host.on(() => { syncEditing(); st.editingSets.splice(i, 1); refresh(); })}">${ic('trash')}</button>
          </div>`).join('')}
        <div class="row"><button class="btn-tinted small" data-on="${host.on(() => { syncEditing(); st.editingSets.push({ id: uuid(), weight: 0, reps: 0 }); refresh(); })}">${ic('plus')} Satz</button>
          <span class="spacer"></span>
          <button class="sub" style="padding:6px" data-on="${host.on(() => { st.editingWorkoutID = null; st.editingSets = []; refresh(); })}">Abbrechen</button>
          <button class="sub bold accent" style="padding:6px" data-on="${host.on(() => {
            syncEditing();
            const cleaned = st.editingSets.filter(s => s.reps > 0);
            if (!cleaned.length) Data.deleteExerciseWorkout(ex.name, w);
            else Data.updateExerciseWorkout(ex.name, w.id, cleaned);
            st.editingWorkoutID = null; st.editingSets = []; refresh();
          })}">Speichern</button></div>
      </div>` : `<div class="sub">${esc(setsText(w.sets))}</div>`;
    return `<div class="card r16 col g8">
        <div class="row"><span class="caption muted" style="flex:1">${fDateTime(w.date)}</span>
          ${editing ? '' : `<button class="icon-btn muted" data-on="${host.on(() => { st.editingWorkoutID = w.id; st.editingSets = w.sets.map(s => ({ ...s })); refresh(); })}">${ic('pencil')}</button>`}
          <button class="icon-btn trash" data-on="${host.on(del)}">${ic('trash')}</button></div>
        ${editBody}</div>`;
  }).join('');

  return {
    title: '',
    right: lexEntryBtn(host, ex.name),
    onBack: () => guardBack(st.currentSets.length,
      () => { commitSets(ex.name, 'normal', st.currentSets, entry.params.inSession); st.currentSets = []; },
      () => { st.currentSets = []; Drafts.clear(ex.name); }),
    body: `
      <div style="display:flex;justify-content:center;height:190px;align-items:center">${exImage(ex, 180)}</div>
      <div class="col g4"><div class="h1" style="font-size:28px">${esc(ex.name)}</div><div class="muted">${esc(ex.muscle)}</div></div>
      ${last ? `<div class="card r18 tinted col g8"><div class="headline">Letztes Training</div><div class="sub">${esc(setsText(last.sets))}</div></div>` : ''}
      ${st.currentSets.length ? `<div class="col g8"><div class="row"><span class="headline" style="flex:1">Dieses Training</span><span class="caption accent">noch nicht gespeichert</span></div>${curRows}</div>` : ''}
      <div class="col g12">
        ${st.editingIndex != null ? `<div class="row"><span class="caption bold accent" style="flex:1">Satz wird bearbeitet</span>
          <button class="caption accent" data-on="${host.on(() => { st.editingIndex = null; st.weight = ref ? fmtW(ref.weight) : ''; st.reps = ''; refresh(); })}">Abbrechen</button></div>` : ''}
        <div class="grid2">
          <div><div class="field-label">Gewicht</div><label class="field"><input id="in-weight" inputmode="decimal" placeholder="80" value="${esc(st.weight)}"><span class="unit">kg</span></label></div>
          <div><div class="field-label">Wiederholungen</div><label class="field"><input id="in-reps" inputmode="numeric" pattern="[0-9]*" placeholder="${ref ? ref.reps : 8}" value="${esc(st.reps)}"></label></div>
        </div>
        <button class="btn-fill" data-on="${host.on(commit)}">${ic(st.editingIndex != null ? 'check' : 'plus')}<span>${st.editingIndex != null ? 'Satz aktualisieren' : 'Satz hinzufügen'}</span></button>
        <button class="btn-tinted" ${st.currentSets.length ? '' : 'disabled'} data-on="${host.on(save)}">${ic('check')}<span>Training speichern</span></button>
      </div>
      ${history.length ? `<div class="col g12"><div class="h2">Verlauf</div>${histRows}</div>` : ''}`,
    after(el) {
      const reps = el.querySelector('#in-reps');
      const weight = el.querySelector('#in-weight');
      if (weight) weight.addEventListener('keydown', e => { if (e.key === 'Enter') reps.focus(); });
      if (reps) reps.addEventListener('keydown', e => { if (e.key === 'Enter') commit(); });
    }
  };
};

/* ---------- Klimmzüge ---------- */
SCREENS.pullups = (entry, host) => {
  const st = entry.state;
  const hist = Data.history('Klimmzüge');
  const lastW = hist.length ? hist[hist.length - 1].sets[0] : null;
  if (!st.sets) { st.sets = Drafts.get('Klimmzüge') || []; const r0 = st.sets[st.sets.length - 1] || lastW; st.w = r0 ? fmtW(r0.weight) : ''; }
  Drafts.set('Klimmzüge', 'pullups', st.sets);
  const ref = st.sets[st.sets.length - 1] || lastW;
  const root = () => screenEl();
  const add = () => {
    const w = parseNum(root().querySelector('#pu-w').value); const r = parseIntSafe(root().querySelector('#pu-r').value);
    if (r <= 0) { toast('Bitte Wiederholungen eintragen'); return; }
    const weight = isNaN(w) ? 0 : w;
    st.sets.push({ id: uuid(), weight, reps: r });
    st.w = fmtW(weight);
    Rest.start();
    refresh();
  };
  const save = () => {
    if (!st.sets.length) return;
    commitSets('Klimmzüge', 'pullups', st.sets, entry.params.inSession);
    st.sets = [];
    pop();
  };
  return {
    title: '',
    right: lexEntryBtn(host, 'Klimmzüge'),
    onBack: () => guardBack(st.sets.length,
      () => { commitSets('Klimmzüge', 'pullups', st.sets, entry.params.inSession); st.sets = []; },
      () => { st.sets = []; Drafts.clear('Klimmzüge'); }),
    body: `
      <div class="col g8"><div class="h1">Klimmzüge</div><div class="muted">Trage deine Wiederholungen pro Satz ein.</div></div>
      ${st.sets.length ? `<div class="col g8"><div class="headline">Dieses Training</div>${st.sets.map((s, i) => `
        <div class="card r14 row"><span style="flex:1">Satz ${i + 1}</span><span class="semibold">${fmtW(s.weight)} kg × ${s.reps}</span>
        <button class="icon-btn trash" data-on="${host.on(() => { st.sets.splice(i, 1); refresh(); })}">${ic('trash')}</button></div>`).join('')}</div>` : ''}
      <div class="grid2">
        <div><div class="field-label">Zusatzgewicht</div><label class="field"><input id="pu-w" inputmode="decimal" placeholder="0" value="${esc(st.w)}"><span class="unit">kg</span></label></div>
        <div><div class="field-label">Wiederholungen</div><label class="field"><input id="pu-r" inputmode="numeric" pattern="[0-9]*" placeholder="${ref ? ref.reps : 8}"></label></div>
      </div>
      <button class="btn-fill" data-on="${host.on(add)}">${ic('plus')}<span>Satz hinzufügen</span></button>
      <button class="btn-tinted" ${st.sets.length ? '' : 'disabled'} data-on="${host.on(save)}">${ic('check')}<span>Training speichern</span></button>`
  };
};

/* ---------- Dead Hang / Planks (gemeinsame Verlaufs-Liste) ---------- */
function timedHistoryHTML(host, list, onDelete) {
  if (!list.length) return '';
  return `<div class="col g12"><div class="h2">Verlauf</div>${[...list].sort((a, b) => toDate(b.date) - toDate(a.date)).map(w => `
    <div class="card r16 row top"><div class="col g4" style="flex:1"><span class="caption muted">${fDateTime(w.date)}</span>
      <span class="sub">${w.sets.map(s => fmtMinSec(s.seconds)).join('   •   ')}</span></div>
      <button class="icon-btn trash" data-on="${host.on(() => alertDialog({
        title: 'Eintrag löschen?', message: 'Dieser Trainingseintrag wird endgültig gelöscht.',
        buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Löschen', role: 'destructive', action: () => onDelete(w) }]
      }))}">${ic('trash')}</button></div>`).join('')}</div>`;
}

SCREENS.deadhang = (entry, host) => {
  const st = entry.state;
  if (!st.sets) st.sets = Drafts.get('Dead Hang') || [];
  Drafts.set('Dead Hang', 'deadhang', st.sets);
  const add = () => {
    const t = parseIntSafe(screenEl().querySelector('#dh-m').value) * 60 + parseIntSafe(screenEl().querySelector('#dh-s').value);
    if (t <= 0) { toast('Bitte Zeit eintragen'); return; }
    st.sets.push(t); Rest.start(); refresh();
  };
  const save = () => {
    if (!st.sets.length) return;
    commitSets('Dead Hang', 'deadhang', st.sets, entry.params.inSession);
    st.sets = [];
    pop();
  };
  return {
    title: '',
    right: lexEntryBtn(host, 'Dead Hang'),
    onBack: () => guardBack(st.sets.length,
      () => { commitSets('Dead Hang', 'deadhang', st.sets, entry.params.inSession); st.sets = []; },
      () => { st.sets = []; Drafts.clear('Dead Hang'); }),
    body: `
      <div class="col g8"><div class="h1">Dead Hang</div><div class="muted">Trage die gehaltene Zeit pro Satz ein.</div></div>
      ${st.sets.length ? `<div class="col g8"><div class="headline">Dieses Training</div>${st.sets.map((s, i) => `
        <div class="card r14 row"><span style="flex:1">Satz ${i + 1}</span><span class="semibold">${fmtMinSec(s)}</span>
        <button class="icon-btn trash" data-on="${host.on(() => { st.sets.splice(i, 1); refresh(); })}">${ic('trash')}</button></div>`).join('')}</div>` : ''}
      <div class="grid2">
        <div><div class="field-label">Minuten</div><label class="field"><input id="dh-m" inputmode="numeric" pattern="[0-9]*" placeholder="0"></label></div>
        <div><div class="field-label">Sekunden</div><label class="field"><input id="dh-s" inputmode="numeric" pattern="[0-9]*" placeholder="30"></label></div>
      </div>
      <button class="btn-fill" data-on="${host.on(add)}">${ic('plus')}<span>Satz hinzufügen</span></button>
      <button class="btn-tinted" ${st.sets.length ? '' : 'disabled'} data-on="${host.on(save)}">${ic('check')}<span>Training speichern</span></button>
      ${timedHistoryHTML(host, Data.deadHang(), w => {
        Data.saveDeadHang(Data.deadHang().filter(x => x.id !== w.id));
        Data.removeExerciseFromSessions('Dead Hang', w.date);
        refresh();
      })}`
  };
};

SCREENS.planks = (entry, host) => {
  const st = entry.state;
  if (!st.sets) {
    st.sets = Drafts.get('Planks') || []; st.runningSince = null;
    st.tick = () => {
      if (!st.runningSince) return;
      const el = document.querySelector('[data-plank-timer]');
      if (el) el.textContent = fmtMinSec(Math.floor((Date.now() - st.runningSince) / 1000));
    };
    tickers.add(st.tick);
    entry.onPop = () => tickers.delete(st.tick);
  }
  Drafts.set('Planks', 'planks', st.sets);
  const elapsed = st.runningSince ? Math.floor((Date.now() - st.runningSince) / 1000) : 0;
  const toggle = () => {
    if (st.runningSince) {
      const t = Math.floor((Date.now() - st.runningSince) / 1000);
      if (t > 0) { st.sets.push(t); Rest.start(); }
      st.runningSince = null;
    } else { st.runningSince = Date.now(); Rest.stop(); }
    refresh();
  };
  const save = () => {
    if (!st.sets.length) return;
    commitSets('Planks', 'planks', st.sets, entry.params.inSession);
    st.sets = [];
    pop();
  };
  return {
    title: '',
    right: lexEntryBtn(host, 'Planks'),
    onBack: () => guardBack(st.sets.length,
      () => { commitSets('Planks', 'planks', st.sets, entry.params.inSession); st.sets = []; },
      () => { st.sets = []; Drafts.clear('Planks'); }),
    body: `
      <div class="col g8"><div class="h1">Planks</div><div class="muted">Starte die Uhr, wenn du in Position gehst, und stoppe sie am Ende des Satzes.</div></div>
      <div class="card col g14" style="align-items:center">
        <div class="big-timer" data-plank-timer>${fmtMinSec(elapsed)}</div>
        <button class="btn-fill ${st.runningSince ? 'red' : 'green'}" style="font-size:20px;font-weight:700" data-on="${host.on(toggle)}">${ic(st.runningSince ? 'stop' : 'play')}<span>${st.runningSince ? 'Stoppen' : 'Start'}</span></button>
      </div>
      ${st.sets.length ? `<div class="col g8"><div class="headline">Dieses Training</div>${st.sets.map((s, i) => `
        <div class="card r14 row"><span style="flex:1">Satz ${i + 1}</span><span class="semibold">${fmtMinSec(s)}</span>
        <button class="icon-btn trash" data-on="${host.on(() => { st.sets.splice(i, 1); refresh(); })}">${ic('trash')}</button></div>`).join('')}</div>` : ''}
      <button class="btn-tinted" ${st.sets.length ? '' : 'disabled'} data-on="${host.on(save)}">${ic('check')}<span>Training speichern</span></button>
      ${timedHistoryHTML(host, Data.planks(), w => {
        Data.savePlanks(Data.planks().filter(x => x.id !== w.id));
        Data.removeExerciseFromSessions('Planks', w.date);
        refresh();
      })}`
  };
};

/* ---------- Übungsauswahl (Sheet) ---------- */
function openExercisePicker({ title, confirmLabel, muscles, selected, onConfirm }) {
  const sel = new Set(selected);
  openSheet((sh, host) => {
    const forMuscle = m => Pool.active().filter(e => e.muscle === m).sort((a, b) => (a.name < b.name ? -1 : 1));
    const groups = (muscles || MUSCLES).filter(m => forMuscle(m).length);
    return {
      title,
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      right: `<button class="nb-btn bold" ${sel.size ? '' : 'disabled'} data-on="${host.on(() => { sh.close(); onConfirm(new Set(sel)); })}">${esc(confirmLabel)}</button>`,
      body: `<div class="list-wrap">
        ${groups.map(m => `<div><div class="group-title"><span>${m}</span></div><div class="group">
          ${forMuscle(m).map(e => `<button class="li" data-on="${host.on(() => { sel.has(e.name) ? sel.delete(e.name) : sel.add(e.name); sh.render(); })}">
            <span>${esc(e.name)}</span>${e.isCustom ? '<span class="tag">eigene</span>' : ''}<span class="spacer"></span>
            ${sel.has(e.name) ? `<span class="accent">${ic('check')}</span>` : ''}</button>`).join('')}
        </div></div>`).join('')}
        ${groups.length ? '' : '<div class="muted center sub">Keine aktiven Übungen für diese Auswahl – aktiviere welche im Übungs-Katalog oder erstelle eine eigene.</div>'}
        <div class="group"><button class="li accent" data-on="${host.on(() => openCustomExerciseSheet(muscles, ex => { sel.add(ex.name); sh.render(); }))}">${ic('plusCircle')}<span>Eigene Übung erstellen</span></button></div>
      </div>`
    };
  }, { grouped: true });
}

function openCustomExerciseSheet(allowed, onCreated) {
  const opts = allowed && allowed.length ? allowed : MUSCLES;
  const st = { name: '', muscle: opts[0], error: null };
  openSheet((sh, host) => ({
    title: 'Eigene Übung',
    left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
    right: `<button class="nb-btn bold" data-on="${host.on(() => {
      st.name = sh.el.querySelector('#ce-name').value; st.muscle = sh.el.querySelector('#ce-muscle').value;
      if (!st.name.trim()) { st.error = 'Bitte einen Namen eingeben.'; sh.render(); return; }
      const ex = Pool.addCustom(st.name, st.muscle);
      if (!ex) { st.error = 'Es gibt schon eine Übung mit diesem Namen.'; sh.render(); return; }
      sh.close(); onCreated(ex);
    })}">Erstellen</button>`,
    body: `
      <div><div class="group-title">Name</div><label class="field"><input id="ce-name" placeholder="z. B. Kabelzug seitlich" value="${esc(st.name)}" autocomplete="off"></label></div>
      <div><div class="group-title">Muskelgruppe</div><label class="field"><select id="ce-muscle">${opts.map(m => `<option ${m === st.muscle ? 'selected' : ''}>${m}</option>`).join('')}</select><span class="muted">${ic('chevR')}</span></label></div>
      ${st.error ? `<div class="sub red">${esc(st.error)}</div>` : ''}`
  }), { grouped: true });
}

/* ---------- Kalender ---------- */
SCREENS.calendar = (entry, host) => {
  const st = entry.state;
  if (!st.month) st.month = startOfDay(now());
  const sessions = Data.sessions();
  const details = Data.details();
  const detailsFor = s => details.find(d => d.id === s.id);
  const first = new Date(st.month.getFullYear(), st.month.getMonth(), 1);
  const off = mondayOffset(first);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const days = [];
  for (let i = off; i >= 1; i--) days.push(addDays(first, -i));
  for (let i = 0; i < daysInMonth; i++) days.push(addDays(first, i));
  while (days.length % 7) days.push(addDays(first, days.length - off));
  const change = n => { st.month = new Date(st.month.getFullYear(), st.month.getMonth() + n, 1); refresh(); };
  const monthSessions = sessions.filter(s => { const d = toDate(s.date); return d.getFullYear() === first.getFullYear() && d.getMonth() === first.getMonth(); })
    .sort((a, b) => toDate(b.date) - toDate(a.date));

  const dayCell = d => {
    const has = sessions.some(s => sameDay(toDate(s.date), d));
    const isToday = sameDay(d, now());
    const other = d.getMonth() !== first.getMonth();
    const cls = ['cal-day', has ? 'has' : '', isToday ? 'today' : '', other ? 'other' : ''].join(' ');
    const handler = has ? `data-on="${host.on(() => {
      const s = sessions.find(x => sameDay(toDate(x.date), d));
      openSheet((sh, h2) => ({ title: 'Training', left: '', right: `<button class="nb-btn bold" data-on="${h2.on(() => sh.close())}">Fertig</button>`, body: workoutDetailBody(s) }));
    })}"` : '';
    return `<button class="${cls}" ${handler} ${has ? '' : 'disabled'}>${isToday ? '<span class="ring"></span>' : ''}${has ? '<span class="fill"></span>' : ''}<span>${d.getDate()}</span></button>`;
  };

  const card = s => {
    const d = detailsFor(s);
    const del = () => confirmTwice({
      title1: 'Training entfernen?', msg1: 'Möchtest du dieses gespeicherte Training wirklich entfernen?',
      title2: 'Wirklich endgültig löschen?', msg2: 'Das Training und seine gespeicherten Details werden endgültig gelöscht.',
      onConfirm: () => { Data.deleteSession(s); refresh(); }
    });
    const inner = d ? `
        <div class="row top"><div class="col g4" style="flex:1"><div class="headline">${fDate(s.date)}</div><div class="sub muted">${fTime(s.date)}</div></div><span class="muted caption">${ic('chevR')}</span></div>
        <div class="sub semibold">${esc(d.muscles.join(' · '))}</div>
        <div class="divider"></div>
        <div class="row sub muted" style="gap:18px;padding-right:40px">
          <span class="row" style="gap:5px">${ic('dumbbell')}${d.exercises.length}</span>
          <span class="row" style="gap:5px">${ic('hash')}${d.exercises.reduce((a, e) => a + e.setCount, 0)}</span>
          <span class="spacer"></span>
          <span class="row" style="gap:5px">${ic('timer')}${pad2(Math.floor(d.duration / 60))}:${pad2(d.duration % 60)}</span>
        </div>`
      : `<div class="headline">${fDateTime(s.date)}</div><div class="sub muted">${s.sets.length} Sätze</div>`;
    return `<div style="position:relative">
        <div class="card r18 col g14 tap" style="padding-bottom:${d ? 16 : 46}px" data-on="${host.on(() => push('workoutDetail', { id: s.id }))}">${inner}</div>
        <button class="icon-btn trash-sm" style="position:absolute;right:12px;bottom:10px" data-on="${host.on(del)}">${ic('trash')}</button>
      </div>`;
  };

  return {
    title: 'Kalender', large: true,
    body: `
      <div class="card col g16" style="padding:18px">
        <div class="row"><span class="spacer"></span><button class="pill" data-on="${host.on(() => { st.month = startOfDay(now()); refresh(); })}">Heute</button></div>
        <div class="row"><button class="circle-btn" data-on="${host.on(() => change(-1))}">${ic('chevL')}</button><span class="spacer"></span>
          <span class="h2">${dfMonth.format(first)}</span><span class="spacer"></span>
          <button class="circle-btn" data-on="${host.on(() => change(1))}">${ic('chevR')}</button></div>
        <div class="col g14"><div class="cal-head">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div>${d}</div>`).join('')}</div>
          <div class="cal-grid">${days.map(dayCell).join('')}</div></div>
      </div>
      <div class="divider"></div>
      <div class="col g14"><div class="h2">Trainings</div>
        ${monthSessions.length ? monthSessions.map(card).join('') : '<div class="muted">Keine Trainings in diesem Monat.</div>'}</div>`
  };
};

function workoutDetailBody(session) {
  if (!session) return '<div class="muted">Training nicht gefunden.</div>';
  const d = Data.details().find(x => x.id === session.id);
  return `
    <div class="card r16 col g16"><div class="headline">${fFull(session.date)}</div>
      <div class="row" style="gap:24px">
        <div class="col g4"><span class="caption muted">Dauer</span>${d ? `<span class="headline row" style="gap:5px">${ic('timer')}${Math.floor(d.duration / 60)} Min ${d.duration % 60} Sek</span>` : ''}</div>
        <div class="col g4"><span class="caption muted">Sätze</span><span class="headline row" style="gap:5px">${ic('hash')}${session.sets.length}</span></div>
      </div></div>
    <div class="divider"></div>
    <div class="h2">Training</div>
    ${d ? d.muscles.map(m => `<div class="col g12"><div class="h3">${esc(m)}</div>
        ${d.exercises.filter(e => e.muscle === m).map(e => `<div class="card r12 col g8">
          <div class="row"><span class="headline" style="flex:1">${esc(e.exerciseName)}</span><span class="muted">${e.setCount} Sätze</span></div>
          ${e.sets.map((s, i) => `<div class="row sub"><span style="flex:1">Satz ${i + 1}</span><span class="semibold">${setLabel(e.exerciseName, s)}</span></div>`).join('')}
        </div>`).join('')}</div>`).join('') : '<div class="muted">Keine Trainingsdetails vorhanden.</div>'}`;
}

SCREENS.workoutDetail = entry => {
  const s = Data.sessions().find(x => x.id === entry.params.id);
  return { title: 'Training', body: workoutDetailBody(s) };
};

/* ---------- Progress-Hub ---------- */
const PERIODS = [['W', 7], ['1M', 30], ['3M', 90], ['6M', 182], ['1J', 365]];
SCREENS.progressHub = (entry, host) => {
  const st = entry.state;
  if (!st.period) st.period = 'W';
  const days = PERIODS.find(p => p[0] === st.period)[1];
  const details = Data.details();
  const nowT = Date.now();
  const within = (end, d) => details.filter(s => { const t = toDate(s.date).getTime(); return t > end - d * 864e5 && t <= end; });
  const cur = within(nowT, days);
  const prev = within(nowT - days * 864e5, days);
  const secs = l => l.reduce((a, s) => a + s.duration, 0);
  const vol = s => s.exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + x.weight * x.reps, 0), 0);
  const volume = l => l.reduce((a, s) => a + vol(s), 0);
  const delta = (c, p) => { if (p <= 0) return null; const ch = Math.round(((c - p) / p) * 100); return `${ch >= 0 ? '+' : ''}${ch}%`; };
  const bucket = metric => {
    const width = Math.max(1, Math.floor(days / 7));
    const sums = Array(7).fill(0);
    for (const s of cur) {
      const ago = Math.floor((nowT - toDate(s.date).getTime()) / 864e5);
      if (ago < 0 || ago >= days) continue;
      sums[6 - Math.min(6, Math.floor(ago / width))] += metric(s);
    }
    return sums;
  };
  const statCard = (title, value, dl, values) => `<div class="card col g8">
      <span class="sub muted">${title}</span>
      <div class="row base"><span class="h1" style="font-size:28px">${value}</span>${dl ? `<span class="caption bold" style="color:${dl.startsWith('-') ? 'var(--red)' : 'var(--green)'}">${dl}</span>` : ''}</div>
      ${miniBars(values, 60)}</div>`;
  return {
    title: 'Progress', large: true,
    body: `
      <div class="segmented">${PERIODS.map(([p]) => `<button class="${p === st.period ? 'on' : ''}" data-on="${host.on(() => { st.period = p; refresh(); })}">${p}</button>`).join('')}</div>
      ${statCard('Trainings', cur.length, delta(cur.length, prev.length), bucket(() => 1))}
      ${statCard('Trainingszeit', (secs(cur) / 3600).toFixed(1) + ' h', delta(secs(cur), secs(prev)), bucket(s => s.duration / 60))}
      ${statCard('Gesamtvolumen', Math.round(volume(cur)) + ' kg', delta(volume(cur), volume(prev)), bucket(vol))}
      ${menuRow('chartUp', 'Persönliche Bestleistungen', 'Deine PRs je Übung', host.on(() => push('prs')))}
      ${menuRow('run', 'Lauf-Stats', 'Deine Läufe & Distanzen', host.on(() => push('runs')))}`
  };
};

/* ---------- Bestleistungen ---------- */
SCREENS.prs = (entry, host) => {
  const results = [];
  for (const ex of Pool.all()) {
    if (!store.has('history_' + ex.name)) continue;
    let best = null;
    for (const w of Data.history(ex.name)) for (const s of w.sets) if (!best || oneRM(s.weight, s.reps) > oneRM(best.weight, best.reps)) best = s;
    if (best) results.push({ ex, best });
  }
  return {
    title: 'Progress',
    body: `
      <div class="col g8"><div class="h1">Dein Fortschritt</div><div class="muted">Deine persönlichen Bestleistungen</div></div>
      ${results.length ? results.map(({ ex, best }) => `
        <div class="card r18 col g12 tap" data-on="${host.on(() => push('exerciseProgress', { name: ex.name }))}">
          <div class="row"><div class="col g4" style="flex:1"><div class="headline">${esc(ex.name)}</div><div class="caption muted">${esc(ex.muscle)}</div></div><span class="muted caption">${ic('chevR')}</span></div>
          <div class="divider"></div>
          <div class="row sub"><span style="flex:1">Beste Leistung</span><span class="bold">${fmtW(best.weight)} kg × ${best.reps}</span></div>
        </div>`).join('')
      : emptyState('chartUp', 'Noch keine Bestleistungen', 'Trainiere eine Übung, um hier deinen Fortschritt zu sehen.')}`
  };
};

/* ---------- Übungs-Fortschritt mit Diagramm ---------- */
function catmullRomPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

SCREENS.exerciseProgress = (entry, host) => {
  const name = entry.params.name;
  const ex = Pool.find(name) || { name, muscle: '' };
  const st = entry.state;
  const workouts = Data.history(name)
    .map(w => ({ ...w, sets: w.sets.filter(s => s.weight >= 0 && s.weight <= 1000 && s.reps > 0 && s.reps <= 100) }))
    .filter(w => w.sets.length)
    .sort((a, b) => toDate(a.date) - toDate(b.date));
  const allSets = workouts.flatMap(w => w.sets);
  const best = allSets.reduce((b, s) => (!b || oneRM(s.weight, s.reps) > oneRM(b.weight, b.reps) ? s : b), null);
  const heaviest = sets => sets.reduce((b, s) => (!b || s.weight > b.weight || (s.weight === b.weight && s.reps > b.reps) ? s : b), null);
  const points = workouts.map(w => ({ date: toDate(w.date), weight: heaviest(w.sets).weight }));
  let progressLine = '';
  if (best && workouts.length) {
    const p = best.weight - heaviest(workouts[0].sets).weight;
    progressLine = p > 0 ? `<div class="sub bold green">+${fmtW(p)} kg seit deinem ersten Training</div>`
      : p < 0 ? `<div class="sub bold red">${fmtW(p)} kg seit deinem ersten Training</div>`
        : '<div class="sub muted">Noch keine Gewichtssteigerung</div>';
  }
  const sel = st.sel != null && points[st.sel] ? points[st.sel] : null;

  const drawChart = el => {
    const box = el.querySelector('#chart');
    if (!box || !points.length) return;
    const W = box.clientWidth, H = 240, padL = 34, padR = 14, padT = 26, padB = 26;
    const ws = points.map(p => p.weight);
    let lo = Math.min(...ws), hi = Math.max(...ws);
    if (lo === hi) { lo = Math.max(0, lo - 10); hi = hi + 10; }
    const span = hi - lo; lo = Math.max(0, lo - span * 0.15); hi = hi + span * 0.15;
    const ts = points.map(p => p.date.getTime());
    const t0 = Math.min(...ts), t1 = Math.max(...ts);
    const x = t => (t1 === t0 ? (padL + (W - padL - padR) / 2) : padL + ((t - t0) / (t1 - t0)) * (W - padL - padR));
    const y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
    const pts = points.map(p => [x(p.date.getTime()), y(p.weight)]);
    const grid = [0, 1, 2, 3].map(i => { const v = lo + ((hi - lo) * i) / 3; const yy = y(v);
      return `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,.1)"/><text x="${padL - 6}" y="${yy + 3}" text-anchor="end">${Math.round(v)}</text>`; }).join('');
    const nLabels = Math.min(4, points.length);
    const xl = Array.from({ length: nLabels }, (_, i) => {
      const t = nLabels === 1 ? ts[0] : t0 + ((t1 - t0) * i) / (nLabels - 1);
      return `<text x="${x(t)}" y="${H - 6}" text-anchor="middle">${dfDayMonth.format(new Date(t))}</text>`;
    }).join('');
    const showLabels = points.length <= 12;
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}">
      ${grid}${xl}
      <path d="${catmullRomPath(pts)}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${st.sel === i ? 7 : 4.5}" fill="var(--accent)" ${st.sel === i ? 'stroke="#fff" stroke-width="2"' : ''}/>
        ${showLabels ? `<text class="lbl" x="${p[0]}" y="${p[1] - 10}" text-anchor="middle">${fmtW(points[i].weight)} kg</text>` : ''}`).join('')}
    </svg>`;
    box.onclick = e => {
      const r = box.getBoundingClientRect();
      const cx = e.clientX - r.left;
      let bi = 0; pts.forEach((p, i) => { if (Math.abs(p[0] - cx) < Math.abs(pts[bi][0] - cx)) bi = i; });
      st.sel = st.sel === bi ? null : bi;
      refresh();
    };
  };

  return {
    title: name,
    body: `
      <div class="col g4"><div class="h1" style="font-size:30px">${esc(name)}</div><div class="muted">${esc(ex.muscle)}</div></div>
      <div class="card r18 tinted col g12">
        <div class="row"><span class="accent" style="font-size:24px;display:flex">${ic('trophy')}</span><span class="headline">Persönlicher Rekord</span></div>
        ${best ? `<div style="font-size:30px;font-weight:700">${fmtW(best.weight)} kg × ${best.reps}</div>
          <div class="headline">Geschätztes 1RM: ${fmtW(Math.round(oneRM(best.weight, best.reps) * 10) / 10)} kg</div>
          <div class="sub muted">Deine bisher beste Leistung</div>${progressLine}` : '<div class="muted">Noch kein Rekord vorhanden.</div>'}
      </div>
      <div class="col g16">
        <div class="h2">Trainingsverlauf</div>
        ${sel ? `<div class="card r14 tinted col g4"><span class="sub muted">${fDateTime(sel.date)}</span><span class="h2">${fmtW(sel.weight)} kg</span></div>` : ''}
        ${points.length ? '<div class="chart" id="chart" style="height:240px"></div><div class="caption muted center">Tippe auf einen Punkt für Details</div>' : ''}
        ${workouts.length ? [...workouts].reverse().map(w => `
          <div class="card r16 row top"><div class="col g8" style="flex:1"><span class="sub muted">${fDateTime(w.date)}</span>
            ${w.sets.map(s => `<div><span class="semibold">${fmtW(s.weight)} kg</span> × ${s.reps}</div>`).join('')}</div>
            <button class="icon-btn trash" data-on="${host.on(() => alertDialog({
              title: 'Eintrag löschen?', message: 'Dieser Trainingseintrag wird endgültig gelöscht – auch aus dem zugehörigen Training im Kalender, falls vorhanden.',
              buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Löschen', role: 'destructive', action: () => { st.sel = null; Data.deleteExerciseWorkout(name, w); refresh(); } }]
            }))}">${ic('trash')}</button></div>`).join('')
        : '<div class="muted">Noch kein Verlauf vorhanden.</div>'}
      </div>`,
    after: drawChart
  };
};

/* ---------- Lauf-Stats ---------- */
SCREENS.runs = (entry, host) => {
  const runs = Data.runs();
  const pace = r => (r.distanceKm > 0 ? r.durationSeconds / r.distanceKm : 0);
  const total = runs.reduce((a, r) => a + r.distanceKm, 0);
  const paces = runs.filter(r => r.distanceKm > 0).map(pace);
  const bestPace = paces.length ? Math.min(...paces) : null;
  const sorted = [...runs].sort((a, b) => toDate(b.date) - toDate(a.date));
  const tile = (icon, val, label) => `<div class="col g4" style="flex:1;align-items:center"><span class="accent" style="font-size:20px;display:flex">${ic(icon)}</span><span class="h2">${val}</span><span class="caption muted">${label}</span></div>`;
  return {
    title: 'Lauf-Stats',
    body: `
      <div class="col g4 center"><div class="h1">Lauf-Stats</div><div class="muted">Deine Läufe im Überblick</div></div>
      <div class="card row">${tile('run', fmtDistance(total), 'km gesamt')}<div class="vdivider"></div>${tile('hash', runs.length, 'Läufe')}<div class="vdivider"></div>${tile('bolt', bestPace != null ? fmtPace(bestPace) : '–', 'Beste Pace')}</div>
      <button class="btn-primary" style="border-radius:20px;padding:16px" data-on="${host.on(() => openAddRunSheet(() => refresh()))}">${ic('plusCircle')}<span style="font-size:20px">Lauf hinzufügen</span></button>
      <div class="col g14"><div class="h2">Verlauf</div>
        ${sorted.length ? sorted.map(r => `<div class="card r18 col g8">
            <div class="row"><span class="sub muted" style="flex:1">${fDateTime(r.date)}</span>
              <button class="icon-btn trash" data-on="${host.on(() => { Data.saveRuns(Data.runs().filter(x => x.id !== r.id)); refresh(); })}">${ic('trash')}</button></div>
            <div class="row sub semibold" style="gap:16px;flex-wrap:wrap">
              <span class="row" style="gap:5px">${ic('ruler')}${fmtDistance(r.distanceKm)} km</span>
              <span class="row" style="gap:5px">${ic('timer')}${fmtRunDuration(r.durationSeconds)}</span>
              <span class="row" style="gap:5px">${ic('bolt')}${fmtPace(pace(r))}/km</span></div>
            ${r.note ? `<div class="sub muted">${esc(r.note)}</div>` : ''}
          </div>`).join('')
        : emptyState('runCircle', 'Noch keine Läufe', 'Füge deinen ersten Lauf hinzu, um hier deine Statistiken zu sehen.')}
      </div>`
  };
};

function openAddRunSheet(onSaved) {
  const local = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
  openSheet((sh, host) => {
    const read = () => {
      const q = s => sh.el.querySelector(s);
      const dist = parseNum(q('#r-dist').value);
      const secs = parseIntSafe(q('#r-min').value) * 60 + parseIntSafe(q('#r-sec').value);
      return { dist, secs, date: q('#r-date').value, note: q('#r-note').value };
    };
    const update = () => {
      const { dist, secs } = read();
      const ok = dist > 0 && secs > 0;
      sh.el.querySelector('#r-save').disabled = !ok;
      const pv = sh.el.querySelector('#r-pace');
      pv.style.display = ok ? '' : 'none';
      if (ok) pv.querySelector('span').textContent = `Pace: ${fmtPace(secs / dist)} /km`;
    };
    const save = () => {
      const { dist, secs, date, note } = read();
      if (!(dist > 0 && secs > 0)) return;
      const runs = Data.runs();
      runs.push({ id: uuid(), date: iso(date ? new Date(date) : now()), distanceKm: dist, durationSeconds: secs, note });
      Data.saveRuns(runs);
      sh.close(); onSaved();
    };
    const inp = host.on(update);
    return {
      title: '',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      body: `
        <div class="col g8"><div class="h1">Neuer Lauf</div><div class="muted">Trage Distanz und Zeit deines Laufs ein.</div></div>
        <div><div class="field-label">Datum</div><label class="field"><input id="r-date" type="datetime-local" value="${local(now())}"></label></div>
        <div><div class="field-label">Distanz (km)</div><label class="field"><input id="r-dist" inputmode="decimal" placeholder="5.0" data-in="${inp}"></label></div>
        <div class="grid2">
          <div><div class="field-label">Minuten</div><label class="field"><input id="r-min" inputmode="numeric" pattern="[0-9]*" placeholder="25" data-in="${inp}"></label></div>
          <div><div class="field-label">Sekunden</div><label class="field"><input id="r-sec" inputmode="numeric" pattern="[0-9]*" placeholder="30" data-in="${inp}"></label></div>
        </div>
        <div id="r-pace" class="card r14 tinted row" style="display:none"><span class="accent" style="display:flex">${ic('bolt')}</span><span class="semibold"></span></div>
        <div><div class="field-label">Notiz (optional)</div><label class="field"><input id="r-note" placeholder="z. B. Strecke, Gefühl, Wetter"></label></div>
        <button id="r-save" class="btn-fill" style="font-size:20px;font-weight:700;border-radius:20px" disabled data-on="${host.on(save)}">Lauf speichern</button>`
    };
  });
}


/* ---------- Lexikon ---------- */
const LEX = () => window.LEXIKON || { exercises: {}, articles: [] };
const lexEntryBtn = (host, name) => (LEX().exercises[name]
  ? `<button class="nb-btn" data-on="${host.on(() => push('lexEntry', { name }))}">${ic('book')}<span>Anleitung</span></button>` : '');

SCREENS.lexikon = (entry, host) => {
  const st = entry.state;
  if (!st.tab) { st.tab = entry.params.tab || 'ex'; st.q = ''; }
  const L = LEX();
  const filter = el => {
    st.q = el.value; const term = st.q.trim().toLowerCase();
    screenEl().querySelectorAll('[data-lx-group]').forEach(g => {
      let any = false;
      g.querySelectorAll('[data-lx]').forEach(r => { const hit = !term || r.dataset.lx.includes(term); r.style.display = hit ? '' : 'none'; any = any || hit; });
      g.style.display = any ? '' : 'none';
    });
  };
  let list;
  if (st.tab === 'ex') {
    const all = Pool.all();
    list = MUSCLES.map(m => {
      const items = all.filter(e => e.muscle === m).sort((a, b) => (a.name < b.name ? -1 : 1));
      return `<div data-lx-group><div class="group-title"><span>${m}</span></div><div class="group">
        ${items.map(e => { const d = L.exercises[e.name];
          return `<button class="li" style="padding-top:8px;padding-bottom:8px" data-lx="${esc((e.name + ' ' + (d ? d.primary + ' ' + d.secondary : '')).toLowerCase())}" data-on="${host.on(() => push('lexEntry', { name: e.name }))}">
            ${exImage(e, 36)}<div class="col" style="gap:2px;flex:1;text-align:left"><span>${esc(e.name)}</span><span class="caption muted">${esc(d ? d.primary : 'Eigene Übung')}</span></div><span class="chev">${ic('chevR')}</span></button>`; }).join('')}
      </div></div>`;
    }).join('');
  } else if (st.tab === 'muskeln') {
    const groups = typeof MUSKEL_LEX !== 'undefined' ? MUSKEL_LEX : [];
    const li = (icon, title, fn) => `<button class="li ind" data-lx="${esc(title.toLowerCase())}" data-on="${host.on(fn)}"><span class="ic">${ic(icon)}</span><span style="flex:1">${title}</span><span class="chev">${ic('chevR')}</span></button>`;
    list = `<div data-lx-group><div class="col g12">${groups.map(g => `<div class="card row tap" data-lx="${esc([g.id, g.nick, ...g.muskeln.flatMap(m => [m[0], m[1]])].join(' ').toLowerCase())}" data-on="${host.on(() => push('muscle', { id: g.id }))}">
        <div class="lx-badge">${ic('dumbbell')}</div>
        <div class="col g4" style="flex:1"><div class="row" style="gap:8px"><span class="headline">${esc(g.id)}</span><span class="tag">${esc(g.nick)}</span></div>
          <div class="sub muted">${esc(g.tag)}</div><div class="caption muted">${g.muskeln.length} Muskeln erklärt</div></div>
        <span class="muted">${ic('chevR')}</span></div>`).join('')}</div></div>
      <div data-lx-group><div class="group-title"><span>Kurz erklärt</span></div><div class="group">
        ${li('chartUp', 'So wächst ein Muskel', () => push('lexInfo', { kind: 'grow' }))}
        ${li('hash', 'Begriffe von A bis Z', () => push('lexInfo', { kind: 'terms' }))}
        ${li('info', 'Mythen-Check', () => push('lexInfo', { kind: 'myths' }))}
      </div></div>`;
  } else {
    const cats = [...new Set(L.articles.map(a => a.cat))];
    list = cats.map(c => `<div data-lx-group><div class="group-title"><span>${esc(c)}</span></div><div class="col" style="gap:10px">
      ${L.articles.filter(a => a.cat === c).map(a => `<div class="card r16 row tap" data-lx="${esc((a.title + ' ' + a.teaser).toLowerCase())}" data-on="${host.on(() => push('lexArticle', { id: a.id }))}">
          <span class="accent" style="font-size:24px;display:flex">${ic(a.icon)}</span>
          <div class="col g4" style="flex:1"><span class="headline">${esc(a.title)}</span><span class="sub muted">${esc(a.teaser)}</span></div>
          <span class="muted">${ic('chevR')}</span></div>`).join('')}
    </div></div>`).join('');
  }
  return {
    title: 'Lexikon', large: true,
    body: `
      <div class="segmented">
        <button class="${st.tab === 'ex' ? 'on' : ''}" data-on="${host.on(() => { st.tab = 'ex'; refresh(); })}">Übungen</button>
        <button class="${st.tab === 'muskeln' ? 'on' : ''}" data-on="${host.on(() => { st.tab = 'muskeln'; refresh(); })}">Muskeln</button>
        <button class="${st.tab === 'wissen' ? 'on' : ''}" data-on="${host.on(() => { st.tab = 'wissen'; refresh(); })}">Wissen</button>
      </div>
      <label class="search">${ic('search')}<input placeholder="${st.tab === 'ex' ? 'Übung oder Muskel suchen' : st.tab === 'muskeln' ? 'Muskel suchen, z. B. Latissimus' : 'Thema suchen'}" value="${esc(st.q)}" autocomplete="off" data-in="${host.on(filter)}"></label>
      <div class="list-wrap" style="gap:22px">${list}</div>
      <div class="caption muted center">Allgemeine Trainingsinfos – kein Ersatz für Trainer oder Arzt.</div>`,
    after(el) { const i = el.querySelector('.search input'); if (st.q && i) filter(i); }
  };
};

SCREENS.lexEntry = (entry, host) => {
  const name = entry.params.name;
  const ex = Pool.find(name) || { name, muscle: '', imageName: '' };
  const d = LEX().exercises[name];
  const hasHistory = store.has('history_' + name) && Data.history(name).length;
  const listHTML = (title, icon, cls, items) => `<div class="card r18 col g12"><div class="row"><span class="${cls}" style="display:flex;font-size:20px">${ic(icon)}</span><span class="headline">${title}</span></div>
      ${items.map(t => `<div class="row top sub" style="gap:10px"><span class="${cls}" style="margin-top:1px">•</span><span style="flex:1;line-height:1.4">${esc(t)}</span></div>`).join('')}</div>`;
  return {
    title: name,
    body: `
      <div style="display:flex;justify-content:center">${exImage(ex, 130)}</div>
      <div class="col g4"><div class="h1" style="font-size:28px">${esc(name)}</div><div class="muted">${esc(ex.muscle)}</div></div>
      ${d ? `
        <div class="card r18 col g8">
          <div class="row top"><span class="caption muted" style="width:92px">Hauptmuskel</span><span class="sub semibold" style="flex:1">${esc(d.primary)}</span></div>
          ${d.secondary && d.secondary !== '–' ? `<div class="row top"><span class="caption muted" style="width:92px">Unterstützt</span><span class="sub" style="flex:1">${esc(d.secondary)}</span></div>` : ''}
        </div>
        <div class="col g12"><div class="h2">Ausführung</div>
          ${d.steps.map((t, i) => `<div class="row top" style="gap:12px"><span class="step-num">${i + 1}</span><span class="sub" style="flex:1;line-height:1.45;padding-top:3px">${esc(t)}</span></div>`).join('')}
        </div>
        ${listHTML('Tipps', 'check', 'green', d.tips)}
        ${listHTML('Häufige Fehler', 'x', 'red', d.mistakes)}`
      : emptyState('book', 'Keine Anleitung', 'Für eigene Übungen gibt es noch keine Beschreibung im Lexikon.')}
      ${typeof MUSKEL_LEX !== 'undefined' && MUSKEL_LEX.some(g => g.id === ex.muscle) ? `<div class="card r16 row tap" data-on="${host.on(() => push('muscle', { id: ex.muscle }))}">
          <div class="lx-badge">${ic('book')}</div><div class="col g4" style="flex:1"><span class="headline">Muskelgruppe ${esc(ex.muscle)}</span><span class="sub muted">Was die Muskeln machen, Gegenspieler, Mythen & Tipps</span></div><span class="muted">${ic('chevR')}</span></div>` : ''}
      ${hasHistory ? `<button class="btn-tinted" data-on="${host.on(() => push('exerciseProgress', { name }))}">${ic('chartUp')}<span>Mein Verlauf & Bestleistung</span></button>` : ''}`
  };
};

SCREENS.lexArticle = (entry, host) => {
  const a = LEX().articles.find(x => x.id === entry.params.id);
  if (!a) return { title: 'Lexikon', body: '<div class="muted">Artikel nicht gefunden.</div>' };
  const others = LEX().articles.filter(x => x.cat === a.cat && x.id !== a.id);
  return {
    title: a.title,
    body: `
      <div class="col g8"><span class="caption bold accent" style="text-transform:uppercase;letter-spacing:.4px">${esc(a.cat)}</span>
        <div class="h1" style="font-size:30px">${esc(a.title)}</div><div class="muted">${esc(a.teaser)}</div></div>
      ${a.sections.map(sec => `<div class="col g8 article">
          ${sec.h ? `<div class="h3">${esc(sec.h)}</div>` : ''}
          ${(sec.p || []).map(t => `<p>${esc(t)}</p>`).join('')}
          ${sec.list ? `<div class="col g8">${sec.list.map(t => `<div class="row top" style="gap:10px"><span class="accent">•</span><span style="flex:1">${esc(t)}</span></div>`).join('')}</div>` : ''}
        </div>`).join('')}
      ${others.length ? `<div class="col g12" style="margin-top:8px"><div class="group-title" style="padding:0">Mehr zu ${esc(a.cat)}</div>
        ${others.map(o => `<div class="card r16 row tap" data-on="${host.on(() => push('lexArticle', { id: o.id }))}"><span class="accent" style="font-size:22px;display:flex">${ic(o.icon)}</span><span class="headline" style="flex:1">${esc(o.title)}</span><span class="muted">${ic('chevR')}</span></div>`).join('')}</div>` : ''}`
  };
};

/* ---------- Mehr ---------- */
SCREENS.more = (entry, host) => {
  const li = (icon, title, fn) => `<button class="li ind" data-on="${host.on(fn)}"><span class="ic">${ic(icon)}</span><span style="flex:1">${title}</span><span class="chev">${ic('chevR')}</span></button>`;
  return {
    title: 'Mehr', large: true,
    body: `<div class="list-wrap">
      <div><div class="group-title">Training</div><div class="group">
        ${li('book', 'Lexikon', () => push('lexikon'))}
        ${li('clipboard', 'Trainingspläne', () => push('plans'))}
        ${li('checklist', 'Übungs-Katalog', () => push('catalog'))}
        ${li('run', 'Lauf-Stats', () => push('runs'))}
      </div></div>
      <div><div class="group-title">App</div><div class="group">
        ${li('gear', 'Einstellungen', openSettingsSheet)}
        ${li('backup', 'Backup', openBackupSheet)}
      </div></div>
      <div class="caption muted center">GymLog Web · Daten liegen nur auf diesem Gerät</div>
    </div>`
  };
};

/* ---------- Trainingspläne ---------- */
SCREENS.plans = (entry, host) => {
  const plans = Plans.load();
  const card = p => `<div class="card r18 col g12">
      <div class="row"><span class="headline" style="flex:1">${esc(p.name)}</span>
        <button class="icon-btn" data-on="${host.on(() => openPlanEditor(p, refresh))}">${ic('pencil')}</button>
        <button class="icon-btn trash" data-on="${host.on(() => alertDialog({
          title: 'Plan löschen?', message: 'Dieser Trainingsplan wird endgültig gelöscht.',
          buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Löschen', role: 'destructive', action: () => { Plans.remove(p); refresh(); } }]
        }))}">${ic('trash')}</button></div>
      <div class="sub muted">${p.exerciseNames.length === 1 ? '1 Übung' : p.exerciseNames.length + ' Übungen'}</div>
      <div class="caption muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(sortStr(p.exerciseNames).join(' · '))}</div>
      <button class="btn-fill" style="padding:10px;border-radius:12px;font-size:15px" data-on="${host.on(() => push('session', { planId: p.id }))}">${ic('play')}<span>Training starten</span></button>
    </div>`;
  return {
    title: 'Trainingspläne',
    body: `
      <div class="col g8"><div class="h1">Trainingspläne</div><div class="muted">Stell dir aus deinem Übungs-Pool wiederverwendbare Pläne zusammen und starte dein Training direkt damit.</div></div>
      <button class="btn-fill" style="font-size:20px;font-weight:700;border-radius:20px" data-on="${host.on(() => openPlanEditor(null, refresh))}">${ic('plusCircle')}<span>Neuer Plan</span></button>
      ${plans.length ? plans.map(card).join('') : emptyState('clipboard', 'Noch keine Pläne', 'Erstelle deinen ersten Trainingsplan, um ihn hier jederzeit wieder zu starten.')}`
  };
};

function openPlanEditor(existing, onDone) {
  const st = { name: existing ? existing.name : '', selected: new Set(existing ? existing.exerciseNames : []) };
  openSheet((sh, host) => {
    const canSave = st.name.trim() && st.selected.size;
    const save = () => {
      const name = st.name.trim();
      if (!name || !st.selected.size) return;
      if (existing) Plans.update({ id: existing.id, name, exerciseNames: [...st.selected] });
      else Plans.add({ id: uuid(), name, exerciseNames: [...st.selected] });
      sh.close();
    };
    return {
      title: existing ? 'Plan bearbeiten' : 'Neuer Plan',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      right: `<button class="nb-btn bold" id="pe-save" ${canSave ? '' : 'disabled'} data-on="${host.on(save)}">Speichern</button>`,
      body: `<div class="list-wrap">
        <div><div class="group-title">Name</div><label class="field"><input id="pe-name" placeholder="z. B. Push Day" value="${esc(st.name)}" autocomplete="off" data-in="${host.on(el => {
          st.name = el.value; sh.el.querySelector('#pe-save').disabled = !(st.name.trim() && st.selected.size);
        })}"></label></div>
        <div><div class="group-title">Übungen</div><div class="group">
          <button class="li" data-on="${host.on(() => openExercisePicker({
            title: 'Übungen für Plan', confirmLabel: 'Übernehmen', muscles: null, selected: st.selected,
            onConfirm: sel => { st.selected = sel; sh.render(); }
          }))}"><span style="flex:1">Übungen wählen</span><span class="muted">${st.selected.size ? st.selected.size + ' ausgewählt' : 'keine ausgewählt'}</span><span class="chev">${ic('chevR')}</span></button>
          ${sortStr(st.selected).map(n => `<div class="li muted">${esc(n)}</div>`).join('')}
        </div></div>
      </div>`
    };
  }, { grouped: true, onClose: onDone });
}

/* ---------- Übungs-Katalog ---------- */
SCREENS.catalog = (entry, host) => {
  const st = entry.state;
  if (st.q == null) st.q = '';
  const active = Active.names();
  const all = Pool.all();
  const q = st.q.trim().toLowerCase();
  const sections = MUSCLES.map(m => {
    const inGroup = all.filter(e => e.muscle === m).sort((a, b) => (a.name < b.name ? -1 : 1));
    const shown = q ? inGroup.filter(e => e.name.toLowerCase().includes(q)) : inGroup;
    if (!shown.length) return '';
    const activeCount = inGroup.filter(e => active.has(e.name)).length;
    return `<div data-cat-group><div class="group-title"><span>${m}</span><span style="text-transform:none">${activeCount}/${inGroup.length} aktiv</span></div><div class="group">
      ${shown.map(e => { const on = active.has(e.name);
        return `<button class="li" data-cat-name="${esc(e.name.toLowerCase())}" style="opacity:${on ? 1 : 0.55}" data-on="${host.on(() => { Active.set(e.name, !on); refresh(); })}">
          <span class="${on ? '' : 'muted'}">${esc(e.name)}</span>${e.isCustom ? '<span class="tag">eigene</span>' : ''}<span class="spacer"></span>
          <span style="font-size:22px;display:flex" class="${on ? 'accent' : 'muted'}">${ic(on ? 'checkCircle' : 'circle')}</span></button>`; }).join('')}
    </div></div>`;
  }).join('');
  return {
    title: 'Übungs-Katalog',
    body: `<div class="list-wrap" style="gap:22px">
      <label class="search">${ic('search')}<input id="cat-q" placeholder="Übung suchen" value="${esc(st.q)}" autocomplete="off" data-in="${host.on(el => {
        // Nur filtern (kein Neu-Rendern), damit die Tastatur offen bleibt.
        st.q = el.value; const term = st.q.trim().toLowerCase();
        screenEl().querySelectorAll('[data-cat-group]').forEach(g => {
          let any = false;
          g.querySelectorAll('[data-cat-name]').forEach(r => { const hit = !term || r.dataset.catName.includes(term); r.style.display = hit ? '' : 'none'; any = any || hit; });
          g.style.display = any ? '' : 'none';
        });
      })}"></label>
      <div class="group"><div class="li caption muted" style="padding:12px 16px;line-height:1.4">Wähl aus, welche Übungen du in deinem Pool sehen möchtest. Aktive Übungen sind farbig markiert und tauchen bei der Muskelgruppen-Auswahl und in Trainingsplänen auf – inaktive bleiben hier jederzeit sichtbar, falls du sie später doch noch dazu nehmen willst.</div></div>
      ${sections || '<div class="muted center">Keine Übung gefunden.</div>'}
    </div>`
  };
};

/* ---------- Einstellungen ---------- */
function openSettingsSheet() {
  openSheet((sh, host) => {
    const curr = currentAccent();
    return {
      title: 'Einstellungen', left: '',
      right: `<button class="nb-btn bold" data-on="${host.on(() => sh.close())}">Fertig</button>`,
      body: `<div><div class="group-title">Akzentfarbe</div><div class="group"><div class="swatches">
        ${Object.entries(ACCENTS).map(([k, a]) => `<button class="swatch" data-on="${host.on(() => { store.set('selectedAccentColor', k); applyTheme(); sh.render(); refresh(); })}">
            <span class="c ${k === curr ? 'sel' : ''}" style="background:rgb(${a.rgb});--sw:rgb(${a.rgb})">${k === curr ? ic('check') : ''}</span>
            <span class="caption2 muted">${a.name}</span></button>`).join('')}
      </div></div><div class="group-foot">Gilt sofort für Buttons, Icons und Highlights in der ganzen App.</div></div>
      <div><div class="group-title">Pausen-Timer</div>
        <div class="segmented">${REST_OPTIONS.map(([v, l]) => `<button class="${v === Rest.seconds() ? 'on' : ''}" data-on="${host.on(() => { store.set('restSeconds', v); sh.render(); })}">${l}</button>`).join('')}</div>
        <div class="group-foot">Startet automatisch nach jedem eingetragenen Satz. Läuft lautlos – ohne Ton und ohne Vibration.</div></div>`
    };
  }, { grouped: true });
}

/* ---------- Backup ---------- */
function openBackupSheet() {
  const st = { msg: null, err: false };
  openSheet((sh, host) => {
    const exportBackup = async () => {
      const json = JSON.stringify(Backup.current(), null, 2);
      const d = now();
      const fname = `GymLog-Backup-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}.json`;
      try {
        const file = new File([json], fname, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'GymLog Backup' });
          store.set('lastBackupAt', iso(now())); st.msg = 'Backup erfolgreich exportiert.'; st.err = false; sh.render(); return;
        }
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      store.set('lastBackupAt', iso(now())); st.msg = 'Backup erfolgreich exportiert.'; st.err = false; sh.render();
    };
    const importBackup = () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.json,application/json,text/plain';
      input.onchange = () => {
        const f = input.files && input.files[0];
        if (!f) return;
        alertDialog({
          title: 'Backup wirklich importieren?',
          message: 'Deine aktuell gespeicherten Trainings- und Laufdaten auf diesem Gerät werden dabei überschrieben.',
          buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Importieren', role: 'destructive', action: async () => {
            try {
              Backup.apply(JSON.parse(await f.text()));
              st.msg = 'Backup erfolgreich importiert.'; st.err = false;
            } catch (e) { st.msg = 'Import fehlgeschlagen: ' + (e.message || e); st.err = true; }
            sh.render(); refresh();
          } }]
        });
      };
      input.click();
    };
    return {
      title: '',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Fertig</button>`,
      body: `
        <div class="h1">Backup</div>
        <div class="muted">Sichere alle deine Trainings- und Laufdaten als Datei, oder stelle einen früheren Stand wieder her. Das Format ist dasselbe wie in der iOS-App – du kannst Backups also zwischen App und Web hin und her übertragen.</div>
        <button class="card row tap" style="background:var(--accent);color:#fff;text-align:left" data-on="${host.on(exportBackup)}">
          <span style="font-size:26px;display:flex">${ic('upload')}</span>
          <div class="col g4" style="flex:1"><span class="headline">Backup exportieren</span><span class="sub">Als Datei sichern (Dateien, iCloud Drive, AirDrop, …)</span></div></button>
        <button class="card row tap" style="text-align:left" data-on="${host.on(importBackup)}">
          <span style="font-size:26px;display:flex">${ic('download')}</span>
          <div class="col g4" style="flex:1"><span class="headline">Backup importieren</span><span class="sub muted">Überschreibt deine aktuellen Daten mit dem Stand aus der Datei</span></div></button>
        <div class="install-hint">${ic('info')}<div>Die Web-App speichert alles lokal auf diesem Gerät. Mach ab und zu ein Backup – z. B. bevor du die App vom Home-Bildschirm löschst oder Safari-Daten leerst.</div></div>
        <div class="caption muted center">${store.get('lastBackupAt', null) ? 'Letztes Backup: ' + fDateTime(store.get('lastBackupAt')) : 'Noch kein Backup erstellt'}</div>
        ${st.msg ? `<div class="card r14 row"><span class="${st.err ? 'red' : 'green'}" style="display:flex;font-size:20px">${ic(st.err ? 'info' : 'checkCircle')}</span><span class="sub">${esc(st.msg)}</span></div>` : ''}`
    };
  }, { grouped: true, onClose: () => { if (!sheets.length) refresh(); } });
}

/* =========================================================================
   Start
   ========================================================================= */

function boot() {
  applyTheme();
  Active.seed();
  Plans.seed();
  renderTabbar();
  renderScreen('init');
  screenEl().addEventListener('scroll', onScreenScroll, { passive: true });
  // Beim Zurückkehren in die App (z. B. nach Sperrbildschirm) Daten neu laden.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { sessionTick(); if (!sheets.length && !document.querySelector('input:focus')) refresh(); }
  });
  // Lokalen Speicher als "dauerhaft" markieren, damit der Browser ihn nicht aufräumt.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
boot();
