#!/usr/bin/env bash
# Self-check for Section 10 — Scheduled and Unattended Dispatch
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 10 — Scheduled and Unattended Dispatch — self-check"; echo

check_file "docs/nightly-job-guardrails.md" "nightly-job-guardrails.md exists"
check_file ".github/workflows/nightly.yml" "nightly.yml workflow exists"
check_grep_all ".github/workflows/nightly.yml" "trigger has cron + dry-run" \
  "cron" "workflow_dispatch|dry_run"
check_file "harness/nightly_alerts.py" "nightly_alerts.py exists"
check_grep "harness/config.yaml" "^[[:space:]]*(budget|token_budget|cost_limit|spend_cap):" "hard token/spend budget in config"

summary
