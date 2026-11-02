/**
 * Frozen settings for the eval harness. Everything that defines "the experiment" lives here,
 * so a reader can see the whole design in one file and a change shows up in one diff.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const EVAL_DIR = join(REPO_ROOT, 'eval');

/** Every run builds its kit from this commit with `git archive`, never from the working tree. */
export const KIT_COMMIT = '094d15b';

/** Arm A removes these from the archive. README and the other human docs stay on purpose. */
export const GUIDANCE_FILES = ['AGENTS.md', 'CLAUDE.md', 'DESIGN.md', 'registry.json'];
export const STRIP_FOR_ARM_A = [...GUIDANCE_FILES, 'design-md'];

/** The labels used everywhere (README, summary.md, meta.json). Arm A is NOT guidance-free. */
export const ARM_LABELS = {
  A: 'kit plus its human docs',
  B: 'kit plus its human docs plus agent guidance',
};

export const TASKS = ['T1', 'T2', 'T3', 'T4', 'T5'];
/** T5 is held out. Its run folders are gitignored and the summary never shows its scores. */
export const SEALED_TASKS = ['T5'];

export const RULES = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10'];

/** The subject. Sonnet, five tools, project settings only. */
export const SUBJECT = {
  model: 'sonnet',
  tools: ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
  maxTurns: 30,
  timeoutMs: 10 * 60 * 1000,
  /**
   * Permission rules. Everything not allowed here is denied (permission mode dontAsk), so there is
   * no prompt to hang on. Probed 2 November 2026 (`node eval/isolation.mjs permissions`): allowing
   * Read, Glob and Grep with no path lets the subject read OUTSIDE its folder, canary content
   * included. A path-limited Read(./**) alone confines Read, Grep and Glob to the temp kit, and
   * Write/Edit(eval-output/**) confines writes. Glob and Grep need no rule of their own.
   */
  allowed: ['Read(./**)', 'Write(eval-output/**)', 'Edit(eval-output/**)'],
};

/**
 * Where one run's output folder lives. T5 goes to the sealed tree. Stub subjects get their own
 * pair of trees so a stub run can never be mistaken for, or overwrite, real data.
 */
export function roots(stub) {
  return stub
    ? { results: join(EVAL_DIR, 'results-stub'), sealed: join(EVAL_DIR, 'results-stub-sealed') }
    : { results: join(EVAL_DIR, 'results'), sealed: join(EVAL_DIR, 'results-sealed') };
}

export function runDir({ roots: r, round, task, arm, k }) {
  const base = SEALED_TASKS.includes(task) ? r.sealed : r.results;
  return join(base, `round-${round}`, task, arm, `run-${k}`);
}
