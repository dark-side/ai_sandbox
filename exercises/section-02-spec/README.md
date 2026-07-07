# Section 2 — Specification as Source of Truth

> **Scenario:** The PayFlow team has been running the harness for 6 weeks with no shared spec
> layer. Two PRs were merged below the coverage threshold because the agent had no gate to
> enforce it. Engineers disagree on what "done" means for a ticket.

**How we solve it:** audit existing instructions, commit a constitution, rewrite the ticket
as a delegatable spec, then verify with a clarify phase before touching code.

---

## Tasks

### 1. Audit `AGENTS.md`

Open `AGENTS.md` at the repo root.

- Count the total number of instructions.
- Classify each as **advisory** ("write clean code") or **gate** (a machine-verifiable pass/fail rule).
- How many gates does it have?

Record your answer here before continuing.

---

### 2. Create `constitution.md`

The file `constitution.md` does not exist. Create it at the repo root.

Your `constitution.md` must include:

| Element | Requirement |
|---|---|
| Project scope | Exact directories the harness is allowed to modify |
| At least 2 machine-verifiable gates | E.g. "coverage ≥ 80 % on `payment-validator/`" |
| Escalation rules | What the agent must do when it is uncertain |
| Revision policy | How humans amend this document |

**The "would I hire a contractor" test:** Could you hand this file to a contractor who has
never met you and have them implement a ticket correctly without asking a single clarifying question?
If not, add the missing constraints.

---

### 3. Rewrite ISSUE-47 as a delegatable spec

Open `docs/issues/ISSUE-47-add-refund-validation.md`.

Rewrite it as a 6-element delegatable spec:

1. **Goal** — one outcome sentence
2. **Scope** — files in and out
3. **Acceptance criteria** — each checkable without reading the code
4. **Constraints** — libraries and patterns from the constitution
5. **NFRs** — specific thresholds
6. **Verification method** — how the agent proves it is done

Save your rewritten spec to `docs/issues/ISSUE-47-delegatable-spec.md`.

---

### 4. Run the clarify phase

Feed your new spec to Claude Code with this prompt:

```
Before you start planning, read docs/issues/ISSUE-47-delegatable-spec.md
and list every ambiguity or missing piece of information you would need
resolved before you could implement this ticket safely.
```

Record the questions Claude Code asks. Do they match the gaps you anticipated?

---

### 5. Validate structural consistency

Run the same spec with two different prompting styles and compare the outputs:

- Style A: conversational ("Hey, can you implement the refund validation?")
- Style B: structured spec (your rewritten ISSUE-47)

**Acceptance criteria:** The outputs produced from Style B should be structurally
identical across two separate runs (same files modified, same test coverage).
Style A will likely differ.

---

## Acceptance criteria (what "done" looks like)

- [ ] `AGENTS.md` audit complete — gate count documented
- [ ] `constitution.md` exists at repo root with all 4 required elements
- [ ] `constitution.md` has ≥ 2 machine-verifiable gates
- [ ] `docs/issues/ISSUE-47-delegatable-spec.md` exists with all 6 elements
- [ ] Clarify-phase questions recorded somewhere (a file, a comment, a PR description)
- [ ] Two-run consistency demonstrated for Style B spec

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
