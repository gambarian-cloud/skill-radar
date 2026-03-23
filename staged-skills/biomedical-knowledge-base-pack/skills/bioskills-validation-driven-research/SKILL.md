---
name: validation-driven-research
description: "Use when analysis results are available and need statistical validation before any conclusions can be drawn. Enforces proper statistical tests, multiple testing correction, effect sizes, and confidence intervals. No results without validation."
---

# Validation-Driven Research

## Overview

The biology equivalent of Test-Driven Development. Before ANY conclusion is drawn, results must pass statistical validation. This skill enforces proper hypothesis testing, multiple comparison correction, effect size reporting, and confidence intervals.

**Core principle:** No result is valid until it's been statistically validated. Claims without validation are speculation.

<HARD-GATE>
Do NOT interpret results, draw conclusions, or state findings until statistical validation is complete. A p-value alone is NOT sufficient — you must also report effect size and confidence intervals.
</HARD-GATE>

## The Iron Law

**Every claim must be supported by:**
1. An appropriate statistical test (chosen BEFORE seeing results, per the experiment design)
2. A stated significance threshold (typically α = 0.05, but must be justified)
3. Multiple testing correction (if >1 test performed)
4. Effect size measurement
5. Confidence intervals

**If any of these are missing, the result is NOT validated.**

## When to Use

- After `subagent-driven-analysis` produces results
- When interpreting any quantitative biological data
- When comparing groups, conditions, or treatments
- When assessing whether an observation is "significant"

## Validation Checklist

### Before Looking at Results

- [ ] Statistical tests were pre-registered in the experiment design
- [ ] Significance threshold was defined before analysis
- [ ] Multiple testing correction method was chosen before analysis

### Validating Results

- [ ] **Assumptions checked** — Does the data meet the test's assumptions?
  - Normality (Shapiro-Wilk test if n < 50, visual inspection of Q-Q plot)
  - Homogeneity of variance (Levene's test)
  - Independence of observations
  - If assumptions violated → use non-parametric alternative
- [ ] **Appropriate test applied** — Matches pre-registered choice
- [ ] **Multiple testing corrected** — Benjamini-Hochberg FDR, Bonferroni, or other as pre-registered
- [ ] **Effect size reported** — Cohen's d, odds ratio, fold change, etc.
- [ ] **Confidence intervals reported** — 95% CI for primary measurements
- [ ] **Sample size adequate** — Post-hoc power analysis if result is non-significant

### Common Test Selection Guide

| Comparison | Parametric | Non-parametric |
|---|---|---|
| 2 groups, continuous | t-test | Wilcoxon rank-sum |
| 2 groups, paired | Paired t-test | Wilcoxon signed-rank |
| >2 groups, continuous | ANOVA | Kruskal-Wallis |
| Categorical | Chi-squared | Fisher's exact |
| Correlation | Pearson | Spearman |
| Survival | — | Log-rank |
| Enrichment (GO/KEGG) | Hypergeometric | — |

### Biology-Specific Validation

| Analysis Type | Key Validation |
|---|---|
| Sequence similarity | E-value thresholds, not just identity% |
| Differential expression | FDR-corrected q-values, log₂ fold change thresholds |
| Structure prediction | pLDDT/pTM confidence scores |
| Phylogenetics | Bootstrap support values (≥70%), posterior probability |
| Variant calling | Quality scores, read depth, allele frequency |
| Enrichment | Multiple testing correction on ALL tested terms |

## Red Flags — STOP

| Red Flag | What To Do |
|---|---|
| Choosing statistical test AFTER seeing results | Stop. Use pre-registered test from experiment design. |
| Reporting p-value without effect size | Add effect size before proceeding. |
| No multiple testing correction with >1 comparison | Apply correction. Report both corrected and uncorrected. |
| P = 0.049 treated differently from P = 0.051 | Report as continuous. Don't dichotomize around α. |
| "Trending toward significance" (p = 0.06-0.10) | Report honestly. This is NOT significant. |
| Cherry-picking significant results | Report ALL results, including non-significant ones. |
| Post-hoc subgroup analysis without correction | Flag as exploratory, not confirmatory. |
| Using parametric test on non-normal data | Switch to non-parametric alternative. |

## Output Format

After validation, produce a structured summary:

```markdown
## Validation Summary

### Test Results
| Comparison | Test | Statistic | p-value | Corrected p | Effect Size | 95% CI |
|---|---|---|---|---|---|---|
| [Group A vs B] | [test] | [value] | [raw p] | [adjusted p] | [d/OR/FC] | [lower, upper] |

### Assumption Checks
- Normality: [PASS/FAIL] ([test], p = [value])
- Homogeneity: [PASS/FAIL] ([test], p = [value])
- Independence: [PASS by design / needs checking]

### Multiple Testing
- Method: [BH FDR / Bonferroni / etc.]
- Number of tests: [N]
- Significance threshold after correction: [value]

### Conclusion
- [Supported / Not Supported / Inconclusive]: [brief statement with evidence]
```

## After Validation

- If validation passes → Invoke `results-review` for scientific interpretation
- If validation fails → Invoke `systematic-troubleshooting` to identify the cause
- NEVER skip validation and go straight to interpretation
