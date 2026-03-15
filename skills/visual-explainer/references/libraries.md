# External Libraries (CDN)

Reference for all external CDN libraries used in visual-explainer diagrams. Every section includes production-ready import patterns, known gotchas, and working code examples.

---

## Mermaid.js — Diagramming Engine

### CDN Import (ESM)

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
</script>
```

### With ELK Layout Import

ELK provides superior auto-layout for complex graphs with many edges. Import both packages together:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0.1.4/dist/mermaid-layout-elk.esm.min.mjs';

  mermaid.registerLayoutLoaders(elkLayouts);
</script>
```

Use ELK for flowcharts with `%%{init: {"flowchart": {"defaultRenderer": "elk"}}}%%` at the top of the diagram definition.

---

### Deep Theming

**Always use `theme: 'base'`** — it exposes the full `themeVariables` object. Other themes (default, dark, forest, neutral) override variables internally and produce inconsistent results when you try to customize.

#### Full themeVariables Config Pattern

```js
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    // Background and surface
    background:         isDark ? '#0f172a' : '#ffffff',
    mainBkg:            isDark ? '#1e293b' : '#f8fafc',
    secondBkg:          isDark ? '#334155' : '#f1f5f9',
    tertiaryBkg:        isDark ? '#475569' : '#e2e8f0',

    // Borders and lines
    border1:            isDark ? '#475569' : '#cbd5e1',
    border2:            isDark ? '#334155' : '#e2e8f0',
    clusterBorder:      isDark ? '#64748b' : '#94a3b8',

    // Node fills (default, use classDef to override per-node)
    nodeBorder:         isDark ? '#64748b' : '#94a3b8',
    nodeBackground:     isDark ? '#1e293b' : '#f8fafc',

    // Text
    primaryTextColor:   isDark ? '#f1f5f9' : '#0f172a',
    secondaryTextColor: isDark ? '#cbd5e1' : '#334155',
    tertiaryTextColor:  isDark ? '#94a3b8' : '#64748b',
    edgeLabelBackground:isDark ? '#1e293b' : '#ffffff',

    // Edges and arrows
    lineColor:          isDark ? '#64748b' : '#94a3b8',
    arrowheadColor:     isDark ? '#64748b' : '#475569',

    // Sequence diagram
    actorBkg:           isDark ? '#1e293b' : '#f8fafc',
    actorBorder:        isDark ? '#475569' : '#cbd5e1',
    actorTextColor:     isDark ? '#f1f5f9' : '#0f172a',
    actorLineColor:     isDark ? '#334155' : '#e2e8f0',
    signalColor:        isDark ? '#94a3b8' : '#475569',
    signalTextColor:    isDark ? '#f1f5f9' : '#0f172a',
    activationBorderColor: isDark ? '#64748b' : '#94a3b8',
    activationBkgColor: isDark ? '#334155' : '#e2e8f0',
    noteBkgColor:       isDark ? '#1e3a2f' : '#ecfdf5',
    noteBorderColor:    isDark ? '#166534' : '#86efac',
    noteTextColor:      isDark ? '#86efac' : '#166534',

    // ER diagram
    attributeBackgroundColorEven: isDark ? '#1e293b' : '#f8fafc',
    attributeBackgroundColorOdd:  isDark ? '#334155' : '#f1f5f9',

    // Pie chart
    pie1: isDark ? '#0ea5e9' : '#0284c7',
    pie2: isDark ? '#10b981' : '#059669',
    pie3: isDark ? '#f59e0b' : '#d97706',
    pie4: isDark ? '#ef4444' : '#dc2626',
    pie5: isDark ? '#ec4899' : '#db2777',
    pie6: isDark ? '#14b8a6' : '#0d9488',
    pie7: isDark ? '#f97316' : '#ea580c',
    pie8: isDark ? '#6366f1' : '#4f46e5',
    pieTextColor:       isDark ? '#f1f5f9' : '#0f172a',
    pieSectionTextColor:isDark ? '#ffffff' : '#ffffff',
    pieLegendTextColor: isDark ? '#f1f5f9' : '#0f172a',

    // State diagram
    fillType0: isDark ? '#1e293b' : '#f8fafc',
    fillType1: isDark ? '#0c4a6e' : '#e0f2fe',
    fillType2: isDark ? '#134e4a' : '#ccfbf1',
    fillType3: isDark ? '#422006' : '#fef9c3',
    fillType4: isDark ? '#3b0764' : '#faf5ff',
    fillType5: isDark ? '#1c1917' : '#fafaf9',
    fillType6: isDark ? '#1a1a2e' : '#eff6ff',
    fillType7: isDark ? '#2d1b69' : '#f5f3ff',

    // Font
    fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
    fontSize:   '14px',
  }
});
```

---

### FORBIDDEN Colors

Never use these colors anywhere in a diagram — not in `classDef`, not in `themeVariables`, not in inline styles:

| Color | Hex | Why |
|-------|-----|-----|
| Indigo | `#8b5cf6` | Clashes with semantic accent usage |
| Violet dark | `#7c3aed` | Same family, banned |
| Indigo light | `#a78bfa` | Same family, banned |
| Fuchsia | `#d946ef` | Too vibrant, inaccessible contrast on both themes |

Use blue (`#0ea5e9`, `#0284c7`), teal (`#14b8a6`), emerald (`#10b981`), amber (`#f59e0b`), or rose (`#f43f5e`) instead.

---

### CSS Overrides on Mermaid SVG

Mermaid renders into an SVG. These selectors patch common rendering issues:

```css
/* Node label typography */
.mermaid .nodeLabel,
.mermaid .label {
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
}

/* Edge label background transparency */
.mermaid .edgeLabel {
  background: transparent !important;
}
.mermaid .edgeLabel rect {
  opacity: 0.85 !important;
}

/* Force node shape fills to respect theme */
.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon,
.mermaid .node path {
  stroke-width: 1.5px !important;
}

/* Edge paths */
.mermaid .edgePath .path {
  stroke-width: 1.5px !important;
}

/* Cluster (subgraph) styling */
.mermaid .cluster rect {
  rx: 6px !important;
  ry: 6px !important;
  stroke-dasharray: 4 3 !important;
}

/* Remove default drop shadow artifacts */
.mermaid svg {
  overflow: visible !important;
}
```

---

### classDef Gotchas

**Never set `color:` in a classDef.** Mermaid uses `color` for the text fill but the behavior is inconsistent across node shapes. Setting it often makes text invisible on dark backgrounds.

Instead, control text color via `themeVariables.primaryTextColor`.

**Use semi-transparent fills** to let the background color show through on both light and dark themes:

```
classDef highlight fill:#0ea5e920,stroke:#0ea5e9,stroke-width:2px
classDef warning  fill:#f59e0b20,stroke:#f59e0b,stroke-width:2px
classDef error    fill:#ef444420,stroke:#ef4444,stroke-width:2px
classDef success  fill:#10b98120,stroke:#10b981,stroke-width:2px
classDef muted    fill:#94a3b820,stroke:#94a3b8,stroke-width:1px
```

The `20` hex suffix = 12.5% opacity. Use `40` (25%) for stronger fill. Never use fully opaque fills for general nodes — they break dark mode.

---

### Node Label Special Characters and Quoting Rules

Mermaid node IDs must be plain alphanumeric + underscore. Labels can be richer but require quoting.

| Situation | Syntax |
|-----------|--------|
| Label with spaces | `A["my label"]` |
| Label with parentheses | `A["process (v2)"]` |
| Label with colon | `A["key: value"]` |
| Label with angle brackets | `A["output &lt;type&gt;"]` — use HTML entities |
| Label with pipe character | `A["a &#124; b"]` — escape with HTML entity |
| Label with quotes inside | `A["say 'hello'"]` — single quotes ok inside double |
| Multiline label | `A["line one<br/>line two"]` — use `<br/>` inside quotes |
| Markdown in label | `A["\`**bold**\`"]` — backtick wrapping for markdown |

**Never use raw `#`, `{`, `}`, `[`, `]` inside unquoted labels.** They break the parser silently.

---

### stateDiagram-v2 Label Limitations

`stateDiagram-v2` has stricter label parsing than flowchart:

- State labels **cannot** contain colons. `state "my: label" as X` will fail. Use a dash or space instead.
- Transition labels after `-->` must be plain text after the colon: `A --> B : simple label`. No HTML.
- `note` blocks do not support HTML entities.
- Avoid parentheses in state names — use the `as` alias form: `state "Processing (async)" as proc`.
- Nested `state` blocks (composite states) work but limit depth to 2 — deeper nesting breaks layout.
- `[*]` is the only special identifier. Do not use it as a regular state ID.

---

### Writing Valid Mermaid

Rules that prevent the most common silent parse failures:

**Quote all labels that contain non-alphanumeric characters.**
```
flowchart TD
  A["User Input"] --> B["Validate & Parse"]
  B --> C["Store Result"]
```

**Simple IDs only — no spaces, no dashes.**
```
flowchart TD
  userInput --> validateParse --> storeResult
```

**Maximum 15–20 nodes per diagram.** Above 20, layout engines struggle and edge labels overlap. Split into sub-diagrams or use a different diagram type.

**Arrow styles:**
```
-->    standard arrow
---    line without arrow
-.->   dotted arrow
==>    thick arrow
--o    circle end
--x    cross end
```

**Escape pipes in flowchart edge labels:**
```
A -- "option &#124; fallback" --> B
```

**Sequence diagram messages must be plain text.** No HTML, no entities:
```
sequenceDiagram
  Alice->>Bob: Request data
  Bob-->>Alice: Return result
```
Participants with spaces must be quoted:
```
  participant "API Gateway" as GW
```

**subgraph titles must be quoted if they contain spaces:**
```
subgraph "Data Layer"
  db[(Database)]
end
```

---

### Layout Direction

| Direction | Code | Best for |
|-----------|------|----------|
| Top-to-bottom | `flowchart TD` | Pipelines, flows with clear start/end |
| Left-to-right | `flowchart LR` | State machines, timelines, dependency trees |
| Bottom-to-top | `flowchart BT` | Rarely used — inverted hierarchies |
| Right-to-left | `flowchart RL` | Rarely used — reverse flows |

**Default to `TD` for most diagrams.** Switch to `LR` when node count is high and node labels are long — LR gives labels more horizontal space.

Use ELK renderer (`%%{init: {"flowchart": {"defaultRenderer": "elk"}}}%%`) for graphs where automatic edge routing matters more than directional clarity.

---

### Diagram Type Examples

#### Flowchart

```
flowchart TD
  A([Start]) --> B["Fetch sources"]
  B --> C{New items?}
  C -- Yes --> D["Normalize"]
  C -- No  --> E([End])
  D --> F["Score & rank"]
  F --> G["Emit digest"]
  G --> E

  classDef step  fill:#0ea5e920,stroke:#0ea5e9,stroke-width:1.5px
  classDef term  fill:#10b98120,stroke:#10b981,stroke-width:1.5px
  classDef gate  fill:#f59e0b20,stroke:#f59e0b,stroke-width:1.5px

  class B,D,F,G step
  class A,E term
  class C gate
```

#### Sequence Diagram

```
sequenceDiagram
  participant U as User
  participant API as API Gateway
  participant DB as Database

  U->>API: POST /query
  API->>DB: SELECT items WHERE ...
  DB-->>API: rows[]
  API-->>U: JSON response

  note over API: Rate limit: 100 req/min
```

#### ER Diagram

```
erDiagram
  SOURCE {
    string id PK
    string name
    string class
    boolean enabled
  }
  ARTIFACT {
    string id PK
    string sourceId FK
    string title
    int score
    string cadenceClass
  }
  SOURCE ||--o{ ARTIFACT : "produces"
```

#### State Diagram

```
stateDiagram-v2
  [*] --> Idle
  Idle --> Fetching : trigger digest
  Fetching --> Normalizing : items received
  Fetching --> Idle : no new items
  Normalizing --> Scoring
  Scoring --> Emitting
  Emitting --> Idle
  Emitting --> [*] : shutdown signal
```

#### Mind Map

```
mindmap
  root((Signal Scout))
    Sources
      GitHub
      Telegram
      Reddit
      HN
    Pipeline
      Fetch
      Normalize
      Score
      Digest
    Lookup
      Query
      Rank
      Recommend
    Output
      Daily digest
      Research notes
      Skill pack
```

---

### Dark Mode Handling

Full pattern for rendering a Mermaid diagram that responds to system color scheme:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

  function buildTheme(isDark) {
    return {
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background:          isDark ? '#0f172a' : '#ffffff',
        mainBkg:             isDark ? '#1e293b' : '#f8fafc',
        primaryTextColor:    isDark ? '#f1f5f9' : '#0f172a',
        secondaryTextColor:  isDark ? '#cbd5e1' : '#334155',
        lineColor:           isDark ? '#64748b' : '#94a3b8',
        edgeLabelBackground: isDark ? '#1e293b' : '#ffffff',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '14px',
      }
    };
  }

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mermaid.initialize(buildTheme(mq.matches));

  // Render all .mermaid elements manually
  const targets = document.querySelectorAll('.mermaid');
  for (const el of targets) {
    const { svg } = await mermaid.render(
      'mermaid-' + Math.random().toString(36).slice(2),
      el.textContent.trim()
    );
    el.innerHTML = svg;
  }

  // Re-render on scheme change
  mq.addEventListener('change', () => location.reload());
</script>
```

---

## Chart.js — Data Visualizations

### CDN Import

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
```

### Example with isDark Theme Handling

```html
<canvas id="myChart" width="700" height="350"></canvas>

<script>
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const textColor  = isDark ? '#cbd5e1' : '#334155';
  const gridColor  = isDark ? '#1e293b' : '#f1f5f9';
  const borderColor = isDark ? '#475569' : '#e2e8f0';

  const ctx = document.getElementById('myChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',  // 'line', 'pie', 'doughnut', 'radar', 'scatter', 'bubble'
    data: {
      labels: ['Fetch', 'Normalize', 'Score', 'Digest', 'Lookup'],
      datasets: [{
        label: 'Processing time (ms)',
        data: [120, 45, 30, 20, 15],
        backgroundColor: [
          '#0ea5e930',
          '#10b98130',
          '#f59e0b30',
          '#ef444430',
          '#14b8a630',
        ],
        borderColor: [
          '#0ea5e9',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#14b8a6',
        ],
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'IBM Plex Mono', size: 12 } }
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: borderColor,
          borderWidth: 1,
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { family: 'IBM Plex Mono', size: 12 } },
          grid:  { color: gridColor }
        },
        y: {
          ticks: { color: textColor, font: { family: 'IBM Plex Mono', size: 12 } },
          grid:  { color: gridColor }
        }
      }
    }
  });
</script>
```

### Container CSS

```css
.chart-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

canvas {
  display: block;
  width: 100% !important;
  height: auto !important;
}
```

---

## anime.js — Orchestrated Animations

### CDN Import

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js"></script>
```

### Example: Stagger, Stroke Animation, Count-Up

```js
// Guard: respect user motion preference
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {

  // 1. Staggered card entrance
  anime({
    targets: '.card',
    opacity:   [0, 1],
    translateY:[24, 0],
    duration:  600,
    delay:     anime.stagger(80, { start: 200 }),
    easing:    'easeOutCubic',
  });

  // 2. SVG stroke draw-on
  anime({
    targets: '.diagram-path',
    strokeDashoffset: [anime.setDashoffset, 0],
    duration: 1200,
    delay:    anime.stagger(150),
    easing:   'easeInOutSine',
    begin(anim) {
      anim.animatables.forEach(a => {
        a.target.style.visibility = 'visible';
      });
    }
  });

  // 3. Count-up number animation
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const obj = { value: 0 };
    anime({
      targets: obj,
      value: target,
      round: 1,
      duration: 1000,
      easing: 'easeOutExpo',
      delay: 300,
      update() { el.textContent = obj.value.toLocaleString(); }
    });
  });

  // 4. Timeline: sequence multiple animations
  const tl = anime.timeline({ easing: 'easeOutExpo', duration: 500 });
  tl
    .add({ targets: '.header', opacity: [0, 1], translateY: [-20, 0] })
    .add({ targets: '.subheader', opacity: [0, 1], translateY: [-12, 0] }, '-=300')
    .add({ targets: '.body-content', opacity: [0, 1] }, '-=200');

} else {
  // Reduced motion: make everything immediately visible
  document.querySelectorAll('.card, .header, .subheader, .body-content').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}
```

### prefers-reduced-motion Check

Always wrap anime.js calls in a motion preference guard. Users who have enabled reduced motion in their OS expect no decorative animations.

```js
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

function animate() {
  if (motion.matches) return;
  // all anime() calls here
}

animate();
motion.addEventListener('change', () => location.reload());
```

---

## Google Fonts — Typography

### FORBIDDEN as --font-body

Never use these as the primary body font — they produce generic, forgettable visuals that undercut the craft of a production diagram:

- `Inter`
- `Roboto`
- `Arial`
- `Helvetica`
- `system-ui` alone (acceptable as fallback, not as the only declaration)

These are the default choices and produce output that looks like a default browser page. The goal is a distinctive, intentional typographic voice.

---

### Font Pairings Table

| # | Body | Mono / Code | Feel | Use for |
|---|------|-------------|------|---------|
| 1 | `Lora` | `IBM Plex Mono` | Editorial, scholarly | Research notes, baselines, long-form explainers |
| 2 | `Source Serif 4` | `Fira Code` | Technical, readable | Technical docs, pipeline diagrams |
| 3 | `Playfair Display` | `JetBrains Mono` | High contrast, elegant | Executive summaries, key findings |
| 4 | `Merriweather` | `Source Code Pro` | Dense, authoritative | Policy docs, audit reports |
| 5 | `Libre Baskerville` | `Inconsolata` | Classic, neutral | General purpose, safe default |
| 6 | `DM Serif Display` | `IBM Plex Mono` | Modern editorial | Dashboards, product overviews |
| 7 | `Cormorant Garamond` | `Fira Code` | Refined, literary | Narrative visualizations |
| 8 | `Spectral` | `JetBrains Mono` | Crisp, minimal | Minimalist diagrams, whitespace-heavy layouts |
| 9 | `PT Serif` | `PT Mono` | Coherent family | Consistent mono-family aesthetic |
| 10 | `Crimson Pro` | `Roboto Mono` | Warm, humanist | Case studies, user-facing explainers |
| 11 | `EB Garamond` | `Courier Prime` | Historical, warm | Timelines, retrospectives |
| 12 | `Newsreader` | `Space Mono` | Journalistic | Data journalism, analytical charts |
| 13 | `Fraunces` | `IBM Plex Mono` | Expressive, distinctive | Marketing-adjacent technical content |

**Google Fonts import pattern** (load only weights you need, add `&display=swap`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**CSS custom properties pattern:**

```css
:root {
  --font-body: 'Lora', Georgia, serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace;
  --font-size-base: clamp(15px, 1.6vw, 17px);
  --line-height-base: 1.65;
  --line-height-mono: 1.5;
}

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

code, pre, .mermaid, .label {
  font-family: var(--font-mono);
  line-height: var(--line-height-mono);
}
```

---

### Typography by Content Voice Table

| Content voice | Recommended pairing | Weights to load | Notes |
|---------------|--------------------|--------------------|-------|
| Analytical / data-heavy | `Source Serif 4` + `Fira Code` | 400, 600 body; 400 mono | High readability at small sizes |
| Narrative / editorial | `Lora` + `IBM Plex Mono` | 400, 600, italic body; 400, 500 mono | Italic adds rhythm to callouts |
| Executive / summary | `Playfair Display` + `JetBrains Mono` | 700 heading only; 400 mono | Never use Playfair for body at 14px — too ornate |
| Minimal / technical | `Spectral` + `JetBrains Mono` | 400, 500 body; 400 mono | Good for whitespace-first layouts |
| Warm / accessible | `Crimson Pro` + `Roboto Mono` | 400, 600, italic; 400 mono | Wide language support |
| Timelines / history | `EB Garamond` + `Courier Prime` | 400, italic; 400 mono | `Courier Prime` reads cleanly at 13px+ |
| Dashboards | `DM Serif Display` + `IBM Plex Mono` | 400 heading; 400, 500 mono | Mix DM Serif for headings only, not body |
| Data journalism | `Newsreader` + `Space Mono` | 400, 600, italic; 400 mono | `Space Mono` has strong geometric character |

**Heading weight guidance:**
- Use bold (600–700) only for H1 and H2.
- H3 and below: use 500 or regular with letter-spacing instead of bold.
- Never use font-weight 800+ for body or data label text.

**Size scale (clamp-based, responsive):**

```css
:root {
  --text-xs:   clamp(11px, 1.1vw, 12px);
  --text-sm:   clamp(13px, 1.3vw, 14px);
  --text-base: clamp(15px, 1.6vw, 17px);
  --text-lg:   clamp(18px, 1.9vw, 20px);
  --text-xl:   clamp(22px, 2.4vw, 26px);
  --text-2xl:  clamp(28px, 3.2vw, 36px);
}
```
