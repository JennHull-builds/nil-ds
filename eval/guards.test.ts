// @vitest-environment node
/**
 * The runner's decisions between runs, tested without Claude: the prompt-size band, the usage
 * windows, the breach streak, and the start and stop clock. Part of the eval's own tests, so it lives under eval/.
 */
import { describe, expect, it } from 'vitest';
import { nextOccurrence, resolveWindow } from './lib/clock.mjs';
import { BreachStreak, promptSizeVerdict, usageDecision } from './lib/guards.mjs';

const band = { cells: { 'T3|A': { median: 6155 }, 'T3|B': { median: 9940 } } };
const now = Date.UTC(2026, 10, 3, 1, 0, 0);
const win = (five: number, seven: number, fiveResetsInMin = 120) => ({
  fiveHour: { utilization: five, resetsAt: Math.floor(now / 1000) + fiveResetsInMin * 60, status: 'allowed' },
  sevenDay: { utilization: seven, resetsAt: Math.floor(now / 1000) + 5 * 86400, status: 'allowed' },
});

describe('first-turn prompt band', () => {
  it('accepts a size inside the band, noise included', () => {
    expect(promptSizeVerdict(6155, 'T3|A', band).ok).toBe(true);
    expect(promptSizeVerdict(6163, 'T3|A', band).ok).toBe(true);
    expect(promptSizeVerdict(6255, 'T3|A', band).ok).toBe(true); // exactly at the edge
  });
  it('rejects arm B that came in at arm A size: the guidance did not load', () => {
    const v = promptSizeVerdict(6155, 'T3|B', band);
    expect(v.ok).toBe(false);
    expect(v.why).toMatch(/did not load/);
  });
  it('rejects something extra: arm A that came in at arm B size, or a connector worth thousands of tokens', () => {
    expect(promptSizeVerdict(9940, 'T3|A', band).ok).toBe(false);
    expect(promptSizeVerdict(6155 + 3300, 'T3|A', band).why).toMatch(/extra loaded/);
  });
  it('rejects a cell it has no calibrated size for, rather than waving it through', () => {
    expect(promptSizeVerdict(6155, 'T9|A', band).ok).toBe(false);
  });
});

describe('usage windows, read before each run', () => {
  it('goes ahead when both windows are low', () => {
    expect(usageDecision({ windows: win(0.3, 0.2), nowMs: now }).action).toBe('go');
  });
  it('stops, resumable, when the seven-day window is above 60%, and reports its reset time', () => {
    const d = usageDecision({ windows: win(0.1, 0.61), nowMs: now });
    expect(d.action).toBe('stop');
    expect(d.reason).toBe('seven-day-window');
    expect(d.detail).toMatch(/resets 2026-/);
  });
  it('60% exactly is still allowed: the line is "above"', () => {
    expect(usageDecision({ windows: win(0.1, 0.6), nowMs: now }).action).toBe('go');
  });
  it('waits for the five-hour reset when it is above 85%, if that is before --stop-at', () => {
    const d = usageDecision({ windows: win(0.86, 0.2, 90), nowMs: now, stopAtMs: now + 4 * 3600_000 });
    expect(d.action).toBe('wait');
    expect(d.untilMs).toBeGreaterThan(now + 90 * 60_000);
  });
  it('stops instead of waiting when the reset comes after --stop-at', () => {
    const d = usageDecision({ windows: win(0.9, 0.2, 240), nowMs: now, stopAtMs: now + 2 * 3600_000 });
    expect(d.action).toBe('stop');
    expect(d.reason).toBe('stop-at');
  });
  it('the seven-day stop wins over a five-hour wait', () => {
    expect(usageDecision({ windows: win(0.95, 0.7), nowMs: now }).reason).toBe('seven-day-window');
  });
  it('treats a five-hour reading whose reset time has passed as stale', () => {
    expect(usageDecision({ windows: win(0.95, 0.2, -30), nowMs: now }).action).toBe('go');
  });
  it('--max-five-hour 50 waits at 51% where the default 85% line would not', () => {
    expect(usageDecision({ windows: win(0.51, 0.2, 90), nowMs: now }).action).toBe('go');
    const d = usageDecision({ windows: win(0.51, 0.2, 90), nowMs: now, fiveHourWaitAbove: 0.5 });
    expect(d.action).toBe('wait');
    expect(d.detail).toMatch(/wait above 50%/);
  });
  it('50% exactly is still allowed under --max-five-hour 50', () => {
    expect(usageDecision({ windows: win(0.5, 0.2, 90), nowMs: now, fiveHourWaitAbove: 0.5 }).action).toBe('go');
  });
  it('goes ahead, with a note, when there is no reading at all', () => {
    expect(usageDecision({ windows: null, nowMs: now }).note).toMatch(/no usage reading/);
  });
});

describe('two breaches in a row stop the round', () => {
  it('one blip does not stop it', () => {
    const s = new BreachStreak();
    expect(s.breach()).toBe(false);
    s.clean();
    expect(s.breach()).toBe(false);
  });
  it('a run and its retry both breaching does', () => {
    const s = new BreachStreak();
    expect(s.breach()).toBe(false);
    expect(s.breach()).toBe(true);
  });
});

describe('--start-at and --stop-at', () => {
  const at = (h: number, m = 0, dayOffset = 0) => new Date(2026, 10, 2 + dayOffset, h, m, 0, 0).getTime();
  it('the next HH:MM is strictly after the given moment', () => {
    expect(nextOccurrence('14:35', at(11, 0))).toBe(at(14, 35));
    expect(nextOccurrence('14:35', at(14, 35))).toBe(at(14, 35, 1)); // exactly now means tomorrow
    expect(nextOccurrence('04:00', at(11, 0))).toBe(at(4, 0, 1)); // this morning's 04:00 has passed
  });
  it('typed at 11:00 for a 14:35 start: stop is 04:00 TOMORROW, 13h25m after the start', () => {
    const w = resolveWindow({ startAt: '14:35', stopAt: '04:00', nowMs: at(11, 0) });
    expect(w.startMs).toBe(at(14, 35));
    expect(w.stopMs).toBe(at(4, 0, 1));
    expect(w.stopMs! - w.startMs).toBe((13 * 60 + 25) * 60_000);
  });
  it('typed at 02:00 for a 14:35 start: stop is still the 04:00 after the start, not the 04:00 two hours from now', () => {
    const w = resolveWindow({ startAt: '14:35', stopAt: '04:00', nowMs: at(2, 0) });
    expect(w.startMs).toBe(at(14, 35));
    expect(w.stopMs).toBe(at(4, 0, 1)); // reading it from "now" would give 04:00 today, before the start: zero runs
    expect(w.stopMs! > w.startMs).toBe(true);
  });
  it('with no --start-at the start is now, and the stop is the next 04:00 after now', () => {
    const w = resolveWindow({ stopAt: '04:00', nowMs: at(23, 0) });
    expect(w.startMs).toBe(at(23, 0));
    expect(w.stopMs).toBe(at(4, 0, 1));
  });
  it('no --stop-at means no stop time', () => {
    expect(resolveWindow({ startAt: '14:35', nowMs: at(11, 0) }).stopMs).toBeNull();
  });
  it('rejects a time that is not HH:MM', () => {
    expect(() => nextOccurrence('4pm', at(11, 0))).toThrow();
    expect(() => nextOccurrence('25:00', at(11, 0))).toThrow();
  });
});
