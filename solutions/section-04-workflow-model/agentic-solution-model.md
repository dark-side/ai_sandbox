# PayFlow Agentic Solution Model

Version: 1.1  
Date: 2026-07-01

---

## 1. Workflow

The PayFlow Ticket-to-output workflow has 7 phases:

| Phase | Type | Description |
|---|---|---|
| 1. Ticket ingestion and spec validation | Automated check | Harness receives the ticket; validates it against the 6-element spec format |
| 2. Clarify phase | Agentic | Agent reads the spec and surfaces every ambiguity before planning starts |
| 3. Plan generation | Agentic | Agent reads relevant source files, retrieves top-3 ADRs, and proposes a change plan |
| 4. Implementation | Agentic | Agent writes implementation and test code within the declared scope |
| 5. Eval gate (deterministic + judge) | Automated check | Deterministic assertions + LLM judge run; failure blocks progression |
| 6. Output assembly and summary write to `harness/runs/` | Agentic | Agent assembles output, writes structured run summary to `harness/runs/{date}/{ticket_id}.md` |
| 7. Human review | Human gate | Engineer reviews output; approves, requests changes, or escalates |

**There is always a human gate (phase 7) before any output is acted upon.**

---

## 2. Agents

| Agent | Scope | Access permissions |
|---|---|---|
| Coordinator | Reads ticket, dispatches phases, writes run summary | Read: repo root; Write: `harness/runs/` only |
| Impl agent | Generates implementation and tests | Read: `services/payment-validator/`, ADRs; Write: `services/payment-validator/` only |
| Clarify agent | Asks ambiguity questions | Read: spec, constitution, ADRs; Write: none |
| Eval agent | Runs deterministic assertions and judge eval | Read: test output, diffs; Write: `harness/evals/` only |

All agents are bound by `constitution.md`. No agent may write outside its declared scope.

---

## 3. Tools and MCP

| Tool | Permission tier | Agent(s) that use it |
|---|---|---|
| `Read` | Read-only | All agents |
| `Write` | Scoped write (enforced by pre-tool hook) | Impl agent, Coordinator |
| `Edit` | Scoped write (enforced by pre-tool hook) | Impl agent |
| `Bash` (pytest, coverage) | Execute — test commands only | Eval agent |
| `Bash` (git commit) | Execute — commit with attribution trailers | Coordinator |
| `mcp__adr_retriever` | Read-only, `docs/adr/` | Clarify agent, Impl agent |

The scope-enforcer pre-tool hook intercepts every `Write` and `Edit` call and exits 1
(blocking the write) if the target path is outside the agent's declared scope.

---

## 4. Validation

| Phase boundary | Eval checks | Failure means |
|---|---|---|
| After spec validation (phase 1 → 2) | 6-element spec completeness check | Harness halts; writes missing-field report to `harness/runs/` |
| After clarify phase (phase 2 → 3) | Ambiguity list non-empty check | Human must resolve questions before plan generation proceeds |
| After implementation (phase 4 → 5) | Scope check; coverage ≥ 80 %; existing tests pass | Impl agent retries once; then escalates to human |
| After eval gate (phase 5 → 6) | Deterministic assertions + LLM judge | Harness halts; writes structured failure report to `harness/runs/` |
| After output assembly (phase 6 → 7) | Run summary completeness check | Human is notified of incomplete summary before review |

---

## 5. Human intervention

| Where | Who | Why |
|---|---|---|
| Phase 2 (Clarify) — ambiguity resolution | Ticket assignee | Agent cannot safely plan without confirmed scope |
| Phase 7 (Human review) | Assigned engineer | Verify implementation correctness and spec compliance before acting on output |
| Escalation — eval gate fails after 2 retries | Assigned engineer | Resolve the failure the agent cannot auto-fix |
| Constitution amendment | Platform team (≥ 1 approver) | Governance: any change to the rules requires human sign-off |

**A new engineer can answer "where is the human in the loop?" by reading this section alone.**

---

## 6. Economics

| Metric | Value | Notes |
|---|---|---|
| Cost per invocation (classification) | ~$0.002 | Routes to `claude-haiku-4-5-20251001` |
| Cost per invocation (implementation) | ~$0.08 | Routes to `claude-opus-4-6` |
| Cost per invocation (judge eval) | ~$0.01 | Single Haiku call |
| Latency tier (implementation phase) | p95 < 30 s | Model call + tool calls |
| Latency tier (full run) | p95 < 90 s | All phases combined |
| Eval pass rate target | ≥ 85 % | If weekly pass rate drops below this threshold, trigger a human review of the eval suite and harness configuration |
