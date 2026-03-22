---
name: hebrew-medical-pdf-to-markdown
description: Convert scanned Hebrew medical PDFs into source-faithful Markdown with RTL-safe structure, page provenance, uncertainty tracking, and stricter medical QA for dosages, dates, pathology markers, diagnoses, and clinical events. Use when Codex needs to read Hebrew medical records, oncology notes, neurology notes, pathology summaries, discharge letters, or mixed Hebrew-English clinical PDFs without silently cleaning or summarizing away source detail.
---

# Hebrew Medical PDF To Markdown

Use this skill when the PDF is medical and source accuracy matters more than smooth prose.

## Workflow

1. Render page images before trusting any extraction.
   - Run `scripts/render_pdf_pages.py`.
   - Inspect page 1 visually.
   - If the scan is upside down, rerun with `--rotate 180`.
   - Do not assume a horizontal flip is the fix.

2. Create a canonical OCR scaffold.
   - Run `scripts/init_hebrew_markdown.py`.
   - Keep one `## Page N` block per source page.
   - Keep one `### Uncertainties` block per page.

3. Transcribe from images page by page.
   - Prefer direct visual reading by the model.
   - Treat Tesseract or other OCR as a rough draft only.
   - Keep the original language.
   - Keep physician text separate from transcriber commentary.
   - If you want a reusable extraction prompt, read [references/medical-page-ocr-prompt.md](./references/medical-page-ocr-prompt.md).

4. Apply medical-grade review rules.
   - Review every medication line, dosage line, date, pathology marker, diagnosis line, procedure line, and seizure / aura description against the image.
   - If a field is clinically important and blurry, preserve only what is visible and record the gap in `### Uncertainties`.
   - If a line is editorially normalized, say so in `### Uncertainties`, not in the source text body.

5. Validate the file.
   - Run `scripts/validate_hebrew_markdown.py <file> --expected-pages N`.
   - Fix encoding damage, bidi issues, missing page sections, or missing wrappers before downstream use.

6. Run an adversarial review on the final OCR.
   - Review the canonical Markdown against page images, not against rough OCR.
   - If you want a reusable review rubric, read [references/medical-review-rubric.md](./references/medical-review-rubric.md).

## Non-Negotiable Rules

- Do not translate inside the OCR file.
- Do not summarize inside the OCR file.
- Do not write transcriber notes as if they were physician notes.
- Do not silently rewrite blurry text into cleaner medical wording.
- Keep OCR and downstream facts/timeline files separate.

## Read These References When Needed

- Read [references/medical-workflow.md](./references/medical-workflow.md) for the operating model and commands.
- Read [references/medical-risk-fields.md](./references/medical-risk-fields.md) before reviewing dosages, dates, markers, and procedures.
- Read [references/failure-modes.md](./references/failure-modes.md) when OCR output looks suspicious.

## Bundled Scripts

- `scripts/render_pdf_pages.py`: render PDFs to PNGs and rotate them upright.
- `scripts/init_hebrew_markdown.py`: generate the canonical Markdown scaffold.
- `scripts/validate_hebrew_markdown.py`: catch structure, mojibake, and bidi problems before downstream use.
