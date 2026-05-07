import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectAkdRefs, checkRefs, shouldSkipForOffline } from './akd-ref-validator.js';

test('checkRefs returns no errors when all paths exist in tree', () => {
  const tree = new Set(['agents/factreasoner', 'flow/closed-loop', 'docs/intro']);
  const refs = [
    { kind: 'agents', path: 'agents/factreasoner', source: 'src/content/agents/factreasoner.mdx' },
    { kind: 'flow', path: 'flow/closed-loop', source: 'src/content/workflows/closed-loop.mdx' },
  ];
  const errors = checkRefs(refs, tree);
  assert.deepEqual(errors, []);
});

test('checkRefs returns errors for missing paths', () => {
  const tree = new Set(['agents/factreasoner']);
  const refs = [
    { kind: 'agents', path: 'agents/missing', source: 'src/content/agents/missing.mdx' },
    { kind: 'agents', path: 'agents/factreasoner', source: 'src/content/agents/factreasoner.mdx' },
  ];
  const errors = checkRefs(refs, tree);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /agents\/missing/);
  assert.match(errors[0].message, /missing\.mdx/);
});

test('checkRefs allows a path that exists as a parent of a tree entry', () => {
  // tree has `agents/factreasoner/README.md`, declared akdRef path is `agents/factreasoner`
  // (the parent dir). It should resolve as existing.
  const tree = new Set(['agents/factreasoner/README.md', 'agents/factreasoner/main.py']);
  const refs = [
    { kind: 'agents', path: 'agents/factreasoner', source: 'src/content/agents/factreasoner.mdx' },
  ];
  const errors = checkRefs(refs, tree);
  assert.deepEqual(errors, []);
});

test('collectAkdRefs walks content collections and gathers refs', async () => {
  // Smoke test only — the function must be callable and return an array.
  const refs = await collectAkdRefs({ contentDir: new URL('../src/content/', import.meta.url) });
  assert.ok(Array.isArray(refs));
});

test('shouldSkipForOffline returns true when AKD_REF_VALIDATOR_OFFLINE=1', () => {
  assert.equal(shouldSkipForOffline({ AKD_REF_VALIDATOR_OFFLINE: '1' }), true);
});

test('shouldSkipForOffline returns false otherwise', () => {
  assert.equal(shouldSkipForOffline({}), false);
  assert.equal(shouldSkipForOffline({ AKD_REF_VALIDATOR_OFFLINE: '0' }), false);
  assert.equal(shouldSkipForOffline({ AKD_REF_VALIDATOR_OFFLINE: 'true' }), false);  // strict equality
});
