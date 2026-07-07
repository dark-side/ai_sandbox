# Capstone Project

Harden one real workflow from your project through all twelve sections.
The capstone is a **live demonstration**, not a written assessment.

---

## Workflow Options

Choose one of the following workflows to harden end-to-end:

| Discipline | Workflow |
|---|---|
| **Default** | Ticket → reviewed PR (the anchor workflow from this curriculum) |
| QA Engineering | Bug report → repro script → fix → regression test → gated merge |
| DevOps / SRE | Incident alert → triage summary → runbook step → validated fix → post-incident note |
| Data Engineering | Data quality alert → root cause analysis → pipeline patch → validation run → gated deployment |
| Business Analysis | Stakeholder request → requirements spec → acceptance criteria → review-ready document |

---

## Seven Artifacts

Produce each of these artifacts for your chosen workflow. The artifact IDs (A1–A7) are
distinct from the curriculum section numbers; the **Sections** column shows where each is built.

| Artifact | Sections | What to build |
|---|---|---|
| **A1** | 1–2 | `constitution.md` committed to the repository with ≥ 1 machine-verifiable gate. Evidence that the same ticket produces identical outputs across two engineers. |
| **A2** | 3 | One-command eval suite: ≥ 3 deterministic checks, 1 judge check, a 10-case clean/dirty golden dataset where every dirty case fails. |
| **A3** | 5 | Retrieval layer with measured precision@3 ≥ 80 % on 10 known queries. Cost per run before and after caching, measured from traces. |
| **A4** | 6 | Model routing policy with measured cost per ticket before and after. Three-scenario cost projection for 8 engineers. |
| **A5** | 4, 7 | Agentic Solution Model plus a pre-tool scope hook with a passing failure-injection test. Threat model with ≥ 3 input surfaces mapped to their mitigations. |
| **A6** | 8 | Instrumented harness with OpenTelemetry traces. Four-metric dashboard (eval pass rate, $/ticket, p95 latency, tool failure rate). AI attribution metadata on all agent-originated commits. |
| **A7** _(optional)_ | 9–11 | Packaged, scheduled, multi-agent workflow with per-agent and end-to-end evals, coverage annotations, and cross-agent trace context propagation. |

---

## Live Demonstration (20 min + 10 min panel)

Run a real ticket through your hardened harness. Show:

1. Eval suite passing on a clean ticket
2. A scope-violation attempt **blocked** by the pre-tool hook
3. A trace open with cost per ticket visible
4. Attribution trailers on the resulting commit (`git log --format="%H %s %b"`)

### Panel questions (be ready for any of these)

- "Locate a specific failure in the traces."
- "Justify one routing decision with cost data from the eval experiment."
- "Show one dirty case in the golden dataset and explain what failure mode it tests."
- "Explain the design of one enforcement gate."

---

## Acceptance criteria

- [ ] All 6 required artifacts exist (A1–A6); A7 is optional
- [ ] Live demo runs end-to-end without errors
- [ ] Scope violation is blocked by the hook during the demo
- [ ] Trace shows cost per ticket and parent-child span structure
- [ ] Attribution trailers appear on the agent-originated commit

---

## Reference solutions

Per-section reference solutions to compare against live in `solutions/section-01-agent-decision/`
through `solutions/section-12-maturity/`. Use them after you have built each artifact yourself —
they are most valuable as a comparison, not a starting point.
