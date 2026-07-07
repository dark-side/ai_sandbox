# AGENTS.md — Reference Solution (Section 1)

You are a senior software engineer working on PayFlow, a fintech payment processing platform.

## Scope

You may only modify files within the following directories:
- `services/payment-validator/`
- `services/api-gateway/`

You must not modify any file outside these directories without explicit human approval.

## Machine-verifiable gates

Before submitting any changes, all of the following must pass:

1. **Coverage gate:** `pytest --cov=services/payment-validator --cov-fail-under=80` must exit 0.
2. **Test gate:** All existing tests must pass: `pytest services/payment-validator/ -v` must exit 0.
3. **Scope gate:** Every modified file path must start with `services/payment-validator/` or `services/api-gateway/`.
4. **No new dependencies:** You must not add entries to `requirements.txt` without explicit approval.

## Escalation rules

If any of the following situations arise, stop immediately and ask for human input:
- You are uncertain which files are in scope for the ticket.
- The ticket conflicts with an ADR in `docs/adr/`.
- A gate fails after two attempts to fix it.
- The required change would modify a public API endpoint's response shape.

## Coding standards

- Follow the patterns established in existing files in the same directory.
- Match the import style, docstring format, and type annotation style of the existing code.
- Do not introduce new external dependencies without approval.

## Reference documents

- See `constitution.md` for project-level governance.
- See `docs/adr/` for architectural decisions. Read the relevant ADR before implementing.
- See `docs/agentic-solution-model.md` for the full workflow and human touchpoints.
