# NewsGenie DP — Stable UI Recovery

## Golden restore point
TAG: NG_DP_UI_STABLE_20260207

## Fast restore (clean)
git fetch --all --tags
git checkout NG_DP_UI_STABLE_20260207

## If you want stable UI as main (advanced)
git checkout main
git fetch --all --tags
git reset --hard NG_DP_UI_STABLE_20260207
git push origin main --force

Notes:
- Main may move forward; tag remains the safest checkpoint.
- Local backups are ignored via .gitignore.
