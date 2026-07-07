#!/usr/bin/env bash
# Self-check for Section 7 — Reliability, Guardrails, and Security
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 7 — Reliability, Guardrails, and Security — self-check"; echo

echo "  Core (Tasks 1-4):"
check_file ".claude/hooks/scope_enforcer.py" "scope_enforcer.py exists"
check_file "harness/evals/scope_injection_test.py" "scope_injection_test.py exists"
check_file "docs/threat-model.md" "threat-model.md exists"
check_grep "docs/threat-model.md" "inject" "threat model covers prompt injection"

echo "  Advanced (Tasks 5-8, optional):"
opt_file "harness/dual_llm_wrapper.py" "dual-LLM wrapper"
opt_file "harness/hooks/secrets_scanner.py" "secrets scanner"

summary
