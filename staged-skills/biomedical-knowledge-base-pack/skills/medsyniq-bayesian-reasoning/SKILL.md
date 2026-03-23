---
name: Bayesian Clinical Reasoning
description: Pre-test probability estimation, likelihood ratios, post-test probability calculation, Fagan nomogram, and threshold-based decision-making
origin: ECMed
---

# Bayesian Clinical Reasoning

## Purpose

Bayesian reasoning provides the mathematical foundation for diagnostic thinking. It formalizes how new information (test results, clinical findings) should update diagnostic probability, enabling rational decisions about testing and treatment.

## Core Concepts

### Pre-Test Probability (Prior Probability)

The estimated probability of disease before a test is performed. Sources for estimation:

1. **Clinical prediction rules** — Wells score, Geneva score, Centor criteria
2. **Published prevalence data** — Disease frequency in similar populations and settings
3. **Clinical gestalt** — Informed estimate from pattern recognition (calibrate with known data)
4. **Epidemiologic context** — Age, sex, geography, season, risk factors

Pre-test probability is the most important determinant of post-test probability. A test is only as useful as the clinical context in which it is applied.

### Sensitivity and Specificity

- **Sensitivity** (Sn) = TP / (TP + FN) — Probability of a positive test given disease is present. High sensitivity rules OUT disease (SnNOUT).
- **Specificity** (Sp) = TN / (TN + FP) — Probability of a negative test given disease is absent. High specificity rules IN disease (SpPIN).

Limitations: Sensitivity and specificity describe test performance but do not directly tell you the probability of disease given a test result. That requires Bayesian updating.

### Likelihood Ratios

Likelihood ratios (LRs) express how much a test result changes the odds of disease. They are the preferred metric for Bayesian updating because they are independent of prevalence.

**Positive Likelihood Ratio (LR+):**
LR+ = Sensitivity / (1 - Specificity)

Interpretation: How many times more likely is a positive result in a patient WITH disease compared to one WITHOUT disease?

**Negative Likelihood Ratio (LR-):**
LR- = (1 - Sensitivity) / Specificity

Interpretation: How likely is a negative result in a patient WITH disease compared to one WITHOUT disease?

### LR Interpretation Guide

| LR+ | LR- | Shift in Probability |
|---|---|---|
| >10 | <0.1 | Large, often conclusive |
| 5-10 | 0.1-0.2 | Moderate |
| 2-5 | 0.2-0.5 | Small but sometimes important |
| 1-2 | 0.5-1.0 | Rarely important |

An LR of 1.0 provides no diagnostic information whatsoever.

## Bayesian Updating: The Calculation

### Step 1: Convert Pre-Test Probability to Pre-Test Odds

Pre-test odds = Pre-test probability / (1 - Pre-test probability)

Example: 30% pre-test probability → 0.30 / 0.70 = 0.43

### Step 2: Multiply by Likelihood Ratio

Post-test odds = Pre-test odds × LR

Example: Pre-test odds 0.43 × LR+ of 6.0 = 2.57

### Step 3: Convert Post-Test Odds to Post-Test Probability

Post-test probability = Post-test odds / (1 + Post-test odds)

Example: 2.57 / 3.57 = 0.72 = 72%

### Rapid Estimation Shortcut

For quick bedside estimates, approximate probability shifts:

- LR of 2 raises probability by ~15%
- LR of 5 raises probability by ~30%
- LR of 10 raises probability by ~45%
- LR of 0.5 lowers probability by ~15%
- LR of 0.2 lowers probability by ~30%
- LR of 0.1 lowers probability by ~45%

These approximations work best in the mid-range of probability (20-80%).

## Fagan Nomogram

A graphical tool for Bayesian updating:

1. Mark pre-test probability on the left axis
2. Mark the likelihood ratio on the center axis
3. Draw a straight line through both points
4. Read the post-test probability where the line crosses the right axis

Clinically useful for bedside estimation when a calculator is not available.

## Sequential Testing

When multiple independent tests are performed sequentially:

- The post-test probability from the first test becomes the pre-test probability for the second test
- Multiply sequential likelihood ratios: LR_total = LR_1 × LR_2 × LR_3
- **Critical assumption**: Tests must be conditionally independent given disease status. If tests measure the same pathophysiologic feature (e.g., two inflammatory markers), their LRs are NOT independent and cannot be simply multiplied.

Example of valid sequential testing: D-dimer followed by CTPA for PE — these test different aspects (fibrinolysis vs anatomy).

Example of invalid sequential testing: CRP followed by ESR — both reflect acute-phase response and are highly correlated.

## Threshold Approach to Decision-Making

### Test Threshold

The probability below which disease is sufficiently unlikely that no further testing is warranted and the diagnosis is excluded. Determined by:

- Consequences of missing the diagnosis (false negative cost)
- Harms and costs of the test
- Test characteristics (LR-)

### Treatment Threshold

The probability above which disease is sufficiently likely that treatment should begin without further testing. Determined by:

- Efficacy of treatment
- Harms of treatment
- Consequences of untreated disease

### Test-Treatment Zone

When probability falls between the test threshold and treatment threshold, testing is indicated. Testing is only useful when it can move probability across one of these thresholds.

**Key insight**: If a test cannot move probability across either threshold regardless of the result, the test should not be ordered. This is common when pre-test probability is either very low or very high.

## Common Errors in Bayesian Reasoning

### Ignoring Base Rates

Ordering a test without considering pre-test probability. A positive D-dimer in a low-risk patient (pre-test probability 5%) yields a post-test probability of only ~20-30%, not a confirmed PE.

### Treating Tests as Binary

Many tests produce continuous results. Likelihood ratios vary across the result spectrum. A highly elevated troponin has a much higher LR+ than a marginally elevated one. Use interval LRs when available.

### Assuming Test Independence

Combining LRs from correlated tests overestimates diagnostic certainty. CRP + procalcitonin are partially redundant — their combined LR is less than the product of individual LRs.

### Probability Distortion

Clinicians tend to overestimate low probabilities and underestimate high probabilities. Anchor estimates to validated prediction rules when available.

## Clinical Application Examples

### PE Diagnosis

1. Wells score: 2 points → Pre-test probability ~17% (PE unlikely)
2. D-dimer positive (LR+ ~2.5): Post-test probability ~34%
3. CTPA positive (LR+ ~24): Post-test probability ~92%
4. Diagnosis confirmed, treat with anticoagulation

### Pharyngitis Evaluation

1. Centor criteria: 3 points → Pre-test probability ~35%
2. Rapid strep test positive (LR+ ~15): Post-test probability ~89%
3. Above treatment threshold — prescribe antibiotics

## Applying This Skill

When assisting with diagnostic reasoning:

- Always establish or estimate the pre-test probability before evaluating test results
- Provide likelihood ratios for tests when available
- Show the probability shift from pre-test to post-test
- Flag when a test cannot meaningfully change management (probability stays in same zone regardless of result)
- Identify when tests are correlated and LRs cannot be simply combined
