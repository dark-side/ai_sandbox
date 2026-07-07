#!/usr/bin/env bash
# Self-check for Section 5 — Context and Memory Engineering
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 5 — Context and Memory Engineering — self-check"; echo

check_file "harness/evals/context_baseline.md" "context_baseline.md exists"
check_grep "harness/evals/context_baseline.md" "static|ratio|dynamic" "static/dynamic ratio documented"
check_file "harness/retrieval/adr_retriever.py" "adr_retriever.py exists"
check_grep "harness/evals/context_baseline.md" "precision" "precision@3 documented"
check_grep_tree "harness" "cache_control|ephemeral" "prompt caching applied (cache_control)"
check_grep "harness/run.py" "summari|scratchpad" "scratchpad summarisation step added"

summary
