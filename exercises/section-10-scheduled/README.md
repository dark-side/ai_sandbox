# Section 10 — Scheduled and Unattended Dispatch

> **Scenario:** The Ticket-to-PR harness runs well interactively. The manager asks whether it
> can run nightly: pick up all tickets with the "agent-ready" label not completed during the day,
> process them overnight, and post a Slack summary by 7am.

---

## Why unattended is harder than interactive

An interactive session has an engineer watching every output. A nightly job has nobody watching
until the Slack message arrives. A guardrail failure in an interactive session produces one bad
output. A guardrail failure in a nightly job produces 10 bad PRs before anyone wakes up.

Unattended operation requires **stricter guardrails than interactive sessions**, not the same ones.

**How we solve it:** tighten every guardrail before scheduling anything, configure the trigger
logic with a dry run, then add quality and cost alerts before the first real run.

---

## Tasks

### 1. Tighten all guardrails before enabling the scheduled job

Before enabling any scheduled job, audit three layers:

**Enforcement gates:**
- Confirm every pre-tool hook from Section 7 (scope enforcer, dual-LLM wrapper) is registered and has a passing failure-injection test.
- Add a "blast-radius stop" hook: if the eval pass rate on the first 3 tickets is below 80 %, halt the entire job — a systematic failure should stop early rather than produce 20 bad outputs.

**Tool permissions:**
- Remove `git push` from the tool set. The nightly job writes results to `harness/runs/{date}/` only — it does not commit or push anything.
- Remove any shell commands that are not strictly necessary.

**Spend cap:**
- Add a hard token budget to `harness/config.yaml`: if total tokens for the run exceed the cap, stop and alert.

Document your audit in `docs/nightly-job-guardrails.md`.

---

### 2. Create `.github/workflows/nightly.yml`

The file `.github/workflows/nightly.yml` is intentionally
missing — this is the exercise.

Create it with:
- Trigger: `cron: '0 23 * * 1-5'` (11pm UTC, Monday–Friday)
- Ticket filter: GitHub issues with label `agent-ready`, not modified in last 2 hours
- Cap: maximum 10 tickets per run
- Dry-run mode: triggered manually via `workflow_dispatch` with `dry_run: true` input
- Structured output: each ticket result written to `harness/runs/{date}/{ticket_id}.json`

```yaml
name: Nightly Harness Run

on:
  schedule:
    - cron: '0 23 * * 1-5'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Dry run (no API calls, no files written)'
        type: boolean
        default: true

jobs:
  nightly:
    runs-on: ubuntu-latest
    steps:
      # ... your implementation
```

---

### 3. Add quality and cost alerting

Two alerts must fire **before** the morning summary is posted:

**Quality alert:** If eval pass rate < target (from your Agentic Solution Model in Section 4),
post a message listing: failed tickets, which eval check failed, and what the agent produced.

**Cost alert:** If cost per ticket > 1.5× the p95 baseline from your Section 8 traces, post
a warning. Include the ticket IDs that drove the spike.

Implement alerts in `harness/nightly_alerts.py`. The alerts must fire before the summary —
an engineer reading Slack at 6:50am should see alerts before the summary, not after.

---

### 4. Test with a dry run before enabling

Before enabling the real nightly schedule:
1. Trigger manually via `workflow_dispatch` with `dry_run: true`
2. Confirm the ticket filter selects the right tickets
3. Confirm the blast-radius stop hook fires on a synthetic scope violation
4. Confirm the cost alert fires when given a mocked high-cost run

Document the dry-run results in `docs/nightly-job-guardrails.md`.

---

## Acceptance criteria

- [ ] `docs/nightly-job-guardrails.md` exists with audit of all 3 layers
- [ ] Blast-radius stop hook implemented and tested
- [ ] `harness/config.yaml` has a hard token budget cap
- [ ] `.github/workflows/nightly.yml` exists with correct trigger, filter, cap, and dry-run mode
- [ ] `harness/nightly_alerts.py` implements quality and cost alerts
- [ ] Dry run completes with no real API calls and correct ticket selection
- [ ] Both alerts tested (quality and cost threshold crossing)

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
