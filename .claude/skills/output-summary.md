---
name: output-summary
description: Writes a structured summary of the harness run to harness/runs/{date}/{ticket_id}.json for review and comparison against the reference solution.
---

## Steps

1. Verify eval suite passes (`eval-run` skill). Do NOT write output if evals fail.
2. Collect: ticket ID, list of changed files, test coverage percentage, eval results.
3. Write a summary file to `harness/runs/{YYYY-MM-DD}/{ticket_id}.json`:
   ```json
   {
     "ticket_id": "ISSUE-XX",
     "timestamp": "...",
     "model": "claude-opus-4-6",
     "files_changed": ["..."],
     "coverage_pct": 84,
     "eval_result": "pass",
     "input_tokens": 12847,
     "output_tokens": 3201,
     "cost_usd": 0.43
   }
   ```
4. Print a one-line summary to stdout.
5. Print the path to the reference solution for comparison:
   `Compare your output against: solutions/section-XX-*/`

## Expected output

```
Run complete. Summary written to harness/runs/2024-12-01/ISSUE-47.json
Eval suite: 4/4 passed | Coverage: 84% | Cost: $0.43
Compare your output against: solutions/section-02-spec/
```
