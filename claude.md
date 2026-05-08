Working memory for the AI Agents for Science site (NASA IMPACT).
This file tells Claude how to work in this repo so future sessions stay consistent.

Project

What this is: the public landing site for the AKD ecosystem (CARE methodology, AKD Core/Ext/Flow/Labs, agents, workflows, guardrails, partners, team).
Live URL: https://nasa-impact.github.io/AI-Agents-for-Science/
Hosting: GitHub Pages, deployed from this repo via GitHub Actions.
Audience: scientists, partner orgs, NASA stakeholders, prospective contributors.
Tone: open, trustworthy, technical-but-accessible. No marketing fluff. Match the existing voice on the page.

Migration goal
Move from hand-written index.html + CSS to Astro + content collections, while preserving the existing visual design 1:1. After migration, adding/editing an agent, team member, partner, or workflow should mean dropping a markdown or YAML file in a content folder — no template editing.
Deployment stays on GitHub Pages. The user does not want a hosted CMS, an admin UI, or live editing. Edits happen via normal git commits.
Stack

Framework: Astro (latest stable). Static output only.
Content: Astro content collections with Zod schemas. MDX enabled for sections that embed components inline.
Styling: keep the existing CSS as-is. Port it into Astro components with scoped styles or a single global stylesheet — do not rewrite to Tailwind, do not introduce a CSS-in-JS library.
Interactivity: none expected. Do not add React/Vue/Svelte islands unless a future feature explicitly requires it. The site is static.
Build/deploy: actions/deploy-pages@v4 workflow on push to main. Pages source set to "GitHub Actions" in repo settings.
Node version: pin to current LTS in .nvmrc and the workflow.
Package manager: npm (lockfile checked in). Don't switch to pnpm/yarn without discussion.