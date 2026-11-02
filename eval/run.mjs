#!/usr/bin/env node
/**
 * The runner. Sequential, never parallel. For each planned run: build the arm from the archived
 * kit, hand the task text to the subject, wait, score eval-output/ with the checker, and save
 * score.json, trace.json and meta.json. Raw stream-json goes to raw/ (gitignored).
 *
 *   node eval/run.mjs --round 1 --runs 3                         the real round (30 runs)
 *   node eval/run.mjs --round dry --tasks T3 --runs 1            the dry run
 *   node eval/run.mjs --round 1 --runs 3 --resume                carry on, skipping runs with a score.json
 *   node eval/run.mjs --round 1 --runs 3 --stop-at 07:00         start no new run after 07:00
 *   node eval/run.mjs --subject stub:good|stub:bad-R3|stub:none|stub:limit ...   spends no usage
 *
 * What is NOT a failed run: a usage-limit stop, an isolation breach, an infrastructure failure
 * after one retry, a --stop-at stop. Those runs are recorded as "not run" (not-run.json), left
 * out of every mean, and counted in the summary. Only a session that completed and wrote
 * nothing scores 0.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { ARM_LABELS, EVAL_DIR, GUIDANCE_FILES, KIT_COMMIT, SEALED_TASKS, SUBJECT, TASKS, roots, runDir } from './config.mjs';
import { scoreBatch } from './check.mjs';
import { buildArm, kitEdits } from './lib/kit.mjs';
import { digest, isUsageLimit, runClaude, subjectFlags, windowSummary } from './lib/claude.mjs';
import { summarise } from './summarise.mjs';

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const opt = (name, fallback) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : fallback);
const flag = (name) => argv.includes(`--${name}`);

const round = String(opt('round', '1'));
const runsPerCell = Number(opt('runs', 3));
const tasks = opt('tasks', TASKS.join(',')).split(',');
const arms = opt('arms', 'A,B').split(',');
const subjectName = opt('subject', 'claude');
const guidanceRound = Number(opt('guidance', 1));
const stub = subjectName.startsWith('stub:');
const R = roots(stub);
const keepSessions = flag('keep');

function parseStopAt(text) {
  if (!text) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!m) { console.error('--stop-at wants HH:MM, for example 07:00'); process.exit(2); }
  const t = new Date();
  t.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1); // the next time that clock reading comes round
  return t.getTime();
}
const stopAtMs = parseStopAt(opt('stop-at'));

// The runs are meant to draw on the Claude plan. With an API key in the environment the CLI would
// bill that key instead, silently. Refuse, unless it is deliberate.
if (!subjectName.startsWith('stub:') && process.env.ANTHROPIC_API_KEY && !flag('allow-api-key')) {
  console.error('ANTHROPIC_API_KEY is set, so these runs would bill that key instead of using the Claude plan. Unset it, or pass --allow-api-key if that is what you want.');
  process.exit(2);
}

// ---------------------------------------------------------------- plan

const plan = [];
for (let k = 1; k <= runsPerCell; k++) for (const task of tasks) for (const arm of arms) plan.push({ task, arm, k });

const dirOf = (r) => runDir({ roots: R, round, task: r.task, arm: r.arm, k: r.k });
const done = (r) => existsSync(join(dirOf(r), 'score.json'));

if (!flag('resume')) {
  const existing = plan.filter(done);
  if (existing.length) {
    console.error(`${existing.length} planned run(s) already have a score.json (for example ${relative(EVAL_DIR, dirOf(existing[0]))}). Use --resume to continue, or another --round.`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------- the subject: real or stub

const limitMarker = join(R.results, `round-${round}`, '.stub-limit-fired');
let subjectCalls = 0;

function syntheticEvents({ limit = false, wrote = [] }) {
  const events = [
    { type: 'system', subtype: 'init', tools: [...SUBJECT.tools], mcp_servers: [], plugins: [], skills: [], agents: [], model: 'stub', claude_code_version: 'stub' },
    { type: 'rate_limit_event', rate_limit_info: { status: limit ? 'rejected' : 'allowed', unifiedWindows: { five_hour: { utilization: limit ? 1 : 0, resetsAt: 0, status: limit ? 'rejected' : 'allowed' } } } },
  ];
  wrote.forEach((p, i) => events.push({ type: 'assistant', message: { id: `m${i}`, content: [{ type: 'tool_use', id: `t${i}`, name: 'Write', input: { file_path: p } }], usage: { input_tokens: 0 } } }));
  events.push(limit
    ? { type: 'result', subtype: 'success', is_error: true, api_error_status: 429, result: 'Claude AI usage limit reached|0', num_turns: 0, duration_ms: 1, total_cost_usd: 0, usage: {}, modelUsage: {} }
    : { type: 'result', subtype: 'success', is_error: false, terminal_reason: 'completed', num_turns: wrote.length, duration_ms: 1, total_cost_usd: 0, usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }, modelUsage: { stub: {} } });
  return events;
}

async function runSubject({ task, session, rawPath }) {
  subjectCalls += 1;
  if (!stub) {
    const prompt = readFileSync(join(EVAL_DIR, 'tasks', `${task}.md`), 'utf8');
    return runClaude({ prompt, cwd: session, flags: subjectFlags(), maxAssistantTurns: SUBJECT.maxTurns + 1, rawPath });
  }
  const kind = subjectName.slice('stub:'.length);
  const out = join(session, 'eval-output');
  let fixture = null;
  if (kind === 'good') fixture = `good/${task}`;
  else if (kind === 'limit') {
    if (subjectCalls === 2 && !existsSync(limitMarker)) {
      mkdirSync(join(R.results, `round-${round}`), { recursive: true });
      writeFileSync(limitMarker, 'fired\n'); // the limit "resets": a resumed process will not fire it again
      const events = syntheticEvents({ limit: true });
      writeFileSync(rawPath, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
      return { events, stderr: '', exitCode: 1, timedOut: false, turnCapHit: false, spawnError: null, wallMs: 1 };
    }
    fixture = `good/${task}`;
  } else if (kind.startsWith('bad-')) fixture = `bad/${kind.slice(4)}`;
  else if (kind !== 'none') throw new Error(`unknown stub "${subjectName}"`);
  if (fixture) cpSync(join(EVAL_DIR, 'fixtures', fixture), out, { recursive: true });
  const wrote = fixture ? ['eval-output/Result.tsx'] : [];
  const events = syntheticEvents({ wrote });
  writeFileSync(rawPath, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
  return { events, stderr: '', exitCode: 0, timedOut: false, turnCapHit: false, spawnError: null, wallMs: 1 };
}

// ---------------------------------------------------------------- classification

/** Guard on the session's own init event: exactly the five tools, no MCP server, no user plugin. */
function isolationBreach(init) {
  if (!init) return 'no init event in the stream';
  const five = new Set(SUBJECT.tools);
  const problems = [];
  if (!(init.tools?.length === five.size && init.tools.every((t) => five.has(t)))) problems.push(`tools were [${(init.tools ?? []).join(', ')}]`);
  if ((init.mcp_servers ?? []).length) problems.push(`MCP servers present: ${init.mcp_servers.map((m) => m.name).join(', ')}`);
  const user = (init.plugins ?? []).filter((p) => p.path !== 'builtin');
  if (user.length) problems.push(`non-built-in plugins: ${user.map((p) => p.name).join(', ')}`);
  return problems.length ? problems.join('; ') : null;
}

function classify(sub, session) {
  const d = digest(sub.events);
  if (sub.spawnError) return { kind: 'infra', detail: `could not start claude: ${sub.spawnError.message}`, d };
  if (isUsageLimit({ result: d.result, windows: d.windows, stderr: sub.stderr })) return { kind: 'usage-limit', detail: String(d.result?.result ?? sub.stderr).slice(0, 200), d };
  const breach = isolationBreach(d.init);
  if (breach) return { kind: 'isolation-breach', detail: breach, d };
  const wrote = existsSync(join(session, 'eval-output')) && readdirSync(join(session, 'eval-output')).length > 0;
  if (sub.timedOut) return wrote ? { kind: 'scored', ended: 'timeout', d } : { kind: 'infra', detail: 'timed out with nothing written', d };
  if (!d.result) return { kind: 'infra', detail: `no result event (exit ${sub.exitCode}). stderr: ${sub.stderr.slice(-200)}`, d };
  if (d.result.is_error) {
    if (/max_turns/.test(`${d.result.subtype} ${d.result.terminal_reason}`)) return { kind: 'scored', ended: 'max_turns', d };
    return { kind: 'infra', detail: `session error: ${d.result.subtype} ${String(d.result.result).slice(0, 160)}`, d };
  }
  if (sub.turnCapHit) return { kind: 'scored', ended: 'turn-cap-runner', d };
  return { kind: 'scored', ended: 'completed', d };
}

// ---------------------------------------------------------------- one run

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

function listFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  (function walk(d) {
    for (const n of readdirSync(d)) { const f = join(d, n); if (statSync(f).isDirectory()) walk(f); else out.push(relative(dir, f)); }
  })(dir);
  return out;
}

async function attempt(r, n) {
  const dir = dirOf(r);
  mkdirSync(join(dir, 'raw'), { recursive: true });
  const session = buildArm(r.arm, guidanceRound);
  const prefixes = [session, realpathSync(session)];
  const rel = (p) => { let s = p ?? ''; for (const pre of prefixes) if (s.startsWith(`${pre}/`)) s = s.slice(pre.length + 1); return s; };
  try {
    const started = new Date();
    const sub = await runSubject({ task: r.task, session, rawPath: join(dir, 'raw', `stream-attempt${n}.jsonl`) });
    const c = classify(sub, session);
    if (c.kind !== 'scored') return { status: c.kind, detail: c.detail, d: c.d };

    const outDir = join(session, 'eval-output');
    const files = listFiles(outDir);
    const edits = kitEdits(session, r.arm, guidanceRound);
    if (files.includes('Result.tsx')) cpSync(join(outDir, 'Result.tsx'), join(dir, 'Result.tsx'));
    else writeFileSync(join(dir, 'NO_RESULT.txt'), 'The session ended without writing eval-output/Result.tsx.\n');
    for (const f of files.filter((x) => x !== 'Result.tsx')) { mkdirSync(join(dir, 'extra', f, '..'), { recursive: true }); cpSync(join(outDir, f), join(dir, 'extra', f)); }

    let scored;
    try {
      scored = (await scoreBatch([{ id: 'run', task: r.task, dir: outDir }])).run;
    } catch (e) {
      return { status: 'scorer', detail: String(e.message).slice(0, 300), d: c.d };
    }

    const d = c.d;
    const res = d.result ?? {};
    const firstUse = sub.events.find((e) => e.type === 'assistant')?.message?.usage ?? {};
    const windows = d.windows.map(windowSummary);
    const trace = {
      note: 'Tool calls only: name and path. The transcript is never saved here.',
      tools: d.tools.map((t) => ({ name: t.name, path: rel(t.path), ...(t.pattern ? { pattern: t.pattern } : {}) })),
    };
    const opened = (name) => d.tools.filter((t) => t.name === 'Read' && t.path.endsWith(`/${name}`)).length;
    trace.opened = { 'DESIGN.md': opened('DESIGN.md'), 'registry.json': opened('registry.json'), 'AGENTS.md': opened('AGENTS.md') };

    const meta = {
      task: r.task, arm: r.arm, armLabel: ARM_LABELS[r.arm], round, run: r.k, subject: subjectName, attempt: n,
      kitCommit: KIT_COMMIT,
      guidance: r.arm === 'B' ? { round: guidanceRound, sha256: Object.fromEntries(GUIDANCE_FILES.map((f) => [f, sha256(join(EVAL_DIR, 'guidance', `round-${guidanceRound}`, f))])) } : null,
      model: { requested: SUBJECT.model, resolved: Object.keys(res.modelUsage ?? {})[0] ?? d.init?.model ?? null },
      cliVersion: d.init?.claude_code_version ?? null,
      apiKeySource: d.init?.apiKeySource ?? null,
      ended: c.ended, terminalReason: res.terminal_reason ?? null, turns: res.num_turns ?? null,
      durationMs: res.duration_ms ?? null, durationApiMs: res.duration_api_ms ?? null, wallMs: sub.wallMs,
      totalCostUsd: res.total_cost_usd ?? null,
      costNote: 'As reported by the CLI: an API-price equivalent, not a bill. Runs draw on Jen\'s Claude plan.',
      usage: {
        input_tokens: res.usage?.input_tokens ?? null, output_tokens: res.usage?.output_tokens ?? null,
        cache_read_input_tokens: res.usage?.cache_read_input_tokens ?? null, cache_creation_input_tokens: res.usage?.cache_creation_input_tokens ?? null,
      },
      firstTurnPromptTokens: (firstUse.input_tokens ?? 0) + (firstUse.cache_creation_input_tokens ?? 0) + (firstUse.cache_read_input_tokens ?? 0),
      usageWindows: { first: windows[0] ?? null, last: windows[windows.length - 1] ?? null },
      permissionDenials: (res.permission_denials ?? []).length,
      init: { tools: d.init?.tools ?? [], mcpServers: (d.init?.mcp_servers ?? []).map((m) => m.name), plugins: (d.init?.plugins ?? []).map((p) => p.name), autoMemory: Boolean(d.init?.memory_paths?.auto) },
      kitEditsOutsideEvalOutput: edits,
      filesWritten: files,
      refOnKitComponent: scored.facts.refOnKitComponent ?? [],
      startedAt: started.toISOString(), finishedAt: new Date().toISOString(),
    };
    const score = { task: r.task, arm: r.arm, armLabel: ARM_LABELS[r.arm], round, run: r.k, score: scored.score, passed: scored.passed, applicable: scored.applicable, rules: scored.rules, facts: scored.facts, notes: scored.notes };
    writeFileSync(join(dir, 'trace.json'), JSON.stringify(trace, null, 2) + '\n');
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
    writeFileSync(join(dir, 'score.json'), JSON.stringify(score, null, 2) + '\n'); // written last: its presence means "done"
    return { status: 'scored', score, meta };
  } finally {
    if (!keepSessions) rmSync(session, { recursive: true, force: true });
  }
}

function writeNotRun(r, reason, detail) {
  const dir = dirOf(r);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'not-run.json'), JSON.stringify({ task: r.task, arm: r.arm, run: r.k, round, reason, detail, when: new Date().toISOString() }, null, 2) + '\n');
}

// ---------------------------------------------------------------- main loop

console.log(`round ${round} | subject ${subjectName} | ${plan.length} planned runs | ${arms.map((a) => `${a}=${ARM_LABELS[a]}`).join(' ; ')}`);
if (stopAtMs) console.log(`no new run will start after ${new Date(stopAtMs).toLocaleString()}`);

let stopped = null;
let index = 0;
for (const r of plan) {
  index += 1;
  const tag = `[${index}/${plan.length}] ${r.task} ${r.arm} run-${r.k}`;
  if (flag('resume') && done(r)) { console.log(`${tag}  already scored, skipped`); continue; }
  if (existsSync(join(dirOf(r), 'not-run.json'))) rmSync(join(dirOf(r), 'not-run.json'));
  if (!stopped && stopAtMs && Date.now() >= stopAtMs) stopped = { reason: 'stop-at', detail: `--stop-at ${opt('stop-at')} reached` };
  if (stopped) { writeNotRun(r, stopped.reason, stopped.detail); console.log(`${tag}  not run (${stopped.reason})`); continue; }

  let out = await attempt(r, 1);
  if (['infra', 'scorer'].includes(out.status)) {
    console.log(`${tag}  ${out.status} failure, retrying once: ${out.detail}`);
    out = await attempt(r, 2);
  }
  if (out.status === 'scored') {
    const m = out.meta;
    console.log(`${tag}  score ${out.score.passed}/${out.score.applicable}  ${(m.wallMs / 1000).toFixed(0)}s  ${m.turns ?? '?'} turns  $${(m.totalCostUsd ?? 0).toFixed(3)}  ended: ${m.ended}`);
  } else if (out.status === 'usage-limit' || out.status === 'isolation-breach') {
    stopped = { reason: out.status, detail: out.detail };
    writeNotRun(r, out.status, out.detail);
    console.log(`${tag}  STOP: ${out.status}: ${out.detail}`);
  } else {
    writeNotRun(r, out.status === 'scorer' ? 'scorer-error' : 'infra', out.detail);
    console.log(`${tag}  not run (${out.status}): ${out.detail}`);
  }
}

const files = summarise({ round, stub });
console.log(`\nsummary: ${relative(process.cwd(), files.md)}`);
if (files.sealedLine) console.log(files.sealedLine);
if (stopped) {
  console.log(`\nThe round stopped early: ${stopped.reason}. Runs not started are recorded as "not run" and are left out of every mean. Carry on later with the same command plus --resume.`);
  process.exit(3);
}
