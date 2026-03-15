# Signal Scout

Read @AGENTS.md for the operational rules and @PRD.md for product direction.

## Shared Model

- This repo is a shared workspace for Codex and Claude Code.
- Canonical reusable skills live in `skills/`.
- `npm run sync:agents` mirrors them into `.agents/skills/` and `.claude/skills/`.
- `npm run lookup -- --query "<topic>"` is the first step before inventing a new workflow.
- Daily update flow remains `npm run digest:demo` or `npm run digest -- --mode auto`.

## Priorities

- Convert repeated findings into reusable project-owned skills.
- Prefer community-backed workflow truth over unsupported hype.
- Keep this file short. Deeper baseline guidance lives in @reports/research/2026-03-06-dual-tool-baseline.md.
