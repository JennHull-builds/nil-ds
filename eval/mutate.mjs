/**
 * Mutation test for the checker: switch each rule's detector off, one at a time, and confirm the
 * fixture tests notice. A rule whose detector can be removed without any test failing is a rule
 * nobody has proven works.
 *
 *   npm run eval:mutate                 all ten rules
 *   npm run eval:mutate -- R1 R5        just these
 *   npm run eval:mutate -- --as na      the disabled rule reports "na" instead of "pass"
 *
 * Default mode: the detector finds nothing but still counts places, so the rule reports "pass".
 * That is the dangerous case, a check that stays green after it stopped looking.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REPO_ROOT, RULES } from './config.mjs';

const args = process.argv.slice(2);
const asIdx = args.indexOf('--as');
const as = asIdx >= 0 ? args[asIdx + 1] : '';
const wanted = args.filter((a, i) => /^R\d+$/.test(a) && i !== asIdx + 1);
const rules = wanted.length ? wanted : RULES;

const tmp = mkdtempSync(join(tmpdir(), 'nil-mutate-'));
let uncaught = 0;
console.log(`mutation mode: ${as === 'na' ? 'disabled rule reports na' : 'disabled rule reports pass'}\n`);

for (const rule of rules) {
  const out = join(tmp, `${rule}.json`);
  const env = { ...process.env, CHECKER_DISABLE: rule, ...(as === 'na' ? { CHECKER_DISABLE_AS: 'na' } : {}) };
  delete env.VITEST;
  const run = spawnSync(process.execPath, [join(REPO_ROOT, 'node_modules/vitest/vitest.mjs'), 'run', 'eval/check.test.ts', '--reporter=json', `--outputFile=${out}`], { cwd: REPO_ROOT, env, encoding: 'utf8' });
  let failed = [];
  try {
    const report = JSON.parse(readFileSync(out, 'utf8'));
    failed = report.testResults.flatMap((s) => s.assertionResults).filter((a) => a.status === 'failed').map((a) => a.title);
  } catch {
    console.log(`${rule.padEnd(4)} COULD NOT RUN: ${(run.stderr || run.stdout).slice(-200)}`);
    uncaught += 1;
    continue;
  }
  // The tests that must catch this rule: every bad fixture whose own rule it is.
  const mustCatch = failed.filter((t) => new RegExp(`^bad-.*: ${rule} is fail$`).test(t));
  const caught = mustCatch.length > 0;
  if (!caught) uncaught += 1;
  const names = mustCatch.map((t) => t.split(':')[0].replace('bad-', '')).join(', ');
  console.log(`${rule.padEnd(4)} ${caught ? 'CAUGHT' : 'NOT CAUGHT'}  ${failed.length} tests failed; bad fixtures that noticed: ${names || 'none'}`);
}

rmSync(tmp, { recursive: true, force: true });
console.log(uncaught ? `\n${uncaught} rule(s) could be switched off without a test failing.` : '\nEvery rule, switched off, made at least one fixture test fail.');
process.exit(uncaught ? 1 : 0);
