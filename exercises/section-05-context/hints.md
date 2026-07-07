# Hints — Section 5

**Hint 1 (static/dynamic ratio)**  
Log `response.usage.input_tokens` after each API call. Then log the length of
your system prompt + constitution separately (you can count tokens before the call
using the Anthropic token-counting endpoint). The ratio = static_tokens / total_input_tokens.
If it's > 0.7, you're paying for mostly static content on every call.

**Hint 2 (ADR retrieval — simple approach)**  
You don't need a vector database for 4 ADR documents. TF-IDF cosine similarity
in scikit-learn is sufficient:
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
```
Load each ADR as a document, vectorise them, then query with the ticket description.

**Hint 3 (precision@3 test queries)**  
Good test queries to measure against:
1. "implement exponential back-off for the settlement fetch" → should retrieve ADR-002
2. "change the fraud score rejection threshold" → should retrieve ADR-002
3. "add a new required field to the POST /payments response" → should retrieve ADR-004
4. "run a schema migration to add a refund_id column" → should retrieve ADR-003
5. "validate the currency code in the webhook handler" → should retrieve ADR-001

**Hint 4 (prompt caching)**  
Prompt caching requires content blocks with `cache_control`:
```python
{"type": "text", "text": constitution_text, "cache_control": {"type": "ephemeral"}}
```
The cache is reused if the prefix is identical across calls. If you randomise
the order of ADRs, the cache will miss every time.

**Hint 5 (scratchpad)**  
The summarisation call itself is cheap — use `claude-haiku-4-5-20251001` for it.
Prompt: "Summarise what has been done so far and list all active constraints from
the constitution that still apply. Be brief — this is a scratchpad, not a report."
