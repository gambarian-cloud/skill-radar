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

## Skill Composition Mapping

When a task matches a category below, use the skill chain — don't skip steps.

| Task type | Skill chain |
|-----------|-------------|
| Build a website/page | `brainstorming` → `frontend-design` → `visual-explainer` (for architecture) → build |
| Build a presentation | `brainstorming` → `frontend-slides` → build |
| UX review of a site | `ux-audit` → `visual-explainer` (for report) |
| Evaluate a link/post/video | `triage-finding` |
| Find tools before building | `tool-scout` → then build or adopt |
| Create or edit a skill | `skill-stress-test` (RED-GREEN-REFACTOR) |
| Design + code a feature | `brainstorming` → `writing-plans` → `executing-plans` |
| Debug a failure | `systematic-debugging` |
| Research a topic | `deep-research` |
| Review code or diff | `code-review` |

**Rule:** If a task matches and you skip the chain, explain why.
