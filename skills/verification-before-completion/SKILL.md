---
name: verification-before-completion
description: Use before claiming any task is done, any fix is working, or any pipeline run succeeded. Requires running verification commands and reading their output before making success claims. Adapted from obra/superpowers for project-owned use.
---

# Verification Before Completion

The iron rule: **no completion claims without fresh verification evidence.**

## The Gate

Before saying "done", "fixed", "passing", or "working":

1. **Identify** the command that proves the claim.
2. **Run** the full command. Not a partial run. Not a cached result.
3. **Read** the full output. Check exit code. Count passes and failures.
4. **Verify** that the output actually confirms the claim.
5. **Only then** make the claim.

## Signal Scout Verification Commands

### Tests pass

```powershell
npm test
```

Read the output. Count pass/fail. If any test fails, the task is not done.

### Digest builds cleanly

```powershell
npm run digest:demo
```

Check that the digest is written to `reports/daily/`. Open it. Verify the content is reasonable — not empty, not full of errors.

### Lookup returns results

```powershell
npm run lookup -- --query "agent workflow"
```

Check that the output includes both `Recommended Skills` and `Relevant Local Evidence` sections. If a change touched lookup, verify that the change is reflected in the output.

### Skills sync correctly

```powershell
npm run sync:agents
```

Check output for skill count and any skipped files. Verify that `.agents/skills/` and `.claude/skills/` contain the expected skill directories.

### Build and type check

```powershell
npx tsc --noEmit
```

Zero errors means the claim is valid.

## What Never Counts As Verification

- A previous test run from before your change.
- A confident assumption that it should work.
- Linter passing (linter is not a test suite).
- Another agent saying "it's done" without showing output.
- Partial output that you did not read fully.

## Patterns

### Fix verification

1. Run tests before the fix (establish baseline).
2. Apply the fix.
3. Run tests after the fix.
4. Confirm the specific failing test now passes.
5. Confirm no other tests broke.

### New feature verification

1. Run the full test suite.
2. Run the specific command that exercises the feature.
3. Read the output and confirm the new behavior is present.
4. If the feature touched the digest, re-generate and inspect the digest.

### Scoring or ranking change verification

1. Run `npm run digest:demo`.
2. Compare post ordering, scores, and decisions against the previous digest.
3. Confirm the intended change is visible and no unintended side effects appeared.
4. If a feedback rule was added, confirm it appears in the Run Notes section.

## Guardrails

- Do not say "tests pass" without running them right now.
- Do not say "digest looks good" without opening the generated file.
- Do not claim a fix works based on reading the code alone.
- If verification reveals a problem, say so. Do not hide it behind optimistic language.
