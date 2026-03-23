---
name: results-review
description: "Use when statistical validation is complete and results need scientific interpretation. Structured review for confounders, alternative explanations, biological plausibility, and limitations before drawing conclusions."
---

# Results Review

## Overview

The biology equivalent of code review. After statistical validation passes, this skill provides structured scientific review of results — checking for confounders, alternative explanations, biological plausibility, and limitations before any conclusions are drawn.

**Core principle:** Valid statistics don't guarantee valid conclusions. Results must be biologically plausible, properly contextualized, and honestly reported.

## When to Use

- After `validation-driven-research` has statistically validated the results
- Before writing any conclusions or generating reports
- When deciding if a hypothesis is supported or refuted

## Review Checklist

### 1. Hypothesis Assessment

- [ ] Does the data support or refute the hypothesis?
- [ ] Is the evidence strong, moderate, or weak?
- [ ] Does the effect size have biological significance (not just statistical)?
- [ ] Were the specific expected outcomes (from the hypothesis) observed?

### 2. Controls Review

- [ ] Did positive controls produce expected results?
- [ ] Did negative controls produce null results?
- [ ] If controls failed, are main results trustworthy?

### 3. Confounders

- [ ] Batch effects — Were all samples processed identically?
- [ ] Sequence composition bias — GC content, repeat regions, low complexity?
- [ ] Database bias — Is the reference database comprehensive for this organism?
- [ ] Technical artifacts — Sequencing errors, alignment artifacts, chimeric reads?
- [ ] Evolutionary confounders — Paralogs vs. orthologs? Gene duplication events?

### 4. Alternative Explanations

- [ ] Could the observed result have a simpler explanation?
- [ ] Are there known biological mechanisms that could produce this result for different reasons?
- [ ] Could the result be an artifact of the method?
- [ ] Does the result replicate known findings, or is it novel?

### 5. Biological Plausibility

- [ ] Is the result consistent with known biology?
- [ ] If the result is unexpected, is there a plausible biological mechanism?
- [ ] Does the result make sense in the context of the organism/system?
- [ ] Are the magnitudes reasonable? (e.g., fold changes, conservation levels)

### 6. Limitations

- [ ] Sample size limitations
- [ ] Data quality limitations
- [ ] Method limitations (e.g., homology model vs. crystal structure)
- [ ] Scope limitations (single organism, single condition, etc.)
- [ ] Computational vs. experimental validation

### 7. Reproducibility

- [ ] Could someone reproduce this result from the methods description?
- [ ] Are all data, parameters, and software versions documented?
- [ ] Were random seeds fixed?

## Severity Levels

| Severity | Description | Action |
|---|---|---|
| 🔴 **Critical** | Controls failed, data integrity issue, or fundamental flaw | STOP. Go back to `systematic-troubleshooting`. |
| 🟡 **Important** | Confounders not addressed, alternative explanation likely | Must fix before drawing conclusions. |
| 🔵 **Minor** | Missing context, unclear limitation, formatting issue | Note and proceed. |

## Output Format

```markdown
## Results Review Summary

### Hypothesis Assessment
[Supported / Refuted / Inconclusive] — [brief justification with citation to evidence]

### Confidence Level: [High / Moderate / Low]
Justification: [why this level]

### Issues Found
| # | Severity | Category | Issue | Resolution |
|---|----------|----------|-------|------------|
| 1 | 🟡 | Confounder | [description] | [how to address] |
| 2 | 🔵 | Limitation | [description] | [note for report] |

### Conclusions (if no critical issues)
1. [Primary conclusion with supporting evidence]
2. [Secondary conclusion if applicable]

### Recommended Next Steps
- [Additional analysis to strengthen the conclusion]
- [Experimental validation needed]
- [Follow-up questions raised]

### Limitations to Report
- [List of limitations that must be included in any report]
```

## Key Principles

- **Honest reporting** — Report what you found, not what you hoped to find
- **Negative results are results** — Failing to reject H₀ is a valid and valuable outcome
- **Limitations are not failures** — Every analysis has limitations; own them
- **Biological significance ≠ statistical significance** — A p < 0.001 with a tiny effect size may not matter biologically
- **No storytelling** — Don't construct a narrative that goes beyond what the data shows

## After Review

- If no critical issues → Invoke `report-generation`
- If critical issues found → Invoke `systematic-troubleshooting`
- If important issues found → Address them, then re-review
