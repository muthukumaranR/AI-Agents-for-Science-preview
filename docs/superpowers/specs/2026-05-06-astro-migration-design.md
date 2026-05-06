# Astro Migration — Design Spec

**Date:** 2026-05-06
**Owner:** Muthukumaran Ramasubramanian
**Status:** Approved design, pending implementation plan

## 1. Goal

Migrate the AI Agents for Science landing site from a hand-written `index.html` (1968 lines, all CSS inline) to **Astro + content collections**, preserving the existing visual design 1:1. After migration, adding or editing an agent, workflow, partner, team member, or governance item must be a "drop a file" operation — no template or component edits required.

Hosting and deploy target are unchanged: GitHub Pages, served at `https://nasa-impact.github.io/AI-Agents-for-Science/`, deployed from this repo via GitHub Actions.

## 2. Non-goals

- Visual redesign. The migration is structural; the rendered output must match the current live site at desktop (1440), tablet (768), and mobile (375) viewports.
- A hosted CMS, admin UI, or live editing. All edits go through normal git commits.
- Client-side interactivity beyond what already exists (mobile nav toggle). No React / Vue / Svelte islands.
- Tailwind, CSS-in-JS, or any styling rewrite. Existing CSS is ported as-is.
- Detail pages, client-side search, theme switching, analytics, i18n, PR preview deploys, screenshot-diff tooling. All explicitly deferred.

## 3. Migration shape

**One migration PR.** Astro scaffold + 1:1 port + all content collections + schemas + MDX + deploy workflow + cross-reference validator land together. No phased rollout.

## 4. Repository layout (post-migration)

```text
.
├── .github/workflows/deploy.yml       # build + deploy to GitHub Pages
├── .nvmrc                              # Node 20 (current LTS)
├── astro.config.mjs                    # site + base + integrations
├── package.json                        # npm scripts: dev, build, preview
├── package-lock.json
├── tsconfig.json                       # strict mode
├── integrations/
│   └── akd-ref-validator.js            # build-time akdRef path validator
├── public/
│   ├── images/
│   │   └── partners/                   # partner logos
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts                   # Zod schemas for all collections
│   │   ├── README.md                   # contributor guide
│   │   ├── pages/
│   │   │   ├── vision.mdx              # ← from 01_vision.md
│   │   │   └── care.mdx                # ← from 02_design_with_care.md
│   │   ├── agents/
│   │   │   ├── _template.mdx
│   │   │   └── *.mdx                   # one file per agent
│   │   ├── workflows/
│   │   │   ├── _template.mdx
│   │   │   └── *.mdx
│   │   ├── governance/
│   │   │   ├── _template.mdx
│   │   │   └── *.mdx
│   │   ├── partners/
│   │   │   ├── _template.yaml
│   │   │   └── *.yaml                  # one file per partner
│   │   └── team/
│   │       ├── _template.yaml
│   │       └── nasa-impact.yaml, ibm-research.yaml, development-seed.yaml
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Vision.astro
│   │   ├── Objectives.astro
│   │   ├── Care.astro
│   │   ├── Ecosystem.astro
│   │   ├── Pathway.astro
│   │   ├── AgentsGrid.astro
│   │   ├── WorkflowsList.astro
│   │   ├── Guardrails.astro
│   │   ├── Governance.astro
│   │   ├── PartnersStrip.astro
│   │   ├── TeamGrid.astro
│   │   └── GithubCTA.astro
│   ├── layouts/
│   │   └── Base.astro                  # head/meta/font-loading/global.css
│   ├── styles/
│   │   └── global.css                  # tokens, base, typography, container, cosmic background
│   └── pages/
│       └── index.astro                 # composes the components in order
├── readme.md                           # kept (project overview)
├── claude.md / CLAUDE.md               # kept (working memory)
├── scripts/                            # kept (unrelated python research code)
├── docs/superpowers/specs/             # this spec lives here
├── About                               # → folded into vision.mdx, then deleted
├── 01_vision.md                        # MOVED into src/content/pages/vision.mdx
├── 02_design_with_care.md              # MOVED into src/content/pages/care.mdx
├── index.html                          # DELETED
└── .gitignore                          # update: node_modules/, dist/, .astro/
```

## 5. Stack and conventions

- **Framework:** Astro (5.x), `output: 'static'`. No SSR. Version pinned at install time to whatever the latest 5.x stable is.
- **Content:** Astro content collections + Zod schemas. MDX enabled via `@astrojs/mdx`.
- **Styling:** existing CSS copied verbatim, split into `src/styles/global.css` (tokens, base, typography, container, background) + per-component scoped `<style>` blocks. No Tailwind, no CSS-in-JS.
- **Interactivity:** none beyond a 6-line inline `<script>` in `Nav.astro` for the mobile menu toggle. No framework islands.
- **Build / deploy:** `actions/deploy-pages@v4`, push-to-main trigger, single environment.
- **Node:** 20 LTS, pinned in `.nvmrc` and the workflow.
- **Package manager:** npm with checked-in `package-lock.json`.
- **TypeScript:** strict mode for `src/**`.

## 6. Content collections

### 6.1 Storage convention

| Collection | Layout | Notes |
|---|---|---|
| `agents` | one MDX file per agent | filename → slug |
| `workflows` | one MDX file per workflow | filename → slug |
| `governance` | one MDX file per item | filename → slug |
| `partners` | one YAML file per partner | filename → slug |
| `team` | one YAML file per org | three files: `nasa-impact.yaml`, `ibm-research.yaml`, `development-seed.yaml` |
| `pages` | MDX — `vision.mdx`, `care.mdx` | bespoke prose docs |

### 6.2 Schemas (`src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';

// Cross-reference into NASA-IMPACT/akd-suite. Validated at build time
// by integrations/akd-ref-validator.js. The eventual content-sync
// migration (see §11) reuses this exact field shape as its loader key.
const akdRef = z.object({
  kind: z.enum(['agents', 'flow', 'frameworks', 'guardrails', 'labs', 'docs']),
  path: z.string(),       // path within akd-suite, e.g. 'agents/factreasoner'
}).optional();

const agents = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    akdRef,
  }),
});

const workflows = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    agents: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    akdRef,
  }),
});

const governance = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().default(100),
    akdRef,
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const partners = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    logo: z.string().optional(),
    blurb: z.string().optional(),
    order: z.number().int().default(100),
  }),
});

const team = defineCollection({
  type: 'data',
  schema: z.object({
    org: z.string(),
    order: z.number().int().default(100),
    members: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
    })),
  }),
});

export const collections = { agents, workflows, governance, pages, partners, team };
```

### 6.3 Templates

Every collection (except `pages`) ships with a `_template.<ext>` file. Astro ignores files prefixed with `_`. Contributors copy, rename, edit, commit.

Templates show **required** fields filled with `<placeholder>` markers and **optional** fields commented out so contributors discover them without reading the schema.

### 6.4 Contributor README

`src/content/README.md` — short guide covering:
- How to add an agent / workflow / governance item / partner / team member (copy template, rename, fill in, commit).
- Where each section appears on the rendered site.
- What `akdRef` is, why it exists, and what the validator checks.
- Pointer to `config.ts` as the schema source of truth.

## 7. Components

### 7.1 Page composition (`src/pages/index.astro`)

Order matches the live page:

```text
Base
├── Nav
├── Hero
├── Vision
├── Objectives
├── Care
├── Ecosystem
├── Pathway
├── AgentsGrid
├── WorkflowsList
├── Guardrails
├── Governance
├── PartnersStrip
├── TeamGrid
├── GithubCTA
└── Footer
```

### 7.2 Per-component contract

| Component | Data source | Renders `akdRef` link? |
|---|---|---|
| `Base.astro` (layout) | — | — |
| `Nav.astro` | static; inline script for mobile toggle | — |
| `Hero.astro` | static | — |
| `Vision.astro` | `getEntry('pages', 'vision')` | — |
| `Objectives.astro` | static | — |
| `Care.astro` | `getEntry('pages', 'care')` | — |
| `Ecosystem.astro` | static; tier paths exported as a const for the validator | yes (per tier) |
| `Pathway.astro` | static | — |
| `AgentsGrid.astro` | `getCollection('agents')` | yes (per agent) |
| `WorkflowsList.astro` | `getCollection('workflows')` | yes (per workflow) |
| `Guardrails.astro` | static | — |
| `Governance.astro` | `getCollection('governance')` | yes (per item) |
| `PartnersStrip.astro` | `getCollection('partners')` | — |
| `TeamGrid.astro` | `getCollection('team')` | — |
| `GithubCTA.astro` | static; links to akd-suite | — |
| `Footer.astro` | static | — |

### 7.3 Conventions

- Collection-driven components fetch via `getCollection(...)` at build time. No client JS.
- All sort by frontmatter `order` (asc), tie-break by `name` / `title`.
- The "Source on akd-suite ↗" link styling is defined once in `global.css` and reused.
- Empty collections render nothing — no empty section, no placeholder.
- MDX page entries (`vision`, `care`) render via `await entry.render()` → `<Content />`. Section chrome (eyebrow, layout grid) lives in the wrapping component; prose lives in the MDX.

## 8. Cross-referencing `akd-suite` (option A: links + validator)

The `akd-suite` repository at `https://github.com/NASA-IMPACT/akd-suite` is the development-side counterpart to this site. Each agent, workflow, guardrail, and ecosystem tier here has a counterpart directory there.

### 8.1 What ships in this PR

- Every relevant collection entry can declare an `akdRef: { kind, path }`.
- The card / section renders a "Source on akd-suite ↗" link to `https://github.com/NASA-IMPACT/akd-suite/tree/main/<path>`.
- A custom Astro integration `integrations/akd-ref-validator.js` runs at build start, fetches `https://api.github.com/repos/NASA-IMPACT/akd-suite/git/trees/main?recursive=1` (cached for the build), and **fails the build** if any `akdRef` resolves to a missing path. The error output lists each invalid `{kind, path}` and the source file.
- On API rate-limit or network failure: integration logs a warning and skips validation — does not block the build.

### 8.2 What this PR does *not* do

- No content sync. Marketing prose lives here; akd-suite READMEs live there. They are independently authored.
- No git submodule. No CI checkout of akd-suite.

### 8.3 Future migration to content sync (§11) is mechanical

The `akdRef` shape is already what a future `defineCollection({ loader })` needs. Switching to content sync will replace per-collection seed entries with a loader that reads `vendor/akd-suite/<path>/README.md` (via CI clone or submodule); schemas don't change.

## 9. Styling port

- **`src/styles/global.css`** — design tokens (`:root`), base resets, typography helpers (`.eyebrow`, `h1–h4`, `p`), `.container`, `.section`, cosmic background (`body::before`, `body::after`), nav/footer base styling. Loaded once via `Base.astro`.
- **Per-component scoped `<style>` blocks** — every component-specific block (hero gradient, agent card, partner strip, team grid, governance grid, etc.) lives inside its own `.astro` file. Astro scopes these automatically.
- **Selector parity** — keep existing class names (`.section`, `.section-head`, `.eyebrow`, etc.) so styles drop in verbatim. Rename only on collision.
- **Fonts** — `<link>` tags for IBM Plex Sans / Mono / Serif move into `Base.astro`'s `<head>` with the same `preconnect` hints.

## 10. Build and deploy

### 10.1 `package.json`

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/mdx": "^4.0.0"
  }
}
```

### 10.2 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import akdRefValidator from './integrations/akd-ref-validator.js';

export default defineConfig({
  site: 'https://nasa-impact.github.io',
  base: '/AI-Agents-for-Science/',
  integrations: [mdx(), akdRefValidator()],
  output: 'static',
});
```

### 10.3 `.github/workflows/deploy.yml`

```yaml
name: Deploy site
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 10.4 Manual prerequisite

In repo Settings → Pages, switch source from "Deploy from a branch" to **"GitHub Actions"** before merging the migration PR. Until that flip, the build will succeed but the live site will not update. Document this in the PR description.

### 10.5 `.gitignore` additions

```text
node_modules/
dist/
.astro/
```

## 11. Future work (recorded, not done in this PR)

- **Option B — content sync from akd-suite.** Replace per-collection seed entries with a custom loader that reads `vendor/akd-suite/<path>/README.md` (CI-cloned sibling dir or git submodule). Local prose stays as override when present. Schemas unchanged — `akdRef.kind` and `akdRef.path` are already the loader's input.
- **Detail pages.** `src/pages/agents/[slug].astro`, etc., once per-item content warrants them.
- **Search.** Pagefind or similar, drop-in once detail pages exist.

## 12. Verification before merge

1. `npm run build` succeeds locally with no warnings.
2. `npm run preview` — eyeball compare against the live site at desktop (1440), tablet (768), mobile (375). Top to bottom, fix any visible deltas.
3. Visit every nav anchor — scroll-to behavior preserved.
4. Click every external link (akd-suite, partner URLs, papers) — all resolve.
5. `akd-ref-validator` ran during build and reported success (or "skipped — network").
6. Lighthouse (CLI, mobile profile): record performance / accessibility / best-practices / SEO baselines in the PR description; flag any regressions vs. the current live site.

## 13. Seed-content note

The current `index.html` describes "specialized agents" and "agent workflows" in prose without consistently enumerating named instances. During implementation I will read through `index.html` and seed each collection with whatever named entries are explicitly listed today. If a section describes a category in prose without naming items, that collection ships with only `_template.<ext>` and the contributor README explains how to populate it. The `Empty collection → render nothing` rule (§7.3) means an unpopulated collection produces no broken empty section on the live page.
