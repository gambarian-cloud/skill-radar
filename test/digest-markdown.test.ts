import assert from "node:assert/strict";
import test from "node:test";

import { renderDailyDigest } from "../src/digest/markdown.ts";
import type { DailyDigestResult, ScoredPost, TimeWindow } from "../src/types.ts";

function makePost(overrides: Partial<ScoredPost>): ScoredPost {
  return {
    id: "post-1",
    sourceId: "source-1",
    sourceLabel: "Test Source",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    externalId: "ext-1",
    url: "https://example.com/post-1",
    author: "tester",
    publishedAt: "2026-03-06T12:00:00Z",
    text: "Test text",
    shortSummary: "Test summary",
    dedupeKey: "dedupe-1",
    metadata: {
      repoFullName: "example/repo",
    },
    analysis: {
      topic: "Agent workflow pattern",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 92,
      baseRelevanceScore: 86,
      crossSourceAdjustment: 6,
      crossSourceNotes: ["Cross-source corroboration from watched repo example/repo."],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["codex"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
    ...overrides,
  };
}

test("renderDailyDigest writes a short executive brief with action buckets", () => {
  const posts: ScoredPost[] = [
    makePost({
      id: "today-post",
      url: "https://github.com/example/repo",
      metadata: { repoFullName: "example/repo", repoDescription: "Example repo for agent workflows", stars: 12345 },
    }),
    makePost({
      id: "week-post",
      sourceKind: "telegram",
      sourceLabel: "Vibe Coding",
      sourceTier: "scout",
      url: "https://t.me/example/1",
      metadata: undefined,
      analysis: {
        topic: "Reusable agent skills and workflow design",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 68,
        baseRelevanceScore: 68,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Still relevant.",
        suggestedNextAction: "Save it.",
        project: "Signal Scout",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "ignore-post",
      url: "https://example.com/ignore",
      metadata: undefined,
      analysis: {
        topic: "Developer tooling pattern",
        decision: "ignore",
        theme: "tooling",
        relevanceScore: 24,
        baseRelevanceScore: 24,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Not important.",
        suggestedNextAction: "Skip it.",
        project: "none",
        urgency: "none",
        matchedSignals: [],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
  ];

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-06.md",
    reportDate: "2026-03-06",
    stats: {
      totalFetched: 3,
      kept: 3,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts,
    notes: [],
    sourceModes: {
      "source-1": "mock",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "source-1",
        sourceLabel: "Test Source",
        sourceTier: "origin",
        modeUsed: "mock",
        fetched: 3,
        kept: 3,
        useNow: 1,
        saveForLater: 1,
        ignored: 1,
      },
    ],
    radarProfileSummary: "Current radar profile: active domain lenses -> Creator, Education; risk appetite -> balanced.",
    radarProfileFocus: "Current radar focus: Creator -> content pipelines, story and deck workflows; Education -> lesson and curriculum generation, teaching decks and worksheets.",
  };
  const window: TimeWindow = {
    start: new Date("2026-03-05T00:00:00Z"),
    end: new Date("2026-03-06T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /## Executive Brief/);
  assert.match(markdown, /Active radar profile: active domain lenses -> Creator, Education; risk appetite -> balanced\./);
  assert.match(markdown, /Active radar focus: Creator -> content pipelines, story and deck workflows/i);
  assert.match(markdown, /### Do Today/);
  assert.match(markdown, /Review \[example\/repo\]\(https:\/\/github\.com\/example\/repo\) today for Volcker Copilot: Example repo for agent workflows, 12K stars, updated today, corroborated by another trusted source\./);
  assert.match(markdown, /### Save This Week/);
  assert.match(markdown, /Save \[Reusable agent skills and workflow design\]\(https:\/\/t\.me\/example\/1\) for this week for Signal Scout; it is useful, but not a same-day move\./);
  assert.match(markdown, /### Ignore For Now/);
  assert.match(markdown, /Ignore \[Developer tooling pattern\]\(https:\/\/example\.com\/ignore\) for now; it does not map tightly to the current build plan\./);
  assert.match(markdown, /### Run Health/);
  assert.match(markdown, /source-1 ran in mock mode, so this digest is not a fully live view\./);
  assert.match(markdown, /## Source Health/);
  assert.match(markdown, /Test Source \(source-1, origin, mock\): fetched 3, kept 3, actionable 2, ignored 1\./);
  assert.match(markdown, /## Action Quality/);
  assert.match(markdown, /- actionable total: 2/);
  assert.match(markdown, /- artifact-backed: 1/);
  assert.match(markdown, /- discussion-only: 1/);
  assert.match(markdown, /- corroborated total: 0/);
  assert.match(markdown, /- origin-confirmed: 0/);
  assert.match(markdown, /- scout-overlap: 0/);
});

test("renderDailyDigest explains discovery versus artifact confirmation for scout posts", () => {
  const scoutPost = makePost({
    id: "scout-post",
    sourceId: "telegram-llm4dev",
    sourceLabel: "LLM4dev",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 2,
    url: "https://t.me/LLM4dev/1001",
    metadata: undefined,
    analysis: {
      topic: "Reusable agent skills and workflow design",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 90,
      baseRelevanceScore: 82,
      crossSourceAdjustment: 8,
      crossSourceNotes: ["Direct repo evidence from watched repo anthropics/skills.", "Also surfaced by another scout source."],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["skills"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });
  const originPost = makePost({
    id: "origin-post",
    sourceId: "github-agent-watchlist",
    sourceLabel: "GitHub Agent Watchlist: Anthropic Skills",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    url: "https://github.com/anthropics/skills",
    metadata: {
      repoFullName: "anthropics/skills",
      repoDescription: "Public repository for Agent Skills",
      stars: 86500,
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-06.md",
    reportDate: "2026-03-06",
    stats: {
      totalFetched: 2,
      kept: 2,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [scoutPost, originPost],
    notes: [],
    sourceModes: {
      "telegram-llm4dev": "mock",
      "github-agent-watchlist": "live",
    },
    crossLinks: [
      {
        fromPostId: "scout-post",
        toPostId: "origin-post",
        fromSourceId: "telegram-llm4dev",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "anthropics/skills",
      },
      {
        fromPostId: "hn-post",
        toPostId: "scout-post",
        fromSourceId: "hn-agent-search",
        toSourceId: "telegram-llm4dev",
        linkType: "scout-corroboration",
        repoFullName: "anthropics/skills",
      },
    ],
    sourceHealth: [
      {
        sourceId: "telegram-llm4dev",
        sourceLabel: "LLM4dev",
        sourceTier: "scout",
        modeUsed: "mock",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-05T00:00:00Z"),
    end: new Date("2026-03-06T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Review \[anthropics\/skills\]\(https:\/\/github\.com\/anthropics\/skills\) today for Volcker Copilot: Public repository for Agent Skills, 87K stars, updated today, surfaced by a trusted scout source\./);
  assert.match(markdown, /- signal chain: scout discovery -> artifact evidence via anthropics\/skills -> repeated by another scout source\./);
});

test("renderDailyDigest collapses duplicate Do Today items that point to the same repo", () => {
  const scoutPost = makePost({
    id: "scout-openai-codex",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/codex",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    url: "https://www.reddit.com/r/codex/comments/example/openai-codex/",
    mentionedRepos: ["openai/codex"],
    metadata: {
      outboundUrl: "https://www.reddit.com/r/codex/comments/example/openai-codex/",
    },
    analysis: {
      topic: "Agent workflow pattern",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 93,
      baseRelevanceScore: 89,
      crossSourceAdjustment: 4,
      crossSourceNotes: ["Direct repo evidence from watched repo openai/codex."],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["codex"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });
  const originPost = makePost({
    id: "origin-openai-codex",
    sourceId: "github-agent-watchlist",
    sourceLabel: "GitHub Agent Watchlist: OpenAI Codex",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    url: "https://github.com/openai/codex/releases/tag/rust-v0.112.0",
    metadata: {
      repoFullName: "openai/codex",
      repoDescription: "Lightweight coding agent that runs in your terminal",
      stars: 64097,
      releaseTag: "rust-v0.112.0",
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-09.md",
    reportDate: "2026-03-09",
    stats: {
      totalFetched: 2,
      kept: 2,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [scoutPost, originPost],
    notes: [],
    sourceModes: {
      "reddit-agent-watchlist": "live",
      "github-agent-watchlist": "live",
    },
    crossLinks: [
      {
        fromPostId: "scout-openai-codex",
        toPostId: "origin-openai-codex",
        fromSourceId: "reddit-agent-watchlist",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "openai/codex",
      },
    ],
    sourceHealth: [
      {
        sourceId: "reddit-agent-watchlist",
        sourceLabel: "Reddit Agent Watchlist",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-08T00:00:00Z"),
    end: new Date("2026-03-09T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Review \[openai\/codex\]\(https:\/\/github\.com\/openai\/codex\/releases\/tag\/rust-v0\.112\.0\) today/);
  assert.doesNotMatch(markdown, /Review \[Agent workflow pattern\]\(https:\/\/www\.reddit\.com\/r\/codex\/comments\/example\/openai-codex\/\) today/);
});

test("renderDailyDigest shows external artifact evidence for scout posts outside the watchlist", () => {
  const scoutPost = makePost({
    id: "reddit-post",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/ClaudeCode",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    url: "https://www.reddit.com/r/ClaudeCode/comments/router/tool/",
    metadata: {
      outboundUrl: "https://github.com/example/ai-nexus",
    },
    analysis: {
      topic: "Agent workflow pattern",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 88,
      baseRelevanceScore: 88,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["claude code"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 1,
      kept: 1,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [scoutPost],
    notes: [],
    sourceModes: {
      "reddit-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "reddit-agent-watchlist",
        sourceLabel: "Reddit Agent Watchlist",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Review \[Agent workflow pattern\]\(https:\/\/www\.reddit\.com\/r\/ClaudeCode\/comments\/router\/tool\/\) today for Volcker Copilot: links to external artifact example\/ai-nexus\./);
  assert.match(markdown, /- signal chain: scout discovery -> artifact evidence via example\/ai-nexus\./);
  assert.match(markdown, /- linked artifact: example\/ai-nexus \(https:\/\/github\.com\/example\/ai-nexus\)/);
});

test("renderDailyDigest shows direct repo mentions even when no origin post is present in the run", () => {
  const scoutPost = makePost({
    id: "reddit-direct-repo",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/codex",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    url: "https://www.reddit.com/r/codex/comments/slides/help/",
    metadata: {
      provider: "reddit-json-listing",
      outboundUrl: "https://www.reddit.com/r/codex/comments/slides/help/",
    },
    mentionedRepos: ["openai/skills"],
    analysis: {
      topic: "Reusable agent skills and workflow design",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 92,
      baseRelevanceScore: 92,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["skill", "codex"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-09.md",
    reportDate: "2026-03-09",
    stats: {
      totalFetched: 1,
      kept: 1,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [scoutPost],
    notes: [],
    sourceModes: {
      "reddit-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "reddit-agent-watchlist",
        sourceLabel: "Reddit Agent Watchlist",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-08T00:00:00Z"),
    end: new Date("2026-03-09T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /today for Volcker Copilot: points to openai\/skills\./);
  assert.match(markdown, /signal chain: scout discovery -> artifact evidence via openai\/skills\./);
});

test("renderDailyDigest shows GitHub release activity in repo evidence", () => {
  const markdown = renderDailyDigest({
    reportPath: "reports/daily/2026-03-09.md",
    reportDate: "2026-03-09",
    stats: {
      totalFetched: 1,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
      kept: 1,
    },
    posts: [
      {
        id: "github-post-1",
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist: OpenAI Codex",
        sourceKind: "github",
        sourceTier: "origin",
        sourcePriority: 1,
        externalId: "openai/codex:2026-03-09",
        publishedAt: "2026-03-09T10:00:00Z",
        text: "openai/codex release post",
        shortSummary: "openai/codex release post",
        dedupeKey: "github-post-1",
        url: "https://github.com/openai/codex/releases/tag/v1.2.3",
        metadata: {
          repoFullName: "openai/codex",
          stars: 64000,
          forks: 8500,
          openIssues: 1700,
          subscribers: 380,
          pushedAt: "2026-03-09T09:00:00Z",
          releaseTag: "v1.2.3",
          releasePublishedAt: "2026-03-09T10:00:00Z",
        },
        analysis: {
          topic: "Reusable agent skills and workflow design",
          decision: "use-now",
          theme: "agent-workflow",
          relevanceScore: 100,
          baseRelevanceScore: 96,
          crossSourceAdjustment: 4,
          crossSourceNotes: ["Surfaced by a trusted scout source."],
          scoreAdjustment: 0,
          whyItMatters: "Official Codex product truth.",
          suggestedNextAction: "Review whether openai/codex exposes one Codex workflow worth folding into the current baseline.",
          project: "Volcker Copilot",
          urgency: "today",
          matchedSignals: ["codex"],
          feedbackRuleIds: [],
          feedbackNotes: [],
        },
      },
    ],
    notes: [],
    sourceModes: {
      "github-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  }, {
    start: new Date("2026-03-08T00:00:00Z"),
    end: new Date("2026-03-09T00:00:00Z"),
  });

  assert.match(markdown, /latest release v1\.2\.3 on 2026-03-09/i);
});

test("renderDailyDigest shows per-subreddit Reddit breakdown in Source Health", () => {
  const redditArtifactPost = makePost({
    id: "reddit-claudeai",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/ClaudeAI",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    url: "https://www.reddit.com/r/ClaudeAI/comments/example/artifact/",
    metadata: {
      subreddit: "ClaudeAI",
      outboundUrl: "https://github.com/example/agent-kit",
    },
    analysis: {
      topic: "Reusable agent skills and workflow design",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 90,
      baseRelevanceScore: 90,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["claude code"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });
  const redditDiscussionPost = makePost({
    id: "reddit-lmdevs",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/LLMDevs",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    url: "https://www.reddit.com/r/LLMDevs/comments/example/discussion/",
    metadata: {
      subreddit: "LLMDevs",
      outboundUrl: "https://www.reddit.com/r/LLMDevs/comments/example/discussion/",
    },
    analysis: {
      topic: "Agent workflow pattern",
      decision: "save-for-later",
      theme: "agent-workflow",
      relevanceScore: 75,
      baseRelevanceScore: 75,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Still relevant.",
      suggestedNextAction: "Save it.",
      project: "Volcker Copilot",
      urgency: "this-week",
      matchedSignals: ["agent"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-09.md",
    reportDate: "2026-03-09",
    stats: {
      totalFetched: 4,
      kept: 2,
      droppedOutsideWindow: 2,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [redditArtifactPost, redditDiscussionPost],
    notes: [
      {
        sourceId: "reddit-agent-watchlist",
        message: "Fetched 8 Reddit post(s) from r/ClaudeAI; kept 1 after scout filtering.",
      },
      {
        sourceId: "reddit-agent-watchlist",
        message: "Fetched 8 Reddit post(s) from r/LLMDevs; kept 1 after scout filtering.",
      },
    ],
    sourceModes: {
      "reddit-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "reddit-agent-watchlist",
        sourceLabel: "Reddit Agent Watchlist",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 16,
        kept: 2,
        useNow: 1,
        saveForLater: 1,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-08T00:00:00Z"),
    end: new Date("2026-03-09T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Reddit breakdown: r\/ClaudeAI: 1 actionable, 1 artifact-backed, 0 discussion-only; r\/LLMDevs: 1 actionable, 0 artifact-backed, 1 discussion-only\./);
});

test("renderDailyDigest does not present tweet links as artifact evidence", () => {
  const scoutPost = makePost({
    id: "tweet-post",
    sourceId: "telegram-vibe-coding",
    sourceLabel: "Vibe Coding",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 1,
    url: "https://t.me/vibecoding_tg/2788",
    metadata: {
      outboundUrl: "https://twitter.com/bcherny/status/2030193932404150413",
    },
    analysis: {
      topic: "Agent workflow pattern",
      decision: "save-for-later",
      theme: "agent-workflow",
      relevanceScore: 76,
      baseRelevanceScore: 76,
      crossSourceAdjustment: 0,
      crossSourceNotes: [],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "this-week",
      matchedSignals: ["claude code"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-08.md",
    reportDate: "2026-03-08",
    stats: {
      totalFetched: 1,
      kept: 1,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [scoutPost],
    notes: [],
    sourceModes: {
      "telegram-vibe-coding": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "telegram-vibe-coding",
        sourceLabel: "Vibe Coding",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 0,
        saveForLater: 1,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-07T00:00:00Z"),
    end: new Date("2026-03-08T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /signal chain: scout discovery -> no direct artifact yet\./);
  assert.doesNotMatch(markdown, /linked artifact:/);
  assert.doesNotMatch(markdown, /links to external artifact/);
});

test("renderDailyDigest flags thin non-actionable runs as low confidence", () => {
  const posts: ScoredPost[] = [
    makePost({
      id: "ignore-post-1",
      sourceKind: "web",
      sourceLabel: "HN Search",
      url: "https://example.com/weak-1",
      metadata: undefined,
      analysis: {
        topic: "Agent workflow pattern",
        decision: "ignore",
        theme: "agent-workflow",
        relevanceScore: 31,
        baseRelevanceScore: 31,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Weak signal.",
        suggestedNextAction: "Skip it.",
        project: "Volcker Copilot",
        urgency: "none",
        matchedSignals: ["agents.md"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "ignore-post-2",
      sourceKind: "web",
      sourceLabel: "HN Search",
      url: "https://example.com/weak-2",
      metadata: undefined,
      analysis: {
        topic: "Automation pattern",
        decision: "ignore",
        theme: "automation",
        relevanceScore: 22,
        baseRelevanceScore: 22,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Weak signal.",
        suggestedNextAction: "Skip it.",
        project: "Signal Scout",
        urgency: "none",
        matchedSignals: ["automation"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
  ];

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 40,
      kept: 2,
      droppedOutsideWindow: 35,
      droppedNoise: 2,
      droppedDuplicates: 1,
    },
    posts,
    notes: [],
    sourceModes: {
      "github-agent-watchlist": "mock",
      "hn-agent-search": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "mock",
        fetched: 10,
        kept: 0,
        useNow: 0,
        saveForLater: 0,
        ignored: 0,
      },
      {
        sourceId: "hn-agent-search",
        sourceLabel: "HN Search",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 30,
        kept: 2,
        useNow: 0,
        saveForLater: 0,
        ignored: 2,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /This run produced no actionable items, so treat it as a weak signal pass rather than a definitive 'nothing changed' result\./);
  assert.match(markdown, /Only 2 post\(s\) survived cleanup in the current window, so confidence is lower than a fuller run\./);
});

test("renderDailyDigest prefers artifact-backed items over discussion-only posts in the brief", () => {
  const discussionOnlyScout = makePost({
    id: "discussion-scout",
    sourceId: "telegram-llm4dev",
    sourceLabel: "LLM4dev",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 2,
    url: "https://t.me/LLM4dev/2001",
    metadata: undefined,
    analysis: {
      topic: "Agent workflow pattern",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 100,
      baseRelevanceScore: 94,
      crossSourceAdjustment: 6,
      crossSourceNotes: ["Also surfaced by another scout source."],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["agents"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });
  const githubArtifact = makePost({
    id: "github-artifact",
    sourceId: "github-agent-watchlist",
    sourceLabel: "GitHub Agent Watchlist",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    url: "https://github.com/openai/skills",
    metadata: {
      repoFullName: "openai/skills",
      repoDescription: "Skills Catalog for Codex",
      stars: 12000,
    },
    analysis: {
      topic: "Reusable agent skills and workflow design",
      decision: "use-now",
      theme: "agent-workflow",
      relevanceScore: 84,
      baseRelevanceScore: 78,
      crossSourceAdjustment: 6,
      crossSourceNotes: ["Surfaced by a trusted scout source."],
      scoreAdjustment: 0,
      whyItMatters: "Useful for the current stack.",
      suggestedNextAction: "Review it.",
      project: "Volcker Copilot",
      urgency: "today",
      matchedSignals: ["skills"],
      feedbackRuleIds: [],
      feedbackNotes: [],
    },
  });

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 2,
      kept: 2,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts: [discussionOnlyScout, githubArtifact],
    notes: [],
    sourceModes: {
      "telegram-llm4dev": "mock",
      "github-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "telegram-llm4dev",
        sourceLabel: "LLM4dev",
        sourceTier: "scout",
        modeUsed: "mock",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 1,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);
  const githubIndex = markdown.indexOf("Review [openai/skills](https://github.com/openai/skills)");
  const scoutIndex = markdown.indexOf("Review [Agent workflow pattern](https://t.me/LLM4dev/2001)");

  assert.ok(githubIndex >= 0, "expected GitHub artifact-backed item to appear in the brief");
  assert.ok(scoutIndex >= 0, "expected discussion-only scout item to appear in the brief");
  assert.ok(githubIndex < scoutIndex, "expected artifact-backed item to appear before discussion-only scout item");
});

test("renderDailyDigest applies Save This Week budget, artifact priority, and source diversity", () => {
  const posts: ScoredPost[] = [
    makePost({
      id: "github-save",
      sourceId: "github-agent-watchlist",
      sourceLabel: "GitHub Agent Watchlist",
      sourceKind: "github",
      sourceTier: "origin",
      sourcePriority: 1,
      url: "https://github.com/example/core-artifact",
      metadata: {
        repoFullName: "example/core-artifact",
        repoDescription: "Core artifact",
        stars: 9000,
      },
      analysis: {
        topic: "Core artifact",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 88,
        baseRelevanceScore: 88,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "llm-a",
      sourceId: "telegram-llm4dev",
      sourceLabel: "LLM4dev",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      url: "https://t.me/LLM4dev/3001",
      metadata: undefined,
      mentionedRepos: ["example/a"],
      analysis: {
        topic: "Artifact A",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 84,
        baseRelevanceScore: 84,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "llm-b",
      sourceId: "telegram-llm4dev",
      sourceLabel: "LLM4dev",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      url: "https://t.me/LLM4dev/3002",
      metadata: undefined,
      mentionedRepos: ["example/b"],
      analysis: {
        topic: "Artifact B",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 82,
        baseRelevanceScore: 82,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "llm-c",
      sourceId: "telegram-llm4dev",
      sourceLabel: "LLM4dev",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      url: "https://t.me/LLM4dev/3003",
      metadata: undefined,
      mentionedRepos: ["example/c"],
      analysis: {
        topic: "Artifact C",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 80,
        baseRelevanceScore: 80,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "llm-d",
      sourceId: "telegram-llm4dev",
      sourceLabel: "LLM4dev",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      url: "https://t.me/LLM4dev/3004",
      metadata: undefined,
      mentionedRepos: ["example/d"],
      analysis: {
        topic: "Artifact D",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 78,
        baseRelevanceScore: 78,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "pav-a",
      sourceId: "telegram-pavlenkodev",
      sourceLabel: "Pavlenko Dev & AI",
      sourceKind: "telegram",
      sourceTier: "scout",
      sourcePriority: 2,
      url: "https://t.me/pavlenkodev/3001",
      metadata: undefined,
      mentionedRepos: ["example/pav"],
      analysis: {
        topic: "Artifact Pav",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 60,
        baseRelevanceScore: 60,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["skills"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "reddit-disc-1",
      sourceId: "reddit-agent-watchlist",
      sourceLabel: "Reddit Agent Watchlist: r/ClaudeCode",
      sourceKind: "reddit",
      sourceTier: "scout",
      sourcePriority: 3,
      url: "https://reddit.com/r/ClaudeCode/disc-1",
      metadata: {
        provider: "reddit-json-listing",
      },
      analysis: {
        topic: "Discussion 1",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 79,
        baseRelevanceScore: 79,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful discussion.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["claude code"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "reddit-disc-2",
      sourceId: "reddit-agent-watchlist",
      sourceLabel: "Reddit Agent Watchlist: r/ClaudeCode",
      sourceKind: "reddit",
      sourceTier: "scout",
      sourcePriority: 3,
      url: "https://reddit.com/r/ClaudeCode/disc-2",
      metadata: {
        provider: "reddit-json-listing",
      },
      analysis: {
        topic: "Discussion 2",
        decision: "save-for-later",
        theme: "agent-workflow",
        relevanceScore: 77,
        baseRelevanceScore: 77,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Useful discussion.",
        suggestedNextAction: "Save it.",
        project: "Volcker Copilot",
        urgency: "this-week",
        matchedSignals: ["claude code"],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
  ];

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 8,
      kept: 8,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts,
    notes: [],
    sourceModes: {
      "github-agent-watchlist": "live",
      "telegram-llm4dev": "mock",
      "telegram-pavlenkodev": "mock",
      "reddit-agent-watchlist": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "live",
        fetched: 1,
        kept: 1,
        useNow: 0,
        saveForLater: 1,
        ignored: 0,
      },
      {
        sourceId: "telegram-llm4dev",
        sourceLabel: "LLM4dev",
        sourceTier: "scout",
        modeUsed: "mock",
        fetched: 4,
        kept: 4,
        useNow: 0,
        saveForLater: 4,
        ignored: 0,
      },
      {
        sourceId: "telegram-pavlenkodev",
        sourceLabel: "Pavlenko Dev & AI",
        sourceTier: "scout",
        modeUsed: "mock",
        fetched: 1,
        kept: 1,
        useNow: 0,
        saveForLater: 1,
        ignored: 0,
      },
      {
        sourceId: "reddit-agent-watchlist",
        sourceLabel: "Reddit Agent Watchlist",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 2,
        kept: 2,
        useNow: 0,
        saveForLater: 2,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Save This Week: showing 5 of 8\. Full list in Post Reviews below\./);
  assert.match(markdown, /Save \[example\/core-artifact\]\(https:\/\/github\.com\/example\/core-artifact\) for this week/);
  assert.match(markdown, /Save \[Artifact Pav\]\(https:\/\/t\.me\/pavlenkodev\/3001\) for this week/);
  assert.match(markdown, /Save \[Artifact A\]\(https:\/\/t\.me\/LLM4dev\/3001\) for this week/);
  assert.match(markdown, /Save \[Artifact B\]\(https:\/\/t\.me\/LLM4dev\/3002\) for this week/);
  assert.match(markdown, /Save \[Artifact C\]\(https:\/\/t\.me\/LLM4dev\/3003\) for this week/);
  assert.doesNotMatch(markdown, /Save \[Artifact D\]\(https:\/\/t\.me\/LLM4dev\/3004\) for this week/);
  assert.doesNotMatch(markdown, /Save \[Discussion 1\]\(https:\/\/reddit\.com\/r\/ClaudeCode\/disc-1\) for this week/);
});

test("renderDailyDigest limits Ignore For Now to two items and notes the remainder", () => {
  const posts: ScoredPost[] = [
    makePost({
      id: "ignore-1",
      url: "https://example.com/ignore-1",
      metadata: undefined,
      analysis: {
        topic: "Ignore One",
        decision: "ignore",
        theme: "tooling",
        relevanceScore: 40,
        baseRelevanceScore: 40,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Ignore.",
        suggestedNextAction: "Skip it.",
        project: "none",
        urgency: "none",
        matchedSignals: [],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "ignore-2",
      url: "https://example.com/ignore-2",
      metadata: undefined,
      analysis: {
        topic: "Ignore Two",
        decision: "ignore",
        theme: "tooling",
        relevanceScore: 38,
        baseRelevanceScore: 38,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Ignore.",
        suggestedNextAction: "Skip it.",
        project: "none",
        urgency: "none",
        matchedSignals: [],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
    makePost({
      id: "ignore-3",
      url: "https://example.com/ignore-3",
      metadata: undefined,
      analysis: {
        topic: "Ignore Three",
        decision: "ignore",
        theme: "tooling",
        relevanceScore: 36,
        baseRelevanceScore: 36,
        crossSourceAdjustment: 0,
        crossSourceNotes: [],
        scoreAdjustment: 0,
        whyItMatters: "Ignore.",
        suggestedNextAction: "Skip it.",
        project: "none",
        urgency: "none",
        matchedSignals: [],
        feedbackRuleIds: [],
        feedbackNotes: [],
      },
    }),
  ];

  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 3,
      kept: 3,
      droppedOutsideWindow: 0,
      droppedNoise: 0,
      droppedDuplicates: 0,
    },
    posts,
    notes: [],
    sourceModes: {
      "source-1": "mock",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "source-1",
        sourceLabel: "Test Source",
        sourceTier: "scout",
        modeUsed: "mock",
        fetched: 3,
        kept: 3,
        useNow: 0,
        saveForLater: 0,
        ignored: 3,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /Ignore \[Ignore One\]\(https:\/\/example\.com\/ignore-1\) for now/);
  assert.match(markdown, /Ignore \[Ignore Two\]\(https:\/\/example\.com\/ignore-2\) for now/);
  assert.match(markdown, /- and 1 more ignored item\(s\) in full digest\./);
  assert.doesNotMatch(markdown, /Ignore \[Ignore Three\]\(https:\/\/example\.com\/ignore-3\) for now/);
});

test("renderDailyDigest explains empty runs instead of showing a blank review section", () => {
  const result: DailyDigestResult = {
    reportPath: "reports/daily/2026-03-07.md",
    reportDate: "2026-03-07",
    stats: {
      totalFetched: 12,
      kept: 0,
      droppedOutsideWindow: 10,
      droppedNoise: 2,
      droppedDuplicates: 0,
    },
    posts: [],
    notes: [],
    sourceModes: {
      "github-agent-watchlist": "mock",
      "hn-agent-search": "live",
    },
    crossLinks: [],
    sourceHealth: [
      {
        sourceId: "github-agent-watchlist",
        sourceLabel: "GitHub Agent Watchlist",
        sourceTier: "origin",
        modeUsed: "mock",
        fetched: 12,
        kept: 0,
        useNow: 0,
        saveForLater: 0,
        ignored: 0,
      },
      {
        sourceId: "hn-agent-search",
        sourceLabel: "HN Search",
        sourceTier: "scout",
        modeUsed: "live",
        fetched: 0,
        kept: 0,
        useNow: 0,
        saveForLater: 0,
        ignored: 0,
      },
    ],
  };
  const window: TimeWindow = {
    start: new Date("2026-03-06T00:00:00Z"),
    end: new Date("2026-03-07T00:00:00Z"),
  };

  const markdown = renderDailyDigest(result, window);

  assert.match(markdown, /No posts survived cleanup in the current window, so this run is effectively empty\./);
  assert.match(markdown, /## Post Reviews\r?\n\r?\n_No posts survived cleanup in the current window\._/);
  assert.match(markdown, /GitHub Agent Watchlist \(github-agent-watchlist, origin, mock\): fetched 12, no posts survived cleanup\./);
});


