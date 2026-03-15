# Signal Scout

## Purpose

`Signal Scout` is a small ingestion, lookup, and analysis pipeline for trusted-source workflow intelligence.

It should answer two questions:

1. what changed recently that matters
2. what skills, repos, or workflow patterns already exist for the work in front of us

## Product Shape

Keep the product split into four operational layers:

1. source fetching
2. normalization and dedupe
3. scoring and categorization
4. output generation

On top of those, keep a separate knowledge-use layer for lookup.

Do not collapse ingest, scoring, lookup, and digest formatting into one script.

## Source Strategy

Use a three-layer source model:

1. `origin`: official docs, changelogs, repos, release notes
2. `scout`: curators and practitioner feeds that surface good material early
3. `explainer`: podcasts, videos, essays, and secondary explainers

Ranking guidance:

- `origin` gives capability truth and release truth
- `scout` gives workflow truth and sharper best practices
- `origin + scout` together is the strongest signal
- community and OSS material can outrank official docs for workflow advice when backed by adoption signals

Prefer trusted-source monitoring over broad crawling.

## Dual-Tool Baseline

Treat this repo as a shared workspace for both `Codex` and `Claude Code`.

Canonical shared layer:

- `PRD.md`
- `AGENTS.md`
- `CLAUDE.md`
- `skills/`
- `src/config/skill-catalog.ts`
- `reports/research/`
- `src/config/sources.ts`

Tool-specific overlays:

- Codex uses root `AGENTS.md` and `.agents/skills/`
- Claude Code uses root `CLAUDE.md` and `.claude/skills/`
- `npm run sync:agents` mirrors canonical skills into both overlays

Keep one canonical project-owned skill pack. Do not hand-maintain two divergent copies.

## Baseline Principles

- Prefer file-system state over adding a database.
- Keep source configuration explicit and checked into git.
- Keep mock fixtures for important sources so the pipeline remains runnable without live credentials.
- Treat normalization as a first-class layer.
- Keep daily output short and decision-oriented.
- Keep lookup fast and practical.
- Keep project-owned skills small and evidence-backed.
- When the next step is obvious and low-risk, do it without asking for permission first.
- Only stop to ask when the decision is non-obvious, risky, irreversible, or likely to change scope materially.

## Skills, Hooks, Subagents

Use this order:

1. put broad project guidance in `AGENTS.md` and `CLAUDE.md`
2. add project-owned skills for repeated task workflows
3. add hooks only when something must happen every time
4. add subagents only for focused tasks that benefit from isolated context

Do not add many skills by default.

Default external skill candidates to watch or selectively adopt:

- `systematic-debugging`
- `verification-before-completion`
- `using-git-worktrees`
- `test-driven-development`
- `find-skills`
- `react-best-practices` when frontend work is active

### Skill Quality Rules

For new or revised skills:

- require clear trigger cases and clear non-trigger cases
- keep `SKILL.md` lean and move bulky material into `references/`, `scripts/`, or `assets/`
- prefer a small procedural delta over a verbose rewrite of generic model knowledge
- before promoting a skill into the stable baseline, test it with:
  - obvious trigger cases
  - paraphrased trigger cases
  - false-positive cases
  - boundary cases
- classify upgrades as `adopt now`, `experiment`, `watch`, or `reject`

For MCP servers, plugins, connectors, hooks, or executable integrations:

- check maintainer credibility
- check maintenance recency
- check permission scope and write capability
- check secret handling
- check blast radius if wrong or compromised
- default uncertain items to `watch`, not `adopt`

## Commands

Daily digest:

```powershell
node --experimental-strip-types src/index.ts --mode mock
node --experimental-strip-types src/index.ts --mode auto --source telegram-vibe-coding
```

Lookup:

```powershell
npm run lookup -- --query "agent workflow"
npm run lookup -- --query "worktrees" --tool codex
npm run lookup -- --query "debugging" --tool claude-code
```

Baseline audit:

```powershell
npm run audit:baseline
```

Sync shared skills into tool overlays:

```powershell
npm run sync:agents
```

## Implementation Notes

- `PRD.md` is the strategic source of truth.
- `reports/research/2026-03-06-dual-tool-baseline.md` is the current dual-tool baseline note.
- `reports/research/2026-03-08-upgrade-review-checklist.md` is the current upgrade review template.
- `src/config/sources.ts` is the source-of-truth for enabled radar sources.
- `src/config/agent-baseline.ts` is the source-of-truth for the current stable Codex + Claude baseline.
- `src/config/skill-catalog.ts` is the source-of-truth for known skills and trusted skill ecosystems.
- `skills/` is the canonical project-owned shared skill pack.
- `reports/research/` holds baseline notes and supporting evidence.
- `reports/daily/` is the operational digest output.

When adding new source or lookup logic, keep downstream analysis source-agnostic and keep the shared layer tool-agnostic.
