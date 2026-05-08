# Contributing content

This folder is the source of truth for everything on the live site that appears as a list (agents, workflows, governance items, partners, team members) and for prose pages (vision, CARE methodology). Edit these files, commit, the live site rebuilds.

If you're new to the repo, read this top to bottom before editing — it walks through what each kind of edit looks like end-to-end.

## TL;DR

| To add a... | Copy this file | To... | Required fields |
| --- | --- | --- | --- |
| Agent | `agents/_template.mdx` | `agents/<slug>.mdx` | `name`, `tagline`, `description` |
| Workflow | `workflows/_template.mdx` | `workflows/<slug>.mdx` | `name`, `tagline` |
| Governance item | `governance/_template.mdx` | `governance/<slug>.mdx` | `title`, `summary` |
| Partner | `partners/_template.yaml` | `partners/<slug>.yaml` | `name` (URL is optional) |
| Team member | *(no copy)* | edit `team/<org>.yaml` | append to `members:` |
| Vision / CARE prose | *(no copy)* | edit `pages/vision.mdx` or `pages/care.mdx` | `title` (already set) |

`<slug>` is the filename without the extension. Use lowercase kebab-case (`factreasoner`, `closed-loop`, `nasa-impact`). Files prefixed with `_` are ignored by the build, which is how templates stay invisible.

## Local setup (one time)

```bash
nvm use            # picks up Node 20 from .nvmrc
npm install
```

If `nvm` isn't installed, install Node 20 LTS some other way and verify with `node --version`. Anything outside `^20.3.0` will produce an `engines` warning during `npm install`.

## Local preview workflow

```bash
npm run dev        # http://localhost:4321/AI-Agents-for-Science/
```

The dev server hot-reloads as you save MDX/YAML files. If you make a schema-invalid edit (e.g., delete a required field), the dev server prints a Zod error pointing at the file and the missing field — fix it and save, no restart needed.

When you're happy:

```bash
npm run build      # produces dist/
npm run preview    # serves dist/ for a final visual check
```

`npm run build` is what CI runs. If it succeeds locally and your changes look right in `npm run preview`, it'll succeed in CI.

## Example: adding an agent

Say you want to add an agent called "RAG Auditor."

```bash
cd src/content/agents
cp _template.mdx rag-auditor.mdx
```

Open `rag-auditor.mdx` and fill in the frontmatter:

```mdx
---
name: RAG Auditor
tagline: Evaluates retrieval-augmented answers against source provenance.
description: A guardrail-stage agent that scores each cited claim's traceability back to its retrieval source. Surfaces unsupported assertions before they reach the user.
tags: [guardrail, retrieval]
order: 25                                   # appears between order 20 and 30
akdRef: { kind: agents, path: agents/rag-auditor }   # only if this exists in akd-suite
---
```

Save. Run `npm run dev` and scroll to the Agents section — your new card should be there.

If you don't have a corresponding `akd-suite/agents/rag-auditor` directory yet, **leave the `akdRef` line commented out**. The build runs a validator that fails on broken paths (see "akdRef cross-references" below).

## Example: adding a partner

```bash
cd src/content/partners
cp _template.yaml my-org.yaml
```

```yaml
name: My Org
order: 70
# url: https://my-org.example         # optional — uncomment if you have a verified URL
# blurb: Short tagline                # optional
# logo: /images/partners/my-org.svg   # optional, place the asset under public/images/partners/
```

Only `name` is required. Skip `url` if you don't have a verified one — partners with no URL render as text-only entries (no link). Same for `logo` — if absent, the card falls back to the partner name as text.

## Example: adding a team member

Team members aren't separate files — each org has one file:

- `team/nasa-impact.yaml`
- `team/ibm-research.yaml`
- `team/development-seed.yaml`

Open the relevant org's file and append to `members:`:

```yaml
org: NASA IMPACT AI
order: 10
members:
  - name: Existing Person
  - name: Another Existing Person
  - name: New Person                   # ← your addition
    # role: Optional title             # uncomment if you want a role line
```

For a brand-new partner organization (not in the existing three), copy `team/_template.yaml` to `team/<org-slug>.yaml`, fill in `org`, `order`, and the members list.

## Sort order across all collections

Each entry has an `order` field. Lower numbers appear first. Default is `100` so entries without an explicit `order` land at the end. Ties are broken alphabetically by `name` / `title` / `org` (implemented in the rendering components, not by Astro itself).

Convention used by the existing seed entries: `10`, `20`, `30`, `40`, … with gaps so you can insert between later (`25`, `35`, …) without renumbering.

## `akdRef` cross-references

Some collection entries can declare an `akdRef` pointing into the [`NASA-IMPACT/akd-suite`](https://github.com/NASA-IMPACT/akd-suite) repo. When set, the rendered card shows a "Source on akd-suite ↗" link that opens in a new tab.

```yaml
akdRef:
  kind: agents          # one of: agents | flow | frameworks | guardrails | labs | docs
  path: agents/factreasoner    # path inside akd-suite
```

Or in inline form (also supported):

```yaml
akdRef: { kind: agents, path: agents/factreasoner }
```

The build runs an integration that fetches the akd-suite directory listing and **fails the build** if any `akdRef.path` doesn't exist on `main`. This guarantees cross-links don't silently rot.

If you want to declare an `akdRef` for a path that doesn't exist yet, **comment the line out** with `#` until the akd-suite path lands. The validator skips commented lines.

### Building offline

To skip akd-suite path validation when iterating without network access (or if GitHub API is rate-limiting you):

```bash
AKD_REF_VALIDATOR_OFFLINE=1 npm run build
```

CI builds get the authenticated rate limit (5000 req/hr) automatically via the GitHub-provided `GITHUB_TOKEN`.

## Editing prose pages (vision / CARE)

`pages/vision.mdx` and `pages/care.mdx` are full markdown documents that render as their respective sections. Just edit the prose. The wrapping component owns the section heading (drawn from frontmatter `title`) — don't add a top-level `## ...` heading inside the body.

Tables, lists, links, bold/italic — all work as standard markdown. The site renders them with dark-theme-friendly styling.

## Submitting your change

Edits go through normal git:

```bash
git checkout -b content/<short-description>
# edit files
git add src/content/...
git commit -m "content: add RAG Auditor agent entry"
git push -u origin content/<short-description>
gh pr create --title "Add RAG Auditor agent" --body "Adds the agent entry. akd-suite path verified."
```

CI runs `npm run build` on push. When the PR is green, request review and merge. The live site rebuilds within ~1 minute of merge.

## Troubleshooting

**Build fails with `InvalidContentEntryDataError: <collection> → <slug> data does not match collection schema`**

A required field is missing or the wrong type. The error message names the file and the offending field. Open it, fix the frontmatter, save. Common causes: forgot a required field, used a quoted string where a list was expected, mistyped a YAML key.

**Build fails with `[akd-ref-validator] '<file>' references akd-suite path '<path>' which does not exist on main`**

Your `akdRef.path` doesn't exist in `akd-suite`. Either:
- Confirm the path in [akd-suite's tree](https://github.com/NASA-IMPACT/akd-suite/tree/main) and fix the typo.
- Comment the `akdRef` line out (with `#`) if the path is planned but not yet there.
- Set `AKD_REF_VALIDATOR_OFFLINE=1` if you're iterating offline and don't want to block on this.

**Build succeeds but your new entry doesn't appear on the page**

Check three things:
1. Did you copy the template to a name without the leading `_`? Files starting with `_` are ignored.
2. Is the file under the right collection directory (`agents/`, not `agent/`)?
3. Is the file extension correct? `.mdx` for content collections, `.yaml` for data collections.

**The dev server isn't picking up your changes**

Stop it (`Ctrl+C`) and run `npm run dev` again. Schema changes occasionally need a restart.

**You see "engines warning" during `npm install`**

You're not on Node 20. Run `nvm use` (or install Node 20). The build will still work on other Node majors that Astro supports, but CI runs on 20.

## Schemas

The authoritative shape of every collection is in [`config.ts`](./config.ts). When in doubt, read the Zod schemas — they're the single source of truth that the build enforces.

## Tag vocabulary

Only the `agents` collection has a `tags` field today. Use lowercase, hyphen-free, single-word tags. Common values: `reasoning`, `guardrail`, `retrieval`, `search`, `publication`. If you need a new tag, add it to an entry and mention it in the PR description so the vocabulary stays small and consistent.

## Empty collections

A collection with zero entries renders nothing — no empty section, no placeholder. To hide a section, delete its entries.
