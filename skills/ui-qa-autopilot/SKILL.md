---
name: ui-qa-autopilot
description: Use when the user wants a full automated UI QA pass that navigates and clicks through safe flows, captures failures, and returns reproducible findings.
---

# UI QA Autopilot

Use this skill for automatic browser QA when manual click-by-click testing is too slow.

## Trigger cases

- "Run full UI QA automatically."
- "Click through app flows and find broken behavior."
- "Check all main buttons and links with screenshots."

## Non-trigger cases

- "Need backend/unit test coverage only."
- "Need visual design critique only without interaction checks."
- "Need destructive admin flow testing (unless explicitly approved)."

## Workflow

1. Start or reuse the local app server.
2. Open the app in a real browser session.
3. Map key routes and visible actionable controls.
4. Execute a safe interaction pass:
   - click primary and secondary buttons
   - follow navigation links and menus
   - fill non-sensitive forms with test data
   - verify expected UI responses
5. Capture evidence:
   - failing step
   - screenshot
   - console/network signal if relevant
   - reproducible path
6. Return a QA report grouped by severity and user impact.

## Guardrails

- Never trigger destructive actions by default (`delete`, `remove`, `pay`, irreversible submit).
- Do not claim pass/fail without browser evidence.
- Prefer one reproducible failing path over vague bug statements.

