import assert from "node:assert/strict";
import test from "node:test";

import { buildActionQualitySummary } from "../src/analysis/action-quality.ts";
import { applyDiscussionCeilings } from "../src/analysis/discussion-ceilings.ts";
import type { ScoredPost, SourceKind } from "../src/types.ts";

function makeScoutPost(
  id: string,
  sourceId: string,
  sourceLabel: string,
  sourceKind: SourceKind,
  score: number,
  overrides: Partial<ScoredPost> = {},
): ScoredPost {
  return {
    id,
    sourceId,
    sourceLabel,
    sourceKind,
    sourceTier: "scout",
    sourcePriority: 2,
    externalId: id,
    text: "Agent workflow discussion for Claude Code and Codex setup patterns.",
    shortSummary: "Agent workflow discussion for Claude Code and Codex setup patterns.",
    dedupeKey: id,
    publishedAt: "2026-03-07T10:00:00Z",
    metadata: sourceKind === "reddit"
      ? { provider: "reddit-json-listing" }
      : sourceKind === "web"
        ? { provider: "hn-algolia-search" }
        : undefined,
    analysis: {
      topic: "Agent workflow pattern",
      decision: "save-for-later",
      theme: "agent-workflow",
      relevanceScore: score,
      baseRelevanceScore: score,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Useful discussion signal.",
      suggestedNextAction: "Save it.",
      project: "Volcker Copilot",
      urgency: "this-week",
      matchedSignals: ["claude code", "codex"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
    ...overrides,
  };
}

test("applyDiscussionCeilings limits Reddit discussion-only items and reports dropped counts", () => {
  const posts: ScoredPost[] = [
    makeScoutPost("reddit-1", "reddit-agent-watchlist", "Reddit Agent Watchlist: r/ClaudeCode", "reddit", 75),
    makeScoutPost("reddit-2", "reddit-agent-watchlist", "Reddit Agent Watchlist: r/ClaudeCode", "reddit", 72),
    makeScoutPost("reddit-3", "reddit-agent-watchlist", "Reddit Agent Watchlist: r/ClaudeCode", "reddit", 68),
    makeScoutPost(
      "reddit-artifact",
      "reddit-agent-watchlist",
      "Reddit Agent Watchlist: r/ClaudeCode",
      "reddit",
      66,
      {
        metadata: {
          provider: "reddit-json-listing",
          outboundUrl: "https://github.com/openai/skills",
        },
      },
    ),
  ];
  const capped = applyDiscussionCeilings(posts, []);
  const summary = buildActionQualitySummary(capped, []);

  assert.equal(capped.filter((post) => post.analysis.decision !== "ignore").length, 3);
  assert.equal(capped.find((post) => post.id === "reddit-3")?.analysis.decision, "ignore");
  assert.equal(capped.find((post) => post.id === "reddit-3")?.analysis.discussionCeilingDropped, true);
  assert.equal(capped.find((post) => post.id === "reddit-artifact")?.analysis.decision, "save-for-later");
  assert.equal(summary.discussionOnlyActionables, 2);
  assert.equal(summary.discussionOnlyDroppedByCeiling, 1);
  assert.equal(summary.bySource[0]?.discussionOnlyDropped, 1);
});

test("applyDiscussionCeilings applies Telegram limits per channel, not globally", () => {
  const posts: ScoredPost[] = [
    makeScoutPost("llm-1", "telegram-llm4dev", "LLM4dev", "telegram", 80),
    makeScoutPost("llm-2", "telegram-llm4dev", "LLM4dev", "telegram", 76),
    makeScoutPost("llm-3", "telegram-llm4dev", "LLM4dev", "telegram", 70),
    makeScoutPost("pav-1", "telegram-pavlenkodev", "Pavlenko Dev & AI", "telegram", 79),
    makeScoutPost("pav-2", "telegram-pavlenkodev", "Pavlenko Dev & AI", "telegram", 74),
    makeScoutPost("pav-3", "telegram-pavlenkodev", "Pavlenko Dev & AI", "telegram", 69),
  ];
  const capped = applyDiscussionCeilings(posts, []);
  const summary = buildActionQualitySummary(capped, []);
  const llm = summary.bySource.find((source) => source.sourceId === "telegram-llm4dev");
  const pav = summary.bySource.find((source) => source.sourceId === "telegram-pavlenkodev");

  assert.equal(capped.find((post) => post.id === "llm-3")?.analysis.decision, "ignore");
  assert.equal(capped.find((post) => post.id === "pav-3")?.analysis.decision, "ignore");
  assert.equal(llm?.discussionOnly, 2);
  assert.equal(llm?.discussionOnlyDropped, 1);
  assert.equal(pav?.discussionOnly, 2);
  assert.equal(pav?.discussionOnlyDropped, 1);
  assert.equal(summary.discussionOnlyDroppedByCeiling, 2);
});

test("applyDiscussionCeilings keeps Reddit discussion-only posts out of Do Today even when upstream score is too high", () => {
  const posts: ScoredPost[] = [
    makeScoutPost("reddit-hot", "reddit-agent-watchlist", "Reddit Agent Watchlist: r/codex", "reddit", 100, {
      analysis: {
        topic: "Agent workflow pattern",
        decision: "use-now",
        theme: "agent-workflow",
        relevanceScore: 100,
        baseRelevanceScore: 100,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful discussion signal.",
        suggestedNextAction: "Review it now.",
        project: "Volcker Copilot",
        urgency: "today",
        matchedSignals: ["codex", "agent"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
  ];

  const capped = applyDiscussionCeilings(posts, []);
  const post = capped[0];

  assert.equal(post?.analysis.decision, "save-for-later");
  assert.equal(post?.analysis.urgency, "this-week");
  assert.equal(post?.analysis.relevanceScore, 75);
  assert.match(post?.analysis.policyNotes?.join(" ") ?? "", /cannot ship as Do Today/i);
});
