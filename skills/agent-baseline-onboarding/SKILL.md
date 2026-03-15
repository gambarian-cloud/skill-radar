---
name: agent-baseline-onboarding
description: Use when setting up a fresh Claude Code or Codex environment, or when re-baselining an existing machine after drift. Builds the smallest stable shared baseline first, stages higher-risk integrations separately, and avoids giant skill or MCP dumps.
---

# Agent Baseline Onboarding

Use this skill when the task is:

- install the first sane baseline for `Claude Code`
- install the first sane baseline for `Codex`
- compare a machine against the current recommended baseline
- turn research notes into a practical install pack

Do not use this skill for:

- product work inside `src/`
- one-off project source onboarding
- adding every interesting skill or MCP server at once

## Workflow

1. Start from current baseline truth, not memory.

Read only the files needed for the decision:

- repo `AGENTS.md`
- repo `CLAUDE.md`
- `Research/baseline-gap-review-2026-03-08.md`
- `Research/baseline-global-pass-2026-03-08.md`
- `Research/baseline-hook-mcp-pass-2026-03-08.md`
- `Research/github-mcp-staged-rollout-2026-03-08.md`
- `Research/github-mcp-official-notes-2026-03-09.md`

2. Separate the baseline into four buckets before installing anything.

- `adopt now`: low-risk, high-signal defaults
- `stage next`: useful, but needs auth, trust, or explicit rollout
- `watch`: interesting, not baseline
- `reject`: noise, redundancy, or too much blast radius

3. Build the smallest shared baseline first.

Current default baseline:

- global `C:\Users\MI\.codex\AGENTS.md`
- global `C:\Users\MI\.claude\CLAUDE.md`
- Codex TUI status line in `C:\Users\MI\.codex\config.toml`
- Codex personal skills:
  - `systematic-debugging`
  - `verification-before-completion`
  - `using-git-worktrees`
  - `brainstorming`
  - `writing-plans`
  - `executing-plans`
  - `model-routing`
- Claude personal skills:
  - `systematic-debugging`
  - `verification-before-completion`
  - `using-git-worktrees`
  - `brainstorming`
  - `writing-plans`
  - `executing-plans`
- Claude deny rules for secrets in `C:\Users\MI\.claude\settings.json`

4. Apply the first stable project/tooling layer next.

Adopt now:

- project stop hook for Claude in this repo
- project slash commands in `.claude/commands/`
- `Context7` MCP
- `Sequential Thinking` MCP
- `GitHub MCP` in read-only mode

Safe policy for `GitHub MCP`:

- use the official GitHub server
- start read-only
- do not store the token in repo files
- do not start with write-capable issue or PR flows

Watch:

- formatter hook
- notification hook
- `Brave Search MCP`
- `subagent-driven-development`

Reject for now:

- `Filesystem MCP`
- `Git MCP`
- giant skill packs
- messenger bridges
- orchestration frameworks
- forced WSL migration
- memory-bank MCP as day-one baseline

5. Keep project-owned and user-level setup separate.

- user-level baseline belongs in `C:\Users\MI\.codex\` and `C:\Users\MI\.claude\`
- project-owned baseline belongs in repo files such as `skills/`, `.mcp.json`, `.claude/settings.json`, `AGENTS.md`, and `CLAUDE.md`

6. Verify the baseline immediately after changes.

For this repo, use:

```powershell
npm run audit:baseline
npm test
npm run sync:agents
```

If MCP or hook changes were added, also verify:

- config parses
- the command starts without immediate error
- a fresh session can see the new baseline

7. Record rollback before calling the baseline done.

Always write:

- what changed
- which files are new
- which files were backed up
- exact rollback path

8. Keep the machine-check separate from the install notes.

Use `npm run audit:baseline` to compare the current machine against the canonical baseline before adding more tools.

9. If the baseline needs to be handed to a fresh user, point them at the external starter-pack docs.

- `starter-pack/README.md`
- `starter-pack/APPLY.md`
- `starter-pack/VERIFY.md`

## Guardrails

- Do not install a giant pack just because research mentioned it.
- Do not let a community workflow override official platform mechanics.
- Do not treat historical approval logs as canonical baseline.
- Do not install auth-bearing MCP servers until scope, secret path, and read-only policy are explicit.
- Prefer one safe shared baseline over perfect symmetry between Claude and Codex.
