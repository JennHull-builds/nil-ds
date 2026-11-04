#!/usr/bin/env node
/**
 * Prints how many tests are the kit's and how many are the eval checker's, so the two stay
 * separable when the eval merges into the kit. Every checker test file lives under eval/ and
 * matches eval/**\/*.test.ts. Numbers are counted, never typed: README.md says to run this.
 *
 *   npm run eval:count
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REPO_ROOT } from './config.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'nil-count-'));
function count(folder) {
  const out = join(tmp, `${folder}.json`);
  const env = { ...process.env };
  delete env.VITEST;
  spawnSync(process.execPath, [join(REPO_ROOT, 'node_modules/vitest/vitest.mjs'), 'run', folder, '--reporter=json', `--outputFile=${out}`], { cwd: REPO_ROOT, env, encoding: 'utf8' });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  return { files: r.testResults.length, tests: r.numTotalTests, failed: r.numFailedTests };
}
const kit = count('src');
const evalOwn = count('eval');
rmSync(tmp, { recursive: true, force: true });
console.log(`kit tests (src/):      ${kit.tests} in ${kit.files} files${kit.failed ? `, ${kit.failed} FAILED` : ''}`);
console.log(`eval tests (eval/):    ${evalOwn.tests} in ${evalOwn.files} files${evalOwn.failed ? `, ${evalOwn.failed} FAILED` : ''}`);
console.log(`npm test runs both:    ${kit.tests + evalOwn.tests} in ${kit.files + evalOwn.files} files`);
