---
name: design-audit-readonly
description: Use when the user needs a strict UI/UX best-practices audit without changing application code. Produces a prioritized issue list with clear fixes.
---

# Design Audit Readonly

Use this skill when the goal is to audit design quality, not to implement UI changes.

## Trigger cases

- "Audit my app design by best practices."
- "Check UI quality but do not edit code."
- "Find design issues and tell me what to fix first."

## Non-trigger cases

- "Build a new page/component."
- "Refactor frontend architecture."
- "Write visual styling code now."

## Workflow

1. Run a real browser pass on desktop and mobile viewport sizes.
2. Review visual hierarchy, spacing rhythm, and navigation clarity.
3. Check forms, buttons, links, and empty states for clarity.
4. Verify interaction states: loading, error, success, hover, focus, disabled.
5. Check accessibility basics: contrast, focus visibility, keyboard reachability, labels.
6. Return a prioritized issue list:
   - severity (`critical`, `high`, `medium`, `low`)
   - where it appears
   - why it hurts UX
   - exact fix guidance

## Guardrails

- Read-only by default: do not edit files unless explicitly asked.
- Do not approve a UI that only works at one viewport.
- Prefer clear and consistent UX over visual novelty.

