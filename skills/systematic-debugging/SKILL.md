---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior in Signal Scout or any project before proposing fixes. Forces root-cause isolation instead of random edits. Adapted from obra/superpowers for project-owned use.
---

# Systematic Debugging

Use this skill before attempting any fix. The iron rule: **no fixes without root cause investigation first.**

## Phase 1: Root Cause Investigation

1. Read the error message carefully. Do not skim.
2. Reproduce the failure consistently:

```powershell
npm test
npm run digest:demo
npm run lookup -- --query "test query"
```

3. Check recent changes. Use `git diff` and `git log --oneline -10`.
4. Gather evidence at component boundaries:
   - source fetching (`src/sources/`)
   - normalization (`src/normalize/`)
   - analysis and scoring (`src/analysis/`)
   - digest rendering (`src/digest/`)
   - lookup (`src/lookup-core.ts`)
5. Trace data flow backward from the symptom to the origin.

## Phase 2: Pattern Analysis

1. Find a working example. Check the last passing test run or the last clean digest.
2. Compare the broken state against the working state.
3. Identify what changed between them.
4. Check whether the issue is in shared code or in a tool-specific overlay.

## Phase 3: Hypothesis and Testing

1. Form one specific hypothesis. Write it down.
2. Test it with the smallest possible change.
3. Change one variable at a time.
4. If the hypothesis is wrong, say so and form a new one.
5. If you are unsure, acknowledge the gap instead of guessing.

## Phase 4: Implementation

1. Write a failing test first if possible:

```powershell
npm test
```

2. Implement a single root-cause fix. Not a workaround.
3. Run the full test suite after the fix.
4. If 3 or more fix attempts have failed, stop. The problem may be architectural, not local. Re-read the pipeline design in `AGENTS.md` and `PRD.md` before continuing.

## Escalation Rule

After three failed fixes:

- Stop patching.
- Question whether the current approach is fundamentally wrong.
- Re-read the relevant source files from scratch.
- Consider whether the normalization, scoring, or rendering boundary is in the wrong place.

## Guardrails

- Do not guess at fixes without evidence.
- Do not change scoring thresholds to hide a bug.
- Do not add a feedback override when the real problem is in the heuristic.
- Do not skip the test suite after a fix.
