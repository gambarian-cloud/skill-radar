---
name: report-generation
description: "Use when results review is complete and findings need to be documented. Generates structured reports with publication-quality figures, methods sections, and proper citations."
---

# Report Generation

## Overview

Transform validated, reviewed results into a structured report. Output can be a markdown research report, a Jupyter notebook, or a paper draft — depending on the audience and purpose.

## When to Use

- After `results-review` passes with no critical issues
- When summarizing findings for communication
- When preparing data for publication or presentation

## Report Structure

```markdown
# [Title]

## Abstract / Summary
[1 paragraph: question, approach, key finding, significance]

## Introduction
- Background and biological context
- Research question and hypothesis
- Why this matters

## Methods
- Data sources (with accessions and versions)
- Tools used (with versions and parameters)
- Statistical tests applied
- Reproducibility information

## Results
- Presented in order of analysis steps
- Figures and tables with captions
- Statistical results (test, statistic, p-value, effect size, CI)
- Control results reported alongside main results

## Discussion
- Interpretation in biological context
- Comparison with prior literature
- Alternative explanations considered
- Limitations explicitly stated

## Conclusions
- Direct answer to the hypothesis
- Supported, refuted, or inconclusive — with evidence

## Reproducibility
- All parameters, seeds, versions documented
- Data availability statement
- Code availability statement
```

## Figure Guidelines

- Every figure has a descriptive caption
- Axes are labeled with units
- Color palettes are colorblind-friendly (viridis, cividis)
- Statistical annotations included where relevant
- Scale bars on images
- Raw data shown alongside summaries (e.g., box plot + individual points)

## Key Principles

- **Methods reproducible** — Another researcher can reproduce from the methods section alone
- **Results before interpretation** — Present data, then discuss meaning
- **Limitations are mandatory** — Every report includes a limitations section
- **Negative results reported** — Don't omit results that didn't support the hypothesis
- **Figures tell the story** — A reader should understand the key finding from figures alone
