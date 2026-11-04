/**
 * Spawns `claude -p` and reads its stream-json. Shared by the runner, the isolation gate and the
 * flag probes, so all three see the subject the same way.
 *
 * Format learned from a real call on CLI 2.1.316 (2 November 2026): one JSON object per line.
 * `system/init` (tools, mcp_servers, skills, plugins, model), `assistant` (message.content blocks),
 * `rate_limit_event` (rate_limit_info.unifiedWindows.five_hour/seven_day.utilization), and a final
 * `result` (subtype, is_error, num_turns, duration_ms, total_cost_usd, usage, modelUsage).
 * Fields that were not seen are never guessed at.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { SUBJECT } from '../config.mjs';

/**
 * Flags that define the subject. `extra` carries anything a decision has added (for example an
 * empty MCP config); it is empty until someone decides.
 */
export function subjectFlags({ extra = SUBJECT.extraFlags, tools = SUBJECT.tools, allowed = SUBJECT.allowed, maxTurns = SUBJECT.maxTurns } = {}) {
  const flags = [
    '--model', SUBJECT.model,
    '--output-format', 'stream-json', '--verbose',
    '--setting-sources', 'project',
    '--no-session-persistence',
    '--permission-mode', 'dontAsk',
    '--tools', tools.join(','),
  ];
  if (allowed.length) flags.push('--allowedTools', ...allowed);
  flags.push('--max-turns', String(maxTurns), ...extra);
  return flags;
}

/** The subject's environment: the caller's, plus the two safety variables. Applied to claude's spawn only. */
export function subjectEnv() {
  return { ...process.env, ...SUBJECT.env };
}

/** The installed CLI's version, for example "2.1.316". */
export function installedCliVersion() {
  return execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim().split(' ')[0];
}

/** Run one claude session. Resolves (never rejects) with everything that was observed. */
export function runClaude({ prompt, cwd, flags, env = subjectEnv(), timeoutMs = SUBJECT.timeoutMs, maxAssistantTurns = Infinity, rawPath, earlyStop }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const raw = rawPath ? createWriteStream(rawPath) : null;
    const events = [];
    const turnIds = new Set();
    let stderr = '';
    let buf = '';
    let timedOut = false;
    let turnCapHit = false;
    let spawnError = null;
    let abortedFor = null;

    // The prompt goes first so a variadic option such as --allowedTools cannot swallow it.
    const child = spawn('claude', ['-p', prompt, ...flags], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });

    const stop = () => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000).unref();
    };
    const timer = setTimeout(() => { timedOut = true; stop(); }, timeoutMs);

    const take = (line) => {
      if (!line.trim()) return;
      raw?.write(line + '\n');
      let ev;
      try { ev = JSON.parse(line); } catch { return; }
      events.push(ev);
      // earlyStop lets a caller kill the session the moment it is recognised as unusable, so a bad
      // session costs one turn at most instead of a whole run.
      if (earlyStop && !abortedFor) { const why = earlyStop(ev, events); if (why) { abortedFor = why; stop(); } }
      // Belt and braces for --max-turns: count distinct assistant messages ourselves.
      if (ev.type === 'assistant' && ev.message?.id) {
        turnIds.add(ev.message.id);
        if (turnIds.size > maxAssistantTurns && !turnCapHit) { turnCapHit = true; stop(); }
      }
    };

    child.stdout.on('data', (d) => {
      buf += d.toString('utf8');
      let i;
      while ((i = buf.indexOf('\n')) >= 0) { take(buf.slice(0, i)); buf = buf.slice(i + 1); }
    });
    child.stderr.on('data', (d) => { stderr += d.toString('utf8'); if (stderr.length > 20000) stderr = stderr.slice(-20000); });
    child.on('error', (e) => { spawnError = e; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      take(buf);
      raw?.end();
      resolve({ events, stderr, exitCode: code, signal, timedOut, turnCapHit, spawnError, abortedFor, wallMs: Date.now() - started });
    });
  });
}

/** Pull the parts everything else needs out of an event list. */
export function digest(events) {
  const init = events.find((e) => e.type === 'system' && e.subtype === 'init');
  const result = [...events].reverse().find((e) => e.type === 'result');
  const windows = events.filter((e) => e.type === 'rate_limit_event').map((e) => e.rate_limit_info);
  const toolUses = new Map();
  for (const e of events) {
    if (e.type !== 'assistant') continue;
    for (const c of e.message?.content ?? []) {
      if (c.type === 'tool_use' && !toolUses.has(c.id)) {
        toolUses.set(c.id, { id: c.id, name: c.name, path: c.input?.file_path ?? c.input?.path ?? '', pattern: c.input?.pattern });
      }
    }
  }
  const toolResults = [];
  for (const e of events) {
    if (e.type !== 'user') continue;
    for (const c of e.message?.content ?? []) if (c.type === 'tool_result') toolResults.push(c);
  }
  return { init, result, windows, tools: [...toolUses.values()], toolResults };
}

/** The part of rate_limit_info worth keeping: utilisation of the two windows, and their status. */
export function windowSummary(info) {
  if (!info) return null;
  const w = info.unifiedWindows ?? {};
  return {
    status: info.status,
    fiveHour: w.five_hour ? { utilization: w.five_hour.utilization, resetsAt: w.five_hour.resetsAt, status: w.five_hour.status } : null,
    sevenDay: w.seven_day ? { utilization: w.seven_day.utilization, resetsAt: w.seven_day.resetsAt, status: w.seven_day.status } : null,
  };
}

/**
 * Is this a usage-limit stop? The real error text has not been seen (no limit was hit while
 * building this), so this matches the words such an error would plausibly carry, plus any
 * rate_limit_event whose status is not "allowed". If the real text differs, this is the one
 * place to fix it, and stub:limit exercises the path around it.
 */
export function isUsageLimit({ result, windows = [], stderr = '' }) {
  const text = `${result?.result ?? ''} ${stderr}`;
  if (result?.is_error && /usage limit|limit reached|hit your .{0,30}limit|out of (usage|credits)|rate limit|quota|too many requests/i.test(text)) return true;
  if (result?.is_error && result?.api_error_status === 429) return true;
  return windows.some((w) => w && w.status && w.status !== 'allowed' && w.status !== 'allowed_warning');
}

/** Prompt size of one API call: every input-side token, whether or not it was served from cache. */
export function promptTokens(usage = {}) {
  return (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
}

/**
 * Read the plan's usage windows with the smallest possible call. The stream's rate_limit_event is
 * the only source; there is no other way to ask. Costs about one cent of API-equivalent.
 */
export async function probeWindows(cwd) {
  const flags = [
    '--model', SUBJECT.model, '--output-format', 'stream-json', '--verbose', '--no-session-persistence',
    '--permission-mode', 'dontAsk', '--tools', '', '--setting-sources', 'project', ...SUBJECT.extraFlags,
  ];
  const run = await runClaude({ prompt: 'Reply with the single word OK.', cwd, flags, timeoutMs: 120000 });
  const d = digest(run.events);
  return { windows: windowSummary(d.windows[d.windows.length - 1]), isLimit: isUsageLimit({ result: d.result, windows: d.windows, stderr: run.stderr }), run };
}
