# Hints — Section 4

**Hint 1 (labelling phases)**  
The key distinction between "automated check" and "agentic" is whether an LLM is involved.
Running `pytest` is an automated check. Having the agent write the test is agentic.
Human gates are where a person must explicitly approve: a PR approval, a deployment sign-off.

**Hint 2 (the 2-minute test)**  
The most common failure here is writing the human touchpoints in technical jargon.
"The pre-push hook invokes the eval suite" doesn't answer "where is the human in the loop".
"A human engineer must approve the generated PR before it can be merged" does.

**Hint 3 (failure modes — common ones to include)**  
- Agent writes to files outside the declared scope
- Agent changes the fraud rejection threshold (violating ADR-002)
- Eval suite passes on a dirty output because the judge prompt is under-specified
- Harness runs but costs exceed the monthly budget because no gate stops it

**Hint 4 (escalation policy)**  
The escalation policy should answer three questions:
1. What triggers escalation? (e.g. "ambiguity in the spec", "eval suite fails 3 times")
2. Who is notified? (e.g. "the ticket's assigned engineer")
3. What does the agent do while waiting? (e.g. "stop, write a summary, open a draft PR")
