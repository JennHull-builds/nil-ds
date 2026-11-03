#!/usr/bin/env node
/**
 * Round 1 and round 2 side by side. Every number is computed from the per-run files (score.json,
 * meta.json, trace.json); none is typed. A probe, not a study: three runs per cell, no significance claims.
 *
 *   node eval/compare-rounds.mjs            writes eval/results/compare-rounds.md and prints it
 *   node eval/compare-rounds.mjs --stub     the same on the stub trees (fake runs, for testing this script)
 *
 * T5 is held out. A round's T5 runs are read only if that round's summary.json carries a `heldOut` block,
 * which exists only after `node eval/summarise.mjs --round N --unseal` (itself refused until round 2 has
 * finished). Before that, this script never opens a sealed folder and prints "T5 sealed". T5 is always its
 * own section, first, and is never folded into the T1 to T4 mean.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ARM_LABELS, EVAL_DIR, GUIDANCE_FILES, RULES, SEALED_TASKS, roots } from './config.mjs';

const stub = process.argv.includes('--stub');
const R = roots(stub);
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const f3 = (x) => (x == null ? 'n/a' : x.toFixed(3));
const signed = (x) => (x == null ? 'n/a' : `${x >= 0 ? '+' : ''}${x.toFixed(3)}`);
const pct = (u) => (u == null ? 'n/a' : `${Math.round(u * 100)}%`);
const countBy = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
const list = (m, empty = 'none') => (m.size ? [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).map(([k, v]) => `${k} (${v})`).join(', ') : empty);
const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const isHeld = (task) => SEALED_TASKS.includes(task);

/** Every run of one round. T5 is read only when this round has been unsealed. */
function loadRound(round) {
  const dir = join(R.results, `round-${round}`);
  const sumFile = join(dir, 'summary.json');
  if (!existsSync(sumFile)) throw new Error(`Round ${round} has no summary.json (${dir}). Run: node eval/summarise.mjs --round ${round}${stub ? ' --stub' : ''}`);
  const unsealed = Boolean(read(sumFile).heldOut);
  const trees = [join(dir)];
  if (unsealed) trees.push(join(R.sealed, `round-${round}`));
  const runs = [], notRun = [], attempts = [];
  for (const tree of trees) {
    for (const task of dirs(tree)) for (const arm of dirs(join(tree, task))) {
      for (const run of dirs(join(tree, task, arm)).filter((d) => d.startsWith('run-'))) {
        const d = join(tree, task, arm, run);
        if (existsSync(join(d, 'attempts.json'))) for (const a of read(join(d, 'attempts.json'))) attempts.push({ task, arm, outcome: a.outcome });
        if (existsSync(join(d, 'score.json'))) runs.push({ task, arm, k: Number(run.slice(4)), score: read(join(d, 'score.json')), meta: read(join(d, 'meta.json')), trace: read(join(d, 'trace.json')) });
        else if (existsSync(join(d, 'not-run.json'))) notRun.push({ task, arm, ...read(join(d, 'not-run.json')) });
      }
    }
  }
  return { round, unsealed, runs, notRun, attempts };
}

const rounds = [loadRound(1), loadRound(2)];
const [r1, r2] = rounds;
const visible = (rd, arm) => rd.runs.filter((r) => r.arm === arm && !isHeld(r.task));
const held = (rd, arm) => rd.runs.filter((r) => r.arm === arm && isHeld(r.task));
const stat = (rs) => { const s = rs.map((r) => r.score.score); return { n: s.length, mean: mean(s), min: s.length ? Math.min(...s) : null, max: s.length ? Math.max(...s) : null, scores: s }; };
const cell = (s) => (s.n ? `${f3(s.mean)} (min ${f3(s.min)}, max ${f3(s.max)}, n=${s.n})` : 'n/a');
const delta = (a, b) => (a.n && b.n ? b.mean - a.mean : null);
const arms = ['A', 'B'];
const taskIds = [...new Set(rounds.flatMap((rd) => rd.runs.filter((r) => !isHeld(r.task)).map((r) => r.task)))].sort();

const L = [];
L.push('# Round 1 and round 2, side by side (generated)', '');
L.push(`Generated ${new Date().toISOString()} by eval/compare-rounds.mjs${stub ? ' on STUB data (fake runs, not results)' : ''}. Every number is computed from the per-run files; none is typed. **A probe, not a study: three runs per cell, twelve per arm over T1 to T4, no significance claims.** Contrast is not covered anywhere. The only thing that changed between the rounds is arm B's AGENTS.md; arm A is identical in both, so its change from round 1 to round 2 is the noise band.`, '');

// ---- 1. T5 first
L.push('## Held-out T5 (first, because it is the only measure of whether the change generalises)', '');
if (r1.unsealed && r2.unsealed) {
  L.push('Not folded into any mean below. Scores are listed run by run, since there are only three per arm per round.', '', '| Arm | Round 1 | Round 2 | Change |', '|---|---|---|---|');
  for (const a of arms) {
    const s1 = stat(held(r1, a)), s2 = stat(held(r2, a));
    L.push(`| ${a}: ${ARM_LABELS[a]} | ${cell(s1)}; scores ${s1.scores.map(f3).join(', ')} | ${cell(s2)}; scores ${s2.scores.map(f3).join(', ')} | ${signed(delta(s1, s2))} |`);
  }
  L.push('');
  for (const rd of rounds) for (const a of arms) {
    const fails = countBy(held(rd, a).flatMap((r) => RULES.filter((x) => r.score.rules[x]?.status === 'fail')));
    L.push(`- Round ${rd.round}, arm ${a}, T5 rules that failed (runs): ${list(fails)}.`);
  }
} else {
  L.push(`T5 sealed: round 1 ${r1.unsealed ? 'unsealed' : 'sealed'}, round 2 ${r2.unsealed ? 'unsealed' : 'sealed'}. Run \`node eval/summarise.mjs --round N --unseal\` for each round once round 2 has finished.`);
}

// ---- 2. T1 to T4 per arm
L.push('', '## T1 to T4 per arm', '', '| Arm | Round 1 | Round 2 | Change |', '|---|---|---|---|');
for (const a of arms) { const s1 = stat(visible(r1, a)), s2 = stat(visible(r2, a)); L.push(`| ${a}: ${ARM_LABELS[a]} | ${cell(s1)} | ${cell(s2)} | ${signed(delta(s1, s2))} |`); }

L.push('', '### Per task (mean of three runs)', '', '| Task | A round 1 | A round 2 | A drift | B round 1 | B round 2 | B change |', '|---|---|---|---|---|---|---|');
const drifts = [];
for (const t of taskIds) {
  const g = (rd, a) => stat(rd.runs.filter((r) => r.task === t && r.arm === a));
  const [a1, a2, b1, b2] = [g(r1, 'A'), g(r2, 'A'), g(r1, 'B'), g(r2, 'B')];
  drifts.push({ t, a: delta(a1, a2), b: delta(b1, b2) });
  L.push(`| ${t} | ${f3(a1.mean)} | ${f3(a2.mean)} | ${signed(delta(a1, a2))} | ${f3(b1.mean)} | ${f3(b2.mean)} | ${signed(delta(b1, b2))} |`);
}

// ---- 3. noise band
const aS = [stat(visible(r1, 'A')), stat(visible(r2, 'A'))], bS = [stat(visible(r1, 'B')), stat(visible(r2, 'B'))];
L.push('', '## Noise band (arm A) and arm B\'s change', '',
  'Arm A runs identically in both rounds, so how far it moves is how far an unchanged arm moves by chance. Arm B\'s change only means something against that.', '');
L.push(`- Arm A, T1 to T4 mean: ${f3(aS[0].mean)} then ${f3(aS[1].mean)}, drift ${signed(delta(aS[0], aS[1]))}. Largest single-task drift: ${drifts.filter((d) => d.a != null).sort((x, y) => Math.abs(y.a) - Math.abs(x.a)).slice(0, 1).map((d) => `${d.t} ${signed(d.a)}`).join('') || 'n/a'}.`);
L.push(`- Arm B, T1 to T4 mean: ${f3(bS[0].mean)} then ${f3(bS[1].mean)}, change ${signed(delta(bS[0], bS[1]))}.`);
if (delta(aS[0], aS[1]) != null && delta(bS[0], bS[1]) != null) L.push(`- Arm B's change minus arm A's drift: ${signed(delta(bS[0], bS[1]) - delta(aS[0], aS[1]))}. Arm B started at ${f3(bS[0].mean)} out of a maximum of 1.000, so it has at most ${f3(1 - bS[0].mean)} of headroom on this measure.`);
if (r1.unsealed && r2.unsealed) {
  const t = arms.map((a) => [stat(held(r1, a)), stat(held(r2, a))]);
  L.push(`- T5 (held out): arm A drift ${signed(delta(t[0][0], t[0][1]))}, arm B change ${signed(delta(t[1][0], t[1][1]))}.`);
}

// ---- 4. DESIGN.md opens
const opened = (rs, f) => rs.filter((r) => (r.trace.opened?.[f] ?? 0) > 0).length;
L.push('', '## Did the agent open the files that are not auto-loaded?', '', 'Counted from each run\'s trace.json (a Read of that file name). Arm A has no DESIGN.md or registry.json in its folder, so a count there is a failed read of a file that is not there.', '', '| | Arm | Round 1 | Round 2 |', '|---|---|---|---|');
for (const f of ['DESIGN.md', 'registry.json']) for (const a of arms) {
  const c = (rd) => `${opened(visible(rd, a), f)} of ${visible(rd, a).length} (T1 to T4)${rd.unsealed ? `; T5 ${opened(held(rd, a), f)} of ${held(rd, a).length}` : ''}`;
  L.push(`| ${f} | ${a} | ${c(r1)} | ${c(r2)} |`);
}

// ---- 4b. token lookups and tool calls (T1 to T4)
const tools = (r) => r.trace.tools ?? [];
const grepTokensCss = (rs) => rs.filter((r) => tools(r).some((c) => c.name === 'Grep' && (c.path ?? '').includes('tokens.css'))).length;
const readRegistry = (rs) => rs.filter((r) => tools(r).some((c) => c.name === 'Read' && (c.path ?? '').includes('registry.json'))).length;
const toolCalls = (rs) => rs.reduce((n, r) => n + tools(r).length, 0);
const lookupCols = [[r1, 'A'], [r2, 'A'], [r1, 'B'], [r2, 'B']].map(([rd, a]) => visible(rd, a));
L.push('', '## Token lookups and tool calls (T1 to T4)', '',
  'Counted from each run\'s trace.json, T1 to T4 only. A run counts once if it made at least one matching call. The Grep column counts calls whose path contains tokens.css, so a Grep with no path, or on a folder, is not counted.', '',
  '| Measure | A round 1 | A round 2 | B round 1 | B round 2 |', '|---|---|---|---|---|');
L.push(`| Runs with a Grep whose path contains tokens.css | ${lookupCols.map((rs) => `${grepTokensCss(rs)} of ${rs.length}`).join(' | ')} |`);
L.push(`| Runs with a Read of registry.json | ${lookupCols.map((rs) => `${readRegistry(rs)} of ${rs.length}`).join(' | ')} |`);
L.push(`| Total tool calls | ${lookupCols.map((rs) => toolCalls(rs)).join(' | ')} |`);

// ---- 5. invented tokens
L.push('', '## Invented tokens (R3)', '', 'Names written as var(--nil-...) that are not in tokens.css, with how many runs used each.', '');
for (const a of arms) for (const rd of rounds) {
  const inv = (rs) => list(countBy(rs.flatMap((r) => r.score.facts?.inventedTokens ?? [])));
  L.push(`- Arm ${a}, round ${rd.round}: T1 to T4 ${inv(visible(rd, a))}${rd.unsealed ? `; T5 ${inv(held(rd, a))}` : ''}.`);
}

// ---- 6. rule failures
L.push('', '## Rule failures (T1 to T4), runs failing each rule', '', '| Rule | A round 1 | A round 2 | B round 1 | B round 2 |', '|---|---|---|---|---|');
const failCount = (rs, rule) => rs.filter((r) => r.score.rules[rule]?.status === 'fail').length;
for (const rule of RULES) {
  const row = [visible(r1, 'A'), visible(r2, 'A'), visible(r1, 'B'), visible(r2, 'B')].map((rs) => failCount(rs, rule));
  if (row.some((x) => x > 0)) L.push(`| ${rule} | ${row.join(' | ')} |`);
}
if (!RULES.some((rule) => [visible(r1, 'A'), visible(r2, 'A'), visible(r1, 'B'), visible(r2, 'B')].some((rs) => failCount(rs, rule) > 0))) L.push('| (no rule failed in any run) | 0 | 0 | 0 | 0 |');

// ---- 7. guidance proof, counts, usage
L.push('', '## Which guidance each round\'s arm B actually ran with', '');
for (const rd of rounds) {
  const b = rd.runs.filter((r) => r.arm === 'B');
  const dirN = join(EVAL_DIR, 'guidance', `round-${rd.round}`);
  const disk = Object.fromEntries(GUIDANCE_FILES.map((f) => [f, existsSync(join(dirN, f)) ? sha256(join(dirN, f)) : null]));
  const ok = b.filter((r) => r.meta.guidance?.round === rd.round && GUIDANCE_FILES.every((f) => r.meta.guidance.sha256?.[f] === disk[f])).length;
  L.push(`- Round ${rd.round}: ${ok} of ${b.length} arm B runs record guidance round ${rd.round} with all four sha256 hashes equal to eval/guidance/round-${rd.round}/ on disk. AGENTS.md ${disk['AGENTS.md']?.slice(0, 16)}...`);
}
for (const f of GUIDANCE_FILES) {
  const same = existsSync(join(EVAL_DIR, 'guidance', 'round-1', f)) && existsSync(join(EVAL_DIR, 'guidance', 'round-2', f)) && sha256(join(EVAL_DIR, 'guidance', 'round-1', f)) === sha256(join(EVAL_DIR, 'guidance', 'round-2', f));
  L.push(`- ${f}: ${same ? 'byte-identical in both rounds' : 'differs between the rounds'}.`);
}

L.push('', '## Counts, cost and the plan\'s usage windows', '');
for (const rd of rounds) {
  const rs = [...rd.runs].sort((x, y) => String(x.meta.startedAt).localeCompare(String(y.meta.startedAt)));
  const first = rs[0]?.meta.usageWindows, last = [...rd.runs].sort((x, y) => String(y.meta.finishedAt).localeCompare(String(x.meta.finishedAt)))[0]?.meta.usageWindows;
  const start = first?.before ?? first?.first, end = last?.last;
  const sum = (f) => rd.runs.reduce((n, r) => n + (f(r) ?? 0), 0);
  L.push(`- **Round ${rd.round}**: ${rd.runs.length} scored runs${rd.unsealed ? ' (T5 included)' : ' (T5 sealed, not counted)'}; not run: ${list(countBy(rd.notRun.map((r) => r.reason)))}; excluded attempts: ${list(countBy(rd.attempts.map((a) => a.outcome)))}; ended: ${list(countBy(rd.runs.map((r) => r.score.ended ?? 'completed')))}.`);
  L.push(`  Wall-clock ${Math.round(sum((r) => r.meta.wallMs) / 1000)} s, $${sum((r) => r.meta.totalCostUsd).toFixed(2)} as the CLI reports it (an API-price equivalent, not a bill). Five-hour window ${pct(start?.fiveHour?.utilization)} at the start, ${pct(end?.fiveHour?.utilization)} at the end; seven-day ${pct(start?.sevenDay?.utilization)} at the start, ${pct(end?.sevenDay?.utilization)} at the end.`);
}
L.push('');

const out = L.join('\n') + '\n';
const file = join(R.results, 'compare-rounds.md');
writeFileSync(file, out);
process.stdout.write(out);
console.log(`wrote ${file.replace(`${EVAL_DIR}/`, 'eval/')}`);
