---
name: starter-pack-work-split
description: Use when running parallel delivery for the Starter Pack product track inside Skill Radar. Enforce project-relevance checks, split work into architecture/docs/backend lanes, assign long-leg autonomous task packets, and reduce user interruptions while Codex and Claude Code collaborate.
---

# Starter Pack Work Split

Use this skill for the current project track:

- standalone beginner Starter Pack product
- based on existing baseline evidence
- not Signal Scout source tuning

Do not use this skill for unrelated repos or general radar ingestion work.

## Project-Relevance Gate

Before assigning any task, confirm it matches this track:

1. Read:
- `AGENTS.md`
- `PRD.md`
- `starter-pack/README.md`
- `starter-pack/APPLY.md`
- `starter-pack/VERIFY.md`
- `Research/starter-pack-product-reset-2026-03-09.md`

2. Reject or re-scope the task if it mainly targets:
- source fetcher changes in `src/sources/*`
- scoring changes in `src/analysis/*`
- digest ranking tuning in `src/digest/*`
- unrelated project artifacts

3. Keep the scope anchored to Starter Pack productization and onboarding quality.

## Lane Model For This Project

### 1) Architecture Lane

Own:

- product boundary decisions
- core vs optional vs later/experimental vs reject
- PRD structure and acceptance criteria
- rollout sequencing and risk controls

Primary model/agent:

- Claude Code Opus (lead)

### 2) Docs Lane (User-Facing Layer)

For this project, this lane means user-facing experience, mostly:

- onboarding docs and flow clarity
- beginner language quality
- profile entry points and navigation
- future web/installer UX framing when applicable

Primary model/agent:

- Codex with the strong reasoning/default model for clear user-facing structure and messaging

### 3) Backend Lane

Own:

- manifests and install/verify mechanics
- local automation glue (for example sync/audit integration)
- checks that enforce baseline contract
- code changes in `src/` only when needed for Starter Pack support

Primary model/agent:

- Codex with the fast implementation model for implementation and test loops

## Long-Leg Task Packet Rule

Every delegated task must be executable for 30 to 90 minutes without asking the user.

Use this packet format:

```text
Task:
Why this matters now:
Done criteria:
Out of scope:
Read first:
Execution plan:
1)
2)
3)
Verification:
Escalate only if:
```

Required escalation triggers:

- destructive or irreversible change
- missing access or missing source-of-truth file
- contradiction between PRD and current track memo
- hard blocker after attempted workaround

## Parallel Execution Rules

- Assign one owner per lane.
- Avoid simultaneous edits in the same file.
- Use worktrees for overlapping or risky streams.
- Send handoff only at milestone boundaries or hard blockers.
- Prefer fewer, longer, higher-quality tasks over many short pings.

## Handoff Format

```text
Lane:
Summary:
Files touched:
Verification evidence:
Assumptions:
Open risks:
Next best step:
```

## Verification Gate

Do not claim completion without evidence.

Current checks for the Skill Radar repo:

```powershell
npm run lookup -- --query "starter pack split"
npm test
npm run sync:agents
```

When this work moves to a standalone Starter Pack repo, replace these with standalone checks for:

- docs and manifest presence
- profile file presence
- any repo-local verify script that replaces the Skill Radar commands

If only docs changed, still report:

- what was validated
- why behavior did not require code tests beyond baseline checks

## Guardrails

- Do not leak tasks from another project into this track.
- Do not collapse architecture/docs/backend into one unowned blob.
- Do not send vague assignments without done criteria.
- Do not ping every few minutes when a long-leg packet is active.
- Do not bypass verification evidence before handoff.
