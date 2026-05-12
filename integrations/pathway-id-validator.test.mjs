import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPathwayIds, extractGraphIds } from './pathway-id-validator.js';

const VALID_STEPS = new Set(['care', 'b1-simple', 'ep-gpt']);
const VALID_SERVICES = new Set(['svc-tools', 'svc-factreasoner']);

test('checkPathwayIds returns no errors for valid IDs', () => {
  const entries = [
    {
      source: 'src/content/pathways/dev.yaml',
      steps: ['care', 'b1-simple', 'ep-gpt'],
      services: ['svc-factreasoner'],
    },
  ];
  assert.deepEqual(checkPathwayIds(entries, VALID_STEPS, VALID_SERVICES), []);
});

test('checkPathwayIds flags unknown step IDs with source + bad ID', () => {
  const entries = [
    {
      source: 'src/content/pathways/typo.yaml',
      steps: ['care', 'bad-step'],
      services: [],
    },
  ];
  const errors = checkPathwayIds(entries, VALID_STEPS, VALID_SERVICES);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /typo\.yaml/);
  assert.match(errors[0].message, /bad-step/);
  assert.match(errors[0].message, /unknown step id/i);
});

test('checkPathwayIds flags unknown service IDs', () => {
  const entries = [
    {
      source: 'src/content/pathways/bad-svc.yaml',
      steps: [],
      services: ['svc-tools', 'svc-not-real'],
    },
  ];
  const errors = checkPathwayIds(entries, VALID_STEPS, VALID_SERVICES);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /svc-not-real/);
  assert.match(errors[0].message, /unknown service id/i);
});

test('checkPathwayIds returns multiple errors when multiple files are bad', () => {
  const entries = [
    { source: 'a.yaml', steps: ['oops'], services: [] },
    { source: 'b.yaml', steps: [], services: ['oops2'] },
  ];
  const errors = checkPathwayIds(entries, VALID_STEPS, VALID_SERVICES);
  assert.equal(errors.length, 2);
});

test('extractGraphIds pulls STEP and SERVICE ids out of the TS registry text', () => {
  const sample = `
    export const STEPS = [
      { id: 'care', label: 'CARE', sublabel: 's', description: 'd', row: 'design' },
      { id: 'b1-simple', label: 'B1', sublabel: 's', description: 'd', row: 'branch-1' },
    ] as const satisfies readonly Step[];

    export const SERVICES = [
      { id: 'svc-tools', label: 'T', description: 'd' },
      { id: 'svc-factreasoner', label: 'F', description: 'd' },
    ] as const satisfies readonly Service[];
  `;
  const { steps, services } = extractGraphIds(sample);
  assert.deepEqual([...steps].sort(), ['b1-simple', 'care']);
  assert.deepEqual([...services].sort(), ['svc-factreasoner', 'svc-tools']);
});

test('extractGraphIds throws when STEPS block is missing', () => {
  assert.throws(() => extractGraphIds('export const NOPE = [];'), /STEPS/);
});

test('extractGraphIds ignores nested id-shaped strings outside the arrays', () => {
  const sample = `
    // comment with id: 'fake-id'
    export const STEPS = [
      { id: 'real-step', label: 'X', sublabel: 's', description: 'd', row: 'design' },
    ] as const satisfies readonly Step[];

    export const SERVICES = [
      { id: 'real-svc', label: 'X', description: 'd' },
    ] as const satisfies readonly Service[];

    const decoy = { id: 'decoy' };
  `;
  const { steps, services } = extractGraphIds(sample);
  assert.deepEqual([...steps], ['real-step']);
  assert.deepEqual([...services], ['real-svc']);
});
