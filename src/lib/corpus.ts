import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { ADOPT_NOW_CLAUDE_SKILLS, ADOPT_NOW_CODEX_SKILLS, ADOPT_NOW_MCP } from "../config/agent-baseline.ts";
import { GITHUB_AGENT_WATCHLIST } from "../config/github-watchlist.ts";
import {
  buildCoreCapabilityDocument,
  buildLensDocument,
  RADAR_CORE_CAPABILITIES,
  RADAR_DOMAIN_LENSES,
  summarizeCurrentPresetModel,
} from "../config/radar-presets.ts";
import {
  loadRadarProfile,
  summarizeRadarProfile,
  summarizeRadarProfileFocus,
} from "../config/radar-profile.ts";
import { SOURCE_CONFIG } from "../config/sources.ts";
import type { CorpusDocument, CorpusDocumentKind } from "../types.ts";

interface CorpusRoot {
  root: string;
  kind: CorpusDocumentKind;
}

const WORKSPACE_ROOT = resolve(".");
const CORPUS_ROOTS: CorpusRoot[] = [
  { root: resolve("reports", "research"), kind: "research-note" },
  { root: resolve("Research"), kind: "research-note" },
  { root: resolve("reports", "daily"), kind: "daily-digest" },
  { root: resolve("skills"), kind: "skill" },
  { root: resolve("radar-presets"), kind: "project-doc" },
];

const PROJECT_DOCS = ["AGENTS.md", "CLAUDE.md", "PRD.md"];

async function pathExists(path: string): Promise<boolean> {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

function isMarkdownFile(path: string): boolean {
  return extname(path).toLowerCase() === ".md";
}

function shouldSkip(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  return normalized.includes("reports/research/lookups/") || normalized.includes("Research/lookups/");
}

function inferTitle(path: string, contents: string): string {
  const heading = contents
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  return heading ? heading.replace(/^#\s+/u, "") : basename(path, extname(path));
}

async function readMarkdownDocument(path: string, kind: CorpusDocumentKind): Promise<CorpusDocument> {
  const contents = (await readFile(path, "utf8")).replace(/^\uFEFF/u, "");
  const relativePath = relative(WORKSPACE_ROOT, path).replace(/\\/g, "/");

  return {
    id: relativePath,
    kind,
    path: relativePath,
    title: inferTitle(path, contents),
    text: contents,
  };
}

async function collectMarkdownFiles(root: string, kind: CorpusDocumentKind): Promise<CorpusDocument[]> {
  if (!(await pathExists(root))) {
    return [];
  }

  const documents: CorpusDocument[] = [];
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(root, entry.name);

    if (shouldSkip(entryPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      documents.push(...await collectMarkdownFiles(entryPath, kind));
      continue;
    }

    if (!entry.isFile() || !isMarkdownFile(entryPath)) {
      continue;
    }

    documents.push(await readMarkdownDocument(entryPath, kind));
  }

  return documents;
}

function buildSyntheticDocument(id: string, title: string, text: string): CorpusDocument {
  return {
    id,
    kind: "project-doc",
    path: id,
    title,
    text,
  };
}

export function summarizeCurrentBaseline(): string {
  return `Current baseline: Codex skills ${ADOPT_NOW_CODEX_SKILLS.length}, Claude skills ${ADOPT_NOW_CLAUDE_SKILLS.length}, adopt-now MCP ${ADOPT_NOW_MCP.map((item) => item.label).join(", ")}.`;
}

export function summarizeCurrentSourcePolicy(): string {
  const daily = SOURCE_CONFIG.filter((source) => source.enabled && (source.cadenceClass ?? "daily") === "daily")
    .map((source) => source.label)
    .join(", ");
  const slower = SOURCE_CONFIG.filter((source) => source.enabled && source.cadenceClass === "slower-cadence")
    .map((source) => source.label)
    .join(", ");
  const watch = SOURCE_CONFIG.filter((source) => source.enabled && source.cadenceClass === "watch")
    .map((source) => source.label)
    .join(", ");

  return `Current source policy: daily -> ${daily || "none"}; slower-cadence -> ${slower || "none"}; watch -> ${watch || "none"}.`;
}

export function summarizeCurrentGitHubWatchlist(): string {
  const topRepos = GITHUB_AGENT_WATCHLIST.slice(0, 5).map((target) => `${target.owner}/${target.repo}`).join(", ");
  return `Current GitHub watchlist: ${GITHUB_AGENT_WATCHLIST.length} repos. Front of the list: ${topRepos}.`;
}

export function summarizeCurrentProjectStatus(): string {
  const enabledSources = SOURCE_CONFIG.filter((source) => source.enabled).length;
  const liveReadySources = SOURCE_CONFIG.filter((source) => source.enabled && source.live).length;

  return `Current project read: baseline is stable, live intake is running across ${enabledSources} enabled sources (${liveReadySources} live-ready), lookup now covers current config plus latest digest and audit evidence, and the remaining active work is measured source retune rather than a missing product layer.`;
}

export function summarizeCurrentSourceRead(): string {
  return "Current source read: source tuning is in measurement mode, with keep/drop decisions waiting on a few more cycles rather than fresh implementation work.";
}

export function summarizeCurrentPresetRead(): string {
  const core = RADAR_CORE_CAPABILITIES.map((capability) => capability.label).join(", ");
  const lenses = RADAR_DOMAIN_LENSES.map((lens) => lens.label).join(", ");
  return `Current preset read: the five always-on output areas are ${core}; optional domain lenses are ${lenses}.`;
}

export function summarizePresetSpecificRead(): string {
  const leadingCapabilities = RADAR_CORE_CAPABILITIES.slice(0, 3).map((capability) => capability.label).join(", ");
  const leadingLenses = RADAR_DOMAIN_LENSES.slice(0, 3).map((lens) => lens.label).join(", ");
  return `Current preset detail read: core capability boxes exist for ${leadingCapabilities}; first domain lenses are ${leadingLenses}.`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function extractSectionBullets(markdown: string, heading: string): string[] {
  const pattern = new RegExp(`## ${escapeRegExp(heading)}\\r?\\n\\r?\\n?([\\s\\S]*?)(?:\\r?\\n## |$)`, "u");
  const match = markdown.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
}

function extractSubsectionBullets(markdown: string, heading: string): string[] {
  const pattern = new RegExp(`### ${escapeRegExp(heading)}\\r?\\n\\r?\\n?([\\s\\S]*?)(?:\\r?\\n### |\\r?\\n## |$)`, "u");
  const match = markdown.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/^\s*-\s+/u, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
}

function truncateText(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function summarizeActionBullet(value: string): string {
  const cleaned = cleanInlineMarkdown(value);
  const cutoff = cleaned.search(/[:;]/u);
  const summary = cutoff > 0 ? cleaned.slice(0, cutoff) : cleaned;
  return summary.replace(/\.$/u, "").trim();
}

function buildActionQueueDocument(
  markdown: string,
  heading: string,
  label: string,
  sourcePath: string,
): CorpusDocument | undefined {
  const bullets = extractSubsectionBullets(markdown, heading);
  if (bullets.length === 0) {
    return undefined;
  }

  const cleanedBullets = bullets.map((line) => cleanInlineMarkdown(line));
  const actionSummaries = cleanedBullets.map(summarizeActionBullet).filter((line) => line.length > 0);
  const summary = `Current ${label}: ${actionSummaries.length} item(s). Top actions -> ${actionSummaries
    .slice(0, 3)
    .join("; ")}.`;

  return buildSyntheticDocument(
    `synthetic/current-${label.replace(/\s+/gu, "-")}`,
    `Current ${heading} Queue`,
    [
      summary,
      `Built from latest digest: ${sourcePath}.`,
      ...cleanedBullets.map((line) => `- ${truncateText(line, 220)}`),
    ].join("\n"),
  );
}

function extractPrefixedLines(markdown: string, prefix: string): string[] {
  return markdown
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trim())
    .filter((line) => line.length > 0);
}

function buildRepoEvidenceDocument(markdown: string, sourcePath: string): CorpusDocument | undefined {
  const evidenceLines = extractPrefixedLines(markdown, "- repo evidence: ");
  if (evidenceLines.length === 0) {
    return undefined;
  }

  const summary = `Current repo evidence read: ${evidenceLines
    .slice(0, 3)
    .map((line) => truncateText(line, 140))
    .join(" ")}`;

  return buildSyntheticDocument(
    "synthetic/current-repo-evidence",
    "Current Repo Evidence",
    [
      summary,
      `Built from latest digest: ${sourcePath}.`,
      ...evidenceLines.map((line) => `- ${line}`),
    ].join("\n"),
  );
}

function buildSectionTrendDocument(
  markdown: string,
  heading: string,
  id: string,
  title: string,
  summaryPrefix: string,
  sourcePath: string,
): CorpusDocument | undefined {
  const lines = extractSectionBullets(markdown, heading).map((line) => cleanInlineMarkdown(line));
  if (lines.length === 0) {
    return undefined;
  }

  const summary = `${summaryPrefix} ${lines
    .slice(0, 4)
    .map((line) => truncateText(line, 140))
    .join(" ")}`;

  return buildSyntheticDocument(
    id,
    title,
    [
      summary,
      `Built from latest report: ${sourcePath}.`,
      ...lines.map((line) => `- ${line}`),
    ].join("\n"),
  );
}

function parseMetric(markdown: string, label: string): number | undefined {
  const escaped = escapeRegExp(label);
  const match = markdown.match(new RegExp(`- ${escaped}:\\s+(\\d+)`, "iu"));
  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[1] ?? "", 10);
}

function summarizeLatestRadarEvidence(markdown: string): string | undefined {
  const actionable = parseMetric(markdown, "actionable total");
  const artifactBacked = parseMetric(markdown, "artifact-backed");
  const discussionOnly = parseMetric(markdown, "discussion-only");
  const corroborated = parseMetric(markdown, "corroborated total");
  const originConfirmed = parseMetric(markdown, "origin-confirmed");
  const scoutOverlap = parseMetric(markdown, "scout-overlap");
  const kept = parseMetric(markdown, "kept after cleanup");

  if (
    actionable === undefined
    || artifactBacked === undefined
    || discussionOnly === undefined
    || corroborated === undefined
    || originConfirmed === undefined
    || scoutOverlap === undefined
  ) {
    return undefined;
  }

  const keptPart = kept === undefined ? "" : ` kept ${kept};`;
  return `Latest radar evidence: actionable ${actionable};${keptPart} artifact-backed ${artifactBacked}; discussion-only ${discussionOnly}; corroborated ${corroborated} (${originConfirmed} origin-confirmed, ${scoutOverlap} scout-overlap).`;
}

function summarizeLatestCadenceEvidence(markdown: string): string | undefined {
  const lines = extractSectionBullets(markdown, "Cadence Read");

  const daily: string[] = [];
  const slower: string[] = [];
  const cold: string[] = [];

  for (const line of lines) {
    const match = line.match(/^- (.+?):\s+(daily-viable|slower-cadence|cold)\b/iu);
    if (!match) {
      continue;
    }

    const label = match[1] ?? "";
    const status = match[2] ?? "";
    if (status === "daily-viable") {
      daily.push(label);
    } else if (status === "slower-cadence") {
      slower.push(label);
    } else if (status === "cold") {
      cold.push(label);
    }
  }

  if (daily.length === 0 && slower.length === 0 && cold.length === 0) {
    return undefined;
  }

  return `Latest cadence evidence: daily-viable -> ${daily.join(", ") || "none"}; slower-cadence -> ${slower.join(", ") || "none"}; cold -> ${cold.join(", ") || "none"}.`;
}

function summarizeLatestRetuneStatus(markdown: string): string | undefined {
  const lines = extractSectionBullets(markdown, "Retune Status Read");
  if (lines.length === 0) {
    return undefined;
  }

  const prioritized = [
    ...lines.filter((line) => line.includes("demote-ready") || line.includes("short-probation") || line.includes("probation") || line.includes("watch")),
    ...lines.filter((line) => line.includes("core")),
  ];

  return `Current retune status: ${prioritized
    .slice(0, 4)
    .map((line) => line.replace(/^- /u, ""))
    .join(" ")}`;
}

function summarizeNextDecisionGate(markdown: string): string | undefined {
  const lines = extractSectionBullets(markdown, "Retune Status Read");
  if (lines.length === 0) {
    return undefined;
  }

  const normalized = lines.map((line) => line.replace(/^- /u, ""));
  const byPriority = [
    normalized.find((line) => line.includes("demote-ready")),
    normalized.find((line) => line.includes("short-probation")),
    normalized.find((line) => line.includes("watch;")),
    normalized.find((line) => line.includes("probation;")),
  ].filter((line): line is string => Boolean(line));

  const top = byPriority[0];
  return top ? `Next decision gate: ${top}` : undefined;
}

function summarizeCurrentRecommendation(
  digestMarkdown: string | undefined,
  auditHistoryMarkdown: string | undefined,
): string | undefined {
  if (!digestMarkdown) {
    return undefined;
  }

  const artifactBacked = parseMetric(digestMarkdown, "artifact-backed");
  const discussionOnly = parseMetric(digestMarkdown, "discussion-only");
  const corroborated = parseMetric(digestMarkdown, "corroborated total");
  const originConfirmed = parseMetric(digestMarkdown, "origin-confirmed");
  const scoutOverlap = parseMetric(digestMarkdown, "scout-overlap");

  if (
    artifactBacked === undefined
    || discussionOnly === undefined
    || corroborated === undefined
    || originConfirmed === undefined
    || scoutOverlap === undefined
  ) {
    return undefined;
  }

  const recommendations: string[] = [];
  recommendations.push(
    artifactBacked >= discussionOnly
      ? `Current recommendation: keep the current product shape stable and let the measurement timers run; the latest run is mostly artifact-backed (${artifactBacked} vs ${discussionOnly} discussion-only).`
      : `Current recommendation: keep improving evidence quality before expanding sources; the latest run is still discussion-heavy (${discussionOnly} discussion-only vs ${artifactBacked} artifact-backed).`,
  );

  recommendations.push(
    corroborated === 0
      ? "Source retune should stay in measurement mode for now because the latest run still shows zero corroboration."
      : `Source retune should stay measured, not reactive: the latest run shows ${corroborated} corroborated item(s) (${originConfirmed} origin-confirmed, ${scoutOverlap} scout-overlap).`,
  );

  if (auditHistoryMarkdown) {
    const decisionGate = summarizeNextDecisionGate(auditHistoryMarkdown);
    if (decisionGate) {
      recommendations.push(decisionGate);
    }
  }

  return recommendations.join(" ");
}

async function findLatestMarkdownFile(root: string): Promise<string | undefined> {
  if (!(await pathExists(root))) {
    return undefined;
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => join(root, entry.name))
    .sort((left, right) => right.localeCompare(left));

  return files[0];
}

async function findLatestMarkdownFileContaining(root: string, fragment: string): Promise<{ path: string; markdown: string } | undefined> {
  if (!(await pathExists(root))) {
    return undefined;
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => join(root, entry.name))
    .sort((left, right) => right.localeCompare(left));

  for (const path of files) {
    const markdown = (await readFile(path, "utf8")).replace(/^\uFEFF/u, "");
    if (markdown.includes(fragment)) {
      return { path, markdown };
    }
  }

  return undefined;
}

async function findLatestNamedMarkdownFile(
  root: string,
  fragment: string,
  excludeFragments: string[] = [],
): Promise<string | undefined> {
  if (!(await pathExists(root))) {
    return undefined;
  }

  const entries = await readdir(root, { withFileTypes: true });
  const include = fragment.toLowerCase();
  const excludes = excludeFragments.map((value) => value.toLowerCase());
  const files = entries
    .filter((entry) => {
      if (!entry.isFile() || !isMarkdownFile(entry.name)) {
        return false;
      }

      const lower = entry.name.toLowerCase();
      return lower.includes(include) && !excludes.some((value) => lower.includes(value));
    })
    .map((entry) => join(root, entry.name))
    .sort((left, right) => right.localeCompare(left));

  return files[0];
}

async function buildSyntheticRuntimeDocuments(): Promise<CorpusDocument[]> {
  const documents: CorpusDocument[] = [];
  let latestDigestMarkdown: string | undefined;
  let latestAuditHistoryMarkdown: string | undefined;

  const latestDigest = await findLatestMarkdownFile(resolve("reports", "daily"));
  if (latestDigest) {
    const markdown = (await readFile(latestDigest, "utf8")).replace(/^\uFEFF/u, "");
    latestDigestMarkdown = markdown;
    const digestPath = relative(WORKSPACE_ROOT, latestDigest).replace(/\\/g, "/");
    const summary = summarizeLatestRadarEvidence(markdown);
    if (summary) {
      documents.push(
        buildSyntheticDocument(
          "synthetic/current-radar-evidence",
          "Current Radar Evidence",
          [
            summary,
            `Built from latest digest: ${digestPath}.`,
          ].join("\n"),
        ),
      );
    }

    const doTodayDocument = buildActionQueueDocument(markdown, "Do Today", "do-today queue", digestPath);
    if (doTodayDocument) {
      documents.push(doTodayDocument);
    }

    const saveThisWeekDocument = buildActionQueueDocument(markdown, "Save This Week", "save-this-week queue", digestPath);
    if (saveThisWeekDocument) {
      documents.push(saveThisWeekDocument);
    }

    const ignoreForNowDocument = buildActionQueueDocument(markdown, "Ignore For Now", "ignore-for-now queue", digestPath);
    if (ignoreForNowDocument) {
      documents.push(ignoreForNowDocument);
    }
  }

  const latestRepoEvidenceDigest = await findLatestMarkdownFileContaining(resolve("reports", "daily"), "- repo evidence: ");
  if (latestRepoEvidenceDigest) {
    const repoEvidenceDigestPath = relative(WORKSPACE_ROOT, latestRepoEvidenceDigest.path).replace(/\\/g, "/");
    const repoEvidenceDocument = buildRepoEvidenceDocument(latestRepoEvidenceDigest.markdown, repoEvidenceDigestPath);
    if (repoEvidenceDocument) {
      documents.push(repoEvidenceDocument);
    }
  }

  const latestSourceAudit = await findLatestNamedMarkdownFile(resolve("reports", "research"), "source-audit", ["history", "harness"]);
  if (latestSourceAudit) {
    const markdown = (await readFile(latestSourceAudit, "utf8")).replace(/^\uFEFF/u, "");
    const summary = summarizeLatestCadenceEvidence(markdown);
    if (summary) {
      documents.push(
        buildSyntheticDocument(
          "synthetic/current-cadence-evidence",
          "Current Cadence Evidence",
          [
            summary,
            `Built from latest source audit: ${relative(WORKSPACE_ROOT, latestSourceAudit).replace(/\\/g, "/")}.`,
          ].join("\n"),
        ),
      );
    }
  }

  const latestAuditHistory = await findLatestNamedMarkdownFile(resolve("reports", "research"), "source-audit-history");
  if (latestAuditHistory) {
    latestAuditHistoryMarkdown = (await readFile(latestAuditHistory, "utf8")).replace(/^\uFEFF/u, "");
    const auditHistoryPath = relative(WORKSPACE_ROOT, latestAuditHistory).replace(/\\/g, "/");

    const sourceTrendDocument = buildSectionTrendDocument(
      latestAuditHistoryMarkdown,
      "Source Trend Read",
      "synthetic/current-source-trends",
      "Current Source Trends",
      "Current source trend read:",
      auditHistoryPath,
    );
    if (sourceTrendDocument) {
      documents.push(sourceTrendDocument);
    }

    const redditTrendDocument = buildSectionTrendDocument(
      latestAuditHistoryMarkdown,
      "Reddit Target Trend Read",
      "synthetic/current-reddit-target-trends",
      "Current Reddit Target Trends",
      "Current Reddit target trend read:",
      auditHistoryPath,
    );
    if (redditTrendDocument) {
      documents.push(redditTrendDocument);
    }
  }

  const retuneSummary = latestAuditHistoryMarkdown ? summarizeLatestRetuneStatus(latestAuditHistoryMarkdown) : undefined;
  if (retuneSummary) {
    documents.push(
      buildSyntheticDocument(
        "synthetic/current-retune-status",
        "Current Reddit and Source Retune Status",
        retuneSummary.replace(/^Current retune status:/u, "Current Reddit and source retune status:"),
      ),
    );
  }

  const recommendationSummary = summarizeCurrentRecommendation(latestDigestMarkdown, latestAuditHistoryMarkdown);
  if (recommendationSummary) {
    documents.push(
      buildSyntheticDocument(
        "synthetic/current-recommendations",
        "Current Product Recommendation",
        recommendationSummary,
      ),
    );
  }

  return documents;
}

export function buildSyntheticConfigDocuments(): CorpusDocument[] {
  const sourceConfigText = [
    "Current active source set for Signal Scout, including daily, slower-cadence, and watch sources.",
    summarizeCurrentSourcePolicy(),
    ...SOURCE_CONFIG.map((source) => {
      const details = [
        `id: ${source.id}`,
        `label: ${source.label}`,
        `kind: ${source.kind}`,
        `tier: ${source.tier}`,
        `cadence: ${source.cadenceClass ?? "daily"}`,
        `freshness: ${source.freshnessHours ?? 24}h`,
      ];

      if (source.kind === "telegram") {
        details.push(`channel: ${source.channelRef}`);
      }

      if (source.kind === "reddit") {
        details.push(`watch: ${source.watch.map((target) => `r/${target.name}`).join(", ")}`);
      }

      if (source.kind === "github") {
        details.push(`watch: ${source.watch.map((target) => `${target.owner}/${target.repo}`).join(", ")}`);
      }

      return details.join(" | ");
    }),
  ].join("\n");

  const githubWatchlistText = [
    "Current GitHub watchlist repos monitored by Signal Scout for origin confirmation.",
    summarizeCurrentGitHubWatchlist(),
    ...GITHUB_AGENT_WATCHLIST.map((target) => `${target.owner}/${target.repo}${target.label ? ` - ${target.label}` : ""}`),
  ].join("\n");

  const baselineText = [
    "Current shared Codex + Claude baseline, including personal skills, hooks, safety rules, and adopt-now MCP.",
    summarizeCurrentBaseline(),
    `Codex skills: ${ADOPT_NOW_CODEX_SKILLS.map((skill) => skill.name).join(", ")}`,
    `Claude skills: ${ADOPT_NOW_CLAUDE_SKILLS.map((skill) => skill.name).join(", ")}`,
    `Adopt-now MCP: ${ADOPT_NOW_MCP.map((mcp) => mcp.label).join(", ")}`,
  ].join("\n");

  const projectStatusText = [
    "Current project status for Signal Scout.",
    summarizeCurrentProjectStatus(),
    summarizeCurrentSourceRead(),
  ].join("\n");

  const presetModelText = [
    "Current preset model for Signal Scout.",
    summarizeCurrentPresetModel(),
    summarizeCurrentPresetRead(),
    `Core capabilities: ${RADAR_CORE_CAPABILITIES.map((capability) => capability.label).join(", ")}`,
    `Domain lenses: ${RADAR_DOMAIN_LENSES.map((lens) => lens.label).join(", ")}`,
  ].join("\n");

  const documents = [
    buildSyntheticDocument("synthetic/source-config", "Current Source Configuration", sourceConfigText),
    buildSyntheticDocument("synthetic/github-watchlist", "Current GitHub Watchlist", githubWatchlistText),
    buildSyntheticDocument("synthetic/agent-baseline", "Current Agent Baseline", baselineText),
    buildSyntheticDocument("synthetic/project-status", "Current Project Status", projectStatusText),
    buildSyntheticDocument("synthetic/radar-presets", "Current Radar Preset Model", presetModelText),
  ];

  for (const capability of RADAR_CORE_CAPABILITIES) {
    documents.push(
      buildSyntheticDocument(
        `synthetic/radar-core-${capability.id}`,
        `${capability.label} Core Capability`,
        buildCoreCapabilityDocument(capability),
      ),
    );
  }

  for (const lens of RADAR_DOMAIN_LENSES) {
    documents.push(
      buildSyntheticDocument(
        `synthetic/radar-lens-${lens.id}`,
        `${lens.label} Domain Lens`,
        buildLensDocument(lens),
      ),
    );
  }

  return documents;
}

export async function loadLookupCorpus(): Promise<CorpusDocument[]> {
  const documents: CorpusDocument[] = [];

  for (const root of CORPUS_ROOTS) {
    documents.push(...await collectMarkdownFiles(root.root, root.kind));
  }

  for (const file of PROJECT_DOCS) {
    const path = resolve(file);
    try {
      documents.push(await readMarkdownDocument(path, "project-doc"));
    } catch {
      // Ignore missing optional project docs.
    }
  }

  documents.push(...buildSyntheticConfigDocuments());
  const radarProfile = await loadRadarProfile();
  documents.push(
    buildSyntheticDocument(
      "synthetic/radar-profile",
      "Current Radar Profile",
      [
        summarizeRadarProfile(radarProfile),
        summarizeRadarProfileFocus(radarProfile),
      ].join("\n"),
    ),
  );
  documents.push(...await buildSyntheticRuntimeDocuments());

  return documents;
}
