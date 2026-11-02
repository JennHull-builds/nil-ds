/**
 * Builds the frozen kit for a run. Always from `git archive <KIT_COMMIT>`, never from the working
 * tree, so an edit to src/ in this worktree can never change what a run sees.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { EVAL_DIR, GUIDANCE_FILES, KIT_COMMIT, REPO_ROOT, STRIP_FOR_ARM_A } from '../config.mjs';

/** Extract the archived kit into `dest`. No shell is involved, so odd paths are safe. */
export function extractKit(dest) {
  mkdirSync(dest, { recursive: true });
  const tar = execFileSync('git', ['-C', REPO_ROOT, 'archive', '--format=tar', KIT_COMMIT], {
    maxBuffer: 256 * 1024 * 1024,
  });
  execFileSync('tar', ['-x', '-C', dest], { input: tar });
}

/**
 * A fresh temp dir holding one arm's kit, plus an empty eval-output/ for the subject to write to.
 * Arm A: the archive minus the four guidance files and design-md/.
 * Arm B: arm A plus the four files from eval/guidance/round-N/.
 */
export function buildArm(arm, guidanceRound = 1) {
  const dir = mkdtempSync(join(tmpdir(), 'nil-eval-'));
  extractKit(dir);
  for (const p of STRIP_FOR_ARM_A) rmSync(join(dir, p), { recursive: true, force: true });
  if (arm === 'B') {
    for (const f of GUIDANCE_FILES) {
      cpSync(join(EVAL_DIR, 'guidance', `round-${guidanceRound}`, f), join(dir, f));
    }
  }
  mkdirSync(join(dir, 'eval-output'));
  return dir;
}

/** sha256 of every file under `dir`, keyed by relative path, skipping `skip` top-level names. */
export function hashTree(dir, skip = []) {
  const out = new Map();
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      const rel = relative(dir, full);
      if (skip.includes(rel.split('/')[0])) continue;
      if (statSync(full).isDirectory()) walk(full);
      else out.set(rel, createHash('sha256').update(readFileSync(full)).digest('hex'));
    }
  })(dir);
  return out;
}

/**
 * Files that differ between a finished session dir and a freshly built copy of the same arm,
 * ignoring eval-output/ and node_modules/. Empty means the subject touched no kit file.
 */
export function kitEdits(sessionDir, arm, guidanceRound = 1) {
  const pristineDir = buildArm(arm, guidanceRound);
  try {
    const skip = ['eval-output', 'node_modules'];
    const before = hashTree(pristineDir, skip);
    const after = hashTree(sessionDir, skip);
    const edits = [];
    for (const [p, h] of after) {
      if (!before.has(p)) edits.push({ path: p, change: 'added' });
      else if (before.get(p) !== h) edits.push({ path: p, change: 'modified' });
    }
    for (const p of before.keys()) if (!after.has(p)) edits.push({ path: p, change: 'removed' });
    return edits;
  } finally {
    rmSync(pristineDir, { recursive: true, force: true });
  }
}
