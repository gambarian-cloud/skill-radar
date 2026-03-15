import { isArtifactEvidenceUrl } from "./artifact-evidence.ts";
import type { CrossSourceLink, ScoredPost } from "../types.ts";

export interface PostEvidenceFlags {
  hasArtifactEvidence: boolean;
  hasWatchlistRepoEvidence: boolean;
  hasExternalArtifactEvidence: boolean;
  hasScoutCorroboration: boolean;
  hasOriginConfirmation: boolean;
  isDiscussionOnly: boolean;
}

export interface SourceActionQualitySummary {
  sourceId: string;
  sourceLabel: string;
  actionable: number;
  artifactBacked: number;
  discussionOnly: number;
  corroborated: number;
  originConfirmed: number;
  scoutOverlap: number;
  discussionOnlyDropped: number;
}

export interface ActionQualitySummary {
  actionableTotal: number;
  useNowCount: number;
  saveForLaterCount: number;
  artifactBackedActionables: number;
  discussionOnlyActionables: number;
  corroboratedActionables: number;
  originConfirmedActionables: number;
  scoutOverlapActionables: number;
  discussionOnlyDroppedByCeiling: number;
  bySource: SourceActionQualitySummary[];
}

function readString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

export function getPostEvidenceFlags(post: ScoredPost, crossLinks: CrossSourceLink[]): PostEvidenceFlags {
  const outgoingRepoLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.fromPostId === post.id);
  const incomingRepoLinks = crossLinks.filter((link) => link.linkType === "repo-mention" && link.toPostId === post.id);
  const scoutCorroborationLinks = crossLinks.filter(
    (link) => link.linkType === "scout-corroboration" && (link.fromPostId === post.id || link.toPostId === post.id),
  );
  const outboundUrl = readString(post.metadata, "outboundUrl");
  const linkedUrl = readString(post.metadata, "linkedUrl");
  const hasWatchlistRepoEvidence = post.sourceKind === "github"
    || (post.mentionedRepos?.length ?? 0) > 0
    || outgoingRepoLinks.length > 0
    || incomingRepoLinks.length > 0;
  const hasExternalArtifactEvidence = isArtifactEvidenceUrl(outboundUrl) || isArtifactEvidenceUrl(linkedUrl);
  const hasArtifactEvidence = hasWatchlistRepoEvidence || hasExternalArtifactEvidence;
  const hasScoutCorroboration = post.sourceKind === "github"
    ? incomingRepoLinks.length > 0
    : scoutCorroborationLinks.length > 0;
  const hasOriginConfirmation = post.sourceKind === "github" ? false : outgoingRepoLinks.length > 0;
  const isDiscussionOnly = post.sourceTier === "scout" && !hasArtifactEvidence;

  return {
    hasArtifactEvidence,
    hasWatchlistRepoEvidence,
    hasExternalArtifactEvidence,
    hasScoutCorroboration,
    hasOriginConfirmation,
    isDiscussionOnly,
  };
}

export function buildActionQualitySummary(
  posts: ScoredPost[],
  crossLinks: CrossSourceLink[],
): ActionQualitySummary {
  const actionablePosts = posts.filter(
    (post) => post.analysis.decision === "use-now" || post.analysis.decision === "save-for-later",
  );
  const bySourceBuckets = new Map<string, SourceActionQualitySummary>();

  let artifactBackedActionables = 0;
  let discussionOnlyActionables = 0;
  let corroboratedActionables = 0;
  let originConfirmedActionables = 0;
  let scoutOverlapActionables = 0;
  let discussionOnlyDroppedByCeiling = 0;
  let useNowCount = 0;
  let saveForLaterCount = 0;

  for (const post of posts) {
    const bucket = bySourceBuckets.get(post.sourceId) ?? {
      sourceId: post.sourceId,
      sourceLabel: post.sourceLabel,
      actionable: 0,
      artifactBacked: 0,
      discussionOnly: 0,
      corroborated: 0,
      originConfirmed: 0,
      scoutOverlap: 0,
      discussionOnlyDropped: 0,
    };

    if (post.analysis.discussionCeilingDropped) {
      bucket.discussionOnlyDropped += 1;
      discussionOnlyDroppedByCeiling += 1;
    }

    bySourceBuckets.set(post.sourceId, bucket);
  }

  for (const post of actionablePosts) {
    const flags = getPostEvidenceFlags(post, crossLinks);
    const bucket = bySourceBuckets.get(post.sourceId) ?? {
      sourceId: post.sourceId,
      sourceLabel: post.sourceLabel,
      actionable: 0,
      artifactBacked: 0,
      discussionOnly: 0,
      corroborated: 0,
      originConfirmed: 0,
      scoutOverlap: 0,
      discussionOnlyDropped: 0,
    };

    bucket.actionable += 1;
    if (flags.hasArtifactEvidence) {
      bucket.artifactBacked += 1;
      artifactBackedActionables += 1;
    }
    if (flags.isDiscussionOnly) {
      bucket.discussionOnly += 1;
      discussionOnlyActionables += 1;
    }
    if (flags.hasScoutCorroboration || flags.hasOriginConfirmation) {
      bucket.corroborated += 1;
      corroboratedActionables += 1;
    }
    if (flags.hasOriginConfirmation) {
      bucket.originConfirmed += 1;
      originConfirmedActionables += 1;
    }
    if (flags.hasScoutCorroboration) {
      bucket.scoutOverlap += 1;
      scoutOverlapActionables += 1;
    }

    if (post.analysis.decision === "use-now") {
      useNowCount += 1;
    } else {
      saveForLaterCount += 1;
    }

    bySourceBuckets.set(post.sourceId, bucket);
  }

  return {
    actionableTotal: actionablePosts.length,
    useNowCount,
    saveForLaterCount,
    artifactBackedActionables,
    discussionOnlyActionables,
    corroboratedActionables,
    originConfirmedActionables,
    scoutOverlapActionables,
    discussionOnlyDroppedByCeiling,
    bySource: [...bySourceBuckets.values()]
      .filter((bucket) => bucket.actionable > 0 || bucket.discussionOnlyDropped > 0)
      .sort((left, right) => {
        const actionableDelta = right.actionable - left.actionable;
        if (actionableDelta !== 0) {
          return actionableDelta;
        }

        return right.discussionOnlyDropped - left.discussionOnlyDropped;
      }),
  };
}
