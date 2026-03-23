# Starter Pack Domain Pack Architecture - 2026-03-24

## Thesis

Starter Pack should not stay a single undifferentiated product forever.

It should evolve into:

1. a small public default baseline
2. a set of optional domain add-on packs
3. a staged internal warehouse for higher-risk or not-yet-ready packs

## Why This Matters

The public one-button Starter Pack is optimized for:

- beginners
- low confusion
- low blast radius
- immediate first value

That is not the same thing as:

- every important domain a real person eventually needs

If we force all domains into the one-button public default, we will create a giant noisy install.

If we keep everything out, we miss obvious real-world needs.

So the right structure is:

- `default baseline` for almost everyone
- `optional domain packs` for major real-world workflows
- `staged-skills/` for advanced, high-stakes, or still-unproven packs

## Current Three Layers

### 1. Public Default

Lives in:

- `C:\Users\MI\Desktop\PROJECTS\codex-claude-code-starter-pack`

This should include:

- calm baseline instructions
- planning, execution, debugging, verification
- build-ready website/app support
- design help
- browser review
- deploy help
- presentation help
- narrow utilities that are useful and low-confusion

### 2. Optional Domain Packs

These are the next product layer we should explicitly design.

Candidate packs:

- `builder-pack`
- `medical-biomed-pack`
- `finance-pack`
- `education-pack`

These should not all be public default.

They should be opt-in packs with clearer boundaries and pack-specific onboarding.

### 3. Internal Staged Warehouse

Lives in:

- `C:\Users\MI\Desktop\PROJECTS\Skill Radar\staged-skills`

Use this for:

- high-stakes packs
- domain-specific packs
- packs that still need install policy
- packs that need better warnings or audit before shipping

## Current Domain-Pack State

### Builder

Status:

- partially already in public Starter Pack default

Includes:

- websites/apps baseline
- frontend-design
- design-elevation
- web-design-guidelines
- playwright
- vercel-deploy
- react-best-practices

### Medical / Biomed

Status:

- not public default
- already emerging as a separate domain layer

Current staged assets:

- `staged-skills/hebrew-medical-pdf-to-markdown`
- `staged-skills/biomedical-knowledge-base-pack`

### Finance

Status:

- not yet shaped
- should be researched as a separate pack, not casually mixed into default

### Education

Status:

- conceptually strong
- source-pack research exists
- still not turned into a concrete optional install pack

## Why Earlier Deep Research Missed This

It did not fully fail.

It optimized for the wrong immediate question:

- what belongs in the public beginner default right now

It did not yet fully optimize for the next structural question:

- what pack ecosystem should sit around that default

So the miss was not:

- "medical is unimportant"

The miss was:

- "domain pack architecture was not yet made first-class"

## Recommended Rule Going Forward

When evaluating a new skill or workflow, classify it into one of four buckets:

1. `public default`
2. `optional domain pack`
3. `staged internal`
4. `reject`

Do not force everything into a binary yes/no for the main Starter Pack.

## Immediate Implication

Medical and biomedical skills should be evaluated as a future `medical-biomed-pack`, not as candidates for the one-button default.

The same likely applies to finance.
