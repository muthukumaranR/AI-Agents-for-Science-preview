# Content collections

This folder is the source of truth for everything on the live site that
appears as a list (agents, workflows, governance items, partners, team
members) and for prose pages (vision, CARE methodology). Edit these
files; commit; the live site rebuilds.

## Adding things

| To add a... | Copy this file | To... | Then |
| --- | --- | --- | --- |
| Agent | `agents/_template.mdx` | `agents/<slug>.mdx` | Fill in `name`, `tagline`, `description`. |
| Workflow | `workflows/_template.mdx` | `workflows/<slug>.mdx` | Fill in `name`, `tagline`. |
| Governance item | `governance/_template.mdx` | `governance/<slug>.mdx` | Fill in `title`, `summary`. |
| Partner | `partners/_template.yaml` | `partners/<slug>.yaml` | Fill in `name`, `url`. |
| Team member | (no copy needed) | edit the right `team/<org>.yaml` | Append to the `members:` list. |

`<slug>` is the filename without the extension. It must be lowercase
kebab-case (e.g. `factreasoner`, `closed-loop`). Files starting with
`_` are ignored by Astro, which is how the templates avoid rendering.

## Sort order

Each entry has an `order` field. Lower numbers appear first. Default is
100 so entries without an explicit order land at the end. Ties are
broken alphabetically by `name` / `title` (implemented in the
rendering components, not by Astro itself).

## `akdRef` cross-references

Some entries can declare an `akdRef` pointing into the
[`NASA-IMPACT/akd-suite`](https://github.com/NASA-IMPACT/akd-suite)
repo. When set, the rendered card shows a "Source on akd-suite ↗" link.

```yaml
akdRef:
  kind: agents     # one of: agents | flow | frameworks | guardrails | labs | docs
  path: agents/factreasoner   # path inside akd-suite
```

The build runs an integration that fetches the akd-suite directory
listing and **fails the build** if any `akdRef.path` doesn't exist.
This guarantees cross-links don't silently rot.

## Schemas

The authoritative shape of every collection is in
[`config.ts`](./config.ts). When in doubt, read the Zod schemas.

## Tag vocabulary

Only the `agents` collection has a `tags` field today. Use lowercase,
hyphen-free, single-word tags. Common values so far: `reasoning`,
`guardrail`, `retrieval`. If you need a new tag, add it to an entry
and mention it in the PR description so the vocabulary stays small
and consistent.

## Empty collections

A collection with zero entries renders nothing — no empty section, no
placeholder. To hide a section, delete its entries.
