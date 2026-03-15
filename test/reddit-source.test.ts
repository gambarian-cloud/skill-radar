import assert from "node:assert/strict";
import test from "node:test";

import { fetchRedditPosts } from "../src/sources/reddit.ts";
import type { FetchContext, RedditSourceConfig } from "../src/types.ts";

function makeResponse(status: number, statusText: string, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => payload,
  } as Response;
}

test("fetchRedditPosts maps live subreddit listings into scout posts", async () => {
  const source: RedditSourceConfig = {
    id: "reddit-agent-watchlist",
    kind: "reddit",
    enabled: true,
    label: "Reddit Agent Watchlist",
    tier: "scout",
    priority: 3,
    watch: [
      { name: "ClaudeCode" },
      { name: "LLMDevs" },
    ],
    mock: {
      fixturePath: "fixtures/reddit/agent-watchlist.json",
    },
    live: {
      listing: "new",
      limitPerSubreddit: 4,
      userAgent: "SignalScout/0.1 by MI",
    },
  };
  const context: FetchContext = {
    runMode: "live",
    now: new Date("2026-03-07T12:00:00Z"),
    window: {
      start: new Date("2026-03-06T00:00:00Z"),
      end: new Date("2026-03-07T23:59:59Z"),
    },
  };
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string"
      ? new URL(input)
      : input instanceof URL
        ? input
        : new URL(input.url);

    if (url.pathname === "/r/ClaudeCode/new.json") {
      return makeResponse(200, "OK", {
        data: {
          children: [
            {
              kind: "t3",
              data: {
                name: "t3_good",
                id: "good",
                subreddit: "ClaudeCode",
                title: "Anthropic skills plus worktrees made Claude Code calmer",
                selftext: "anthropics/skills and obra/superpowers keep coming up together in serious workflow discussions.",
                permalink: "/r/ClaudeCode/comments/good/worktrees/",
                author: "builder",
                created_utc: 1772832000,
                score: 16,
                num_comments: 8,
                link_flair_text: "Discussion",
                is_self: true,
              },
            },
            {
              kind: "t3",
              data: {
                name: "t3_noise",
                id: "noise",
                subreddit: "ClaudeCode",
                title: "Funny Claude meme",
                selftext: "",
                permalink: "/r/ClaudeCode/comments/noise/meme/",
                author: "joker",
                created_utc: 1772832100,
                score: 1,
                num_comments: 0,
                link_flair_text: "Humor",
                is_self: true,
              },
            },
          ],
        },
      });
    }

    if (url.pathname === "/r/LLMDevs/new.json") {
      return makeResponse(200, "OK", {
        data: {
          children: [
            {
              kind: "t3",
              data: {
                name: "t3_llm",
                id: "llm",
                subreddit: "LLMDevs",
                title: "openai/skills versus anthropics/skills for shared baselines",
                selftext: "Comparing openai/skills and anthropics/skills made the Codex plus Claude split much clearer.",
                permalink: "/r/LLMDevs/comments/llm/shared_baselines/",
                author: "workflow_dev",
                created_utc: 1772832200,
                score: 9,
                num_comments: 5,
                link_flair_text: "Guide",
                is_self: true,
              },
            },
          ],
        },
      });
    }

    throw new Error(`Unexpected URL in test: ${url.toString()}`);
  }) as typeof fetch;

  try {
    const result = await fetchRedditPosts(source, context);

    assert.equal(result.modeUsed, "live");
    assert.equal(result.posts.length, 2);
    assert.equal(result.posts[0]?.sourceKind, "reddit");
    assert.match(result.posts[0]?.text ?? "", /anthropics\/skills/i);
    assert.match(result.posts[1]?.text ?? "", /openai\/skills/i);
    assert.match(
      result.notes.map((note) => note.message).join("\n"),
      /Fetched 2 Reddit post\(s\) from r\/ClaudeCode; kept 1 after scout filtering\./,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
