// @ts-check
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'NASA-IMPACT/akd-suite';
const TREE_API = `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`;

/**
 * Recursively collect all `akdRef` declarations from content collection entries.
 * Files starting with `_` are ignored (templates).
 *
 * @param {{ contentDir: URL }} opts
 * @returns {Promise<Array<{ kind: string, path: string, source: string }>>}
 */
export async function collectAkdRefs({ contentDir }) {
  const root = fileURLToPath(contentDir);
  const refs = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      if (e.name.startsWith('_')) continue;
      if (!/\.(mdx?|ya?ml)$/.test(e.name)) continue;
      const text = await readFile(full, 'utf8');
      const ref = parseAkdRef(text);
      if (ref) refs.push({ ...ref, source: relative(process.cwd(), full) });
    }
  }
  await walk(root);
  return refs;
}

/**
 * Parse the first non-commented `akdRef` entry in frontmatter or YAML body.
 * Supports both inline (`akdRef: { kind: agents, path: agents/x }`) and block
 * (`akdRef:\n  kind: agents\n  path: agents/x`) YAML forms. Lines starting
 * with `#` (line comments) are stripped before parsing so commented-out
 * entries are correctly ignored.
 *
 * @param {string} text
 * @returns {{ kind: string, path: string } | null}
 */
function parseAkdRef(text) {
  // Strip line comments (best-effort).
  const stripped = text.replace(/^\s*#.*$/gm, '');
  const inline = stripped.match(/akdRef\s*:\s*\{\s*kind\s*:\s*([a-z]+)\s*,\s*path\s*:\s*([^\s},]+)\s*\}/);
  if (inline) return { kind: inline[1], path: inline[2] };
  const block = stripped.match(/akdRef\s*:\s*\n\s+kind\s*:\s*([a-z]+)\s*\n\s+path\s*:\s*(\S+)/);
  if (block) return { kind: block[1], path: block[2] };
  return null;
}

/**
 * Check refs against the akd-suite directory tree. A path is considered to
 * exist if it appears as an entry in the tree, OR if any tree entry begins
 * with `path/` (i.e. the path is a parent directory).
 *
 * @param {Array<{ kind: string, path: string, source: string }>} refs
 * @param {Set<string>} tree
 * @returns {Array<{ message: string, ref: object }>}
 */
export function checkRefs(refs, tree) {
  const errors = [];
  for (const ref of refs) {
    let exists = tree.has(ref.path);
    if (!exists) {
      const prefix = ref.path + '/';
      for (const p of tree) {
        if (p.startsWith(prefix)) {
          exists = true;
          break;
        }
      }
    }
    if (!exists) {
      errors.push({
        ref,
        message: `[akd-ref-validator] '${ref.source}' references akd-suite path '${ref.path}' which does not exist on main.`,
      });
    }
  }
  return errors;
}

async function fetchTree() {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(TREE_API, {
    headers: {
      'User-Agent': 'akd-ref-validator',
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const data = await res.json();
  if (!data.tree) throw new Error('Unexpected GitHub tree API response');
  const set = new Set();
  for (const entry of data.tree) {
    if (entry.type === 'tree' || entry.type === 'blob') set.add(entry.path);
  }
  return { set, sha: data.sha };
}

/** @returns {boolean} true if validation should skip due to AKD_REF_VALIDATOR_OFFLINE=1 */
export function shouldSkipForOffline(env = process.env) {
  return env.AKD_REF_VALIDATOR_OFFLINE === '1';
}

/**
 * Astro integration entry point.
 *
 * Uses `astro:config:done` to capture the resolved config root (since
 * `astro:build:start` receives no parameters in Astro 4+), then runs
 * validation in `astro:build:start`.
 */
export default function akdRefValidator() {
  /** @type {URL | null} */
  let resolvedRoot = null;

  return {
    name: 'akd-ref-validator',
    hooks: {
      'astro:config:done': ({ config }) => {
        resolvedRoot = config.root;
      },

      'astro:build:start': async ({ logger }) => {
        if (shouldSkipForOffline()) {
          logger.warn('Skipping (offline mode via AKD_REF_VALIDATOR_OFFLINE=1)');
          return;
        }

        if (!resolvedRoot) {
          logger.warn('Skipping: config root was not captured (astro:config:done not fired).');
          return;
        }

        const contentDir = new URL('src/content/', resolvedRoot);
        const refs = await collectAkdRefs({ contentDir });

        // Also collect ecosystem-tier akdRef paths from Ecosystem.astro,
        // which are static refs not in the content collections.
        // .astro files are not importable as plain Node modules; this try/catch
        // is intentional — if the import fails, we skip ecosystem refs silently.
        try {
          const ecoMod = await import(new URL('src/components/Ecosystem.astro', resolvedRoot).href);
          if (Array.isArray(ecoMod.ECOSYSTEM_AKD_REFS)) {
            for (const r of ecoMod.ECOSYSTEM_AKD_REFS) {
              refs.push({
                kind: r.kind,
                path: r.path,
                source: 'src/components/Ecosystem.astro',
              });
            }
          }
        } catch {
          // .astro files are not resolvable as plain ESM modules in the
          // integration hook context. Skip silently — content-collection
          // paths are the primary validation target.
        }

        if (refs.length === 0) {
          logger.info('No akdRef entries to validate.');
          return;
        }

        let tree;
        try {
          tree = await fetchTree();
        } catch (err) {
          logger.warn(
            `Skipping validation: ${err instanceof Error ? err.message : String(err)} ` +
              '(network or rate limit). Build continues.',
          );
          return;
        }

        const errors = checkRefs(refs, tree.set);
        if (errors.length > 0) {
          for (const e of errors) logger.error(e.message);
          throw new Error(
            `[akd-ref-validator] ${errors.length} invalid akdRef path(s). See errors above.`,
          );
        }
        logger.info(
          `Validated ${refs.length} akdRef path(s) against akd-suite (rev: ${tree.sha.slice(0, 7)}).`,
        );
      },
    },
  };
}
