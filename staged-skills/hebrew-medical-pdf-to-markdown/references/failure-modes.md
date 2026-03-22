# Failure Modes

## Rotation Trap

- A Hebrew scan may be rotated `180°`, not mirrored.
- Render, inspect, then rotate.
- Do not waste time on horizontal flips unless the image truly looks mirrored.

## Raw OCR Trap

- Tesseract can inject garbage Latin tokens such as `oy`, `nnn`, `TM`, `WN`, and similar fragments into clinically important Hebrew.
- Treat OCR as scaffolding, not source truth.

## Bidi Trap

- Hidden bidi control characters can make a file look okay while remaining fragile or corrupted.
- Prefer explicit HTML wrappers like `<div dir="rtl" align="right">...</div>`.

## Console Trap

- Terminal output may display Hebrew badly even when the file on disk is valid UTF-8.
- Trust the page image and the saved file more than a mangled console preview.

## Clinical Drift Trap

- A clean medical sentence may still be a wrong sentence.
- Do not normalize a blurry dosage, diagnosis, or symptom description into confident prose.

## Editorial Note Trap

- Keep transcriber notes out of the source text body.
- Put them only in `### Uncertainties`.

## Summary Leakage Trap

- The OCR file is not the patient summary.
- Build facts and timelines only from the validated OCR artifact.
