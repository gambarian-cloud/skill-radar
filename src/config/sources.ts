import { GITHUB_AGENT_WATCHLIST } from "./github-watchlist.ts";
import type { SourceConfig } from "../types.ts";

export const SOURCE_CONFIG: SourceConfig[] = [
  {
    id: "telegram-vibe-coding",
    kind: "telegram",
    enabled: true,
    label: "Vibe Coding",
    tier: "scout",
    priority: 1,
    freshnessHours: 24,
    cadenceClass: "daily",
    channelRef: "@vibecoding_tg",
    mock: {
      fixturePath: "fixtures/telegram/vibecoding_tg-week.json",
    },
    live: {
      provider: "telegram-public-web",
      itemLimit: 50,
    },
  },
  {
    id: "telegram-llm4dev",
    kind: "telegram",
    enabled: true,
    label: "LLM4dev",
    tier: "scout",
    priority: 2,
    freshnessHours: 72,
    cadenceClass: "slower-cadence",
    channelRef: "@LLM4dev",
    mock: {
      fixturePath: "fixtures/telegram/llm4dev.json",
    },
    live: {
      provider: "telegram-public-web",
      itemLimit: 50,
    },
  },
  {
    id: "telegram-pavlenkodev",
    kind: "telegram",
    enabled: false, // Disabled 2026-03-21: retune deadline 2026-03-15 passed, 0 actionable items
    label: "Pavlenko Dev & AI",
    tier: "scout",
    priority: 2,
    freshnessHours: 72,
    cadenceClass: "watch",
    channelRef: "@pavlenkodev",
    mock: {
      fixturePath: "fixtures/telegram/pavlenkodev.json",
    },
    live: {
      provider: "telegram-public-web",
      itemLimit: 50,
    },
  },
  {
    id: "github-agent-watchlist",
    kind: "github",
    enabled: true,
    label: "GitHub Agent Watchlist",
    tier: "origin",
    priority: 1,
    freshnessHours: 24,
    cadenceClass: "daily",
    watch: GITHUB_AGENT_WATCHLIST,
    mock: {
      fixturePath: "fixtures/github/agent-watchlist.json",
    },
    live: {
      tokenEnvVar: "GITHUB_TOKEN",
      includeLatestRelease: true,
    },
  },
  {
    id: "hn-agent-search",
    kind: "web",
    enabled: true,
    label: "Hacker News Agent Search",
    tier: "scout",
    priority: 2,
    freshnessHours: 72,
    cadenceClass: "slower-cadence",
    mock: {
      fixturePath: "fixtures/web/hn-agent-search.json",
    },
    live: {
      provider: "hn-algolia-search",
      queries: [
        "\"Claude Code\"",
        "\"Codex CLI\"",
        "\"AGENTS.md\"",
        "\"openai/skills\"",
        "\"anthropics/skills\"",
        "\"agent skills\"",
        "\"Model Context Protocol\"",
      ],
      tags: ["story"],
      hitsPerPage: 8,
    },
  },
  {
    id: "reddit-agent-watchlist",
    kind: "reddit",
    enabled: true,
    label: "Reddit Agent Watchlist",
    tier: "scout",
    priority: 3,
    freshnessHours: 24,
    cadenceClass: "daily",
    watch: [
      { name: "ClaudeCode", label: "Claude Code" },
      { name: "ClaudeAI", label: "Claude AI" },
      { name: "codex", label: "Codex" },
      { name: "LLMDevs", label: "LLM Devs" },
      { name: "OpenAI", label: "OpenAI" },
      { name: "ChatGPTCoding", label: "ChatGPT Coding" },
    ],
    mock: {
      fixturePath: "fixtures/reddit/agent-watchlist.json",
    },
    live: {
      listing: "new",
      limitPerSubreddit: 8,
      userAgent: "SignalScout/0.1 by MI",
    },
  },
];
