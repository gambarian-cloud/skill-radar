import { readJsonFile } from "../lib/file-system.ts";
import type {
  FetchContext,
  FetchResult,
  RawSourcePost,
  SourceNote,
  WebSourceConfig,
} from "../types.ts";

interface WebFixtureItem {
  id?: string;
  text: string;
  url?: string;
  author?: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

interface HackerNewsHit {
  objectID?: string;
  created_at?: string;
  title?: string;
  story_title?: string;
  story_text?: string;
  comment_text?: string;
  url?: string;
  story_url?: string;
  author?: string;
  points?: number;
  num_comments?: number;
}

interface HackerNewsSearchResponse {
  hits?: HackerNewsHit[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x27;|&#39;/gu, "'")
    .replace(/&#x2F;/gu, "/")
    .replace(/&quot;/gu, "\"")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function sanitizeText(text: string | undefined): string {
  if (!text) {
    return "";
  }

  return decodeHtmlEntities(
    text
    .replace(/<[^>]+>/gu, " ")
  )
    .replace(/ג€”|â€”|â€“/gu, "-")
    .replace(/�/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function getLinkedUrl(hit: HackerNewsHit): string | undefined {
  return hit.url ?? hit.story_url ?? undefined;
}

function normalizeQuery(query: string): string {
  return query.replace(/^"+|"+$/gu, "").trim().toLowerCase();
}

function isOfficialLikeUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return [
      "openai.com",
      "developers.openai.com",
      "docs.anthropic.com",
      "code.claude.com",
      "anthropic.com",
      "vercel.com",
      "modelcontextprotocol.io",
      "infoq.com",
    ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function shouldKeepHackerNewsHit(query: string, hit: HackerNewsHit): boolean {
  const linkedUrl = getLinkedUrl(hit);
  const title = sanitizeText(hit.title ?? hit.story_title).toLowerCase();
  const body = sanitizeText(hit.story_text ?? hit.comment_text).toLowerCase();
  const normalizedQuery = normalizeQuery(query);
  const combined = `${title} ${body} ${linkedUrl ?? ""}`.toLowerCase();
  const points = hit.points ?? 0;
  const comments = hit.num_comments ?? 0;
  const engagement = points + comments;
  const officialLike = isOfficialLikeUrl(linkedUrl);
  const repoQuery = normalizedQuery.includes("/");
  const matchesSpecificQuery = normalizedQuery.length > 0 && combined.includes(normalizedQuery);
  const showHn = title.startsWith("show hn:");
  const askHn = title.startsWith("ask hn:");

  if (repoQuery) {
    return Boolean(linkedUrl) && matchesSpecificQuery;
  }

  if (!linkedUrl && engagement < 40) {
    return false;
  }

  if (officialLike && engagement < 5) {
    return false;
  }

  if (showHn && !officialLike && engagement < 30) {
    return false;
  }

  if (askHn && engagement < 20) {
    return false;
  }

  if (!officialLike && engagement < 12) {
    return false;
  }

  return true;
}

function buildHackerNewsText(hit: HackerNewsHit): string {
  const title = sanitizeText(hit.title ?? hit.story_title) || "Hacker News discussion";
  const body = sanitizeText(hit.story_text ?? hit.comment_text);
  const parts = [title];

  if (body) {
    parts.push(body);
  }

  if (typeof hit.points === "number" || typeof hit.num_comments === "number") {
    parts.push(`HN signals: ${hit.points ?? 0} points, ${hit.num_comments ?? 0} comments.`);
  }

  return parts.join(" ");
}

function buildHackerNewsPost(source: WebSourceConfig, query: string, hit: HackerNewsHit, index: number): RawSourcePost {
  const publishedAt = hit.created_at ?? new Date().toISOString();
  const url = getLinkedUrl(hit);
  const title = sanitizeText(hit.title ?? hit.story_title) || "Hacker News discussion";

  return {
    sourceId: source.id,
    sourceLabel: `${source.label}: ${query}`,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: hit.objectID ?? `${source.id}:${query}:${index}`,
    text: buildHackerNewsText(hit),
    url,
    author: hit.author,
    publishedAt,
    metadata: {
      provider: "hn-algolia-search",
      query,
      title,
      points: hit.points ?? 0,
      comments: hit.num_comments ?? 0,
      linkedUrl: url ?? null,
    },
  };
}

async function fetchFromMock(source: WebSourceConfig): Promise<FetchResult> {
  const fixture = await readJsonFile<WebFixtureItem[]>(source.mock.fixturePath);
  const posts: RawSourcePost[] = fixture.map((item, index) => ({
    sourceId: source.id,
    sourceLabel: source.label,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: item.id ?? `${source.id}-mock-${index + 1}`,
    text: item.text,
    url: item.url,
    author: item.author,
    publishedAt: item.publishedAt,
    metadata: item.metadata,
  }));

  return {
    posts,
    modeUsed: "mock",
    notes: [
      {
        sourceId: source.id,
        message: "Using local mock fixture for web scout source activity.",
      },
    ],
  };
}

async function fetchHackerNewsSearch(source: WebSourceConfig): Promise<FetchResult> {
  const live = source.live;
  if (!live || live.provider !== "hn-algolia-search") {
    throw new Error(`Live web mode is not configured for ${source.id}.`);
  }

  const tags = live.tags?.join(",") || "story";
  const hitsPerPage = String(live.hitsPerPage ?? 8);
  const posts: RawSourcePost[] = [];
  const notes: SourceNote[] = [];

  for (const query of live.queries) {
    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", query);
    url.searchParams.set("tags", tags);
    url.searchParams.set("hitsPerPage", hitsPerPage);

    const response = await fetch(url);
    if (!response.ok) {
      notes.push({
        sourceId: source.id,
        message: `Skipped HN query ${query}: ${response.status} ${response.statusText}`,
      });
      continue;
    }

    const payload = (await response.json()) as HackerNewsSearchResponse;
    const hits = payload.hits ?? [];
    const filteredHits = hits.filter((hit) => shouldKeepHackerNewsHit(query, hit));
    filteredHits.forEach((hit, index) => {
      posts.push(buildHackerNewsPost(source, query, hit, index));
    });
    notes.push({
      sourceId: source.id,
      message: `Fetched ${hits.length} HN hit(s) for query ${query}; kept ${filteredHits.length} after scout filtering.`,
    });
  }

  return {
    posts,
    modeUsed: "live",
    notes,
  };
}

export async function fetchWebPosts(
  source: WebSourceConfig,
  context: FetchContext,
): Promise<FetchResult> {
  if (context.runMode === "mock") {
    return fetchFromMock(source);
  }

  if (context.runMode === "live") {
    return fetchHackerNewsSearch(source);
  }

  try {
    return await fetchHackerNewsSearch(source);
  } catch {
    return fetchFromMock(source);
  }
}
