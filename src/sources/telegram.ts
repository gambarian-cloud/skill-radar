import { readJsonFile } from "../lib/file-system.ts";
import type {
  FetchContext,
  FetchResult,
  RawSourcePost,
  SourceNote,
  TelegramApifyFieldAliases,
  TelegramLiveApifyConfig,
  TelegramLiveConfig,
  TelegramLivePublicWebConfig,
  TelegramSourceConfig,
} from "../types.ts";

interface TelegramFixtureItem {
  id?: string;
  messageId?: string;
  text?: string;
  message?: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  hoursAgo?: number;
}

function readField(item: Record<string, unknown>, aliases: string[] | undefined): string | undefined {
  if (!aliases) {
    return undefined;
  }

  for (const alias of aliases) {
    const value = item[alias];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function isValidPublishedAt(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function mapApifyItem(
  item: Record<string, unknown>,
  source: TelegramSourceConfig,
  aliases: TelegramApifyFieldAliases,
): RawSourcePost | null {
  const text = readField(item, aliases.text ?? ["text", "message", "caption"]);
  const publishedAt = readField(item, aliases.publishedAt ?? ["publishedAt", "date", "timestamp", "createdAt"]);
  const url = readField(item, aliases.url ?? ["url", "messageUrl", "postUrl"]);
  const author = readField(item, aliases.author ?? ["author", "channelTitle", "channel"]);

  if (!text || !publishedAt || !url || !author || !isValidPublishedAt(publishedAt)) {
    return null;
  }

  return {
    sourceId: source.id,
    sourceLabel: source.label,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId:
      readField(item, aliases.externalId ?? ["id", "messageId", "postId"]) ??
      `${source.id}:${publishedAt}:${text.slice(0, 32)}`,
    text,
    url,
    author,
    publishedAt,
    metadata: item,
  };
}

function isApifyLiveConfig(config: TelegramLiveConfig | undefined): config is TelegramLiveApifyConfig {
  return Boolean(
    config &&
    (config.provider === "apify-dataset" || config.provider === "apify-actor-run"),
  );
}

function isPublicWebLiveConfig(config: TelegramLiveConfig | undefined): config is TelegramLivePublicWebConfig {
  return Boolean(config && config.provider === "telegram-public-web");
}

function isLiveReady(config: TelegramLiveConfig | undefined): boolean {
  if (!config) {
    return false;
  }

  if (isPublicWebLiveConfig(config)) {
    return true;
  }

  if (!process.env[config.tokenEnvVar]) {
    return false;
  }

  if (config.provider === "apify-dataset") {
    return Boolean(config.datasetId);
  }

  return Boolean(config.actorId);
}

function normalizeChannelRef(channelRef: string): string {
  return channelRef.replace(/^@/u, "").trim();
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/giu, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gu, " ")
    .replace(/&quot;/gu, '"')
    .replace(/&apos;|&#39;/gu, "'")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function stripHtml(input: string): string {
  const normalized = input
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/p>/giu, "\n")
    .replace(/<\/div>/giu, "\n")
    .replace(/<[^>]+>/gu, " ");

  return decodeHtmlEntities(normalized)
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .replace(/[ \t]{2,}/gu, " ")
    .trim();
}

function isTelegramInternalUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "t.me" || hostname.endsWith(".t.me") || hostname === "telegram.org" || hostname.endsWith(".telegram.org");
  } catch {
    return false;
  }
}

function pickPrimaryOutboundUrl(urls: string[]): string | undefined {
  if (urls.length === 0) {
    return undefined;
  }

  const preferred = urls.find((url) => {
    const lower = url.toLowerCase();
    return lower.includes("github.com/")
      || lower.includes("openai.com/")
      || lower.includes("anthropic.com/")
      || lower.includes("code.claude.com/")
      || lower.includes("modelcontextprotocol.io/");
  });

  return preferred ?? urls[0];
}

function extractOutboundUrls(block: string): string[] {
  const urls = new Set<string>();
  const hrefPattern = /href="([^"]+)"/gu;

  for (const match of block.matchAll(hrefPattern)) {
    const raw = decodeHtmlEntities(match[1] ?? "").trim();
    if (!raw) {
      continue;
    }

    const resolved = raw.startsWith("http") ? raw : raw.startsWith("//") ? `https:${raw}` : "";
    if (!resolved || isTelegramInternalUrl(resolved)) {
      continue;
    }

    urls.add(resolved);
  }

  return [...urls];
}

function parseTelegramPublicPosts(html: string, source: TelegramSourceConfig, itemLimit: number): RawSourcePost[] {
  const posts: RawSourcePost[] = [];
  const channel = normalizeChannelRef(source.channelRef);
  const authorMatch = html.match(
    /<div class="tgme_channel_info_header_title"><span dir="auto">([\s\S]*?)<\/span><\/div>/u,
  );
  const channelAuthor = authorMatch ? stripHtml(authorMatch[1]) : source.label;
  const blockRegex = /<div class="tgme_widget_message_wrap js-widget_message_wrap">([\s\S]*?)(?=<div class="tgme_widget_message_wrap js-widget_message_wrap">|<\/section>)/gu;
  const blocks = [...html.matchAll(blockRegex)].slice(-itemLimit);

  for (const match of blocks) {
    const block = match[1];
    if (!block) {
      continue;
    }

    const postIdMatch = block.match(/data-post="([^"]+)"/u);
    const timeMatch = block.match(/<time datetime="([^"]+)"/u);
    const urlMatch = block.match(/<a class="tgme_widget_message_date" href="([^"]+)"/u);
    const authorMatchInBlock = block.match(
      /<a class="tgme_widget_message_owner_name"[^>]*><span dir="auto">([\s\S]*?)<\/span><\/a>/u,
    );
    const textMatch = block.match(/<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/u);

    const publishedAt = timeMatch?.[1];
    const rawUrl = urlMatch?.[1];
    const text = textMatch ? stripHtml(textMatch[1]) : "";
    const author = authorMatchInBlock ? stripHtml(authorMatchInBlock[1]) : channelAuthor;
    const outboundUrls = extractOutboundUrls(block);
    const outboundUrl = pickPrimaryOutboundUrl(outboundUrls);

    if (!postIdMatch?.[1] || !publishedAt || !rawUrl || !text || !author || !isValidPublishedAt(publishedAt)) {
      continue;
    }

    const url = rawUrl.startsWith("http") ? rawUrl : `https://t.me${rawUrl}`;

    posts.push({
      sourceId: source.id,
      sourceLabel: source.label,
      sourceKind: source.kind,
      sourceTier: source.tier,
      sourcePriority: source.priority,
      externalId: postIdMatch[1],
      text,
      url,
      author,
      publishedAt,
      metadata: {
        provider: "telegram-public-web",
        channel,
        outboundUrl: outboundUrl ?? null,
        linkedUrl: outboundUrl ?? null,
        outboundUrls,
      },
    });
  }

  return posts;
}

async function fetchFromMock(source: TelegramSourceConfig, now: Date): Promise<FetchResult> {
  const fixture = await readJsonFile<TelegramFixtureItem[]>(source.mock.fixturePath);
  const posts: RawSourcePost[] = fixture.map((item, index) => {
    const text = item.text ?? item.message ?? "";
    const publishedAt =
      item.publishedAt ??
      new Date(now.getTime() - (item.hoursAgo ?? index + 1) * 60 * 60 * 1000).toISOString();

    return {
      sourceId: source.id,
      sourceLabel: source.label,
      sourceKind: source.kind,
      sourceTier: source.tier,
      sourcePriority: source.priority,
      externalId: item.id ?? item.messageId ?? `${source.id}-mock-${index + 1}`,
      text,
      url: item.url,
      author: item.author,
      publishedAt,
      metadata: {
        provider: "mock",
      },
    };
  });

  const notes: SourceNote[] = [
    {
      sourceId: source.id,
      message: "Using local mock fixture because live Telegram access is not configured for this source.",
    },
  ];

  return {
    posts,
    modeUsed: "mock",
    notes,
  };
}

async function fetchApifyDataset(
  source: TelegramSourceConfig,
  liveConfig: TelegramLiveApifyConfig,
): Promise<FetchResult> {
  const token = process.env[liveConfig.tokenEnvVar];
  if (!token || !liveConfig.datasetId) {
    throw new Error(`Live Apify dataset mode is not configured for ${source.id}.`);
  }

  const url = new URL(`https://api.apify.com/v2/datasets/${liveConfig.datasetId}/items`);
  url.searchParams.set("token", token);
  url.searchParams.set("format", "json");
  url.searchParams.set("clean", "true");
  url.searchParams.set("desc", "true");
  url.searchParams.set("limit", String(liveConfig.itemLimit ?? 50));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Apify dataset request failed for ${source.id}: ${response.status} ${response.statusText}`);
  }

  const items = (await response.json()) as Record<string, unknown>[];
  const posts = items
    .map((item) => mapApifyItem(item, source, liveConfig.fieldAliases ?? {}))
    .filter((item): item is RawSourcePost => item !== null);
  const droppedCount = items.length - posts.length;

  const notes: SourceNote[] = [
    {
      sourceId: source.id,
      message: `Fetched ${posts.length} posts from Apify dataset ${liveConfig.datasetId}.`,
    },
  ];

  if (droppedCount > 0) {
    notes.push({
      sourceId: source.id,
      message: `Dropped ${droppedCount} Telegram item(s) missing minimum fields (text, date, url, or author).`,
    });
  }

  return {
    posts,
    modeUsed: "live",
    notes,
  };
}

async function fetchApifyActorRun(
  source: TelegramSourceConfig,
  liveConfig: TelegramLiveApifyConfig,
): Promise<FetchResult> {
  const token = process.env[liveConfig.tokenEnvVar];
  if (!token || !liveConfig.actorId) {
    throw new Error(`Live Apify actor mode is not configured for ${source.id}.`);
  }

  const runUrl = new URL(`https://api.apify.com/v2/acts/${liveConfig.actorId}/runs`);
  runUrl.searchParams.set("token", token);
  runUrl.searchParams.set("waitForFinish", "120");

  const runResponse = await fetch(runUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(liveConfig.actorInput ?? { source: source.channelRef }),
  });

  if (!runResponse.ok) {
    throw new Error(`Apify actor run failed for ${source.id}: ${runResponse.status} ${runResponse.statusText}`);
  }

  const runPayload = (await runResponse.json()) as {
    data?: {
      defaultDatasetId?: string;
    };
  };
  const datasetId = runPayload.data?.defaultDatasetId;
  if (!datasetId) {
    throw new Error(`Apify actor run for ${source.id} did not return defaultDatasetId.`);
  }

  return fetchApifyDataset(source, {
    ...liveConfig,
    provider: "apify-dataset",
    datasetId,
  });
}

async function fetchTelegramPublicWeb(
  source: TelegramSourceConfig,
  liveConfig: TelegramLivePublicWebConfig,
): Promise<FetchResult> {
  const channel = normalizeChannelRef(source.channelRef);
  const url = `https://t.me/s/${channel}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Telegram public page request failed for ${source.id}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const itemLimit = liveConfig.itemLimit ?? 50;
  const posts = parseTelegramPublicPosts(html, source, itemLimit);

  const notes: SourceNote[] = [
    {
      sourceId: source.id,
      message: `Fetched ${posts.length} posts from Telegram public web page ${url}.`,
    },
  ];

  return {
    posts,
    modeUsed: "live",
    notes,
  };
}

export async function fetchTelegramPosts(
  source: TelegramSourceConfig,
  context: FetchContext,
): Promise<FetchResult> {
  if (context.runMode === "mock") {
    return fetchFromMock(source, context.now);
  }

  if (context.runMode === "live") {
    if (!isLiveReady(source.live)) {
      throw new Error(`Source ${source.id} requested live mode, but live config is incomplete.`);
    }

    if (isPublicWebLiveConfig(source.live)) {
      return fetchTelegramPublicWeb(source, source.live);
    }

    return source.live.provider === "apify-actor-run"
      ? fetchApifyActorRun(source, source.live)
      : fetchApifyDataset(source, source.live);
  }

  if (isLiveReady(source.live)) {
    if (isPublicWebLiveConfig(source.live)) {
      return fetchTelegramPublicWeb(source, source.live);
    }

    return source.live.provider === "apify-actor-run"
      ? fetchApifyActorRun(source, source.live)
      : fetchApifyDataset(source, source.live);
  }

  return fetchFromMock(source, context.now);
}
