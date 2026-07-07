#!/usr/bin/env python3
"""
Reference Solution (S11) — harness/multiagent/handoff_schema.py

Typed handoff objects passed between coordinator and subagents. Each subagent returns a
typed object, never free-form text. The coordinator validates required fields before
passing data downstream; a missing field halts the pipeline with a clear root cause
instead of a silent failure three steps later.
"""

from __future__ import annotations

from dataclasses import dataclass, field


class HandoffValidationError(ValueError):
    """Raised by the coordinator when a required handoff field is missing/empty."""


@dataclass
class ImplHandoff:
    """impl-agent → coordinator."""
    changed_files: list[str]
    implementation_summary: str
    api_changes: list[str] = field(default_factory=list)  # empty if none

    def validate(self) -> None:
        if not self.changed_files:
            raise HandoffValidationError("impl-agent: changed_files is empty")
        if not self.implementation_summary.strip():
            raise HandoffValidationError("impl-agent: implementation_summary is empty")


@dataclass
class TestHandoff:
    """test-agent → coordinator. Receives ImplHandoff.changed_files + api_changes."""
    test_files: list[str]
    coverage: float
    failures: list[str] = field(default_factory=list)  # empty = all pass

    def validate(self, coverage_threshold: float = 0.80) -> None:
        if not self.test_files:
            raise HandoffValidationError("test-agent: test_files is empty")
        if self.failures:
            raise HandoffValidationError(f"test-agent: {len(self.failures)} failing test(s)")
        if self.coverage < coverage_threshold:
            raise HandoffValidationError(
                f"test-agent: coverage {self.coverage:.0%} < {coverage_threshold:.0%}"
            )


@dataclass
class DocsHandoff:
    """docs-agent → coordinator. Receives ImplHandoff.api_changes + implementation_summary."""
    pr_description: str

    def validate(self, api_changes: list[str]) -> None:
        if not self.pr_description.strip():
            raise HandoffValidationError("docs-agent: pr_description is empty")
        # Every declared API change must be mentioned in the description.
        missing = [c for c in api_changes if c not in self.pr_description]
        if missing:
            raise HandoffValidationError(
                f"docs-agent: PR description omits api_changes: {missing}"
            )
