#!/usr/bin/env python3
"""
Reference Solution (S11) — harness/multiagent/coordinator.py

One coordinator, three specialised subagents (impl, test, docs) with context isolation:
each subagent receives only its own spec plus the specific handoff fields it needs — never
the full ticket, full codebase, or constitution. Trace context (trace_id + coordinator
span id) is propagated to every subagent so a failure surfaces as a child span, not an
opaque coordinator error.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from opentelemetry import trace

from handoff_schema import (
    DocsHandoff,
    HandoffValidationError,
    ImplHandoff,
    TestHandoff,
)

tracer = trace.get_tracer("payflow.multiagent")
SPECS = Path(__file__).parent / "specs"
RUNS = Path(__file__).parent.parent / "runs"


class Coordinator:
    def __init__(self, dispatch, coverage_threshold: float = 0.80, max_retries: int = 1):
        # `dispatch(role, spec, context)` runs one subagent and returns its raw output.
        self.dispatch = dispatch
        self.coverage_threshold = coverage_threshold
        self.max_retries = max_retries

    def _run_subagent(self, role: str, context: dict):
        """Dispatch one subagent as a child span, with a single retry on failure."""
        spec = (SPECS / f"{role}_agent.md").read_text()
        last_exc: Exception | None = None
        for attempt in range(self.max_retries + 1):
            with tracer.start_as_current_span(f"payflow.multiagent.{role}") as span:
                span.set_attribute("subagent.role", role)
                span.set_attribute("subagent.attempt", attempt)
                try:
                    return self.dispatch(role, spec, context)
                except Exception as exc:  # noqa: BLE001
                    span.record_exception(exc)
                    last_exc = exc
        raise RuntimeError(f"{role}-agent failed after {self.max_retries + 1} attempts") from last_exc

    def run(self, ticket_id: str, ticket_spec: dict) -> dict:
        with tracer.start_as_current_span("payflow.multiagent.coordinator") as root:
            root.set_attribute("ticket.id", ticket_id)

            # 1. impl-agent — own spec + relevant ADRs only
            impl: ImplHandoff = self._run_subagent(
                "impl", {"spec": ticket_spec["impl"], "adrs": ticket_spec.get("adrs", [])}
            )
            self._guard(impl.validate)

            # 2. test-agent — only the fields it needs from the impl handoff
            test: TestHandoff = self._run_subagent(
                "test",
                {
                    "spec": ticket_spec["test"],
                    "changed_files": impl.changed_files,
                    "api_changes": impl.api_changes,
                },
            )
            self._guard(lambda: test.validate(self.coverage_threshold))

            # 3. docs-agent — api_changes + implementation_summary only
            docs: DocsHandoff = self._run_subagent(
                "docs",
                {
                    "spec": ticket_spec["docs"],
                    "api_changes": impl.api_changes,
                    "implementation_summary": impl.implementation_summary,
                },
            )
            self._guard(lambda: docs.validate(impl.api_changes))

            # 4. end-to-end eval against the ORIGINAL ticket spec (catches assembly failures)
            e2e_pass = self._end_to_end_eval(ticket_spec, impl, test, docs)
            root.set_attribute("e2e.pass", e2e_pass)

            return self._assemble(ticket_id, impl, test, docs, e2e_pass)

    @staticmethod
    def _guard(fn) -> None:
        """Run a handoff validator; a failure halts the pipeline with the offending agent."""
        try:
            fn()
        except HandoffValidationError as exc:
            span = trace.get_current_span()
            span.set_attribute("handoff.invalid", str(exc))
            raise

    @staticmethod
    def _end_to_end_eval(ticket_spec, impl, test, docs) -> bool:
        # Per-agent evals passed; this checks the ASSEMBLED result against the ticket spec.
        return bool(impl.changed_files and not test.failures and docs.pr_description)

    @staticmethod
    def _assemble(ticket_id, impl, test, docs, e2e_pass) -> dict:
        out = {
            "ticket_id": ticket_id,
            "changed_files": impl.changed_files,
            "test_files": test.test_files,
            "coverage": test.coverage,
            "pr_description": docs.pr_description,
            "e2e_pass": e2e_pass,
            "attribution": [
                {"role": "impl", "model": "claude-sonnet-4-6"},
                {"role": "test", "model": "claude-sonnet-4-6"},
                {"role": "docs", "model": "claude-haiku-4-5-20251001"},
            ],
        }
        dest = RUNS / str(date.today()) / f"{ticket_id}_assembled.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(out, indent=2))
        return out
