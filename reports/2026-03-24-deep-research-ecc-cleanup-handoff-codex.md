# Deep Research ECC Cleanup Handoff

Summary:
- Cleaned the `deep-research` patch after the ECC comparison pass.
- Kept the two good additions: explicit full-source reading in core and same-model parallelism as an optional reference.
- Fixed the docs inconsistencies that were still blocking a clean approval.

Files:
- `skills/deep-research/SKILL.md`
- `skills/deep-research/references/long-run-artifact-spec.md`
- `skills/deep-research/references/cross-model-delegation.md`
- `skills/deep-research/references/distribution-registries.md`
- `skills/deep-research/references/domain-ecosystem-scans.md`

What changed:
- In `SKILL.md`, clarified step `4.5` so distribution + domain-native query passes are required for ecosystem scans, while enterprise/commercial and frontier/preprint remain conditional.
- In `cross-model-delegation.md`, replaced the stale `steps 1-7` wording with a generic main-workflow reference.
- In `cross-model-delegation.md`, replaced hardcoded `15_external-deep-research-cross-review.md` with `10_cross-review.md` when free, otherwise the next sequential artifact number.
- In `cross-model-delegation.md`, kept the new same-model parallel subagent section, but removed mojibake and aligned wording.
- In `distribution-registries.md`, softened the absolute `downloads > stars` claim into a directional signal with caveats.
- In `distribution-registries.md` and `domain-ecosystem-scans.md`, replaced mojibake arrows with ASCII `->`.

Verification:
- `npm run sync:agents` -> passed
- Confirmed the new `deep-research` references exist in both overlays:
  - `.agents/skills/deep-research/references/`
  - `.claude/skills/deep-research/references/`
- Confirmed both overlays contain the explicit full-source-reading reminder in `SKILL.md`
- `git diff --check -- skills/deep-research .agents/skills/deep-research .claude/skills/deep-research` -> no whitespace errors, only LF/CRLF warnings on tracked files

Risks/Assumptions:
- This pass was docs-only; no product code changed, so no test-suite run was needed beyond sync/consistency checks.
- `cross-model-delegation.md` still references verification as `step 9`, which matches the current numbered workflow in `SKILL.md`.
- I did not push to the separate public Starter Pack repo from this workspace.

Next step:
- Review whether the new reference set is now lean enough, or if any of the ecosystem guidance still belongs in `references/` but should be shortened further.
- If approved, commit this bounded `deep-research` doc pack as one clean git change.
