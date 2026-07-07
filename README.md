<div align="center">

# AI Sandbox

**The curriculum skeleton for Gen AI engineering practice**

Exercises, hints, quizzes, reference solutions, and the PayFlow legend

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-22c55e?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Sections](https://img.shields.io/badge/Sections-12%20%2B%20Capstone-8b5cf6?style=for-the-badge)](exercises/)
[![Playgrounds](https://img.shields.io/badge/Playgrounds-14%20stacks-f97316?style=for-the-badge)](https://github.com/dark-side/sports-hub)

<br/>

[**Launch portal**](#one-command-start) | [**Pick a playground**](#playgrounds) | [**Curriculum**](#curriculum) | [**Sports Hub**](https://github.com/dark-side/sports-hub)

</div>

---

## Table of contents

- [What is this repo?](#what-is-this-repo)
- [Ecosystem map](#ecosystem-map)
- [One-command start](#one-command-start)
- [Playgrounds](#playgrounds)
- [Curriculum](#curriculum)
- [Repository map](#repository-map)
- [Known issues](#known-issues-intentional)
- [Quick start checklist](#quick-start-checklist)

---

## What is this repo?

<table>
<tr>
<td width="50%" valign="top">

### This repo (`ai_sandbox`)

The **textbook and answer key**

- Exercise briefs and acceptance criteria
- Progressive hints and quizzes
- Reference solutions
- ADRs, threat models, eval specs

</td>
<td width="50%" valign="top">

### A playground ([Sports Hub](https://github.com/dark-side/sports-hub))

The **lab where you build**

- Runnable apps and services
- Your branches, PRs, and CI
- Hands-on experimentation
- Language-specific tooling

</td>
</tr>
</table>

> **`ai_sandbox` is not where you build.**  
> It is the **source-of-truth skeleton** for the PayFlow Gen AI Advanced Learning curriculum.  
> Clone a [Sports Hub skeleton](https://github.com/dark-side/sports-hub), practice there, and use this repo as your curriculum guide.

---

## Ecosystem map

```mermaid
flowchart TB
    subgraph docs["Documentation layer"]
        SH["sports-hub<br/><i>Product docs and onboarding</i>"]
        AS["ai_sandbox<br/><i>Curriculum and exercises</i>"]
    end

    subgraph tooling["Tooling layer"]
        LAUNCH["sports_hub_launcher<br/><i>One-click setup CLI</i>"]
        API["api_docs_genai_playground<br/><i>Interactive API reference</i>"]
    end

    subgraph code["Code layer"]
        SKEL["sports_hub_*_skeleton<br/><i>14 language playgrounds</i>"]
    end

    SH --> LAUNCH
    LAUNCH --> SKEL
    AS -->|"read tasks"| SKEL
    SKEL -->|"write code"| SKEL
    API -.-> SKEL

    style AS fill:#8b5cf6,color:#fff,stroke:#6d28d9
    style SH fill:#3b82f6,color:#fff,stroke:#1d4ed8
    style LAUNCH fill:#22c55e,color:#fff,stroke:#15803d
    style SKEL fill:#f97316,color:#fff,stroke:#c2410c
    style API fill:#64748b,color:#fff,stroke:#475569
```

| Step | Repository | Role |
|:--:|---|---|
| 1 | [sports-hub](https://github.com/dark-side/sports-hub) | Product legend, requirements, feature docs |
| 2 | [sports_hub_launcher](https://github.com/dark-side/sports_hub_launcher) | Auto-clone, build and run any skeleton |
| 3 | `sports_hub_*_skeleton` | Your working codebase |
| 4 | **ai_sandbox** (you are here) | Tasks, hints, quizzes, solutions |

---

## The PayFlow legend

> **PayFlow** is a fintech payment-processing startup running a **Ticket-to-PR harness** on microservices for payment validation, fraud detection, and billing reconciliation.
>
> The harness works, but it has no spec layer, no eval suite, no cost controls, no guardrails, and no observability. Token costs are 40% over budget. A PR broke fraud detection last week.
>
> Across **12 sections and a capstone**, you harden that workflow one discipline at a time.

---

## One-command start

The **interactive learning portal** is the fastest way in: a local web app with tasks, hints, quizzes, and solutions. One command starts everything and opens the browser.

```mermaid
sequenceDiagram
    participant You
    participant Script as start-learning-app.sh
    participant NPM as npm install
    participant API as API :3737
    participant UI as Vite UI :5173
    participant Browser

    You->>Script: npm start
    Script->>Script: Check Node.js 18+
    alt First run
        Script->>NPM: Install learning-app deps
    end
    Script->>API: Start server.js
    Script->>UI: Start Vite dev server
    UI->>Browser: Auto-open localhost:5173
    Note over You,Browser: Edit exercises/ then refresh browser
    You->>Script: Ctrl+C
    Script->>API: Stop
    Script->>UI: Stop
```

### Prerequisites

| Requirement | How to check |
|---|---|
| **Node.js 18+** | `node --version` |
| **npm** (bundled with Node) | `npm --version` |
| **Git** | `git --version` |

```bash
# macOS
brew install node
```

### Launch in 2 steps

```bash
# 1. Clone
git clone https://github.com/dark-side/ai_sandbox.git
cd ai_sandbox

# 2. Start
npm start
```

<details>
<summary><strong>Alternative:</strong> run the shell script directly</summary>

```bash
chmod +x start-learning-app.sh   # first time only
./start-learning-app.sh
```

</details>

### What starts automatically

| Step | Action | Detail |
|:---:|---|---|
| 1 | Node check | Warns if version is below 18 |
| 2 | Dependencies | `npm install` in `learning-app/` on first run only |
| 3 | Port cleanup | Frees ports `3737` and `5173` from stale processes |
| 4 | API server | Reads `exercises/` and `solutions/` live from disk |
| 5 | Vite UI | React dev server with hot reload |
| 6 | Browser | Opens [localhost:5173](http://localhost:5173) automatically |

### Terminal output

```
  PayFlow AI Practice - Learning Portal
  ----------------------------------------

  Node.js v20.x.x
  Dependencies ready
  Starting API server on port 3737...
  API server running (PID ...)
  Starting Vite UI server on port 5173...
  Vite server running (PID ...)

  Learning portal: http://localhost:5173
  API server:      http://localhost:3737

  Press Ctrl+C to stop
```

### Endpoints

| URL | Purpose |
|---|---|
| [http://localhost:5173](http://localhost:5173) | Learning portal UI |
| [http://localhost:3737](http://localhost:3737) | Content API |

> Changes to markdown in `exercises/` or `solutions/` appear on the next browser refresh. No restart needed.

### Stop

Press **`Ctrl+C`** in the terminal. Both servers shut down cleanly.

<details>
<summary><strong>Troubleshooting</strong></summary>

| Problem | Fix |
|---|---|
| `Node.js not found` | Install Node.js 18+ |
| `Permission denied` | `chmod +x start-learning-app.sh` |
| Port in use | Script auto-kills stale processes; or `lsof -ti:5173 \| xargs kill -9` |
| Browser did not open | Open [localhost:5173](http://localhost:5173) manually |
| Blank page | `Ctrl+C`, delete `learning-app/node_modules`, then `npm start` |
| Windows | Use `npm start` in Git Bash or WSL |

</details>

---

## Playgrounds

**Read the tasks here. Write the code there.**

All playgrounds live in the **[Sports Hub](https://github.com/dark-side/sports-hub)** ecosystem: pre-defined product requirements, real-world tasks, and runnable skeletons across every major stack.

### Launcher

```bash
git clone https://github.com/dark-side/sports_hub_launcher.git
cd sports_hub_launcher
chmod +x setup.sh
./setup.sh
```

The [Sports Hub Launcher](https://github.com/dark-side/sports_hub_launcher) clones repos, builds containers, and hosts docs from one interactive menu.

### Backend

| Playground | Stack |
|---|---|
| [sports_hub_java_skeleton](https://github.com/dark-side/sports_hub_java_skeleton) | Java, Spring Boot |
| [sports_hub_python_skeleton](https://github.com/dark-side/sports_hub_python_skeleton) | Python, FastAPI |
| [sports_hub_go_skeleton](https://github.com/dark-side/sports_hub_go_skeleton) | Go, Gin |
| [sports_hub_rust_skeleton](https://github.com/dark-side/sports_hub_rust_skeleton) | Rust |
| [sports_hub_nodejs_skeleton](https://github.com/dark-side/sports_hub_nodejs_skeleton) | TypeScript, Node.js |
| [sports_hub_ruby_skeleton](https://github.com/dark-side/sports_hub_ruby_skeleton) | Ruby, Rails |
| [sports_hub_php_skeleton](https://github.com/dark-side/sports_hub_php_skeleton) | PHP, Laravel |
| [sports_hub_net_skeleton](https://github.com/dark-side/sports_hub_net_skeleton) | C#, .NET |
| [sports_hub_cpp_skeleton](https://github.com/dark-side/sports_hub_cpp_skeleton) | C++, Poco |

### Frontend and mobile

| Playground | Stack |
|---|---|
| [sports_hub_react_skeleton](https://github.com/dark-side/sports_hub_react_skeleton) | JavaScript, React |
| [sports_hub_angular_skeleton](https://github.com/dark-side/sports_hub_angular_skeleton) | TypeScript, Angular |
| [sports_hub_android_skeleton](https://github.com/dark-side/sports_hub_android_skeleton) | Kotlin, Android |
| [sports_hub_ios_skeleton](https://github.com/dark-side/sports_hub_ios_skeleton) | Swift, SwiftUI |

### API documentation

| Playground | Stack |
|---|---|
| [api_docs_genai_playground](https://github.com/dark-side/api_docs_genai_playground) | JavaScript, Vite |

Clone alongside Python, Ruby, PHP, or Rust skeletons for live endpoint reference.

---

## Curriculum

12 sections plus a capstone. Each folder under `exercises/` has scenarios, tasks, acceptance criteria, and hints. Compare against `solutions/` when ready.

<details>
<summary><strong>Full section map</strong></summary>

| Section | Folder | Core discipline |
|---|---|---|
| S1: When to Use an Agent | `section-01-agent-decision/` | Three-question test, ADR |
| S2: Specification as Source of Truth | `section-02-spec/` | AGENTS.md, constitution |
| S3: Evaluation-Driven Development | `section-03-evals/` | Deterministic and judge evals |
| S4: Workflow Design | `section-04-workflow-model/` | Agentic solution model |
| S5: Context and Memory Engineering | `section-05-context/` | ADR retrieval, caching |
| S6: Model Selection and Cost Control | `section-06-cost/` | Routing, Batch API |
| S7: Reliability, Guardrails, Security | `section-07-security/` | Threat model, sanitisation |
| S8: Observability and Attribution | `section-08-observability/` | OTel spans, metrics |
| S9: Packaging and Team Distribution | `section-09-packaging/` | Agent skills, HARNESS.md |
| S10: Scheduled and Unattended Dispatch | `section-10-scheduled/` | Nightly jobs, alerting |
| S11: Multi-Agent Orchestration | `section-11-multiagent/` | Coordinator, handoffs |
| S12: Maturity Assessment and Reporting | `section-12-maturity/` | L0 to L4 ladder, leadership brief |
| Capstone | `capstone/` | End-to-end workflow demo |

</details>

```mermaid
flowchart LR
    S1["S1 Agent decision"] --> S2["S2 Spec"]
    S2 --> S3["S3 Evals"]
    S3 --> S4["S4 Workflow"]
    S4 --> S5["S5 Context"]
    S5 --> S6["S6 Cost"]
    S6 --> S7["S7 Security"]
    S7 --> S8["S8 Observability"]
    S8 --> S9["S9 Packaging"]
    S9 --> S10["S10 Scheduled"]
    S10 --> S11["S11 Multi-agent"]
    S11 --> S12["S12 Maturity"]
    S12 --> CAP["Capstone"]

    style S1 fill:#dbeafe,stroke:#3b82f6
    style S7 fill:#fee2e2,stroke:#ef4444
    style CAP fill:#f3e8ff,stroke:#8b5cf6
```

---

## Repository map

```
ai_sandbox/
|
+-- learning-app/       Interactive portal (npm start)
+-- exercises/          12 sections + capstone
+-- solutions/          Reference implementations
+-- docs/
|   +-- adr/            Architecture Decision Records
|   +-- issues/         Sample harness tickets
+-- harness/            Reference harness (incomplete by design)
+-- services/           Stub microservices
+-- AGENTS.md           Intentionally incomplete (S2)
+-- .github/            CI and issue templates
```

### Stub services

| Service | Language | Role |
|---|---|---|
| `payment-validator/` | Python | Business logic and fraud detection |
| `api-gateway/` | TypeScript | REST API gateway |
| `billing-reconciler/` | Java | Legacy billing |
| `reporting/` | Go | Lightweight reporting |

Implement and test in your **playground**, not in this repo.

---

## Known issues (intentional)

These gaps are the learning surface. Do not fix them before the relevant exercise.

| Gap | Exercise |
|---|---|
| `AGENTS.md`: advisory only, no machine-verifiable gates | S2 |
| `constitution.md`: missing | S2 |
| `HARNESS.md`: missing | S9 |
| `harness/config.yaml`: same model for all tasks | S6 |
| `harness/run.py`: no eval gate or cost tracking | S3, S6 |
| `fraud_detector.py`: low test coverage | S3 |
| `payments.ts`: unsanitised input | S7 |
| `billing-reconciler/`: no tests | S3 |
| `ci.yml`: no eval suite | S3 |

---

## Who is this for?

Senior engineers, tech leads, and architects moving from ad-hoc AI prompting to production-grade agentic engineering: specs, evals, guardrails, cost control, and observability with receipts.

---

## Quick start checklist

- [ ] Clone and run `npm start` ([portal guide](#one-command-start))
- [ ] Read the [Sports Hub portal](https://github.com/dark-side/sports-hub)
- [ ] Bootstrap via [Launcher](https://github.com/dark-side/sports_hub_launcher) or pick a skeleton
- [ ] Open Section 1 in the portal or in `exercises/section-01-agent-decision/`
- [ ] Ship your first ADR before writing harness code

---

<div align="center">

<br/>

**[Back to top](#ai-sandbox)**

<br/>

Licensed under [MIT](LICENSE). Playgrounds may use different licenses.

</div>
