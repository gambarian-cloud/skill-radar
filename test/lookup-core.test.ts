import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { collectMatches, findCorpusMatches, findSkillCatalogMatches, renderLookup, runLookup } from "../src/lookup-core.ts";
import { buildRadarProfile, saveRadarProfile } from "../src/config/radar-profile.ts";
import type { CorpusDocument } from "../src/types.ts";

test("findSkillCatalogMatches ranks worktree skill for codex queries", () => {
  const matches = findSkillCatalogMatches("git worktrees", "codex", 5);

  assert.equal(matches[0]?.entry.id, "using-git-worktrees");
  assert.ok(matches.some((match) => match.entry.id === "using-git-worktrees"));
});

test("findSkillCatalogMatches respects compatibility filters", () => {
  const matches = findSkillCatalogMatches("mcp", "codex", 5);

  assert.ok(matches.every((match) => match.entry.id !== "mcp-cli"));
});

test("findSkillCatalogMatches surfaces slides for presentation-oriented queries", () => {
  const matches = findSkillCatalogMatches("presentations slides decks", "codex", 5);

  assert.equal(matches[0]?.entry.id, "slides");
});

test("findSkillCatalogMatches surfaces deep-research for synthesis-oriented queries", () => {
  const matches = findSkillCatalogMatches("deep research synthesis compare reports", undefined, 5);

  assert.equal(matches[0]?.entry.id, "deep-research");
});

test("findSkillCatalogMatches surfaces code-review for review-oriented queries", () => {
  const matches = findSkillCatalogMatches("code review regressions diff", undefined, 5);

  assert.equal(matches[0]?.entry.id, "code-review");
});

test("findSkillCatalogMatches surfaces copywriting for messaging-oriented queries", () => {
  const matches = findSkillCatalogMatches("copywriting landing page headline CTA messaging", undefined, 5);

  assert.equal(matches[0]?.entry.id, "copywriting");
});

test("collectMatches does not treat rebuilding as the same token as build", () => {
  const matches = collectMatches(["rebuilding tool baseline"], ["build"]);

  assert.deepEqual(matches, []);
});

test("findSkillCatalogMatches does not let baseline setup dominate website preset queries", () => {
  const matches = findSkillCatalogMatches("build websites preset", "codex", 5);

  assert.notEqual(matches[0]?.entry.id, "agent-baseline-onboarding");
  assert.ok(matches.some((match) => match.entry.id === "playwright" || match.entry.id === "vercel-deploy"));
});

test("findCorpusMatches returns relevant local evidence with snippets", () => {
  const corpus: CorpusDocument[] = [
    {
      id: "reports/research/memory.md",
      kind: "research-note",
      path: "reports/research/memory.md",
      title: "Agent Memory Notes",
      text: "Agent memory patterns for Codex and Claude Code should stay small, layered, and reusable.",
    },
    {
      id: "reports/daily/noise.md",
      kind: "daily-digest",
      path: "reports/daily/noise.md",
      title: "Daily Noise",
      text: "Random unrelated item about social chatter.",
    },
  ];

  const matches = findCorpusMatches(corpus, "agent memory", 3);

  assert.equal(matches[0]?.document.title, "Agent Memory Notes");
  assert.match(matches[0]?.snippet ?? "", /Agent memory patterns/i);
});

test("findCorpusMatches prefers current-state and current-research evidence over stale notes", () => {
  const corpus: CorpusDocument[] = [
    {
      id: "reports/research/old-baseline.md",
      kind: "research-note",
      path: "reports/research/old-baseline.md",
      title: "Old Baseline Note",
      text: "Old baseline note mentions baseline, mcp, stop hook, and codex once.",
    },
    {
      id: "Research/current-baseline-review.md",
      kind: "research-note",
      path: "Research/current-baseline-review.md",
      title: "Current Baseline Review",
      text: "Current baseline review covers baseline, mcp, stop hook, and codex with fresh decisions.",
    },
    {
      id: "synthetic/agent-baseline",
      kind: "project-doc",
      path: "synthetic/agent-baseline",
      title: "Current Agent Baseline",
        text: "Current shared Codex and Claude baseline includes stop hook, GitHub MCP, Context7, and Sequential Thinking.",
      },
    ];

  const matches = findCorpusMatches(corpus, "baseline mcp stop hook codex", 3);

  assert.equal(matches[0]?.document.title, "Current Agent Baseline");
  assert.equal(matches[1]?.document.title, "Current Baseline Review");
});

test("findCorpusMatches prefers synthetic current project status over older notes", () => {
  const corpus: CorpusDocument[] = [
    {
      id: "reports/research/archive-status.md",
      kind: "research-note",
      path: "reports/research/archive-status.md",
      title: "Archived Status Note",
      text: "Archived note mentions next step once, but not the current project read.",
    },
    {
      id: "Research/current-status-review.md",
      kind: "research-note",
      path: "Research/current-status-review.md",
      title: "Current Status Review",
      text: "Current status review mentions project status and next step with fresh language.",
    },
    {
      id: "synthetic/project-status",
      kind: "project-doc",
      path: "synthetic/project-status",
      title: "Current Project Status",
      text: "Current project read: baseline is stable and lookup/use-layer depth is the main unfinished product layer.",
    },
  ];

  const matches = findCorpusMatches(corpus, "project status next step", 3);

  assert.equal(matches[0]?.document.title, "Current Project Status");
  assert.equal(matches[1]?.document.title, "Current Status Review");
});

test("findCorpusMatches prefers synthetic creator lens over static preset notes", () => {
  const corpus: CorpusDocument[] = [
    {
      id: "radar-presets/lenses/creator.md",
      kind: "project-doc",
      path: "radar-presets/lenses/creator.md",
      title: "Creator Lens",
      text: "Creator lens pushes the radar toward content pipelines, storytelling, decks, and publishing loops.",
    },
    {
      id: "Research/radar-presets-deep-research-2026-03-11.md",
      kind: "research-note",
      path: "Research/radar-presets-deep-research-2026-03-11.md",
      title: "Radar Presets Deep Research",
      text: "Creator is the strongest candidate for the first non-dev lens expansion.",
    },
    {
      id: "synthetic/radar-lens-creator",
      kind: "project-doc",
      path: "synthetic/radar-lens-creator",
      title: "Creator Domain Lens",
      text: "Creator: Tune the core radar toward content systems, storytelling, design, browser review, publishing loops, and repurposing workflows. Strongest overlap -> Make Presentations, Build Websites, Research & Writing, Automate Work; adopt now -> playwright, vercel-deploy, slides.",
    },
  ];

  const matches = findCorpusMatches(corpus, "creator lens publishing workflows", 3);

  assert.equal(matches[0]?.document.title, "Creator Domain Lens");
});

test("renderLookup adds a quick current-state summary when synthetic docs match", () => {
  const output = renderLookup(
    {
      query: "baseline mcp stop hook",
      limit: 6,
      tool: "codex",
      write: false,
    },
    {
      catalogMatches: findSkillCatalogMatches("baseline mcp stop hook", "codex", 3),
      corpusMatches: [
        {
          document: {
            id: "synthetic/agent-baseline",
            kind: "project-doc",
            path: "synthetic/agent-baseline",
            title: "Current Agent Baseline",
            text: "Current shared Codex and Claude baseline.",
          },
          score: 100,
          reasons: ["current state"],
          snippet: "Current shared Codex and Claude baseline.",
        },
      ],
    },
  );

  assert.match(output, /## Quick Read/);
  assert.match(output, /Current baseline:/);
  assert.match(output, /Top skill match:/);
});

test("renderLookup adds project-status summary when current status evidence matches", () => {
  const output = renderLookup(
    {
      query: "project status next step",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: findSkillCatalogMatches("project status next step", undefined, 3),
      corpusMatches: [
        {
          document: {
            id: "synthetic/project-status",
            kind: "project-doc",
            path: "synthetic/project-status",
            title: "Current Project Status",
            text: "Current project read: baseline is stable, lookup now covers current config plus latest digest and audit evidence, and the remaining active work is measured source retune rather than a missing product layer.",
          },
          score: 110,
          reasons: ["current state"],
          snippet: "Current project read: baseline is stable, lookup now covers current config plus latest digest and audit evidence, and the remaining active work is measured source retune rather than a missing product layer.",
        },
        {
          document: {
            id: "Research/project-status-2026-03-09.md",
            kind: "research-note",
            path: "Research/project-status-2026-03-09.md",
            title: "Signal Scout — Project Status",
            text: "Current project status and next recommended step.",
          },
          score: 100,
          reasons: ["current research"],
          snippet: "Current project status and next recommended step.",
        },
        {
          document: {
            id: "reports/research/2026-03-09-source-audit-history.md",
            kind: "research-note",
            path: "reports/research/2026-03-09-source-audit-history.md",
            title: "Signal Scout Source Audit History",
            text: "Source tuning is in measurement mode.",
          },
          score: 90,
          reasons: ["text"],
          snippet: "Source tuning is in measurement mode.",
        },
      ],
    },
  );

  assert.match(output, /Current project read:/);
  assert.match(output, /lookup now covers current config plus latest digest and audit evidence/i);
  assert.match(output, /Current source read:/);
});

test("renderLookup adds latest radar evidence when synthetic evidence docs match", () => {
  const output = renderLookup(
    {
      query: "evidence corroboration action quality",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-radar-evidence",
            kind: "project-doc",
            path: "synthetic/current-radar-evidence",
            title: "Current Radar Evidence",
            text: "Latest radar evidence: actionable 10; kept 16; artifact-backed 5; discussion-only 5; corroborated 2 (1 origin-confirmed, 1 scout-overlap).",
          },
          score: 110,
          reasons: ["current state"],
          snippet: "Latest radar evidence: actionable 10; kept 16; artifact-backed 5; discussion-only 5; corroborated 2 (1 origin-confirmed, 1 scout-overlap).",
        },
        {
          document: {
            id: "synthetic/current-cadence-evidence",
            kind: "project-doc",
            path: "synthetic/current-cadence-evidence",
            title: "Current Cadence Evidence",
            text: "Latest cadence evidence: daily-viable -> GitHub Live Only, Reddit Live Only; slower-cadence -> HN Live Only; cold -> Telegram Pavlenko Only.",
          },
          score: 100,
          reasons: ["current state"],
          snippet: "Latest cadence evidence: daily-viable -> GitHub Live Only, Reddit Live Only; slower-cadence -> HN Live Only; cold -> Telegram Pavlenko Only.",
        },
      ],
    },
  );

  assert.match(output, /Latest radar evidence:/);
  assert.match(output, /Latest cadence evidence:/);
});

test("renderLookup adds current do-today queue when synthetic action docs match", () => {
  const output = renderLookup(
    {
      query: "what should I do today",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-do-today-queue",
            kind: "project-doc",
            path: "synthetic/current-do-today-queue",
            title: "Current Do Today Queue",
            text: "Current do-today queue: 2 item(s). Top actions -> Review openai/codex today for Volcker Copilot; Review Agent workflow pattern today for Volcker Copilot.\nBuilt from latest digest: reports/daily/2026-03-09.md.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current do-today queue: 2 item(s). Top actions -> Review openai/codex today for Volcker Copilot; Review Agent workflow pattern today for Volcker Copilot.",
        },
      ],
    },
  );

  assert.match(output, /Current do-today queue:/i);
  assert.match(output, /Review openai\/codex today/i);
});

test("renderLookup adds current repo evidence quick read when synthetic repo evidence doc matches", () => {
  const output = renderLookup(
    {
      query: "repo evidence openai codex",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-repo-evidence",
            kind: "project-doc",
            path: "synthetic/current-repo-evidence",
            title: "Current Repo Evidence",
            text: "Current repo evidence read: openai/codex; 64130 stars, 8546 forks, 1753 open issues, 388 subscribers; last push 2026-03-09; latest release rust-v0.112.0 on 2026-03-08.\nBuilt from latest digest: reports/daily/2026-03-09.md.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current repo evidence read: openai/codex; 64130 stars, 8546 forks, 1753 open issues, 388 subscribers; last push 2026-03-09; latest release rust-v0.112.0 on 2026-03-08.",
        },
      ],
    },
  );

  assert.match(output, /Current repo evidence read:/i);
  assert.match(output, /openai\/codex/i);
  assert.match(output, /64130 stars/i);
});

test("renderLookup adds current source trend quick read when synthetic source trend doc matches", () => {
  const output = renderLookup(
    {
      query: "source trend actionable",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-source-trends",
            kind: "project-doc",
            path: "synthetic/current-source-trends",
            title: "Current Source Trends",
            text: "Current source trend read: GitHub Live Only: latest 24h actionable 4; 3-cycle drift up Reddit Live Only: latest 24h actionable 4; 3-cycle drift flat Telegram Vibe Only: latest 24h actionable 5; 3-cycle drift up.\nBuilt from latest report: reports/research/2026-03-11-source-audit-history.md.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current source trend read: GitHub Live Only: latest 24h actionable 4; 3-cycle drift up Reddit Live Only: latest 24h actionable 4; 3-cycle drift flat Telegram Vibe Only: latest 24h actionable 5; 3-cycle drift up.",
        },
      ],
    },
  );

  assert.match(output, /Current source trend read:/i);
  assert.match(output, /GitHub Live Only/i);
  assert.match(output, /actionable 4/i);
});

test("renderLookup adds preset-specific quick read when a lens matches", () => {
  const output = renderLookup(
    {
      query: "creator lens publishing workflows",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/radar-lens-creator",
            kind: "project-doc",
            path: "synthetic/radar-lens-creator",
            title: "Creator Domain Lens",
            text: "Creator: Tune the core radar toward content systems, storytelling, design, browser review, publishing loops, and repurposing workflows.\nSignals to track: content pipelines, story and deck workflows.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Creator: Tune the core radar toward content systems, storytelling, design, browser review, publishing loops, and repurposing workflows.",
        },
        {
          document: {
            id: "synthetic/radar-presets",
            kind: "project-doc",
            path: "synthetic/radar-presets",
            title: "Current Radar Preset Model",
            text: "Current preset model for Signal Scout.",
          },
          score: 100,
          reasons: ["current state"],
          snippet: "Current preset model for Signal Scout.",
        },
      ],
    },
  );

  assert.match(output, /Creator: Tune the core radar toward content systems/i);
  assert.match(output, /Current preset detail read:/i);
});

test("renderLookup adds core capability quick read when a capability matches", () => {
  const output = renderLookup(
    {
      query: "build websites preset",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/radar-core-build-websites",
            kind: "project-doc",
            path: "synthetic/radar-core-build-websites",
            title: "Build Websites Core Capability",
            text: "Build Websites: Monitor website-building workflows, frontend delivery patterns, browser checking, deploy loops, and UI polish practices. Adopt now -> react-best-practices, playwright, vercel-deploy; experiment -> web-design-guidelines.\nWhy always on: A large share of fresh users quickly try to ship a site.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Build Websites: Monitor website-building workflows, frontend delivery patterns, browser checking, deploy loops, and UI polish practices. Adopt now -> react-best-practices, playwright, vercel-deploy; experiment -> web-design-guidelines.",
        },
        {
          document: {
            id: "synthetic/radar-presets",
            kind: "project-doc",
            path: "synthetic/radar-presets",
            title: "Current Radar Preset Model",
            text: "Current preset model for Signal Scout.",
          },
          score: 100,
          reasons: ["current state"],
          snippet: "Current preset model for Signal Scout.",
        },
      ],
    },
  );

  assert.match(output, /Build Websites: Monitor website-building workflows/i);
  assert.match(output, /Current preset read:/i);
});

test("renderLookup adds current recommendation when synthetic recommendation doc matches", () => {
  const output = renderLookup(
    {
      query: "next move recommendation",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-recommendations",
            kind: "project-doc",
            path: "synthetic/current-recommendations",
            title: "Current Product Recommendation",
            text: "Current recommendation: keep the current product shape stable and let the measurement timers run; the latest run is mostly artifact-backed (6 vs 3 discussion-only). Next decision gate: r/ChatGPTCoding: short-probation; 3/3 cycle(s), 1 actionable, 0 artifact-backed.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current recommendation: keep the current product shape stable and let the measurement timers run; the latest run is mostly artifact-backed (6 vs 3 discussion-only). Next decision gate: r/ChatGPTCoding: short-probation; 3/3 cycle(s), 1 actionable, 0 artifact-backed.",
        },
      ],
    },
  );

  assert.match(output, /Current recommendation:/);
  assert.match(output, /keep the current product shape stable/i);
  assert.match(output, /Next decision gate:/);
});

test("renderLookup adds current retune status when synthetic retune doc matches", () => {
  const output = renderLookup(
    {
      query: "reddit probation watch status",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/current-retune-status",
            kind: "project-doc",
            path: "synthetic/current-retune-status",
            title: "Current Reddit and Source Retune Status",
            text: "Current Reddit and source retune status: r/ClaudeAI: core; 2 cycle(s) seen, 6 actionable total. r/LLMDevs: probation; 2/5 cycle(s), 3 actionable, 0 artifact-backed. r/ChatGPTCoding: short-probation; 2/3 cycle(s), 1 actionable, 0 artifact-backed.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current Reddit and source retune status: r/ClaudeAI: core; 2 cycle(s) seen, 6 actionable total.",
        },
      ],
    },
  );

  assert.match(output, /Current Reddit and source retune status:/);
  assert.match(output, /r\/LLMDevs: probation/i);
  assert.match(output, /r\/ChatGPTCoding: short-probation/i);
});

test("findCorpusMatches prefers synthetic radar preset model over older preset notes", () => {
  const corpus: CorpusDocument[] = [
    {
      id: "Research/preset-notes.md",
      kind: "research-note",
      path: "Research/preset-notes.md",
      title: "Preset Notes",
      text: "Education, gaming, and creator ideas exist, but this note is older and less current.",
    },
    {
      id: "synthetic/radar-presets",
      kind: "project-doc",
      path: "synthetic/radar-presets",
      title: "Current Radar Preset Model",
      text: "Current radar preset model: always-on capabilities -> Build Websites, Build Apps, Make Presentations, Research & Writing, Automate Work; optional domain lenses -> Education, History, Gaming, Business, Sports, Family, Creator.",
    },
  ];

  const matches = findCorpusMatches(corpus, "creator education gaming preset", 2);

  assert.equal(matches[0]?.document.title, "Current Radar Preset Model");
});

test("renderLookup adds preset quick read when synthetic preset model matches", () => {
  const output = renderLookup(
    {
      query: "creator lens preset",
      limit: 6,
      write: false,
    },
    {
      catalogMatches: [],
      corpusMatches: [
        {
          document: {
            id: "synthetic/radar-presets",
            kind: "project-doc",
            path: "synthetic/radar-presets",
            title: "Current Radar Preset Model",
            text: "Current radar preset model: always-on capabilities -> Build Websites, Build Apps, Make Presentations, Research & Writing, Automate Work; optional domain lenses -> Education, History, Gaming, Business, Sports, Family, Creator.",
          },
          score: 120,
          reasons: ["current state"],
          snippet: "Current radar preset model: always-on capabilities -> Build Websites, Build Apps, Make Presentations, Research & Writing, Automate Work; optional domain lenses -> Education, History, Gaming, Business, Sports, Family, Creator.",
        },
      ],
    },
  );

  assert.match(output, /Current preset read:/);
  assert.match(output, /optional domain lenses/i);
});

test("runLookup boosts preset decision-box skills for website preset queries", async () => {
  const result = await runLookup({
    query: "build websites preset",
    tool: "codex",
    limit: 6,
    write: false,
  });

  assert.ok(["playwright", "vercel-deploy", "react-best-practices", "slides"].includes(result.catalogMatches[0]?.entry.id ?? ""));
});

test("runLookup uses the saved radar profile to boost matching lens evidence", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "skill-radar-lookup-profile-"));
  const profilePath = join(tempRoot, "skill-radar-profile.json");
  const previous = process.env.SKILL_RADAR_PROFILE_PATH;
  process.env.SKILL_RADAR_PROFILE_PATH = profilePath;

  try {
    await saveRadarProfile(buildRadarProfile(["creator"], "balanced", "2026-03-11T12:00:00.000Z"));

    const result = await runLookup({
      query: "content pipelines deck workflows",
      tool: "codex",
      limit: 6,
      write: false,
    });
    const output = renderLookup(
      {
        query: "content pipelines deck workflows",
        tool: "codex",
        limit: 6,
        write: false,
      },
      result,
    );

    assert.equal(result.corpusMatches[0]?.document.path, "synthetic/radar-lens-creator");
    assert.match(output, /Current radar profile:/);
    assert.match(output, /Creator/i);
  } finally {
    if (previous === undefined) {
      delete process.env.SKILL_RADAR_PROFILE_PATH;
    } else {
      process.env.SKILL_RADAR_PROFILE_PATH = previous;
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("runLookup surfaces the current do-today queue for action queries", async () => {
  const result = await runLookup({
    query: "what should I do today",
    limit: 6,
    write: false,
  });
  const output = renderLookup(
    {
      query: "what should I do today",
      limit: 6,
      write: false,
    },
    result,
  );

  assert.match(output, /Current do-today queue:/i);
  assert.ok(result.corpusMatches.some((match) => match.document.path === "synthetic/current-do-today-queue"));
});

test("runLookup surfaces current repo evidence for repo evidence queries", async () => {
  const result = await runLookup({
    query: "repo evidence openai codex",
    limit: 6,
    write: false,
  });
  const output = renderLookup(
    {
      query: "repo evidence openai codex",
      limit: 6,
      write: false,
    },
    result,
  );

  assert.match(output, /Current repo evidence read:/i);
  assert.ok(result.corpusMatches.some((match) => match.document.path === "synthetic/current-repo-evidence"));
});

test("runLookup surfaces current source trends for trend queries", async () => {
  const result = await runLookup({
    query: "source trend actionable",
    limit: 6,
    write: false,
  });
  const output = renderLookup(
    {
      query: "source trend actionable",
      limit: 6,
      write: false,
    },
    result,
  );

  assert.match(output, /Current source trend read:/i);
  assert.ok(result.corpusMatches.some((match) => match.document.path === "synthetic/current-source-trends"));
});
