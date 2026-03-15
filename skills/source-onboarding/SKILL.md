---
name: source-onboarding
description: Use when adding a new trusted source to Signal Scout or upgrading a source from idea to working config. Classify the source, create a replayable fixture, wire config, preserve architecture boundaries, and verify the source with a focused digest run.
---

# Source Onboarding

Use this skill when a source should move from research into the working pipeline.

## Workflow

1. Classify the source before touching code.

Use:

- `origin` for direct artifacts such as repos, docs, changelogs, and official release surfaces
- `scout` for curators, operators, and channels that surface good material early
- `explainer` for podcasts, YouTube, and secondary interpretation

2. Check the current baseline first.

Open:

- `AGENTS.md`
- `reports/research/2026-03-06-source-radar-map.md`
- `reports/research/2026-03-06-community-signal-model.md`

3. Add the source in the smallest possible way.

Default sequence:

- update `src/types.ts` only if the source kind is truly new
- update `src/config/sources.ts`
- add a replayable fixture under `fixtures/<kind>/`
- add or extend one fetcher under `src/sources/`
- keep normalization source-agnostic when possible

4. Preserve the no-creds path.

Every important source must have a working mock path.

5. Verify with a narrow run.

Use:

```powershell
node --experimental-strip-types src/index.ts --mode mock --source <source-id>
```

6. If the source is high-value, add or update a short research note under `reports/research/`.

## Guardrails

- Do not hardcode source-specific logic into digest rendering.
- Do not skip fixture creation.
- Do not add a database for source state.
- Prefer one clean source over adding many half-working sources.
