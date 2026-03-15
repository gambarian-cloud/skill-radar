---
name: digest-review
description: Use when auditing a generated Signal Scout digest for false positives, false negatives, weak ranking, or unclear actions. Focus on decision quality, not formatting polish.
---

# Digest Review

Use this skill after a digest run when the goal is to improve signal quality.

## Workflow

1. Read the current digest under `reports/daily/`.
2. Identify the highest-risk mistakes first:

- irrelevant posts marked `use-now`
- strong posts buried as `save-for-later`
- wrong project target
- vague suggested actions

3. Compare decisions against baseline research:

- `reports/research/2026-03-06-baseline-setup.md`
- `reports/research/2026-03-06-community-signal-model.md`
- relevant source-specific research notes

4. If the problem is a one-off known mis-rank, prefer a feedback rule over heuristic surgery.
5. Use `feedback/ranking-overrides.json` for explicit demotions, promotions, or decision overrides.
6. Re-run the same digest after the change.

## Review Standard

A good digest should answer:

- what deserves attention now
- why it matters
- what to do next
- whether the evidence comes from origin, scout, or explainer layers
- whether any manual feedback was applied and why

## Guardrails

- Do not overfit to one post.
- Do not optimize for prettier markdown over better decisions.
- If a post has no artifact, repo, issue, discussion, or repeatable workflow, be willing to demote it.
- If the same complaint appears repeatedly, improve the heuristic instead of piling up ad hoc overrides.
