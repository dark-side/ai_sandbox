# Reference Solution — Section 2: Evaluation-Driven Development

This directory contains reference implementations for the Section 2 exercises.

## Files

- `deterministic.py` — deterministic assertion script
- `judge_prompt.md` — judge prompt with `{{implementation_diff}}` placeholder
- `run_suite.py` — orchestrates deterministic + judge + golden dataset
- `golden/` — 10-case golden dataset (5 clean, 5 dirty)
- `criteria_classification.md` — D/J classification of all acceptance criteria

## Key design decisions

**Why exit codes matter:**  
The pre-push hook relies on exit codes, not log output. Every assertion script
exits 0 on pass, non-zero on any failure. Print statements are for human debugging only.

**Judge prompt design:**  
The judge uses a rubric (list of named criteria) rather than a free-form question.
This makes the judge deterministic enough for CI use — it consistently catches the
same failure modes run after run.

**Golden dataset dirty cases:**  
The five dirty cases were chosen to represent real incident patterns:
- `case_06`: scope creep (the nightly job incident)  
- `case_07`: coverage drop (the pre-push gap incident)  
- `case_08`: threshold relocation (the fraud detector incident)  
- `case_09`: plausible-but-wrong logic (catches overconfident agents)  
- `case_10`: regression in existing tests (catches "fix new, break old" pattern)
