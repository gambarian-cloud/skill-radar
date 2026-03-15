---
name: frontend-slides
description: Create stunning, animation-rich HTML presentations from scratch or by converting PowerPoint files. Use when the user wants to build a presentation, convert a PPT/PPTX to web, or create slides for a talk/pitch. Helps non-designers discover their aesthetic through visual exploration rather than abstract choices.
attribution: "by Alena Zakharova (MIT) · https://github.com/alenazaharovaux/share"
---

# Frontend Slides Skill

Create zero-dependency, animation-rich HTML presentations that run entirely in the browser. This skill helps non-designers discover their preferred aesthetic through visual exploration ("show, don't tell"), then generates production-quality slide decks.

## Core Philosophy

1. **Zero Dependencies** — Single HTML files with inline CSS/JS. No npm, no build tools.
2. **Show, Don't Tell** — People don't know what they want until they see it. Generate visual previews, not abstract choices.
3. **Distinctive Design** — Avoid generic "AI slop" aesthetics. Every presentation should feel custom-crafted.
4. **Production Quality** — Code should be well-commented, accessible, and performant.
5. **Viewport Fitting (CRITICAL)** — Every slide MUST fit exactly within the viewport. No scrolling within slides, ever. This is non-negotiable.

---

## CRITICAL: Viewport Fitting Requirements

**This section is mandatory for ALL presentations. Every slide must be fully visible without scrolling on any screen size.**

### The Golden Rule

```
Each slide = exactly one viewport height (100vh/100dvh)
Content overflows? → Split into multiple slides or reduce content
Never scroll within a slide.
```

### Content Density Limits

To guarantee viewport fitting, enforce these limits per slide:

| Slide Type | Maximum Content |
|------------|-----------------|
| Title slide | 1 heading + 1 subtitle + optional tagline |
| Content slide | 1 heading + 4-6 bullet points OR 1 heading + 2 paragraphs |
| Feature grid | 1 heading + 6 cards maximum (2x3 or 3x2 grid) |
| Code slide | 1 heading + 8-10 lines of code maximum |
| Quote slide | 1 quote (max 3 lines) + attribution |
| Image slide | 1 heading + 1 image (max 60vh height) |

**If content exceeds these limits → Split into multiple slides**

### Required CSS Architecture

Every presentation MUST include this base CSS for viewport fitting:

```css
html, body {
    height: 100%;
    overflow-x: hidden;
}

html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
}

.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
}

:root {
    --title-size: clamp(1.5rem, 5vw, 4rem);
    --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
    --h3-size: clamp(1rem, 2.5vw, 1.75rem);
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --small-size: clamp(0.65rem, 1vw, 0.875rem);
    --slide-padding: clamp(1rem, 4vw, 4rem);
    --content-gap: clamp(0.5rem, 2vw, 2rem);
    --element-gap: clamp(0.25rem, 1vw, 1rem);
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.2s !important;
    }
    html { scroll-behavior: auto; }
}
```

### When Content Doesn't Fit

**DO:** Split into multiple slides, reduce bullet points (max 5-6), shorten text, use smaller code snippets, create a "continued" slide.

**DON'T:** Reduce font size below readable limits, remove padding entirely, allow any scrolling, cram content to fit.

---

## Phase 0: Detect Mode

- **Mode A: New Presentation** — Proceed to Phase 1 (Content Discovery)
- **Mode B: PPT Conversion** — Proceed to Phase 4 (PPT Extraction)
- **Mode C: Enhancement** — Read existing file, understand structure, enhance

---

## Phase 1: Content Discovery (New Presentations)

Ask about: purpose (pitch/teaching/conference/internal), length (short 5-10 / medium 10-20 / long 20+), and whether content is ready or needs structuring.

---

## Phase 2: Style Discovery (Visual Exploration)

**CRITICAL: This is the "show, don't tell" phase.** Generate mini-previews and let users react.

### Available Presets

| Preset | Vibe | Best For |
|--------|------|----------|
| Bold Signal | Confident, high-impact | Pitch decks, keynotes |
| Electric Studio | Clean, professional | Agency presentations |
| Creative Voltage | Energetic, retro-modern | Creative pitches |
| Dark Botanical | Elegant, sophisticated | Premium brands |
| Notebook Tabs | Editorial, organized | Reports, reviews |
| Pastel Geometry | Friendly, approachable | Product overviews |
| Split Pastel | Playful, modern | Creative agencies |
| Vintage Editorial | Witty, personality-driven | Personal brands |
| Neon Cyber | Futuristic, techy | Tech startups |
| Terminal Green | Developer-focused | Dev tools, APIs |
| Swiss Modern | Minimal, precise | Corporate, data |
| Paper & Ink | Literary, thoughtful | Storytelling |

Users can either pick directly or go through guided discovery (mood questions → 3 previews generated in `.claude-design/slide-previews/`).

**IMPORTANT: Never use these generic patterns:** Purple gradients on white, Inter/Roboto/system fonts, standard blue primary, predictable hero layouts.

---

## Phase 3: Generate Presentation

Single self-contained HTML file with inline CSS/JS. Must include:

1. **SlidePresentation Class** — keyboard nav (arrows, space), touch/swipe, mouse wheel, progress bar, nav dots
2. **Intersection Observer** — scroll-triggered animations via `.visible` class
3. **Optional enhancements** based on style: custom cursor, particles, parallax, 3D tilt, magnetic buttons, counter animations

### Code Quality

- Every section has clear comments
- Semantic HTML (`<section>`, `<nav>`, `<main>`)
- Keyboard navigation works
- ARIA labels where needed
- `prefers-reduced-motion` support

---

## Phase 4: PPT Conversion

Extract content via `python-pptx`, confirm structure with user, then style and generate HTML.

---

## Phase 5: Delivery

1. Clean up `.claude-design/slide-previews/` if exists
2. Open the presentation in browser
3. Provide navigation instructions and customization guide

---

## Style Reference: Effect → Feeling Mapping

| Feeling | Effects |
|---------|---------|
| Dramatic/Cinematic | Slow fade-ins (1-1.5s), large scale transitions, dark backgrounds, parallax |
| Techy/Futuristic | Neon glow, particles, grid patterns, monospace accents, glitch effects |
| Playful/Friendly | Bouncy easing, rounded corners, pastel/bright colors, floating animations |
| Professional/Corporate | Subtle fast animations (200-300ms), clean sans-serif, navy/slate/charcoal |
| Calm/Minimal | Very slow subtle motion, high whitespace, muted palette, serif typography |
| Editorial/Magazine | Strong typography hierarchy, pull quotes, image-text interplay, grid-breaking |

---

*Skill by [Alena Zakharova](https://github.com/alenazaharovaux) · MIT License*
*Published in [alenazaharovaux/share](https://github.com/alenazaharovaux/share)*
