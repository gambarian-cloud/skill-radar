export type RadarCoreCapabilityId =
  | "build-websites"
  | "build-apps"
  | "make-presentations"
  | "research-writing"
  | "automate-work";

export type RadarLensId =
  | "education"
  | "history"
  | "gaming"
  | "business"
  | "sports"
  | "family"
  | "creator";

export type RadarSignalClass = "official" | "community" | "marketplace" | "catalog" | "workflow";
export type RadarDecisionClass = "adopt-now" | "experiment" | "watch" | "reject";

export interface RadarSourceOfTruth {
  label: string;
  url: string;
  class: RadarSignalClass;
  whyTrack: string;
}

export interface RadarDecisionItem {
  label: string;
  type: "skill" | "mcp" | "hook" | "workflow" | "ecosystem";
  decision: RadarDecisionClass;
  why: string;
}

export interface RadarCoreCapabilityDefinition {
  id: RadarCoreCapabilityId;
  label: string;
  summary: string;
  whyAlwaysOn: string;
  signalsToTrack: string[];
  sourcesOfTruth: RadarSourceOfTruth[];
  decisions: RadarDecisionItem[];
}

export interface RadarLensDefinition {
  id: RadarLensId;
  label: string;
  summary: string;
  outputBias: RadarCoreCapabilityId[];
  signalsToTrack: string[];
  officialSources: RadarSourceOfTruth[];
  scoutSources: RadarSourceOfTruth[];
  decisions: RadarDecisionItem[];
  dedupeNotes: string[];
}

function formatDecisionLine(item: RadarDecisionItem): string {
  return `${item.label} (${item.type}) -> ${item.decision}: ${item.why}`;
}

function formatSourceLine(source: RadarSourceOfTruth): string {
  return `${source.label} [${source.class}] - ${source.whyTrack}`;
}

export const RADAR_CORE_CAPABILITIES: RadarCoreCapabilityDefinition[] = [
  {
    id: "build-websites",
    label: "Build Websites",
    summary: "Monitor website-building workflows, frontend delivery patterns, browser checking, deploy loops, and UI polish practices.",
    whyAlwaysOn: "A large share of fresh Codex and Claude Code users quickly try to ship a site, landing page, or frontend proof-of-concept.",
    signalsToTrack: [
      "frontend workflow skills",
      "browser-check and visual QA patterns",
      "preview and deploy loops",
      "design-to-code guidance",
      "landing-page copy and CTA workflows",
      "React and Next.js implementation patterns",
    ],
    sourcesOfTruth: [
      {
        label: "Vercel AI SDK and platform docs",
        url: "https://vercel.com/docs",
        class: "official",
        whyTrack: "Source of truth for modern frontend deploy and preview patterns.",
      },
      {
        label: "vercel-labs/agent-skills",
        url: "https://github.com/vercel-labs/agent-skills",
        class: "community",
        whyTrack: "Strong shared source for frontend-oriented skills and workflows.",
      },
      {
        label: "playwright skill",
        url: "C:/Users/MI/.codex/skills/playwright/SKILL.md",
        class: "workflow",
        whyTrack: "Real local browser automation workflow already proven in our setup.",
      },
    ],
    decisions: [
      {
        label: "react-best-practices",
        type: "skill",
        decision: "adopt-now",
        why: "Directly relevant to the first real website use-case and already in the starter-pack builder lane.",
      },
      {
        label: "playwright",
        type: "skill",
        decision: "adopt-now",
        why: "Browser checking and UI verification now look baseline-relevant, not optional polish.",
      },
      {
        label: "vercel-deploy",
        type: "skill",
        decision: "adopt-now",
        why: "Preview and deploy loops are part of first-project usefulness for beginners building sites.",
      },
      {
        label: "web-design-guidelines",
        type: "skill",
        decision: "experiment",
        why: "Strong signal from Starter Pack product pressure, but still needs stable local packaging and evals.",
      },
      {
        label: "copywriting",
        type: "skill",
        decision: "adopt-now",
        why: "A website without clear value prop, CTA, and structure is still a weak first-project outcome.",
      },
    ],
  },
  {
    id: "build-apps",
    label: "Build Apps",
    summary: "Monitor small-app scaffolds, implementation discipline, test loops, packaging, and practical agent-assisted app construction.",
    whyAlwaysOn: "The other default beginner move after a website is to build a simple app, script, or local tool.",
    signalsToTrack: [
      "scaffold and implementation workflows",
      "test-driven loops for autonomous changes",
      "packaging and deployment patterns",
      "safe edit-run-debug cycles",
    ],
    sourcesOfTruth: [
      {
        label: "openai/skills",
        url: "https://github.com/openai/skills",
        class: "official",
        whyTrack: "Codex-native implementation and repo workflow references.",
      },
      {
        label: "obra/superpowers",
        url: "https://github.com/obra/superpowers",
        class: "community",
        whyTrack: "Proven source for debugging, TDD, worktrees, and execution discipline.",
      },
    ],
    decisions: [
      {
        label: "test-driven-development",
        type: "skill",
        decision: "adopt-now",
        why: "Small app work benefits immediately from tighter safety and regression control.",
      },
      {
        label: "systematic-debugging",
        type: "skill",
        decision: "adopt-now",
        why: "Core protection against random edits remains central for app building.",
      },
      {
        label: "code-review",
        type: "skill",
        decision: "adopt-now",
        why: "Completed app and website passes still need a structured review layer before we trust them.",
      },
      {
        label: "gh-fix-ci",
        type: "workflow",
        decision: "watch",
        why: "Useful later when CI is a repeated pain, but too advanced for day-one beginner flows.",
      },
    ],
  },
  {
    id: "make-presentations",
    label: "Make Presentations",
    summary: "Monitor slide-making workflows, deck-generation tools, research-to-deck pipelines, and visual communication systems.",
    whyAlwaysOn: "Presentations turned out to be a real first-project output, not a side case, once we followed beginner product pressure.",
    signalsToTrack: [
      "slides and deck skills",
      "story structuring workflows",
      "research-to-presentation patterns",
      "template and narrative systems",
    ],
    sourcesOfTruth: [
      {
        label: "Codex slides skill",
        url: "C:/Users/MI/.codex/skills/.system/slides/SKILL.md",
        class: "workflow",
        whyTrack: "Local built-in evidence that deck work is a first-class capability surface.",
      },
      {
        label: "Gamma",
        url: "https://gamma.app/",
        class: "official",
        whyTrack: "Modern presentation workflow pressure and strong real-world adoption.",
      },
      {
        label: "Canva Developers",
        url: "https://www.canva.dev/",
        class: "official",
        whyTrack: "Important source of truth for visual-output tooling and template ecosystems.",
      },
    ],
    decisions: [
      {
        label: "slides",
        type: "skill",
        decision: "adopt-now",
        why: "Already available locally and directly aligned with the capability area.",
      },
      {
        label: "screenshot",
        type: "skill",
        decision: "experiment",
        why: "Useful for deck QA and visual capture, but not required for every presentation flow.",
      },
      {
        label: "PowerPoint/document-output ecosystems",
        type: "ecosystem",
        decision: "adopt-now",
        why: "This capability area now deserves explicit catalog coverage, not hidden side treatment.",
      },
    ],
  },
  {
    id: "research-writing",
    label: "Research & Writing",
    summary: "Monitor synthesis workflows, source evaluation, long-form writing systems, note pipelines, and citation-aware research patterns.",
    whyAlwaysOn: "Even non-build users often start by asking the tools to research, organize, and write something useful.",
    signalsToTrack: [
      "synthesis and summarization workflows",
      "citation and source-quality methods",
      "note-to-draft pipelines",
      "long-context research systems",
    ],
    sourcesOfTruth: [
      {
        label: "NotebookLM",
        url: "https://notebooklm.google/",
        class: "official",
        whyTrack: "Strong official signal for source-grounded synthesis workflows.",
      },
      {
        label: "Zotero support docs",
        url: "https://www.zotero.org/support/",
        class: "official",
        whyTrack: "Canonical source for citation and research workflow patterns.",
      },
      {
        label: "Obsidian help",
        url: "https://help.obsidian.md/",
        class: "official",
        whyTrack: "Large ecosystem for note systems and research knowledge management.",
      },
    ],
    decisions: [
      {
        label: "research-to-draft workflows",
        type: "workflow",
        decision: "adopt-now",
        why: "This is a core output category even for users who are not building software first.",
      },
      {
        label: "citation-aware research patterns",
        type: "workflow",
        decision: "experiment",
        why: "Very important for some lenses, but we need better current packaging than generic prompt dumps.",
      },
      {
        label: "deep-research",
        type: "skill",
        decision: "adopt-now",
        why: "Research and writing now clearly needs a dedicated synthesis workflow inside the product, not a separate off-product habit.",
      },
    ],
  },
  {
    id: "automate-work",
    label: "Automate Work",
    summary: "Monitor repeatable automations, connectors, integrations, agent loops, and safe operational workflows.",
    whyAlwaysOn: "Once a user gets one small win, the next desire is usually to automate repeated work.",
    signalsToTrack: [
      "automation workflows",
      "connector and MCP ecosystems",
      "repeatable agent task patterns",
      "safe read-only integrations",
    ],
    sourcesOfTruth: [
      {
        label: "awesome-mcp-servers",
        url: "https://github.com/punkpeye/awesome-mcp-servers",
        class: "catalog",
        whyTrack: "Broad discovery layer for MCP servers and connectors.",
      },
      {
        label: "Context7 MCP",
        url: "https://github.com/upstash/context7",
        class: "official",
        whyTrack: "Proof that small, safe MCP wins can be beginner-useful early.",
      },
      {
        label: "GitHub MCP read-only",
        url: "https://docs.github.com/en/copilot/how-tos/context/model-context-protocol/using-the-github-mcp-server",
        class: "official",
        whyTrack: "Read-only operational automation baseline with clear trust boundaries.",
      },
    ],
    decisions: [
      {
        label: "Context7",
        type: "mcp",
        decision: "adopt-now",
        why: "Strong, low-risk baseline automation/value tradeoff.",
      },
      {
        label: "Sequential Thinking",
        type: "mcp",
        decision: "adopt-now",
        why: "High value reasoning aid without widening write permissions.",
      },
      {
        label: "GitHub MCP read-only",
        type: "mcp",
        decision: "adopt-now",
        why: "Safe first connector with real utility.",
      },
      {
        label: "write-capable MCP bundles",
        type: "mcp",
        decision: "reject",
        why: "Too risky for default radar promotion and beginner-first recommendations.",
      },
    ],
  },
];

export const RADAR_DOMAIN_LENSES: RadarLensDefinition[] = [
  {
    id: "education",
    label: "Education",
    summary: "Tune the core radar toward teaching, tutoring, lesson planning, explanation quality, and safe beginner learning workflows.",
    outputBias: ["research-writing", "make-presentations", "automate-work"],
    signalsToTrack: [
      "lesson and curriculum generation",
      "teaching decks and worksheets",
      "beginner-safe explanation patterns",
      "classroom or tutoring workflow systems",
      "spaced repetition and flashcard workflows",
      "quiz and assessment automation",
      "LMS integration patterns (Canvas, Classroom, Brightspace)",
      "rubric and grading automation",
    ],
    officialSources: [
      {
        label: "OpenAI Education",
        url: "https://openai.com/education/",
        class: "official",
        whyTrack: "Official reference for education-facing AI use and policy signals.",
      },
      {
        label: "Khanmigo",
        url: "https://www.khanacademy.org/khan-labs",
        class: "official",
        whyTrack: "High-signal example of education-specific AI workflow pressure.",
      },
      {
        label: "NotebookLM",
        url: "https://notebooklm.google/",
        class: "official",
        whyTrack: "Useful for source-grounded lesson and explanation workflows.",
      },
      {
        label: "Google Classroom API",
        url: "https://developers.google.com/classroom",
        class: "official",
        whyTrack: "REST API for courses, assignments, grades. Massive install base.",
      },
      {
        label: "Canvas LMS API",
        url: "https://canvas.instructure.com/doc/api/",
        class: "official",
        whyTrack: "Full REST API. Dominant university LMS.",
      },
      {
        label: "MagicSchool AI",
        url: "https://www.magicschool.ai/",
        class: "official",
        whyTrack: "80+ AI tools for teachers. Largest educator AI platform.",
      },
    ],
    scoutSources: [
      {
        label: "education AI workflow communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Good place to watch for lesson, writing, and explanation workflow skills.",
      },
      {
        label: "r/teachingwithAI",
        url: "https://www.reddit.com/r/teachingwithAI/",
        class: "community",
        whyTrack: "Real practitioner workflows from teachers.",
      },
      {
        label: "Anki MCP ecosystem",
        url: "https://github.com/nailuoGG/anki-mcp-server",
        class: "community",
        whyTrack: "230+ stars. Spaced repetition via MCP.",
      },
    ],
    decisions: [
      {
        label: "presentations baseline",
        type: "workflow",
        decision: "adopt-now",
        why: "Education often turns research into decks, worksheets, or simple teaching assets.",
      },
      {
        label: "lesson-plan and tutoring packs",
        type: "workflow",
        decision: "experiment",
        why: "Useful, but quality varies wildly and needs trusted-source filtering.",
      },
      {
        label: "classroom-safe policy overlays",
        type: "hook",
        decision: "watch",
        why: "Potentially valuable, but policy and safety surface is wider than the current baseline.",
      },
      {
        label: "Anki MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "230 stars, 11 tools, TypeScript, Claude compatible. Spaced repetition is evidence-backed.",
      },
      {
        label: "Runno code sandbox",
        type: "mcp",
        decision: "adopt-now",
        why: "761 stars, MCP integration, 7 languages. Eliminates setup for teaching code.",
      },
      {
        label: "EduMCPServer",
        type: "mcp",
        decision: "experiment",
        why: "8 stars but real LMS operations via Microsoft Graph API.",
      },
      {
        label: "Brightspace MCP",
        type: "mcp",
        decision: "experiment",
        why: "6 stars but functional Brightspace LMS operations.",
      },
      {
        label: "quiz generation workflows",
        type: "workflow",
        decision: "experiment",
        why: "MagicSchool, Quizizz prove demand. Local structured quiz skill is baseline-useful.",
      },
    ],
    dedupeNotes: [
      "Strong overlap with Research & Writing and Make Presentations.",
      "Do not fork a separate baseline; treat as ranking and source overlay first.",
    ],
  },
  {
    id: "history",
    label: "History",
    summary: "Tune the core radar toward archival research, citations, timelines, long-form synthesis, and source credibility.",
    outputBias: ["research-writing", "make-presentations"],
    signalsToTrack: [
      "archive and bibliography workflows",
      "timeline building",
      "primary vs secondary source handling",
      "citation-aware synthesis",
    ],
    officialSources: [
      {
        label: "Zotero support docs",
        url: "https://www.zotero.org/support/",
        class: "official",
        whyTrack: "Canonical baseline for citations, libraries, and research discipline.",
      },
      {
        label: "Obsidian help",
        url: "https://help.obsidian.md/",
        class: "official",
        whyTrack: "Key ecosystem for note systems and knowledge graph workflows.",
      },
      {
        label: "Knight Lab TimelineJS",
        url: "https://timeline.knightlab.com/",
        class: "official",
        whyTrack: "Concrete timeline-output workflow for history and research storytelling.",
      },
    ],
    scoutSources: [
      {
        label: "research workflow communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Useful for tracking writing, summarization, and research pack patterns.",
      },
    ],
    decisions: [
      {
        label: "citation-aware research workflows",
        type: "workflow",
        decision: "adopt-now",
        why: "This is the real domain-specific delta, not generic identity tagging.",
      },
      {
        label: "timeline output packs",
        type: "workflow",
        decision: "experiment",
        why: "Looks useful but needs stronger current skill packaging evidence.",
      },
      {
        label: "archive ingest MCP",
        type: "mcp",
        decision: "watch",
        why: "Possible future opportunity, but not yet justified for a stable baseline.",
      },
    ],
    dedupeNotes: [
      "Heavy overlap with Education and Research & Writing.",
      "Treat history as a domain lens over research, not as a standalone baseline.",
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    summary: "Tune the core radar toward community-heavy workflows, game-adjacent content, modding, overlays, Discord/OBS, and game-dev starter paths.",
    outputBias: ["build-websites", "build-apps", "automate-work"],
    signalsToTrack: [
      "modding and overlay workflows",
      "Discord and community tool patterns",
      "OBS and streaming adjacencies",
      "Unity/Godot beginner app pipelines",
    ],
    officialSources: [
      {
        label: "Unity docs",
        url: "https://docs.unity.com/",
        class: "official",
        whyTrack: "Large official ecosystem for game-adjacent and real-time app workflows.",
      },
      {
        label: "Godot docs",
        url: "https://docs.godotengine.org/",
        class: "official",
        whyTrack: "Strong OSS ecosystem for accessible game and interactive app building.",
      },
      {
        label: "Discord Developers",
        url: "https://discord.com/developers/docs/intro",
        class: "official",
        whyTrack: "Community and bot automation are often central in gaming workflows.",
      },
    ],
    scoutSources: [
      {
        label: "creator and gamer workflow communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Good place to detect Discord, content, overlay, and creator workflow patterns.",
      },
    ],
    decisions: [
      {
        label: "playwright",
        type: "skill",
        decision: "experiment",
        why: "Useful for web-heavy gaming tools, overlays, and dashboard checks.",
      },
      {
        label: "creator-style content workflows",
        type: "workflow",
        decision: "adopt-now",
        why: "Gaming often blends build, community, and creator pipelines.",
      },
      {
        label: "game-engine-specific MCP bundles",
        type: "mcp",
        decision: "watch",
        why: "Worth monitoring, but not baseline-relevant yet.",
      },
    ],
    dedupeNotes: [
      "Gaming overlaps strongly with Creator for content and community tooling.",
      "Do not let game-dev engine ecosystems drown the beginner web/app core.",
    ],
  },
  {
    id: "business",
    label: "Business",
    summary: "Tune the core radar toward reporting, decks, lightweight internal tools, workflow automation, and founder/ops execution.",
    outputBias: ["make-presentations", "automate-work", "build-apps"],
    signalsToTrack: [
      "reporting and dashboard workflows",
      "presentation and memo systems",
      "ops automations",
      "internal tool and spreadsheet-adjacent patterns",
      "positioning and business copywriting workflows",
      "knowledge base and wiki management (Notion, Confluence)",
      "issue and project tracking (Jira, Linear, Todoist)",
      "multi-app orchestration (n8n, Zapier patterns)",
    ],
    officialSources: [
      {
        label: "Notion API docs",
        url: "https://developers.notion.com/",
        class: "official",
        whyTrack: "Major ecosystem for business knowledge, docs, and lightweight ops systems.",
      },
      {
        label: "HubSpot Developers",
        url: "https://developers.hubspot.com/",
        class: "official",
        whyTrack: "Strong CRM and ops ecosystem signal for business automation.",
      },
      {
        label: "Canva Developers",
        url: "https://www.canva.dev/",
        class: "official",
        whyTrack: "Presentation and reporting output often land here first.",
      },
      {
        label: "Atlassian MCP",
        url: "https://github.com/sooperset/mcp-atlassian",
        class: "community",
        whyTrack: "4.6K stars, 988 forks. De facto standard for Jira+Confluence.",
      },
      {
        label: "Google Workspace MCP",
        url: "https://github.com/taylorwilsdon/google_workspace_mcp",
        class: "community",
        whyTrack: "1.8K stars. Full Google suite.",
      },
      {
        label: "Google Sheets MCP",
        url: "https://github.com/xing5/mcp-google-sheets",
        class: "community",
        whyTrack: "731 stars. Focused Sheets + Drive server.",
      },
      {
        label: "n8n MCP",
        url: "https://github.com/leonardsellem/n8n-mcp-server",
        class: "community",
        whyTrack: "1.6K stars. Open-source Zapier.",
      },
      {
        label: "Salesforce MCP",
        url: "https://github.com/salesforcecli/mcp",
        class: "official",
        whyTrack: "Official from Salesforce CLI team. 306 stars.",
      },
    ],
    scoutSources: [
      {
        label: "business workflow and founder tool communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Practical source for ops, docs, and communication workflow patterns.",
      },
    ],
    decisions: [
      {
        label: "slides",
        type: "skill",
        decision: "adopt-now",
        why: "Business lens makes presentation output even more central.",
      },
      {
        label: "spreadsheets",
        type: "skill",
        decision: "experiment",
        why: "Likely useful, but not yet part of the stable baseline language in this repo.",
      },
      {
        label: "Notion MCP / connectors",
        type: "mcp",
        decision: "adopt-now",
        why: "Official, 4K stars. Core business knowledge base.",
      },
      {
        label: "copywriting",
        type: "skill",
        decision: "adopt-now",
        why: "Business users still need positioning, deck language, and clear product messaging, not only automations.",
      },
      {
        label: "Atlassian MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "4.6K stars, 988 forks. De facto standard for Jira+Confluence.",
      },
      {
        label: "Google Workspace MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "1.8K stars. Full Google suite covers ~80% of business user surface.",
      },
      {
        label: "Google Sheets MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "731 stars. Spreadsheet automation is the #1 business user need.",
      },
      {
        label: "n8n MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "1.6K stars. Open-source Zapier. Connects to everything.",
      },
      {
        label: "Salesforce MCP",
        type: "mcp",
        decision: "experiment",
        why: "Official, 306 stars. High value if user has Salesforce.",
      },
      {
        label: "Airtable MCP",
        type: "mcp",
        decision: "experiment",
        why: "430 stars. Popular with ops teams.",
      },
      {
        label: "Todoist MCP",
        type: "mcp",
        decision: "experiment",
        why: "377 stars. Task management bridge.",
      },
      {
        label: "Linear MCP",
        type: "mcp",
        decision: "experiment",
        why: "344 stars. Tech-adjacent project management.",
      },
      {
        label: "HubSpot MCP",
        type: "mcp",
        decision: "experiment",
        why: "116 stars. SMB CRM.",
      },
      {
        label: "n8n workflow builder",
        type: "mcp",
        decision: "experiment",
        why: "216 stars. Natural language workflow creation.",
      },
      {
        label: "Zapier MCP",
        type: "mcp",
        decision: "experiment",
        why: "8000+ app connections. Broad scope needs testing.",
      },
    ],
    dedupeNotes: [
      "Business overlaps with Presentations and Automate Work very strongly.",
      "Avoid turning business lens into a grab-bag of every SaaS integration.",
    ],
  },
  {
    id: "sports",
    label: "Sports",
    summary: "Tune the core radar toward stats tracking, schedule workflows, recap content, community updates, and simple dashboards.",
    outputBias: ["make-presentations", "automate-work", "research-writing"],
    signalsToTrack: [
      "stats and tracking dashboards",
      "schedule and recap workflows",
      "fan/community content systems",
      "team or event organization patterns",
    ],
    officialSources: [
      {
        label: "Hudl",
        url: "https://www.hudl.com/",
        class: "official",
        whyTrack: "Strong product signal for sports analysis and team workflows.",
      },
      {
        label: "Canva Developers",
        url: "https://www.canva.dev/",
        class: "official",
        whyTrack: "Useful for recap, stat card, and event communication outputs.",
      },
    ],
    scoutSources: [
      {
        label: "creator and dashboard workflow communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Good place to catch recap, dashboard, and lightweight automation patterns.",
      },
    ],
    decisions: [
      {
        label: "presentation + spreadsheet combos",
        type: "workflow",
        decision: "experiment",
        why: "Looks like the strongest sports-oriented output pattern, but not yet a strong default baseline.",
      },
      {
        label: "sports-specific MCP bundles",
        type: "mcp",
        decision: "watch",
        why: "Potentially useful later, but the current evidence is thinner than other lenses.",
      },
    ],
    dedupeNotes: [
      "Sports is currently more of an overlay on presentation, spreadsheet, and content workflows than a self-contained stack.",
    ],
  },
  {
    id: "family",
    label: "Family",
    summary: "Tune the core radar toward household organization, family planning, educational materials, and simple recurring automations.",
    outputBias: ["automate-work", "make-presentations", "research-writing"],
    signalsToTrack: [
      "household planning systems",
      "calendar and routine automations",
      "family educational materials",
      "shared docs and organization patterns",
    ],
    officialSources: [
      {
        label: "Todoist Developer docs",
        url: "https://developer.todoist.com/",
        class: "official",
        whyTrack: "Strong signal for planning and household workflow automation.",
      },
      {
        label: "Google Workspace / Calendar docs",
        url: "https://developers.google.com/workspace",
        class: "official",
        whyTrack: "Calendar and family scheduling workflows often land here.",
      },
      {
        label: "Notion API docs",
        url: "https://developers.notion.com/",
        class: "official",
        whyTrack: "Shared docs and lightweight family systems often use Notion-like stacks.",
      },
    ],
    scoutSources: [
      {
        label: "family ops and organization workflow communities",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Useful for catching practical planner and template workflows.",
      },
    ],
    decisions: [
      {
        label: "calendar and planner integrations",
        type: "workflow",
        decision: "experiment",
        why: "Practical and useful, but still too broad for stable baseline packaging.",
      },
      {
        label: "family-safe assistant overlays",
        type: "hook",
        decision: "watch",
        why: "Interesting, but not well-supported by current trusted-source evidence yet.",
      },
    ],
    dedupeNotes: [
      "Family overlaps with Education and Automate Work.",
      "Keep it lens-only for now; no separate baseline pack yet.",
    ],
  },
  {
    id: "creator",
    label: "Creator",
    summary: "Tune the core radar toward content systems, storytelling, design, browser review, publishing loops, and repurposing workflows.",
    outputBias: ["make-presentations", "build-websites", "research-writing", "automate-work"],
    signalsToTrack: [
      "content pipelines",
      "story and deck workflows",
      "visual design and review",
      "browser QA and publish loops",
      "content copy and messaging workflows",
      "repurposing from notes to deck to web output",
    ],
    officialSources: [
      {
        label: "Canva Developers",
        url: "https://www.canva.dev/",
        class: "official",
        whyTrack: "Strong official ecosystem for visual assets and creator output systems.",
      },
      {
        label: "Descript Help",
        url: "https://help.descript.com/",
        class: "official",
        whyTrack: "Strong official source for creator workflow pressure around audio/video/text transformation.",
      },
      {
        label: "Gamma",
        url: "https://gamma.app/",
        class: "official",
        whyTrack: "Presentation and story output now matters enough to count as creator baseline surface.",
      },
      {
        label: "Figma MCP",
        url: "https://github.com/GLips/Figma-Context-MCP",
        class: "community",
        whyTrack: "13.5K stars. Dominant design-to-code bridge.",
      },
      {
        label: "ElevenLabs MCP",
        url: "https://github.com/elevenlabs/elevenlabs-mcp",
        class: "official",
        whyTrack: "1.2K stars. Official TTS and voice cloning.",
      },
    ],
    scoutSources: [
      {
        label: "awesomeskills.dev creator-adjacent skills",
        url: "https://awesomeskills.dev/",
        class: "community",
        whyTrack: "Useful place to track content-research, website-building, and workflow patterns for creators.",
      },
      {
        label: "Starter Pack public release stream",
        url: "https://github.com/gambarian-cloud/codex-claude-code-starter-pack/releases",
        class: "workflow",
        whyTrack: "Our own product changes are now evidence that creator-adjacent capabilities are baseline-relevant earlier than expected.",
      },
      {
        label: "YouTube Transcript MCP",
        url: "https://github.com/kimtaeyoon83/mcp-server-youtube-transcript",
        class: "community",
        whyTrack: "492 stars. Competitor research, video-to-text repurposing.",
      },
    ],
    decisions: [
      {
        label: "playwright",
        type: "skill",
        decision: "adopt-now",
        why: "Browser checking and live visual review are creator-baseline capabilities now.",
      },
      {
        label: "vercel-deploy",
        type: "skill",
        decision: "adopt-now",
        why: "Publishing loop matters early for creator-facing projects.",
      },
      {
        label: "slides",
        type: "skill",
        decision: "adopt-now",
        why: "Creator workflows often move through decks and structured visual narratives.",
      },
      {
        label: "web-design-guidelines",
        type: "skill",
        decision: "experiment",
        why: "Strong signal, but still needs canonical local packaging and broader evaluation.",
      },
      {
        label: "content strategy skill packs",
        type: "ecosystem",
        decision: "watch",
        why: "Promising, but quality varies and many packs are fluffy rather than procedural.",
      },
      {
        label: "copywriting",
        type: "skill",
        decision: "adopt-now",
        why: "Creator output quality depends heavily on hooks, titles, structure, and messaging, not only on visual polish.",
      },
      {
        label: "Figma MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "13.5K stars. Design-to-code is the #1 creator-developer bridge.",
      },
      {
        label: "ElevenLabs MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "Official, 1.2K stars. TTS + voice cloning for podcasts, voiceovers.",
      },
      {
        label: "YouTube Transcript MCP",
        type: "mcp",
        decision: "adopt-now",
        why: "492 stars. Competitor research and video-to-text repurposing.",
      },
      {
        label: "DaVinci Resolve MCP",
        type: "mcp",
        decision: "experiment",
        why: "623 stars. Real video editing via AI, requires Resolve installed.",
      },
      {
        label: "Blender MCP",
        type: "mcp",
        decision: "experiment",
        why: "17.6K stars but narrow audience - only for 3D/visual asset creators.",
      },
      {
        label: "ComfyUI Pilot",
        type: "mcp",
        decision: "experiment",
        why: "125 stars. AI can edit image gen workflows.",
      },
      {
        label: "FFmpeg MCP",
        type: "mcp",
        decision: "experiment",
        why: "123 stars. Batch video processing.",
      },
      {
        label: "Content Marketing Toolkit",
        type: "ecosystem",
        decision: "experiment",
        why: "Very new (Feb 2026). Most complete creator skill pack found.",
      },
    ],
    dedupeNotes: [
      "Creator is the strongest candidate for the first non-dev lens expansion.",
      "Heavy overlap with presentations, websites, and automation; keep dedupe rules strict.",
      "Canva has no official MCP server. The community repo (5 stars) is watch-tier only.",
      "Newsletter platforms (Substack, Ghost, Beehiiv) have zero MCP coverage - big gap to monitor.",
    ],
  },
];

export function summarizeCoreCapability(capability: RadarCoreCapabilityDefinition): string {
  const adoptNow = capability.decisions
    .filter((item) => item.decision === "adopt-now")
    .map((item) => item.label)
    .join(", ");
  const experiments = capability.decisions
    .filter((item) => item.decision === "experiment")
    .map((item) => item.label)
    .join(", ");

  return `${capability.label}: ${capability.summary} Adopt now -> ${adoptNow || "none"}; experiment -> ${experiments || "none"}.`;
}

export function summarizeLens(lens: RadarLensDefinition): string {
  const adoptNow = lens.decisions
    .filter((item) => item.decision === "adopt-now")
    .map((item) => item.label)
    .join(", ");
  const strongestOverlap = lens.outputBias
    .map((id) => RADAR_CORE_CAPABILITIES.find((capability) => capability.id === id)?.label ?? id)
    .join(", ");

  return `${lens.label}: ${lens.summary} Strongest overlap -> ${strongestOverlap || "none"}; adopt now -> ${adoptNow || "none"}.`;
}

export function buildCoreCapabilityDocument(capability: RadarCoreCapabilityDefinition): string {
  return [
    summarizeCoreCapability(capability),
    `Why always on: ${capability.whyAlwaysOn}`,
    `Signals to track: ${capability.signalsToTrack.join(", ")}`,
    "Sources of truth:",
    ...capability.sourcesOfTruth.map((source) => `- ${formatSourceLine(source)}`),
    "Decision box:",
    ...capability.decisions.map((item) => `- ${formatDecisionLine(item)}`),
  ].join("\n");
}

export function buildLensDocument(lens: RadarLensDefinition): string {
  return [
    summarizeLens(lens),
    `Signals to track: ${lens.signalsToTrack.join(", ")}`,
    `Strongest overlap: ${lens.outputBias
      .map((id) => RADAR_CORE_CAPABILITIES.find((capability) => capability.id === id)?.label ?? id)
      .join(", ")}`,
    "Official sources:",
    ...lens.officialSources.map((source) => `- ${formatSourceLine(source)}`),
    "Scout sources:",
    ...lens.scoutSources.map((source) => `- ${formatSourceLine(source)}`),
    "Decision box:",
    ...lens.decisions.map((item) => `- ${formatDecisionLine(item)}`),
    "Dedupe notes:",
    ...lens.dedupeNotes.map((note) => `- ${note}`),
  ].join("\n");
}

export function summarizeCurrentPresetModel(): string {
  const core = RADAR_CORE_CAPABILITIES.map((capability) => capability.label).join(", ");
  const lenses = RADAR_DOMAIN_LENSES.map((lens) => lens.label).join(", ");
  return `Current radar preset model: always-on capabilities -> ${core}; optional domain lenses -> ${lenses}.`;
}
