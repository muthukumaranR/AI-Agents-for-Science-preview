// Single source of truth for the Pathway diagram. Every ID referenced in
// src/content/pathways/*.yaml is validated against the IDs declared here.

export type Row =
  | 'design'
  | 'design-sub'
  | 'output'
  | 'decision'
  | 'branch-1'
  | 'branch-2'
  | 'branch-3'
  | 'gate'
  | 'flow-ui'
  | 'flow-sub'
  | 'endpoints';

export interface Step {
  id: string;
  label: string;
  sublabel: string;
  description: string;
  row: Row;
  governance?: string;
  governanceStrong?: boolean;
  link?: { href: string; label: string };
}

export interface Service {
  id: string;
  label: string;
  description: string;
}

export const STEPS = [
  {
    id: 'care',
    label: 'CARE Design Process',
    sublabel: 'A 5-phase stage-gated process where SMEs, developers, and helper LLM agents work together to specify what the agent should do.',
    description:
      'Teams start with the AKD CARE process. Subject matter experts, developers, and helper LLM agents work through five phases — scope, key information elicitation, reasoning policy and guardrails, implementation, benchmarking — passing a stage gate at each phase. The output is a set of reusable design artifacts that will later become operational code.',
    row: 'design',
    governance: 'CARE phase gates — joint SME / developer / agent approval at each phase',
    link: { href: 'https://github.com/NASA-IMPACT/akd-suite/tree/main/akd-care', label: 'akd-care ↗' },
  },
  {
    id: 'care-path-a',
    label: 'Path A · CARE Studio in AKD Labs UI',
    sublabel: 'Run the 5 CARE phases inside the AKD Labs web app, with helper agents guiding each phase.',
    description: 'Helper agents drive each phase, draft artifacts, and collect SME approvals inside the AKD Labs Studio. Best when the team is already using AKD Labs.',
    row: 'design-sub',
  },
  {
    id: 'care-path-b',
    label: 'Path B · CARE phase prompts (ChatGPT / ChatGSFC / Claude)',
    sublabel: 'Run the 5 CARE phases by copying our open-source prompts into any frontier LLM. Lower friction — no special tooling.',
    description: 'Copy the open-source CARE phase prompts from GitHub into any frontier chat assistant. Produces the same four artifacts (prompt, tools, context, guardrails) without requiring AKD Labs access.',
    row: 'design-sub',
  },
  {
    id: 'care-output',
    label: 'CARE Output',
    sublabel: 'The four reusable artifacts CARE produces: the system prompt, the list of tools, the domain context, and the safety guardrails.',
    description: 'The CARE process emits four artifacts: the agent prompt, its tool inventory, its domain context, and its guardrail policy. These feed directly into whichever operationalization branch the team picks next.',
    row: 'output',
  },
  {
    id: 'op-decision',
    label: 'Choose Operationalization Path',
    sublabel: 'Pick how the agent will run: as a simple chat prompt (1), a tool-using agent (2), or a multi-agent workflow (3).',
    description: 'Three operationalization paths follow. Choice depends on whether the agent needs external tools, and whether it needs to coordinate with other agents.',
    row: 'decision',
  },
  {
    id: 'b1-simple',
    label: '1 · Simple Prompt Agent → Simple-Agent Flow',
    sublabel: 'Paste the CARE prompt into ChatGPT, ChatGSFC, or Claude and you have a working agent — no code required.',
    description:
      'Simple Agents are tool-independent AI agents designed through the AKD CARE process — no custom APIs, MCP servers, or external integrations required. Paste the CARE-developed prompt as GPT instructions, upload domain context, and select the recommended model. Examples: Scientific Illustrator, Paper Writing Assistant, NASA Data Governance.',
    row: 'branch-1',
    governance: 'Public-use policy approval; baseline guardrail prompt patterns embedded by CARE',
    link: { href: 'https://github.com/NASA-IMPACT/akd-suite/tree/main/agents', label: 'agents/ ↗' },
  },
  {
    id: 'b2-akdext',
    label: '2 · Tool-Enabled Agent → Build in Agent Toolkit',
    sublabel: 'Implement the agent in our open-source Agent Toolkit (akd-ext): write tool wrappers, MCP integrations, and API clients so the agent can search data, run code, or call external systems.',
    description:
      'More complex agents require external tools, APIs, or data systems for execution along with rigorous prompt design and reasoning. Implement the agent in the Agent Toolkit (akd-ext): author tool wrappers, MCP integrations, and API clients. Examples: Earth Science Data Search (CMR), Code Search, Astro Data Search.',
    row: 'branch-2',
    governance: 'Tools whitelist; static MCP-server config; guardrail integration required',
    link: { href: 'https://github.com/NASA-IMPACT/akd-suite/tree/main/akd-ext', label: 'akd-ext ↗' },
  },
  {
    id: 'b2-labs',
    label: 'AKD Labs feedback loop',
    sublabel: 'Internal testing playground — chat with the agent, inspect full trace logs (prompt, tool I/O, reasoning, cost), and run it against benchmark suites before promotion.',
    description:
      'Teams import the CARE artifacts into AKD Labs and begin to iterate. Author the system prompt and tool configuration, chat-test the agent in the Chat Lab, inspect full trace logs (system prompt, tool inputs and outputs, reasoning summary, token usage, estimated cost), and run benchmarks against a prepared test suite. AKD Labs is multi-tenant and scoped to a project or organization, but experimental agents stay internal to the team that owns them.',
    row: 'branch-2',
    governance: 'Internal-only scope; benchmark thresholds enforced before review',
    link: { href: 'https://labs.akd.odsi.io', label: 'labs.akd.odsi.io ↗' },
  },
  {
    id: 'b3-orch',
    label: '3 · Multi-Agent Workflow → Orchestration',
    sublabel: 'Compose multiple agents into a pipeline. The orchestration layer manages handoffs between agents and tool calls.',
    description: 'Multi-agent workflows chain published agents through an orchestration layer. The layer manages handoffs, tool calls, and intermediate state, and surfaces traceable progress to scientists in AKD Flow.',
    row: 'branch-3',
    governance: 'Orchestration policy and handoff guardrails required',
  },
  {
    id: 'readiness-review',
    label: 'SME Readiness Review (gate)',
    sublabel: 'A subject-matter expert signs off that the agent demonstrates scientific integrity, guardrail compliance, and benchmark results before it can go live.',
    description:
      'When the agent meets its design requirements, an SME lead conducts a readiness review. The agent must demonstrate scientific integrity (non-prescriptive behavior, traceable reasoning), guardrail compliance, and benchmark results before promotion is approved. This is the moment the team commits to publishing the agent for users beyond the project.',
    row: 'gate',
    governance: 'This stage IS the gate — no agent reaches Flow without SME sign-off',
    governanceStrong: true,
  },
  {
    id: 'flow-ui',
    label: 'AKD Flow UI',
    sublabel: 'The production environment. Scientists chat with approved agents, build multi-agent workflows in natural language, see streaming guardrail badges, and share reproducible results.',
    description:
      'Approved agents are published to AKD Flow and to the akd-ext code repository. Once an agent is in AKD Flow, scientists can compose it into multi-agent workflows through the natural language planner, run those workflows with streaming updates and guardrail badges, and share results.',
    row: 'flow-ui',
    governance: 'Operational guardrails active in production; HITL checkpoints in every workflow run',
    link: { href: 'https://flow.akd.odsi.io', label: 'flow.akd.odsi.io ↗' },
  },
  {
    id: 'flow-integrations',
    label: 'Integrated Chatbots',
    sublabel: 'Agents surfaced as chatbots inside the tools scientists already use — Teams, Slack, ChatGSFC, and other NASA collaboration platforms.',
    description:
      'Once an agent is in production, it can be surfaced as an integrated chatbot inside existing platforms — Microsoft Teams, Slack, ChatGSFC, and other NASA collaboration tools — bringing agent capabilities directly into scientist workflows without forcing them to switch applications. Same approved agent, multiple surfaces.',
    row: 'flow-sub',
  },
  {
    id: 'ep-flow',
    label: 'AKD Flow Workflows',
    sublabel: 'Composed multi-agent pipelines at flow.akd.odsi.io. Scientists run them with streaming updates and guardrail badges.',
    description: 'Composed multi-agent pipelines on the AKD Flow canvas — scientists assemble approved agents, run workflows with streaming updates and guardrail badges, and share reproducible results.',
    row: 'endpoints',
    link: { href: 'https://flow.akd.odsi.io', label: 'flow.akd.odsi.io ↗' },
  },
  {
    id: 'ep-gpt',
    label: 'Custom GPT / Claude Project Directory',
    sublabel: 'Tool-independent agents published as Custom GPTs or Claude Projects — no code required to use them.',
    description: 'Tool-independent agents published directly as Custom GPTs or Claude Projects using the CARE-developed system prompt — no custom code required. Examples: Scientific Illustrator, Paper Writing Assistant, Data Governance Agent.',
    row: 'endpoints',
    link: { href: 'https://github.com/NASA-IMPACT/akd-suite/tree/main/agents', label: 'agents/ ↗' },
  },
  {
    id: 'ep-mcp',
    label: 'Community MCP Servers',
    sublabel: 'Teams host their own MCP servers. Community-contributed agents go through the same CARE + SME-review process as first-party agents.',
    description: 'Teams hosting their own MCP servers with agents that integrate via the AKD framework. Community-contributed agents are governed by the same CARE and SME-review process as first-party agents.',
    row: 'endpoints',
  },
  {
    id: 'ep-repo',
    label: 'Agent Toolkit (akd-ext)',
    sublabel: 'The open-source toolkit and reference agents — available for forking, peer review, and reuse by other science teams.',
    description: 'The open-source Agent Toolkit (akd-ext) on GitHub — agent SDK, tool wrappers, MCP integration helpers, and published reference agents. Available for forking, peer review, and integration into other projects. The canonical reference for tool-integrated domain agents across the AKD ecosystem.',
    row: 'endpoints',
    link: { href: 'https://github.com/NASA-IMPACT/akd-suite/tree/main/akd-ext', label: 'akd-ext ↗' },
  },
] as const satisfies readonly Step[];

export const SERVICES = [
  { id: 'svc-tools', label: 'Reusable Scientific Tools', description: 'MCP-wrapped search, retrieval, and analysis tools that agents compose instead of re-implementing.' },
  { id: 'svc-factreasoner', label: 'FactReasoner', description: 'Targeted factuality reasoning over claims, attribution, and supporting evidence to mitigate hallucinations.' },
  { id: 'svc-risk-agent', label: 'Risk Agent', description: 'An LLM judge that evaluates outputs against the IBM Risk Atlas and a NASA Science Literature Risk taxonomy, along with context-specific risks for each agent.' },
  { id: 'svc-compliance', label: 'Compliance Checking', description: 'Automated guardrail layer enforcing science-specific constraints on inputs and outputs.' },
  { id: 'svc-science-guardrails', label: 'Science Guardrails', description: 'A reusable input/output safety net — each guardrail acts as a checkpoint between an AI agent and the outside world.' },
  { id: 'svc-granite-guardian', label: 'Granite Guardian', description: 'A fast, content-focused moderation LLM based on the IBM Granite family — assesses jailbreaks, harm, bias, plus RAG-specific groundedness checks.' },
] as const satisfies readonly Service[];

export type StepId = (typeof STEPS)[number]['id'];
export type ServiceId = (typeof SERVICES)[number]['id'];

export const EDGES: ReadonlyArray<readonly [StepId, StepId]> = [
  ['care', 'care-path-a'],
  ['care', 'care-path-b'],
  ['care-path-a', 'care-output'],
  ['care-path-b', 'care-output'],
  ['care-output', 'op-decision'],
  ['op-decision', 'b1-simple'],
  ['op-decision', 'b2-akdext'],
  ['op-decision', 'b3-orch'],
  ['b1-simple', 'ep-gpt'],
  ['b2-akdext', 'b2-labs'],
  ['b2-labs', 'readiness-review'],
  ['b3-orch', 'readiness-review'],
  ['readiness-review', 'flow-ui'],
  ['flow-ui', 'ep-flow'],
  ['flow-ui', 'ep-mcp'],
  ['flow-ui', 'ep-repo'],
];

export const PERSONAS = [
  { id: 'developer', label: 'Developer / engineer' },
  { id: 'scientist', label: 'Scientist / domain SME' },
  { id: 'partner', label: 'Partner organization' },
  { id: 'decision-maker', label: 'Decision-maker / stakeholder' },
] as const;

export const GOALS = [
  { id: 'ship-custom-gpt', label: 'Ship a Custom GPT' },
  { id: 'build-tool-agent', label: 'Build a tool-using agent' },
  { id: 'compose-multi-agent', label: 'Compose a multi-agent workflow' },
  { id: 'host-mcp-server', label: 'Host a Community MCP server' },
  { id: 'guardrails-as-service', label: 'Add guardrails as a service' },
  { id: 'use-flow', label: 'Use Flow — run or compose workflows' },
  { id: 'stand-up-platform', label: 'Stand up an end-to-end platform' },
] as const;

export type PersonaId = (typeof PERSONAS)[number]['id'];
export type GoalId = (typeof GOALS)[number]['id'];
export type PathSlug =
  | 'dev-ship-gpt'
  | 'dev-tool-agent'
  | 'dev-multi-agent'
  | 'sysdev-mcp'
  | 'scientist-use-flow'
  | 'guardrails-service'
  | 'pm-platform'
  | 'start-here';

/** MATRIX[persona][goal] → path slug. Persona is only a tiebreaker; most goals resolve to the same slug regardless of persona. */
export const MATRIX: Record<PersonaId, Record<GoalId, PathSlug>> = {
  developer: {
    'ship-custom-gpt': 'dev-ship-gpt',
    'build-tool-agent': 'dev-tool-agent',
    'compose-multi-agent': 'dev-multi-agent',
    'host-mcp-server': 'sysdev-mcp',
    'guardrails-as-service': 'guardrails-service',
    'use-flow': 'scientist-use-flow',
    'stand-up-platform': 'pm-platform',
  },
  scientist: {
    'ship-custom-gpt': 'dev-ship-gpt',
    'build-tool-agent': 'dev-tool-agent',
    'compose-multi-agent': 'dev-multi-agent',
    'host-mcp-server': 'sysdev-mcp',
    'guardrails-as-service': 'guardrails-service',
    'use-flow': 'scientist-use-flow',
    'stand-up-platform': 'pm-platform',
  },
  partner: {
    'ship-custom-gpt': 'dev-ship-gpt',
    'build-tool-agent': 'dev-tool-agent',
    'compose-multi-agent': 'dev-multi-agent',
    'host-mcp-server': 'sysdev-mcp',
    'guardrails-as-service': 'guardrails-service',
    'use-flow': 'scientist-use-flow',
    'stand-up-platform': 'pm-platform',
  },
  'decision-maker': {
    'ship-custom-gpt': 'pm-platform',
    'build-tool-agent': 'pm-platform',
    'compose-multi-agent': 'pm-platform',
    'host-mcp-server': 'pm-platform',
    'guardrails-as-service': 'guardrails-service',
    'use-flow': 'scientist-use-flow',
    'stand-up-platform': 'pm-platform',
  },
};

export const STEP_IDS: ReadonlySet<StepId> = new Set(STEPS.map((s) => s.id));
export const SERVICE_IDS: ReadonlySet<ServiceId> = new Set(SERVICES.map((s) => s.id));
