#!/usr/bin/env bash
# Self-check for Section 11 — Multi-Agent Orchestration
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 11 — Multi-Agent Orchestration — self-check"; echo

check_file "harness/multiagent/specs/impl_agent.md" "impl_agent spec exists"
check_file "harness/multiagent/specs/test_agent.md" "test_agent spec exists"
check_file "harness/multiagent/specs/docs_agent.md" "docs_agent spec exists"
check_file "harness/multiagent/handoff_schema.py" "handoff_schema.py exists"
check_file "harness/multiagent/coordinator.py" "coordinator.py exists"
check_count "harness/multiagent/evals" 4 "per-agent + e2e eval scripts exist (>= 4)"
check_file "harness/multiagent/evals/coverage_annotations.md" "coverage_annotations.md exists"

summary
