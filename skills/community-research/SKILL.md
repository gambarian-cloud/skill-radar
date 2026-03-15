---
name: community-research
description: Use when researching practitioner knowledge, open-source workflows, and curator channels for Signal Scout. Map upstream artifacts, adoption signals, criticism, and whether a community pattern should outrank official guidance.
---

# Community Research

Use this skill when the user wants the real working pattern, not just the official documented one.

## Workflow

1. Start from the practitioner or curator signal.

Examples:

- Boris Cherny
- a Telegram channel
- a YouTube explainer
- a GitHub repo shared by operators

2. Find the backing artifact.

Prefer:

- GitHub repo
- issues or discussions
- release notes
- benchmark or eval
- concrete command, prompt, or repo file

3. Measure adoption and criticism.

Look for:

- stars and forks
- issues and discussions
- repeated references from strong practitioners
- serious criticism that tests the idea
- evidence that the pattern survived criticism

4. Separate two questions.

- `artifact truth`: does this exist and how is it supposed to work
- `practice truth`: do strong users actually prefer this pattern

5. Write the result as a short research note under `reports/research/`.

## Decision Rule

A community pattern can outrank official guidance when:

- it has a real artifact
- it has visible adoption
- it is repeated by trusted practitioners
- it fits the current project better than the official default

## Guardrails

- Do not treat hype as evidence.
- Do not stop at one tweet or one video.
- Do not mistake a curator for the origin if the artifact is somewhere else.
