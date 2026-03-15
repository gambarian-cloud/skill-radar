import { fetchGitHubPosts } from "./github.ts";
import { fetchRedditPosts } from "./reddit.ts";
import { fetchTelegramPosts } from "./telegram.ts";
import { fetchWebPosts } from "./web.ts";
import type { FetchContext, FetchResult, SourceConfig } from "../types.ts";

function unsupportedSourceKind(kind: SourceConfig["kind"]): never {
  throw new Error(`Source kind "${kind}" is not implemented yet. Add a fetcher in src/sources/registry.ts.`);
}

export async function fetchSource(source: SourceConfig, context: FetchContext): Promise<FetchResult> {
  switch (source.kind) {
    case "telegram":
      return fetchTelegramPosts(source, context);
    case "github":
      return fetchGitHubPosts(source, context);
    case "reddit":
      return fetchRedditPosts(source, context);
    case "web":
      return fetchWebPosts(source, context);
    case "x":
      unsupportedSourceKind(source.kind);
  }
}
