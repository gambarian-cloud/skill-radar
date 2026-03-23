---
name: GRADE Assessment
description: Detailed GRADE methodology — rating certainty by study design, downgrading factors, upgrading factors, evidence profiles, and Summary of Findings tables
origin: ECMed
---

# GRADE Assessment

## Purpose

GRADE (Grading of Recommendations, Assessment, Development, and Evaluation) is the most widely adopted framework for rating the certainty of evidence and strength of recommendations in healthcare. Used by over 110 organizations worldwide including WHO, Cochrane, NICE, AHA, and ESC. This skill provides a detailed, operational guide to the GRADE methodology.

## GRADE Certainty of Evidence

### Definition

GRADE certainty reflects confidence that the true effect lies close to the estimated effect:

| Level | Symbol | Interpretation |
|---|---|---|
| High | ++++  | Very confident. Further research very unlikely to change the estimate. |
| Moderate | +++O | Moderately confident. Further research likely to have an important impact and may change the estimate. |
| Low | ++OO | Limited confidence. Further research very likely to have an important impact and is likely to change the estimate. |
| Very Low | +OOO | Very little confidence. The estimate is very uncertain. |

### Starting Point

- **Randomized controlled trials** → Start at HIGH
- **Observational studies** → Start at LOW

Rationale: RCTs are less susceptible to confounding and selection bias. Observational studies have inherent limitations that reduce baseline certainty.

## Downgrading Factors

Each factor can reduce certainty by one or two levels. Apply to the body of evidence for each outcome, not to individual studies.

### 1. Risk of Bias (Study Limitations)

Assessed using RoB 2 (RCTs) or ROBINS-I (observational). Consider:

- Was randomization adequate? Was allocation concealed?
- Were participants, clinicians, and outcome assessors blinded?
- Was follow-up complete (minimal attrition)?
- Were outcomes reported as pre-specified (no selective reporting)?
- Were there other risks (e.g., early stopping for benefit, crossover)?

**Downgrade by 1**: Some limitations in several studies, or serious limitation in one key study.
**Downgrade by 2**: Very serious limitations across most studies.

Key principle: Only downgrade if the bias is likely to affect the estimate. A study with unblinded participants but a hard outcome (mortality) may not require downgrading.

### 2. Inconsistency (Heterogeneity)

When studies show different results, our confidence in any single estimate decreases.

Assess:
- **Point estimates** — Do they vary widely across studies?
- **Confidence intervals** — Is there minimal overlap?
- **Statistical heterogeneity** — I² >50% raises concern, but interpret in context of clinical and methodological heterogeneity
- **Subgroup analysis** — Can heterogeneity be explained by pre-specified subgroups?

**Do not downgrade** if:
- All studies point in the same direction despite varying magnitudes
- Heterogeneity is explained by a credible subgroup analysis
- The prediction interval still excludes no effect

**Downgrade by 1**: Moderate unexplained heterogeneity.
**Downgrade by 2**: Large unexplained heterogeneity with conflicting results (some studies show benefit, others harm).

### 3. Indirectness

The evidence does not directly address the clinical question. Four types:

- **Population indirectness** — Study population differs from the target population (e.g., evidence from younger adults applied to elderly)
- **Intervention indirectness** — Different drug, dose, route, or duration from the clinical question
- **Comparator indirectness** — Compared to placebo when the clinical question is about active comparator
- **Outcome indirectness** — Surrogate outcomes instead of patient-important outcomes (e.g., bone density instead of fracture rate)

**Downgrade by 1**: One source of indirectness.
**Downgrade by 2**: Multiple sources or major indirectness.

### 4. Imprecision

Wide confidence intervals that include both clinically meaningful benefit and harm, or clinically meaningful benefit and no effect.

Assessment criteria:
- **Optimal Information Size (OIS)**: Is the total sample size sufficient? Calculate the sample size needed for an adequately powered individual trial — if the total across studies is less than this, downgrade.
- **Confidence interval**: Does the 95% CI cross the clinical decision threshold (the minimally important difference)?
- **Number of events**: Fewer than 300 events for dichotomous outcomes is a common heuristic for concern.

**Downgrade by 1**: CI includes no effect and clinically meaningful benefit (or vice versa).
**Downgrade by 2**: CI spans from clinically meaningful benefit to clinically meaningful harm, or very few events (<100).

### 5. Publication Bias

Suspicion that studies with unfavorable results were not published.

Assessment:
- **Funnel plot asymmetry** — Visual assessment and formal tests (Egger's, Peters')
- **Comparison with trial registries** — Are registered studies missing from the published literature?
- **Industry sponsorship** — Higher risk of publication bias
- **Small-study effects** — Are smaller studies showing larger effects?

**Downgrade by 1**: Suspected publication bias based on funnel plot asymmetry or known unpublished data.
**Downgrade by 2**: Strongly suspected publication bias (rare — usually downgrade by 1).

## Upgrading Factors (Observational Studies Only)

### 1. Large Magnitude of Effect

- RR >2 or <0.5 (with no plausible confounders explaining the association): **Upgrade by 1**
- RR >5 or <0.2 (with no plausible confounders): **Upgrade by 2**

Example: Observational evidence for parachute use in free fall — very large effect size, no confounders.

### 2. Dose-Response Gradient

A clear dose-response relationship strengthens causal inference.

Example: Higher pack-years of smoking associated with progressively higher lung cancer risk. This pattern is difficult to explain by confounding alone.

**Upgrade by 1** when a clear dose-response is present.

### 3. All Plausible Confounders Would Reduce the Effect

When all plausible confounders would bias toward the null (reduce the observed effect), the true effect is likely at least as large as observed.

Example: If sicker patients receive more treatment (confounding by indication) and the treatment still appears beneficial despite this bias working against it, the true effect may be larger.

**Upgrade by 1** when this pattern is convincingly demonstrated.

## Evidence Profiles

An evidence profile summarizes the GRADE assessment for each outcome in a structured table:

| Outcome | No. of Studies | Design | Risk of Bias | Inconsistency | Indirectness | Imprecision | Other | Certainty |
|---|---|---|---|---|---|---|---|---|
| Mortality | 3 RCTs (n=2400) | RCT | Not serious | Not serious | Not serious | Serious (-1) | None | Moderate |
| Hospitalization | 3 RCTs (n=2400) | RCT | Serious (-1) | Not serious | Not serious | Not serious | None | Moderate |
| QoL | 2 RCTs (n=1800) | RCT | Not serious | Serious (-1) | Serious (-1) | Not serious | None | Low |

Each column is rated as "Not serious," "Serious" (downgrade by 1), or "Very serious" (downgrade by 2), with brief justification.

## Summary of Findings (SoF) Tables

The primary output of GRADE assessment, designed for guideline panels and clinicians:

### Required Elements

1. **Outcome** — Patient-important outcome with time horizon
2. **Assumed risk (control)** — Event rate in the control group
3. **Corresponding risk (intervention)** — Event rate in the intervention group
4. **Relative effect** — RR, OR, or HR with 95% CI
5. **Absolute effect** — ARR per 1000 with 95% CI
6. **Certainty** — GRADE rating (High/Moderate/Low/Very Low)
7. **Importance** — Critical, important, or not important for decision-making

### Creating the SoF Table

1. Select outcomes (maximum 7, prioritized by importance to patients)
2. For each outcome, complete the GRADE evidence profile
3. Calculate absolute effects from relative effects and baseline risk
4. Present in standardized format

### Interpreting SoF Tables

- Read horizontally across each outcome
- Compare absolute benefits against absolute harms
- Note the certainty rating — lower certainty means the estimate may change with future research
- Focus on outcomes rated "critical" for the decision

## GRADE Recommendations

### From Evidence to Recommendations (EtD Framework)

GRADE separates certainty of evidence from strength of recommendation. The EtD framework considers:

1. Certainty of evidence (from the evidence profile)
2. Balance of benefits and harms
3. Patient values and preferences
4. Resource use and cost-effectiveness
5. Equity implications
6. Acceptability to stakeholders
7. Feasibility of implementation

### Recommendation Categories

| | For the Intervention | Against the Intervention |
|---|---|---|
| **Strong** | "We recommend..." | "We recommend against..." |
| **Conditional** | "We suggest..." | "We suggest against..." |

### Paradigmatic Situations

- **Strong recommendation, high certainty**: Benefits clearly outweigh harms, high confidence in evidence. Most patients should receive the intervention.
- **Strong recommendation, low certainty**: Despite uncertain evidence, the intervention is clearly warranted (e.g., life-threatening condition with only one plausible treatment).
- **Conditional recommendation, high certainty**: Good evidence but close balance of benefits/harms, or significant value variation. Shared decision-making essential.
- **Conditional recommendation, low certainty**: Uncertain evidence and close balance. Individual patient factors should drive the decision.

## Applying This Skill

When performing GRADE assessments:

- Rate certainty separately for each patient-important outcome
- Apply downgrading and upgrading factors systematically with explicit justification
- Present results in evidence profile and SoF table format
- Separate the certainty rating from the recommendation strength
- Flag outcomes where certainty is low or very low — these represent areas of clinical uncertainty where further research is needed
- Use the EtD framework to move transparently from evidence to recommendations
