// @ts-check
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Collect step/service ID references from every pathway YAML file.
 *
 * @param {{ pathwaysDir: URL }} opts
 * @returns {Promise<Array<{ source: string, steps: string[], services: string[] }>>}
 */
export async function collectPathwayEntries({ pathwaysDir }) {
  const root = fileURLToPath(pathwaysDir);
  /** @type {Array<{source:string, steps:string[], services:string[]}>} */
  const entries = [];
  let dirents;
  try {
    dirents = await readdir(root, { withFileTypes: true });
  } catch {
    return entries;
  }
  for (const e of dirents) {
    if (!e.isFile() || e.name.startsWith('_')) continue;
    if (!/\.ya?ml$/.test(e.name)) continue;
    const full = join(root, e.name);
    const text = await readFile(full, 'utf8');
    entries.push({
      source: relative(process.cwd(), full),
      steps: parseListField(text, 'steps'),
      services: parseListField(text, 'services'),
    });
  }
  return entries;
}

/**
 * Best-effort YAML list parser for the two fields we care about.
 * Supports inline (`steps: [a, b]`) and block (`steps:\n  - a\n  - b`) forms.
 *
 * @param {string} text
 * @param {string} field
 * @returns {string[]}
 */
export function parseListField(text, field) {
  const stripped = text.replace(/^\s*#.*$/gm, '');
  const inlineRe = new RegExp(`^${field}\\s*:\\s*\\[([^\\]]*)\\]`, 'm');
  const inline = stripped.match(inlineRe);
  if (inline) {
    return inline[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  const blockRe = new RegExp(`^${field}\\s*:\\s*\\n((?:\\s+-\\s+[^\\n]+\\n?)*)`, 'm');
  const block = stripped.match(blockRe);
  if (!block) return [];
  return block[1]
    .split('\n')
    .map((line) => line.replace(/^\s*-\s*/, '').trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/**
 * Extract STEP and SERVICE IDs from the pathway-graph.ts source by parsing it
 * as text. We cannot dynamic-`import()` a .ts file under pure Node ESM (CI),
 * so we scan the file for the two `as const satisfies readonly …[]` array
 * literals and pull each `id: '…'` from inside.
 *
 * @param {string} src
 * @returns {{ steps: Set<string>, services: Set<string> }}
 */
export function extractGraphIds(src) {
  const stepsMatch = src.match(/export const STEPS\s*=\s*\[([\s\S]*?)\]\s*as const satisfies/);
  if (!stepsMatch) throw new Error('[pathway-id-validator] could not find STEPS array in pathway-graph.ts');
  const servicesMatch = src.match(/export const SERVICES\s*=\s*\[([\s\S]*?)\]\s*as const satisfies/);
  if (!servicesMatch) throw new Error('[pathway-id-validator] could not find SERVICES array in pathway-graph.ts');
  const idRe = /\bid:\s*['"]([^'"]+)['"]/g;
  const collect = (body) => {
    /** @type {Set<string>} */
    const out = new Set();
    let m;
    while ((m = idRe.exec(body)) !== null) out.add(m[1]);
    return out;
  };
  return { steps: collect(stepsMatch[1]), services: collect(servicesMatch[1]) };
}

/**
 * @param {Array<{source:string, steps:string[], services:string[]}>} entries
 * @param {Set<string>} validSteps
 * @param {Set<string>} validServices
 * @returns {Array<{ source: string, badId: string, kind: 'step'|'service', message: string }>}
 */
export function checkPathwayIds(entries, validSteps, validServices) {
  /** @type {Array<{source:string,badId:string,kind:'step'|'service',message:string}>} */
  const errors = [];
  for (const entry of entries) {
    for (const id of entry.steps) {
      if (!validSteps.has(id)) {
        errors.push({
          source: entry.source,
          badId: id,
          kind: 'step',
          message: `[pathway-id-validator] '${entry.source}' references unknown step id '${id}'.`,
        });
      }
    }
    for (const id of entry.services) {
      if (!validServices.has(id)) {
        errors.push({
          source: entry.source,
          badId: id,
          kind: 'service',
          message: `[pathway-id-validator] '${entry.source}' references unknown service id '${id}'.`,
        });
      }
    }
  }
  return errors;
}

export default function pathwayIdValidator() {
  /** @type {URL | null} */
  let resolvedRoot = null;
  return {
    name: 'pathway-id-validator',
    hooks: {
      'astro:config:done': ({ config }) => {
        resolvedRoot = config.root;
      },
      'astro:build:start': async ({ logger }) => {
        if (!resolvedRoot) {
          logger.warn('Skipping: config root not captured.');
          return;
        }
        const pathwaysDir = new URL('src/content/pathways/', resolvedRoot);
        const entries = await collectPathwayEntries({ pathwaysDir });
        if (entries.length === 0) {
          logger.info('No pathway entries to validate.');
          return;
        }
        const graphPath = fileURLToPath(new URL('src/content/pathway-graph.ts', resolvedRoot));
        const graphSrc = await readFile(graphPath, 'utf8');
        const { steps: validSteps, services: validServices } = extractGraphIds(graphSrc);
        const errors = checkPathwayIds(entries, validSteps, validServices);
        if (errors.length > 0) {
          for (const e of errors) logger.error(e.message);
          throw new Error(`[pathway-id-validator] ${errors.length} invalid id(s). See errors above.`);
        }
        logger.info(`Validated ${entries.length} pathway entries.`);
      },
    },
  };
}
