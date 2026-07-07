# Hints — Section 11

**Hint 1 (context isolation — why it matters)**  
If the test subagent receives the full codebase, it will write tests that test
implementation details instead of the spec. Give it only the diff + acceptance criteria.
If the impl subagent receives the test files, it may write code to make tests pass
rather than to fulfil the spec (Goodhart's law).

**Hint 2 (coordinator pattern with the Claude SDK)**  
The simplest coordinator uses the Claude agent SDK to spawn subagents:
```python
import anthropic
client = anthropic.Anthropic()

# Each subagent is a separate messages.create call with a fresh context
impl_response = client.messages.create(
    model="claude-opus-4-6",
    system=impl_spec,
    messages=[{"role": "user", "content": ticket_handoff_to_text(handoff)}],
    ...
)
```
The coordinator is ordinary Python code that orchestrates these calls.

**Hint 3 (typed handoffs — validation)**  
Add a `validate()` method to each handoff dataclass that raises `ValueError`
if required fields are empty. The coordinator should call `validate()` on each
handoff before passing it to the next subagent.

**Hint 4 (cross-agent spans)**  
Pass the coordinator's trace/span ID to each subagent as part of the handoff.
The subagent records it as a `parent_span_id` attribute. In your observability
dashboard, filter by `parent_span_id` to see all subagent work for a given ticket.

**Hint 5 (the retry-then-escalate pattern)**  
```python
for attempt in range(2):
    result = run_subagent(handoff)
    eval_result = run_eval(result)
    if eval_result.passed:
        break
    if attempt == 1:
        escalate(handoff, eval_result)
        raise RuntimeError("Subagent failed after 2 attempts")
```
