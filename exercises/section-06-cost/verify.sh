#!/usr/bin/env bash
# Self-check for Section 6 — Model Selection and Cost Control
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 6 — Model Selection and Cost Control — self-check"; echo

check_file "harness/evals/model_routing_analysis.md" "model_routing_analysis.md exists"
check_grep "harness/evals/model_routing_analysis.md" "pass rate|eval" "eval evidence recorded"
check_grep "harness/evals/model_routing_analysis.md" "cascad|escalat" "cascading triggers documented"
check_grep "harness/config.yaml" "^[[:space:]]*[a-z_]+:[[:space:]]*claude-haiku" "config routes non-frontier tasks to a small model"
check_file "harness/cost_projection.md" "cost_projection.md exists"
check_grep_all "harness/cost_projection.md" "three scenarios present" \
  "conservative" "moderate" "aggressive"

summary
