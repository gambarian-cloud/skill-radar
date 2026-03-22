# Medical Risk Fields

Treat these as high-stakes and verify them directly against the image:

## Medications

- drug names,
- exact dosage numbers,
- daily frequency,
- split-dose schedules,
- route or formulation if present,
- start / stop / increase language.

## Diagnosis / Pathology

- diagnosis names,
- grade / WHO class,
- molecular markers,
- mutation names,
- percentages,
- KI-67, MGMT, IDH, ATRX, P53, BRAF, and similar markers.

## Clinical Events

- seizure descriptions,
- aura descriptions,
- loss of consciousness wording,
- visual phenomena,
- hearing / speech symptoms,
- symptom duration.

## Dates

- visit dates,
- imaging dates,
- surgery dates,
- study enrollment dates,
- code-opening dates,
- last-event dates.

## Structured Fields

- identifiers,
- page numbers,
- timestamps,
- codes,
- provider names,
- license numbers,
- table cells.

## Review Rule

If any of these fields are blurry:
- keep only what is clearly visible,
- do not backfill from memory,
- record the ambiguity in `### Uncertainties`.
