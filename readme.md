# AI Agents for Science: Accelerated Knowledge Discovery

Public landing site for the AKD ecosystem — the home of CARE methodology, AKD Core / Ext / Flow / Labs, agents, workflows, guardrails, partners, and team.

**Live site:** https://nasa-impact.github.io/AI-Agents-for-Science/

Built with [Astro](https://astro.build/) and deployed to GitHub Pages.

## Working in this repo

- **Authoring content** (agents, workflows, partners, team, governance items, vision/CARE prose): see [`src/content/README.md`](./src/content/README.md).
- **Architectural decisions:** [`docs/superpowers/specs/`](./docs/superpowers/specs/).
- **Implementation plans:** [`docs/superpowers/plans/`](./docs/superpowers/plans/).
- **Conventions for AI assistants:** [`CLAUDE.md`](./CLAUDE.md).

## Development

```bash
nvm use            # Node 20 LTS, pinned in .nvmrc
npm install
npm run dev        # local preview at http://localhost:4321/AI-Agents-for-Science/
npm run build      # static output → dist/
npm run preview    # serves dist/ for visual verification
```

## Cross-references

The development-side counterpart to this site is [`NASA-IMPACT/akd-suite`](https://github.com/NASA-IMPACT/akd-suite). Collection entries can declare an `akdRef` pointing into that repo; the build fails if any path no longer exists. To skip the network check when building offline, set `AKD_REF_VALIDATOR_OFFLINE=1`.
