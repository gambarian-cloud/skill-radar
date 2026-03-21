/**
 * Detects critical runtime failures that touch the current stack.
 * Used by both heuristic scoring (guardrails, caps) and discussion ceilings (exemptions).
 */
export function isCriticalRuntimeFailure(text: string): boolean {
  const hasFailureSignal =
    text.includes("broke")
    || text.includes("broken")
    || /\bbreaks (on|when|after|with)\b/iu.test(text)
    || text.includes("regression")
    || text.includes("crash")
    || text.includes("crashes")
    || text.includes("failing")
    || text.includes("fails")
    || text.includes("stopped working")
    || text.includes("cannot ")
    || text.includes("can't ")
    || text.includes("unable to ");

  const touchesCurrentStack =
    text.includes("claude code")
    || text.includes("codex")
    || text.includes("worktree")
    || text.includes("worktrees")
    || text.includes("mcp")
    || text.includes("agents.md")
    || text.includes("skill");

  return hasFailureSignal && touchesCurrentStack;
}
