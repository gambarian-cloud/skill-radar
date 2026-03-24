# Deep Research V2 Codex Handoff

## Project

`Signal Scout` / `deep-research` skill stabilization and upgrade.

Canonical skill:
- `C:\Users\MI\Desktop\PROJECTS\Skill Radar\skills\deep-research\SKILL.md`

Public Starter Pack copy:
- `C:\Users\MI\Desktop\PROJECTS\codex-claude-code-starter-pack\starter-pack\skills\deep-research\SKILL.md`

## Current state

The `deep-research` skill has already been upgraded through several bounded passes and is now materially stronger than the earlier baseline.

Recent skill commits in `Skill Radar`:
- `064edcc` - strengthen deep-research for product and high-stakes decisions
- `eb4e95a` - add quantitative fragility checks
- `5ef1d86` - refine ecosystem references
- `83ea580` - ecosystem legibility + candidate typing gate + optional artifacts

Matching recent commits in Starter Pack:
- `ee61064`
- `2304833`
- `8d2ddbf`
- `11e5d01`
- `e2676aa`
- `3dabc3b`

Live copies updated:
- project overlays: `.agents/skills/deep-research/`, `.claude/skills/deep-research/`
- global live copies: `C:\Users\MI\.codex\skills\deep-research\`, `C:\Users\MI\.claude\skills\deep-research\`

## What changed recently

The skill now includes:

- project context intake
- framing preflight
- ecosystem legibility and candidate typing gate
- full-source-reading reminder
- quantitative fragility checks for multi-step protocols
- recurring-read / scale-breakpoint thinking
- adjacent-domain search for workflow/protocol questions
- benchmark/evaluation-paper reminder without adding a fifth source tier
- explicit incident/postmortem/failure query patterns
- requirement that structural criticism include an alternative or simplification path
- differentiation test for product/pack/workflow/skill research
- deterministic-vs-generative boundary for high-stakes or calculation-heavy topics
- high-stakes report expectations:
  - release gates
  - language policy
  - user misunderstanding risk
  - segment viability / abandonment risk

## Working thesis

The skill is now very strong on:
- source discipline
- contradiction handling
- ecosystem classification
- project awareness
- high-stakes boundaries

The next risk is no longer "too shallow."
The next risk is "too much in core" if compliance starts to slip.

## Open questions for V2

1. Does the finance-pack failure mode actually improve after the new quantitative and high-stakes additions?
2. Are `Differentiation Thesis`, `Release Gates`, and `Language Policy` staying lightweight enough inside core `SKILL.md`, or should part of this move into references later?
3. Do we need a separate companion skill for:
   - systematic literature review / PRISMA-style work
   - high-stakes language policy
   instead of expanding `deep-research` further?
4. Is there a next benchmark domain that pressures:
   - user misunderstanding risk
   - deterministic-vs-generative boundary
   - release-gate quality

## Non-goals

- Do not rewrite `deep-research` from scratch.
- Do not add a fifth source tier unless there is overwhelming evidence.
- Do not add tool-specific dependencies to core.
- Do not mix this work with unrelated local changes in:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `src/config/skill-catalog.ts`
  - unrelated untracked directories in the repo root

## Suggested next step

Run one fresh benchmark or postmortem specifically on a high-stakes product/pack question and answer only:

1. Did the new differentiation step improve the recommendation?
2. Did the deterministic-vs-generative boundary produce a safer architecture?
3. Did release gates become measurable instead of hand-wavy?
4. Did the report become too heavy?

If the answer is "better but heavier," the next move is slimming, not more adding.
