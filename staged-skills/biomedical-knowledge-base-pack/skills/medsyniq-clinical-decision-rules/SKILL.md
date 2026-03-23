---
name: Clinical Decision Rules
description: Application of validated CDRs including Wells, Geneva, CURB-65, CHA2DS2-VASc, HEART, HAS-BLED, Ottawa, and Canadian C-spine rules with validation context
origin: ECMed
---

# Clinical Decision Rules

## Purpose

Clinical decision rules (CDRs) are systematically derived, validated tools that quantify the contribution of clinical findings to diagnosis, prognosis, or treatment response. This skill covers when to apply CDRs, how to interpret them, and their validation status.

## Validation Levels

CDRs progress through validation stages (McGinn et al., JAMA 2000):

1. **Derivation** — Rule created from a single dataset. Not ready for clinical use.
2. **Narrow validation** — Tested prospectively in one similar setting. Use with caution.
3. **Broad validation** — Validated across multiple settings and populations. Appropriate for clinical use.
4. **Impact analysis** — Demonstrated to improve outcomes, reduce costs, or change behavior when implemented. Gold standard.

Always ascertain the validation level before relying on a CDR in practice.

## Venous Thromboembolism

### Wells Score for PE

Validated across multiple settings. Two versions exist (original and simplified).

| Criterion | Points |
|---|---|
| Clinical signs/symptoms of DVT | 3.0 |
| PE is #1 diagnosis or equally likely | 3.0 |
| Heart rate > 100 bpm | 1.5 |
| Immobilization ≥ 3 days or surgery in prior 4 weeks | 1.5 |
| Previous PE or DVT | 1.5 |
| Hemoptysis | 1.0 |
| Malignancy (treatment within 6 months or palliative) | 1.0 |

**Three-tier**: Low (0-1), Moderate (2-6), High (≥7). **Two-tier**: Unlikely (≤4), Likely (>4).

Combined with D-dimer: PE unlikely + negative D-dimer has NPV >99%. Apply PERC rule first in very low-risk patients.

### Revised Geneva Score

Alternative to Wells, uses only objective criteria (no subjective "PE equally likely" variable).

### Wells Score for DVT

Separate score from PE Wells. Score ≤0 combined with negative D-dimer effectively excludes DVT.

## Cardiac

### HEART Score (Chest Pain)

For risk stratification of acute chest pain in ED patients.

| Component | 0 | 1 | 2 |
|---|---|---|---|
| History | Slightly suspicious | Moderately suspicious | Highly suspicious |
| ECG | Normal | Non-specific repolarization | Significant ST deviation |
| Age | <45 | 45-64 | ≥65 |
| Risk factors | None | 1-2 | ≥3 or atherosclerotic disease |
| Troponin | ≤ normal | 1-3× normal | >3× normal |

Score 0-3: Low risk (0.9-1.7% MACE at 6 weeks) — consider discharge. Score 4-6: Moderate. Score 7-10: High risk (50-65% MACE).

### CHA₂DS₂-VASc (Stroke Risk in AF)

| Criterion | Points |
|---|---|
| Congestive heart failure | 1 |
| Hypertension | 1 |
| Age ≥ 75 | 2 |
| Diabetes mellitus | 1 |
| Stroke/TIA/thromboembolism | 2 |
| Vascular disease | 1 |
| Age 65-74 | 1 |
| Sex category (female) | 1 |

Score 0 (male) or 1 (female): No anticoagulation. Score 1 (male): Consider anticoagulation. Score ≥2: Anticoagulation recommended (ESC 2020 guidelines).

### HAS-BLED (Bleeding Risk)

| Criterion | Points |
|---|---|
| Hypertension (uncontrolled, >160 systolic) | 1 |
| Abnormal renal/liver function (1 each) | 1 or 2 |
| Stroke history | 1 |
| Bleeding history or predisposition | 1 |
| Labile INR (TTR <60%) | 1 |
| Elderly (>65) | 1 |
| Drugs (antiplatelets, NSAIDs) or alcohol (1 each) | 1 or 2 |

Score ≥3: High bleeding risk. Does NOT contraindicate anticoagulation — rather, it identifies modifiable risk factors and prompts closer monitoring.

## Respiratory

### CURB-65 (Pneumonia Severity)

| Criterion | Points |
|---|---|
| Confusion (AMT ≤8 or new disorientation) | 1 |
| Urea > 7 mmol/L (BUN > 19.6 mg/dL) | 1 |
| Respiratory rate ≥ 30 | 1 |
| Blood pressure (SBP < 90 or DBP ≤ 60) | 1 |
| Age ≥ 65 | 1 |

Score 0-1: Outpatient. Score 2: Consider short admission or hospital-supervised outpatient. Score 3-5: Inpatient (score ≥4 consider ICU).

CRB-65 (no urea) available for primary care.

## Musculoskeletal

### Ottawa Ankle Rules

Imaging indicated if there is pain in the malleolar zone AND any of:
- Bone tenderness at posterior edge or tip of lateral malleolus (distal 6 cm)
- Bone tenderness at posterior edge or tip of medial malleolus (distal 6 cm)
- Inability to weight-bear (4 steps) immediately and in the ED

Sensitivity approaches 100% for significant fractures. Validated extensively including in pediatric populations (>5 years).

### Ottawa Knee Rules

Imaging indicated if any of:
- Age ≥ 55
- Tenderness at head of fibula
- Isolated tenderness of patella
- Inability to flex to 90 degrees
- Inability to weight-bear (4 steps) immediately and in the ED

### Canadian C-Spine Rule

Three-step algorithm (Stiell et al.):

1. Any high-risk factor mandating radiography? (Age ≥65, dangerous mechanism, paresthesias in extremities) → If yes, image.
2. Any low-risk factor allowing safe range-of-motion assessment? (Simple rear-end MVC, sitting position in ED, ambulatory, delayed onset neck pain, absence of midline tenderness) → If no low-risk factor, image.
3. Can patient actively rotate neck 45° left and right? → If no, image.

Superior sensitivity to NEXUS criteria. Validated with broad impact analysis.

## Implementation Principles

- **Apply CDRs to appropriate populations** — Most are validated for specific settings (e.g., ED, primary care) and populations. Using them outside the derivation context reduces reliability.
- **CDRs supplement, not replace, clinical judgment** — A rule may suggest low risk, but clinical concern can override.
- **Document the score** — Record the CDR used, the score, and the resulting decision.
- **Beware CDR overuse** — Applying a CDR when pre-test probability is negligible (e.g., Wells score in a patient with no clinical suspicion for PE) is wasteful and can paradoxically increase testing.
- **Combine CDRs with biomarkers** — Many CDRs are designed to integrate with laboratory tests (e.g., Wells + D-dimer, HEART + serial troponin).

## When CDRs Fail

CDRs may underperform in:

- Populations excluded from derivation studies (pregnant, pediatric, elderly, multimorbid)
- Atypical presentations
- Settings with different disease prevalence than derivation cohorts
- When applied by providers unfamiliar with the criteria definitions

Always consider whether the specific patient in front of you fits within the validated population.
