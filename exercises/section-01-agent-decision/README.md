# Section 1 — When to Use an Agent

> **Scenario:** Your team wants to automate three things: (1) formatting commit messages to
> a conventional-commit standard; (2) classifying incoming bug tickets by severity; (3) implementing
> features end-to-end from a ticket with tests and a PR. Someone proposes running all three
> as Claude Code agent sessions.

---

## The L3 → L4 shift

At L3 the human is the quality gate on every output. At L4 the human is accountable at
checkpoints; the eval suite is the gate between checkpoints. This shift requires consistent
team-wide L3 as the precondition: **every engineer on the squad must be able to run a personal
harness reliably and independently** before the team attempts to orchestrate them together.
The twelve sections of this curriculum build that foundation one layer at a time.

**L4 precondition check:** Can every engineer on the squad run the same workflow reliably
and independently? Can they write a delegatable spec, run the harness, and review output at
the outcome level rather than line by line? Yes to both: the team meets the L4 precondition.
No to either: the bottleneck is L3 consistency, not orchestration complexity.

---

## The decision problem

Each of those three tasks has different complexity, cost, and error-rate characteristics.
Choosing an agent for tasks 1 or 2 pays 10x the cost for the same output. Choosing a single
call for task 3 misses all the capability that makes agentic engineering valuable.

**How we solve it:** apply the autonomy and economics test to each task before writing any
harness code, then document the decision so it can be reviewed.

---

## Tasks

### 1. Apply the three-question test to each task

For each task, answer:
1. Does it require multi-step reasoning where the next step depends on the previous output?
2. Does it require tool use with real-world side effects?
3. Would quality degrade if you reduced it to a single call?

If answers are NO / NO / NO → it is a **single call**.  
If the task has a fixed sequence of operations → it is a **workflow**.  
If steps are unknown until output is seen and tools affect the world → it is an **agent**.

Create `docs/adr/ADR-005-execution-model-decision.md` and fill in the table:

| Task | Multi-step? | Tool use? | Quality degrades as single call? | Execution model |
|---|---|---|---|---|
| Format commit message | ? | ? | ? | ? |
| Classify ticket severity | ? | ? | ? | ? |
| Implement feature end-to-end | ? | ? | ? | ? |

---

### 2. Quantify cost and latency for each execution model

For each task, estimate:
- **Cost per invocation** at the appropriate model tier (token count × price)
- **Latency tier**: sync (user-facing, < 2 s) vs async (background, minutes OK)
- **Error rate**: near-zero for deterministic tasks, non-zero for agents (requiring eval gates)

Add a "Economics" column to your ADR table.

At the current PayFlow volume (200 commit messages/day, 50 ticket classifications/day,
5 feature implementations/day), calculate the monthly cost for each execution model choice.

---

### 3. Write an Agentic Decision Record (ADR-005)

The Agentic Decision Record is distinct from a regular ADR — it captures:
- The execution model chosen (call / workflow / agent)
- The cost per invocation at expected volume
- The latency tier
- The eval gate required before production (for any agentic task)

Save to `docs/adr/ADR-005-execution-model-decision.md`.

The harness runner (`harness/config.yaml`) must reflect this decision: tasks classified as
"call" or "workflow" should not route through the full agentic harness.

---

## Acceptance criteria

- [ ] ADR-005 created with all three tasks classified
- [ ] Each task has: execution model, cost per invocation, latency tier
- [ ] Any agentic task has an eval gate requirement documented
- [ ] `harness/config.yaml` updated to reflect non-agentic tasks (commit formatting, classification)
- [ ] Monthly cost estimate calculated for current PayFlow volume

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
