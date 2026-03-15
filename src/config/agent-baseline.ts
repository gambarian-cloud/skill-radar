export interface BaselineSkillTarget {
  name: string;
  path: string;
}

export interface BaselineMcpTarget {
  id: string;
  label: string;
}

export const ADOPT_NOW_CODEX_FILES = [
  "C:/Users/MI/.codex/AGENTS.md",
  "C:/Users/MI/.codex/config.toml",
] as const;

export const ADOPT_NOW_CLAUDE_FILES = [
  "C:/Users/MI/.claude/CLAUDE.md",
  "C:/Users/MI/.claude/settings.json",
] as const;

export const ADOPT_NOW_PROJECT_FILES = [
  ".claude/settings.json",
  ".claude/hooks/stop-verify.ps1",
  ".claude/commands/digest.md",
  ".claude/commands/lookup.md",
  ".claude/commands/audit.md",
  ".claude/commands/sync.md",
  ".mcp.json",
  "skills/agent-baseline-onboarding/SKILL.md",
] as const;

export const ADOPT_NOW_CODEX_SKILLS: BaselineSkillTarget[] = [
  { name: "systematic-debugging", path: "C:/Users/MI/.codex/skills/systematic-debugging/SKILL.md" },
  { name: "verification-before-completion", path: "C:/Users/MI/.codex/skills/verification-before-completion/SKILL.md" },
  { name: "using-git-worktrees", path: "C:/Users/MI/.codex/skills/using-git-worktrees/SKILL.md" },
  { name: "brainstorming", path: "C:/Users/MI/.codex/skills/brainstorming/SKILL.md" },
  { name: "writing-plans", path: "C:/Users/MI/.codex/skills/writing-plans/SKILL.md" },
  { name: "executing-plans", path: "C:/Users/MI/.codex/skills/executing-plans/SKILL.md" },
  { name: "model-routing", path: "C:/Users/MI/.codex/skills/model-routing/SKILL.md" },
] as const;

export const ADOPT_NOW_CLAUDE_SKILLS: BaselineSkillTarget[] = [
  { name: "systematic-debugging", path: "C:/Users/MI/.claude/skills/systematic-debugging/SKILL.md" },
  { name: "verification-before-completion", path: "C:/Users/MI/.claude/skills/verification-before-completion/SKILL.md" },
  { name: "using-git-worktrees", path: "C:/Users/MI/.claude/skills/using-git-worktrees/SKILL.md" },
  { name: "brainstorming", path: "C:/Users/MI/.claude/skills/brainstorming/SKILL.md" },
  { name: "writing-plans", path: "C:/Users/MI/.claude/skills/writing-plans/SKILL.md" },
  { name: "executing-plans", path: "C:/Users/MI/.claude/skills/executing-plans/SKILL.md" },
] as const;

export const ADOPT_NOW_MCP: BaselineMcpTarget[] = [
  { id: "context7", label: "Context7" },
  { id: "sequential-thinking", label: "Sequential Thinking" },
  { id: "github", label: "GitHub MCP" },
] as const;

export const STAGE_NEXT_MCP: BaselineMcpTarget[] = [] as const;

export const WATCH_ITEMS = [
  "formatter hook",
  "notification hook",
  "Brave Search MCP",
  "subagent-driven-development",
] as const;

export const REJECT_ITEMS = [
  "Filesystem MCP",
  "Git MCP",
  "giant skill packs",
  "messenger bridges",
  "orchestration frameworks",
  "forced WSL migration",
  "memory-bank MCP as day-one baseline",
] as const;
