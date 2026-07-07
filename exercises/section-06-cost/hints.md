# Hints — Section 6

**Hint 1 (capability classification)**  
Classification tasks require: understanding a short text, mapping it to one of ~5 categories.
This does not require frontier capability. Haiku or Sonnet handles it reliably.

Implementation tasks require: multi-step reasoning, code generation, understanding
cross-file dependencies. Frontier model earns its cost here.

Architectural review tasks require: deep understanding of trade-offs, ADR compliance
checks, security implications. Frontier is appropriate.

**Hint 2 (eval suite on two tiers)**  
Run your `harness/evals/run_suite.py` from Section 2 against both models on the
same 5 classification golden cases. If both score 5/5, the small model is sufficient.
If the small model scores 4/5, investigate the failure before routing.

**Hint 3 (Batch API)**  
The Batch API is best for tasks where you don't need the result within the same session.
Commit message generation fits this perfectly: you can generate the commit message
after the PR is opened, not before. See the Anthropic Batch API docs for Python examples.

**Hint 4 (cost projection — useful numbers)**  
At the time of writing (prices vary — check the current docs):
- Opus: ~$15 / 1M input tokens, ~$75 / 1M output tokens
- Haiku: ~$0.80 / 1M input tokens, ~$4 / 1M output tokens
A typical classification call uses ~500 input tokens and ~50 output tokens.
A typical implementation call uses ~8,000 input tokens and ~2,000 output tokens.

Batch API pricing is typically 50 % of on-demand pricing.
