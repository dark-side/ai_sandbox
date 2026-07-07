# Hints — Section 12

**Hint 1 (effective level — how to classify)**  
The key word is "consistently across the majority of engineers."
If 1 engineer out of 8 has an eval gate but the other 7 don't: effective level does NOT include the eval gate.
The effective level is what would happen if the best engineer went on holiday for a month.

**Hint 2 (PayFlow starting state classification)**  
At the start of this repo (before any exercises), what evidence exists?
- `harness/run.py` exists → the team is running some agentic tasks (not L1)
- `harness/run.py` has no eval gate → output is not gated before human review
- `test_validator.py` has coverage gaps → engineers are reviewing output manually
- No `constitution.md`, no scope enforcement → agents can modify anything

This maps to: engineers prompt the agent, review every output at line level, with no automated
quality gate. That is the **L2 definition**. The bottleneck is the absence of an eval gate (L3 requirement).

**Hint 3 (economics — how to compute ROI)**  
ROI = (value gained) / (cost of change).

Value gained = (time saved per ticket) × (ticket volume) × (engineer hourly cost).
If an eval gate removes 30 min of line-level review per ticket, at 5 tickets/engineer/week
for 8 engineers, that's 20 engineer-hours/week ≈ $2,000-4,000/week depending on rates.

Cost of change = engineer-days to build the eval suite × daily cost.
If building the eval suite takes 3 engineer-days: payback period ≈ 3 days.

**Hint 4 (bottleneck identification)**  
The bottleneck is always the *lowest* missing level, not the highest aspiration.
A team that wants multi-agent orchestration (L4) but has no eval suite (L3) is blocked at L3.
Adding multi-agent orchestration to a team with no eval gates makes things worse, not better:
more agents produce more unvalidated output faster.

**Hint 5 (leadership brief — length discipline)**  
"One page" means one page. If your brief exceeds one page, cut the least important fact,
not the economics. A leadership brief that doesn't fit on one page will not be read.
The four sections in order of what leadership cares most about: Economics > Current state > Uplift plan > Target state.
(Write them in the order above, not in the order of importance — the narrative flows better that way.)
