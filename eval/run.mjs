#!/usr/bin/env node
/**
 * The runner. Sequential, never parallel. For each planned run: check the plan's usage windows,
 * build the arm from the archived kit, hand the task text to the subject, wait, score
 * eval-output/ with the checker, and save score.json, trace.json and meta.json. Raw stream-json
 * goes to raw/ (gitignored).
 *
 *   node eval/run.mjs --round 1 --runs 3                         the real round (30 runs)
 *   node eval/run.mjs --round dry --tasks T3 --runs 1            the dry run
 *   node eval/run.mjs --round 1 --runs 3 --resume                carry on, skipping runs with a score.json
 *   node eval/run.mjs --round 1 --runs 3 --stop-at 04:00         start no new run after 04:00
 *   node eval/run.mjs --subject stub:good|stub:bad-R3|stub:none|stub:limit ...   spends no usage
 *       --stub-script "2=size,3=init,5=timeout"   what the Nth subject call does (size, init, timeout)
 *       --stub-windows "0.5:0.2,0.9:0.2"          five-hour:seven-day utilisation each call reports
 *       --stub-reset-in 2                         seconds until the stub's five-hour window resets
 *
 * Policy (track lead, 2 November 2026):
 *  - Before each run read the five-hour and seven-day utilisation. Five-hour above 85%: wait for
 *    its reset, if that is before --stop-at. Seven-day above 60%: stop, resumable.
 *  - A breach (the init event, or a first-turn prompt outside its cell's band) excludes that
 *    attempt, which is retried once. Two breaches in a row stop the round.
 *  - A timeout is retried once, then scored on whatever was written (0 if nothing), with
 *    ended: "timeout" so the summary keeps it apart from a 0 for bad code.
 *  - A usage-limit error stops the round. Other infrastructure failures are retried once, then
 *    recorded as not run. Not-run runs are left out of every mean and counted by reason.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { ARM_LABELS, EVAL_DIR, GUARDS, GUIDANCE_FILES, KIT_COMMIT, SUBJECT, TASKS, roots, runDir } from './config.mjs';
import { scoreBatch } from './check.mjs';
import { buildArm, kitEdits } from './lib/kit.mjs';
import { digest, isUsageLimit, probeWindows, promptTokens, runClaude, subjectFlags, windowSummary } from './lib/claude.mjs';
import { BreachStreak, promptSizeVerdict, usageDecision } from './lib/guards.mjs';
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseStopAt(text) {
  if (!text) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!m) { console.error('--stop-at wants HH:MM, for example 04:00'); process.exit(2); }
  const t = new Date();
  t.setHours(Number(m[1]), Number(m[2]), 0, 0);
  if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1); // the next time that clock reading comes round
  return t.getTime();
}
const stopAtMs = parseStopAt(opt('stop-at'));

// The runs are meant to draw on the Claude plan. With an API key in the environment the CLI would
// bill that key instead, silently. Refuse, unless it is deliberate.
if (!stub && process.env.ANTHROPIC_API_KEY && !flag('allow-api-key')) {
  console.error('ANTHROPIC_API_KEY is set, so these runs would bill that key instead of using the Claude plan. Unset it, or pass --allow-api-key if that is what you want.');
  process.exit(2);
}

// ---------------------------------------------------------------- the band (first-turn prompt sizes)

function loadBand() {
  const file = join(EVAL_DIR, 'band.json');
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  if (stub) return { cliVersion: 'stub', cells: Object.fromEntries(TASKS.flatMap((t) => ['A', 'B'].map((a) => [`${t}|${a}`, { median: a === 'B' ? 6800 : 3000 }]))) };
  console.error('eval/band.json is missing. Run: node eval/calibrate.mjs band');
  process.exit(2);
}
const band = loadBand();
if (!stub) {
  const installed = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim().split(' ')[0];
  if (band.cliVersion && installed !== band.cliVersion && !flag('ignore-band-version')) {
    console.error(`eval/band.json was measured on Claude Code ${band.cliVersion} but ${installed} is installed. The first-turn prompt can change between versions. Run: node eval/calibrate.mjs band`);
    process.exit(2);
  }
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
const parseList = (t) => (t ? t.split(',') : []);
const stubScript = Object.fromEntries(parseList(opt('stub-script', '')).map((x) => x.split('=')));
const stubWindows = parseList(opt('stub-windows', '')).map((x) => { const [f, s] = x.split(':').map(Number); return { five: f, seven: s ?? 0.2 }; });
const stubResetIn = Number(opt('stub-reset-in', 2));

function stubWindowInfo(call) {
  const w = stubWindows.length ? stubWindows[Math.min(call - 1, stubWindows.length - 1)] : { five: 0.05, seven: 0.2 };
  const resets = Math.floor(Date.now() / 1000) + stubResetIn;
  return { status: 'allowed', unifiedWindows: { five_hour: { utilization: w.five, resetsAt: resets, status: 'allowed' }, seven_day: { utilization: w.seven, resetsAt: resets + 86400 * 5, status: 'allowed' } } };
}

function syntheticEvents({ call, limit = false, wrote = [], tokens, mcp = false, cell }) {
  const info = limit ? { ...stubWindowInfo(call), status: 'rejected' } : stubWindowInfo(call);
  const events = [
    { type: 'system', subtype: 'init', tools: [...SUBJECT.tools], mcp_servers: mcp ? [{ name: 'stub-connector', status: 'connected' }] : [], plugins: [], skills: [], agents: [], model: 'stub', claude_code_version: 'stub' },
    { type: 'rate_limit_event', rate_limit_info: info },
  ];
  const expected = band.cells[cell]?.median ?? 3000;
  events.push({ type: 'assistant', message: { id: 'm0', content: wrote.map((p, i) => ({ type: 'tool_use', id: `t${i}`, name: 'Write', input: { file_path: p } })), usage: { input_tokens: 10, cache_read_input_tokens: (tokens ?? expected) - 10 } } });
  events.push(limit
    ? { type: 'result', subtype: 'success', is_error: true, api_error_status: 429, result: 'Claude AI usage limit reached|0', num_turns: 0, duration_ms: 1, total_cost_usd: 0, usage: {}, modelUsage: {} }
    : { type: 'result', subtype: 'success', is_error: false, terminal_reason: 'completed', num_turns: wrote.length, duration_ms: 1, total_cost_usd: 0, usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }, modelUsage: { stub: {} } });
  return events;
}

async function runSubject({ task, arm, session, rawPath, earlyStop }) {
  subjectCalls += 1;
  if (!stub) {
    const prompt = readFileSync(join(EVAL_DIR, 'tasks', `${task}.md`), 'utf8');
    return runClaude({ prompt, cwd: session, flags: subjectFlags(), maxAssistantTurns: SUBJECT.maxTurns + 1, rawPath, earlyStop });
  }
  const call = subjectCalls;
  const cell = `${task}|${arm}`;
  const kind = subjectName.slice('stub:'.length);
  const scripted = stubScript[call];
  const out = join(session, 'eval-output');
  const finish = (events, extra = {}) => {
    writeFileSync(rawPath, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
    let abortedFor = null;
    for (const ev of events) { const why = earlyStop?.(ev, events); if (why) { abortedFor = why; break; } }
    return { events, stderr: '', exitCode: 0, timedOut: false, turnCapHit: false, spawnError: null, abortedFor, wallMs: 1, ...extra };
  };
  if (scripted === 'timeout') return finish(syntheticEvents({ call, cell }).slice(0, 2), { timedOut: true, exitCode: null });
  if (scripted === 'init') return finish(syntheticEvents({ call, cell, mcp: true }));
  let fixture = null;
  if (kind === 'good') fixture = `good/${task}`;
  else if (kind === 'limit') {
    if (subjectCalls === 2 && !existsSync(limitMarker)) {
      mkdirSync(join(R.results, `round-${round}`), { recursive: true });
      writeFileSync(limitMarker, 'fired\n'); // the limit "resets": a resumed process will not fire it again
      return finish(syntheticEvents({ call, limit: true, cell }), { exitCode: 1 });
    }
    fixture = `good/${task}`;
  } else if (kind.startsWith('bad-')) fixture = `bad/${kind.slice(4)}`;
  else if (kind !== 'none') throw new Error(`unknown stub "${subjectName}"`);
  const events = syntheticEvents({ call, cell, wrote: fixture ? ['eval-output/Result.tsx'] : [], tokens: scripted === 'size' ? (band.cells[cell]?.median ?? 3000) + 2300 : undefined });
  const res = finish(events);
  // A breached session is stopped before it writes anything, as the real early stop would.
  if (fixture && !res.abortedFor) cpSync(join(EVAL_DIR, 'fixtures', fixture), out, { recursive: true });
  return res;
}

// ---------------------------------------------------------------- guards

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

const makeEarlyStop = (cell) => {
  let sized = false;
  return (ev) => {
    if (ev.type === 'system' && ev.subtype === 'init') { const b = isolationBreach(ev); if (b) return `init:${b}`; }
    if (ev.type === 'assistant' && !sized && ev.message?.usage) {
      sized = true;
      const v = promptSizeVerdict(promptTokens(ev.message.usage), cell, band);
      if (!v.ok) return `prompt-size:${v.why}`;
    }
    return undefined;
  };
};

let reading = null; // { windows, atMs }
async function currentWindows() {
  if (reading && Date.now() - reading.atMs < GUARDS.readingStaleMs) return reading.windows;
  if (stub) { reading = { windows: windowSummary(stubWindowInfo(Math.max(subjectCalls, 1))), atMs: Date.now() }; return reading.windows; }
  const scratch = mkdtempSync(join(tmpdir(), 'nil-probe-'));
  try {
    const p = await probeWindows(scratch);
    if (p.isLimit) return { limit: true };
    reading = { windows: p.windows, atMs: Date.now() };
    return p.windows;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Resolves null to go ahead, or { reason, detail } to stop the round. */
async function usageGate() {
  for (;;) {
    const windows = await currentWindows();
    if (windows?.limit) return { reason: 'usage-limit', detail: 'the usage probe itself hit the limit' };
    const d = usageDecision({ windows, nowMs: Date.now(), stopAtMs });
    if (d.action === 'go') return null;
    if (d.action === 'stop') return { reason: d.reason, detail: d.detail };
    console.log(`        waiting: ${d.detail}`);
    const until = stub ? Date.now() + 1500 : d.untilMs;
    while (Date.now() < until) {
      if (stopAtMs && Date.now() >= stopAtMs) return { reason: 'stop-at', detail: '--stop-at reached while waiting for the five-hour window' };
      await sleep(Math.min(60_000, until - Date.now() + 5));
    }
    reading = null; // the old reading is stale now
    if (stub) stubWindows.shift();
  }
}

// ---------------------------------------------------------------- one attempt

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

function listFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  (function walk(d) {
    for (const n of readdirSync(d)) { const f = join(d, n); if (statSync(f).isDirectory()) walk(f); else out.push(relative(dir, f)); }
  })(dir);
  return out;
}

function classify(sub, session, n) {
  const d = digest(sub.events);
  if (sub.spawnError) return { kind: 'infra', detail: `could not start claude: ${sub.spawnError.message}`, d };
  if (sub.abortedFor) {
    const [kind, ...rest] = sub.abortedFor.split(':');
    return { kind: 'breach', sub: kind, detail: rest.join(':'), d };
  }
  if (isUsageLimit({ result: d.result, windows: d.windows, stderr: sub.stderr })) return { kind: 'usage-limit', detail: String(d.result?.result ?? sub.stderr).slice(0, 200), d };
  const breach = isolationBreach(d.init);
  if (breach) return { kind: 'breach', sub: 'init', detail: breach, d };
  if (sub.timedOut) return n === 1 ? { kind: 'timeout', detail: `no result after ${SUBJECT.timeoutMs / 60000} minutes`, d } : { kind: 'scored', ended: 'timeout', d };
  if (!d.result) return { kind: 'infra', detail: `no result event (exit ${sub.exitCode}). stderr: ${sub.stderr.slice(-200)}`, d };
  if (d.result.is_error) {
    if (/max_turns/.test(`${d.result.subtype} ${d.result.terminal_reason}`)) return { kind: 'scored', ended: 'max_turns', d };
    return { kind: 'infra', detail: `session error: ${d.result.subtype} ${String(d.result.result).slice(0, 160)}`, d };
  }
  if (sub.turnCapHit) return { kind: 'scored', ended: 'turn-cap-runner', d };
  return { kind: 'scored', ended: 'completed', d };
}

async function attempt(r, n, usageBefore) {
  const dir = dirOf(r);
  mkdirSync(join(dir, 'raw'), { recursive: true });
  const session = buildArm(r.arm, guidanceRound);
  const prefixes = [session, realpathSync(session)];
  const rel = (p) => { let s = p ?? ''; for (const pre of prefixes) if (s.startsWith(`${pre}/`)) s = s.slice(pre.length + 1); return s; };
  const cell = `${r.task}|${r.arm}`;
  try {
    const started = new Date();
    const sub = await runSubject({ task: r.task, arm: r.arm, session, rawPath: join(dir, 'raw', `stream-attempt${n}.jsonl`), earlyStop: makeEarlyStop(cell) });
    const c = classify(sub, session, n);
    const d = c.d;
    if (d?.windows?.length) reading = { windows: windowSummary(d.windows[d.windows.length - 1]), atMs: Date.now() };
    if (c.kind !== 'scored') return { status: c.kind, sub: c.sub, detail: c.detail, d };

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
      return { status: 'scorer', detail: String(e.message).slice(0, 300), d };
    }

    const res = d.result ?? {};
    const firstUse = sub.events.find((e) => e.type === 'assistant')?.message?.usage ?? {};
    const firstTokens = promptTokens(firstUse);
    const verdict = promptSizeVerdict(firstTokens, cell, band);
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
      firstTurnPromptTokens: firstTokens,
      promptBand: { expected: verdict.expected, diff: verdict.diff, toleranceTokens: GUARDS.promptBandTokens },
      usageWindows: { before: usageBefore ?? null, first: windows[0] ?? null, last: windows[windows.length - 1] ?? null },
      permissionDenials: (res.permission_denials ?? []).length,
      init: { tools: d.init?.tools ?? [], mcpServers: (d.init?.mcp_servers ?? []).map((m) => m.name), plugins: (d.init?.plugins ?? []).map((p) => p.name), autoMemory: Boolean(d.init?.memory_paths?.auto) },
      kitEditsOutsideEvalOutput: edits,
      filesWritten: files,
      refOnKitComponent: scored.facts.refOnKitComponent ?? [],
      startedAt: started.toISOString(), finishedAt: new Date().toISOString(),
    };
    const score = { task: r.task, arm: r.arm, armLabel: ARM_LABELS[r.arm], round, run: r.k, ended: c.ended, score: scored.score, passed: scored.passed, applicable: scored.applicable, rules: scored.rules, facts: scored.facts, notes: scored.notes };
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

/** Every attempt that did not produce a score is kept, so the summary can count exclusions by reason. */
function writeAttempts(r, log) {
  if (!log.length) return;
  mkdirSync(dirOf(r), { recursive: true });
  writeFileSync(join(dirOf(r), 'attempts.json'), JSON.stringify(log, null, 2) + '\n');
}

// ---------------------------------------------------------------- main loop

console.log(`round ${round} | subject ${subjectName} | ${plan.length} planned runs | ${arms.map((a) => `${a}=${ARM_LABELS[a]}`).join(' ; ')}`);
if (stopAtMs) console.log(`no new run will start after ${new Date(stopAtMs).toLocaleString()}`);

const streak = new BreachStreak();
let stopped = null;
let index = 0;
for (const r of plan) {
  index += 1;
  const tag = `[${index}/${plan.length}] ${r.task} ${r.arm} run-${r.k}`;
  if (flag('resume') && done(r)) { console.log(`${tag}  already scored, skipped`); continue; }
  for (const f of ['not-run.json', 'attempts.json']) if (existsSync(join(dirOf(r), f))) rmSync(join(dirOf(r), f));
  if (!stopped && stopAtMs && Date.now() >= stopAtMs) stopped = { reason: 'stop-at', detail: `--stop-at ${opt('stop-at')} reached` };
  if (!stopped) { const g = await usageGate(); if (g) stopped = g; }
  if (stopped) { writeNotRun(r, stopped.reason, stopped.detail); console.log(`${tag}  not run (${stopped.reason})`); continue; }

  const usageBefore = reading?.windows ?? null;
  const log = [];
  let out;
  for (let n = 1; n <= 2; n++) {
    out = await attempt(r, n, usageBefore);
    if (out.status === 'scored') { streak.clean(); break; }
    log.push({ attempt: n, outcome: out.status === 'breach' ? `breach:${out.sub}` : out.status, detail: out.detail, when: new Date().toISOString() });
    if (out.status === 'usage-limit') break;
    if (out.status === 'breach') {
      if (streak.breach()) { out = { ...out, status: 'breach-streak', detail: `two breaches in a row: ${log.map((l) => l.outcome).join(', ')}` }; break; }
      console.log(`${tag}  attempt ${n} excluded (${log[log.length - 1].outcome}): ${out.detail}${n === 1 ? ' | retrying once' : ''}`);
      continue;
    }
    if (n === 1) console.log(`${tag}  attempt 1 excluded (${out.status}): ${out.detail} | retrying once`);
  }
  writeAttempts(r, log);

  if (out.status === 'scored') {
    const m = out.meta;
    console.log(`${tag}  score ${out.score.passed}/${out.score.applicable}  ${(m.wallMs / 1000).toFixed(0)}s  ${m.turns ?? '?'} turns  $${(m.totalCostUsd ?? 0).toFixed(3)}  ended: ${m.ended}`);
  } else if (['usage-limit', 'breach-streak'].includes(out.status)) {
    stopped = { reason: out.status, detail: out.detail };
    writeNotRun(r, out.status, out.detail);
    console.log(`${tag}  STOP: ${out.status}: ${out.detail}`);
  } else {
    writeNotRun(r, out.status === 'scorer' ? 'scorer-error' : out.status === 'breach' ? `breach:${out.sub}` : 'infra', out.detail);
    console.log(`${tag}  not run (${out.status}): ${out.detail}`);
  }
}

const files = summarise({ round, stub });
console.log(`\nsummary: ${relative(process.cwd(), files.md)}`);
if (files.sealedLine) console.log(files.sealedLine);
if (stopped) {
  console.log(`\nThe round stopped early: ${stopped.reason} (${stopped.detail}). Runs not started are recorded as "not run" and are left out of every mean. Carry on later with the same command plus --resume.`);
  process.exit(3);
}
