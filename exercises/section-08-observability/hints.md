# Hints — Section 8

**Hint 1 (OTel setup — quickest path)**  
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor

provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("payflow.harness")
```
Then wrap calls with `with tracer.start_as_current_span("payflow.harness.model_call") as span:`.
This outputs JSON traces to the console — no Langfuse account required.

**Hint 2 (cost computation)**  
Store the token counts from `response.usage` on the span as attributes.
Then compute cost:
```python
cost = (input_tokens / 1_000_000 * INPUT_PRICE) + (output_tokens / 1_000_000 * OUTPUT_PRICE)
span.set_attribute("cost_usd", cost)
```
Use current Anthropic pricing (check the API docs — prices change).

**Hint 3 (p95 latency)**  
The OTel span has `start_time` and `end_time` in nanoseconds.
Collect durations across all 3 runs, sort them, take index `int(len * 0.95)`.

**Hint 4 (fast judge — keep it cheap)**  
The fast judge should be a single call to `claude-haiku-4-5-20251001` with a
yes/no prompt: "Does this diff contain any obviously broken code — empty files,
unclosed brackets, test files with no test functions, or import errors? Answer YES or NO."
This should cost < $0.001 per run.

**Hint 5 (commit trailers)**  
A git commit trailer is a key: value line at the end of the commit message body,
separated from the body by a blank line. Use `git commit --amend --no-edit` is
risky — instead, write the trailers into the commit message at commit time using
the `GIT_EDITOR` trick or by passing the full message to `git commit -m`.
