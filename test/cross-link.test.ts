import assert from "node:assert/strict";
import test from "node:test";

import { GITHUB_AGENT_WATCHLIST } from "../src/config/github-watchlist.ts";
import { buildCrossSourceLinks } from "../src/normalize/cross-link.ts";
import { annotateRepoMentions, extractRepoMentions } from "../src/normalize/extract-repos.ts";
import type { NormalizedPost } from "../src/types.ts";

test("extractRepoMentions matches explicit owner/repo references", () => {
  const mentions = extractRepoMentions(
    "Worth reading obra/superpowers and Aider-AI/aider for agent workflow patterns.",
    GITHUB_AGENT_WATCHLIST,
  );

  assert.deepEqual(mentions.sort(), ["Aider-AI/aider", "obra/superpowers"]);
});

test("extractRepoMentions matches unique shortnames but skips ambiguous aliases", () => {
  const mentions = extractRepoMentions(
    "Superpowers looks strong, but plain skills is too ambiguous to trust as a repo mention.",
    GITHUB_AGENT_WATCHLIST,
  );

  assert.deepEqual(mentions, ["obra/superpowers"]);
});

test("extractRepoMentions does not treat generic codex mentions as openai/codex repo evidence", () => {
  const mentions = extractRepoMentions(
    "Claude Code and Codex are the two runtimes I compare most often.",
    GITHUB_AGENT_WATCHLIST,
  );

  assert.deepEqual(mentions, []);
});

test("buildCrossSourceLinks joins Telegram mentions to GitHub repo posts", () => {
  const telegramPost: NormalizedPost = {
    id: "telegram-1",
    sourceId: "telegram-vibe-coding",
    sourceLabel: "Vibe Coding",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 1,
    externalId: "2732",
    publishedAt: "2026-03-06T10:00:00Z",
    text: "Worth trying obra/superpowers for debugging and worktrees.",
    shortSummary: "Worth trying obra/superpowers for debugging and worktrees.",
    dedupeKey: "telegram-dedupe",
    mentionedRepos: ["obra/superpowers"],
  };

  const githubPost: NormalizedPost = {
    id: "github-1",
    sourceId: "github-agent-watchlist",
    sourceLabel: "GitHub Agent Watchlist: Obra Superpowers",
    sourceKind: "github",
    sourceTier: "origin",
    sourcePriority: 1,
    externalId: "obra/superpowers:2026-03-05",
    publishedAt: "2026-03-05T14:10:00Z",
    text: "obra/superpowers: High-signal community workflow pack.",
    shortSummary: "obra/superpowers: High-signal community workflow pack.",
    dedupeKey: "github-dedupe",
    metadata: {
      repoFullName: "obra/superpowers",
    },
  };

  const links = buildCrossSourceLinks([telegramPost, githubPost]);

  assert.deepEqual(links, [
    {
      fromPostId: "telegram-1",
      toPostId: "github-1",
      fromSourceId: "telegram-vibe-coding",
      toSourceId: "github-agent-watchlist",
      linkType: "repo-mention",
      repoFullName: "obra/superpowers",
    },
  ]);
});

test("annotateRepoMentions picks up watched repos from non-github post urls", () => {
  const webPost: NormalizedPost = {
    id: "web-1",
    sourceId: "hn-agent-search",
    sourceLabel: "Hacker News Agent Search: anthropics/skills",
    sourceKind: "web",
    sourceTier: "scout",
    sourcePriority: 2,
    externalId: "hn-1",
    publishedAt: "2026-03-06T20:13:15Z",
    text: "HN discussion about official Claude skill ecosystems.",
    url: "https://github.com/anthropics/skills",
    shortSummary: "HN discussion about official Claude skill ecosystems.",
    dedupeKey: "web-dedupe",
  };

  const [annotated] = annotateRepoMentions([webPost], GITHUB_AGENT_WATCHLIST);

  assert.deepEqual(annotated.mentionedRepos, ["anthropics/skills"]);
});

test("annotateRepoMentions picks up watched repos from scout metadata outbound urls", () => {
  const redditPost: NormalizedPost = {
    id: "reddit-1",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/ClaudeAI",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 3,
    externalId: "t3_abc123",
    publishedAt: "2026-03-07T20:00:00Z",
    text: "I built a tool that auto-generates your CLAUDE.md.",
    url: "https://www.reddit.com/r/ClaudeAI/comments/abc123/tool/",
    shortSummary: "I built a tool that auto-generates your CLAUDE.md.",
    dedupeKey: "reddit-dedupe",
    metadata: {
      outboundUrl: "https://github.com/anthropics/skills",
    },
  };

  const [annotated] = annotateRepoMentions([redditPost], GITHUB_AGENT_WATCHLIST);

  assert.deepEqual(annotated.mentionedRepos, ["anthropics/skills"]);
});

test("buildCrossSourceLinks creates scout corroboration between different scout sources mentioning the same repo", () => {
  const telegramPost: NormalizedPost = {
    id: "telegram-1",
    sourceId: "telegram-vibe-coding",
    sourceLabel: "Vibe Coding",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 1,
    externalId: "2732",
    publishedAt: "2026-03-06T10:00:00Z",
    text: "Worth trying obra/superpowers for debugging and worktrees.",
    shortSummary: "Worth trying obra/superpowers for debugging and worktrees.",
    dedupeKey: "telegram-dedupe",
    mentionedRepos: ["obra/superpowers"],
  };

  const hnPost: NormalizedPost = {
    id: "hn-1",
    sourceId: "hn-agent-search",
    sourceLabel: "Hacker News Agent Search: superpowers",
    sourceKind: "web",
    sourceTier: "scout",
    sourcePriority: 2,
    externalId: "hn-2732",
    publishedAt: "2026-03-06T11:00:00Z",
    text: "HN discussion about obra/superpowers and coding-agent workflows.",
    shortSummary: "HN discussion about obra/superpowers and coding-agent workflows.",
    dedupeKey: "hn-dedupe",
    mentionedRepos: ["obra/superpowers"],
  };

  const links = buildCrossSourceLinks([telegramPost, hnPost]);

  assert.deepEqual(links, [
    {
      fromPostId: "hn-1",
      toPostId: "telegram-1",
      fromSourceId: "hn-agent-search",
      toSourceId: "telegram-vibe-coding",
      linkType: "scout-corroboration",
      repoFullName: "obra/superpowers",
    },
  ]);
});

test("buildCrossSourceLinks creates dynamic scout corroboration for non-watchlist github repos", () => {
  const telegramPost: NormalizedPost = {
    id: "telegram-2",
    sourceId: "telegram-llm4dev",
    sourceLabel: "LLM4dev",
    sourceKind: "telegram",
    sourceTier: "scout",
    sourcePriority: 1,
    externalId: "3001",
    publishedAt: "2026-03-08T08:00:00Z",
    text: "AgentGuard looks promising for local agent guardrails.",
    shortSummary: "AgentGuard looks promising for local agent guardrails.",
    dedupeKey: "telegram-dedupe-2",
    metadata: {
      outboundUrl: "https://github.com/numbergroup/AgentGuard",
    },
  };

  const redditPost: NormalizedPost = {
    id: "reddit-2",
    sourceId: "reddit-agent-watchlist",
    sourceLabel: "Reddit Agent Watchlist: r/ClaudeCode",
    sourceKind: "reddit",
    sourceTier: "scout",
    sourcePriority: 2,
    externalId: "t3_agentguard",
    publishedAt: "2026-03-08T09:00:00Z",
    text: "Anyone tried AgentGuard for Claude Code safety rails?",
    url: "https://www.reddit.com/r/ClaudeCode/comments/agentguard/",
    shortSummary: "Anyone tried AgentGuard for Claude Code safety rails?",
    dedupeKey: "reddit-dedupe-2",
    metadata: {
      outboundUrls: [
        "https://github.com/numbergroup/AgentGuard",
        "https://www.reddit.com/r/ClaudeCode/comments/agentguard/",
      ],
    },
  };

  const links = buildCrossSourceLinks([telegramPost, redditPost]);

  assert.deepEqual(links, [
    {
      fromPostId: "reddit-2",
      toPostId: "telegram-2",
      fromSourceId: "reddit-agent-watchlist",
      toSourceId: "telegram-llm4dev",
      linkType: "scout-corroboration",
      repoFullName: "numbergroup/agentguard",
    },
  ]);
});
