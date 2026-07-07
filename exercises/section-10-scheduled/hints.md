# Hints — Section 10

**Hint 1 (blast-radius stop hook)**  
The blast-radius stop is a counter that increments every time the scope enforcer fires.
After 3 consecutive violations, it writes a flag file and the harness checks for it before
each ticket:
```python
BLAST_RADIUS_FILE = Path("harness/runs/.blast_radius_halt")

def check_blast_radius():
    if BLAST_RADIUS_FILE.exists():
        raise SystemExit("Blast-radius halt: 3 consecutive scope violations. Manual review required.")

def increment_blast_radius():
    count = int(BLAST_RADIUS_FILE.read_text()) if BLAST_RADIUS_FILE.exists() else 0
    count += 1
    if count >= 3:
        BLAST_RADIUS_FILE.write_text(str(count))
        raise SystemExit("Blast-radius halt triggered.")
    BLAST_RADIUS_FILE.write_text(str(count))
```

**Hint 2 (ticket filter — GitHub API)**  
Use the GitHub CLI in the workflow to filter tickets:
```bash
gh issue list \
  --label "agent-ready" \
  --state open \
  --limit 20 \
  --json number,title,updatedAt \
  | python3 -c "
import json, sys
from datetime import datetime, timezone, timedelta
issues = json.load(sys.stdin)
cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
filtered = [i for i in issues if datetime.fromisoformat(i['updatedAt'].replace('Z','+00:00')) < cutoff]
print(json.dumps(filtered[:10]))
"
```

**Hint 3 (dry-run mode)**  
In dry-run mode, the harness should: load tickets, build prompts, print what it *would* call,
but not make any API calls or open any PRs. Add a `--dry-run` flag to `harness/run.py`
(it already exists as a stub) and check the `DRY_RUN` env var in the nightly workflow.

**Hint 4 (cost alert — rolling average)**  
Store the per-run cost in `harness/runs/{date}/summary.json`. Compute the 30-day rolling
average by reading all summary files in the last 30 days:
```python
import json
from pathlib import Path
from datetime import date, timedelta

runs_dir = Path("harness/runs")
costs = []
for d in range(30):
    day = date.today() - timedelta(days=d)
    summary = runs_dir / day.isoformat() / "summary.json"
    if summary.exists():
        costs.append(json.loads(summary.read_text())["avg_cost_per_ticket"])
rolling_avg = sum(costs) / len(costs) if costs else 0
```

**Hint 5 (unattended vs interactive guardrails)**  
The key difference: in interactive mode, an engineer can see a bad output and stop.
In unattended mode, nothing stops it except a programmatic gate. Every risk you accepted
in interactive mode because "I'll notice it" now needs an automated gate.
List the manual checks you currently do after each interactive run. Those are your unattended guardrails.
