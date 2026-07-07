#!/usr/bin/env bash
# Self-check for Section 4 — Workflow Design and the Agentic Solution Model
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 4 — Workflow Design and the Agentic Solution Model — self-check"; echo

check_file "docs/workflow-map.md" "workflow-map.md exists"
check_grep "docs/workflow-map.md" "agentic|human gate|automated" "phases labelled (agentic / human gate / automated)"
check_file "docs/agentic-solution-model.md" "agentic-solution-model.md exists"
check_grep_all "docs/agentic-solution-model.md" "solution model has all 6 fields" \
  "workflow" "agent" "tool" "validation" "human" "economic"
check_grep "constitution.md" "agentic-solution-model" "constitution references the solution model"

summary
