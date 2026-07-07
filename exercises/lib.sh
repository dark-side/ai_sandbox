#!/usr/bin/env bash
# Shared self-check helpers for section verify.sh scripts.
#
# Each section's verify.sh sets REPO (repo root) and sources this file, then calls
# the check_* helpers below and ends with `summary`. Checks are outcome-based: they
# verify the artifacts the exercise asks you to create. Before you do the work they
# will FAIL — that is the point; run verify.sh to see exactly what is left.

set -uo pipefail
PASS=0
FAIL=0

_g() { printf '\033[32m%s\033[0m' "$1"; }
_r() { printf '\033[31m%s\033[0m' "$1"; }
_y() { printf '\033[33m%s\033[0m' "$1"; }

ok() { PASS=$((PASS + 1)); echo "  [$(_g PASS)] $1"; }
no() { FAIL=$((FAIL + 1)); echo "  [$(_r FAIL)] $1"; }

# check_file <path> <label>
check_file() {
  if [ -e "$REPO/$1" ]; then ok "$2"; else no "$2 (missing: $1)"; fi
}

# opt_file <path> <label> — optional; never fails the run
opt_file() {
  if [ -e "$REPO/$1" ]; then ok "$2 (optional)"; else echo "  [ $(_y '––') ] $2 (optional — not done)"; fi
}

# check_grep <path> <regex> <label>
check_grep() {
  if [ -e "$REPO/$1" ] && grep -Eiq "$2" "$REPO/$1" 2>/dev/null; then ok "$3"; else no "$3"; fi
}

# check_grep_all <path> <label> <pattern>... — file must contain every pattern
check_grep_all() {
  local path="$REPO/$1" label="$2"; shift 2
  if [ ! -e "$path" ]; then no "$label (missing file)"; return; fi
  local miss=""
  for pat in "$@"; do grep -Eiq "$pat" "$path" 2>/dev/null || miss="$miss $pat"; done
  if [ -z "$miss" ]; then ok "$label"; else no "$label (missing:$miss)"; fi
}

# check_count <dir> <min> <label> — dir must contain at least <min> files
check_count() {
  local n; n=$(find "$REPO/$1" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "${n:-0}" -ge "$2" ]; then ok "$3 (${n} files)"; else no "$3 (found ${n:-0}, need $2)"; fi
}

# check_grep_tree <dir> <regex> <label> — any file under dir matches regex
check_grep_tree() {
  if grep -REiq "$2" "$REPO/$1" 2>/dev/null; then ok "$3"; else no "$3"; fi
}

summary() {
  echo
  if [ "$FAIL" -eq 0 ]; then
    echo "  $(_g "All $PASS checks passed.")"
  else
    echo "  $(_g "${PASS} passed"), $(_r "${FAIL} failed") — see FAIL lines above."
  fi
  [ "$FAIL" -eq 0 ]
}
