#!/usr/bin/env bash
# Self-check for Section 9 — Packaging and Team Distribution
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$DIR/../.." && pwd)"
source "$DIR/../lib.sh"
echo "Section 9 — Packaging and Team Distribution — self-check"; echo

check_count ".claude/skills" 4 "skills directory has >= 4 skill files"
check_file "HARNESS.md" "HARNESS.md exists"
check_grep_all "HARNESS.md" "HARNESS.md has the 5 required sections" \
  "prerequisit" "first run" "daily" "troubleshoot"
check_grep_tree ".github/workflows" "AGENTS.md" "CI check for user-level AGENTS.md conflicts"

summary
