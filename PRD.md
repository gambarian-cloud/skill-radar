# PRD

Date: 2026-03-06
Status: active working draft
Product name: Signal Scout
Product description: a trusted-source skill radar and workflow intelligence tool

## Product Summary

`Signal Scout` should not be just a daily digest generator.

It should become a small intelligence layer that helps answer two different questions:

1. `What changed recently that we should care about?`
2. `Given the work I am doing right now, are there skills, repos, workflows, or patterns that would help?`

That means the product has to support both:

- proactive updates
- on-demand lookup

## Problem

Right now, useful skills and workflow patterns are scattered across:

- official docs
- GitHub repos
- practitioner posts
- Telegram channels
- Reddit, HN, YouTube, and other secondary layers

The problem is not only discovery.

The problem is also evaluation:

- what is official capability truth
- what is real practice truth
- what is relevant to a specific project right now
- what is reusable across projects
- what deserves to become part of our shared skill pack

Without a clear product shape, the project risks becoming an accretion of sources and scripts with no stable user value.

## Product Thesis

The core thesis is:

A small number of trusted sources, combined with baseline research and structured community evidence, can give better workflow intelligence than broad crawling.

A second thesis is:

Official sources tell us what exists. Community and open source tell us what is actually good.

A third thesis is:

The product becomes much more valuable if it can answer ad hoc project questions, not just emit daily updates.

## Primary User

Primary user: Sasha.

The user is working across multiple projects and wants help with:

- finding relevant skills and workflows
- staying current without reading everything
- reusing good patterns across projects
- identifying when a project should adopt a better agent workflow, command set, repo setup, or evaluation pattern

## Jobs To Be Done

### Job 1: Daily update radar

When new material appears in trusted sources, the user wants a short digest that says:

- what matters
- what can wait
- what is relevant now
- what action is worth taking

### Job 2: On-demand lookup

When the user is in the middle of some project, they want to ask:

- are there skills for this
- are there repos that already solved this well
- what are the strongest current patterns
- is there a better setup than what I am doing now

### Job 3: Baseline setup for a new or evolving project

When starting or reframing a project, the user wants:

- a baseline of best practices
- a short operational context file
- candidate skills
- source watchlists
- evidence for why a certain workflow is worth adopting

## Product Modes

The product should have four modes.

### 1. Baseline mode

Purpose: establish the current best known setup for a topic, project, or tool.

Output examples:

- baseline research note
- project setup recommendation
- candidate skills to include

### 2. Update mode

Purpose: scan trusted sources for new items and produce a digest.

Output examples:

- daily digest
- weekly digest
- source-specific summary

### 3. Lookup mode

Purpose: answer a live question about whether useful skills, repos, or patterns already exist.

Example questions:

- what skills exist for repo migrations
- what are the best current patterns for agent memory
- what repo setup patterns help Codex or Claude Code
- is there a known workflow for this problem

### 4. Skill-pack mode

Purpose: turn repeated findings into a shared personal repository of reusable skills.

Output examples:

- project-owned skill folders
- short operational instructions
- candidate command or subagent flows

## Desired Outcomes

The product is successful when:

- useful patterns are found before they are needed
- relevant recommendations are easy to act on
- the user can ask for help mid-project and get a fast answer
- strong community patterns are not lost behind official documentation
- repeated findings turn into reusable skills and project conventions

## Non-Goals

This product should not try to be:

- a generic internet scraper for everything
- a large database product from day one
- a full autonomous execution engine that applies all recommendations automatically
- a broad content warehouse with weak ranking

## Product Scope

### In scope now

- trusted-source monitoring
- baseline research notes
- daily digest generation
- GitHub and Telegram evidence layers
- project-owned skill pack
- relevance scoring against current project context

### In scope next

- on-demand lookup against the baseline and trusted-source evidence
- stronger GitHub adoption signals such as stars, forks, issues, discussions, and release activity
- Reddit, HN, and YouTube allowlists
- per-project relevance profiles

### Out of scope for now

- database-backed long-term event storage
- embeddings-first search architecture
- broad autonomous web exploration without source curation
- multi-user product workflows

## Information Model

The product should reason about these entities:

- `source`: where something was found
- `artifact`: repo, doc, issue, discussion, release, video, post
- `pattern`: workflow or best practice extracted from artifacts
- `skill`: reusable instruction or workflow worth packaging
- `project`: the active project or work context
- `recommendation`: a suggested action tied to project relevance

## Decision Model

The product should evaluate each signal across five dimensions:

1. source class
2. artifact quality
3. adoption signals
4. criticism and counterpoints
5. current project fit

Useful mental split:

- official sources => capability truth
- practitioner and OSS sources => practice truth

Best overall recommendations come from both together.

## Output Surfaces

The product should maintain three output surfaces.

### 1. Research baseline

Longer-lived notes that define the current understanding.

Current location:

- `reports/research/`

### 2. Operational digest

Short decision-oriented updates.

Current location:

- `reports/daily/`

### 3. Shared skill pack

Reusable workflows that can work across Codex and Claude Code.

Current location:

- `skills/`

## Architecture Implications

The existing pipeline split remains correct:

1. source fetching
2. normalization
3. scoring
4. digest generation

But the product needs one more conceptual layer on top:

5. knowledge use

That means the system should not only ingest updates. It should also support lookup against its accumulated baseline.

## Suggested Next Product Step

The next build step should not be “add more random sources.”

The next build step should be:

Build a small lookup workflow that takes a user query such as “do we know any skills or repos that help with X” and answers from:

- current baseline research notes
- trusted-source watchlists
- GitHub watchlist evidence
- the shared skill pack

That is the shortest path from “interesting radar” to “actually useful working tool.”

## MVP Definition

A good product MVP from here is:

- daily digest works
- GitHub and Telegram sources work in mock mode
- baseline notes exist
- skill pack exists
- user can run a query-oriented workflow and get a short answer about relevant skills or patterns

Until lookup exists, the product is still only half of what it should be.

## Roadmap

### Phase 1: Baseline and trusted-source radar

- done or in progress
- AGENTS baseline
- research notes
- Telegram flow
- GitHub watchlist
- shared skill pack

### Phase 2: Lookup and evidence quality

- query-oriented lookup flow
- GitHub adoption signal enrichment
- source and artifact cross-linking
- better ranking using community evidence

### Phase 3: Live expansion

- Reddit allowlist
- HN allowlist
- YouTube allowlist
- more trusted scouts and practitioner tracking

### Phase 4: Project-aware recommendations

- per-project context profiles
- reusable recommendation templates
- automatic suggestion of relevant skills

### Phase 5: Preset-based personalization

- keep the five core output areas always on:
  - websites
  - apps
  - presentations
  - research and writing
  - automation
- add optional domain lenses:
  - education
  - history
  - gaming
  - business
  - sports
  - family
  - creator
- tune ranking, sources, and recommendations through lenses instead of building separate mini-products

## Product Principle

This project should feel less like a feed reader and more like a compact research assistant for skills, workflows, and project setup.

If it only tells us what happened, it is incomplete.

If it can also tell us what is worth adopting for the work in front of us, it becomes genuinely useful.
