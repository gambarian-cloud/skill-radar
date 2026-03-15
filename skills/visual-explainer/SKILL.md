---
name: visual-explainer
description: Generate self-contained HTML pages that visually explain systems, data stories, investigations, editorial workflows, and code changes. Use when the user asks for diagrams, architecture views, visual diffs, data tables, timelines, source maps, or any structured visualization that would be painful to read as terminal output. Also activates for tables with 4+ rows or 3+ columns. Adapted from nicobailon/visual-explainer with journalism, newsroom, and academic design sensibilities.
attribution: "Adapted from nicobailon/visual-explainer (MIT) · Extended by Alena Zakharova (alenazaharovaux)"
source: "https://github.com/alenazaharovaux/share/tree/main/skills/visual-explainer"
---

# Visual explainer

Generate self-contained HTML files for technical diagrams and data visualizations. Always open the result in the browser. Never fall back to ASCII art when this skill is loaded.

**Proactive table rendering**: When about to output a table with 4+ rows or 3+ columns, render it as styled HTML instead of ASCII. Open in browser.

## Step 0: Configuration (First Run)

Read `config.md` from this skill's directory. If it doesn't exist, ask the user:

1. **Output directory**: "Where should I save generated HTML files?" (default: `~/.agent/diagrams`)
2. **Language**: "What language should I communicate in?" (default: user's language)

Write answers to `config.md`.

## Workflow

### 1. Think (5 seconds, not 5 minutes)

- **Audience**: Developer? Editor? Reporter? PM? Public reader?
- **Diagram type**: Pick from the routing table below.
- **Aesthetic direction**: Pick one that fits. Don't default to the same look every time.
  - Monochrome terminal, Editorial broadsheet, Blueprint / technical, Neon dashboard, Paper and ink, Hand-drawn sketch, IDE-inspired, Data-dense / wire service, Gradient mesh, Newsroom board, Investigation wall, Magazine feature, Academic / research paper

**The swap test**: If you replaced your styling with a generic dark theme and nobody would notice the difference, you haven't designed anything. Push further.

### 2. Structure

Read reference templates before generating:
- `./templates/architecture.html` — text-heavy architecture / editorial structure
- `./templates/mermaid-flowchart.html` — flowcharts, sequences, diagrams
- `./templates/data-table.html` — data tables, audits, comparisons

Read `./references/css-patterns.md` for CSS and layout patterns.
Read `./references/responsive-nav.md` for multi-section pages with sticky navigation.
Read `./references/libraries.md` for Mermaid theming, Chart.js, anime.js, and font pairings.

#### Rendering approach by diagram type

| Type | Approach | Rationale |
|------|----------|-----------|
| Architecture (text-heavy) | CSS Grid cards + flow arrows | Rich card content needs CSS control |
| Architecture (topology) | Mermaid | Connections need auto edge routing |
| Flowchart / pipeline | Mermaid | Auto node positioning and edge routing |
| Sequence diagram | Mermaid | Lifelines and activation boxes need layout |
| Data table / comparison | HTML `<table>` | Semantic markup and accessibility |
| Timeline / chronology | CSS (central line + cards) | Simple linear layout |
| Dashboard / metrics | CSS Grid + Chart.js | Card grid with embedded charts |
| Source network | Mermaid or CSS Grid | Map relationships between sources |
| Investigation map | CSS Grid cards + Mermaid | Connect entities, documents, events |

### 3. Style

**Typography**: Pick a distinctive font pairing from Google Fonts. Never use Inter, Roboto, Arial, or system-ui as primary. Load via `<link>` in `<head>`. Include system font fallback.

**Color**: Use CSS custom properties. Support both light and dark themes via `prefers-color-scheme`.

**Surfaces**: Build depth through subtle lightness shifts (2-4% between levels). Vary card depth to signal importance (hero, default, recessed).

**Animation**: Staggered fade-ins on page load. Mix animation types by role: `fadeUp` for cards, `fadeScale` for KPIs, `drawIn` for SVG connectors, `countUp` for hero numbers. Always respect `prefers-reduced-motion`.

**Accessibility**: WCAG 2.1 AA minimum. Color contrast 4.5:1 for text. Status indicators use shape/text alongside color. Tables have proper `<thead>`, `<th scope>`, `<caption>`.

### 4. Deliver

**Output location**: Read `output_dir` from `config.md`. Default: `~/.agent/diagrams/`
**Filename**: Descriptive, based on content.
**Open in browser** after generation. Tell user the file path.

## Quality checks

Before delivery, verify:
- **The squint test**: Can you still perceive hierarchy with blurred eyes?
- **The swap test**: Would generic dark theme be indistinguishable? Push further.
- **Both themes**: Toggle OS light/dark. Both should look intentional.
- **No overflow**: Resize browser. No clipping.
- **Mermaid zoom controls**: Every `.mermaid-wrap` needs +/-/reset buttons.
- **Accessibility**: Color contrast passes. Tables have semantic markup.
- **File opens cleanly**: No console errors, no broken fonts.

---

*Adapted from [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer) (MIT License)*
*Extended by [Alena Zakharova](https://github.com/alenazaharovaux)*
