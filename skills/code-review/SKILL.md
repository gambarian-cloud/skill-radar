---
name: code-review
description: Use when reviewing a diff, pull request, implementation pass, or completed code change for bugs, regressions, weak assumptions, or missing verification before calling the work done.
---

# Code Review

Use this skill when the task is:

- review a code change
- check whether a pass is actually safe
- look for bugs, regressions, and missing tests
- verify whether an implementation is good enough to merge or ship

Do not use this skill for:

- writing the first implementation from scratch
- pure product brainstorming with no code to inspect
- security-only review when a dedicated security review is the better fit

## Trigger cases

- "Review this pass."
- "Check this diff for regressions."
- "Did this implementation miss anything?"

## Non-trigger cases

- "Implement this feature."
- "Do deep research on this topic."
- "Summarize the project status."

## Workflow

1. Read the actual changed code first.

Prefer:

- the touched files
- related tests
- the command output that claims success

2. Review in this order:

- correctness bugs
- behavioral regressions
- broken assumptions
- missing verification or missing tests
- only then polish or style

3. Treat command output as evidence.

If the pass claims:

- tests passed
- build succeeded
- digest improved

check the output instead of trusting the claim.

4. Write findings first.

For each finding, include:

- what is wrong
- why it matters
- where it is
- what kind of risk it creates

5. If there are no findings, say that clearly.

Then still mention:

- residual risk
- untested edges
- what was not verified

6. Keep the review outcome decision-oriented.

Use:

- `Findings`
- `Open questions or assumptions`
- `Change summary`

## Review standard

A good review should:

- find the most important problems first
- avoid bikeshedding
- distinguish evidence from assumptions
- say explicitly when the code looks clean

## Guardrails

- Do not lead with praise and hide the actual issues.
- Do not optimize for formatting comments over correctness.
- Do not claim "looks good" if tests or key commands were not checked.
- Do not bury the strongest finding under a long summary.
