# Merge Checkpoint (Safe Workflow)

This file is intentionally separate from `STABLE_UI.md` so base recovery docs stay clean.

## Goal
Work only from a dedicated merge checkpoint branch, keep base files safe, and avoid depending on short commit hashes from chat.

## 1) Create/switch to merge checkpoint branch
```powershell
git fetch --all --tags --prune
git switch -c merge-checkpoint
```

If branch already exists:
```powershell
git switch merge-checkpoint
```

## 2) Verify you are on checkpoint branch
```powershell
git branch --show-current
git status
```
Expected branch: `merge-checkpoint`.

## 3) If a short hash fails (example: 37dea1c)
```powershell
git rev-parse --verify 37dea1c
```
If it fails, do message-based lookup (safer):
```powershell
git log --oneline --decorate --all --grep "docs: fix fetch command and detached HEAD recovery"
```

## 4) Apply wanted commit safely
Use full hash from lookup:
```powershell
git cherry-pick <FULL_40_CHAR_HASH>
```

## 5) If still missing, use stable tag as fallback base
```powershell
git checkout NG_DP_UI_STABLE_20260207
git switch -c merge-checkpoint-from-stable
```

## 6) Verify final state before testing
```powershell
git log --oneline -n 10
git status
```

## 7) Push checkpoint branch
```powershell
git push -u origin merge-checkpoint
```

---

## Why this avoids contradictions
- Short hashes can be unknown in another clone/session.
- Message lookup + full hash is deterministic.
- Working on `merge-checkpoint` protects original branch state.
