# Biomedical Knowledge Base Pack

Curated third-party skill bundle for a patient-specific medical knowledge base workflow.

This pack is staged for work like:

- neuro-oncology symptom reasoning
- seizure / aura differential updates
- evidence grading across mixed-quality literature
- drug interaction and dose-adjustment checks
- trial interpretation for patient-specific applicability
- turning open questions into structured research hypotheses

This is not part of the default baseline. It is an optional high-stakes add-on pack.

## Included Skills

### Clinical Reasoning

- `medsyniq-differential-diagnosis`
- `medsyniq-bayesian-reasoning`
- `medsyniq-clinical-decision-rules`
- `medsyniq-illness-scripts`
- `medsyniq-shared-decision-making`

### Evidence Appraisal And Pharmacology

- `medsyniq-critical-appraisal`
- `medsyniq-evidence-levels`
- `medsyniq-grade-assessment`
- `medsyniq-drug-interactions`
- `medsyniq-dose-adjustment`

### Research Methodology

- `bioskills-hypothesis-formulation`
- `bioskills-experimental-design`
- `bioskills-literature-review`
- `bioskills-results-review`
- `bioskills-validation-driven-research`
- `bioskills-report-generation`

### Trial And Validation Reading

- `medstats-clinical-trial-quality`
- `medstats-validation`
- `medstats-predictive-modeling`

## Why These Made The Cut

All included items passed this minimum bar:

- a real `SKILL.md` exists
- the file contains workflow instructions, not only marketing copy
- the skill matches the current medical knowledge-base project
- the copied folder includes local references/assets needed by that skill

## Gaps Still Not Solved

No strong external skill was verified yet for:

- patient-friendly medical summaries
- doctor-visit preparation briefs
- clinical timeline / disease narrative generation

Those likely need project-owned skills built on top of the knowledge base.

## Upstream Sources

### `ProFlow-Labs-Ai/medsyniq-lite`

- URL: https://github.com/ProFlow-Labs-Ai/medsyniq-lite
- License: MIT
- Snapshot commit: `ed0f86c59830e064db6415f2e06b7b591bc6b69f`

### `nggsam/bioskills`

- URL: https://github.com/nggsam/bioskills
- License: MIT
- Snapshot commit: `d332d64160574243cbe39f60cd5be98820eb76db`

### `chenhaodev/med-stats-skills`

- URL: https://github.com/chenhaodev/med-stats-skills
- License: Apache-2.0
- Snapshot commit: `0478c888dfb44f409182fd0ddaf5d5e7530e1a6c`

Upstream license texts are copied into [upstream-licenses](C:/Users/MI/Desktop/PROJECTS/Skill%20Radar/staged-skills/biomedical-knowledge-base-pack/upstream-licenses).

## Local Install

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\staged-skills\biomedical-knowledge-base-pack\INSTALL-LOCAL.ps1
```

That installs the bundled skills into:

- `C:\Users\MI\.codex\skills`
- `C:\Users\MI\.claude\skills`

You can also target only one runtime:

```powershell
powershell -ExecutionPolicy Bypass -File .\staged-skills\biomedical-knowledge-base-pack\INSTALL-LOCAL.ps1 -CodexOnly
powershell -ExecutionPolicy Bypass -File .\staged-skills\biomedical-knowledge-base-pack\INSTALL-LOCAL.ps1 -ClaudeOnly
```

## Recommended First Smoke Tests

1. Run `medsyniq-differential-diagnosis` against the visual aura differential case.
2. Run `medsyniq-drug-interactions` against the current medication list.
3. Run `medstats-clinical-trial-quality` against the INDIGO trial notes.
4. Run `bioskills-hypothesis-formulation` on one unresolved unknown from the knowledge base.
