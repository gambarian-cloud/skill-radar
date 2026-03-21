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

## Skill Routing

Before starting work, check if a skill matches the task. Load the skill. Follow it. Do not paraphrase it from memory.

| Task type | Start with |
|-----------|------------|
| Build a website/page | `brainstorming` |
| Build a presentation | `brainstorming` |
| UX review of a site | `ux-audit` |
| Evaluate a link/post/video | `triage-finding` |
| Find tools before building | `tool-scout` |
| Create or edit a skill | `skill-stress-test` |
| Design + code a feature | `brainstorming` |
| Debug a failure | `systematic-debugging` |
| Research a topic | `deep-research` |
| Review code or diff | `code-review` |
| Holistic project review | `brainstorming` |

Each skill will tell you what to do next. Follow its instructions.

If you skip a matching skill: state which skill you skipped and why before proceeding.
