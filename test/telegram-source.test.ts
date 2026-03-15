import assert from "node:assert/strict";
import test from "node:test";

import { fetchTelegramPosts } from "../src/sources/telegram.ts";
import type { FetchContext, TelegramSourceConfig } from "../src/types.ts";

function makeResponse(status: number, statusText: string, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => payload,
    text: async () => typeof payload === "string" ? payload : JSON.stringify(payload),
  } as Response;
}

test("fetchTelegramPosts drops live dataset items missing minimum Telegram fields", async () => {
  const source: TelegramSourceConfig = {
    id: "telegram-llm4dev",
    kind: "telegram",
    enabled: true,
    label: "LLM4dev",
    tier: "scout",
    priority: 2,
    channelRef: "@LLM4dev",
    mock: {
      fixturePath: "fixtures/telegram/llm4dev.json",
    },
    live: {
      provider: "apify-dataset",
      tokenEnvVar: "APIFY_TOKEN",
      datasetId: "dataset_test_123",
      itemLimit: 20,
      fieldAliases: {
        externalId: ["id"],
        text: ["text"],
        publishedAt: ["publishedAt"],
        url: ["url"],
        author: ["author"],
      },
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
  const originalToken = process.env.APIFY_TOKEN;

  process.env.APIFY_TOKEN = "test-token";
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    if (!url.includes("/v2/datasets/dataset_test_123/items")) {
      throw new Error(`Unexpected URL in test: ${url}`);
    }

    return makeResponse(200, "OK", [
      {
        id: "valid-1",
        text: "anthropics/skills plus worktrees is a strong Claude setup baseline.",
        publishedAt: "2026-03-07T10:00:00Z",
        url: "https://t.me/LLM4dev/1001",
        author: "LLM4dev",
      },
      {
        id: "missing-url",
        text: "This one is missing url.",
        publishedAt: "2026-03-07T09:00:00Z",
        author: "LLM4dev",
      },
      {
        id: "missing-author",
        text: "This one is missing author.",
        publishedAt: "2026-03-07T08:00:00Z",
        url: "https://t.me/LLM4dev/1002",
      },
      {
        id: "bad-date",
        text: "This one has a bad date.",
        publishedAt: "not-a-date",
        url: "https://t.me/LLM4dev/1003",
        author: "LLM4dev",
      },
    ]);
  }) as typeof fetch;

  try {
    const result = await fetchTelegramPosts(source, context);
    const notes = result.notes.map((note) => note.message).join("\n");

    assert.equal(result.modeUsed, "live");
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0]?.url, "https://t.me/LLM4dev/1001");
    assert.equal(result.posts[0]?.author, "LLM4dev");
    assert.match(notes, /Fetched 1 posts from Apify dataset dataset_test_123\./);
    assert.match(notes, /Dropped 3 Telegram item\(s\) missing minimum fields/i);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) {
      delete process.env.APIFY_TOKEN;
    } else {
      process.env.APIFY_TOKEN = originalToken;
    }
  }
});

test("fetchTelegramPosts can read live posts from Telegram public web pages", async () => {
  const source: TelegramSourceConfig = {
    id: "telegram-llm4dev",
    kind: "telegram",
    enabled: true,
    label: "LLM4dev",
    tier: "scout",
    priority: 2,
    channelRef: "@LLM4dev",
    mock: {
      fixturePath: "fixtures/telegram/llm4dev.json",
    },
    live: {
      provider: "telegram-public-web",
      itemLimit: 10,
    },
  };
  const context: FetchContext = {
    runMode: "live",
    now: new Date("2026-03-08T12:00:00Z"),
    window: {
      start: new Date("2026-03-07T00:00:00Z"),
      end: new Date("2026-03-08T23:59:59Z"),
    },
  };
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    assert.equal(url, "https://t.me/s/LLM4dev");

    return makeResponse(200, "OK", `
      <html>
        <div class="tgme_channel_info_header_title"><span dir="auto">AI4Dev — AI for Development</span></div>
        <section class="tgme_channel_history js-message_history">
          <div class="tgme_widget_message_wrap js-widget_message_wrap">
            <div class="tgme_widget_message js-widget_message" data-post="LLM4dev/500">
              <div class="tgme_widget_message_author accent_color">
                <a class="tgme_widget_message_owner_name" href="https://t.me/LLM4dev"><span dir="auto">AI4Dev — AI for Development</span></a>
              </div>
              <div class="tgme_widget_message_text js-message_text" dir="auto">
                New workflow guide for <a href="https://github.com/openai/skills">openai/skills</a><br/>with concrete setup notes
              </div>
              <div class="tgme_widget_message_footer compact js-message_footer">
                <div class="tgme_widget_message_info short js-message_info">
                  <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/LLM4dev/500"><time datetime="2026-03-08T09:00:00+00:00" class="time">09:00</time></a></span>
                </div>
              </div>
            </div>
          </div>
          <div class="tgme_widget_message_wrap js-widget_message_wrap">
            <div class="tgme_widget_message js-widget_message" data-post="LLM4dev/501">
              <div class="tgme_widget_message_author accent_color">
                <a class="tgme_widget_message_owner_name" href="https://t.me/LLM4dev"><span dir="auto">AI4Dev — AI for Development</span></a>
              </div>
              <div class="tgme_widget_message_footer compact js-message_footer">
                <div class="tgme_widget_message_info short js-message_info">
                  <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/LLM4dev/501"><time datetime="2026-03-08T10:00:00+00:00" class="time">10:00</time></a></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </html>
    `);
  }) as typeof fetch;

  try {
    const result = await fetchTelegramPosts(source, context);
    const notes = result.notes.map((note) => note.message).join("\n");

    assert.equal(result.modeUsed, "live");
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0]?.externalId, "LLM4dev/500");
    assert.equal(result.posts[0]?.author, "AI4Dev — AI for Development");
    assert.equal(result.posts[0]?.url, "https://t.me/LLM4dev/500");
    assert.equal(result.posts[0]?.metadata?.outboundUrl, "https://github.com/openai/skills");
    assert.match(result.posts[0]?.text ?? "", /openai\/skills/u);
    assert.match(notes, /Fetched 1 posts from Telegram public web page https:\/\/t\.me\/s\/LLM4dev\./u);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fetchTelegramPosts keeps the latest public web posts when the channel page includes older history first", async () => {
  const source: TelegramSourceConfig = {
    id: "telegram-pavlenkodev",
    kind: "telegram",
    enabled: true,
    label: "Pavlenko Dev & AI",
    tier: "scout",
    priority: 2,
    channelRef: "@pavlenkodev",
    mock: {
      fixturePath: "fixtures/telegram/pavlenkodev.json",
    },
    live: {
      provider: "telegram-public-web",
      itemLimit: 2,
    },
  };
  const context: FetchContext = {
    runMode: "live",
    now: new Date("2026-03-08T12:00:00Z"),
    window: {
      start: new Date("2026-03-07T00:00:00Z"),
      end: new Date("2026-03-08T23:59:59Z"),
    },
  };
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async () => makeResponse(200, "OK", `
    <html>
      <div class="tgme_channel_info_header_title"><span dir="auto">Pavlenko Dev &amp; AI</span></div>
      <section class="tgme_channel_history js-message_history">
        <div class="tgme_widget_message_wrap js-widget_message_wrap">
          <div class="tgme_widget_message js-widget_message" data-post="pavlenkodev/100">
            <div class="tgme_widget_message_text js-message_text" dir="auto">Old post one</div>
            <div class="tgme_widget_message_footer compact js-message_footer">
              <div class="tgme_widget_message_info short js-message_info">
                <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/pavlenkodev/100"><time datetime="2026-02-01T10:00:00+00:00" class="time">10:00</time></a></span>
              </div>
            </div>
          </div>
        </div>
        <div class="tgme_widget_message_wrap js-widget_message_wrap">
          <div class="tgme_widget_message js-widget_message" data-post="pavlenkodev/101">
            <div class="tgme_widget_message_text js-message_text" dir="auto">Old post two</div>
            <div class="tgme_widget_message_footer compact js-message_footer">
              <div class="tgme_widget_message_info short js-message_info">
                <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/pavlenkodev/101"><time datetime="2026-02-02T10:00:00+00:00" class="time">10:00</time></a></span>
              </div>
            </div>
          </div>
        </div>
        <div class="tgme_widget_message_wrap js-widget_message_wrap">
          <div class="tgme_widget_message js-widget_message" data-post="pavlenkodev/102">
            <div class="tgme_widget_message_text js-message_text" dir="auto">Fresh post one</div>
            <div class="tgme_widget_message_footer compact js-message_footer">
              <div class="tgme_widget_message_info short js-message_info">
                <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/pavlenkodev/102"><time datetime="2026-03-08T09:00:00+00:00" class="time">09:00</time></a></span>
              </div>
            </div>
          </div>
        </div>
        <div class="tgme_widget_message_wrap js-widget_message_wrap">
          <div class="tgme_widget_message js-widget_message" data-post="pavlenkodev/103">
            <div class="tgme_widget_message_text js-message_text" dir="auto">Fresh post two</div>
            <div class="tgme_widget_message_footer compact js-message_footer">
              <div class="tgme_widget_message_info short js-message_info">
                <span class="tgme_widget_message_meta"><a class="tgme_widget_message_date" href="https://t.me/pavlenkodev/103"><time datetime="2026-03-08T10:00:00+00:00" class="time">10:00</time></a></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </html>
  `)) as typeof fetch;

  try {
    const result = await fetchTelegramPosts(source, context);

    assert.equal(result.posts.length, 2);
    assert.deepEqual(
      result.posts.map((post) => post.externalId),
      ["pavlenkodev/102", "pavlenkodev/103"],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
