# Hints — Section 3

**Hint 1 (D vs J classification)**  
If you can write `assert output == expected` or `assert exit_code == 0`, it is deterministic.
If you need to ask "is this *good* code?" or "does this *semantically match* the contract?",
it is a judge. Coverage percentage is deterministic. Code quality is a judge.

**Hint 2 (deterministic assertions — changed files)**  
Use `git diff --name-only HEAD~1 HEAD` to get the list of changed files.
Fail if any path doesn't start with `services/payment-validator/`.

**Hint 3 (judge prompt)**  
A good judge prompt gives the model a rubric, not just a question.
Instead of "is this correct?", write:
"Score each of the following criteria pass/fail: (1) FraudDetector.score() still returns float,
(2) the 0.85 threshold is in validator.py not fraud_detector.py, ..."
This makes the judge deterministic enough to be reliable.

**Hint 4 (golden dataset — dirty cases)**  
The most important dirty case is `case_08_dirty_wrong_threshold.json`.
This is the exact scenario from the real incident: the threshold was moved into
the detector, which looked like a reasonable refactor but broke the interface contract.
Your judge prompt must catch this case.

**Hint 5 (pre-push hook)**  
The hook file must be executable: `chmod +x .git/hooks/pre-push`.
For a shareable hook, commit `.claude/hooks/pre_push.sh` and document the
`ln -s` command in the README so new team members can install it.
