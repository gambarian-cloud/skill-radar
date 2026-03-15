# Radar Presets

This folder defines the next personalization layer for `Signal Scout`.

The model is:

1. keep five output-oriented capability areas always on
2. add optional domain lenses that change ranking, sources, and recommendations
3. do not replace the core with identity labels

Why this exists:

- `Starter Pack` already proved that people come to `Codex` and `Claude Code` to make things
- those outputs are stable:
  - websites
  - apps
  - presentations
  - research and writing
  - automations
- what changes from person to person is not the core output layer but the domain context

Current preset model:

- always-on core:
  - Build Websites
  - Build Apps
  - Make Presentations
  - Research & Writing
  - Automate Work
- optional domain lenses:
  - Education
  - History
  - Gaming
  - Business
  - Sports
  - Family
  - Creator

How to use this folder:

- `core-capability-baseline.md` explains the always-on layer
- `lenses/` holds one box per domain lens
- `Research/radar-presets-deep-research-2026-03-11.md` holds the synthesis and evidence

Design rules:

- core outputs are always on and do not require a user decision
- lenses are overlays, not separate products
- each lens must define:
  - what it monitors
  - where it looks
  - what it adopts now
  - what it treats as experiment, watch, or reject
