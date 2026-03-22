# Hebrew Medical PDF Workflow

## Goal

Convert a Hebrew medical PDF into a canonical Markdown source artifact that can safely support timelines, question lists, and knowledge-base work.

## Default Operating Model

1. Render page images first.
2. Verify orientation visually.
3. Create the canonical OCR scaffold.
4. Transcribe one page at a time from the images.
5. Use OCR only as scaffolding.
6. Validate the Markdown.
7. Run an adversarial review on clinically important lines.
8. Only then create facts, timelines, or doctor-facing summaries.

## Recommended Commands

Render pages:

```powershell
python scripts/render_pdf_pages.py `
  --pdf C:\path\to\document.pdf `
  --output-dir C:\path\to\pages `
  --rotate 180 `
  --force
```

Create a scaffold:

```powershell
python scripts/init_hebrew_markdown.py `
  --pdf document.pdf `
  --page-count 7 `
  --output C:\path\to\document.canonical-ocr.md `
  --image-dir C:\path\to\pages `
  --image-pattern page_{page}_upright.png `
  --force
```

Validate:

```powershell
python scripts/validate_hebrew_markdown.py `
  C:\path\to\document.canonical-ocr.md `
  --expected-pages 7
```

## Canonical Artifact Rules

Every medical OCR file should contain:
- one `## Metadata` section,
- one `## Page N` section per page,
- one source-page comment per page,
- one page image reference per page,
- one RTL wrapper per page,
- one `### Uncertainties` block per page.

## What Counts As Done

The OCR artifact is ready only when:
- the validator passes with no errors,
- warnings were reviewed and accepted,
- clinically important ambiguities are explicitly flagged,
- source OCR and derived summary are separate files.
