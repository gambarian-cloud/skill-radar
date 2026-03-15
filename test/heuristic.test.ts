import assert from "node:assert/strict";
import test from "node:test";

import { analyzePost } from "../src/analysis/heuristic.ts";
import { buildRadarProfile } from "../src/config/radar-profile.ts";
import type { CrossSourceLink, NormalizedPost, RankingFeedbackRule } from "../src/types.ts";

function makeTelegramPost(text: string): NormalizedPost {
  return {
    id: "telegram-post-1",
    sourceId: "telegram-vibe-coding",
    sourceLabel: "Vibe Coding",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 1,
    externalId: "telegram-1",
    publishedAt: "2026-03-06T12:00:00Z",
    text,
    shortSummary: text,
    dedupeKey: "telegram-dedupe-1",
  };
}

function makeGitHubPost(text: string): NormalizedPost {
  return {
    id: "github-post-1",
    sourceId: "github-agent-watchlist",
    sourceLabel: "GitHub Agent Watchlist: OpenAI Codex",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    externalId: "openai/codex:2026-03-06",
    publishedAt: "2026-03-06T12:00:00Z",
    text,
    shortSummary: text,
    dedupeKey: "github-dedupe-1",
    metadata: {
      repoFullName: "openai/codex",
    },
  };
}

function makeWebPost(text: string): NormalizedPost {
  return {
    id: "web-post-1",
    sourceId: "hn-agent-search",
    sourceLabel: 'Hacker News Agent Search: "Claude Code"',
    sourceKind: "web",
    sourceTier: "scout",
    sourcePriority: 2,
    externalId: "hn-1",
    publishedAt: "2026-03-06T12:00:00Z",
    text,
    shortSummary: text,
    dedupeKey: "web-dedupe-1",
    metadata: {
      provider: "hn-algolia-search",
      title: text,
      query: '"Claude Code"',
      points: 1,
      comments: 0,
    },
  };
}

function makeRedditPost(text: string): NormalizedPost {
  return {
    id: "reddit-post-1",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/ClaudeCode",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    externalId: "reddit-1",
    publishedAt: "2026-03-06T12:00:00Z",
    text,
    shortSummary: text,
    dedupeKey: "reddit-dedupe-1",
    url: "https://www.reddit.com/r/ClaudeCode/comments/reddit_1/post/",
    metadata: {
      provider: "reddit-json-listing",
      title: text,
      score: 12,
      comments: 8,
      flair: "Discussion",
      outboundUrl: "https://www.reddit.com/r/ClaudeCode/comments/reddit_1/post/",
    },
  };
}

test("analyzePost identifies strong security signals", () => {
  const analysis = analyzePost(
    makeTelegramPost("Codex sandbox security pattern for server-only tokens and browser bundle leak prevention in Next.js apps."),
  );

  assert.equal(analysis.theme, "security");
  assert.equal(analysis.decision, "use-now");
  assert.equal(analysis.project, "Volcker Copilot");
  assert.equal(analysis.crossSourceAdjustment, 0);
  assert.equal(analysis.scoreAdjustment, 0);
});

test("analyzePost ignores weak unrelated text", () => {
  const analysis = analyzePost(
    makeTelegramPost("Neighborhood cafe menu, weekend travel plans, and photo chatter with no engineering content."),
  );

  assert.equal(analysis.decision, "ignore");
});

test("analyzePost applies manual ranking feedback overrides", () => {
  const feedbackRules: RankingFeedbackRule[] = [
    {
      id: "demote-vibe-repost",
      description: "Demote this repost while we tune the heuristic.",
      match: {
        sourceId: "telegram-vibe-coding",
        textIncludes: ["browser bundle leak prevention"],
      },
      scoreAdjustment: -30,
      decisionOverride: "save-for-later",
      note: "Manual demotion for a known over-ranked repost.",
    },
  ];

  const analysis = analyzePost(
    makeTelegramPost("Codex sandbox security pattern for server-only tokens and browser bundle leak prevention in Next.js apps."),
    feedbackRules,
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.scoreAdjustment, -30);
  assert.deepEqual(analysis.feedbackRuleIds, ["demote-vibe-repost"]);
  assert.match(analysis.feedbackNotes[0] ?? "", /Manual demotion/i);
});

test("analyzePost boosts Telegram posts corroborated by watched repos", () => {
  const post = makeTelegramPost("Worth trying openai/codex for worktrees and local coding workflows.");
  const crossLinks: CrossSourceLink[] = [
    {
      fromPostId: post.id,
      toPostId: "github-post-1",
      fromSourceId: "telegram-vibe-coding",
      toSourceId: "github-agent-watchlist",
      linkType: "repo-mention",
      repoFullName: "openai/codex",
    },
  ];

  const analysis = analyzePost(post, [], crossLinks);

  assert.equal(analysis.crossSourceAdjustment, 4);
  assert.match(analysis.crossSourceNotes[0] ?? "", /Direct repo evidence/i);
});

test("analyzePost caps Telegram discussion-only posts at save-for-later and score 80", () => {
  const analysis = analyzePost(
    makeTelegramPost(
      "Claude Code, Codex, AGENTS.md, worktrees, and reusable agent workflow patterns all point to the same setup lesson.",
    ),
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.ok(analysis.relevanceScore <= 80);
  assert.match(analysis.whyItMatters, /Telegram scout signal should top out at 'save this week'/i);
});

test("analyzePost caps Telegram repo links until GitHub watchlist confirms them", () => {
  const analysis = analyzePost(
    {
      ...makeTelegramPost(
        "New repo worth watching for Claude Code workflow discipline and multi-agent setup patterns.",
      ),
      url: "https://t.me/example/42",
      metadata: {
        outboundUrl: "https://github.com/example/new-skill-pack",
      },
    },
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.ok(analysis.relevanceScore <= 80);
});

test("analyzePost strengthens scout corroboration when another scout source mentions the same repo", () => {
  const post = makeTelegramPost("Worth trying openai/codex for worktrees and local coding workflows.");
  const analysis = analyzePost(
    {
      ...post,
      mentionedRepos: ["openai/codex"],
    },
    [],
    [
      {
        fromPostId: post.id,
        toPostId: "github-post-1",
        fromSourceId: "telegram-vibe-coding",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "openai/codex",
      },
      {
        fromPostId: "hn-post-1",
        toPostId: post.id,
        fromSourceId: "hn-agent-search",
        toSourceId: "telegram-vibe-coding",
        linkType: "scout-corroboration",
        repoFullName: "openai/codex",
      },
    ],
  );

  assert.equal(analysis.crossSourceAdjustment, 8);
  assert.match(analysis.crossSourceNotes.join(" "), /Direct repo evidence/i);
  assert.match(analysis.crossSourceNotes.join(" "), /another scout source/i);
});

test("analyzePost still allows Telegram posts with watched GitHub confirmation to stay same-day", () => {
  const post = {
    ...makeTelegramPost("Worth trying openai/codex for worktrees and local coding workflows."),
    mentionedRepos: ["openai/codex"],
  };
  const analysis = analyzePost(
    post,
    [],
    [
      {
        fromPostId: post.id,
        toPostId: "github-post-1",
        fromSourceId: "telegram-vibe-coding",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "openai/codex",
      },
    ],
  );

  assert.equal(analysis.decision, "use-now");
  assert.equal(analysis.urgency, "today");
});

test("analyzePost demotes isolated GitHub watchlist items", () => {
  const analysis = analyzePost(
    makeGitHubPost("openai/codex: Local coding agent workflow and approval model for real repositories."),
    [],
    [],
  );

  assert.equal(analysis.crossSourceAdjustment, -5);
  assert.match(analysis.crossSourceNotes[0] ?? "", /without scout corroboration/i);
});

test("analyzePost gives GitHub more credit when multiple scout sources surface the same repo", () => {
  const analysis = analyzePost(
    makeGitHubPost("openai/codex: Local coding agent workflow and approval model for real repositories."),
    [],
    [
      {
        fromPostId: "telegram-post-1",
        toPostId: "github-post-1",
        fromSourceId: "telegram-vibe-coding",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "openai/codex",
      },
      {
        fromPostId: "hn-post-1",
        toPostId: "github-post-1",
        fromSourceId: "hn-agent-search",
        toSourceId: "github-agent-watchlist",
        linkType: "repo-mention",
        repoFullName: "openai/codex",
      },
    ],
  );

  assert.equal(analysis.crossSourceAdjustment, 10);
  assert.match(analysis.crossSourceNotes[0] ?? "", /across 2 trusted sources/i);
});

test("analyzePost gives GitHub adoption signals a structural score boost", () => {
  const lowAdoption = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent skills and workflow patterns for coding agents."),
      metadata: {
        repoFullName: "example/repo",
        stars: 80,
        forks: 5,
        subscribers: 2,
      },
    },
    [],
    [],
  );
  const highAdoption = analyzePost(
    {
      ...makeGitHubPost("big/repo: Agent skills and workflow patterns for coding agents."),
      metadata: {
        repoFullName: "big/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
      },
    },
    [],
    [],
  );

  assert.ok(highAdoption.baseRelevanceScore > lowAdoption.baseRelevanceScore);
});

test("analyzePost gives extra credit to recent GitHub releases and active issue volume", () => {
  const quieterRepo = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        openIssues: 40,
      },
    },
    [],
    [],
  );
  const activeReleasedRepo = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        openIssues: 620,
        releaseTag: "v2.1.0",
        releasePublishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    [],
    [],
  );

  assert.ok(activeReleasedRepo.baseRelevanceScore > quieterRepo.baseRelevanceScore);
});

test("analyzePost penalizes archived GitHub repos heavily", () => {
  const activeRepo = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
      },
    },
    [],
    [],
  );
  const archivedRepo = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        archived: true,
      },
    },
    [],
    [],
  );

  assert.ok(archivedRepo.baseRelevanceScore < activeRepo.baseRelevanceScore);
});

test("analyzePost gives only the base release bonus when release date is missing", () => {
  const noRelease = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
      },
    },
    [],
    [],
  );
  const undatedRelease = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        releaseTag: "v2.1.0",
      },
    },
    [],
    [],
  );

  assert.equal(undatedRelease.baseRelevanceScore - noRelease.baseRelevanceScore, 2);
});

test("analyzePost does not give the fresh-release bonus to older GitHub releases", () => {
  const undatedRelease = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        releaseTag: "v2.1.0",
      },
    },
    [],
    [],
  );
  const staleRelease = analyzePost(
    {
      ...makeGitHubPost("example/repo: Agent workflow repo with a decent user base."),
      metadata: {
        repoFullName: "example/repo",
        stars: 12000,
        forks: 1400,
        subscribers: 120,
        releaseTag: "v2.1.0",
        releasePublishedAt: "2025-12-31T00:00:00Z",
      },
    },
    [],
    [],
  );

  assert.equal(staleRelease.baseRelevanceScore, undatedRelease.baseRelevanceScore);
});

test("analyzePost keeps save-for-later items out of today urgency", () => {
  const feedbackRules: RankingFeedbackRule[] = [
    {
      id: "demote-openai-codex",
      description: "Used to verify urgency follows the manual decision override.",
      match: {
        repoFullName: "openai/codex",
      },
      decisionOverride: "save-for-later",
    },
  ];

  const analysis = analyzePost(
    {
      ...makeGitHubPost("openai/codex: Agent skills, Codex workflows, and repo setup patterns for daily use."),
      metadata: {
        repoFullName: "openai/codex",
        stars: 25000,
        forks: 1800,
        subscribers: 140,
      },
    },
    feedbackRules,
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
});

test("analyzePost builds repo-specific action text for skill catalogs", () => {
  const analysis = analyzePost(
    {
      ...makeGitHubPost("openai/skills: Skills Catalog for Codex and reusable agent workflows."),
      metadata: {
        repoFullName: "openai/skills",
        repoDescription: "Skills Catalog for Codex",
        stars: 12000,
        forks: 600,
        subscribers: 70,
      },
    },
    [],
    [],
  );

  assert.match(analysis.suggestedNextAction, /openai\/skills/i);
  assert.match(analysis.suggestedNextAction, /Codex workflow|reusable skill/i);
  assert.doesNotMatch(analysis.suggestedNextAction, /Test the workflow pattern/i);
});

test("analyzePost builds repo-specific action text for pm-skills", () => {
  const analysis = analyzePost(
    {
      ...makeGitHubPost("phuryn/pm-skills: PM Skills Marketplace for agentic product work."),
      metadata: {
        repoFullName: "phuryn/pm-skills",
        repoDescription: "PM Skills Marketplace for agentic product work",
        stars: 3000,
        forks: 300,
        subscribers: 40,
      },
    },
    [],
    [],
  );

  assert.match(analysis.suggestedNextAction, /packaging ideas/i);
  assert.match(analysis.suggestedNextAction, /phuryn\/pm-skills/i);
});

test("analyzePost builds repo-specific why-it-matters for official skill catalogs", () => {
  const analysis = analyzePost(
    {
      ...makeGitHubPost("openai/skills: Skills Catalog for Codex and reusable agent workflows."),
      metadata: {
        repoFullName: "openai/skills",
        repoDescription: "Skills Catalog for Codex",
        stars: 12000,
        forks: 600,
        subscribers: 70,
      },
    },
    [],
    [],
  );

  assert.match(analysis.whyItMatters, /official Codex capability truth/i);
  assert.match(analysis.whyItMatters, /Codex-native baseline/i);
});

test("analyzePost builds repo-specific why-it-matters for pm-skills", () => {
  const analysis = analyzePost(
    {
      ...makeGitHubPost("phuryn/pm-skills: PM Skills Marketplace for agentic product work."),
      metadata: {
        repoFullName: "phuryn/pm-skills",
        repoDescription: "PM Skills Marketplace for agentic product work",
        stars: 3000,
        forks: 300,
        subscribers: 40,
      },
    },
    [],
    [],
  );

  assert.match(analysis.whyItMatters, /packaging reference/i);
});

test("analyzePost downranks weak low-engagement HN show posts", () => {
  const analysis = analyzePost(
    makeWebPost("Show HN: CC Usage Bar - check Claude Code usage from your menu bar."),
    [],
    [],
  );

  assert.equal(analysis.decision, "ignore");
  assert.ok(analysis.baseRelevanceScore < 75);
});

test("analyzePost keeps stronger HN artifact-linked discussions competitive", () => {
  const analysis = analyzePost(
    {
      ...makeWebPost("anthropics/skills: Public repository for Agent Skills with practical discussion."),
      metadata: {
        provider: "hn-algolia-search",
        title: "anthropics/skills: Public repository for Agent Skills",
        query: '"anthropics/skills"',
        points: 57,
        comments: 24,
      },
      url: "https://github.com/anthropics/skills",
      mentionedRepos: ["anthropics/skills"],
    },
    [],
    [],
  );

  assert.equal(analysis.decision, "use-now");
  assert.ok(analysis.baseRelevanceScore >= 75);
});

test("analyzePost caps HN discussion-only items below same-day action", () => {
  const analysis = analyzePost(
    {
      ...makeWebPost(
        "Claude Code memory workflows, AGENTS.md patterns, and Codex setup discipline for agent workflow teams.",
      ),
      metadata: {
        provider: "hn-algolia-search",
        title: "Claude Code memory workflows and AGENTS.md setup patterns",
        query: '"Claude Code"',
        points: 180,
        comments: 95,
      },
      url: "https://example.com/claude-code-memory-workflows",
    },
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.match(analysis.whyItMatters, /discussion signal without direct repo evidence/i);
});

test("analyzePost caps Reddit discussion-only posts at save-for-later and score 75", () => {
  const analysis = analyzePost(
    makeRedditPost(
      "I built a semantic router for Claude Code and it feels much better than one giant rules file.",
    ),
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.ok(analysis.relevanceScore <= 75);
  assert.match(analysis.whyItMatters, /top out at 'save this week'/i);
});

test("analyzePost allows Reddit breaking-change posts to bypass the discussion cap", () => {
  const analysis = analyzePost(
    makeRedditPost(
      "Claude Code broke worktrees on Windows after the latest update and now sessions crash when switching branches.",
    ),
    [],
    [],
  );

  assert.equal(analysis.decision, "use-now");
  assert.equal(analysis.urgency, "today");
  assert.ok(analysis.relevanceScore > 75);
});

test("analyzePost does not treat generic 'what breaks' phrasing as a real runtime failure", () => {
  const analysis = analyzePost(
    makeRedditPost(
      "SymDex tracks the call graph so your agent knows what breaks before it touches anything. Works with Claude, Codex, and MCP-compatible agents.",
    ),
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.equal(analysis.relevanceScore, 75);
});

test("analyzePost does not treat tweet links as artifact evidence", () => {
  const analysis = analyzePost(
    {
      ...makeTelegramPost(
        "Boris posted a Claude Code loop trick on X and people are discussing it heavily.",
      ),
      metadata: {
        outboundUrl: "https://twitter.com/bcherny/status/2030193932404150413",
      },
    },
    [],
    [],
  );

  assert.equal(analysis.decision, "save-for-later");
  assert.equal(analysis.urgency, "this-week");
  assert.ok(analysis.relevanceScore <= 80);
});

test("analyzePost boosts creator-relevant posts when creator lens is active", () => {
  const withoutProfile = analyzePost(
    makeTelegramPost(
      "Content pipelines, publishing workflows, and creator messaging patterns for turning notes into decks and landing pages.",
    ),
    [],
    [],
  );
  const withCreatorProfile = analyzePost(
    makeTelegramPost(
      "Content pipelines, publishing workflows, and creator messaging patterns for turning notes into decks and landing pages.",
    ),
    [],
    [],
    buildRadarProfile(["creator"], "balanced", "2026-03-11T12:00:00.000Z"),
  );

  assert.ok(withCreatorProfile.relevanceScore > withoutProfile.relevanceScore);
  assert.match((withCreatorProfile.policyNotes ?? []).join(" "), /Active radar lens Creator/i);
});
