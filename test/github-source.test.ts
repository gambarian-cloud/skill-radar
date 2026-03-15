import assert from "node:assert/strict";
import test from "node:test";

import { fetchGitHubPosts } from "../src/sources/github.ts";
import type { FetchContext, GitHubSourceConfig } from "../src/types.ts";

function makeResponse(status: number, statusText: string, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => payload,
  } as Response;
}

test("fetchGitHubPosts keeps partial live results when GitHub rate limits later repos", async () => {
  const source: GitHubSourceConfig = {
    id: "github-agent-watchlist",
    kind: "github",
    enabled: true,
    label: "GitHub Agent Watchlist",
    tier: "origin",
    priority: 1,
    watch: [
      { owner: "openai", repo: "skills", label: "OpenAI Skills" },
      { owner: "anthropics", repo: "skills", label: "Anthropic Skills" },
    ],
    mock: {
      fixturePath: "fixtures/github/agent-watchlist.json",
    },
    live: {
      tokenEnvVar: "GITHUB_TOKEN",
      includeLatestRelease: true,
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
  const originalToken = process.env.GITHUB_TOKEN;

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    if (url === "https://api.github.com/repos/openai/skills") {
      return makeResponse(200, "OK", {
        html_url: "https://github.com/openai/skills",
        description: "Skills Catalog for Codex",
        pushed_at: "2026-03-07T10:00:00Z",
        updated_at: "2026-03-07T10:00:00Z",
        language: "Python",
        topics: [],
        stargazers_count: 11813,
        forks_count: 657,
        open_issues_count: 110,
        subscribers_count: 71,
      });
    }

    if (url === "https://api.github.com/repos/openai/skills/releases/latest") {
      return makeResponse(404, "Not Found", {});
    }

    if (url === "https://api.github.com/repos/anthropics/skills") {
      return makeResponse(403, "rate limit exceeded", {});
    }

    throw new Error(`Unexpected URL in test: ${url}`);
  }) as typeof fetch;

  delete process.env.GITHUB_TOKEN;

  try {
    const result = await fetchGitHubPosts(source, context);
    const metadata = result.posts[0]?.metadata as Record<string, unknown> | undefined;
    const noteText = result.notes.map((note) => note.message).join("\n");

    assert.equal(result.modeUsed, "live");
    assert.equal(result.posts.length, 1);
    assert.equal(metadata?.repoFullName, "openai/skills");
    assert.match(noteText, /Fetched 1 GitHub watchlist item\(s\) using public unauthenticated API access\./);
    assert.match(noteText, /Skipped anthropics\/skills:/);
    assert.match(noteText, /rate limit hit after 1 successful watchlist item\(s\)/i);
    assert.match(noteText, /Add GITHUB_TOKEN in \.env\.local/i);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalToken;
    }
  }
});
