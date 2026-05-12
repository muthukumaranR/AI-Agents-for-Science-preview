import { defineCollection, z } from 'astro:content';

// Cross-reference into NASA-IMPACT/akd-suite. Validated at build time
// by integrations/akd-ref-validator.js (added in Task 8). The eventual
// content-sync migration reuses this exact field shape as its loader key.
const akdRef = z
  .object({
    kind: z.enum(['agents', 'flow', 'frameworks', 'guardrails', 'labs', 'docs']),
    path: z.string().min(1),
  })
  .optional();

const agents = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    akdRef,
    designers: z.array(z.string()).default([]),
    developers: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
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
    designers: z.array(z.string()).default([]),
    developers: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    designers: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    repo: z.string().url().optional(),
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
    url: z.string().url().optional(),
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
    members: z.array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
      }),
    ),
  }),
});

const pathways = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    eyebrow: z.string(),
    blurb: z.string().max(280),
    persona: z
      .enum(['developer', 'scientist', 'partner', 'decision-maker'])
      .optional(),
    goal: z
      .enum([
        'ship-custom-gpt',
        'build-tool-agent',
        'compose-multi-agent',
        'guardrails-as-service',
        'use-flow',
        'stand-up-platform',
      ])
      .optional(),
    steps: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    order: z.number().int().default(100),
    featured: z.boolean().default(true),
    startHere: z.boolean().default(false),
  }),
});

export const collections = { agents, workflows, governance, pages, partners, team, pathways, 'case-studies': caseStudies };
