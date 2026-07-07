# Reference Solution — Section 11: Multi-Agent Orchestration

Files in this reference solution:

- `handoff_schema.py` — typed handoff objects (`ImplHandoff`, `TestHandoff`, `DocsHandoff`)
  with `validate()` methods the coordinator calls before passing data downstream.
- `coordinator.py` — coordinator that decomposes the ticket, dispatches each subagent with
  **only** its own spec + required handoff fields, validates every handoff, runs the
  end-to-end eval, propagates trace context, and assembles the result with per-agent
  attribution.
- `coverage_annotations.md` — Well-supported / Partial / Gap map over 10 tickets.

## Context isolation (Task 1)

Each subagent's spec file (`specs/impl_agent.md`, `test_agent.md`, `docs_agent.md`) is its
complete system prompt. It receives only what it needs:

| Subagent | Receives | Does NOT receive |
|---|---|---|
| impl | own spec, relevant ADRs, source files | test/doc files, constitution |
| test | own spec, `ImplHandoff.changed_files` + `api_changes` | full codebase, ADRs, impl source |
| docs | own spec, `ImplHandoff.api_changes` + `implementation_summary` | code, tests, ADRs |

Sending the full ticket + constitution to all three would tokenise and bill the static
content three times with no added value — the S11 cost trap.

## Typed handoffs, not free-form text (Task 2)

A missing field halts the pipeline at the offending agent with a clear message
(`HandoffValidationError`) instead of a silent downstream failure. Example: if the impl-agent
returns empty `api_changes`, the docs-agent has nothing to summarise — the coordinator catches
it at the boundary, not after a bad PR is assembled.

## Per-agent vs end-to-end evals (Task 3)

Per-agent evals check each agent against its own spec. The **end-to-end eval** checks the
*assembled* PR against the original ticket spec — it catches the failure class that only
emerges from the combination (handoff data loss, assembly errors, emergent scope violations).
Run per-agent evals first; if any fails, skip the e2e eval.

## Trace propagation + attribution (Tasks 4–5)

Every subagent call is a child span of the coordinator span, so a docs-agent failure shows up
as a child span — not an opaque coordinator error. Each subagent's commit carries a
`Subagent-Role` trailer + `Parent-Span-Id`, so any line in the merged PR is attributable to a
specific subagent and run.
