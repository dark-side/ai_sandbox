#!/usr/bin/env bash
# Self-check for Section 8 — Observability and Attribution
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 8 — Observability and Attribution — self-check"; echo

check_grep_tree "harness" "start_as_current_span|opentelemetry" "OTel spans added to the harness"
check_file "harness/observability/metrics.py" "metrics.py exists"
check_grep_all "harness/observability/metrics.py" "four metrics computed" \
  "pass" "cost" "p95|percentile" "fail"
check_grep_tree "harness" "X-AI-|Co-authored-by" "AI attribution trailers implemented"

summary
