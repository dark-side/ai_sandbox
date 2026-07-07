# Hints — Section 7

**Hint 1 (scope enforcer hook)**  
The hook receives the tool input via environment variable `CLAUDE_TOOL_INPUT` as JSON.
For a Write tool call, the JSON contains a `file_path` key.
```python
import json, os, sys
tool_input = json.loads(os.environ.get("CLAUDE_TOOL_INPUT", "{}"))
file_path = tool_input.get("file_path", "")
```
Exit 1 with a message to stderr to block the call.

**Hint 2 (failure-injection test)**  
The easiest way to test the hook is to attempt a write directly (not via the harness)
and assert the hook blocks it. Run a subprocess that writes to `services/billing-reconciler/`
and check the exit code.

**Hint 3 (threat model — surfaces you might miss)**  
- The ADR files: if an attacker can push a PR that modifies an ADR, they can inject
  instructions that look like architectural guidance.
- The golden dataset: if the eval golden cases can be modified, an attacker can make
  dirty outputs appear clean.
- The harness output itself: if the output is written to a file that is then executed
  (e.g. a git hook), the output is a code execution surface.

**Hint 4 (input sanitisation)**  
A minimal sanitisation approach for the ticket endpoint:
```typescript
function sanitiseTicketDescription(raw: string): string {
  const INJECTION_DELIMITERS = /^(---|###\s|SYSTEM:|IGNORE PREVIOUS|<\/?system>)/mi;
  const match = INJECTION_DELIMITERS.exec(raw);
  const truncated = match ? raw.slice(0, match.index) : raw;
  return truncated.slice(0, 2000).trim();
}
```
This is a first defence, not a complete solution — document its limitations in the threat model.
