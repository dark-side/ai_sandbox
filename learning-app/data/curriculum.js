/**
 * PayFlow Learning App — curriculum metadata.
 *
 * One entry per section: id, title, tag, icon, description, resources, and knowledge-check
 * questions. Exercise content (README.md / hints.md) is loaded dynamically from disk by
 * the server; this file contains only the static metadata that doesn't live in markdown files.
 */

window.CURRICULUM = [
  {
    id: 'section-01',
    number: 1,
    title: 'When to Use an Agent',
    tag: 'Decision Framework',
    icon: '🧭',
    color: '#7c3aed',
    description: 'Build the decision tree you apply before writing any harness. Avoid the most expensive mistake in agentic engineering: building an agent when a workflow or a single call is cheaper and more reliable.',
    outcomes: [
      'Apply the task/workflow/agent decision tree to any SDLC activity',
      'Quantify the cost and latency trade-off between a single call, a workflow, and an agent',
      'Identify the two axes (autonomy and reliability/economics)',
    ],
    resources: [
      { title: 'Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents', source: 'Anthropic', time: '15 min' },
      { title: 'A Practical Guide to Building Agents', url: 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf', source: 'OpenAI', time: '20 min' },
      { title: 'Writing Effective Tools for Agents', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/writing-effective-tools', source: 'Anthropic Docs', time: '10 min' },
    ],
    quiz: [
      {
        q: 'Commit message formatting runs 200 times per day. Each output is deterministic given the diff. Which execution model is correct?',
        options: [
          'An agent, because it requires tool use to read the git diff.',
          'A workflow with three steps: read diff, classify change type, format message.',
          'A single model call: the transformation is deterministic and rule-based; adding an agent introduces cost and latency with no quality benefit.',
          'A workflow with a human review gate before each commit message is posted.',
        ],
        correct: 2,
        explanation: 'The transformation is deterministic and rule-based. An agent would pay 10× the cost for the same output with no quality benefit.',
      },
      {
        q: 'Feature implementation is placed in the agent tier. What additional artifact is required before running it in production?',
        options: [
          'A system prompt with detailed instructions for the model.',
          'A CI job that triggers the agent on each new ticket.',
          'An eval gate: deterministic and judge-based suite that scores output before it is shipped, because agentic tasks have a non-zero error rate.',
          'A human sign-off on every output before the PR is opened.',
        ],
        correct: 2,
        explanation: 'Agentic tasks have a non-zero error rate. An eval suite (not human sign-off on every output) is the scalable gate.',
      },
      {
        q: 'The manager asks: "What does the agent cost per feature ticket?" You answer: 20,000 tokens at current pricing. What is the most important follow-up number?',
        options: [
          'The number of parameters in the model used.',
          'The p50 latency of the agent session.',
          'The eval pass rate: cost per ticket is only meaningful paired with quality rate, because a cheaper agent at 40% pass rate costs more in rework.',
          'The number of tool calls per session.',
        ],
        correct: 2,
        explanation: 'Cost per ticket is meaningless without quality rate. A 40% pass rate means 60% of tickets need human rework — which costs more than the token savings.',
      },
    ],
  },
  {
    id: 'section-02',
    number: 2,
    title: 'Specification as Source of Truth',
    tag: 'Spec Engineering',
    icon: '📋',
    color: '#0891b2',
    description: 'Every agentic failure mode — scope drift, inconsistent output, silent regression — traces back to a spec that was missing, vague, or not enforced. This section eliminates that root cause.',
    outcomes: [
      'Distinguish advisory instructions from deterministic gates in an existing harness',
      'Write a committed constitution.md that constrains every session',
      'Rewrite any ticket as a six-element delegatable spec',
      'Run a clarify phase that surfaces ambiguities before implementation begins',
    ],
    resources: [
      { title: 'Agent Skills: Process Over Prose', url: 'https://addyo.substack.com/p/agent-skills', source: 'Addy Osmani', time: '15 min' },
      { title: "Claude's Constitution", url: 'https://www.anthropic.com/research/claudes-constitution', source: 'Anthropic', time: '20 min' },
      { title: 'Specification by Example', url: 'https://martinfowler.com/bliki/SpecificationByExample.html', source: 'Martin Fowler', time: '10 min' },
      { title: 'Best Practices for Claude Code', url: 'https://docs.anthropic.com/en/docs/claude-code/best-practices', source: 'Anthropic Docs', time: '15 min' },
    ],
    quiz: [
      {
        q: 'An engineer says the inconsistency is a model problem. What is the more precise diagnosis?',
        options: [
          'The model temperature varies by time of day; set it to zero for determinism.',
          'Each engineer prompts with different implicit assumptions, so the constraint space differs by session.',
          'AGENTS.md was updated between the Monday and Friday runs.',
          'The tool version changed between the two runs.',
        ],
        correct: 1,
        explanation: 'Without a shared spec layer, every engineer operates from their own implicit assumptions. The constraint space differs per session — that is the root cause.',
      },
      {
        q: 'An acceptance criterion reads: "The implementation must be clean and well-tested." Why does it fail the delegatable-spec test?',
        options: [
          '"Clean" and "well-tested" are standard terms the agent understands well.',
          'The criterion is too short; more detail gives the agent more context.',
          'Neither term is machine-verifiable: "clean" has no agreed measure and "well-tested" lacks any threshold.',
          'The criterion must reference a specific file or module to be actionable.',
        ],
        correct: 2,
        explanation: 'A delegatable spec requires every criterion to be checkable without reading the code. "Clean" and "well-tested" have no machine-verifiable definition.',
      },
      {
        q: 'Primary functional difference between constitution.md and a session instruction?',
        options: [
          'The constitution is longer, so the agent treats it as more authoritative.',
          'Committed, versioned, loaded every session, cannot be outweighed by a task-level prompt.',
          'The constitution is for humans; session instructions are for the agent.',
          'There is no functional difference; both carry equal weight.',
        ],
        correct: 1,
        explanation: 'A session instruction can be overridden or forgotten. A committed constitution is versioned, always loaded, and takes precedence.',
      },
    ],
  },
  {
    id: 'section-03',
    number: 3,
    title: 'Evaluation-Driven Development',
    tag: 'Eval Engineering',
    icon: '🧪',
    color: '#059669',
    description: 'At L3 the human is the quality gate. At Advanced the eval suite is the gate. Build the eval pipeline that catches failures before any human opens a diff.',
    outcomes: [
      'Classify every acceptance criterion as deterministic check or LLM judge',
      'Build a pre-push deterministic assertion layer that blocks bad output before CI',
      'Write and calibrate an LLM-as-judge for semantic acceptance criteria',
      'Construct a clean/dirty golden dataset where dirty cases reliably fail',
    ],
    resources: [
      { title: 'LLM-as-a-Judge: Building Reliable Automated Evaluators', url: 'https://hamel.dev/blog/posts/llm-judge/', source: 'Hamel Husain', time: '20 min' },
      { title: 'Define Success Criteria', url: 'https://docs.anthropic.com/en/docs/build-with-claude/define-success', source: 'Anthropic Docs', time: '15 min' },
      { title: 'Evaluating the Effectiveness of LLM-Evaluators', url: 'https://eugeneyan.com/writing/llm-evaluator/', source: 'Eugene Yan', time: '20 min' },
      { title: 'Evaluation Fundamentals', url: 'https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals', source: 'OpenAI Cookbook', time: '30 min' },
      { title: 'Demystifying Evals for AI Agents', url: 'https://www.anthropic.com/engineering/evaluating-ai-agents', source: 'Anthropic Engineering', time: '15 min' },
      { title: 'Claude Code Action', url: 'https://github.com/anthropics/claude-code-action', source: 'Anthropic (GitHub)', time: '20 min' },
    ],
    quiz: [
      {
        q: 'The downstream failure was "plausible but wrong." Which eval type would have caught it, and why was it absent?',
        options: [
          'A deterministic assertion; the coverage check would have surfaced the logic error.',
          'A judge against the interface contract in the spec. No judge existed for semantic criteria.',
          'A human review step; the reviewer approved the diff too quickly.',
          'A type-checker; the interface was implemented with the wrong return types.',
        ],
        correct: 1,
        explanation: 'Plausible-but-wrong business logic requires a semantic judge. The team had deterministic checks but no judge for interface contract compliance.',
      },
      {
        q: 'All 6 dirty cases pass the suite. Correct interpretation?',
        options: [
          "The agent never produces these failure modes; the harness is correct.",
          'The dirty cases are not dirty enough: they do not contain the failure modes they were designed to surface.',
          'The deterministic layer is catching everything before the judge runs.',
          'Six is too few; expand to 50 cases before drawing any conclusion.',
        ],
        correct: 1,
        explanation: 'If dirty cases pass, the eval has a gap — not a clean bill of health. The cases must be strengthened to actually contain the failure modes they target.',
      },
      {
        q: 'You want to verify changed files are within declared scope. Correct eval type and reason?',
        options: [
          'LLM-as-judge; it can assess scope more accurately than a file path comparison.',
          'Deterministic assertion: set membership check, no model call needed, result is unconditional.',
          'Either type produces equivalent results for a scope check.',
          'Manual review; scope checks require human judgment to handle edge cases.',
        ],
        correct: 1,
        explanation: 'Scope is a pure set membership check. There is no ambiguity — use a deterministic assertion, not an LLM judge that costs money and adds variance.',
      },
      {
        q: 'A passing eval run on an engineer\'s laptop is treated as proof the PR is safe to merge. What is the structural gap this assumes away?',
        options: [
          'Local runs depend on whoever remembers to run them; only a CI-enforced gate blocks every PR regardless of who forgot.',
          'Laptops are slower than CI runners, so local results understate true latency under load.',
          'Local eval runs always use a different model version than the one deployed to production.',
          'The eval suite needs GPU access that only CI runners have, not developer laptops.',
        ],
        correct: 0,
        explanation: 'A local-only gate is a developer habit, not an enforced quality gate. CI makes it structural — nobody can merge without passing.',
      },
    ],
  },
  {
    id: 'section-04',
    number: 4,
    title: 'Workflow Design and the Agentic Solution Model',
    tag: 'Architecture',
    icon: '🗺️',
    color: '#d97706',
    description: 'The workflow is the route the agent travels. The Agentic Solution Model proves it is production-ready. Together they turn implicit engineering decisions into versioned, reviewable artifacts.',
    outcomes: [
      'Map any SDLC workflow as an ordered sequence of phases with explicit control points',
      'Produce an Agentic Solution Model documenting scope, boundaries, tools, validation, and human intervention',
      'Identify where eval gates replace human review and where they do not',
    ],
    resources: [
      { title: 'Building Effective Agents (Workflow Patterns)', url: 'https://www.anthropic.com/research/building-effective-agents', source: 'Anthropic', time: '15 min' },
      { title: 'Claude Code Overview and Architecture', url: 'https://docs.anthropic.com/en/docs/claude-code/overview', source: 'Anthropic Docs', time: '15 min' },
      { title: 'Memory and Configuration', url: 'https://docs.anthropic.com/en/docs/claude-code/memory', source: 'Anthropic Docs', time: '10 min' },
    ],
    quiz: [
      {
        q: 'The director asks: "Is there a human in the loop before code reaches the PR?" What is the precise answer?',
        options: [
          'No: the agent handles everything autonomously from ticket to merged PR.',
          'Yes, at every phase: a human approves each step before the agent proceeds.',
          'Yes, at phase 7 only: the eval gate in phase 5 is automated, but a human reviews and merges the draft PR before it reaches main.',
          'No human gate exists; the eval suite is sufficient for production safety.',
        ],
        correct: 2,
        explanation: 'The eval gate is automated. The human review is a structural gate at phase 7 only — not at every step, and not absent entirely.',
      },
      {
        q: 'A new engineer wants to add a documentation agent. What must they do before merging?',
        options: [
          'Run the eval suite to confirm no regressions.',
          'Get approval from the engineering director.',
          'Update the Agentic Solution Model in the same PR: add the new agent scope, tool set, validation check, and its position in the workflow phase map.',
          'Add a new entry to AGENTS.md for the documentation agent.',
        ],
        correct: 2,
        explanation: 'The Agentic Solution Model is a living document. Any change to agent scope, tools, or eval gates must update it in the same PR.',
      },
    ],
  },
  {
    id: 'section-05',
    number: 5,
    title: 'Context and Memory Engineering',
    tag: 'Context Optimization',
    icon: '🧠',
    color: '#7c3aed',
    description: 'The model can only use what is in its context window. Stuffing everything in is expensive and produces lower quality than targeted retrieval. Fix both.',
    outcomes: [
      'Measure the static vs task-specific token ratio in a real harness run',
      'Build an ADR retrieval layer and measure precision@3 independently before wiring it in',
      'Apply prompt caching to static content and calculate the cost reduction',
      'Add a scratchpad step that prevents context degradation in long tasks',
    ],
    resources: [
      { title: 'Context Windows and Long Documents', url: 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows', source: 'Anthropic Docs', time: '20 min' },
      { title: 'Contextual Retrieval', url: 'https://www.anthropic.com/research/contextual-retrieval', source: 'Anthropic Engineering', time: '25 min' },
      { title: 'Prompt Caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', source: 'Anthropic Docs', time: '15 min' },
      { title: 'Embeddings: What They Are and Why They Matter', url: 'https://simonwillison.net/2023/Oct/23/embeddings/', source: 'Simon Willison', time: '20 min' },
    ],
    quiz: [
      {
        q: 'The agent re-invented ADR patterns despite the full directory being loaded. Why?',
        options: [
          'The agent ignores all documentation files; only code in context shapes its output.',
          'ADRs sit far from the task description in an 80k-token context; lost-in-the-middle underweights them.',
          'The ADR format is non-standard and cannot be parsed by the model.',
          'The model knowledge cutoff predates the ADRs, so it defaults to training data.',
        ],
        correct: 1,
        explanation: 'At 80k tokens, content far from the task description is underweighted by the model ("lost in the middle"). Targeted retrieval solves this.',
      },
      {
        q: 'precision@3 = 0.5. Agent still violates ADR conventions 25% of the time. First fix?',
        options: [
          'Lower the embedding similarity threshold to retrieve more candidates per query.',
          'Improve precision@3 to ≥ 80% before attributing violations to the agent.',
          'Switch to a larger embedding model immediately.',
          'Add the full directory back as a fallback for low-confidence retrievals.',
        ],
        correct: 1,
        explanation: 'You cannot attribute violations to the agent if the retrieval is only finding the right ADR 50% of the time. Fix retrieval first.',
      },
      {
        q: 'Highest-leverage single intervention for the 40% cost overrun?',
        options: [
          'Switch to a smaller model for all harness runs to reduce per-token cost.',
          'Enable prompt caching on the 70k static tokens; subsequent runs bill only the 10k task-specific portion at full rate.',
          'Reduce max_tokens to force shorter output on every run.',
          'Remove the constitution and style guide from context entirely.',
        ],
        correct: 1,
        explanation: '70k static tokens at 300 runs/day is a massive cache hit opportunity. Prompt caching bills cached tokens at a fraction of the full rate.',
      },
    ],
  },
  {
    id: 'section-06',
    number: 6,
    title: 'Model Selection and Cost Control',
    tag: 'Cost Engineering',
    icon: '💰',
    color: '#059669',
    description: 'Routing every call to a frontier model is expensive and slow. Build an evidence-based routing policy and the cost projection the manager needs to approve scaling.',
    outcomes: [
      'Classify each harness subtask type by required model capability',
      'Run the eval suite across model tiers to produce measured routing evidence',
      'Write routing rules based on eval data with a tolerance threshold',
      'Apply the Batch API to non-blocking calls and build a three-scenario cost projection',
    ],
    resources: [
      { title: 'Claude Models Overview', url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', source: 'Anthropic Docs', time: '15 min' },
      { title: 'LLM Pricing and Cost Optimisation', url: 'https://www.morph.so/blog/llm-pricing', source: 'Morph', time: '15 min' },
      { title: 'Message Batches API', url: 'https://docs.anthropic.com/en/docs/build-with-claude/batch-processing', source: 'Anthropic Docs', time: '15 min' },
      { title: 'Claude Platform Pricing', url: 'https://www.anthropic.com/pricing', source: 'Anthropic Docs', time: '15 min' },
    ],
    quiz: [
      {
        q: 'You route 60% of calls to a small model. Eval pass rate is unchanged. What does this tell you?',
        options: [
          'The classification tasks became simpler since the harness was first built.',
          'The frontier model was over-provisioned for these tasks; routing was based on convenience, not evidence.',
          'The small model is a mid-tier model sold under a different name.',
          'The eval suite is not sensitive enough to detect quality differences between tiers.',
        ],
        correct: 1,
        explanation: 'If pass rate is unchanged, the frontier model added cost with no quality benefit. Routing was a convenience default, not an evidence-based decision.',
      },
      {
        q: 'Why should architectural review calls stay on the frontier model?',
        options: [
          'The engineering manager requires frontier model use for compliance.',
          'Frontier models are the only ones with internet access for research.',
          'The quality gap on complex reasoning is real, and a wrong architectural recommendation costs more in rework than the token savings.',
          'Architectural reviews are too short for smaller models to handle efficiently.',
        ],
        correct: 2,
        explanation: 'For complex reasoning tasks, the quality gap between frontier and smaller models is real and consequential. Economics must include rework cost.',
      },
    ],
  },
  {
    id: 'section-07',
    number: 7,
    title: 'Reliability, Guardrails, and Security',
    tag: 'Security',
    icon: '🔒',
    color: '#dc2626',
    description: 'A nightly job modified files outside declared scope. An attacker could inject instructions via ticket descriptions. Replace advisory instructions with deterministic hooks and map the threat surface.',
    outcomes: [
      'Explain why a constitution instruction alone is insufficient vs. a pre-tool hook',
      'Write a scope-enforcer hook that blocks out-of-scope file writes',
      'Map the threat surface of an agentic system',
      'Implement input sanitisation and a dual-LLM wrapper for untrusted text',
    ],
    resources: [
      { title: 'Claude Code Hooks Documentation', url: 'https://docs.anthropic.com/en/docs/claude-code/hooks', source: 'Anthropic Docs', time: '20 min' },
      { title: 'Prompt Injection Attacks', url: 'https://simonwillison.net/2023/Apr/14/worst-that-could-happen/', source: 'Simon Willison', time: '15 min' },
    ],
    quiz: [
      {
        q: 'Why did the constitution instruction fail to prevent the out-of-scope file write?',
        options: [
          'The constitution file was not loaded in that session.',
          'The agent judged the utility cleanup beneficial — helpful intent outweighed the instruction. A pre-tool hook intercepts at the process level and cannot be reasoned around.',
          'File write tools bypass the system prompt entirely.',
          'The out-of-scope write was inside the allowed directory by a naming coincidence.',
        ],
        correct: 1,
        explanation: 'Instructions are weighed against other signals. A hook is a separate process that intercepts before execution — the agent cannot reason around it.',
      },
    ],
  },
  {
    id: 'section-08',
    number: 8,
    title: 'Observability and Attribution',
    tag: 'Observability',
    icon: '📊',
    color: '#0891b2',
    description: 'The engineering manager asks four questions. The current answer to all of them is "we don\'t know." Instrument every operation with spans, build the four-metric dashboard, and attribute every agent-originated commit.',
    outcomes: [
      'Instrument harness/run.py with OpenTelemetry spans',
      'Compute eval pass rate, $/ticket, p95 latency, and tool failure rate from trace data',
      'Add an online pre-push scope check and fast judge',
      'Add commit trailers to agent-originated commits',
    ],
    resources: [
      { title: 'OpenTelemetry Python SDK', url: 'https://opentelemetry.io/docs/languages/python/', source: 'OpenTelemetry', time: '20 min' },
      { title: 'Langfuse Tracing', url: 'https://langfuse.com/docs', source: 'Langfuse', time: '15 min' },
    ],
    quiz: [
      {
        q: 'The manager asks for p95 latency of the model call. What does "p95" mean and why does it matter more than average?',
        options: [
          'p95 is the maximum latency; it matters because worst-case determines SLA.',
          '95% of model calls complete in ≤ this duration. It reveals tail latency that averages hide — a 10s p95 means 5% of users wait 10+ seconds.',
          'p95 is the average of the top 5% fastest calls; it shows best-case performance.',
          'p95 means 95% CPU utilization during the model call.',
        ],
        correct: 1,
        explanation: 'The 95th percentile captures tail latency that the mean hides. For user-facing operations, tail latency determines the worst experience 1 in 20 users has.',
      },
    ],
  },
  {
    id: 'section-09',
    number: 9,
    title: 'Packaging and Team Distribution',
    tag: 'Team Scale',
    icon: '📦',
    color: '#d97706',
    description: 'You have a production-grade harness. The manager asks you to roll it out to four more engineers. Three cannot get it running. One gets different outputs. Package it so the first run takes ≤ 30 minutes.',
    outcomes: [
      'Package agent skills as versioned committable files in .claude/skills/',
      'Set constitution and AGENTS.md to project scope so user-level config cannot override them',
      'Write HARNESS.md that passes the teammate test',
    ],
    resources: [
      { title: 'Agent Skills Documentation', url: 'https://addyo.substack.com/p/agent-skills', source: 'Addy Osmani', time: '15 min' },
      { title: 'AGENTS.md Reference', url: 'https://agents.md/', source: 'agents.md', time: '10 min' },
    ],
    quiz: [
      {
        q: 'One engineer\'s outputs differ from the team\'s after the rollout. First thing to check?',
        options: [
          'Reinstall Claude Code on their machine.',
          'Check if they have a user-level AGENTS.md (~/.claude/AGENTS.md) that overrides the project constitution.',
          'Increase the max_tokens setting in their local config.',
          'Have them pull the latest main branch.',
        ],
        correct: 1,
        explanation: 'User-level AGENTS.md overrides project-level config. This is the most common source of per-engineer divergence after packaging.',
      },
    ],
  },
  {
    id: 'section-10',
    number: 10,
    title: 'Scheduled and Unattended Dispatch',
    tag: 'Automation',
    icon: '⏰',
    color: '#7c3aed',
    description: 'An interactive session has an engineer watching every output. A nightly job has nobody watching until the Slack message arrives. Unattended operation requires stricter guardrails than interactive sessions — not the same ones.',
    outcomes: [
      'Audit and tighten all guardrails before enabling any scheduled job',
      'Create a nightly GitHub Actions workflow with blast-radius stop, spend cap, and dry-run mode',
      'Implement quality and cost alerts that fire before the morning summary',
      'Validate with a dry run before enabling the real schedule',
    ],
    resources: [
      { title: 'GitHub Actions Scheduled Workflows', url: 'https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule', source: 'GitHub Docs', time: '10 min' },
      { title: 'Claude Code Action', url: 'https://github.com/anthropics/claude-code-action', source: 'Anthropic (GitHub)', time: '20 min' },
    ],
    quiz: [
      {
        q: 'Why does unattended operation require stricter guardrails than interactive sessions?',
        options: [
          'Nightly jobs use more tokens per run, increasing cost exposure.',
          'A guardrail failure in an interactive session produces one bad output. In a nightly job it produces 10 bad PRs before anyone wakes up — the blast radius is multiplied by the ticket volume.',
          'Unattended jobs run on different infrastructure with less compute.',
          'Regulatory requirements mandate stricter controls for scheduled automation.',
        ],
        correct: 1,
        explanation: 'The blast radius of a single guardrail failure scales with the number of tickets processed before anyone notices. That is fundamentally different from interactive use.',
      },
    ],
  },
  {
    id: 'section-11',
    number: 11,
    title: 'Multi-Agent Orchestration',
    tag: 'Orchestration',
    icon: '🤝',
    color: '#059669',
    description: 'Five engineers want the harness as a shared asset. The single-agent design is now a bottleneck. Design context isolation between agents, typed handoffs, per-agent evals, and distributed traces.',
    outcomes: [
      'Design context isolation: each subagent receives only what it needs',
      'Define typed handoff objects that the coordinator validates before passing downstream',
      'Write per-agent evals and an end-to-end eval with coverage annotations',
      'Implement a coordinator with retry and escalation logic',
    ],
    resources: [
      { title: 'Building Effective Agents (Multi-agent section)', url: 'https://www.anthropic.com/research/building-effective-agents', source: 'Anthropic', time: '15 min' },
      { title: 'Claude Code Sub-agents', url: 'https://docs.anthropic.com/en/docs/claude-code/sub-agents', source: 'Anthropic Docs', time: '10 min' },
    ],
    quiz: [
      {
        q: 'The test-agent eval checks that tests pass. What coverage gap does this leave?',
        options: [
          'It does not verify that the test files are in the correct directory.',
          'No eval verifies that the tests meaningfully cover the changed files — tests could pass on unchanged code.',
          'It does not check that tests use the correct testing framework.',
          'There is no gap; passing tests imply adequate coverage.',
        ],
        correct: 1,
        explanation: 'Tests can pass while covering unrelated code. A separate assertion is needed: the test files must import and exercise the specific changed modules.',
      },
    ],
  },
  {
    id: 'section-12',
    number: 12,
    title: 'Maturity Assessment and Leadership Reporting',
    tag: 'Leadership',
    icon: '📈',
    color: '#dc2626',
    description: 'A client team reports "using AI agents extensively." After observation: they are effectively at L2. Classify the effective level, isolate the bottleneck, and write the one-page leadership brief with the economics attached.',
    outcomes: [
      'Apply the L0–L4 maturity ladder to any team based on observable behaviour',
      'Identify the bottleneck level (the lowest-level missing capability)',
      'Produce a one-page leadership brief with current state, target state, uplift plan, and economics',
    ],
    resources: [
      { title: 'AI Engineering Maturity Models', url: 'https://martinfowler.com/articles/maturity-model.html', source: 'Martin Fowler', time: '15 min' },
    ],
    quiz: [
      {
        q: 'A team has three engineers using Claude Code but reviewing every output line-by-line, and no eval suite. What is their effective level?',
        options: [
          'L1 — AI assists (autocomplete only)',
          'L2 — Engineer directs AI; engineer reviews every output at line level.',
          'L3 — AI executes with eval gate.',
          'L4 — Team-scale automated pipeline.',
        ],
        correct: 1,
        explanation: 'The effective level is determined by observable behaviour — not the tools used. Line-by-line review with no eval suite is the definition of L2.',
      },
      {
        q: 'The team is at L2. They want to reach L3. What is the highest-leverage single action?',
        options: [
          'Add more engineers to the team to parallelize reviews.',
          'Switch to a more capable frontier model.',
          'Build an eval suite that gates output before any human sees it — this is the definition of L3.',
          'Write more detailed session instructions.',
        ],
        correct: 2,
        explanation: 'L3 is defined by having an eval suite as the gate, replacing per-output human review. That is the single missing capability at L2.',
      },
    ],
  },
];
