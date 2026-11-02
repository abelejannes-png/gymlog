/* GymLog – Reiter „Essen": Low-Budget-Protein-Tracker.
 * Zählt Protein und Kosten pro Tag. Preise sind Richtwerte (Discounter, ca.)
 * und lassen sich pro Lebensmittel anpassen. */
'use strict';

ICONS.meal = '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2 1.5-3.2 4-3.2 7.5V13H17"/>';
ICONS.euro = '<path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5M4.5 10.5h9M4.5 13.5h9"/>';
ICONS.flash = '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>';
ICONS.pot = '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2.5 10h19M9 6.5c0-1 .8-1 .8-2M14 6.5c0-1 .8-1 .8-2"/>';

/* ---------- Lebensmittel-Datenbank (günstige Proteinquellen) ----------
 * unit: 'g' / 'ml' → protein = g Protein pro 100 g/ml, pack = Packungsgröße in g/ml
 * unit: 'Stück'    → protein = g Protein pro Stück,      pack = Stück pro Packung
 * price = Packungspreis in € (ca., Discounter) */
const FOODS = [
  { id: 'quark', emoji: '🥛', name: 'Magerquark', unit: 'g', protein: 12, pack: 500, price: 1.29, portion: 250, quick: [125, 250, 500] },
  { id: 'skyr', emoji: '🥣', name: 'Skyr natur', unit: 'g', protein: 11, pack: 450, price: 1.49, portion: 150, quick: [150, 225, 450] },
  { id: 'eier', emoji: '🥚', name: 'Eier (M)', unit: 'Stück', protein: 7, pack: 10, price: 2.79, portion: 2, quick: [1, 2, 3, 4] },
  { id: 'huettenkaese', emoji: '🧀', name: 'Hüttenkäse', unit: 'g', protein: 12, pack: 200, price: 0.99, portion: 200, quick: [100, 200] },
  { id: 'harzer', emoji: '🧀', name: 'Harzer Käse', unit: 'g', protein: 30, pack: 200, price: 1.49, portion: 50, quick: [50, 100, 200] },
  { id: 'milch', emoji: '🥛', name: 'Milch 1,5 %', unit: 'ml', protein: 3.4, pack: 1000, price: 1.09, portion: 300, quick: [200, 300, 500] },
  { id: 'hafer', emoji: '🌾', name: 'Haferflocken', unit: 'g', protein: 13.5, pack: 500, price: 0.89, portion: 60, quick: [40, 60, 100] },
  { id: 'linsen', emoji: '🫘', name: 'Rote Linsen (trocken)', unit: 'g', protein: 24, pack: 500, price: 1.69, portion: 80, quick: [60, 80, 125] },
  { id: 'kidney', emoji: '🫘', name: 'Kidneybohnen (Dose, abgetropft)', unit: 'g', protein: 8, pack: 250, price: 0.79, portion: 125, quick: [125, 250] },
  { id: 'kichererbsen', emoji: '🫛', name: 'Kichererbsen (Dose, abgetropft)', unit: 'g', protein: 7, pack: 240, price: 0.85, portion: 120, quick: [120, 240] },
  { id: 'soja', emoji: '🌱', name: 'Sojaschnetzel (trocken)', unit: 'g', protein: 48, pack: 250, price: 2.49, portion: 50, quick: [30, 50, 75] },
  { id: 'tofu', emoji: '⬜', name: 'Tofu natur', unit: 'g', protein: 15, pack: 400, price: 1.99, portion: 200, quick: [100, 200, 400] },
  { id: 'erdnussbutter', emoji: '🥜', name: 'Erdnussbutter', unit: 'g', protein: 25, pack: 350, price: 2.29, portion: 20, quick: [15, 20, 30] },
  { id: 'thunfisch', emoji: '🐟', name: 'Thunfisch im eigenen Saft', unit: 'g', protein: 25, pack: 120, price: 1.39, portion: 120, quick: [60, 120, 240] },
  { id: 'seelachs', emoji: '🐟', name: 'Seelachsfilet (TK)', unit: 'g', protein: 18, pack: 400, price: 3.49, portion: 125, quick: [125, 200] },
  { id: 'haehnchen', emoji: '🍗', name: 'Hähnchenbrust', unit: 'g', protein: 23, pack: 1000, price: 7.99, portion: 150, quick: [100, 150, 200] },
  { id: 'rinderhack', emoji: '🥩', name: 'Rinderhackfleisch', unit: 'g', protein: 20, pack: 500, price: 4.99, portion: 125, quick: [100, 125, 250] },
  { id: 'nudeln', emoji: '🍝', name: 'Vollkornnudeln (trocken)', unit: 'g', protein: 13, pack: 500, price: 0.99, portion: 125, quick: [100, 125, 150] },
  { id: 'brot', emoji: '🍞', name: 'Vollkornbrot', unit: 'g', protein: 8, pack: 500, price: 1.29, portion: 100, quick: [50, 100, 150] },
  { id: 'whey', emoji: '🥤', name: 'Proteinpulver (Whey)', unit: 'g', protein: 75, pack: 1000, price: 24.99, portion: 30, quick: [15, 30, 45] }
];

/* Günstige High-Protein-Gerichte (Zutaten verweisen auf FOODS-IDs) */
const MEALS = [
  { id: 'quarkbowl', emoji: '🥣', name: 'Quark-Hafer-Bowl', desc: 'Frühstück in 2 Minuten: Quark, Haferflocken, etwas Erdnussbutter. Mit Banane oder TK-Beeren wird es süß.', items: [['quark', 250], ['hafer', 60], ['erdnussbutter', 15]] },
  { id: 'linsenbolo', emoji: '🍝', name: 'Linsen-Bolognese', desc: 'Rote Linsen in Tomatensoße (Passata ca. 0,60 €) 10 Min. köcheln, dazu Vollkornnudeln.', items: [['linsen', 80], ['nudeln', 125]] },
  { id: 'thunfischpasta', emoji: '🐟', name: 'Thunfisch-Pasta', desc: 'Thunfisch in Tomatensoße mit Zwiebel und Knoblauch, über die Nudeln.', items: [['thunfisch', 120], ['nudeln', 125]] },
  { id: 'ruehrei', emoji: '🍳', name: 'Rührei mit Brot', desc: '3 Eier mit einem Schuss Milch, dazu 2 Scheiben Vollkornbrot.', items: [['eier', 3], ['milch', 50], ['brot', 100]] },
  { id: 'chili', emoji: '🌶️', name: 'Chili sin Carne', desc: 'Sojaschnetzel in Brühe einweichen, mit Kidneybohnen, Tomaten und Gewürzen kochen. Gut zum Vorkochen.', items: [['soja', 50], ['kidney', 125]] },
  { id: 'shake', emoji: '🥤', name: 'Protein-Shake', desc: 'Whey mit Milch – schnell nach dem Training.', items: [['whey', 30], ['milch', 300]] },
  { id: 'harzerbrot', emoji: '🧀', name: 'Harzer-Brote', desc: 'Harzer Käse auf Vollkornbrot – extrem viel Protein fürs Geld.', items: [['harzer', 100], ['brot', 100]] },
  { id: 'haehnchenreis', emoji: '🍗', name: 'Hähnchen mit Linsen', desc: 'Gebratene Hähnchenbrust mit Linsen statt Reis – doppelt Protein.', items: [['haehnchen', 150], ['linsen', 60]] }
];

/* ---------- Daten ---------- */
const Meal = {
  log() { return store.get('mealLog', []); },
  saveLog(v) { store.set('mealLog', v); },
  customFoods() { return store.get('mealFoods', []); },
  saveCustomFoods(v) { store.set('mealFoods', v); },
  prices() { return store.get('mealPrices', {}); },
  setPrice(id, price) { const p = Meal.prices(); if (price == null) delete p[id]; else p[id] = price; store.set('mealPrices', p); },
  goal() { return store.get('mealGoal', null); },
  saveGoal(g) { store.set('mealGoal', g); },
  goalGrams() {
    const g = Meal.goal();
    if (!g) return 120;
    if (g.mode === 'fix') return Math.round(g.fix || 120);
    return Math.round((g.weight || 75) * (g.factor || 1.8));
  },
  foods() {
    const prices = Meal.prices();
    return FOODS.concat(Meal.customFoods().map(f => ({ ...f, custom: true })))
      .map(f => ({ ...f, price: prices[f.id] != null ? prices[f.id] : f.price }));
  },
  food(id) { return Meal.foods().find(f => f.id === id); },
  /** Protein (g) und Kosten (€) für eine Menge eines Lebensmittels. */
  calc(f, amount) {
    if (f.unit === 'Stück') return { protein: f.protein * amount, cost: (f.price / f.pack) * amount };
    return { protein: (f.protein * amount) / 100, cost: (f.price / f.pack) * amount };
  },
  /** g Protein pro 1 € */
  perEuro(f) {
    const totalProtein = f.unit === 'Stück' ? f.protein * f.pack : (f.protein * f.pack) / 100;
    return f.price > 0 ? totalProtein / f.price : 0;
  },
  add(entry, dayOffset) {
    const d = new Date();
    if (dayOffset) { d.setDate(d.getDate() + dayOffset); d.setHours(12, 0, 0, 0); }
    const log = Meal.log();
    log.push({ id: uuid(), date: iso(d), ...entry, protein: Math.round(entry.protein * 10) / 10, cost: Math.round((entry.cost || 0) * 100) / 100 });
    Meal.saveLog(log);
  },
  dayEntries(day) { return Meal.log().filter(e => sameDay(toDate(e.date), day)).sort((a, b) => toDate(a.date) - toDate(b.date)); },
  mealTotals(m) {
    return m.items.reduce((acc, [id, amt]) => {
      const f = Meal.food(id); if (!f) return acc;
      const c = Meal.calc(f, amt);
      return { protein: acc.protein + c.protein, cost: acc.cost + c.cost };
    }, { protein: 0, cost: 0 });
  }
};

const eur = v => (v || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const g1 = v => (Math.round(v * 10) / 10).toLocaleString('de-DE');
const amountLabel = (f, a) => (f.unit === 'Stück' ? `${a} Stück` : `${a} ${f.unit}`);

function ringSVG(value, goal, size = 150) {
  const r = (size - 16) / 2, c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const done = value >= goal;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex:none">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14"/>
    ${pct > 0 ? '' : '<!--'}<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${done ? 'var(--green)' : 'var(--accent)'}" stroke-width="14" stroke-linecap="round"
      stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dasharray .5s"/>${pct > 0 ? '' : '-->'}
    <text x="50%" y="46%" text-anchor="middle" fill="#fff" font-size="32" font-weight="700" font-family="ui-rounded,-apple-system,sans-serif">${Math.round(value)}</text>
    <text x="50%" y="62%" text-anchor="middle" fill="rgba(255,255,255,.6)" font-size="13">von ${goal} g</text>
  </svg>`;
}

/* ---------- Haupt-Screen ---------- */
SCREENS.meal = (entry, host) => {
  const st = entry.state;
  if (st.offset == null) st.offset = 0;
  const day = addDays(startOfDay(now()), st.offset);
  const entries = Meal.dayEntries(day);
  const goal = Meal.goalGrams();
  const protein = entries.reduce((a, e) => a + e.protein, 0);
  const cost = entries.reduce((a, e) => a + (e.cost || 0), 0);
  const rest = Math.max(0, goal - protein);
  const dayLabel = st.offset === 0 ? 'Heute' : st.offset === -1 ? 'Gestern' : dfDate.format(day);

  // Woche (7 Tage bis zum gewählten Tag)
  const week = Array.from({ length: 7 }, (_, i) => addDays(day, i - 6));
  const log = Meal.log();
  const weekVals = week.map(d => log.filter(e => sameDay(toDate(e.date), d)).reduce((a, e) => a + e.protein, 0));
  const weekCost = week.map(d => log.filter(e => sameDay(toDate(e.date), d)).reduce((a, e) => a + (e.cost || 0), 0));
  const daysWithData = weekVals.filter(v => v > 0).length;
  const avgProtein = daysWithData ? weekVals.reduce((a, b) => a + b, 0) / daysWithData : 0;
  const avgCost = daysWithData ? weekCost.reduce((a, b) => a + b, 0) / daysWithData : 0;
  const maxV = Math.max(goal, ...weekVals);

  // Günstigste Quellen
  const best = Meal.foods().slice().sort((a, b) => Meal.perEuro(b) - Meal.perEuro(a)).slice(0, 5);

  const entryRow = e => `<div class="card r14 row">
      <div class="col g4" style="flex:1"><span class="headline">${esc(e.name)}</span>
        <span class="caption muted">${fTime(e.date)}${e.amount ? ' · ' + esc(e.amount) : ''}${e.cost ? ' · ' + eur(e.cost) : ''}</span></div>
      <span class="headline accent">${g1(e.protein)} g</span>
      <button class="icon-btn trash" data-on="${host.on(() => { Meal.saveLog(Meal.log().filter(x => x.id !== e.id)); refresh(); })}">${ic('trash')}</button>
    </div>`;

  return {
    title: 'Essen', large: true,
    right: `<button class="nb-btn" data-on="${host.on(openGoalSheet)}">${ic('gear')}</button>`,
    body: `
      ${Meal.goal() ? '' : `<div class="install-hint">${ic('info')}<div class="col g8" style="flex:1"><div><b>Proteinziel festlegen</b><br>Aktuell gilt ein Standardziel von 120 g. Mit deinem Körpergewicht wird es genauer.</div>
        <div><button class="btn-tinted small" data-on="${host.on(openGoalSheet)}">Ziel festlegen</button></div></div></div>`}

      <div class="row" style="justify-content:space-between">
        <button class="circle-btn" data-on="${host.on(() => { st.offset--; refresh(); })}">${ic('chevL')}</button>
        <span class="headline">${dayLabel}</span>
        <button class="circle-btn" ${st.offset >= 0 ? 'disabled style="opacity:.3"' : ''} data-on="${host.on(() => { if (st.offset < 0) { st.offset++; refresh(); } })}">${ic('chevR')}</button>
      </div>

      <div class="card r22 row" style="gap:18px">
        ${ringSVG(protein, goal, 140)}
        <div class="col g12" style="flex:1">
          <div class="col g4"><span class="caption muted">${protein >= goal ? 'Ziel erreicht 💪' : 'Noch offen'}</span><span class="h2">${protein >= goal ? '+' + Math.round(protein - goal) : Math.round(rest)} g</span></div>
          <div class="col g4"><span class="caption muted">Kosten ${dayLabel.toLowerCase() === 'heute' ? 'heute' : ''}</span><span class="h2">${eur(cost)}</span></div>
          ${protein > 0 && cost > 0 ? `<span class="caption muted">${eur((cost / protein) * 100)} pro 100 g Protein</span>` : ''}
        </div>
      </div>

      <div class="grid3">
        <button class="card r16 col g8 tap" style="align-items:center;padding:14px 6px" data-on="${host.on(() => openFoodPicker(st.offset))}"><span class="accent" style="font-size:24px;display:flex">${ic('plusCircle')}</span><span class="caption semibold">Lebensmittel</span></button>
        <button class="card r16 col g8 tap" style="align-items:center;padding:14px 6px" data-on="${host.on(() => openMealsSheet(st.offset))}"><span class="accent" style="font-size:24px;display:flex">${ic('pot')}</span><span class="caption semibold">Gericht</span></button>
        <button class="card r16 col g8 tap" style="align-items:center;padding:14px 6px" data-on="${host.on(() => openQuickSheet(st.offset))}"><span class="accent" style="font-size:24px;display:flex">${ic('flash')}</span><span class="caption semibold">Schnell</span></button>
      </div>

      <div class="col g8"><div class="h2">${dayLabel === 'Heute' ? 'Heute gegessen' : 'Einträge'}</div>
        ${entries.length ? entries.map(entryRow).join('') : `<div class="card r16 sub muted center">Noch nichts eingetragen.</div>`}
      </div>

      <div class="card col g12">
        <div class="row"><span class="headline" style="flex:1">Letzte 7 Tage</span><span class="caption muted">Ziel ${goal} g</span></div>
        <div style="position:relative">
          <div class="bars" style="height:90px">${weekVals.map(v => `<div class="b ${v <= 0 ? 'zero' : ''}" style="height:${v > 0 ? Math.max(4, (v / maxV) * 100) : 0}%;${v >= goal ? 'background:var(--green)' : ''}"></div>`).join('')}</div>
          <div style="position:absolute;left:0;right:0;bottom:${(goal / maxV) * 90}px;border-top:1px dashed rgba(255,255,255,.35)"></div>
        </div>
        <div class="row caption muted">${week.map(d => `<span style="flex:1;text-align:center">${NARROW_WEEKDAYS[mondayOffset(d)]}</span>`).join('')}</div>
        <div class="row sub" style="gap:16px"><span class="muted">Ø Protein <b style="color:#fff">${Math.round(avgProtein)} g</b></span><span class="muted">Ø Kosten <b style="color:#fff">${eur(avgCost)}</b>/Tag</span></div>
      </div>

      <div class="col g8">
        <div class="row"><div class="h2" style="flex:1">Am meisten Protein pro €</div>
          <button class="link" style="font-size:14px" data-on="${host.on(() => push('foods'))}">Alle</button></div>
        ${best.map((f, i) => `<div class="card r14 row tap" data-on="${host.on(() => openAmountSheet(f, st.offset))}">
            <span style="font-size:24px">${f.emoji || '🍽️'}</span>
            <div class="col g4" style="flex:1"><span class="headline">${esc(f.name)}</span><span class="caption muted">${eur(f.price)} / ${f.pack} ${f.unit}</span></div>
            <div class="col" style="gap:0;align-items:flex-end"><span class="headline ${i === 0 ? 'green' : 'accent'}">${Math.round(Meal.perEuro(f))} g</span><span class="caption2 muted">pro 1 €</span></div>
          </div>`).join('')}
      </div>
      <div class="caption muted center">Preise sind ca.-Werte (Discounter) und lassen sich pro Lebensmittel anpassen.</div>`
  };
};

/* ---------- Lebensmittel-Auswahl ---------- */
function openFoodPicker(offset) {
  let q = '';
  openSheet((sh, host) => {
    const foods = Meal.foods().slice().sort((a, b) => Meal.perEuro(b) - Meal.perEuro(a));
    return {
      title: 'Lebensmittel',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      body: `
        <label class="search">${ic('search')}<input placeholder="Suchen" value="${esc(q)}" autocomplete="off" data-in="${host.on(el => {
          q = el.value.trim().toLowerCase();
          sh.el.querySelectorAll('[data-fn]').forEach(r => { r.style.display = !q || r.dataset.fn.includes(q) ? '' : 'none'; });
        })}"></label>
        <div class="group">${foods.map(f => `<button class="li" data-fn="${esc(f.name.toLowerCase())}" style="padding-top:8px;padding-bottom:8px" data-on="${host.on(() => { sh.close(); openAmountSheet(f, offset); })}">
            <span style="font-size:22px">${f.emoji || '🍽️'}</span>
            <div class="col" style="gap:2px;flex:1;text-align:left"><span>${esc(f.name)}</span><span class="caption muted">${g1(f.protein)} g Protein / ${f.unit === 'Stück' ? 'Stück' : '100 ' + f.unit} · ${Math.round(Meal.perEuro(f))} g pro €</span></div>
            <span class="chev">${ic('chevR')}</span></button>`).join('')}</div>
        <button class="btn-tinted" data-on="${host.on(() => openCustomFoodSheet(() => sh.render()))}">${ic('plus')}<span>Eigenes Lebensmittel anlegen</span></button>`
    };
  }, { grouped: true });
}

function openAmountSheet(food, offset) {
  const st = { amount: food.portion, editPrice: false };
  openSheet((sh, host) => {
    const f = Meal.food(food.id) || food;
    const c = Meal.calc(f, st.amount || 0);
    const upd = () => {
      const a = parseNum(sh.el.querySelector('#am-in').value);
      st.amount = isNaN(a) ? 0 : a;
      const r = Meal.calc(f, st.amount);
      sh.el.querySelector('#am-p').textContent = `${g1(r.protein)} g`;
      sh.el.querySelector('#am-c').textContent = eur(r.cost);
      sh.el.querySelector('#am-add').disabled = !(st.amount > 0);
    };
    const add = () => {
      if (!(st.amount > 0)) return;
      const r = Meal.calc(f, st.amount);
      Meal.add({ name: f.name, amount: amountLabel(f, st.amount), protein: r.protein, cost: r.cost, foodId: f.id }, offset);
      sh.close(); toast(`+${g1(r.protein)} g Protein`); refresh();
    };
    return {
      title: '',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      body: `
        <div class="row" style="gap:14px"><span style="font-size:44px">${f.emoji || '🍽️'}</span>
          <div class="col g4"><div class="h2">${esc(f.name)}</div><div class="sub muted">${g1(f.protein)} g Protein pro ${f.unit === 'Stück' ? 'Stück' : '100 ' + f.unit}</div></div></div>
        <div><div class="field-label">Menge</div><label class="field"><input id="am-in" inputmode="decimal" value="${st.amount}" data-in="${host.on(upd)}"><span class="unit">${f.unit}</span></label></div>
        <div class="row" style="flex-wrap:wrap;gap:8px">${(f.quick || [f.portion]).map(q => `<button class="btn-tinted small" data-on="${host.on(() => { st.amount = q; sh.render(); })}">${amountLabel(f, q)}</button>`).join('')}</div>
        <div class="grid2">
          <div class="card r16 col g4"><span class="caption muted">Protein</span><span class="h2 accent" id="am-p">${g1(c.protein)} g</span></div>
          <div class="card r16 col g4"><span class="caption muted">Kosten</span><span class="h2" id="am-c">${eur(c.cost)}</span></div>
        </div>
        <button id="am-add" class="btn-fill" ${st.amount > 0 ? '' : 'disabled'} data-on="${host.on(add)}">${ic('plus')}<span>Hinzufügen</span></button>
        <div class="card r16 col g8">
          <div class="row"><span class="sub muted" style="flex:1">Packung: ${f.pack} ${f.unit} für <b style="color:#fff">${eur(f.price)}</b></span>
            <button class="link" style="font-size:14px" data-on="${host.on(() => { st.editPrice = !st.editPrice; sh.render(); })}">${st.editPrice ? 'Schließen' : 'Preis ändern'}</button></div>
          ${st.editPrice ? `<div class="row" style="gap:8px"><label class="field small" style="flex:1"><input id="am-price" inputmode="decimal" value="${String(f.price).replace('.', ',')}"></label><span class="sub muted">€</span>
            <button class="btn-tinted small" data-on="${host.on(() => {
              const v = parseNum(sh.el.querySelector('#am-price').value);
              if (!(v >= 0)) return;
              if (f.custom) { const list = Meal.customFoods(); const x = list.find(y => y.id === f.id); if (x) x.price = v; Meal.saveCustomFoods(list); }
              else Meal.setPrice(f.id, v);
              st.editPrice = false; sh.render(); refresh();
            })}">Speichern</button></div>
            ${!f.custom && Meal.prices()[f.id] != null ? `<button class="caption muted" style="text-align:left" data-on="${host.on(() => { Meal.setPrice(f.id, null); st.editPrice = false; sh.render(); refresh(); })}">Auf Standardpreis zurücksetzen</button>` : ''}` : ''}
        </div>`,
      after(el) { const i = el.querySelector('#am-in'); if (i) i.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }); }
    };
  }, { grouped: true });
}

/* ---------- Gerichte ---------- */
function openMealsSheet(offset) {
  openSheet((sh, host) => ({
    title: 'Günstige Gerichte',
    left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Fertig</button>`,
    body: `<div class="sub muted">Einfache High-Protein-Gerichte für wenig Geld. Werte pro Portion, Gewürze und Soße nicht eingerechnet.</div>
      ${MEALS.slice().sort((a, b) => { const A = Meal.mealTotals(a), B = Meal.mealTotals(b); return (B.protein / B.cost) - (A.protein / A.cost); }).map(m => {
        const t = Meal.mealTotals(m);
        return `<div class="card r18 col g12">
          <div class="row" style="gap:12px"><span style="font-size:30px">${m.emoji}</span>
            <div class="col g4" style="flex:1"><span class="headline">${esc(m.name)}</span><span class="caption muted">${m.items.map(([id, a]) => { const f = Meal.food(id); return f ? amountLabel(f, a) + ' ' + f.name.replace(/ \(.*\)/, '') : ''; }).join(' · ')}</span></div></div>
          <div class="sub muted" style="line-height:1.4">${esc(m.desc)}</div>
          <div class="row"><span class="headline accent">${Math.round(t.protein)} g Protein</span><span class="sub muted" style="flex:1">· ${eur(t.cost)}</span>
            <button class="btn-tinted small" data-on="${host.on(() => {
              Meal.add({ name: m.name, amount: '1 Portion', protein: t.protein, cost: t.cost, mealId: m.id }, offset);
              toast(`${m.name}: +${Math.round(t.protein)} g Protein`); refresh();
            })}">${ic('plus')} Eintragen</button></div>
        </div>`;
      }).join('')}`
  }), { grouped: true });
}

/* ---------- Schnell-Eintrag ---------- */
function openQuickSheet(offset) {
  openSheet((sh, host) => {
    const save = () => {
      const q = s => sh.el.querySelector(s).value;
      const p = parseNum(q('#qs-p'));
      if (!(p > 0)) { toast('Bitte Protein in Gramm eintragen'); return; }
      const c = parseNum(q('#qs-c'));
      Meal.add({ name: q('#qs-n').trim() || 'Schnell-Eintrag', amount: '', protein: p, cost: isNaN(c) ? 0 : c }, offset);
      sh.close(); toast(`+${g1(p)} g Protein`); refresh();
    };
    return {
      title: 'Schnell eintragen',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      right: `<button class="nb-btn bold" data-on="${host.on(save)}">Hinzufügen</button>`,
      body: `
        <div class="sub muted">Für alles, was nicht in der Liste ist – z. B. Mensa, Döner oder ein Proteinriegel. Den Proteinwert findest du meist auf der Verpackung.</div>
        <div><div class="field-label">Was?</div><label class="field"><input id="qs-n" placeholder="z. B. Mensa Hähnchen-Curry" autocomplete="off"></label></div>
        <div class="grid2">
          <div><div class="field-label">Protein</div><label class="field"><input id="qs-p" inputmode="decimal" placeholder="30"><span class="unit">g</span></label></div>
          <div><div class="field-label">Kosten (optional)</div><label class="field"><input id="qs-c" inputmode="decimal" placeholder="3,50"><span class="unit">€</span></label></div>
        </div>`
    };
  }, { grouped: true });
}

/* ---------- Eigenes Lebensmittel ---------- */
function openCustomFoodSheet(onDone) {
  const st = { unit: 'g', err: null };
  openSheet((sh, host) => {
    const save = () => {
      const q = s => sh.el.querySelector(s).value;
      const name = q('#cf-n').trim();
      const protein = parseNum(q('#cf-p')), pack = parseNum(q('#cf-s')), price = parseNum(q('#cf-pr'));
      if (!name || !(protein >= 0) || !(pack > 0) || !(price >= 0)) { st.err = 'Bitte alle Felder ausfüllen.'; sh.render(); return; }
      const list = Meal.customFoods();
      list.push({ id: 'c_' + uuid(), emoji: '🍽️', name, unit: st.unit, protein, pack, price,
        portion: st.unit === 'Stück' ? 1 : 100, quick: st.unit === 'Stück' ? [1, 2, 3] : [50, 100, 200] });
      Meal.saveCustomFoods(list);
      sh.close(); if (onDone) onDone(); refresh();
    };
    return {
      title: 'Eigenes Lebensmittel',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      right: `<button class="nb-btn bold" data-on="${host.on(save)}">Speichern</button>`,
      body: `
        <div><div class="field-label">Name</div><label class="field"><input id="cf-n" placeholder="z. B. Proteinpudding" autocomplete="off"></label></div>
        <div><div class="field-label">Einheit</div><div class="segmented">${['g', 'ml', 'Stück'].map(u => `<button class="${st.unit === u ? 'on' : ''}" data-on="${host.on(() => {
          ['cf-n', 'cf-p', 'cf-s', 'cf-pr'].forEach(id => { st[id] = sh.el.querySelector('#' + id).value; }); st.unit = u; sh.render();
          ['cf-n', 'cf-p', 'cf-s', 'cf-pr'].forEach(id => { sh.el.querySelector('#' + id).value = st[id] || ''; });
        })}">${u}</button>`).join('')}</div></div>
        <div><div class="field-label">Protein ${st.unit === 'Stück' ? 'pro Stück' : 'pro 100 ' + st.unit} (steht auf der Packung)</div><label class="field"><input id="cf-p" inputmode="decimal" placeholder="10"><span class="unit">g</span></label></div>
        <div class="grid2">
          <div><div class="field-label">Packungsgröße</div><label class="field"><input id="cf-s" inputmode="decimal" placeholder="${st.unit === 'Stück' ? '4' : '500'}"><span class="unit">${st.unit}</span></label></div>
          <div><div class="field-label">Packungspreis</div><label class="field"><input id="cf-pr" inputmode="decimal" placeholder="1,99"><span class="unit">€</span></label></div>
        </div>
        ${st.err ? `<div class="sub red">${esc(st.err)}</div>` : ''}`
    };
  }, { grouped: true });
}

/* ---------- Ziel ---------- */
function openGoalSheet() {
  const g = Meal.goal() || { mode: 'kg', weight: '', factor: 1.8, fix: 120 };
  const st = { ...g };
  openSheet((sh, host) => {
    const preview = () => {
      if (st.mode === 'fix') return Math.round(parseNum(st.fix) || 0);
      return Math.round((parseNum(st.weight) || 0) * st.factor);
    };
    const read = () => {
      const w = sh.el.querySelector('#gl-w'); if (w) st.weight = w.value;
      const f = sh.el.querySelector('#gl-f'); if (f) st.fix = f.value;
    };
    const save = () => {
      read();
      if (st.mode === 'kg' && !(parseNum(st.weight) > 0)) { toast('Bitte Körpergewicht eintragen'); return; }
      if (st.mode === 'fix' && !(parseNum(st.fix) > 0)) { toast('Bitte Ziel eintragen'); return; }
      Meal.saveGoal({ mode: st.mode, weight: parseNum(st.weight) || null, factor: st.factor, fix: parseNum(st.fix) || null });
      sh.close(); refresh();
    };
    const live = host.on(() => { read(); const p = sh.el.querySelector('#gl-prev'); if (p) p.textContent = `${preview()} g pro Tag`; });
    return {
      title: 'Proteinziel',
      left: `<button class="nb-btn" data-on="${host.on(() => sh.close())}">Abbrechen</button>`,
      right: `<button class="nb-btn bold" data-on="${host.on(save)}">Speichern</button>`,
      body: `
        <div class="segmented">
          <button class="${st.mode === 'kg' ? 'on' : ''}" data-on="${host.on(() => { read(); st.mode = 'kg'; sh.render(); })}">Nach Körpergewicht</button>
          <button class="${st.mode === 'fix' ? 'on' : ''}" data-on="${host.on(() => { read(); st.mode = 'fix'; sh.render(); })}">Fester Wert</button>
        </div>
        ${st.mode === 'kg' ? `
          <div><div class="field-label">Körpergewicht</div><label class="field"><input id="gl-w" inputmode="decimal" placeholder="75" value="${esc(st.weight || '')}" data-in="${live}"><span class="unit">kg</span></label></div>
          <div><div class="field-label">Gramm Protein pro kg</div><div class="segmented">${[1.6, 1.8, 2.0, 2.2].map(v => `<button class="${st.factor === v ? 'on' : ''}" data-on="${host.on(() => { read(); st.factor = v; sh.render(); })}">${String(v).replace('.', ',')}</button>`).join('')}</div>
            <div class="group-foot" style="padding-left:0">Für Muskelaufbau werden häufig 1,6–2,2 g pro kg Körpergewicht empfohlen. 1,6–1,8 reicht für die meisten.</div></div>`
        : `<div><div class="field-label">Ziel pro Tag</div><label class="field"><input id="gl-f" inputmode="numeric" placeholder="140" value="${esc(st.fix || '')}" data-in="${live}"><span class="unit">g</span></label></div>`}
        <div class="card r16 row"><span class="sub muted" style="flex:1">Dein Ziel</span><span class="h2 accent" id="gl-prev">${preview()} g pro Tag</span></div>
        <div class="caption muted">Allgemeine Richtwerte. Bei Nierenerkrankungen oder anderen Vorerkrankungen das Ziel bitte ärztlich abklären.</div>`
    };
  }, { grouped: true });
}

/* ---------- Alle Lebensmittel & Preise ---------- */
SCREENS.foods = (entry, host) => {
  const foods = Meal.foods().slice().sort((a, b) => Meal.perEuro(b) - Meal.perEuro(a));
  return {
    title: 'Lebensmittel',
    body: `
      <div class="col g8"><div class="h1" style="font-size:30px">Protein pro Euro</div>
        <div class="muted">Sortiert danach, wie viel Protein du für 1 € bekommst. Tipp auf ein Lebensmittel, um es einzutragen oder den Preis anzupassen.</div></div>
      ${foods.map((f, i) => `<div class="card r14 row tap" data-on="${host.on(() => openAmountSheet(f, 0))}">
          <span class="caption muted" style="width:18px;text-align:right">${i + 1}</span>
          <span style="font-size:24px">${f.emoji || '🍽️'}</span>
          <div class="col g4" style="flex:1"><span class="headline">${esc(f.name)}${f.custom ? ' <span class="tag">eigene</span>' : ''}</span>
            <span class="caption muted">${g1(f.protein)} g / ${f.unit === 'Stück' ? 'Stück' : '100 ' + f.unit} · ${eur(f.price)} / ${f.pack} ${f.unit}${Meal.prices()[f.id] != null ? ' ✎' : ''}</span></div>
          <div class="col" style="gap:0;align-items:flex-end"><span class="headline ${i < 3 ? 'green' : 'accent'}">${Math.round(Meal.perEuro(f))} g</span><span class="caption2 muted">pro 1 €</span></div>
          ${f.custom ? `<button class="icon-btn trash" data-on="${host.on(() => alertDialog({ title: 'Lebensmittel löschen?', message: f.name,
            buttons: [{ label: 'Abbrechen', role: 'cancel' }, { label: 'Löschen', role: 'destructive', action: () => { Meal.saveCustomFoods(Meal.customFoods().filter(x => x.id !== f.id)); refresh(); } }] }))}">${ic('trash')}</button>` : ''}
        </div>`).join('')}
      <button class="btn-tinted" data-on="${host.on(() => openCustomFoodSheet())}">${ic('plus')}<span>Eigenes Lebensmittel anlegen</span></button>
      <div class="caption muted center">Preise: ca.-Werte deutscher Discounter, schwanken je nach Laden und Angebot.</div>`
  };
};

/* ---------- Home-Karte ---------- */
function mealHomeCard(host) {
  const today = Meal.dayEntries(now());
  const p = today.reduce((a, e) => a + e.protein, 0);
  const goal = Meal.goalGrams();
  const pct = Math.min(100, (p / goal) * 100);
  return `<div class="card r18 col g8 tap" data-on="${host.on(() => switchTab('meal'))}">
      <div class="row"><span class="accent" style="display:flex">${ic('meal')}</span><span class="caption muted" style="flex:1">Protein heute</span><span class="muted">${ic('chevR')}</span></div>
      <div class="row base"><span class="h1" style="font-size:28px">${Math.round(p)}</span><span class="sub muted">/ ${goal} g</span></div>
      <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${pct}%;background:${p >= goal ? 'var(--green)' : 'var(--accent)'}"></div></div>
    </div>`;
}

// Tab-Leiste neu zeichnen, damit der Essen-Reiter erscheint (app.js lief vorher).
renderTabbar();
refresh(); // Home-Karte „Protein heute" anzeigen
