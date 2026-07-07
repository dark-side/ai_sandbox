# ADR-005: Execution Model Decision for PayFlow Automation Tasks

**Status:** Accepted  
**Date:** 2026-07-01  
**Deciders:** Platform team

---

## Context

The team proposed running three automation tasks as Claude Code agent sessions.
This ADR applies the three-question framework to each task and documents the correct execution model.

## Decision

### Task classification

| Task | Multi-step? | Tool use w/ side effects? | Quality degrades as single call? | Execution model | Model tier |
|---|---|---|---|---|---|
| Format commit message | No | No | No | **Single call** | Small (Haiku) |
| Classify ticket by severity | No | No | No | **Single call** | Small (Haiku) |
| Implement feature end-to-end | Yes | Yes (write, test, commit) | Yes | **Agent** | Frontier (Opus) |

### Rationale

**Commit message formatting** is a deterministic transformation: given a `git diff`, produce a
conventional-commit string. The transformation is rule-based. Using an agent adds latency and cost
with zero quality benefit.

**Ticket classification** maps free-text to one of ~5 severity labels. This is a single-prompt
classification task. A small model handles it reliably.

**Feature implementation** requires: reading multiple files (next step depends on previous output),
writing code, running tests (real-world side effects), interpreting results, making corrections.
The number of steps is unknown until execution begins. → Agent.

### Cost implications at PayFlow volume

| Task | Volume | Tokens/call | Monthly cost at Haiku | Monthly cost if routed to Opus |
|---|---|---|---|---|
| Commit formatting | 200/day | ~600 | ~$0.08 | ~$0.90 |
| Ticket classification | 50/day | ~400 | ~$0.02 | ~$0.60 |
| Feature implementation | 5/day | ~12,000 | N/A (frontier required) | ~$135 |

Running all three on Opus would cost ~$137/month. Running classification and formatting on
Haiku costs ~$0.10/month for those tasks — a 99 % reduction.

### Eval gate requirement for agent task

Before feature implementation runs in production, an eval suite must pass:
1. All modified files in declared scope
2. Test coverage ≥ 80 % on `payment-validator/`
3. Judge check: interface contract compliance
4. All existing tests pass

This is implemented in Section 3 (Evaluation-Driven Development).

## Consequences

- `harness/config.yaml` must not route commit formatting or ticket classification through
  the full agent harness. These tasks get a direct `messages.create` call with `claude-haiku-4-5-20251001`.
- Agent task (feature implementation) requires an eval gate before any output is committed.
- Monthly cost for non-agent tasks: < $1. Agent tasks: ~$135 at current volume.
