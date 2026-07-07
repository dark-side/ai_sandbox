---
name: spec-validation
description: Validates that a ticket file meets the 6-element delegatable spec format before implementation begins.
---

## Steps

1. Read the ticket file at the path provided.
2. Check for all 6 required elements:
   - **Context** — why the work is needed
   - **Scope** — which files may be modified
   - **Acceptance criteria** — observable, testable outcomes
   - **Out of scope** — what must NOT be done
   - **Test strategy** — what kinds of tests are required
   - **Definition of done** — the final state of the branch
3. For any missing element, produce a clear message: "MISSING: [element name] — [what is needed]"
4. Exit with VALID or INVALID and a list of gaps.

## Expected output

```
VALID — all 6 elements present.
```
or
```
INVALID — missing elements:
  - Scope: no list of allowed files
  - Acceptance criteria: criteria present but none are machine-verifiable
```
