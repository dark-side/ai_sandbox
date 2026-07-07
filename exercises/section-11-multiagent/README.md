# Section 11 — Multi-Agent Orchestration

> **Scenario:** 5 engineers want to run the harness as a shared team asset. The current single-agent
> design is a bottleneck — one engineer's long-running implementation blocks everyone else.
> The proposed design: one coordinator, three specialised subagents (impl, test, docs).

**How we solve it:** design context isolation between agents, define a typed handoff, evaluate
per-agent and end-to-end, annotate coverage gaps, then propagate traces across the full pipeline.

---

## Tasks

### 1. Design context isolation

Each subagent should receive only the context it needs. Write spec files that define
exactly what each subagent receives:

| Subagent | Receives | Does NOT receive |
|---|---|---|
| `impl` | Own spec (goal, in-scope files, acceptance criteria), relevant ADRs, existing source files | Test files, doc files, constitution |
| `test` | `ImplHandoff.changed_files` + `ImplHandoff.api_changes`, own spec (which files to test, coverage threshold, which behaviours to verify) | Full codebase, ADRs, implementation source |
| `docs` | `ImplHandoff.api_changes` + `ImplHandoff.implementation_summary`, own spec (what the output description must contain) | Code, tests, ADRs |

Create `harness/multiagent/specs/impl_agent.md`, `test_agent.md`, `docs_agent.md`.
Each spec file is the complete system prompt for that subagent.

---

### 2. Define typed handoff objects

Create `harness/multiagent/handoff_schema.py` with dataclasses or TypedDicts matching
the coordinator's typed handoff protocol. Each subagent returns a typed object, not
free-form text. If a required field is missing, the coordinator halts and logs which
agent output was incomplete.

```python
@dataclass
class ImplHandoff:
    """Returned by the impl-agent to the coordinator."""
    changed_files: list[str]           # files modified
    implementation_summary: str        # what was implemented and why
    api_changes: list[str]             # changed public interfaces (empty if none)

@dataclass
class TestHandoff:
    """Returned by the test-agent. Receives ImplHandoff.changed_files + api_changes."""
    test_files: list[str]              # test files written or modified
    coverage: float                    # coverage % on changed files
    failures: list[str]                # test names that fail (empty = all pass)

@dataclass
class DocsHandoff:
    """Returned by the docs-agent. Receives ImplHandoff.api_changes + implementation_summary."""
    pr_description: str                # full PR/output description ready for review
```

The coordinator validates each handoff object before passing it downstream.

---

### 3. Write per-agent evals, end-to-end eval, and annotate coverage

Create eval scripts:
- `harness/multiagent/evals/eval_impl.py` — checks the impl diff is in scope, coverage ≥ 80 %
- `harness/multiagent/evals/eval_test.py` — checks test diff has ≥ 3 new test functions
- `harness/multiagent/evals/eval_docs.py` — checks commit message has required trailers
- `harness/multiagent/evals/eval_e2e.py` — runs all three in sequence, asserts overall pass

**Coverage annotations:** After running both per-agent and end-to-end evals on 10 representative
tickets, annotate each task type in `harness/multiagent/evals/coverage_annotations.md` with one of:

| Label | Meaning |
|---|---|
| **Well-supported** | Eval consistently passes; real-trace failures are rare and caught by dirty cases |
| **Partial** | Eval passes but real-trace analysis reveals edge cases the judge is not catching |
| **Gap** | No eval exists, or the eval passes on cases that fail in production |

The annotation map tells you exactly where the eval suite needs strengthening before you can
trust the orchestrated system in production.

> **Typical gap location in S11:** the handoff boundary between impl-agent and test-agent.
> The test-agent eval checks that tests pass, but no eval verifies that the tests meaningfully
> *cover* the changed files. That's a Partial or Gap annotation — fix it before shipping.

---

### 4. Implement the coordinator

Create `harness/multiagent/coordinator.py`.

The coordinator:
1. Receives a ticket; decomposes it into three separate subagent specs
2. Calls the impl subagent with its spec + relevant ADRs
3. Receives `ImplHandoff`; validates all required fields are present — halts with a log if any are missing
4. Calls the test subagent with `changed_files` and `api_changes` from `ImplHandoff`
5. Receives `TestHandoff`; validates it via `eval_test.py`
6. Calls the docs subagent with `api_changes` and `implementation_summary` from `ImplHandoff`
7. Receives `DocsHandoff`; validates it via `eval_docs.py`
8. Runs the end-to-end eval against the original ticket spec
9. Writes assembled result to `harness/runs/{date}/{ticket_id}_assembled.json`

If any subagent fails its eval, the coordinator retries once, then escalates.

---

### 5. Add per-subagent attribution trailers

Each subagent's commit should include:
```
Co-Authored-By: payflow-harness/impl-agent <noreply@payflow.internal>
Subagent-Role: impl
Parent-Span-Id: <coordinator span id>
```

This enables cross-agent parent-child span tracing from S7.

---

## Acceptance criteria

- [ ] All 3 subagent spec files exist in `harness/multiagent/specs/`
- [ ] `harness/multiagent/handoff_schema.py` exists with typed handoff objects
- [ ] Per-agent eval scripts exist and run
- [ ] `eval_e2e.py` passes on a real ticket end-to-end
- [ ] `coordinator.py` runs the full sequence and writes output to `harness/runs/`
- [ ] Traces show cross-agent parent-child spans
- [ ] `harness/multiagent/evals/coverage_annotations.md` exists with Well-supported/Partial/Gap labels for each task type

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
