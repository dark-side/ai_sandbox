#!/usr/bin/env python3
"""
Reference Solution (S8) — harness/run.py instrumented with OpenTelemetry spans.

Only the instrumentation-relevant parts are shown; the rest of run.py is unchanged.
Span hierarchy (parent → child):

    payflow.harness.ticket            (root, one per ticket)
    ├── payflow.harness.retrieval     (ADR retrieval, from S5)
    ├── payflow.harness.model_call    (each Anthropic API call)
    ├── payflow.harness.tool_invocation  (each tool call the agent makes)
    └── payflow.harness.eval_suite    (the eval gate run)

Follows the OpenTelemetry GenAI semantic conventions for attribute names
(gen_ai.request.model, gen_ai.usage.*).
"""

from __future__ import annotations

import os
from pathlib import Path

import anthropic
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.trace import Status, StatusCode

# ─── Tracer setup ────────────────────────────────────────────────────────────
# Swap ConsoleSpanExporter for an OTLP exporter (Langfuse / Jaeger) in production.
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("payflow.harness")

# Rough per-model rates ($/1M tokens). Keep in sync with the pricing page (S6).
RATES = {
    "claude-opus-4-6": (15.0, 75.0),
    "claude-sonnet-4-6": (3.0, 15.0),
    "claude-haiku-4-5-20251001": (0.80, 4.0),
}


def cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    in_rate, out_rate = RATES.get(model, (15.0, 75.0))
    return input_tokens / 1e6 * in_rate + output_tokens / 1e6 * out_rate


def call_model(client, model, system_prompt, messages):
    """One instrumented model call — a child span of the current ticket span."""
    with tracer.start_as_current_span("payflow.harness.model_call") as span:
        span.set_attribute("gen_ai.request.model", model)
        try:
            resp = client.messages.create(
                model=model, max_tokens=8192, system=system_prompt, messages=messages
            )
        except Exception as exc:  # record failures so tool_failure_rate is real
            span.set_status(Status(StatusCode.ERROR, str(exc)))
            raise

        in_tok = resp.usage.input_tokens
        out_tok = resp.usage.output_tokens
        span.set_attribute("gen_ai.usage.input_tokens", in_tok)
        span.set_attribute("gen_ai.usage.output_tokens", out_tok)
        span.set_attribute("cost_usd", cost_usd(resp.model, in_tok, out_tok))
        span.set_attribute("gen_ai.response.finish_reason", resp.stop_reason or "")
        return resp


def invoke_tool(name: str, fn, *args, **kwargs):
    """Wrap any tool call so failures and latency land in the trace."""
    with tracer.start_as_current_span("payflow.harness.tool_invocation") as span:
        span.set_attribute("tool_name", name)
        try:
            result = fn(*args, **kwargs)
            span.set_attribute("tool.status", "OK")
            return result
        except Exception as exc:
            span.set_attribute("tool.status", "ERROR")
            span.set_status(Status(StatusCode.ERROR, str(exc)))
            raise


def run_ticket(ticket_id: str, ticket_content: str) -> dict:
    """Root span for one ticket; every other span is a child of this one."""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    system_prompt = (Path(__file__).parent / "prompts" / "implement.md").read_text()

    with tracer.start_as_current_span("payflow.harness.ticket") as root:
        root.set_attribute("ticket.id", ticket_id)

        # Retrieval (S5) as its own child span
        with tracer.start_as_current_span("payflow.harness.retrieval") as rspan:
            adrs = invoke_tool("adr_retriever", lambda: [])  # top-k ADRs
            rspan.set_attribute("retrieval.top_k", len(adrs))

        resp = call_model(
            client, "claude-sonnet-4-6", system_prompt,
            [{"role": "user", "content": f"Implement:\n\n{ticket_content}"}],
        )

        # Eval gate (S3) as its own child span
        with tracer.start_as_current_span("payflow.harness.eval_suite") as espan:
            passed = True  # result of the real eval suite
            espan.set_attribute("eval.pass", passed)

        return {"ticket_id": ticket_id, "content": resp.content[0].text, "eval_pass": passed}
