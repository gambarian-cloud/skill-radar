import { getPostEvidenceFlags } from "./action-quality.ts";
import { isCriticalRuntimeFailure } from "./failure-signals.ts";
import type { CrossSourceLink, ScoredPost } from "../types.ts";

interface DiscussionCeilingRule {
  key: string;
  limit: number;
}

function getDiscussionCeilingRule(post: ScoredPost): DiscussionCeilingRule | undefined {
  if (post.sourceKind === "telegram" && post.sourceTier === "scout") {
    return {
      key: post.sourceId,
      limit: 2,
    };
  }

  if (post.sourceKind === "reddit" && post.sourceTier === "scout") {
    return {
      key: post.sourceId,
      limit: 2,
    };
  }

  if (
    post.sourceKind === "web"
    && post.sourceTier === "scout"
    && typeof post.metadata?.provider === "string"
    && post.metadata.provider === "hn-algolia-search"
  ) {
    return {
      key: post.sourceId,
      limit: 1,
    };
  }

  return undefined;
}

function isCeilingExempt(post: ScoredPost): boolean {
  if (post.analysis.theme === "security") {
    return true;
  }

  return isCriticalRuntimeFailure(post.text.toLowerCase());
}

function normalizeDiscussionOnlyPolicy(post: ScoredPost, crossLinks: CrossSourceLink[]): ScoredPost {
  const flags = getPostEvidenceFlags(post, crossLinks);

  if (!flags.isDiscussionOnly || post.analysis.decision === "ignore" || isCeilingExempt(post)) {
    return post;
  }

  if (post.sourceKind === "reddit" && post.sourceTier === "scout") {
    const cappedScore = Math.min(post.analysis.relevanceScore, 75);
    const policyNotes = [
      ...(post.analysis.policyNotes ?? []),
      "Reddit discussion-only items cannot ship as Do Today without direct artifact evidence.",
    ];

    return {
      ...post,
      analysis: {
        ...post.analysis,
        relevanceScore: cappedScore,
        decision: "save-for-later",
        urgency: cappedScore >= 60 ? "this-week" : "backlog",
        policyNotes,
      },
    };
  }

  return post;
}

export function applyDiscussionCeilings(posts: ScoredPost[], crossLinks: CrossSourceLink[]): ScoredPost[] {
  const bucketed = new Map<string, { limit: number; posts: ScoredPost[] }>();
  const demotions = new Map<string, number>();

  for (const post of posts) {
    const flags = getPostEvidenceFlags(post, crossLinks);
    const rule = getDiscussionCeilingRule(post);

    if (!rule || !flags.isDiscussionOnly || post.analysis.decision === "ignore" || isCeilingExempt(post)) {
      continue;
    }

    const bucket = bucketed.get(rule.key) ?? {
      limit: rule.limit,
      posts: [],
    };

    bucket.posts.push(post);
    bucketed.set(rule.key, bucket);
  }

  for (const [key, bucket] of bucketed) {
    const ranked = [...bucket.posts].sort((left, right) => {
      const scoreDelta = right.analysis.relevanceScore - left.analysis.relevanceScore;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.publishedAt.localeCompare(left.publishedAt);
    });

    for (const post of ranked.slice(bucket.limit)) {
      demotions.set(post.id, bucket.limit);
    }

    bucketed.set(key, bucket);
  }

  return posts.map((originalPost) => {
    const post = normalizeDiscussionOnlyPolicy(originalPost, crossLinks);
    const limit = demotions.get(post.id);
    if (limit === undefined) {
      return post;
    }

    const policyNotes = [
      ...(post.analysis.policyNotes ?? []),
      `${post.sourceLabel} discussion-only ceiling kept ${limit} item(s) this run.`,
    ];

    return {
      ...post,
      analysis: {
        ...post.analysis,
        decision: "ignore",
        urgency: "none",
        suggestedNextAction: "Skip for now. Demoted by per-source discussion ceiling.",
        policyNotes,
        discussionCeilingDropped: true,
      },
    };
  });
}
