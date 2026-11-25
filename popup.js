'use strict';
(() => {
  // ───────────────────────── helpers ─────────────────────────
  const $ = (s, r = document) => r.querySelector(s);

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    const late = [];
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled') late.push([k, v]);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    for (const [k, v] of late) el[k] = v;
    return el;
  }

  const DEFAULTS = {
    filters: { diet: 'any', maxTime: 0, cuisine: 'any', pantry: '' },
    servings: 2, favorites: [], history: [], custom: [], week: null, last: null, cook: null
  };
  const FRESH_MS = 6 * 3600 * 1000;
  let S = structuredClone(DEFAULTS);
  let timers = [];
  const ui = {
    tab: 'tonight', dishId: null, spinning: false, rejected: new Set(), cook: null,
    grocery: false, groceryChecked: new Set(), filtersOpen: false, spinTimer: null
  };

  const allDishes = () => DISHES.concat(S.custom);
  const byId = (id) => allDishes().find((d) => d.id === id);
  const save = () => chrome.storage.local.set({ dd: S });
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────────────────────── diet + filtering ─────────────────────────
  const MEATS = ['chicken', 'beef', 'pork', 'seafood'];
  const DIETS = {
    any: { label: 'Anything', ok: () => true },
    veg: { label: 'Vegetarian', ok: (d) => !d.m.some((x) => MEATS.includes(x)) },
    vegan: { label: 'Vegan', ok: (d) => d.m.length === 0 },
    nopork: { label: 'No pork', ok: (d) => !d.m.includes('pork') },
    nobeef: { label: 'No beef', ok: (d) => !d.m.includes('beef') },
    noseafood: { label: 'No fish or shellfish', ok: (d) => !d.m.includes('seafood') }
  };

  function eligible() {
    const f = S.filters;
    return allDishes().filter((d) =>
      (DIETS[f.diet] || DIETS.any).ok(d) &&
      (!f.maxTime || d.t <= f.maxTime) &&
      (f.cuisine === 'any' || d.c === f.cuisine));
  }

  function dietTag(d) {
    if (d.m.length === 0) return 'Vegan';
    if (!d.m.some((x) => MEATS.includes(x))) return 'Vegetarian';
    return null;
  }

  // ───────────────────────── pantry matching ─────────────────────────
  const baseName = (n) => n.split('|')[0];

  function pantryTokens() {
    const out = [];
    for (const raw of S.filters.pantry.toLowerCase().split(/[,;\n]+/)) {
      const t = raw.trim();
      if (t.length < 3) continue;
      out.push(t, t.replace(/es$/, ''), t.replace(/s$/, ''));
    }
    return [...new Set(out)].filter((t) => t.length >= 3);
  }

  function pantryScore(d, toks) {
    const items = d.ing.filter((i) => !i[3]);
    if (!toks.length || !items.length) return { have: 0, total: items.length };
    let have = 0;
    for (const i of items) {
      const nm = baseName(i[0]).toLowerCase();
      if (toks.some((t) => nm.includes(t))) have++;
    }
    return { have, total: items.length };
  }

  // ───────────────────────── picking ─────────────────────────
  function weight(d, toks) {
    let w = 1;
    if (S.favorites.includes(d.id)) w *= 2;
    const last = S.history.find((x) => x.id === d.id);
    if (last) {
      const days = (Date.now() - last.ts) / 864e5;
      if (days < 3) w *= 0.1; else if (days < 7) w *= 0.5;
    }
    if (toks.length) {
      const { have, total } = pantryScore(d, toks);
      if (total) w *= 1 + 4 * (have / total);
    }
    return w;
  }

  function weightedPick(pool, toks) {
    const ws = pool.map((d) => weight(d, toks));
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  function decide() {
    const pool = eligible();
    if (!pool.length) { toast('No dishes match these filters. Try loosening them.'); return; }
    let avail = pool.filter((d) => !ui.rejected.has(d.id));
    if (!avail.length) { ui.rejected.clear(); avail = pool; toast('That\'s everything. Starting over!'); }
    const pick = weightedPick(avail, pantryTokens());
    clearInterval(ui.spinTimer);
    if (reduceMotion()) { setCurrent(pick.id); render(); return; }
    ui.spinning = true;
    ui.tab = 'tonight';
    render();
    let n = 0;
    ui.spinTimer = setInterval(() => {
      const el = $('#spinText');
      if (el) { const r = pool[Math.floor(Math.random() * pool.length)]; el.textContent = r.e + ' ' + r.n; }
      if (++n >= 14) {
        clearInterval(ui.spinTimer);
        ui.spinning = false;
        setCurrent(pick.id);
        render();
      }
    }, 80);
  }

  function setCurrent(id) {
    ui.dishId = id;
    S.last = id ? { id, ts: Date.now() } : null;
    save();
  }

  // ───────────────────────── quantities ─────────────────────────
  function fmtQty(q) {
    if (q >= 100) return String(Math.round(q / 10) * 10);
    if (q >= 10) return String(Math.round(q));
    const r = Math.max(0.25, Math.round(q * 4) / 4);
    const w = Math.floor(r);
    const f = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' }[r - w];
    return w === 0 ? f : w + f;
  }

  function ingText(name, qty, unit) {
    const [sing, plur] = name.split('|');
    if (!qty) return sing + ' (to taste)';
    const nm = plur && qty > 1 ? plur : sing;
    const u = unit === 'cup' && qty > 1 ? 'cups' : unit;
    return [fmtQty(qty), u, nm].filter(Boolean).join(' ');
  }

  const scaled = (i) => ingText(i[0], i[1] * (S.servings / 2) || 0, i[2]);

  // ───────────────────────── timers ─────────────────────────
  async function startTimer(sec, label, dish, key) {
    const t = {
      id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
      label, dish, key, total: sec, endsAt: Date.now() + sec * 1000
    };
    timers.push(t);
    await chrome.storage.local.set({ timers });
    chrome.alarms.create('timer:' + t.id, { when: t.endsAt });
    renderTimers();
    if (ui.cook) render(true);
  }

  async function cancelTimer(id) {
    timers = timers.filter((t) => t.id !== id);
    await chrome.storage.local.set({ timers });
    chrome.alarms.clear('timer:' + id);
    renderTimers();
    if (ui.cook) render(true);
  }

  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  function renderTimers() {
    const ul = $('#tlist');
    ul.replaceChildren(...timers.map((t) => {
      const left = Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000));
      return h('li', {},
        h('span', { class: 'tl', text: t.label + (t.dish ? ' · ' + t.dish : '') }),
        h('span', { class: 'tt' + (left ? '' : ' fin'), text: left ? mmss(left) : 'Done!' }),
        h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Cancel timer ' + t.label, onclick: () => cancelTimer(t.id), text: '✕' }));
    }));
  }

  // ───────────────────────── small UI bits ─────────────────────────
  function toast(msg) {
    document.querySelectorAll('.toast').forEach((n) => n.remove());
    const el = h('div', { class: 'toast', role: 'status', text: msg });
    document.body.append(el);
    setTimeout(() => el.remove(), 2400);
  }

  function stepper(value, min, max, onChange, label) {
    const out = h('output', { 'aria-live': 'polite', text: String(value) });
    return h('span', { class: 'stepper', role: 'group', 'aria-label': label },
      h('button', { type: 'button', 'aria-label': 'Fewer', disabled: value <= min, onclick: () => onChange(value - 1), text: '−' }),
      out,
      h('button', { type: 'button', 'aria-label': 'More', disabled: value >= max, onclick: () => onChange(value + 1), text: '+' }));
  }

  function fieldSelect(id, label, options, value, onChange) {
    return h('div', { class: 'field' },
      h('label', { for: id, text: label }),
      h('select', { id, value, onchange: (e) => onChange(e.target.value) },
        options.map(([v, t]) => h('option', { value: v, text: t }))));
  }

  const chips = (d) => h('div', { class: 'chips' },
    h('span', { class: 'chip', text: d.c }), h('span', { class: 'chip', text: d.t + ' min' }),
    dietTag(d) && h('span', { class: 'chip', text: dietTag(d) }));

  function toggleFav(id) {
    S.favorites = S.favorites.includes(id) ? S.favorites.filter((x) => x !== id) : [...S.favorites, id];
    save(); render(true);
  }

  function startCook(id) {
    ui.tab = 'tonight'; ui.grocery = false;
    ui.cook = { id, done: new Set(), have: new Set() };
    persistCook(); render();
  }

  function persistCook() {
    S.cook = ui.cook ? { id: ui.cook.id, done: [...ui.cook.done], have: [...ui.cook.have], ts: Date.now() } : null;
    save();
  }

  // ───────────────────────── Tonight tab ─────────────────────────
  function filtersPanel() {
    const f = S.filters;
    const cuisines = [...new Set(allDishes().map((d) => d.c))].sort();
    const active = [
      f.diet !== 'any' && DIETS[f.diet].label, f.maxTime && 'under ' + f.maxTime + ' min',
      f.cuisine !== 'any' && f.cuisine, pantryTokens().length && 'pantry'
    ].filter(Boolean);
    const set = (k, v) => { S.filters[k] = v; save(); };
    return h('details', { class: 'filters', open: ui.filtersOpen, ontoggle: (e) => { ui.filtersOpen = e.target.open; } },
      h('summary', {}, 'Filters ', h('span', { class: 'meta', text: active.length ? '· ' + active.join(', ') : '· none' })),
      fieldSelect('fDiet', 'Diet', Object.entries(DIETS).map(([k, v]) => [k, v.label]), f.diet, (v) => { set('diet', v); render(true); }),
      h('div', { class: 'two' },
        fieldSelect('fTime', 'Time', [['0', 'Any time'], ['20', 'Under 20 min'], ['30', 'Under 30 min'], ['45', 'Under 45 min']], String(f.maxTime), (v) => { set('maxTime', Number(v)); render(true); }),
        fieldSelect('fCuisine', 'Cuisine', [['any', 'Any cuisine'], ...cuisines.map((c) => [c, c])], f.cuisine, (v) => { set('cuisine', v); render(true); })),
      h('div', { class: 'field' },
        h('label', { for: 'fPantry', text: 'What\'s in your kitchen? (optional)' }),
        h('input', { id: 'fPantry', type: 'text', maxlength: '200', placeholder: 'e.g. eggs, rice, tomato', value: f.pantry,
          onchange: (e) => { set('pantry', e.target.value); render(true); } })),
      h('div', { class: 'field' },
        h('span', { class: 'lbl', text: 'Servings' }),
        stepper(S.servings, 1, 8, (v) => { S.servings = v; save(); render(true); }, 'Servings')),
      h('p', { class: 'hint', text: 'Diet filters go by main ingredients only. Always check labels if you have allergies.' }));
  }

  function resultCard(d) {
    const ps = pantryScore(d, pantryTokens());
    const fav = S.favorites.includes(d.id);
    return h('div', { class: 'card result' },
      h('div', { class: 'big', 'aria-hidden': 'true', text: d.e }),
      h('h2', { text: d.n }),
      chips(d),
      ps.have > 0 && h('p', { class: 'pantry', text: 'You have ' + ps.have + ' of ' + ps.total + ' main ingredients' }),
      d.custom ? h('p', { class: 'meta', text: d.note || 'One of your own meals.' }) :
        h('details', {}, h('summary', { text: 'Ingredients for ' + S.servings }),
          h('ul', { class: 'plain ing' }, d.ing.filter((i) => !i[3]).map((i) => h('li', { text: scaled(i) })))),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', onclick: () => startCook(d.id), text: d.custom ? '👩‍🍳 Let\'s cook' : '👩‍🍳 Cook this' }),
        h('button', { type: 'button', class: 'btn', onclick: () => { ui.rejected.add(d.id); decide(); }, text: '🔄 Not this one' }),
        h('button', { type: 'button', class: 'btn', 'aria-pressed': String(fav), 'aria-label': fav ? 'Remove from saved' : 'Save dish', onclick: () => toggleFav(d.id), text: fav ? '★ Saved' : '☆ Save' })));
  }

  function tonightView() {
    const root = h('div', { class: 'stack' });
    const d = ui.dishId && byId(ui.dishId);
    if (ui.spinning) {
      root.append(h('div', { class: 'card spin', role: 'status' }, h('div', { class: 'big', id: 'spinText', text: '🍽️ Choosing…' })));
    } else if (d) {
      root.append(resultCard(d));
    } else {
      root.append(h('div', { class: 'card hero' },
        h('div', { class: 'big', 'aria-hidden': 'true', text: '🍽️' }),
        h('p', { text: 'Tired of deciding? One tap and I\'ll pick tonight\'s dinner.' }),
        h('button', { type: 'button', class: 'btn primary lg', onclick: decide, text: 'Decide for me' })));
    }
    root.append(filtersPanel());
    return root;
  }

  // ───────────────────────── Cook view ─────────────────────────
  function cookView() {
    const d = byId(ui.cook.id);
    if (!d) { ui.cook = null; S.cook = null; return tonightView(); }
    const steps = d.steps || [];
    const done = ui.cook.done;
    const root = h('div', { class: 'stack' });
    root.append(h('div', { class: 'row between' },
      h('button', { type: 'button', class: 'btn small', onclick: () => { ui.cook = null; persistCook(); render(); }, text: '← Back' }),
      h('span', { class: 'meta' }, 'Servings ', stepper(S.servings, 1, 8, (v) => { S.servings = v; save(); render(true); }, 'Servings'))));
    root.append(h('h2', {}, d.e + ' ' + d.n));

    if (steps.length) {
      root.append(h('progress', { max: String(steps.length), value: String(done.size), 'aria-label': 'Cooking progress' }),
        h('p', { class: 'meta', text: done.size + ' of ' + steps.length + ' steps done' }));
      root.append(h('h3', { text: 'Ingredients' }),
        h('ul', { class: 'plain ing' }, d.ing.map((i, idx) => {
          const on = ui.cook.have.has(idx);
          return h('li', { class: on ? 'done' : '' },
            h('label', { class: 'check' },
              h('input', { type: 'checkbox', checked: on, onchange: () => { on ? ui.cook.have.delete(idx) : ui.cook.have.add(idx); persistCook(); render(true); } }),
              h('span', { class: 'txt', text: scaled(i) })));
        })));
      root.append(h('h3', { text: 'Steps' }),
        h('ol', { class: 'plain steps' }, steps.map(([text, sec, label], idx) => {
          const on = done.has(idx);
          const key = d.id + ':' + idx;
          const running = timers.find((t) => t.key === key);
          return h('li', { class: on ? 'done' : '' },
            h('label', { class: 'check' },
              h('input', { type: 'checkbox', checked: on, onchange: () => { on ? done.delete(idx) : done.add(idx); persistCook(); render(true); } }),
              h('span', { class: 'txt' }, h('span', { class: 'stepnum', text: (idx + 1) + '.' }), text)),
            sec && h('button', {
              type: 'button', class: 'btn small timerbtn', disabled: !!running,
              onclick: () => startTimer(sec, label || 'Step ' + (idx + 1), d.n, key),
              text: running ? '⏱ Running…' : '⏱ Start ' + mmss(sec) + ' timer'
            }));
        })));
    } else {
      root.append(h('div', { class: 'card' }, h('p', { text: d.note || 'Enjoy your meal! Use the timer below if you need one.' })));
    }

    root.append(h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn primary', onclick: () => finishCooking(d), text: '✅ Finished: log it' })));
    return root;
  }

  function finishCooking(d) {
    S.history.unshift({ id: d.id, ts: Date.now() });
    S.history = S.history.slice(0, 30);
    ui.cook = null; S.cook = null; ui.dishId = null; S.last = null;
    save(); toast('Logged! Enjoy your meal 🍽️'); render();
  }

  // ───────────────────────── Week tab ─────────────────────────
  function planWeek() {
    const pool = eligible();
    if (!pool.length) { toast('No dishes match these filters. Try loosening them.'); return; }
    const toks = pantryTokens();
    const ids = [];
    let rest = [...pool];
    for (let i = 0; i < 7; i++) {
      if (!rest.length) rest = pool.filter((d) => d.id !== ids[ids.length - 1]);
      if (!rest.length) rest = [...pool];
      const d = weightedPick(rest, toks);
      ids.push(d.id);
      rest = rest.filter((x) => x.id !== d.id);
    }
    S.week = { ts: Date.now(), ids };
    save(); render();
  }

  function swapDay(i) {
    const pool = eligible();
    if (!pool.length) { toast('No dishes match these filters.'); return; }
    let rest = pool.filter((d) => !S.week.ids.includes(d.id));
    if (!rest.length) rest = pool.filter((d) => d.id !== S.week.ids[i]);
    if (!rest.length) rest = pool;
    S.week.ids[i] = weightedPick(rest, pantryTokens()).id;
    save(); render(true);
  }

  function dayLabel(i) {
    const dt = new Date(S.week.ts);
    dt.setDate(dt.getDate() + i);
    return dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
  }

  function weekView() {
    const root = h('div', { class: 'stack' });
    const ids = S.week ? S.week.ids.filter((id) => byId(id)) : [];
    if (!S.week || ids.length !== 7) {
      root.append(h('div', { class: 'card hero' },
        h('div', { class: 'big', 'aria-hidden': 'true', text: '🗓️' }),
        h('p', { text: 'Plan 7 dinners in one tap, with a combined grocery list. Uses your filters from the Tonight tab.' }),
        h('button', { type: 'button', class: 'btn primary lg', onclick: planWeek, text: 'Plan my week' })));
      return root;
    }
    root.append(h('div', { class: 'row between' },
      h('span', { class: 'meta', text: 'Servings: ' + S.servings }),
      h('span', {},
        h('button', { type: 'button', class: 'btn small', onclick: planWeek, text: '🔄 Re-plan' }), ' ',
        h('button', { type: 'button', class: 'btn small primary', onclick: () => { ui.grocery = true; render(); }, text: '🛒 Grocery list' }))));
    root.append(h('ul', { class: 'plain list card' }, ids.map((id, i) => {
      const d = byId(id);
      return h('li', {},
        h('span', { class: 'day', text: dayLabel(i) }),
        h('span', { class: 'name' }, d.e + ' ' + d.n, h('small', { text: d.c + ' · ' + d.t + ' min' })),
        h('span', { class: 'acts' },
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Swap ' + d.n, onclick: () => swapDay(i), text: '🔄' }),
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Cook ' + d.n, onclick: () => startCook(d.id), text: '👩‍🍳' })));
    })));
    root.append(h('p', { class: 'hint center', text: 'Tip: change servings or filters on the Tonight tab, then re-plan.' }));
    return root;
  }

  function groceryData() {
    const scale = S.servings / 2;
    const map = new Map();
    for (const id of S.week.ids) {
      const d = byId(id);
      if (!d) continue;
      for (const [name, q, u, staple] of d.ing) {
        const key = baseName(name).toLowerCase() + '|' + u + '|' + (staple ? 1 : 0);
        const cur = map.get(key) || { name, q: 0, u, staple: !!staple };
        cur.q += q * scale;
        map.set(key, cur);
      }
    }
    const items = [...map.values()].sort((a, b) => baseName(a.name).localeCompare(baseName(b.name)));
    return { shop: items.filter((i) => !i.staple), staples: items.filter((i) => i.staple) };
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = h('textarea', { class: 'sr' }); ta.value = text; document.body.append(ta); ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    toast('Copied to clipboard');
  }

  function groceryView() {
    const { shop, staples } = groceryData();
    const line = (i) => ingText(i.name, i.q, i.u);
    const li = (i, pre) => {
      const key = pre + baseName(i.name) + i.u;
      const on = ui.groceryChecked.has(key);
      return h('li', { class: on ? 'done' : '' }, h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: on, onchange: () => { on ? ui.groceryChecked.delete(key) : ui.groceryChecked.add(key); render(true); } }),
        h('span', { class: 'txt', text: line(i) })));
    };
    const text = ['Shopping list (' + S.servings + ' servings per meal)', ...shop.map((i) => '• ' + line(i)),
      '', 'Pantry staples to check:', ...staples.map((i) => '• ' + line(i))].join('\n');
    return h('div', { class: 'stack' },
      h('div', { class: 'row between' },
        h('button', { type: 'button', class: 'btn small', onclick: () => { ui.grocery = false; render(); }, text: '← Plan' }),
        h('button', { type: 'button', class: 'btn small primary', onclick: () => copyText(text), text: '📋 Copy list' })),
      h('h3', { text: 'Shopping list' }),
      h('ul', { class: 'plain ing' }, shop.map((i) => li(i, 's'))),
      h('h3', { text: 'Pantry staples: check you have these' }),
      h('ul', { class: 'plain ing' }, staples.map((i) => li(i, 'p'))));
  }

  // ───────────────────────── Saved tab ─────────────────────────
  function addCustomForm() {
    const form = h('form', { class: 'card', onsubmit: (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim().slice(0, 60);
      if (!name) { toast('Give your meal a name first.'); return; }
      if (S.custom.length >= 50) { toast('You can save up to 50 meals.'); return; }
      const diet = fd.get('diet');
      S.custom.push({
        id: 'c' + Date.now(), n: name, e: (String(fd.get('emoji') || '').trim() || '🍲').slice(0, 4),
        c: 'My meals', t: Math.min(240, Math.max(5, Number(fd.get('mins')) || 30)),
        m: diet === 'vegan' ? [] : diet === 'veg' ? ['egg'] : ['chicken', 'beef', 'pork', 'seafood'],
        ing: [], steps: [], custom: true, note: String(fd.get('note') || '').trim().slice(0, 300)
      });
      save(); toast('Added! It\'s now in the mix.'); render(true);
    } },
      h('div', { class: 'two' },
        h('div', { class: 'field' }, h('label', { for: 'cName', text: 'Meal name' }), h('input', { id: 'cName', name: 'name', type: 'text', maxlength: '60', required: true, placeholder: 'Mum\'s chicken rice' })),
        h('div', { class: 'field' }, h('label', { for: 'cEmoji', text: 'Emoji (optional)' }), h('input', { id: 'cEmoji', name: 'emoji', type: 'text', maxlength: '4', placeholder: '🍲' }))),
      h('div', { class: 'two' },
        h('div', { class: 'field' }, h('label', { for: 'cMins', text: 'Minutes' }), h('input', { id: 'cMins', name: 'mins', type: 'number', min: '5', max: '240', value: '30' })),
        h('div', { class: 'field' }, h('label', { for: 'cDiet', text: 'Contains' }),
          h('select', { id: 'cDiet', name: 'diet' },
            h('option', { value: 'meat', text: 'Meat or fish' }), h('option', { value: 'veg', text: 'Vegetarian' }), h('option', { value: 'vegan', text: 'Vegan' })))),
      h('div', { class: 'field' }, h('label', { for: 'cNote', text: 'Notes (optional)' }), h('textarea', { id: 'cNote', name: 'note', maxlength: '300', placeholder: 'Anything you want to remember' })),
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary', text: '＋ Add my meal' })));
    return form;
  }

  function savedView() {
    const root = h('div', { class: 'stack' });
    const favs = S.favorites.map(byId).filter(Boolean);
    root.append(h('h3', { text: '★ Saved dishes' }));
    root.append(favs.length
      ? h('ul', { class: 'plain list card' }, favs.map((d) => h('li', {},
        h('span', { class: 'name' }, d.e + ' ' + d.n, h('small', { text: d.c + ' · ' + d.t + ' min' })),
        h('span', { class: 'acts' },
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Cook ' + d.n, onclick: () => startCook(d.id), text: '👩‍🍳' }),
          h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Remove ' + d.n + ' from saved', onclick: () => toggleFav(d.id), text: '✕' })))))
      : h('p', { class: 'meta', text: 'Tap ☆ Save on a dish and it will show up here. Saved dishes get picked more often.' }));

    root.append(h('h3', { text: 'My own meals' }),
      h('p', { class: 'meta', text: 'Add your family favourites. They join the random pick (for diet filters they\'re treated as the type you choose).' }),
      addCustomForm());
    if (S.custom.length) {
      root.append(h('ul', { class: 'plain list card' }, S.custom.map((d) => h('li', {},
        h('span', { class: 'name' }, d.e + ' ' + d.n, h('small', { text: d.t + ' min' })),
        h('span', { class: 'acts' }, h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Delete ' + d.n, onclick: () => deleteCustom(d.id), text: '🗑' }))))));
    }

    root.append(h('h3', { text: 'Recently cooked' }));
    const hist = S.history.filter((x) => byId(x.id)).slice(0, 10);
    root.append(hist.length
      ? h('ul', { class: 'plain list card' }, hist.map((x) => { const d = byId(x.id); return h('li', {},
        h('span', { class: 'name' }, d.e + ' ' + d.n, h('small', { text: new Date(x.ts).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) })),
        h('span', { class: 'acts' }, h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Cook ' + d.n + ' again', onclick: () => startCook(d.id), text: '↻' }))); }))
      : h('p', { class: 'meta', text: 'Nothing yet. Hit "Finished" after cooking and it will show here. Recent dishes are picked less often.' }));
    if (S.history.length) root.append(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn link', onclick: () => { S.history = []; save(); render(true); }, text: 'Clear history' })));
    return root;
  }

  function deleteCustom(id) {
    S.custom = S.custom.filter((d) => d.id !== id);
    S.favorites = S.favorites.filter((x) => x !== id);
    S.history = S.history.filter((x) => x.id !== id);
    if (ui.dishId === id) setCurrent(null);
    if (ui.cook && ui.cook.id === id) { ui.cook = null; persistCook(); }
    if (S.week) S.week.ids = S.week.ids.filter((x) => x !== id);
    save(); render(true);
  }

  // ───────────────────────── render + boot ─────────────────────────
  function render(keepScroll) {
    const main = $('#view');
    const y = main.scrollTop;
    document.querySelectorAll('#nav button').forEach((b) => {
      if (b.dataset.tab === ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    let view;
    if (ui.tab === 'tonight') view = ui.cook ? cookView() : tonightView();
    else if (ui.tab === 'week') view = (ui.grocery && S.week) ? groceryView() : weekView();
    else view = savedView();
    main.replaceChildren(view);
    main.scrollTop = keepScroll ? y : 0;
  }

  async function boot() {
    const r = await chrome.storage.local.get(['dd', 'timers']);
    const saved = r.dd || {};
    S = { ...structuredClone(DEFAULTS), ...saved };
    S.filters = { ...DEFAULTS.filters, ...(saved.filters || {}) };
    timers = Array.isArray(r.timers) ? r.timers : [];
    if (S.last && Date.now() - S.last.ts < FRESH_MS && byId(S.last.id)) ui.dishId = S.last.id;
    if (S.cook && Date.now() - S.cook.ts < FRESH_MS && byId(S.cook.id)) {
      ui.cook = { id: S.cook.id, done: new Set(S.cook.done), have: new Set(S.cook.have) };
    } else S.cook = null;

    document.querySelectorAll('#nav button').forEach((b) => b.addEventListener('click', () => {
      clearInterval(ui.spinTimer); ui.spinning = false;
      ui.tab = b.dataset.tab; if (ui.tab !== 'week') ui.grocery = false; render();
    }));
    $('#quick').addEventListener('submit', (e) => {
      e.preventDefault();
      const min = Math.min(180, Math.max(1, Math.round(Number($('#quickMin').value) || 10)));
      startTimer(min * 60, 'Quick timer', '', 'quick');
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.timers) {
        timers = changes.timers.newValue || [];
        renderTimers();
        if (ui.cook) render(true);
      }
    });
    setInterval(renderTimers, 1000);
    renderTimers();
    render();
  }

  boot();
})();
