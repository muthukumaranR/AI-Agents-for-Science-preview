## Design with CARE

*Authors: Rahul Ramachandran, Nidhi Jha, Muthukumuran Ramasubramanian*

**Collaborative Agent Reasoning Engineering (CARE)** is a disciplined, stage-gated methodology designed to systematically engineer AI agents for scientific and technical workflows. Influenced by the vision of Accelerated Knowledge Discovery (AKD), CARE moves away from ad hoc "prompt tinkering" toward a structured engineering process centered on reusable design artifacts and human-in-the-loop oversight. CARE process also includes MCP Design best practices to ensure optimal tool integration.

---

### The Core Methodology: Triadic Collaboration

CARE is defined by a three-party workflow that ensures scientific integrity and technical feasibility:

| Role | Responsibility |
|---|---|
| **Subject Matter Experts (SMEs)** | Provide domain authority, surfacing nuanced constraints and validating scientific "truth" |
| **Developers** | Act as the implementation authority, ensuring tool realism and feasibility |
| **Helper LLM Agents** | Serve as "facilitation infrastructure" — accelerating the process by asking phase-aligned questions, drafting specifications in Markdown, and proposing revisions for human approval |

---

### Five Phases of Development

The methodology is organized into five distinct phases, each requiring joint approval at a stage gate before proceeding:

1. **Scope & Decompose** — Defines the target workflow, users, and constraints.
2. **Key Information Elicitation** — Captures details on tools, domain context, and required output formats.
3. **Reasoning Policy & Guardrails** — Codifies "expert-like" thinking logic and safety boundaries for uncertainty or tool errors.
4. **Implementation** — Translates approved artifacts into an engineered agent prompt using established design patterns.
5. **Benchmarking & Verification** — Establishes realistic query sets and scoring rubrics to detect regressions over time.

---

### Key Design Targets

CARE deconstructs agent quality into four interacting targets to prevent silent failures at system boundaries:

| Target | Description |
|---|---|
| **Interaction Policy** | How the agent decomposes tasks and manages uncertainty |
| **Domain Grounding** | Defining authoritative knowledge boundaries to reduce "plausible-but-wrong" outputs |
| **Tool Orchestration** | Defining which tools to use and how to handle errors or retries |
| **Evaluation** | Defining user-centric success criteria on realistic, complex tasks |

---

### CARE GitHub

[https://github.com/NASA-IMPACT/AKD-CARE](https://github.com/NASA-IMPACT/AKD-CARE) *(private)*

---

### CARE Papers

[https://ntrs.nasa.gov/citations/20260000926](https://ntrs.nasa.gov/citations/20260000926)
