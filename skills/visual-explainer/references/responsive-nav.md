# Responsive Section Navigation

Navigation pattern for multi-section pages (reviews, recaps, dashboards). Provides a sticky sidebar TOC on desktop and a sticky horizontal scrollable bar on mobile.

## Layout Structure

Two-column CSS Grid: sidebar (TOC) + main content.

```html
<div class="wrap">
  <nav class="toc">
    <p class="toc-title">Contents</p>
    <a href="#section-1" class="toc-link active">Section One</a>
    <a href="#section-2" class="toc-link">Section Two</a>
    <a href="#section-3" class="toc-link">Section Three</a>
    <a href="#section-4" class="toc-link">Section Four</a>
  </nav>
  <div class="main">
    <section id="section-1">...</section>
    <section id="section-2">...</section>
    <section id="section-3">...</section>
    <section id="section-4">...</section>
  </div>
</div>
```

Key structural rules:
- Each section must have a matching `id` that corresponds to a TOC link `href`
- The `.wrap` element is the grid container
- `.toc` and `.main` are direct children of `.wrap`

## CSS

### Wrap (grid layout)

```css
.wrap {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 0 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  align-items: start;
}
```

### TOC — Desktop (sticky sidebar)

```css
.toc {
  position: sticky;
  top: 24px;
  align-self: start;
  padding: 16px 0;
}

.toc-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin: 0 0 12px 0;
  padding-left: 12px;
}

.toc-link {
  display: block;
  padding: 6px 12px;
  font-size: 0.82rem;
  color: #555;
  text-decoration: none;
  border-left: 2px solid transparent;
  line-height: 1.4;
  transition: color 0.15s, border-color 0.15s;
}

.toc-link:hover {
  color: #111;
}

.toc-link.active {
  color: #111;
  font-weight: 600;
  border-left-color: #2563eb; /* accent color — adjust per page */
}
```

### TOC — Mobile (sticky horizontal bar)

```css
@media (max-width: 1000px) {
  .wrap {
    display: block;
    padding: 0 16px;
  }

  .toc {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    display: flex;
    flex-direction: row;
    gap: 0;
    padding: 0;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE */
    border-bottom: 1px solid #e5e7eb;
    margin: 0 -16px 24px;
    padding: 0 16px;
  }

  .toc::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .toc-title {
    display: none;
  }

  .toc-link {
    flex-shrink: 0;
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 10px 14px;
    white-space: nowrap;
    font-size: 0.83rem;
  }

  .toc-link.active {
    border-left-color: transparent;
    border-bottom-color: #2563eb; /* accent color — adjust per page */
  }

  section {
    scroll-margin-top: 48px; /* height of sticky bar + small gap */
  }
}
```

## JavaScript — Scroll Spy

```javascript
(function () {
  const links = document.querySelectorAll('.toc-link');
  const sections = Array.from(links).map(link =>
    document.querySelector(link.getAttribute('href'))
  ).filter(Boolean);

  function setActive(id) {
    links.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);

      // Auto-scroll active tab into view on mobile
      if (isActive && window.innerWidth <= 1000) {
        link.scrollIntoView({ inline: 'nearest', block: 'nearest' });
      }
    });
  }

  // IntersectionObserver scroll spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    rootMargin: '-10% 0px -80% 0px'
  });

  sections.forEach(section => observer.observe(section));

  // Smooth scroll on click + clean URL update
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', link.getAttribute('href'));
      }
    });
  });
})();
```

## Adaptation Notes

- Change `.toc-title` text, link labels, and `href`/`id` pairs per page.
- Change the accent color (`#2563eb`) to match the page palette — one place in desktop CSS, one in mobile CSS.
- Skip the TOC entirely for pages with fewer than 4 sections; a TOC adds complexity without value below that threshold.
- Grid column width of `170px` works for most nav label lengths. Increase to up to `200px` for longer section names before text wraps awkwardly.
- `scroll-margin-top` on mobile sections (default `48px`) should match the actual rendered height of the sticky bar. Adjust if the bar is taller due to font size or padding changes.
- The `rootMargin` value `-10% 0px -80% 0px` keeps the active highlight on whichever section occupies the upper portion of the viewport. Adjust the bottom margin if sections are very short (increase toward `-60%`) or very tall (decrease toward `-85%`).
