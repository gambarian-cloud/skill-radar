# Staged Skills

This folder is the internal holding area for skills that are:

- useful
- evidence-backed enough to keep
- but not yet ready for the public Starter Pack default

Use this folder for skills that are:

- advanced
- high-stakes
- domain-specific
- still waiting for clearer install policy
- candidates for a future optional add-on pack

Do not treat `staged-skills/` as the canonical shared baseline.

Canonical shared internal baseline still lives in:

- `skills/`

Public Starter Pack baseline still lives in the standalone repo:

- `C:\Users\MI\Desktop\PROJECTS\codex-claude-code-starter-pack`

## Current staged items

### `hebrew-medical-pdf-to-markdown`

Status:

- `staged`
- internal
- not in public Starter Pack default

Why staged instead of public default:

- it is narrower and more high-stakes than the general Hebrew PDF utility
- it is specifically medical
- mistakes here carry more risk than mistakes in a general document workflow

Promotion path if we decide to ship it later:

1. keep it as an optional medical add-on, not part of the one-button public default
2. add stronger warning copy and intended-use boundaries
3. verify install and smoke-test flow in the standalone repo
4. only then decide whether it belongs in a public optional pack
