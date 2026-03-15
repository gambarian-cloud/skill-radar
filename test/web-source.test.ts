import assert from "node:assert/strict";
import test from "node:test";

import { fetchWebPosts } from "../src/sources/web.ts";
import type { FetchContext, WebSourceConfig } from "../src/types.ts";

function makeResponse(status: number, statusText: string, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => payload,
  } as Response;
}

test("fetchWebPosts maps live HN Algolia hits into scout posts", async () => {
  const source: WebSourceConfig = {
    id: "hn-agent-search",
    kind: "web",
    enabled: true,
    label: "Hacker News Agent Search",
    tier: "scout",
    priority: 2,
    mock: {
      fixturePath: "fixtures/web/hn-agent-search.json",
    },
    live: {
      provider: "hn-algolia-search",
      queries: ['"Claude Code"', '"anthropics/skills"'],
      tags: ["story"],
      hitsPerPage: 4,
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
      ? input
      : input instanceof URL
        ? input
        : new URL(input.url);
    const query = url.searchParams.get("query");

    if (query === '"Claude Code"') {
      return makeResponse(200, "OK", {
        hits: [
          {
            objectID: "hn-claude-1",
            created_at: "2026-03-07T09:55:48Z",
            title: "My Claude Code Toolkit",
            url: "https://newartisans.com/2026/02/my-claude-code-toolkit/",
            author: "simonmic",
            points: 32,
            num_comments: 7,
          },
          {
            objectID: "hn-claude-noise",
            created_at: "2026-03-07T08:15:48Z",
            title: "Show HN: CC Usage Bar",
            url: "https://github.com/lionhylra/cc-usage-bar",
            author: "maker",
            points: 1,
            num_comments: 0,
          },
        ],
      });
    }

    if (query === '"anthropics/skills"') {
      return makeResponse(200, "OK", {
        hits: [
          {
            objectID: "hn-skills-1",
            created_at: "2026-03-07T08:40:00Z",
            title: "anthropics/skills: Public repository for Agent Skills",
            url: "https://github.com/anthropics/skills",
            author: "buildman",
            points: 24,
            num_comments: 10,
          },
        ],
      });
    }

    throw new Error(`Unexpected URL in test: ${url.toString()}`);
  }) as typeof fetch;

  try {
    const result = await fetchWebPosts(source, context);

    assert.equal(result.modeUsed, "live");
    assert.equal(result.posts.length, 2);
    assert.equal(result.posts[0]?.sourceKind, "web");
    assert.match(result.posts[0]?.text ?? "", /Claude Code Toolkit/i);
    assert.match(result.posts[1]?.text ?? "", /Agent Skills/i);
    assert.match(result.notes.map((note) => note.message).join("\n"), /Fetched 2 HN hit\(s\) for query "Claude Code"; kept 1 after scout filtering\./);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
