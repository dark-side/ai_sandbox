# Hints — Section 2

**Hint 1 (AGENTS.md audit)**  
The current `AGENTS.md` has 7 instructions. Every single one is advisory.
A gate looks like: "The PR must not be submitted unless `pytest --cov=. --cov-fail-under=80` exits 0."
An advisory looks like: "Be thorough with testing."

**Hint 2 (constitution gates)**  
Good machine-verifiable gates to start with:
- `pytest --cov=services/payment-validator --cov-fail-under=80` must exit 0
- Modified files must be a subset of the `scope` list in this document
- All existing tests must pass before any new code is committed

Bad gates (not machine-verifiable):
- "Write high-quality code"
- "Consider edge cases"

**Hint 3 (delegatable spec — the contractor test)**  
Read `docs/adr/ADR-001-payment-validation-strategy.md` before writing the spec.
ADR-001 tells you that `amount=0.00` is **valid** (used for refund reversals).
Your spec must say this explicitly — don't assume the agent has read the ADRs.

**Hint 4 (clarify phase)**  
If Claude Code doesn't ask any questions, your spec is probably already very complete
— or it is making assumptions. Try asking: "What assumptions are you making that you
haven't verified from the spec?"

**Hint 5 (structural consistency)**  
"Structurally identical" means: same set of files modified, same test file structure,
same function signatures. It does not mean identical code character-for-character.
Use `git diff --stat` to compare the two outputs quickly.
