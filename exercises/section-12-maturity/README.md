# Section 12 — Maturity Assessment and Leadership Reporting

> **Scenario:** You are a Technical Architect assessing a client team of 12 engineers who report
> "using AI agents extensively." After two days of observation: engineers use Copilot chat for
> code completion; three engineers run Claude Code with no eval suite, reviewing every output
> line-by-line; one engineer has a partial harness that processes 2–3 tickets per week
> interactively. The team believes they are at L4. They are effectively at L2.

**How we solve it:** classify the effective level from observed behaviour, isolate the actual
bottleneck, then write a one-page brief with the economics attached.

---

## The maturity ladder

| Level | Definition | Evidence of this level |
|---|---|---|
| **L0** | No AI usage | No AI tools in engineer workflows |
| **L1** | AI assists | Autocomplete, chat — engineer reviews every token |
| **L2** | Engineer directs AI | Engineer prompts for tasks, reviews every output at line level |
| **L3** | AI executes with eval gate | Agent runs tasks end-to-end; eval suite gates output before human sees it |
| **L4** | Team-scale automated pipeline | Multiple engineers use a shared, scheduled harness; no per-run human review |

The **effective level** is the highest level the team sustains consistently across the
majority of engineers — not the ceiling any individual reaches occasionally.

---

## Tasks

### 1. Assess the PayFlow team's effective level

Look at the PayFlow repo you have been building. Based on the state of the repo as of
**the beginning of Section 1** (before any exercises), classify the team's effective level:

- What was the harness doing?
- Were engineers reviewing every output?
- Was there an eval suite?

Document your assessment in `docs/maturity-assessment.md` with:
- The effective level (L0–L4)
- The evidence: 2–3 observable facts from the repo state
- The bottleneck: the specific missing capability that prevents moving to the next level

---

### 2. Identify the bottleneck level and root cause

The bottleneck is the lowest-level problem preventing the team from moving up.

For the starting PayFlow state, identify:
- Which missing element is the primary bottleneck?
- Is it a spec problem (no delegatable spec → output is inconsistent)?
- Is it an eval problem (no eval gate → no trust in output)?
- Is it a context problem (agents re-invent patterns → output violates ADRs)?
- Is it a cost problem (all tasks on frontier model → economics don't scale)?

The bottleneck is the one thing that, if fixed first, unblocks the most subsequent levels.

Document your bottleneck analysis in `docs/maturity-assessment.md`.

---

### 3. Produce a one-page leadership brief

Create `docs/leadership-brief.md` with four sections (must fit on one page):

**1. Current state**
- Effective level with definition
- 2–3 observable facts as evidence
- The bottleneck (one sentence)

**2. Target state**
- One level up from effective level
- Definition of that level
- Exit criteria: what does "done" look like?

**3. Uplift plan**
- The single highest-leverage action
- Estimated effort (person-days)
- Which section of the curriculum addresses it

**4. Economics**
- Current cost per feature ticket (from your Section 6 measurements, or estimated)
- Projected cost per ticket at target level
- Projected throughput gain (tickets per engineer per week, before vs after)

The brief must answer "what is the ROI of moving from current to target level?" with numbers.

---

### 4. Apply the assessment to a real project

Using the same three-step framework (effective level → bottleneck → brief), assess
one AI workflow you or your team currently runs outside of this practice repo.

Record your answers (just for yourself — no need to commit):
1. What is the effective level?
2. What is the bottleneck?
3. What is the single highest-leverage action?

---

## Acceptance criteria

- [ ] `docs/maturity-assessment.md` exists with effective level, evidence, and bottleneck
- [ ] The effective level is supported by 2–3 specific observable facts (not opinions)
- [ ] The bottleneck is distinct from the claimed level (what's actually missing, not what would be nice)
- [ ] `docs/leadership-brief.md` exists with all 4 sections
- [ ] The economics section has at least 2 numbers (cost and throughput)
- [ ] The brief answers "what is the ROI" without requiring the reader to do the arithmetic

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
