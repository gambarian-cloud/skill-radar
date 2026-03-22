# Medical Review Rubric

Use this after the OCR draft exists.

```text
You are critically reviewing OCR output for a scanned Hebrew medical PDF.

Task:
Compare the OCR Markdown against the source page image and decide whether the OCR is safe for downstream medical note-taking.

Check for:
1. Missing words or lines.
2. Added words that do not exist on the page.
3. Wrong dates, identifiers, diagnosis names, pathology markers, dosages, names, or procedure lines.
4. Dropped headers, footers, stamps, signatures, or page numbers.
5. Broken reading order.
6. Mixed Hebrew/English directionality problems.
7. Broken table structure.
8. Places marked as certain that should have been marked uncertain.
9. Transcriber commentary embedded as if it were physician text.

Decision rules:
- PASS: no meaningful omissions or corruptions.
- WARN: minor issues, but the page is usable with explicit notes.
- FAIL: omissions, hallucinations, or structural corruption make the page unsafe.

Output format:

## Review Result
- decision: PASS | WARN | FAIL
- page: {PAGE_NUMBER}

## Findings
- [One bullet per issue, or "None."]

## Required Fixes
- [One bullet per fix, or "None."]
```
