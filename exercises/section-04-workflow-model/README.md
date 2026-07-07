# Section 4 — Workflow Design and Agentic Solution Model

> **Scenario:** The harness works but exists only in code. The engineering director asks for
> a one-page document proving the system is production-ready. A new engineer joined last week
> and cannot answer the question: "where is the human in the loop?"

**How we solve it:** map the workflow into phases, write the Agentic Solution Model against
those phases, then commit it as a living document next to the constitution.

---

## Tasks

### 1. Map the Ticket-to-output workflow

Draw or describe the PayFlow Ticket-to-output workflow as a sequence of phases.

For each phase, label it as one of:
- **Agentic** — the AI acts autonomously
- **Human gate** — a human must approve before proceeding
- **Automated check** — a script or CI check runs without human involvement

The workflow phases are:
1. Ticket ingestion and spec validation
2. Clarify phase
3. Plan generation
4. Implementation
5. Eval gate (deterministic + judge)
6. Output assembly and summary write to `harness/runs/`
7. Human review

Document your labelled workflow in `docs/workflow-map.md`.

---

### 2. Write `docs/agentic-solution-model.md`

The file `docs/agentic-solution-model.md` does not exist.
Create it with all 6 required fields:

| Field | Description |
|---|---|
| **Workflow** | The phase map from Step 1 |
| **Agents** | Scope and access permissions per agent |
| **Tools and MCP** | Every tool registered, its permission tier, which agent uses it |
| **Validation** | Which eval checks run at each phase boundary and what failure means |
| **Human intervention** | Exactly where and why a human is in the loop |
| **Economics** | Cost per invocation, latency tier, and the eval pass rate target that triggers a review if missed |

**The 2-minute test:** A new engineer should be able to answer
"where is the human in the loop?" in under 2 minutes by reading this document alone.

---

### 3. Link the documents

Add a line to `constitution.md` (or create a placeholder) that references
`docs/agentic-solution-model.md`:

```
See docs/agentic-solution-model.md for the full workflow model and human touchpoints.
```

Commit both files together in a single commit.

---

## Acceptance criteria

- [ ] `docs/workflow-map.md` exists with all phases labelled as agentic / human gate / automated
- [ ] `docs/agentic-solution-model.md` exists with all 6 fields completed (Workflow, Agents, Tools and MCP, Validation, Human intervention, Economics)
- [ ] The 2-minute test: a colleague can answer "where is the human?" from the doc alone
- [ ] `constitution.md` references `docs/agentic-solution-model.md`
- [ ] Both files committed together

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
