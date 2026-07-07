#!/usr/bin/env bash
# Self-check for Section 1 — When to Use an Agent
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 1 — When to Use an Agent — self-check"; echo

check_file "docs/adr/ADR-005-execution-model-decision.md" "ADR-005 created"
check_grep_all "docs/adr/ADR-005-execution-model-decision.md" "All three tasks classified" \
  "commit" "classif" "implement"
check_grep "docs/adr/ADR-005-execution-model-decision.md" "call|workflow|agent" "Execution model assigned"
check_grep "docs/adr/ADR-005-execution-model-decision.md" "cost|token|\\\$|latency" "Economics / latency documented"

summary
