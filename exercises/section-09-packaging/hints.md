# Hints — Section 9

**Hint 1 (skill file format)**  
A minimal skill file in `.claude/skills/`:
```markdown
---
name: eval-run
description: Runs the PayFlow eval suite and prints a PASS/FAIL summary.
---

## Steps
1. Run `python harness/evals/run_suite.py`
2. Parse exit code: 0 = all pass, non-zero = failures
3. Print a one-line summary: "Eval suite: N/M passed."
4. If failures, list the failing case IDs with their reasons.

## Expected output
```
Eval suite: 10/10 passed.
```
or
```
Eval suite: 8/10 passed. FAILED: case_08 (threshold_location), case_09 (return_type).
```
```

**Hint 2 (project scope vs user scope)**  
Claude Code resolves settings from five levels (managed → project → project-local → user → CLI).
A user-level `~/.claude/AGENTS.md` will be merged with the project-level one. If they conflict,
the merge rules matter. The safest guarantee of identical team behaviour: add the CI check
that fails if a user-level AGENTS.md exists, so the conflict is caught before a run.

**Hint 3 (HARNESS.md — section 1 prerequisites)**  
Be specific. Not "Python 3" but "Python 3.12+". Not "Claude Code" but "Claude Code CLI v1.x
(`claude --version` should show 1.x.x)". Vague prerequisites are the most common source of
"it worked for me but not for them" failures.

**Hint 4 (first-run command)**  
The first-run command should be a single command that runs end-to-end on a known-good test
ticket, produces visible output, and exits 0. Something like:
```bash
python harness/run.py --ticket docs/issues/ISSUE-47-add-refund-validation.md --dry-run
```
A dry run is perfect for onboarding: it shows that the harness loads without calling the API
or incurring cost. Save real API calls for after the teammate is confident everything is wired.

**Hint 5 (the one-teammate test)**  
Give your teammate the repo URL and HARNESS.md. Do not explain anything verbally.
Watch them work. Every time they pause, ask "what are you looking for?" — don't answer.
Record the pauses. Those pauses are the gaps in your documentation.
