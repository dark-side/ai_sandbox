#!/usr/bin/env python3
"""
Reference Solution (S8) — harness/observability/metrics.py

Computes the four operational metrics the manager asked for, straight from exported
spans. Input is a list of span dicts (as produced by an OTLP exporter or the JSON
console exporter); grouped by ticket via the root `payflow.harness.ticket` span.

    1. Eval pass rate    — count(eval pass) / count(eval runs)
    2. $/ticket          — sum(cost_usd) over model_call spans, per ticket
    3. p95 latency       — 95th percentile of model_call duration (ms)
    4. Tool failure rate — count(tool ERROR) / count(tool_invocation)
"""

from __future__ import annotations

import math
from collections import defaultdict


def _duration_ms(span: dict) -> float:
    return (span["end_time"] - span["start_time"]) / 1e6  # ns → ms


def eval_pass_rate(spans: list[dict]) -> float:
    evals = [s for s in spans if s["name"] == "payflow.harness.eval_suite"]
    if not evals:
        return float("nan")
    passed = sum(1 for s in evals if s["attributes"].get("eval.pass") is True)
    return passed / len(evals)


def cost_per_ticket(spans: list[dict]) -> dict[str, float]:
    by_ticket: dict[str, float] = defaultdict(float)
    ticket_of = _ticket_index(spans)
    for s in spans:
        if s["name"] == "payflow.harness.model_call":
            by_ticket[ticket_of.get(s["span_id"], "unknown")] += s["attributes"].get("cost_usd", 0.0)
    return dict(by_ticket)


def p95_latency_ms(spans: list[dict]) -> float:
    durations = sorted(_duration_ms(s) for s in spans if s["name"] == "payflow.harness.model_call")
    if not durations:
        return float("nan")
    idx = math.ceil(0.95 * len(durations)) - 1
    return durations[max(0, idx)]


def tool_failure_rate(spans: list[dict]) -> float:
    tools = [s for s in spans if s["name"] == "payflow.harness.tool_invocation"]
    if not tools:
        return float("nan")
    failed = sum(1 for s in tools if s["attributes"].get("tool.status") == "ERROR")
    return failed / len(tools)


def _ticket_index(spans: list[dict]) -> dict[str, str]:
    """Map every span id to the ticket.id of its root ancestor."""
    by_id = {s["span_id"]: s for s in spans}
    resolved: dict[str, str] = {}
    for s in spans:
        cur = s
        while cur.get("parent_id") and cur["parent_id"] in by_id:
            cur = by_id[cur["parent_id"]]
        resolved[s["span_id"]] = cur["attributes"].get("ticket.id", "unknown")
    return resolved


def dashboard(spans: list[dict]) -> dict:
    """The four numbers that answer the manager's four questions."""
    costs = cost_per_ticket(spans)
    return {
        "eval_pass_rate": round(eval_pass_rate(spans), 3),
        "avg_cost_per_ticket_usd": round(sum(costs.values()) / max(1, len(costs)), 4),
        "p95_model_latency_ms": round(p95_latency_ms(spans), 1),
        "tool_failure_rate": round(tool_failure_rate(spans), 3),
    }


if __name__ == "__main__":
    import json
    import sys

    spans = json.load(sys.stdin)
    print(json.dumps(dashboard(spans), indent=2))
