import { readJsonFile } from "../lib/file-system.ts";
import type {
  FetchContext,
  FetchResult,
  RawSourcePost,
  RedditSourceConfig,
  SourceNote,
} from "../types.ts";

interface RedditFixtureItem {
  id?: string;
  subreddit?: string;
  title?: string;
  text: string;
  url?: string;
  author?: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

interface RedditListingChildData {
  id?: string;
  name?: string;
  subreddit?: string;
  title?: string;
  selftext?: string;
  url?: string;
  permalink?: string;
  author?: string;
  created_utc?: number;
  score?: number;
  num_comments?: number;
  link_flair_text?: string;
  is_self?: boolean;
  crosspost_parent?: string;
  domain?: string;
}

interface RedditListingResponse {
  data?: {
    children?: Array<{
      kind?: string;
      data?: RedditListingChildData;
    }>;
  };
}

const REDDIT_DIRECT_KEYWORDS = [
  "claude code",
  "codex",
  "openai",
  "anthropic",
  "skills",
  "agent",
  "agentic",
  "mcp",
  "model context protocol",
  "worktree",
  "worktrees",
  "agents.md",
  "prompt",
  "eval",
  "benchmark",
];

const OFFICIAL_LIKE_HOSTS = [
  "github.com",
  "openai.com",
  "developers.openai.com",
  "anthropic.com",
  "docs.anthropic.com",
  "code.claude.com",
  "vercel.com",
  "modelcontextprotocol.io",
];

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

  return decodeHtmlEntities(text)
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function buildPermalink(data: RedditListingChildData): string | undefined {
  if (!data.permalink) {
    return undefined;
  }

  return `https://www.reddit.com${data.permalink}`;
}

function isOfficialLikeUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return OFFICIAL_LIKE_HOSTS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function hasRepoLikeMention(text: string): boolean {
  return /github\.com\/[a-z0-9][a-z0-9-]{0,38}\/[a-z0-9][a-z0-9.-]{0,99}/iu.test(text);
}

function hasDirectInterest(text: string): boolean {
  return REDDIT_DIRECT_KEYWORDS.some((keyword) => text.includes(keyword));
}

function shouldKeepRedditPost(data: RedditListingChildData): boolean {
  const title = sanitizeText(data.title).toLowerCase();
  const body = sanitizeText(data.selftext).toLowerCase();
  const flair = sanitizeText(data.link_flair_text).toLowerCase();
  const outboundUrl = data.url;
  const combined = `${title} ${body} ${outboundUrl ?? ""}`.toLowerCase();
  const score = data.score ?? 0;
  const comments = data.num_comments ?? 0;
  const engagement = score + comments;
  const repoLike = hasRepoLikeMention(combined);
  const officialLike = isOfficialLikeUrl(outboundUrl);
  const isCrosspost = Boolean(data.crosspost_parent);
  const isHumor = flair.includes("humor") || title.includes("meme");
  const isQuestionLike =
    title.startsWith("how ")
    || title.startsWith("can ")
    || title.startsWith("what ")
    || title.includes(" any tips")
    || title.includes(" issue ")
    || title.includes(" error ")
    || title.includes(" trial")
    || title.includes(" share ");

  if (isHumor && engagement < 15) {
    return false;
  }

  if (!hasDirectInterest(combined) && !repoLike) {
    return false;
  }

  if (repoLike) {
    return true;
  }

  if (!officialLike && engagement < 6) {
    return false;
  }

  if (isQuestionLike && comments < 8) {
    return false;
  }

  if (isCrosspost && engagement < 4) {
    return false;
  }

  if (officialLike && engagement >= 1) {
    return true;
  }

  if (comments >= 8 || score >= 12 || engagement >= 18) {
    return true;
  }

  return title.includes("worktree")
    || title.includes("agents.md")
    || title.includes("mcp")
    || title.includes("skills");
}

function buildRedditText(data: RedditListingChildData): string {
  const title = sanitizeText(data.title) || "Reddit discussion";
  const body = sanitizeText(data.selftext);
  const parts = [title];

  if (body) {
    parts.push(body);
  }

  if (data.url && !data.is_self && buildPermalink(data) !== data.url) {
    parts.push(`Linked artifact: ${data.url}`);
  }

  parts.push(`Reddit signals: ${data.score ?? 0} score, ${data.num_comments ?? 0} comments.`);
  return parts.join(" ");
}

function buildRedditPost(
  source: RedditSourceConfig,
  subreddit: string,
  data: RedditListingChildData,
  index: number,
): RawSourcePost {
  const publishedAt = data.created_utc
    ? new Date(data.created_utc * 1000).toISOString()
    : new Date().toISOString();
  const permalink = buildPermalink(data);

  return {
    sourceId: source.id,
    sourceLabel: `${source.label}: r/${subreddit}`,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: data.name ?? data.id ?? `${source.id}:${subreddit}:${index}`,
    text: buildRedditText(data),
    url: permalink ?? data.url,
    author: data.author,
    publishedAt,
    metadata: {
      provider: "reddit-json-listing",
      subreddit,
      title: sanitizeText(data.title),
      score: data.score ?? 0,
      comments: data.num_comments ?? 0,
      flair: sanitizeText(data.link_flair_text) || null,
      permalink,
      outboundUrl: data.url ?? null,
      isSelf: data.is_self ?? false,
      isCrosspost: Boolean(data.crosspost_parent),
      domain: data.domain ?? null,
    },
  };
}

async function fetchFromMock(source: RedditSourceConfig): Promise<FetchResult> {
  const fixture = await readJsonFile<RedditFixtureItem[]>(source.mock.fixturePath);
  const posts: RawSourcePost[] = fixture.map((item, index) => ({
    sourceId: source.id,
    sourceLabel: item.subreddit ? `${source.label}: r/${item.subreddit}` : source.label,
    sourceKind: source.kind,
    sourceTier: source.tier,
    sourcePriority: source.priority,
    externalId: item.id ?? `${source.id}-mock-${index + 1}`,
    text: item.text,
    url: item.url,
    author: item.author,
    publishedAt: item.publishedAt,
    metadata: {
      provider: "mock",
      subreddit: item.subreddit ?? null,
      title: item.title ?? null,
      ...item.metadata,
    },
  }));

  return {
    posts,
    modeUsed: "mock",
    notes: [
      {
        sourceId: source.id,
        message: "Using local mock fixture for Reddit scout source activity.",
      },
    ],
  };
}

async function fetchRedditListing(source: RedditSourceConfig): Promise<FetchResult> {
  const listing = source.live?.listing ?? "new";
  const limit = String(source.live?.limitPerSubreddit ?? 8);
  const userAgent = source.live?.userAgent ?? "SignalScout/0.1 by MI";
  const posts: RawSourcePost[] = [];
  const notes: SourceNote[] = [];

  for (const target of source.watch) {
    const url = new URL(`https://www.reddit.com/r/${target.name}/${listing}.json`);
    url.searchParams.set("limit", limit);

    const response = await fetch(url, {
      headers: {
        "user-agent": userAgent,
      },
    });

    if (!response.ok) {
      notes.push({
        sourceId: source.id,
        message: `Skipped r/${target.name}: ${response.status} ${response.statusText}`,
      });
      continue;
    }

    const payload = (await response.json()) as RedditListingResponse;
    const children = payload.data?.children ?? [];
    const entries = children
      .map((child) => child.data)
      .filter((data): data is RedditListingChildData => Boolean(data));
    const filtered = entries.filter((entry) => shouldKeepRedditPost(entry));

    filtered.forEach((entry, index) => {
      posts.push(buildRedditPost(source, target.name, entry, index));
    });

    notes.push({
      sourceId: source.id,
      message: `Fetched ${entries.length} Reddit post(s) from r/${target.name}; kept ${filtered.length} after scout filtering.`,
    });
  }

  return {
    posts,
    modeUsed: "live",
    notes,
  };
}

export async function fetchRedditPosts(
  source: RedditSourceConfig,
  context: FetchContext,
): Promise<FetchResult> {
  if (context.runMode === "mock") {
    return fetchFromMock(source);
  }

  if (context.runMode === "live") {
    return fetchRedditListing(source);
  }

  try {
    return await fetchRedditListing(source);
  } catch {
    return fetchFromMock(source);
  }
}
