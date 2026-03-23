---
name: Dose Adjustment
description: Renal dosing (Cockcroft-Gault, CKD-EPI), hepatic dosing (Child-Pugh), obesity dosing (IBW, ABW, AdjBW), pediatric dosing, and geriatric considerations
origin: ECMed
---

# Dose Adjustment

## Purpose

Standard drug doses assume normal organ function, typical body composition, and adult physiology. Many patients deviate from these assumptions, requiring systematic dose adjustment to maintain efficacy while avoiding toxicity. This skill covers the frameworks and formulas used for dose individualization.

## Renal Dose Adjustment

### Why Renal Function Matters

The kidney eliminates many drugs and active metabolites. Impaired renal function leads to drug accumulation, prolonged half-life, and increased risk of dose-dependent toxicity.

### Estimating Renal Function

**Cockcroft-Gault (CrCl) — Still the Standard for Drug Dosing**

CrCl (mL/min) = [(140 - age) × weight (kg)] / [72 × serum creatinine (mg/dL)]

Multiply by 0.85 for females.

- Uses actual body weight (controversy in obesity — see below)
- Most drug labeling and FDA-approved dosing recommendations are based on Cockcroft-Gault
- Uses serum creatinine, which is affected by muscle mass, diet, and laboratory assay

**CKD-EPI (eGFR) — Standard for CKD Staging**

CKD-EPI is more accurate for GFR estimation and CKD staging but drug dosing recommendations are generally not validated against CKD-EPI. Use Cockcroft-Gault for drug dosing unless product labeling specifies eGFR.

**Creatinine limitations**: Serum creatinine may overestimate renal function in:
- Elderly (reduced muscle mass)
- Malnourished patients
- Amputees
- Critically ill (acute kidney injury — creatinine lags behind actual GFR decline)

### Dose Adjustment Strategies

**1. Dose reduction (same interval)**
- Reduce individual dose, maintain dosing frequency
- Maintains consistent drug levels but lower peaks
- Preferred for drugs where consistent exposure matters (e.g., beta-blockers)

**2. Interval extension (same dose)**
- Maintain dose, increase time between doses
- Maintains peak levels but allows more time for elimination
- Preferred for concentration-dependent drugs (e.g., aminoglycosides)

**3. Both dose and interval adjustment**
- Required for severe renal impairment with narrow therapeutic index drugs

### High-Risk Drugs in Renal Impairment

| Drug | Concern | Action |
|---|---|---|
| Metformin | Lactic acidosis | Contraindicated if eGFR <30; reduce dose if eGFR 30-45 |
| DOACs | Bleeding | Dose reduction per agent (apixaban: reduce if ≥2 criteria; rivaroxaban: avoid if CrCl <15) |
| Digoxin | Toxicity | Reduce dose; target lower serum levels; monitor K+ |
| Lithium | Toxicity | Reduce dose, increase monitoring frequency |
| Gabapentin/pregabalin | CNS toxicity | Significant dose reduction required; extend interval |
| Enoxaparin | Bleeding | Reduce to once daily if CrCl <30; consider UFH instead |
| Allopurinol | Hypersensitivity | Start low (100mg if CrCl <60), titrate slowly |
| Opioids | Accumulation of active metabolites | Avoid morphine (M6G accumulation); prefer fentanyl or hydromorphone at reduced doses |

### Dialysis Considerations

- **Dialyzable drugs**: Small molecular weight, low protein binding, low volume of distribution, water-soluble. May need supplemental dosing after dialysis.
- **Non-dialyzable drugs**: Large molecular weight, high protein binding, high Vd. No supplemental dosing needed.
- Time dosing relative to dialysis sessions when possible.

## Hepatic Dose Adjustment

### Child-Pugh Classification

| Parameter | 1 Point | 2 Points | 3 Points |
|---|---|---|---|
| Bilirubin (mg/dL) | <2 | 2-3 | >3 |
| Albumin (g/dL) | >3.5 | 2.8-3.5 | <2.8 |
| INR | <1.7 | 1.7-2.3 | >2.3 |
| Ascites | None | Mild/controlled | Moderate-severe |
| Encephalopathy | None | Grade 1-2 | Grade 3-4 |

- **Class A** (5-6 points): Mild. Usually no dose adjustment needed.
- **Class B** (7-9 points): Moderate. Reduce dose of hepatically metabolized drugs by 25-50%. Avoid hepatotoxic drugs when possible.
- **Class C** (10-15 points): Severe. Avoid hepatically metabolized drugs when alternatives exist. Significant dose reductions required. Consult specialist pharmacy.

### Hepatic Metabolism Considerations

- **Phase I reactions** (CYP450: oxidation, reduction, hydrolysis) are more affected by liver disease than Phase II reactions (conjugation: glucuronidation, sulfation).
- **High extraction ratio drugs** (>70% first-pass metabolism): Oral bioavailability increases dramatically in liver disease (e.g., morphine, propranolol, verapamil). Reduce oral dose.
- **Low extraction ratio drugs**: Clearance depends on enzyme activity and protein binding. Reduced albumin increases free fraction.
- **Prodrugs requiring hepatic activation**: May have reduced efficacy (e.g., codeine to morphine via CYP2D6, clopidogrel activation).

### Drugs to Avoid or Use with Extreme Caution

- NSAIDs (GI bleeding, renal impairment, fluid retention)
- Acetaminophen (limit to 2g/day in cirrhosis, avoid if recent alcohol use)
- Sedatives/benzodiazepines (precipitate encephalopathy — prefer short-acting if needed: oxazepam, lorazepam)
- Opioids (reduced clearance, encephalopathy risk — start at 50% dose, titrate slowly)
- Metformin (lactic acidosis risk in decompensated liver disease)

## Obesity Dosing

### Weight Definitions

- **Total Body Weight (TBW)** — Actual measured weight
- **Ideal Body Weight (IBW)** — Devine formula:
  - Males: 50 kg + 2.3 kg per inch over 5 feet
  - Females: 45.5 kg + 2.3 kg per inch over 5 feet
- **Adjusted Body Weight (AdjBW)** — IBW + 0.4 × (TBW - IBW). Used for drugs partially distributing into adipose tissue.
- **Body Surface Area (BSA)** — Mosteller formula: BSA (m²) = sqrt[(height(cm) × weight(kg)) / 3600]
- **BMI** = weight (kg) / height (m)²

### Drug Dosing in Obesity: Which Weight to Use

| Drug Class | Weight for Dosing | Rationale |
|---|---|---|
| Aminoglycosides | AdjBW (IBW + 0.4 correction) | Partial distribution into adipose |
| Vancomycin | TBW | Distributes into adipose; use TBW-based nomograms |
| Low molecular weight heparin | TBW (cap at 150 kg for some agents) | Distributes proportionally; monitor anti-Xa in extremes |
| Unfractionated heparin | TBW-based protocol | Standard weight-based protocols |
| Neuromuscular blockers | IBW | Distribution into lean mass |
| Most chemotherapy | BSA (actual weight) | ASCO guidelines recommend actual weight BSA |
| Propofol | TBW for induction, IBW for maintenance | Rapidly distributes to adipose |
| Cockcroft-Gault | Controversy: IBW, TBW, or AdjBW | No consensus; AdjBW most commonly used |

### General Principles

- Hydrophilic drugs: Less distribution into adipose tissue → use IBW or AdjBW
- Lipophilic drugs: Greater distribution into adipose → use TBW or AdjBW
- Very high BMI (>40): Consult specialist pharmacy for narrow therapeutic index drugs

## Pediatric Dosing

### Weight-Based Dosing (mg/kg)

The most common method. Important principles:

- Always calculate the dose AND verify it does not exceed the adult maximum dose
- Use actual body weight unless the child is obese
- Neonatal doses often differ from infant/child doses (immature metabolism)

### Body Surface Area (BSA) Dosing

Used for some drugs (especially chemotherapy) where BSA correlates better with drug clearance than weight alone.

BSA is less commonly used for routine pediatric dosing but remains standard in pediatric oncology.

### Age-Related Pharmacokinetic Differences

| Parameter | Neonates/Infants | Children | Adolescents |
|---|---|---|---|
| GI absorption | Altered pH, motility | Adult-like by 2 years | Adult |
| Body water | Higher % total body water | Higher Vd for hydrophilic drugs | Adult |
| Protein binding | Lower albumin, displaced by bilirubin | Approaches adult by 1 year | Adult |
| Hepatic metabolism | Immature CYP (especially CYP1A2, CYP2D6) | Supranormal metabolism ages 2-6 (higher doses/kg needed) | Adult |
| Renal function | Immature at birth (adult GFR by 6-12 months) | Normal | Adult |

### Key Pediatric Dosing Considerations

- **Neonates**: Reduced clearance for most drugs. Longer half-lives. Lower doses, extended intervals.
- **Infants/toddlers (1-3 years)**: Rapid maturation of metabolism. May need relatively higher mg/kg doses.
- **Children (3-12 years)**: Often require higher mg/kg doses than adults due to relatively larger liver mass and higher metabolic rate.
- **Adolescents**: Approach adult pharmacokinetics. Transition to adult dosing by weight or fixed dose.

## Geriatric Considerations

### Age-Related Pharmacokinetic Changes

- **Absorption**: Generally preserved; some reduction in active transport
- **Distribution**: Increased body fat (lipophilic drugs accumulate), decreased lean mass, decreased total body water, decreased albumin
- **Metabolism**: Hepatic blood flow reduced ~40%; CYP activity variably reduced; Phase II metabolism preserved
- **Elimination**: GFR declines ~1 mL/min/year after age 40; serum creatinine may not reflect this decline due to reduced muscle mass

### Geriatric Prescribing Principles

1. **Start low, go slow** — Begin at 25-50% of adult dose for CNS-active drugs, renally cleared drugs
2. **Beers Criteria (AGS)** — List of potentially inappropriate medications in older adults
3. **STOPP/START criteria** — Screening Tool of Older Persons' Prescriptions (STOPP) and Screening Tool to Alert to Right Treatment (START)
4. **Anticholinergic burden** — Cumulative anticholinergic effects from multiple drugs (cognitive impairment, falls, urinary retention, constipation)
5. **Deprescribing** — Systematic review and discontinuation of medications that are no longer indicated, beneficial, or appropriate
6. **Falls risk** — Review psychotropics, antihypertensives, hypoglycemics

## Applying This Skill

When adjusting drug doses:

- Always identify the basis for dose adjustment (renal, hepatic, weight, age)
- Use the appropriate formula for renal estimation (Cockcroft-Gault for drug dosing)
- Specify which weight to use for obese patients
- In pediatrics, verify the calculated dose does not exceed the adult maximum
- In geriatrics, consider the cumulative medication burden, not just individual drugs
- Recommend monitoring parameters to assess dose adequacy
