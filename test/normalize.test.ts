import assert from "node:assert/strict";
import test from "node:test";

import { normalizePosts } from "../src/normalize/posts.ts";
import type { RawSourcePost } from "../src/types.ts";

const window = {
  start: new Date("2026-03-05T00:00:00Z"),
  end: new Date("2026-03-06T00:00:00Z"),
};

test("normalizePosts filters noise, duplicates, and outside-window posts", () => {
  const rawPosts: RawSourcePost[] = [
    {
      sourceId: "github-agent-watchlist",
      sourceLabel: "GitHub Agent Watchlist: OpenAI Codex",
      sourceKind: "github",
      sourceTier: "origin",
      sourcePriority: 1,
      externalId: "codex-1",
      text: "openai/codex: local coding agent workflow with approvals, sandboxing, and worktrees for real repos.",
      url: "https://github.com/openai/codex",
      author: "openai",
      publishedAt: "2026-03-05T10:00:00Z",
      metadata: {
        repoFullName: "openai/codex",
      },
    },
    {
      sourceId: "github-agent-watchlist",
      sourceLabel: "GitHub Agent Watchlist: OpenAI Codex duplicate",
      sourceKind: "github",
      sourceTier: "origin",
      sourcePriority: 1,
      externalId: "codex-2",
      text: "openai/codex: local coding agent workflow with approvals, sandboxing, and worktrees for real repos.",
      url: "https://github.com/openai/codex",
      author: "openai",
      publishedAt: "2026-03-05T10:05:00Z",
    },
    {
      sourceId: "telegram-vibe-coding",
      sourceLabel: "Vibe Coding",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 1,
      externalId: "short-noise",
      text: "subscribe now",
      publishedAt: "2026-03-05T11:00:00Z",
    },
    {
      sourceId: "telegram-vibe-coding",
      sourceLabel: "Vibe Coding",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 1,
      externalId: "outside-window",
      text: "Useful agent workflow update about codex and claude code with enough detail to pass noise filters.",
      publishedAt: "2026-03-04T11:00:00Z",
    },
  ];

  const result = normalizePosts(rawPosts, window);

  assert.equal(result.posts.length, 1);
  assert.equal(result.stats.totalFetched, 4);
  assert.equal(result.stats.droppedDuplicates, 1);
  assert.equal(result.stats.droppedNoise, 1);
  assert.equal(result.stats.droppedOutsideWindow, 1);
  assert.equal(result.posts[0].metadata?.repoFullName, "openai/codex");
});

test("normalizePosts does not treat subscribers as subscribe noise", () => {
  const rawPosts: RawSourcePost[] = [
    {
      sourceId: "github-agent-watchlist",
      sourceLabel: "GitHub Agent Watchlist: OpenAI Skills",
      sourceKind: "github",
      sourceTier: "origin",
      sourcePriority: 1,
      externalId: "skills-1",
      text: "openai/skills: adoption signals include 2400 stars, 180 forks, 28 open issues, and 55 subscribers.",
      url: "https://github.com/openai/skills",
      author: "openai",
      publishedAt: "2026-03-05T12:00:00Z",
    },
  ];

  const result = normalizePosts(rawPosts, window);

  assert.equal(result.posts.length, 1);
  assert.equal(result.stats.droppedNoise, 0);
});

test("normalizePosts keeps text readable when replacement-character mojibake appears", () => {
  const rawPosts: RawSourcePost[] = [
    {
      sourceId: "github-agent-watchlist",
      sourceLabel: "GitHub Agent Watchlist: PM Skills",
      sourceKind: "github",
      sourceTier: "origin",
      sourcePriority: 1,
      externalId: "pm-skills-1",
      text: "phuryn/pm-skills: packaging ן¿½ reference for agents.",
      publishedAt: "2026-03-05T12:00:00Z",
    },
  ];

  const result = normalizePosts(rawPosts, window);

  assert.equal(result.posts.length, 1);
  assert.match(result.posts[0].text, /packaging/u);
  assert.match(result.posts[0].text, /reference for agents/u);
});

test("normalizePosts can keep slower sources on a wider freshness window", () => {
  const rawPosts: RawSourcePost[] = [
    {
      sourceId: "telegram-llm4dev",
      sourceLabel: "LLM4dev",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      externalId: "llm4dev-1",
      text: "Useful automation workflow update with enough detail to pass the noise filter and justify a slower scout window.",
      publishedAt: "2026-03-03T12:00:00Z",
    },
  ];

  const result = normalizePosts(
    rawPosts,
    {
      start: new Date("2026-03-05T00:00:00Z"),
      end: new Date("2026-03-06T00:00:00Z"),
    },
    {
      "telegram-llm4dev": 72,
    },
  );

  assert.equal(result.posts.length, 1);
  assert.equal(result.stats.droppedOutsideWindow, 0);
});
