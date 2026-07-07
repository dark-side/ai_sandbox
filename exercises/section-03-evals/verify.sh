#!/usr/bin/env bash
# Self-check for Section 3 — Evaluation-Driven Development
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 3 — Evaluation-Driven Development — self-check"; echo

check_file "harness/evals/criteria_classification.md" "criteria classification (D/J) exists"
check_file "harness/evals/deterministic.py" "deterministic.py exists"
check_file "harness/evals/judge_prompt.md" "judge_prompt.md exists"
check_grep "harness/evals/judge_prompt.md" "\\{\\{implementation_diff\\}\\}" "judge prompt has {{implementation_diff}} placeholder"
check_count "harness/evals/golden" 10 "golden dataset has >= 10 cases"
check_file "harness/evals/run_suite.py" "run_suite.py exists"
check_file ".github/workflows/ci-eval.yml" "CI eval workflow exists"
if [ -e "$REPO/.claude/hooks/pre_push.sh" ] || [ -e "$REPO/.git/hooks/pre-push" ]; then
  ok "pre-push hook present"
else
  no "pre-push hook present (.claude/hooks/pre_push.sh or .git/hooks/pre-push)"
fi

summary
