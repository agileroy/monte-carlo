// Graphiques SVG sans bibliothèque : colonnes et courbe. Les couleurs viennent des classes et variables CSS,
// donc du thème clair ou sombre, sans redessiner. Une infobulle suit le pointeur (souris ou toucher).

const NS = 'http://www.w3.org/2000/svg';
const M = { top: 12, right: 12, bottom: 26, left: 40 };

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

/** Graduations « rondes » (1, 2, 5 × 10^n) de 0 à au moins `max`. */
export function niceTicks(max, target = 4) {
  if (!(max > 0)) return [0, 1];
  const raw = max / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  const ticks = [];
  for (let v = 0; v < max + step; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks;
}

const charts = new WeakMap();

/**
 * Dessine un graphique dans `container` (élément positionné). `spec` :
 * - `type` : 'bars' ou 'line' ;
 * - `labels` : libellés de l'axe horizontal ; `values` : valeurs ;
 * - `zones` (colonnes) : classe de couleur par colonne ; `muted` : indices grisés ;
 * - `yMax`, `yTicks`, `yFormat` (graduations) ; `refLines` : [{ value, label, cls }] ; `markers` : indices marqués (courbe) ;
 * - `tooltip(i)` : { title, text } de la colonne i ; `label` : description accessible.
 */
export function drawChart(container, spec) {
  charts.set(container, spec);
  if (!container.dataset.chartReady) {
    container.dataset.chartReady = '1';
    new ResizeObserver(() => { const s = charts.get(container); if (s) render(container, s); }).observe(container);
  }
  render(container, spec);
}

function render(container, spec) {
  const width = Math.max(240, Math.round(container.clientWidth));
  const height = Math.max(100, Math.round(container.clientHeight));
  container.replaceChildren();
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width, height, class: 'chart-svg', role: 'img', 'aria-label': spec.label ?? '' });
  container.appendChild(svg);
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  container.appendChild(tip);

  const n = spec.values.length;
  if (!n) return;
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const max = spec.yMax ?? Math.max(...spec.values);
  const ticks = spec.yTicks ?? (spec.yMax ? niceTicks(spec.yMax, 4).filter((t) => t <= spec.yMax) : niceTicks(max, height < 160 ? 2 : 4));
  const top = spec.yMax ?? ticks[ticks.length - 1];
  const y = (v) => M.top + ph - (v / top) * ph;
  const colW = pw / n;
  const xc = (i) => M.left + colW * (i + 0.5);
  const fmt = spec.yFormat ?? ((v) => v.toLocaleString('fr-FR'));

  // Grille et graduations
  for (const t of ticks) {
    el('line', { x1: M.left, x2: width - M.right, y1: y(t), y2: y(t), class: t === 0 ? 'chart-axis' : 'chart-grid' }, svg);
    el('text', { x: M.left - 6, y: y(t) + 4, 'text-anchor': 'end', class: 'chart-tick' }, svg).textContent = fmt(t);
  }
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(pw / 72))));
  spec.labels.forEach((label, i) => {
    if (i % every) return;
    el('text', { x: xc(i), y: height - 8, 'text-anchor': 'middle', class: 'chart-tick' }, svg).textContent = label;
  });

  let marks = [];
  let guide = null;
  if (spec.type === 'bars') {
    const bw = Math.max(2, Math.min(26, colW * 0.78));
    marks = spec.values.map((v, i) => {
      const h = Math.max(v > 0 ? 1.5 : 0, y(0) - y(v));
      const cls = `chart-bar ${spec.zones?.[i] ? `zone-${spec.zones[i]}` : 'zone-accent'}${spec.muted?.has(i) ? ' is-muted' : ''}`;
      return el('rect', { x: xc(i) - bw / 2, y: y(0) - h, width: bw, height: h, rx: Math.min(3, bw / 3), class: cls }, svg);
    });
  } else {
    const pts = spec.values.map((v, i) => [xc(i), y(v)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    el('path', { d: `${line}L${pts[n - 1][0].toFixed(1)},${y(0)}L${pts[0][0].toFixed(1)},${y(0)}Z`, class: 'chart-area' }, svg);
    for (const r of spec.refLines ?? []) {
      el('line', { x1: M.left, x2: width - M.right, y1: y(r.value), y2: y(r.value), class: `chart-ref zone-${r.cls}` }, svg);
      el('text', { x: width - M.right - 2, y: y(r.value) - 4, 'text-anchor': 'end', class: `chart-ref-label zone-${r.cls}` }, svg).textContent = r.label;
    }
    el('path', { d: line, class: 'chart-line' }, svg);
    guide = el('line', { x1: 0, x2: 0, y1: M.top, y2: y(0), class: 'chart-guide', visibility: 'hidden' }, svg);
    for (const i of spec.markers ?? []) el('circle', { cx: pts[i][0], cy: pts[i][1], r: 4.5, class: 'chart-marker' }, svg);
    marks = pts.map((p) => el('circle', { cx: p[0], cy: p[1], r: 4, class: 'chart-hover-dot', visibility: 'hidden' }, svg));
  }

  // Infobulle
  let current = -1;
  const show = (event) => {
    const box = svg.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    const i = Math.floor((px - M.left) / colW);
    if (i < 0 || i >= n) return hide();
    if (i !== current) {
      if (current >= 0) setActive(current, false);
      current = i;
      setActive(i, true);
      const t = spec.tooltip(i);
      tip.replaceChildren();
      const b = document.createElement('strong');
      b.textContent = t.title;
      tip.append(b, document.createTextNode(t.text));
    }
    tip.hidden = false;
    const left = (xc(i) / width) * box.width;
    tip.style.left = `${Math.min(Math.max(left, tip.offsetWidth / 2 + 4), box.width - tip.offsetWidth / 2 - 4)}px`;
  };
  const setActive = (i, on) => {
    if (spec.type === 'bars') marks[i].classList.toggle('is-active', on);
    else {
      marks[i].setAttribute('visibility', on ? 'visible' : 'hidden');
      if (on) { guide.setAttribute('x1', xc(i)); guide.setAttribute('x2', xc(i)); }
      guide.setAttribute('visibility', on ? 'visible' : 'hidden');
    }
  };
  const hide = () => { if (current >= 0) setActive(current, false); current = -1; tip.hidden = true; };
  svg.addEventListener('pointermove', show);
  svg.addEventListener('pointerdown', show);
  svg.addEventListener('pointerleave', hide);
}
