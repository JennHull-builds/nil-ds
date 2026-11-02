/**
 * The isolation gate. Proves the subject Claude sees nothing from Jen's own setup before any round
 * runs, with positive controls so a "clean" result cannot be a probe that was never able to see.
 *
 *   node eval/isolation.mjs gate          canary probes, hook check, inventory, arm integrity
 *   node eval/isolation.mjs permissions   which path patterns really confine Read/Write/Edit
 *   node eval/isolation.mjs maxturns      does --max-turns actually stop a session
 *   node eval/isolation.mjs all           everything above (default)
 *
 * Rules this file follows, from the brief:
 *  - Probes run with Read, Glob, Grep, Write, Edit and Bash all disallowed, so an answer can only
 *    come from instructions that were loaded into the session.
 *  - It reports only whether a canary came back, never the value. Nothing private is written into
 *    this file or the report: a "leak" is simply any answer other than NONE for a field that
 *    should have been NONE.
 *  - It never edits anything under ~/.claude, and never reads it. If the gate cannot be made
 *    clean, it says so and stops; the decision about extra flags is not made here.
 */
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { EVAL_DIR, SUBJECT } from './config.mjs';
import { buildArm } from './lib/kit.mjs';
import { digest, promptTokens, runClaude, subjectFlags, windowSummary } from './lib/claude.mjs';

const COCKPIT = join(homedir(), 'mothership/briefs/cockpit.html');
const mtime = () => { try { return statSync(COCKPIT).mtimeMs; } catch { return null; } };

const NO_TOOLS = [
  '--model', SUBJECT.model, '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
  '--permission-mode', 'dontAsk', '--tools', '',
  '--disallowedTools', 'Read', 'Glob', 'Grep', 'Write', 'Edit', 'Bash',
];

// The flags the real subject runs with, beyond the base probe flags: empty strict MCP config, no slash commands.
const FINAL = SUBJECT.extraFlags;
const REAL = [...NO_TOOLS, '--setting-sources', 'project', ...FINAL];

function jsonFrom(text = '') {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}
const isNone = (v) => typeof v === 'string' && v.trim().toUpperCase() === 'NONE';
// A field only counts as "answered" if it is a non-empty string. An unparsed or missing answer is a
// failed probe, never a quiet "NONE": that would let a probe that could not speak read as clean.
const answered = (v) => typeof v === 'string' && v.trim() !== '';
const leaked = (v) => answered(v) && !isNone(v);
const lastWindow = (d) => windowSummary(d.windows[d.windows.length - 1]);

const report = { when: new Date().toISOString(), cliVersion: null, steps: {} };
const line = (ok, text) => console.log(`${ok === null ? '  ' : ok ? 'PASS' : 'FAIL'}  ${text}`);

// ---------------------------------------------------------------- (a) (b) (c) canaries + hook check

async function canaryProbe(dir, flags) {
  const prompt =
    'Answer with one JSON object and nothing else. Use no tools. Keys: ' +
    '"a": the date on which a section called "How to write" was locked, according to any instructions you were given, or NONE if no instruction you were given contains such a section. ' +
    '"b": the name of the dog mentioned in any memory index you were given, or NONE if you were given no memory index or it names no dog. ' +
    '"c": the project nonce stated in your instructions, or NONE if your instructions state no project nonce.';
  const before = mtime();
  const run = await runClaude({ prompt, cwd: dir, flags, timeoutMs: 180000 });
  const after = mtime();
  const d = digest(run.events);
  report.cliVersion ??= d.init?.claude_code_version ?? null;
  const hookEvents = run.events.filter((e) => e.type === 'system' && /hook/i.test(e.subtype ?? '')).length;
  const ans = jsonFrom(d.result?.result) ?? {};
  const firstTurnTokens = promptTokens(run.events.find((e) => e.type === 'assistant')?.message?.usage);
  return { answer: ans, firstTurnTokens, answeredAll: answered(ans.a) && answered(ans.b), hooksRan: before !== after, hookEvents, window: lastWindow(d), apiError: d.result?.is_error ?? true };
}

const REAL_SAMPLES = 3;
const verdicts = [];
const verdict = (name, ok) => { verdicts.push([name, Boolean(ok)]); };

async function gate() {
  console.log('\n== Gate 1: canary probes (tools disallowed, final flags) ==');
  const nonce = `NONCE-${randomBytes(8).toString('hex')}`;
  const dir = mkdtempSync(join(tmpdir(), 'nil-gate-'));
  const bare = mkdtempSync(join(tmpdir(), 'nil-gate-bare-'));
  writeFileSync(join(dir, 'CLAUDE.md'), `# Project notes\n\nThe project nonce is ${nonce}.\n`);
  try {
    const control = await canaryProbe(dir, NO_TOOLS);
    // A baseline: the same probe in a folder with NO CLAUDE.md. Its first-turn size is what "the nonce file did not load" looks like.
    const baseline = await canaryProbe(bare, REAL);
    const reals = [];
    for (let i = 0; i < REAL_SAMPLES; i++) reals.push(await canaryProbe(dir, REAL));

    const ctl = { answeredAll: control.answeredAll, aLeaked: leaked(control.answer.a), bLeaked: leaked(control.answer.b), nonceSeen: control.answer.c === nonce, hooksRan: control.hooksRan, hookEvents: control.hookEvents };
    const rl = reals.map((r) => ({ answeredAll: r.answeredAll, aLeaked: leaked(r.answer.a), bLeaked: leaked(r.answer.b), nonceSeen: r.answer.c === nonce, hooksRan: r.hooksRan, hookEvents: r.hookEvents, firstTurnTokens: r.firstTurnTokens }));
    // Judge by SIZE, not by what the model said. The project file adds a known small amount (about
    // 180 tokens). A user CLAUDE.md or memory index would add thousands. Size is exact; the model's
    // recall of a nonce is not (it was wrong in 6 samples where the file had demonstrably loaded).
    const extraOf = (r) => r.firstTurnTokens - baseline.firstTurnTokens;
    for (const r of rl) { r.extraTokens = extraOf(r); r.nonceFileLoaded = r.extraTokens >= 100; r.userContentLeaked = r.extraTokens > 400; }
    ctl.extraTokens = extraOf(control);
    report.steps.canaries = { control: ctl, baselineFirstTurnTokens: baseline.firstTurnTokens, real: rl };
    const said = (a) => (a.c === nonce ? 'the nonce' : typeof a.c === 'string' && /^NONE$/i.test(a.c.trim()) ? 'NONE' : typeof a.c === 'string' ? `another string (${a.c.length} chars)` : 'nothing');
    report.steps.canaries.nonceAnswers = reals.map((r) => said(r.answer));

    line(ctl.aLeaked || ctl.bLeaked, `positive control (without --setting-sources project): the probe CAN see a leak. a came back: ${ctl.aLeaked}, b came back: ${ctl.bLeaked}`);
    line(rl.every((r) => r.answeredAll), `real setting: all ${REAL_SAMPLES} samples answered both leak questions (a and b): ${rl.map((r) => r.answeredAll).join(', ')}`);
    line(rl.every((r) => !r.aLeaked && !r.bLeaked), `real setting: a came back in ${rl.filter((r) => r.aLeaked).length} of ${REAL_SAMPLES} samples, b in ${rl.filter((r) => r.bLeaked).length} of ${REAL_SAMPLES} (both must be 0)`);
    line(rl.every((r) => r.nonceFileLoaded), `real setting: the project CLAUDE.md loaded, judged by prompt size, in ${rl.filter((r) => r.nonceFileLoaded).length} of ${REAL_SAMPLES} samples (must be all)`);
    line(rl.every((r) => !r.userContentLeaked), `real setting: extra prompt tokens over the no-CLAUDE.md baseline ${rl.map((r) => r.extraTokens).join(', ')} (a user file would add thousands; limit 400)`);
    line(ctl.extraTokens > 1000, `the size check can see a leak: the control run (user settings loaded) came in ${ctl.extraTokens} tokens over the baseline (must be above 1000)`);
    line(null, `first-turn prompt tokens: no CLAUDE.md ${baseline.firstTurnTokens}; with the nonce file ${rl.map((r) => r.firstTurnTokens).join(', ')}; control ${control.firstTurnTokens}`);
    line(null, `information only: the model recalled the nonce in ${rl.filter((r) => r.nonceSeen).length} of ${REAL_SAMPLES} samples (it said: ${report.steps.canaries.nonceAnswers.join(', ')})`);
    for (const r of rl) if (!r.nonceSeen && r.nonceFileLoaded) console.log('      a miss with the file loaded by size: the model answered wrongly (probe noise)');
    line(null, `hook events in the stream: control ${ctl.hookEvents}, real ${rl.map((r) => r.hookEvents).join('/')}`);
    const hookSensitive = ctl.hookEvents > 0 || ctl.hooksRan;
    line(hookSensitive, `the hook check can see user hooks (the control run showed hook activity): ${hookSensitive}`);
    line(rl.every((r) => r.hookEvents === 0 && !r.hooksRan), 'no user hook ran in any real-setting sample');
    const ok = (ctl.aLeaked || ctl.bLeaked) && hookSensitive && ctl.extraTokens > 1000 && rl.every((r) => r.answeredAll && !r.aLeaked && !r.bLeaked && r.nonceFileLoaded && !r.userContentLeaked && r.hookEvents === 0 && !r.hooksRan);
    report.steps.canaries.pass = Boolean(ok);
    verdict('canaries', ok);
    report.window = reals[reals.length - 1].window;
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(bare, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- (d) inventory

async function inventory(label, extra) {
  const dir = buildArm('A');
  try {
    const prompt =
      'List every tool, skill, plugin and MCP server you can see. Answer with one JSON object and nothing else, with keys "tools", "skills", "plugins" and "mcp", each an array of names. Do not call any tool.';
    const run = await runClaude({ prompt, cwd: dir, flags: subjectFlags({ extra }), timeoutMs: 180000 });
    const d = digest(run.events);
    const init = d.init ?? {};
    const self = jsonFrom(d.result?.result) ?? {};
    const inv = {
      label,
      tools: init.tools ?? [],
      mcpServers: (init.mcp_servers ?? []).map((m) => `${m.name} [${m.status}, ${m.source}]`),
      plugins: (init.plugins ?? []).map((p) => `${p.name} [${p.path === 'builtin' ? 'builtin' : 'NOT builtin'}]`),
      skills: init.skills ?? [],
      agents: init.agents ?? [],
      slashCommandCount: (init.slash_commands ?? []).length,
      autoMemory: Boolean(init.memory_paths?.auto),
      modelSelfReport: { tools: self.tools?.length ?? null, skills: self.skills?.length ?? null, plugins: self.plugins?.length ?? null, mcp: self.mcp?.length ?? null },
    };
    const five = new Set(SUBJECT.tools);
    inv.exactlyFiveTools = inv.tools.length === five.size && inv.tools.every((t) => five.has(t));
    // Built-in plugins ship inside Claude Code and cannot be removed by any flag. What must be zero:
    // MCP servers, plugins that are not built in, and anything the MODEL says it can see.
    inv.nonBuiltinPlugins = inv.plugins.filter((p) => p.includes('NOT builtin')).length;
    const seen = inv.modelSelfReport;
    inv.modelSeesNothingExtra = seen.skills === 0 && seen.plugins === 0 && seen.mcp === 0;
    inv.clean = inv.exactlyFiveTools && inv.mcpServers.length === 0 && inv.nonBuiltinPlugins === 0 && inv.modelSeesNothingExtra;
    inv.strictClean = inv.clean && inv.plugins.length === 0 && inv.skills.length === 0;
    return inv;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function inventories() {
  console.log('\n== Gate 2: what the subject can see, with the final flags (names only) ==');
  report.steps.inventory = [];
  const inv = await inventory('final flags', SUBJECT.extraFlags);
  report.steps.inventory.push(inv);
  console.log(`    tools (${inv.tools.length}): ${inv.tools.join(', ') || 'none'}`);
  console.log(`    MCP servers (${inv.mcpServers.length}): ${inv.mcpServers.join('; ') || 'none'}`);
  console.log(`    plugins (${inv.plugins.length}): ${inv.plugins.join('; ') || 'none'}`);
  console.log(`    skills (${inv.skills.length}): ${inv.skills.join(', ') || 'none'} | agents (${inv.agents.length}) | slash commands: ${inv.slashCommandCount} | auto-memory on: ${inv.autoMemory}`);
  console.log(`    the model itself listed: ${JSON.stringify(inv.modelSelfReport)} (tools, skills, plugins, mcp)`);
  line(inv.clean, `five tools, no MCP server, no user plugin, and the model sees nothing extra: ${inv.clean}`);
  verdict('inventory', inv.clean);
}

// ---------------------------------------------------------------- (e) arm integrity

async function armIntegrity() {
  console.log('\n== Gate 3: each arm gets what it should (tools disallowed) ==');
  report.steps.arms = {};
  for (const arm of ['A', 'B']) {
    const dir = buildArm(arm);
    try {
      const prompt =
        'Answer with one JSON object and nothing else. Use no tools. Keys: ' +
        '"title": the first heading of the project instruction file you were given at the start of this session, or NONE if you were given none. ' +
        '"design_md_or_registry_text_in_context": true if the text of a file named DESIGN.md, or of a file named registry.json, is already in your context without you having read it with a tool, otherwise false.';
      const run = await runClaude({ prompt, cwd: dir, flags: REAL, timeoutMs: 180000 });
      const ans = jsonFrom(digest(run.events).result?.result) ?? {};
      report.steps.arms[arm] = { title: isNone(ans.title) ? 'NONE' : String(ans.title).replace(/\u2014/g, '-').slice(0, 80), designOrRegistryInContext: ans.design_md_or_registry_text_in_context === true };
      console.log(`  arm ${arm}: instruction file title seen: ${report.steps.arms[arm].title} | DESIGN.md or registry.json text already in context: ${report.steps.arms[arm].designOrRegistryInContext}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  const { A, B } = report.steps.arms;
  const armsOk = A.title === 'NONE' && /NIL/i.test(B.title) && !A.designOrRegistryInContext && !B.designOrRegistryInContext;
  line(armsOk, 'arm A sees no instruction file, arm B sees AGENTS.md without opening it, and neither has DESIGN.md or registry.json pre-loaded');
  verdict('arms', armsOk);
}

// ---------------------------------------------------------------- (f) permissions

async function permissions() {
  console.log('\n== Probe: which permission patterns really confine the subject ==');
  const firstPlan = ['Read', 'Glob', 'Grep', 'Write(eval-output/**)', 'Edit(eval-output/**)'];
  // The subject's extra flags with the --settings pair removed, to show what that flag adds by itself.
  const si = SUBJECT.extraFlags.indexOf('--settings');
  const withoutSettings = SUBJECT.extraFlags.filter((_, i) => i !== si && i !== si + 1);
  const variants = [
    ['control: first plan rules (Read, Glob, Grep with no path), WITHOUT the settings flag', firstPlan, withoutSettings],
    ['first plan rules + permissions.blockReadsOutsideWorkingDirectories alone', firstPlan, SUBJECT.extraFlags],
    ['adopted: Read(./**) + the settings flag (what the subject runs with)', SUBJECT.allowed, SUBJECT.extraFlags],
  ];
  report.steps.permissions = [];
  const only = process.argv.includes('--only') ? Number(process.argv[process.argv.indexOf('--only') + 1]) : null;
  for (const [i, [label, allowed, extra]] of variants.entries()) {
    if (only !== null && i + 1 !== only) continue;
    const dir = buildArm('A');
    const outside = mkdtempSync(join(tmpdir(), 'nil-canary-'));
    const token = `TOKEN-${randomBytes(8).toString('hex')}`;
    writeFileSync(join(outside, 'canary.txt'), `canary ${token}\n`);
    try {
      const prompt =
        'Make these eight tool calls one at a time, then answer with one JSON object and nothing else. Never repeat the contents of any file. ' +
        `1. Read the file ${join(outside, 'canary.txt')}. ` +
        `2. Grep for the word canary in the folder ${outside}. ` +
        `3. Glob for *.txt in the folder ${outside}. ` +
        '4. Write the text hello to the file src/zz-probe.txt. ' +
        '5. Write the text hello to the file eval-output/probe-ok.txt. ' +
        '6. Read the file package.json in the current folder. ' +
        '7. Grep for the word Button in the folder src. ' +
        '8. Glob for *.tsx in the folder src/components. ' +
        'Keys: read_outside, grep_outside, glob_outside, write_src, write_out, read_inside, grep_inside, glob_inside. Each is ALLOWED or DENIED according to whether that tool call succeeded.';
      const run = await runClaude({ prompt, cwd: dir, flags: subjectFlags({ allowed, extra }), timeoutMs: 240000 });
      const d = digest(run.events);
      const byTool = (name, test) => {
        const use = d.tools.find((t) => t.name === name && test(t));
        const res = use && d.toolResults.find((r) => r.tool_use_id === use.id);
        return !use ? 'not-attempted' : res?.is_error ? 'denied' : 'allowed';
      };
      const tokenLeaked = d.toolResults.some((r) => JSON.stringify(r.content ?? '').includes(token));
      const outcome = {
        label,
        readOutside: byTool('Read', (t) => t.path.includes(outside)),
        grepOutside: byTool('Grep', (t) => (t.path ?? '').includes(outside)),
        globOutside: byTool('Glob', (t) => (t.path ?? '').includes(outside)),
        writeSrcCall: byTool('Write', (t) => t.path.includes('zz-probe')),
        writeSrcFileExists: existsSync(join(dir, 'src/zz-probe.txt')),
        writeOutFileExists: existsSync(join(dir, 'eval-output/probe-ok.txt')),
        readInside: byTool('Read', (t) => t.path.endsWith('package.json')),
        grepInside: byTool('Grep', (t) => !(t.path ?? '').includes(outside)),
        globInside: byTool('Glob', (t) => !(t.path ?? '').includes(outside)),
        canaryContentReachedTheModel: tokenLeaked,
      };
      outcome.confined = outcome.readOutside !== 'allowed' && outcome.grepOutside !== 'allowed' && outcome.globOutside !== 'allowed' &&
        !outcome.writeSrcFileExists && outcome.writeOutFileExists && outcome.readInside === 'allowed' && outcome.grepInside === 'allowed' && outcome.globInside === 'allowed' && !outcome.canaryContentReachedTheModel;
      report.steps.permissions.push(outcome);
      console.log(`\n  [${label}]`);
      console.log(`    outside the temp kit: Read ${outcome.readOutside}, Grep ${outcome.grepOutside}, Glob ${outcome.globOutside} | canary content reached the model: ${tokenLeaked}`);
      console.log(`    Write to src/ produced a file: ${outcome.writeSrcFileExists} | Write to eval-output/ produced a file: ${outcome.writeOutFileExists} | inside the kit: Read ${outcome.readInside}, Grep ${outcome.grepInside}, Glob ${outcome.globInside}`);
      line(outcome.confined, `reads confined to the temp kit and writes confined to eval-output/: ${outcome.confined}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  }
}

// ---------------------------------------------------------------- --max-turns

async function maxTurns() {
  console.log('\n== Probe: does --max-turns stop a session ==');
  const dir = buildArm('A');
  try {
    const prompt = 'Write the text hi to eval-output/x.txt, then read that file back, then reply done.';
    const run = await runClaude({ prompt, cwd: dir, flags: subjectFlags({ maxTurns: 1 }), timeoutMs: 180000 });
    const d = digest(run.events);
    const r = d.result ?? {};
    report.steps.maxTurns = { requested: 1, subtype: r.subtype, terminalReason: r.terminal_reason, numTurns: r.num_turns, isError: r.is_error, finished: Boolean(d.result) };
    console.log(`  asked for --max-turns 1 on a task that needs 3 turns: result subtype "${r.subtype}", terminal_reason "${r.terminal_reason}", num_turns ${r.num_turns}`);
    line(/max_turns/.test(`${r.subtype} ${r.terminal_reason}`), 'the session was stopped by the cap');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- main

const which = process.argv[2] ?? 'all';
if (which === 'gate' || which === 'all') { await gate(); await inventories(); await armIntegrity(); }
if (which === 'permissions' || which === 'all') await permissions();
if (which === 'maxturns' || which === 'all') await maxTurns();

mkdirSync(join(EVAL_DIR, 'isolation-scratch'), { recursive: true });
const reportPath = join(EVAL_DIR, 'isolation-report.json');
let previous = {};
try { previous = JSON.parse(readFileSync(reportPath, 'utf8')); } catch { /* first run */ }
const gateRan = which === 'gate' || which === 'all';
const clean = gateRan ? verdicts.every(([, ok]) => ok) : null;
const history = [...(previous.gateRuns ?? [])];
if (gateRan) history.push({ when: report.when, criterion: 'v3: project file judged by prompt size, model recall of the nonce is information only, a and b must be answered', flags: SUBJECT.extraFlags, clean, verdicts: Object.fromEntries(verdicts) });
writeFileSync(reportPath, JSON.stringify({ ...previous, ...report, steps: { ...previous.steps, ...report.steps }, gateRuns: history }, null, 2) + '\n');
if (gateRan) console.log(`\nGATE ${clean ? 'CLEAN' : 'NOT CLEAN'}: ${verdicts.map(([n, ok]) => `${n} ${ok ? 'ok' : 'FAILED'}`).join(', ')}`);
console.log('report written to eval/isolation-report.json (booleans and names only, no canary values)');
if (gateRan && !clean) process.exit(1);
