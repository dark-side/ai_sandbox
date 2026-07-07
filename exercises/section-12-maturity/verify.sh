#!/usr/bin/env bash
# Self-check for Section 12 — Maturity Assessment and Leadership Reporting
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 12 — Maturity Assessment and Leadership Reporting — self-check"; echo

check_file "docs/maturity-assessment.md" "maturity-assessment.md exists"
check_grep "docs/maturity-assessment.md" "L[0-4]" "effective level classified"
check_grep "docs/maturity-assessment.md" "bottleneck" "bottleneck identified"
check_file "docs/leadership-brief.md" "leadership-brief.md exists"
check_grep_all "docs/leadership-brief.md" "brief has all 4 sections" \
  "current state" "target" "uplift" "economic"
check_grep "docs/leadership-brief.md" "[0-9]" "economics section has numbers"

summary
