---
name: codex-claude-handoff
description: Use when running parallel work across Codex and Claude Code on one or multiple projects. Enforce project-relevance checks, role routing by model strengths, long-leg task packets that reduce interruptions, and disciplined handoff/verification between agents.
---

# Codex Claude Handoff

Use this skill when parallel agent work risks context collision, shallow delegation, or constant user interruptions.

Do not use this skill for a small one-file change that one agent can finish safely.

## Workflow

1. Run a project-relevance gate before any delegation.

Build a quick fingerprint from the active repo:

- repo name and current goal
- 3 to 5 source-of-truth files (for example `AGENTS.md`, `PRD.md`, current research memo)
- explicit non-goals
- current phase (planning, implementation, verification)

If a new task does not match this fingerprint, treat it as possible cross-project leakage and stop delegation until re-scoped.

2. Route work by model strength, then confirm with evidence.

Default routing:

- `gpt-5.4`: planning, user communication, product tradeoffs, scope control
- `gpt-5.3-codex`: multi-file implementation, test/fix loops, mechanical code execution
- `Opus` in Claude Code: architecture critique, design alternatives, risk review, spec hardening

If uncertain at project start, run a 15-minute calibration with three micro-tasks:

- plan quality task
- implementation task
- architecture review task

Keep the winner per task class. Route by task class, not by model hype.

3. Split into long-leg assignments before execution.

Each delegated assignment must be independently executable for 30 to 90 minutes without user input.

Start each assignment with a `Long-Leg Task Packet`:

- objective
- done criteria
- constraints and non-goals
- files and commands to read first
- planned execution steps
- verification commands
- escalation triggers (what must interrupt the user)

Default interruption policy:

- no status ping unless milestone complete or blocker hit
- interrupt only for hard blocker, conflicting requirement, destructive-risk decision, or missing access

4. Parallelize by ownership and isolation.

- one owner per workstream
- one worktree per active stream for risky or overlapping work
- avoid two agents editing the same file at the same time
- keep handoffs file-specific and evidence-backed

5. Use a strict handoff format between Codex and Claude Code.

Every handoff must include:

- task summary in 3 lines
- exact files touched or proposed
- commands run and result
- open risks and assumptions
- next best step for the receiving agent

6. Close with verification before claiming completion.

Before saying "done":

- run the proving commands for the claimed change
- read output fully
- report pass/fail evidence
- if failed, return to execution instead of closing

## Long-Leg Task Packet Template

```text
Task:
Success criteria:
Out of scope:
Read first:
Plan:
1)
2)
3)
Verify:
Escalate only if:
```

## Handoff Template

```text
Summary:
Files:
Verification:
Risks/Assumptions:
Next step:
```

## Guardrails

- Do not delegate before project-relevance gate.
- Do not send vague "look into this" tasks without done criteria.
- Do not split work into tiny chatty tasks that ping the user every few minutes.
- Do not collapse planning, implementation, and verification into one unverified blob.
- Do not skip re-routing when task shape changes.
