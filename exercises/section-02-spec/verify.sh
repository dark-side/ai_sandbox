#!/usr/bin/env bash
# Self-check for Section 2 — Specification as Source of Truth
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 2 — Specification as Source of Truth — self-check"; echo

check_file "constitution.md" "constitution.md exists at repo root"
check_grep_all "constitution.md" "constitution has scope + gates + escalation" \
  "scope" "escalat"
check_grep "constitution.md" "coverage|%|>=|≥" "constitution has a machine-verifiable gate"
check_file "docs/issues/ISSUE-47-delegatable-spec.md" "delegatable spec created"
check_grep_all "docs/issues/ISSUE-47-delegatable-spec.md" "spec has all 6 elements" \
  "goal" "scope" "acceptance" "constraint" "nfr|non-functional" "verif"

summary
