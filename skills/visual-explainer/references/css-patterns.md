# CSS Patterns for Diagrams

Reusable patterns for layout, connectors, theming, and visual effects in self-contained HTML diagrams.

---

## Theme Setup

Use CSS custom properties on `:root` for light theme and `[data-theme="dark"]` (or `@media (prefers-color-scheme: dark)`) for dark. Teal/slate palette.

```css
:root {
  /* Backgrounds */
  --bg:               #f8fafc;
  --surface:          #ffffff;
  --surface-elevated: #ffffff;
  --surface-recessed: #f1f5f9;

  /* Borders */
  --border:           #e2e8f0;
  --border-bright:    #cbd5e1;

  /* Text */
  --text:             #0f172a;
  --text-dim:         #64748b;
  --text-muted:       #94a3b8;

  /* Accent — teal */
  --accent:           #0d9488;
  --accent-dim:       #ccfbf1;
  --accent-hover:     #0f766e;

  /* Node palette */
  --node-a:           #0d9488;   /* teal  — primary */
  --node-b:           #6366f1;   /* indigo — secondary */
  --node-c:           #f59e0b;   /* amber  — tertiary/warning */
  --node-d:           #ec4899;   /* pink   — highlight */
  --node-e:           #10b981;   /* emerald — success */

  /* Node dim variants (for backgrounds) */
  --node-a-dim:       #ccfbf1;
  --node-b-dim:       #e0e7ff;
  --node-c-dim:       #fef3c7;
  --node-d-dim:       #fce7f3;
  --node-e-dim:       #d1fae5;

  /* Shadows */
  --shadow-sm:        0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
  --shadow-md:        0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
  --shadow-lg:        0 10px 30px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);

  /* Radii */
  --radius-sm:        6px;
  --radius-md:        10px;
  --radius-lg:        16px;
  --radius-xl:        24px;

  /* Typography */
  --font-sans:        'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:        'JetBrains Mono', 'Fira Code', monospace;
  --font-size-base:   15px;
  --line-height:      1.6;
}

[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root {
    --bg:               #0b1120;
    --surface:          #131e2e;
    --surface-elevated: #1a2740;
    --surface-recessed: #0d1526;

    --border:           #1e3048;
    --border-bright:    #2d4a6e;

    --text:             #e2e8f0;
    --text-dim:         #94a3b8;
    --text-muted:       #64748b;

    --accent:           #2dd4bf;
    --accent-dim:       #0d2e2a;
    --accent-hover:     #5eead4;

    --node-a:           #2dd4bf;
    --node-b:           #818cf8;
    --node-c:           #fbbf24;
    --node-d:           #f472b6;
    --node-e:           #34d399;

    --node-a-dim:       #042f2e;
    --node-b-dim:       #1e1b4b;
    --node-c-dim:       #2d1b00;
    --node-d-dim:       #3b0a26;
    --node-e-dim:       #022c22;

    --shadow-sm:        0 1px 3px rgba(0,0,0,.4);
    --shadow-md:        0 4px 12px rgba(0,0,0,.5);
    --shadow-lg:        0 10px 30px rgba(0,0,0,.6);
  }
}
```

**Usage:** Apply `data-theme="dark"` to `<html>` or `<body>` via JS toggle. All components pick it up automatically.

---

## Background Atmosphere

Place one of these on the outermost wrapper or `body`. They are decorative — never use them as layout containers.

### Radial glow

```css
.bg-glow {
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(13,148,136,.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(99,102,241,.12) 0%, transparent 55%),
    var(--bg);
}
```

### Dot grid

```css
.bg-dots {
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
  background-color: var(--bg);
}
```

### Diagonal lines

```css
.bg-lines {
  background-color: var(--bg);
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 14px,
    var(--border) 14px,
    var(--border) 15px
  );
}
```

### Gradient mesh

Combine multiple conic or radial gradients for a colorful mesh effect:

```css
.bg-mesh {
  background:
    conic-gradient(from 0deg at 30% 40%, rgba(13,148,136,.08) 0deg, transparent 120deg),
    conic-gradient(from 180deg at 70% 60%, rgba(99,102,241,.08) 0deg, transparent 120deg),
    radial-gradient(ellipse 100% 80% at 50% 0%, rgba(13,148,136,.05) 0%, transparent 70%),
    var(--bg);
}
```

---

## Link Styling

Never rely on browser defaults. Links inside diagrams must be explicit.

```css
a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent);
  text-underline-offset: 3px;
  transition: color .15s, text-decoration-color .15s;
}

a:hover {
  color: var(--accent-hover);
  text-decoration-color: var(--accent-hover);
}

/* Unstyled link (for card wrappers etc.) */
a.unstyled {
  color: inherit;
  text-decoration: none;
}
a.unstyled:hover {
  color: var(--accent);
}
```

---

## Section / Card Components

**Use `.ve-card` — NOT `.node`**. The class `.node` conflicts with Mermaid's internal stylesheet and will produce broken diagrams whenever a Mermaid block appears on the same page.

### Base card

```css
.ve-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
}
```

### Depth tiers

```css
/* Elevated — floats above the page */
.ve-card--elevated {
  background: var(--surface-elevated);
  box-shadow: var(--shadow-md);
}

/* Recessed — sunken, inset feel */
.ve-card--recessed {
  background: var(--surface-recessed);
  box-shadow: inset 0 2px 6px rgba(0,0,0,.06);
  border-color: transparent;
}

/* Hero — strong accent border top */
.ve-card--hero {
  border-top: 3px solid var(--accent);
  box-shadow: var(--shadow-lg);
}

/* Glass — translucent, use on colored backgrounds */
.ve-card--glass {
  background: rgba(255,255,255,.6);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  border: 1px solid rgba(255,255,255,.5);
}

[data-theme="dark"] .ve-card--glass {
  background: rgba(19,30,46,.7);
  border-color: rgba(255,255,255,.08);
}
```

### Section label with dot indicator

```css
.ve-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 12px;
}

.ve-label::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* Colored dot variants */
.ve-label--b::before { background: var(--node-b); }
.ve-label--c::before { background: var(--node-c); }
.ve-label--d::before { background: var(--node-d); }
```

```html
<div class="ve-label">Pipeline Stage</div>
<div class="ve-label ve-label--b">Secondary Track</div>
```

---

## Code Blocks

### Basic pattern

```css
.ve-code {
  background: var(--surface-recessed);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-wrap;
  overflow-x: auto;
  tab-size: 2;
}
```

### With file header variant

```css
.ve-code-block {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ve-code-block__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--border);
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-dim);
}

.ve-code-block__dots {
  display: flex;
  gap: 5px;
}

.ve-code-block__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.ve-code-block__dot:nth-child(1) { background: #ef4444; }
.ve-code-block__dot:nth-child(2) { background: #f59e0b; }
.ve-code-block__dot:nth-child(3) { background: #10b981; }

.ve-code-block__body {
  padding: 16px 20px;
  background: var(--surface-recessed);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-x: auto;
}
```

```html
<div class="ve-code-block">
  <div class="ve-code-block__header">
    <div class="ve-code-block__dots">
      <span class="ve-code-block__dot"></span>
      <span class="ve-code-block__dot"></span>
      <span class="ve-code-block__dot"></span>
    </div>
    src/pipeline/normalize.ts
  </div>
  <pre class="ve-code-block__body">export function normalize(raw: RawItem[]): Item[] {
  return raw.map(toItem).filter(isDuplicate);
}</pre>
</div>
```

### Implementation plan rule

When showing implementation plans: **show structure, not full files**. Use a summary tree view. Reserve full code for collapsible sections (see Collapsible Sections below).

```html
<!-- Structure view — always visible -->
<pre class="ve-code">src/
├── pipeline/
│   ├── fetch.ts       ← add retry logic here
│   ├── normalize.ts   ← dedupe fix here
│   └── score.ts
└── config/
    └── sources.ts     ← new source entry</pre>
```

---

## Overflow Protection

Overflow bugs are the most common layout failure in diagram HTML. Apply these defensively.

### Min-width on grid and flex children

```css
/* Always on grid children */
.ve-grid > * {
  min-width: 0;
}

/* Always on flex children that contain text */
.ve-flex > * {
  min-width: 0;
  overflow: hidden;
}

/* Text truncation inside flex/grid */
.ve-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
```

### Never use `display: flex` on `<li>` for marker characters

```css
/* WRONG — breaks the bullet/number marker */
li { display: flex; }

/* RIGHT — use a wrapper inside li */
li .li-inner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
```

### List markers overlapping container borders

When `<ul>` or `<ol>` are inside a card and markers clip the border:

```css
.ve-card ul,
.ve-card ol {
  padding-left: 1.4em;   /* enough room for marker */
  margin: 0;
}

/* Or suppress markers entirely and use a custom symbol */
.ve-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ve-list li {
  padding-left: 1.2em;
  position: relative;
}

.ve-list li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}
```

---

## Mermaid Containers

Mermaid renders into a `<div>` that needs explicit centering and size control. Without this the diagram floats left and may overflow.

### Centering (required for every Mermaid block)

```css
.ve-mermaid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: auto;
  padding: 16px 0;
}

.ve-mermaid svg {
  max-width: 100%;
  height: auto;
}
```

### Scaling small diagrams

```css
.ve-mermaid--scale svg {
  zoom: var(--mermaid-zoom, 1);
  /* or: transform: scale(var(--mermaid-zoom, 1)); transform-origin: top center; */
}
```

### Full pattern with zoom controls

CSS zoom is preferred over `transform: scale` because it affects layout flow — the element takes up space at its zoomed size, avoiding overflow clipping.

```css
.ve-mermaid-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ve-mermaid-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 6px 12px;
  background: var(--surface-recessed);
  border-bottom: 1px solid var(--border);
}

.ve-mermaid-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-dim);
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transition: background .15s, color .15s;
}

.ve-mermaid-btn:hover {
  background: var(--accent-dim);
  color: var(--accent);
}

.ve-mermaid-stage {
  display: flex;
  justify-content: center;
  padding: 24px;
  overflow: auto;
  cursor: grab;
}

.ve-mermaid-stage:active {
  cursor: grabbing;
}

.ve-mermaid-stage svg {
  zoom: var(--mz, 1);
  transition: zoom .15s;
}
```

HTML for zoom controls:

```html
<div class="ve-mermaid-wrap">
  <div class="ve-mermaid-toolbar">
    <button class="ve-mermaid-btn" onclick="mzStep(-0.1)">−</button>
    <button class="ve-mermaid-btn" onclick="mzReset()">⊙</button>
    <button class="ve-mermaid-btn" onclick="mzStep(+0.1)">+</button>
  </div>
  <div class="ve-mermaid-stage" id="mz-stage">
    <div class="mermaid">
      graph LR
        A --> B --> C
    </div>
  </div>
</div>
```

JavaScript for zoom + pan + scroll-to-zoom:

```html
<script>
(function () {
  let zoom = 1;
  const stage = document.getElementById('mz-stage');
  const svg   = () => stage.querySelector('svg');

  function apply() {
    const s = svg();
    if (s) s.style.zoom = zoom;
  }

  window.mzStep  = (d) => { zoom = Math.max(.3, Math.min(3, zoom + d)); apply(); };
  window.mzReset = ()  => { zoom = 1; apply(); };

  /* Scroll-to-zoom */
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    mzStep(e.deltaY < 0 ? .08 : -.08);
  }, { passive: false });

  /* Pan */
  let dragging = false, ox = 0, oy = 0, sl = 0, st = 0;
  stage.addEventListener('mousedown', (e) => {
    dragging = true; ox = e.clientX; oy = e.clientY;
    sl = stage.scrollLeft; st = stage.scrollTop;
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    stage.scrollLeft = sl - (e.clientX - ox);
    stage.scrollTop  = st - (e.clientY - oy);
  });
  window.addEventListener('mouseup', () => { dragging = false; });
})();
</script>
```

---

## Grid Layouts

### Architecture diagram — 2-column with sidebar

```css
.ve-arch {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 640px) {
  .ve-arch {
    grid-template-columns: 1fr;
  }
}
```

### Pipeline — horizontal steps

```css
.ve-pipeline {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 12px;
  align-items: stretch;
  overflow-x: auto;
}

/* Step connector arrow between cells */
.ve-pipeline__step {
  position: relative;
}

.ve-pipeline__step:not(:last-child)::after {
  content: '›';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent);
  font-size: 20px;
  font-weight: 700;
  z-index: 1;
}
```

### Card grid — dashboard

```css
.ve-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* Force 2 or 3 columns when space allows */
.ve-card-grid--2 { grid-template-columns: repeat(2, 1fr); }
.ve-card-grid--3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 640px) {
  .ve-card-grid--2,
  .ve-card-grid--3 { grid-template-columns: 1fr; }
}
```

### Data Tables

Full-featured table: sticky header, status indicators, summary row, sticky first column.

```css
.ve-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: auto;
  max-height: 480px;  /* enable vertical scroll for tall tables */
}

.ve-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

/* Sticky header */
.ve-table thead th {
  position: sticky;
  top: 0;
  background: var(--surface-recessed);
  border-bottom: 2px solid var(--border-bright);
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--text-dim);
  white-space: nowrap;
  z-index: 2;
}

/* Sticky first column */
.ve-table td:first-child,
.ve-table th:first-child {
  position: sticky;
  left: 0;
  background: var(--surface);
  z-index: 1;
  border-right: 1px solid var(--border);
}

.ve-table thead th:first-child {
  z-index: 3;  /* above both sticky axes */
  background: var(--surface-recessed);
}

.ve-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background .1s;
}

.ve-table tbody tr:hover {
  background: var(--accent-dim);
}

.ve-table tbody tr:last-child {
  border-bottom: none;
}

.ve-table td {
  padding: 10px 14px;
  color: var(--text);
  vertical-align: middle;
}

/* Summary / total row */
.ve-table tbody tr.ve-table__summary {
  background: var(--surface-recessed);
  font-weight: 700;
  border-top: 2px solid var(--border-bright);
}

/* Status indicators */
.ve-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}

.ve-status--ok     { background: var(--node-e-dim); color: var(--node-e); }
.ve-status--warn   { background: var(--node-c-dim); color: var(--node-c); }
.ve-status--error  { background: #fee2e2;            color: #dc2626;       }
.ve-status--info   { background: var(--node-b-dim); color: var(--node-b); }
.ve-status--muted  { background: var(--border);      color: var(--text-dim); }

.ve-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
```

```html
<div class="ve-table-wrap">
  <table class="ve-table">
    <thead>
      <tr>
        <th>Source</th>
        <th>Items</th>
        <th>Score</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>GitHub</td>
        <td>42</td>
        <td>8.4</td>
        <td><span class="ve-status ve-status--ok">Active</span></td>
      </tr>
      <tr>
        <td>Telegram</td>
        <td>18</td>
        <td>7.1</td>
        <td><span class="ve-status ve-status--warn">Slow</span></td>
      </tr>
      <tr class="ve-table__summary">
        <td>Total</td>
        <td>60</td>
        <td>—</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Animations

### Staggered fade-in via `--i` variable

Each child gets a CSS custom property `--i` (index) which controls its delay. Set via inline style or a small JS loop.

```css
@keyframes ve-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ve-animate {
  animation: ve-fade-up .4s ease both;
  animation-delay: calc(var(--i, 0) * 80ms);
}
```

```html
<!-- Inline approach -->
<div class="ve-card ve-animate" style="--i:0">First</div>
<div class="ve-card ve-animate" style="--i:1">Second</div>
<div class="ve-card ve-animate" style="--i:2">Third</div>
```

JS loop approach (preferred for generated lists):

```html
<script>
document.querySelectorAll('.ve-animate').forEach((el, i) => {
  el.style.setProperty('--i', i);
});
</script>
```

### Hover lift

```css
.ve-lift {
  transition: transform .2s ease, box-shadow .2s ease;
}

.ve-lift:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
```

### Scale-fade for KPIs

```css
@keyframes ve-scale-fade {
  from { opacity: 0; transform: scale(.85); }
  to   { opacity: 1; transform: scale(1); }
}

.ve-kpi-animate {
  animation: ve-scale-fade .5s cubic-bezier(.22,.68,0,1.3) both;
  animation-delay: calc(var(--i, 0) * 120ms);
}
```

### SVG draw-in (stroke animation)

```css
@keyframes ve-draw {
  from { stroke-dashoffset: var(--len, 500); }
  to   { stroke-dashoffset: 0; }
}

.ve-draw-path {
  stroke-dasharray: var(--len, 500);
  stroke-dashoffset: var(--len, 500);
  animation: ve-draw 1s ease forwards;
  animation-delay: calc(var(--i, 0) * .2s);
}
```

```html
<svg viewBox="0 0 200 100">
  <path class="ve-draw-path" style="--len:300; --i:0"
    d="M10 50 Q100 10 190 50"
    fill="none" stroke="var(--accent)" stroke-width="2"/>
</svg>
```

### CSS counter (countUp without JS)

A purely CSS trick using `counter` and `@property` for animating a numeric display. Requires `@property` support (Chrome 85+, Firefox 128+).

```css
@property --n {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}

@keyframes ve-count {
  from { --n: 0; }
  to   { --n: var(--target, 100); }
}

.ve-counter {
  animation: ve-count 1.5s ease-out forwards;
  animation-delay: calc(var(--i, 0) * .1s);
  counter-reset: n var(--n);
  font-variant-numeric: tabular-nums;
}

.ve-counter::after {
  content: counter(n);
}
```

```html
<span class="ve-counter" style="--target:73; --i:0"></span>
```

### Choreography guidance

- Use `--i` stagger for lists, grids, pipelines.
- Lead with the hero/title (no delay), then stagger children at 60–100ms intervals.
- Keep total animation time under 800ms for the full visible set.
- Fade + translate is the safest combo. Avoid rotate or skew for data diagrams.
- Scale-fade is good for KPI numbers; makes the number feel like it "arrives".

### Reduced motion respect

Always wrap animations in this guard:

```css
@media (prefers-reduced-motion: reduce) {
  .ve-animate,
  .ve-kpi-animate,
  .ve-draw-path,
  .ve-counter,
  .ve-lift {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Sparklines and Simple Charts (Pure SVG)

No library needed for simple trends. Use inline SVG with `polyline` or `path`.

```css
.ve-sparkline {
  display: block;
  overflow: visible;
}

.ve-sparkline__line {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.ve-sparkline__area {
  fill: url(#spark-gradient);
  stroke: none;
}
```

Full sparkline with gradient fill:

```html
<svg class="ve-sparkline" viewBox="0 0 120 40" width="120" height="40">
  <defs>
    <linearGradient id="spark-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--accent)" stop-opacity=".25"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <!-- Area fill: close the path at the bottom corners -->
  <path class="ve-sparkline__area"
    d="M0,35 L20,28 L40,20 L60,25 L80,12 L100,8 L120,5 L120,40 L0,40 Z"/>
  <!-- Line on top -->
  <polyline class="ve-sparkline__line"
    points="0,35 20,28 40,20 60,25 80,12 100,8 120,5"/>
</svg>
```

Mini bar chart (pure SVG):

```html
<svg viewBox="0 0 120 40" width="120" height="40">
  <!-- bars: x, y, width, height. y = 40 - barHeight (SVG y is top-down) -->
  <rect x="5"  y="20" width="14" height="20" rx="2" fill="var(--accent)" opacity=".6"/>
  <rect x="25" y="10" width="14" height="30" rx="2" fill="var(--accent)" opacity=".8"/>
  <rect x="45" y="15" width="14" height="25" rx="2" fill="var(--accent)"/>
  <rect x="65" y="5"  width="14" height="35" rx="2" fill="var(--node-b)"/>
  <rect x="85" y="12" width="14" height="28" rx="2" fill="var(--accent)" opacity=".7"/>
  <rect x="105" y="18" width="14" height="22" rx="2" fill="var(--accent)" opacity=".5"/>
</svg>
```

---

## Responsive Breakpoint

Single breakpoint is sufficient for most diagrams (not full websites):

```css
/* Tablet / narrow viewport */
@media (max-width: 700px) {
  .ve-arch          { grid-template-columns: 1fr; }
  .ve-pipeline      { grid-auto-flow: row; grid-auto-columns: unset; }
  .ve-card-grid--2,
  .ve-card-grid--3  { grid-template-columns: 1fr; }

  /* Hide sticky first column on mobile — simplify table */
  .ve-table td:first-child,
  .ve-table th:first-child {
    position: static;
    border-right: none;
  }

  /* Reduce padding */
  .ve-card { padding: 14px 16px; }
}
```

---

## Badges and Tags

```css
.ve-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  white-space: nowrap;
}

/* Color variants */
.ve-badge--teal   { background: var(--node-a-dim); color: var(--node-a); }
.ve-badge--indigo { background: var(--node-b-dim); color: var(--node-b); }
.ve-badge--amber  { background: var(--node-c-dim); color: var(--node-c); }
.ve-badge--pink   { background: var(--node-d-dim); color: var(--node-d); }
.ve-badge--green  { background: var(--node-e-dim); color: var(--node-e); }
.ve-badge--muted  { background: var(--border);      color: var(--text-dim); }

/* Outlined variant */
.ve-badge--outline {
  background: transparent;
  border: 1px solid currentColor;
}

/* Tag (slightly larger, squarer) */
.ve-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  background: var(--surface-recessed);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.ve-tag:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

```html
<span class="ve-badge ve-badge--teal">origin</span>
<span class="ve-badge ve-badge--amber">scout</span>
<span class="ve-badge ve-badge--indigo">experiment</span>
<span class="ve-badge ve-badge--muted">watch</span>
<span class="ve-tag">agent-memory</span>
```

---

## Lists Inside Nodes

When a `.ve-card` contains a list, these rules prevent common overflow and marker clipping issues.

```css
/* Standard content list inside a card */
.ve-card .ve-list-content {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ve-card .ve-list-content li {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 6px;
  align-items: start;
  font-size: 13.5px;
  color: var(--text);
  min-width: 0;
}

.ve-card .ve-list-content li .icon {
  color: var(--accent);
  font-size: 12px;
  padding-top: 2px;
  flex-shrink: 0;
}

/* Checklist variant */
.ve-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ve-checklist li {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: start;
  min-width: 0;
}

.ve-checklist li.done   .check { color: var(--node-e); }
.ve-checklist li.skip   .check { color: var(--text-muted); }
.ve-checklist li.active .check { color: var(--accent); }
```

```html
<ul class="ve-checklist">
  <li class="done">
    <span class="check">✓</span>
    <span>Normalize sources</span>
  </li>
  <li class="active">
    <span class="check">→</span>
    <span>Build lookup layer</span>
  </li>
  <li class="skip">
    <span class="check">○</span>
    <span>Reddit expansion (later)</span>
  </li>
</ul>
```

---

## KPI / Metric Cards

```css
.ve-kpi {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.ve-kpi__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.ve-kpi__value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  letter-spacing: -.02em;
}

.ve-kpi__delta {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.ve-kpi__delta--up   { color: var(--node-e); }
.ve-kpi__delta--down { color: #ef4444; }
.ve-kpi__delta--flat { color: var(--text-muted); }

.ve-kpi__spark {
  margin-top: 8px;
}

/* Accent-top variant */
.ve-kpi--accent {
  border-top: 3px solid var(--accent);
}

.ve-kpi--b { border-top-color: var(--node-b); }
.ve-kpi--c { border-top-color: var(--node-c); }
```

```html
<div class="ve-kpi ve-kpi--accent ve-kpi-animate" style="--i:0">
  <div class="ve-kpi__label">Total Sources</div>
  <div class="ve-kpi__value">6</div>
  <div class="ve-kpi__delta ve-kpi__delta--up">↑ 2 this month</div>
</div>
```

---

## Before / After Panels

Side-by-side comparison with a divider label.

```css
.ve-before-after {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ve-before-after__panel {
  padding: 20px 24px;
  background: var(--surface);
  min-width: 0;
}

.ve-before-after__panel--before {
  background: var(--surface-recessed);
}

.ve-before-after__divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background: var(--border);
  font-size: 18px;
  color: var(--text-dim);
  gap: 4px;
}

.ve-before-after__label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .ve-before-after {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .ve-before-after__divider {
    flex-direction: row;
    padding: 8px 16px;
  }
}
```

```html
<div class="ve-before-after">
  <div class="ve-before-after__panel ve-before-after__panel--before">
    <div class="ve-before-after__label">Before</div>
    <p>Scattered scripts, no shared baseline.</p>
  </div>
  <div class="ve-before-after__divider">→</div>
  <div class="ve-before-after__panel">
    <div class="ve-before-after__label">After</div>
    <p>Canonical skills/, synced to both tools.</p>
  </div>
</div>
```

---

## Collapsible Sections

CSS-only (no JS) using `<details>` / `<summary>`. Works everywhere.

```css
.ve-details {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ve-details summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface-recessed);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  user-select: none;
  list-style: none;  /* hide default triangle in Firefox */
}

.ve-details summary::-webkit-details-marker {
  display: none;  /* hide default triangle in Chrome/Safari */
}

.ve-details summary::after {
  content: '›';
  font-size: 18px;
  color: var(--text-dim);
  transition: transform .2s ease;
}

.ve-details[open] summary::after {
  transform: rotate(90deg);
}

.ve-details summary:hover {
  background: var(--accent-dim);
}

.ve-details__body {
  padding: 16px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}
```

```html
<details class="ve-details">
  <summary>Full implementation — normalize.ts</summary>
  <div class="ve-details__body">
    <pre class="ve-code">export function normalize(raw) {
  return raw.map(toItem).filter(Boolean);
}</pre>
  </div>
</details>
```

---

## Prose Page Elements

For diagrams that include substantial body text, articles, or research-style output.

### Body text settings

```css
.ve-prose {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--text);
  max-width: 72ch;
}

.ve-prose p {
  margin: 0 0 1em;
}

.ve-prose h1 { font-size: 2rem;   font-weight: 800; line-height: 1.15; margin: 0 0 .5em; }
.ve-prose h2 { font-size: 1.4rem; font-weight: 700; line-height: 1.2;  margin: 1.8em 0 .5em; }
.ve-prose h3 { font-size: 1.1rem; font-weight: 700; line-height: 1.3;  margin: 1.4em 0 .4em; }
```

### Lead paragraph

```css
.ve-prose .lead {
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--text-dim);
  font-weight: 400;
  margin-bottom: 1.5em;
}
```

### Pull quote

```css
.ve-pullquote {
  border-left: 4px solid var(--accent);
  margin: 2em 0;
  padding: 12px 24px;
  font-size: 1.15rem;
  font-style: italic;
  color: var(--text-dim);
  background: var(--accent-dim);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
```

### Section divider

```css
.ve-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

.ve-divider--accent {
  border-top-color: var(--accent);
  border-top-width: 2px;
}
```

### Article hero

```css
.ve-hero {
  padding: 48px 32px;
  background:
    radial-gradient(ellipse 80% 60% at 30% 40%, rgba(13,148,136,.12) 0%, transparent 60%),
    var(--bg);
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.ve-hero__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}

.ve-hero__title {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -.02em;
  color: var(--text);
  margin: 0 0 16px;
}

.ve-hero__sub {
  font-size: 1.1rem;
  color: var(--text-dim);
  max-width: 60ch;
  margin: 0 auto;
}
```

### Author byline

```css
.ve-byline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-dim);
  margin: 16px 0;
}

.ve-byline__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: var(--accent);
  flex-shrink: 0;
}

.ve-byline__name {
  font-weight: 600;
  color: var(--text);
}
```

### Callout boxes

```css
.ve-callout {
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid transparent;
}

.ve-callout__icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1.4;
}

.ve-callout--info {
  background: var(--node-b-dim);
  border-color: var(--node-b);
  color: var(--text);
}

.ve-callout--warn {
  background: var(--node-c-dim);
  border-color: var(--node-c);
  color: var(--text);
}

.ve-callout--tip {
  background: var(--node-e-dim);
  border-color: var(--node-e);
  color: var(--text);
}

.ve-callout--danger {
  background: #fee2e2;
  border-color: #fca5a5;
  color: var(--text);
}
```

```html
<div class="ve-callout ve-callout--warn">
  <span class="ve-callout__icon">⚠</span>
  <div>Do not collapse ingest, scoring, and lookup into one script.</div>
</div>
```

### Theme toggle (JS required)

```html
<button
  class="ve-theme-toggle"
  onclick="document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'"
  title="Toggle theme"
>☀ / ☾</button>
```

```css
.ve-theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 6px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 12px;
  cursor: pointer;
  z-index: 100;
}

.ve-theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent);
}
```

### Prose anti-patterns

- Do not set `font-size` on `body` in px without a fallback. Use `clamp()` or rem.
- Do not use `max-width: 100%` on images inside prose without also setting `height: auto`.
- Do not use raw `<hr>` — wrap in `.ve-divider` for consistent spacing.
- Do not let `<pre>` overflow the prose column — always add `overflow-x: auto`.
- Do not rely on `line-height` inherited from a grid/flex parent — set it explicitly on prose containers.

---

## Generated Images

### Hero banner

Use when the output includes a full-width visual header. Relies on CSS gradients only — no external image dependency.

```css
.ve-img-hero {
  width: 100%;
  aspect-ratio: 16 / 5;
  background:
    linear-gradient(135deg,
      rgba(13,148,136,.8) 0%,
      rgba(99,102,241,.6) 50%,
      rgba(15,23,42,1) 100%),
    radial-gradient(ellipse 60% 80% at 20% 50%, rgba(13,148,136,.4) 0%, transparent 60%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -.02em;
  text-align: center;
  padding: 24px;
}
```

### Inline illustration

A small decorative accent — abstract shape cluster using CSS clip-path. No SVG required.

```css
.ve-img-accent {
  width: 120px;
  height: 120px;
  position: relative;
  flex-shrink: 0;
}

.ve-img-accent__shape {
  position: absolute;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.ve-img-accent__shape:nth-child(1) {
  width: 80px; height: 80px;
  top: 0; left: 10px;
  background: var(--node-a-dim);
  border: 2px solid var(--node-a);
  animation: ve-morph 6s ease-in-out infinite;
}

.ve-img-accent__shape:nth-child(2) {
  width: 60px; height: 60px;
  bottom: 0; right: 0;
  background: var(--node-b-dim);
  border: 2px solid var(--node-b);
  animation: ve-morph 8s ease-in-out infinite reverse;
}

@keyframes ve-morph {
  0%,100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  50%      { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
}
```

### Side accent

Narrow decorative strip placed beside a section, typically in a 2-column layout.

```css
.ve-img-side {
  width: 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px 0;
}

.ve-img-side__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  opacity: .3;
  animation: ve-pulse 2s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * .4s);
}

.ve-img-side__line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, var(--accent), transparent);
  border-radius: 1px;
  min-height: 40px;
}

@keyframes ve-pulse {
  0%,100% { opacity: .3; transform: scale(1); }
  50%      { opacity: 1;  transform: scale(1.3); }
}
```

```html
<div class="ve-img-side">
  <div class="ve-img-side__dot" style="--i:0"></div>
  <div class="ve-img-side__line"></div>
  <div class="ve-img-side__dot" style="--i:1"></div>
  <div class="ve-img-side__line"></div>
  <div class="ve-img-side__dot" style="--i:2"></div>
</div>
```

---

## Quick Reference: Class Naming Rules

| Class prefix | Purpose |
|---|---|
| `ve-card` | Container / card components |
| `ve-kpi` | Metric / KPI display |
| `ve-badge` | Inline status label |
| `ve-tag` | Clickable/filterable tag |
| `ve-label` | Section header with dot |
| `ve-table` | Data table elements |
| `ve-status` | Status pill inside tables |
| `ve-callout` | Info/warn/tip boxes |
| `ve-prose` | Body text containers |
| `ve-hero` | Page-level hero sections |
| `ve-mermaid` | Mermaid diagram wrappers |
| `ve-pipeline` | Horizontal pipeline layout |
| `ve-arch` | Architecture grid layout |
| `ve-before-after` | Comparison panels |
| `ve-details` | Collapsible `<details>` block |
| `ve-sparkline` | Inline SVG chart |
| `ve-animate` | Staggered entrance animation |
| `ve-img-*` | Decorative/generated image patterns |
| `ve-draw-path` | SVG stroke draw-in animation |
| `ve-counter` | CSS integer counter animation |
| `ve-divider` | Section separator `<hr>` |
| `ve-pullquote` | Styled block quote |
| `ve-byline` | Author / attribution line |
| `ve-theme-toggle` | Dark/light toggle button |

**Never use `.node` as a class in diagram HTML.** It conflicts with Mermaid's internal stylesheet.
