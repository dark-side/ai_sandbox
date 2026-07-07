---
name: clarify-phase
description: Asks clarifying questions about a ticket before starting implementation — surfaces ambiguities the spec may have missed.
---

## Steps

1. Read the ticket (or delegatable spec) provided.
2. Read `constitution.md` for scope and gate constraints.
3. Retrieve the top-2 relevant ADRs from `docs/adr/` for this ticket topic.
4. List every ambiguity, assumption, or missing piece of information that could cause the
   implementation to diverge from intent. Format each as a numbered question.
5. Do NOT start implementing. Wait for answers to the listed questions.

## Rules

- Only ask questions that are not already answered in the spec, constitution, or ADRs.
- Frame questions as yes/no or multiple choice where possible.
- Limit to a maximum of 5 questions — if more than 5 are needed, the spec needs rewriting.

## Expected output

```
Before I start, I need to clarify 3 points:

1. [Question about scope ambiguity]
2. [Question about edge case not covered in acceptance criteria]
3. [Question about ADR compliance for a specific pattern used]
```

If the spec is complete: `No clarifying questions — spec is unambiguous. Ready to plan.`
