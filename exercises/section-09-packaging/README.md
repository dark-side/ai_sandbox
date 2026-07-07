# Section 9 — Packaging and Team Distribution

> **Scenario:** You have a production-grade Ticket-to-PR harness. The manager asks you to roll
> it out to the other four engineers on the squad. You share the repo link. Three days later,
> two engineers cannot get it to run. One runs it but gets different outputs. One gets it running
> but overwrites your constitution.md with their local user-level AGENTS.md.

---

## The problem with a personal harness

The harness was built for one person. Its configuration is implicit, its dependencies are
undocumented, and agent skills exist only in your local environment. Rolling it out as-is
will produce four different versions that diverge immediately after the first `git pull`.

**How we solve it:** package the skills as committable files, scope the configuration to the
project, then validate the onboarding path with one real teammate.

---

## Tasks

### 1. Package agent skills as versioned committable files

Agent skills are stored as Markdown files in `.claude/skills/`. They are currently only in
your local environment — teammates cannot inherit them.

Export every skill the harness uses to `.claude/skills/`:
- `spec-validation.md` — validates a ticket against the 6-element spec format
- `clarify-phase.md` — asks ambiguity questions before planning
- `eval-run.md` — runs the eval suite and summarises results
- `output-summary.md` — writes a structured run summary to `harness/runs/` for local review

Each skill file must contain:
- `name:` — the trigger phrase used to invoke it
- `description:` — one sentence
- `steps:` — the instruction set
- `expected_output:` — what a successful run produces

Commit all skill files. Skills in `.claude/skills/` at project scope override user-scope skills —
this is what guarantees team consistency.

---

### 2. Set constitution and AGENTS.md to project scope

Confirm that `constitution.md` and `AGENTS.md` are at the **project root** (where you already
committed them), not in any user-level config directory (`~/.claude/`).

Add a CI check to `.github/workflows/ci.yml`:

```yaml
- name: Check for user-level AGENTS.md conflicts
  run: |
    if [ -f "$HOME/.claude/AGENTS.md" ]; then
      echo "WARNING: user-level AGENTS.md exists and may override project config"
      exit 1
    fi
```

Add a comment to `AGENTS.md` at the top:

```markdown
<!-- This file is at project scope. Do not copy it to your user-level config. -->
```

---

### 3. Write `HARNESS.md`

Create `HARNESS.md` at the repository root with exactly five sections:

1. **Prerequisites** — exact versions of tools required (Python, Node, Java, Go, Claude Code CLI)
2. **First run** — the exact command to run and the expected terminal output (dry-run mode)
3. **Daily workflow** — how to add a new ticket and run the harness locally
4. **Troubleshooting** — the three most common failure modes and their fixes
5. **Team conventions** — how to propose a change to `constitution.md` or `AGENTS.md`

**Teammate test:** Give HARNESS.md to one teammate and watch them follow it from scratch
without your help. Fix every step where they ask a question before rolling out to the full squad.
If you cannot do a live teammate test, follow it yourself from a fresh terminal with no
environment variables set — every point where you get stuck is a documentation gap.

---

## Acceptance criteria

- [ ] `.claude/skills/` directory exists with ≥ 4 skill files, each with all required fields
- [ ] All skill files are committed to the repository
- [ ] CI check added for user-level AGENTS.md conflicts
- [ ] `HARNESS.md` exists with all 5 sections
- [ ] Teammate test passed: one engineer followed HARNESS.md without assistance and reached first output in ≤ 30 min, OR self-test documented with every gap fixed

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
