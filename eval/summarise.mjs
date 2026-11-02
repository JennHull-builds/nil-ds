#!/usr/bin/env node
/**
 * Turns a round's per-run files into summary.json and a generated summary.md. Numbers are
 * generated, never typed. No significance claims: 12 runs per arm is a probe.
 *
 *   node eval/summarise.mjs --round 1
 *   node eval/summarise.mjs --round 1 --unseal     only after round 2 has finished
 *
 * T5 is held out. By default this file does not open a single T5 score: it counts folders that
 * contain a score.json and prints "T5 sealed: N runs completed". --unseal scores T5 and adds it
 * as its own held-out line, never folded into the four-task mean.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARM_LABELS, RULES, SEALED_TASKS, roots } from './config.mjs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const f2 = (x) => (x == null ? 'n/a' : x.toFixed(2));
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}% (${n}/${d})` : 'n/a');

/** Every run folder under one tree: { task, arm, run, score?, meta?, trace?, notRun? } */
function collect(treeDir, taskFilter) {
  const out = [];
  for (const task of dirs(treeDir).filter(taskFilter)) {
    for (const arm of dirs(join(treeDir, task))) {
      for (const run of dirs(join(treeDir, task, arm)).filter((d) => d.startsWith('run-'))) {
        const d = join(treeDir, task, arm, run);
        const rec = { task, arm, run: Number(run.slice(4)), dir: d };
        if (existsSync(join(d, 'score.json'))) rec.scored = true;
        if (existsSync(join(d, 'not-run.json'))) rec.notRun = read(join(d, 'not-run.json'));
        out.push(rec);
      }
    }
  }
  return out;
}

function stats(recs) {
  const scores = recs.map((r) => r.score.score);
  return { n: scores.length, mean: mean(scores), min: scores.length ? Math.min(...scores) : null, max: scores.length ? Math.max(...scores) : null, scores };
}

function perRule(recs) {
  const out = {};
  for (const rule of RULES) {
    let pass = 0, fail = 0, na = 0;
    for (const r of recs) { const s = r.score.rules[rule]?.status; if (s === 'pass') pass += 1; else if (s === 'fail') fail += 1; else na += 1; }
    out[rule] = { pass, fail, na };
  }
  return out;
}

export function summarise({ round, stub = false, unseal = false }) {
  const R = roots(stub);
  const roundDir = join(R.results, `round-${round}`);
  const sealedDir = join(R.sealed, `round-${round}`);
  const armIds = ['A', 'B'];

  // Visible tasks only. T5 is never opened here unless --unseal.
  const visible = collect(roundDir, (t) => !SEALED_TASKS.includes(t));
  for (const r of visible) if (r.scored) { r.score = read(join(r.dir, 'score.json')); r.meta = read(join(r.dir, 'meta.json')); r.trace = read(join(r.dir, 'trace.json')); }
  for (const r of visible) if (existsSync(join(r.dir, 'attempts.json'))) r.attempts = read(join(r.dir, 'attempts.json'));
  const scored = visible.filter((r) => r.scored);
  const notRun = visible.filter((r) => r.notRun && !r.scored);
  const countBy = (xs) => Object.fromEntries([...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())].sort());
  const notRunByReason = countBy(notRun.map((r) => r.notRun.reason));
  // Every attempt that produced no score, including ones that were retried and then succeeded.
  const excludedAttempts = countBy(visible.flatMap((r) => (r.attempts ?? []).map((a) => a.outcome)));
  // How each scored run ended. A 0 from a timeout must never read like a 0 from bad code.
  const endedBy = Object.fromEntries(['A', 'B'].map((a) => [a, countBy(scored.filter((r) => r.arm === a).map((r) => r.score.ended ?? 'completed'))]));
  const zeroRuns = scored.filter((r) => r.score.score === 0).map((r) => ({ task: r.task, arm: r.arm, run: r.run, ended: r.score.ended ?? 'completed' }));

  const sealedRecs = collect(sealedDir, (t) => SEALED_TASKS.includes(t));
  const sealedDone = sealedRecs.filter((r) => r.scored).length; // existence only, no parsing

  const byArm = Object.fromEntries(armIds.map((a) => [a, scored.filter((r) => r.arm === a)]));
  const armStats = Object.fromEntries(armIds.map((a) => [a, { label: ARM_LABELS[a], ...stats(byArm[a]), notRun: notRun.filter((r) => r.arm === a).length }]));

  const taskIds = [...new Set(visible.map((r) => r.task))].sort();
  const perTask = Object.fromEntries(taskIds.map((t) => [t, Object.fromEntries(armIds.map((a) => [a, stats(byArm[a].filter((r) => r.task === t))]))]));
  const rules = Object.fromEntries(armIds.map((a) => [a, perRule(byArm[a])]));

  const invented = Object.fromEntries(armIds.map((a) => {
    const counts = new Map();
    for (const r of byArm[a]) for (const n of r.score.facts?.inventedTokens ?? []) counts.set(n, (counts.get(n) ?? 0) + 1);
    return [a, [...counts].sort((x, y) => y[1] - x[1]).map(([name, runs]) => ({ name, runs }))];
  }));

  const opened = { runs: byArm.B.length, 'DESIGN.md': 0, 'registry.json': 0, 'AGENTS.md': 0 };
  for (const r of byArm.B) for (const k of ['DESIGN.md', 'registry.json', 'AGENTS.md']) if ((r.trace.opened?.[k] ?? 0) > 0) opened[k] += 1;
  const ref = Object.fromEntries(armIds.map((a) => [a, byArm[a].filter((r) => (r.meta.refOnKitComponent ?? []).length > 0).length]));
  const kitEdited = scored.filter((r) => (r.meta.kitEditsOutsideEvalOutput ?? []).length > 0).length;

  // Validity. Runs whose first-turn prompt is outside its cell's band are excluded while the round
  // runs (see run.mjs), so everything scored here is in band. The gap below is observational: how
  // much larger arm B's first prompt is than arm A's, which is the guidance that did load.
  const groups = new Map();
  for (const r of scored) if (r.meta.firstTurnPromptTokens > 0) { const k = `${r.task}|${r.arm}`; groups.set(k, [...(groups.get(k) ?? []), r]); }
  const gaps = [];
  for (const t of taskIds) {
    const a = groups.get(`${t}|A`), b = groups.get(`${t}|B`);
    if (a && b) gaps.push({ task: t, medianGap: median(b.map((r) => r.meta.firstTurnPromptTokens)) - median(a.map((r) => r.meta.firstTurnPromptTokens)) });
  }

  const sum = (f) => scored.reduce((n, r) => n + (f(r) ?? 0), 0);
  const usage = {
    runs: scored.length,
    totalCostUsd: sum((r) => r.meta.totalCostUsd), totalWallSeconds: Math.round(sum((r) => r.meta.wallMs) / 1000),
    inputTokens: sum((r) => r.meta.usage.input_tokens), outputTokens: sum((r) => r.meta.usage.output_tokens),
    cacheReadTokens: sum((r) => r.meta.usage.cache_read_input_tokens), cacheWriteTokens: sum((r) => r.meta.usage.cache_creation_input_tokens),
    fiveHourUtilizationFirstToLast: [scored[0]?.meta.usageWindows?.first?.fiveHour?.utilization ?? null, scored[scored.length - 1]?.meta.usageWindows?.last?.fiveHour?.utilization ?? null],
    sevenDayUtilizationFirstToLast: [scored[0]?.meta.usageWindows?.first?.sevenDay?.utilization ?? null, scored[scored.length - 1]?.meta.usageWindows?.last?.sevenDay?.utilization ?? null],
  };
  const models = [...new Set(scored.map((r) => r.meta.model?.resolved).filter(Boolean))];

  const json = {
    round, generatedAt: new Date().toISOString(), stub,
    note: 'A probe, not a study. No significance claims.',
    models, arms: armStats, perTask, perRule: rules, inventedTokens: invented,
    guidanceOpened: opened, refOnKitComponent: ref, runsWithKitEdits: kitEdited,
    notRun: notRun.map((r) => ({ task: r.task, arm: r.arm, run: r.run, reason: r.notRun.reason, detail: r.notRun.detail })),
    notRunByReason, excludedAttempts, endedBy, zeroScoreRuns: zeroRuns,
    validity: { promptSizeGapBToA: gaps }, usage,
  };

  // Held-out T5: only on request, and only after round 2 exists.
  if (unseal) {
    if (!existsSync(join(R.results, 'round-2', 'summary.json'))) throw new Error('--unseal is only allowed after round 2 has finished (no round-2/summary.json found).');
    const held = sealedRecs.filter((r) => r.scored);
    for (const r of held) r.score = read(join(r.dir, 'score.json'));
    json.heldOut = { T5: { note: 'Held out. Never folded into the four-task mean.', ...Object.fromEntries(armIds.map((a) => [a, stats(held.filter((r) => r.arm === a))])), perRule: Object.fromEntries(armIds.map((a) => [a, perRule(held.filter((r) => r.arm === a))])) } };
  }

  const md = render(json, { roundDir });
  const files = { json: join(roundDir, 'summary.json'), md: join(roundDir, 'summary.md') };
  if (existsSync(roundDir)) {
    writeFileSync(files.json, JSON.stringify(json, null, 2) + '\n');
    writeFileSync(files.md, md);
  }
  return { ...files, sealedLine: sealedRecs.length || SEALED_TASKS.length ? `T5 sealed: ${sealedDone} runs completed` : null, data: json };
}

function render(j, { roundDir }) {
  const L = [];
  const arms = ['A', 'B'];
  const total = arms.reduce((n, a) => n + j.arms[a].n, 0);
  L.push(`# Round ${j.round} summary (generated)`, '');
  if (j.stub) L.push('> STUB OUTPUT. These runs used a fake subject and spent no usage. They are not results.', '');
  L.push(`Generated ${j.generatedAt} by eval/summarise.mjs. Every number below is computed from the per-run files; none is typed. **This is a probe, not a study: no significance claims.** ${total} scored runs. Model: ${j.models.join(', ') || 'n/a'}. Contrast is not covered anywhere (axe asserts semantics and ARIA only).`, '');
  L.push('## Score per arm', '', 'Run score = rules passed / rules that apply. Arm score = mean of its runs.', '');
  L.push('| Arm | Scored runs | Mean | Min | Max | Not run |', '|---|---|---|---|---|---|');
  for (const a of arms) { const s = j.arms[a]; L.push(`| ${a}: ${s.label} | ${s.n} | ${f2(s.mean)} | ${f2(s.min)} | ${f2(s.max)} | ${s.notRun} |`); }
  L.push('', '## Mean score per task', '', `| Task | A: ${j.arms.A.label} | B: ${j.arms.B.label} |`, '|---|---|---|');
  for (const [t, v] of Object.entries(j.perTask)) L.push(`| ${t} | ${f2(v.A.mean)} (n=${v.A.n}) | ${f2(v.B.mean)} (n=${v.B.n}) |`);
  L.push('', '## Pass rate per rule', '', 'Pass / (pass + fail). A rule that inspected nothing in a run is n/a for that run and is left out.', '', '| Rule | A | B |', '|---|---|---|');
  for (const rule of RULES) {
    const cell = (a) => { const c = j.perRule[a][rule]; return `${pct(c.pass, c.pass + c.fail)}${c.na ? `, n/a in ${c.na}` : ''}`; };
    L.push(`| ${rule} | ${cell('A')} | ${cell('B')} |`);
  }
  L.push('', '## Invented tokens (R3)', '', 'Names written as var(--nil-...) that do not exist in tokens.css, with how many runs used each.', '');
  for (const a of arms) L.push(`- **${a}:** ${j.inventedTokens[a].length ? j.inventedTokens[a].map((t) => `\`${t.name}\` (${t.runs})`).join(', ') : 'none'}`);
  L.push('', '## Did arm B open the files that are not auto-loaded?', '', `Of ${j.guidanceOpened.runs} arm B runs: DESIGN.md opened in ${j.guidanceOpened['DESIGN.md']}, registry.json in ${j.guidanceOpened['registry.json']}, AGENTS.md in ${j.guidanceOpened['AGENTS.md']} (AGENTS.md arrives through CLAUDE.md without being opened; DESIGN.md and registry.json arrive only if Claude reads them).`);
  L.push('', '## Ref on a kit component', '', `Runs where Claude put a ref on a kit component (the kit's Button does not forward refs): A ${j.refOnKitComponent.A}, B ${j.refOnKitComponent.B}.`);
  L.push('', '## How runs ended', '', 'A run that hit the turn cap or the ten-minute timeout is scored on what it wrote. These are counted apart so a 0 from a timeout never reads like a 0 from bad code.', '', '| Arm | completed | max_turns | timeout | turn-cap-runner |', '|---|---|---|---|---|');
  for (const a of arms) L.push(`| ${a} | ${['completed', 'max_turns', 'timeout', 'turn-cap-runner'].map((k) => j.endedBy[a][k] ?? 0).join(' | ')} |`);
  L.push('', j.zeroScoreRuns.length ? `Runs that scored 0: ${j.zeroScoreRuns.map((z) => `${z.task} ${z.arm} run-${z.run} (ended: ${z.ended})`).join('; ')}.` : 'No run scored 0.');
  const byReason = (o) => (Object.keys(o).length ? Object.entries(o).map(([k, v]) => `${k}: ${v}`).join(', ') : 'none');
  L.push('', '## Not run, and excluded attempts', '', `Runs not run, by reason: ${byReason(j.notRunByReason)}.`, '', `Attempts excluded, by reason (counts every attempt that produced no score, including ones that were retried and then succeeded): ${byReason(j.excludedAttempts)}.`);
  L.push('', j.notRun.length ? j.notRun.map((r) => `- ${r.task} ${r.arm} run-${r.run}: ${r.reason}`).join('\n') : '', '', 'Runs that were not run are excluded from every mean above.');
  L.push('', '## Validity checks', '');
  L.push(`- Runs where Claude changed a kit file outside eval-output/: ${j.runsWithKitEdits}.`);
  L.push(`- Arm B first-turn prompt larger than arm A's, median gap in tokens per task: ${j.validity.promptSizeGapBToA.length ? j.validity.promptSizeGapBToA.map((g) => `${g.task} ${g.medianGap}`).join(', ') : 'not enough runs to compare'}. A run whose first prompt was outside its cell's calibrated size was excluded as it happened.`);
  L.push('', '## Cost and usage', '');
  L.push(`${j.usage.runs} runs: ${j.usage.totalWallSeconds} s of wall-clock time, $${j.usage.totalCostUsd.toFixed(2)} as the CLI reports it (an API-price equivalent, not a bill; the runs draw on a Claude plan). Tokens: ${j.usage.inputTokens} input, ${j.usage.outputTokens} output, ${j.usage.cacheReadTokens} cache read, ${j.usage.cacheWriteTokens} cache write.`);
  L.push(`Plan usage windows as reported in the stream, first to last run: five-hour ${j.usage.fiveHourUtilizationFirstToLast.map((x) => (x == null ? 'n/a' : `${Math.round(x * 100)}%`)).join(' to ')}, seven-day ${j.usage.sevenDayUtilizationFirstToLast.map((x) => (x == null ? 'n/a' : `${Math.round(x * 100)}%`)).join(' to ')}.`);
  if (j.heldOut) {
    const h = j.heldOut.T5;
    L.push('', '## Held-out task T5 (its own line, not in the means above)', '', '| Arm | Scored runs | Mean | Min | Max |', '|---|---|---|---|---|');
    for (const a of arms) L.push(`| ${a}: ${j.arms[a].label} | ${h[a].n} | ${f2(h[a].mean)} | ${f2(h[a].min)} | ${f2(h[a].max)} |`);
  }
  return L.join('\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const round = argv.includes('--round') ? argv[argv.indexOf('--round') + 1] : '1';
  try {
    const out = summarise({ round, stub: argv.includes('--stub'), unseal: argv.includes('--unseal') });
    console.log(`wrote ${relative(process.cwd(), out.md)} and ${relative(process.cwd(), out.json)}`);
    if (out.sealedLine && !argv.includes('--unseal')) console.log(out.sealedLine);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
