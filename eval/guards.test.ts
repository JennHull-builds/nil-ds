// @vitest-environment node
/**
 * The runner's decisions between runs, tested without Claude: the prompt-size band, the usage
 * windows, and the breach streak. Part of the eval's own tests, so it lives under eval/.
 */
import { describe, expect, it } from 'vitest';
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
