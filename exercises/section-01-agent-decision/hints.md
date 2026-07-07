# Hints — Section 1

**Hint 1 (three-question test — commit message)**  
A commit message formatter takes a diff as input and produces a string following a template.
The output format is deterministic given the input. Ask: does the model need to call a tool?
Does the quality degrade if you remove the agentic loop? Answer: no, no. → Single call.

**Hint 2 (three-question test — ticket classification)**  
Classification maps text to one of N categories. The categories are fixed, the input is fixed,
the output is a label. No tool use, no multi-step dependency. → Single call (or workflow if
you add a confidence threshold + escalation path).

**Hint 3 (three-question test — feature implementation)**  
Implementation requires: reading multiple files to understand context, writing code, running
tests, interpreting results, making corrections based on output. Steps are unknown until each
output is seen. → Agent.

**Hint 4 (cost quantification)**  
Commit message: ~500 input tokens, ~100 output tokens. At Haiku pricing (~$0.80/M input),
200 calls/day = 100k input tokens/day ≈ $0.08/day ≈ $2.40/month.
If you route this through an agent (Opus), the same volume costs ~$20/month for zero quality gain.

**Hint 5 (eval gate for agent tasks)**  
The eval gate for the feature-implementation agent is what you build in Section 3.
In ADR-005, write the *requirement* for the gate, not its implementation:
"Before production, an eval suite must: (1) assert all modified files are in scope,
(2) assert coverage ≥ 80%, (3) pass a judge check for interface contract compliance."
