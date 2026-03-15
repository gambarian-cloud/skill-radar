---
name: skill-lookup
description: Look up relevant skills, repos, and trusted-source workflow patterns from the local Signal Scout catalog and evidence corpus before creating a new workflow from scratch. Use when asked whether a useful skill, repo pattern, setup recommendation, or prior finding already exists for a task, project, or agent workflow.
---

# Skill Lookup

Use this skill before inventing a new skill or workflow.

## Workflow

1. Run the local lookup command first:

```powershell
npm run lookup -- --query "<task or workflow>"
npm run lookup -- --query "<task or workflow>" --tool codex
npm run lookup -- --query "<task or workflow>" --tool claude-code
```

2. Read both result sections:
   - `Recommended Skills`
   - `Relevant Local Evidence`
3. Start from the highest-ranked project-owned skills.
4. If project-owned skills are not enough, use the trusted external sources listed by the lookup output.
5. Prefer shared workflows that fit both Codex and Claude Code unless the task clearly requires a tool-specific feature.
6. If nothing strong exists, create a narrow new project-owned skill instead of a broad generic one.

## Decision Rules

- Prefer `project-owned` and `adopt-now` matches first.
- Treat `official` sources as capability truth.
- Treat `community` sources as practice truth.
- Treat research notes and daily digests as reusable local memory, not write-only artifacts.
- If a community skill repeatedly appears useful, convert its pattern into a project-owned skill or baseline note.

## Local Sources

The lookup command now searches this repo-level corpus:

- `src/config/skill-catalog.ts`
- `Research/*.md`
- `reports/research/*.md`
- `reports/daily/*.md`
- `skills/*/SKILL.md`
- `radar-presets/**/*.md`
- `AGENTS.md`
- `CLAUDE.md`
- `PRD.md`

It also builds synthetic current-state documents from live config such as:

- the current agent baseline
- the current source policy
- the current preset model
- the current radar evidence and recommendation state

## Output

Return a short answer with:

- the best current skill matches
- the strongest local evidence files
- whether matches are shared, Codex-only, or Claude-only
- whether we should adopt now, watch, or ignore
- the next concrete action
