---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from the current workspace, or when running parallel agent tasks on the same repo. Creates isolated git worktrees to prevent context collision. Adapted from obra/superpowers for project-owned use.
---

# Using Git Worktrees

Use this skill when parallel work on the same repo would cause branch or file conflicts.

## When To Use

- Two agents working on Signal Scout at the same time (Codex + Claude Code).
- A feature branch that might break the pipeline while someone else needs it working.
- Larger refactors where you want to verify the old version still works while building the new one.
- Testing a risky scoring or normalization change without affecting the main workspace.

## Setup

### 1. Choose a worktree location

Preferred location for Signal Scout:

```powershell
.worktrees/
```

If `.worktrees/` does not exist, create it. Verify it is git-ignored:

```powershell
git check-ignore -q .worktrees
```

If not ignored, add it:

```powershell
echo ".worktrees/" >> .gitignore
git add .gitignore
git commit -m "Add .worktrees to gitignore"
```

### 2. Create the worktree

```powershell
git worktree add .worktrees/<branch-name> -b <branch-name>
```

Example:

```powershell
git worktree add .worktrees/cross-link-scoring -b cross-link-scoring
```

### 3. Set up the worktree

```powershell
cd .worktrees/<branch-name>
npm install
```

### 4. Verify clean baseline

```powershell
npm test
npm run digest:demo
```

If tests fail in the fresh worktree, the main branch has a problem. Fix it there first.

## Working In The Worktree

- Run all commands from inside the worktree directory.
- The worktree has its own working tree but shares the git object store.
- Changes in one worktree do not affect files in another.
- Commits in the worktree go to the worktree's branch.

## Finishing Work

When the feature is done:

1. Run verification in the worktree:

```powershell
npm test
npm run digest:demo
```

2. Push the branch or merge it.
3. Remove the worktree:

```powershell
cd <project-root>
git worktree remove .worktrees/<branch-name>
```

4. Optionally delete the branch if merged:

```powershell
git branch -d <branch-name>
```

## Claude Code Integration

Claude Code has native worktree support via `EnterWorktree`. When using Claude Code:

- It creates worktrees in `.claude/worktrees/` by default.
- On session exit, you are prompted to keep or remove the worktree.
- Use this for any task that might conflict with Codex's concurrent work.

## Codex Integration

Codex runs in sandboxed environments by default. Explicit worktrees are most useful when:

- You want to preserve local state between Codex runs.
- You need to compare two implementation approaches side by side.
- The main branch must stay clean for Claude Code to use simultaneously.

## Guardrails

- Always verify `.worktrees/` is git-ignored before creating worktrees inside the project.
- Do not create worktrees for trivial one-file changes. Use a normal branch.
- Do not leave stale worktrees around. Clean up after merging.
- If the worktree's tests fail on a fresh checkout, the problem is upstream, not in the worktree.
