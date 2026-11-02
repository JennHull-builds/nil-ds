#!/usr/bin/env node
/**
 * Measures the size of a session's FIRST prompt, which is everything the model is given before it
 * does anything: system prompt, tool list, loaded instruction files, and the task text.
 *
 * For one arm and one task that size should be almost identical every run (it was within about 6
 * tokens across 8 samples), so it is a cheap, exact fingerprint of "the same things loaded". A
 * missing AGENTS.md, a connector or a skill list moves it by thousands. Reading it costs almost
 * nothing: the session is stopped as soon as the API call starts, before the model answers.
 *
 *   node eval/calibrate.mjs compare   what --disable-slash-commands and the empty MCP config do
 *   node eval/calibrate.mjs band      measure all ten task x arm cells, write eval/band.json
 *   node eval/calibrate.mjs check     measure again (2 samples per cell) and compare with eval/band.json,
 *                                     without changing it: did a flag or setting move the first prompt?
 *
 * eval/band.json is what run.mjs holds every run's first-turn prompt against.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EVAL_DIR, GUARDS, KIT_COMMIT, SUBJECT, TASKS } from './config.mjs';
import { buildArm } from './lib/kit.mjs';
import { digest, promptTokens, runClaude, subjectFlags } from './lib/claude.mjs';

const SAMPLES = 3;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** One first-turn reading. `extra` replaces the subject's extra flags so variants can be compared. */
export async function firstTurn({ task, arm, extra }) {
  const dir = buildArm(arm);
  try {
    const prompt = readFileSync(join(EVAL_DIR, 'tasks', `${task}.md`), 'utf8');
    const flags = [...subjectFlags({ extra }), '--include-partial-messages'];
    const run = await runClaude({
      prompt, cwd: dir, flags, timeoutMs: 180000,
      earlyStop: (ev) => (ev.type === 'stream_event' && ev.event?.type === 'message_start' ? 'measured' : undefined),
    });
    const msgStart = run.events.find((e) => e.type === 'stream_event' && e.event?.type === 'message_start');
    const d = digest(run.events);
    return { tokens: msgStart ? promptTokens(msgStart.event.message?.usage) : null, init: d.init, cliVersion: d.init?.claude_code_version, model: msgStart?.event?.message?.model ?? d.init?.model };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function compare() {
  const task = 'T3';
  const MCP = ['--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}'];
  const variants = [
    ['neither flag', []],
    ['empty MCP config only', MCP],
    ['empty MCP config + --disable-slash-commands (the subject)', SUBJECT.extraFlags],
  ];
  console.log(`first-turn prompt tokens, task ${task}, ${SAMPLES} samples per cell\n`);
  const out = {};
  for (const arm of ['A', 'B']) {
    for (const [label, extra] of variants) {
      const xs = [];
      let init = null;
      for (let i = 0; i < SAMPLES; i++) { const r = await firstTurn({ task, arm, extra }); xs.push(r.tokens); init = r.init; }
      out[`${arm}|${label}`] = { samples: xs, median: median(xs), skills: init?.skills?.length, slashCommands: init?.slash_commands?.length };
      console.log(`arm ${arm} | ${label.padEnd(60)} | ${xs.join(', ')} | median ${median(xs)} | skills in registry ${init?.skills?.length}, slash commands ${init?.slash_commands?.length}`);
    }
  }
  for (const arm of ['A', 'B']) {
    const none = out[`${arm}|neither flag`].median, mcp = out[`${arm}|empty MCP config only`].median, all = out[`${arm}|${variants[2][0]}`].median;
    console.log(`\narm ${arm}: empty MCP config changes the first-turn prompt by ${mcp - none} tokens; --disable-slash-commands by a further ${all - mcp}; total ${all - none}`);
  }
  return out;
}

async function band() {
  const cells = {};
  let cli = null, model = null;
  for (const task of TASKS) {
    for (const arm of ['A', 'B']) {
      const xs = [];
      for (let i = 0; i < SAMPLES; i++) {
        const r = await firstTurn({ task, arm, extra: SUBJECT.extraFlags });
        if (r.tokens == null) throw new Error(`no reading for ${task} ${arm}`);
        xs.push(r.tokens); cli = r.cliVersion; model = r.model;
      }
      cells[`${task}|${arm}`] = { median: median(xs), samples: xs };
      console.log(`${task} arm ${arm}: ${xs.join(', ')}  median ${median(xs)}`);
    }
  }
  const file = { generatedAt: new Date().toISOString(), kitCommit: KIT_COMMIT, guidanceRound: 1, cliVersion: cli, model, flags: SUBJECT.extraFlags, toleranceTokens: GUARDS.promptBandTokens, cells };
  writeFileSync(join(EVAL_DIR, 'band.json'), JSON.stringify(file, null, 2) + '\n');
  for (const t of TASKS) console.log(`${t}: arm B is ${cells[`${t}|B`].median - cells[`${t}|A`].median} tokens larger than arm A`);
  console.log('\nwrote eval/band.json');
}

async function check() {
  const banded = JSON.parse(readFileSync(join(EVAL_DIR, 'band.json'), 'utf8'));
  let worst = 0;
  const outside = [];
  for (const task of TASKS) {
    for (const arm of ['A', 'B']) {
      const cell = `${task}|${arm}`;
      const xs = [];
      for (let i = 0; i < 2; i++) xs.push((await firstTurn({ task, arm, extra: SUBJECT.extraFlags })).tokens);
      const diffs = xs.map((x) => x - banded.cells[cell].median);
      worst = Math.max(worst, ...diffs.map(Math.abs));
      if (diffs.some((d) => Math.abs(d) > GUARDS.promptBandTokens)) outside.push(cell);
      console.log(`${cell}: band ${banded.cells[cell].median} | now ${xs.join(', ')} | diff ${diffs.map((d) => (d > 0 ? '+' : '') + d).join(', ')}`);
    }
  }
  console.log(`\nlargest difference from the band: ${worst} tokens (tolerance ${GUARDS.promptBandTokens})`);
  console.log(outside.length ? `OUTSIDE THE BAND: ${outside.join(', ')}. Recalibrate: node eval/calibrate.mjs band` : 'All ten cells are inside the band. The band is unchanged.');
}

const which = process.argv[2];
if (which === 'compare') await compare();
else if (which === 'band') await band();
else if (which === 'check') await check();
else if (process.argv[1].endsWith('calibrate.mjs')) { console.error('usage: node eval/calibrate.mjs compare|band|check'); process.exit(2); }
