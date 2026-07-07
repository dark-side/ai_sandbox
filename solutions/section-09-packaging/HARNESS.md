# PayFlow Harness — Team Onboarding Guide

> Time-to-first-run target: 30 minutes on a clean machine.

---

## 1. Prerequisites

Install these before anything else. Check versions with the commands shown.

| Tool | Required version | Check command |
|---|---|---|
| Python | 3.12+ | `python3 --version` |
| Node.js | 22+ | `node --version` |
| Java | 21+ | `java --version` |
| Go | 1.23+ | `go version` |
| Claude Code CLI | 1.x | `claude --version` |
| Anthropic API key | — | Set `ANTHROPIC_API_KEY` env var |

Set your API key:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Add it to your shell profile (`~/.zshrc` or `~/.bashrc`) so it persists.

---

## 2. First run

Clone the repo and run the harness in dry-run mode on the sample ticket:

```bash
git clone https://github.com/your-org/payflow-ai-practice
cd payflow-ai-practice

pip install -r services/payment-validator/requirements.txt

python harness/run.py \
  --ticket docs/issues/ISSUE-47-add-refund-validation.md \
  --dry-run
```

**Expected output:**
```
[dry-run] Would call model: claude-opus-4-6
[dry-run] Ticket length: 147 chars
{"status": "dry_run"}
```

If you see this, your environment is correctly configured.  
If you see an error, go to section 4 (Troubleshooting).

---

## 3. Daily workflow

**To process a ticket:**

1. Create or find a ticket file in `docs/issues/` (Markdown format, see ISSUE-47 as example).
2. Run the harness:
   ```bash
   python harness/run.py --ticket docs/issues/YOUR-TICKET.md --output /tmp/result.json
   ```
3. Review the generated output in `/tmp/result.json`.
4. Run the eval suite:
   ```bash
   python solutions/section-03-evals/deterministic.py
   ```
5. Compare your output against the reference solution in `solutions/` for the section you are working on.

**To run the full eval suite:**
```bash
python harness/evals/run_suite.py
```

Exit 0 = all pass. Exit 1 = review the output for which checks failed.

---

## 4. Troubleshooting

**Problem: `ModuleNotFoundError: No module named 'anthropic'`**  
Run: `pip install -r services/payment-validator/requirements.txt`

**Problem: `Error: ANTHROPIC_API_KEY not set`**  
Set the env var: `export ANTHROPIC_API_KEY=sk-ant-...`  
Or add it to your shell profile and restart your terminal.

**Problem: `Eval suite fails with coverage < 80%`**  
This is intentional — see `exercises/section-03-evals/README.md`. The exercises build the
missing tests. If you've completed Section 3, run `pytest --cov` to verify your coverage.

---

## 5. Team conventions

**To propose a change to `constitution.md` or `AGENTS.md`:**
1. Create a new git branch locally.
2. Make the change and write a short explanation of why in the commit message.
3. Requires peer review from at least one other engineer before the change is adopted.
4. Do not edit these files unilaterally — they are the source of truth for all agents on the team.

**Do not copy `AGENTS.md` to your `~/.claude/` user config.**  
Project-scope config overrides user-scope config. If you add a user-level `AGENTS.md`,
CI will fail and warn you. See `.github/workflows/ci.yml`.

**To add a new agent skill:**  
Add a Markdown file to `.claude/skills/` and commit it. Skill files are project-scoped —
all teammates inherit them on `git pull`. See `exercises/section-09-packaging/README.md`.
