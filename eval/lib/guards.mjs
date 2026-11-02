/**
 * The decisions the runner makes between runs, as pure functions so they can be tested without
 * Claude and read in one place.
 */
import { GUARDS } from '../config.mjs';

/**
 * Is this run's first-turn prompt the size its cell should have? Same arm and same task should give
 * almost the same size every run. Outside the band means something different loaded: arm B without
 * its guidance, or something extra in either arm.
 */
export function promptSizeVerdict(tokens, cell, band, tolerance = GUARDS.promptBandTokens) {
  const expected = band?.cells?.[cell]?.median;
  if (expected == null) return { ok: false, why: `no calibrated size for cell ${cell}`, expected: null, diff: null };
  const diff = tokens - expected;
  return Math.abs(diff) <= tolerance
    ? { ok: true, expected, diff }
    : { ok: false, expected, diff, why: `first-turn prompt was ${tokens} tokens, expected ${expected} (+/- ${tolerance}): ${diff > 0 ? 'something extra loaded' : 'something expected did not load'}` };
}

/**
 * Before each run, read the plan's windows (from the latest rate_limit_event) and decide.
 *   seven-day above 60%  -> stop, resumable. Jen's week also carries four component chats.
 *   five-hour above 85%  -> wait for its reset, then carry on, unless the reset is after --stop-at.
 * Utilisation is a fraction (0.73 means 73%). resetsAt is epoch seconds, as the event gives it.
 */
export function usageDecision({ windows, nowMs, stopAtMs = null }) {
  if (!windows) return { action: 'go', note: 'no usage reading available' };
  const seven = windows.sevenDay, five = windows.fiveHour;
  if (seven && seven.utilization > GUARDS.sevenDayStopAbove) {
    return {
      action: 'stop', reason: 'seven-day-window',
      detail: `seven-day window at ${Math.round(seven.utilization * 100)}% (stop above ${Math.round(GUARDS.sevenDayStopAbove * 100)}%), resets ${new Date(seven.resetsAt * 1000).toISOString()}`,
      resetsAt: seven.resetsAt,
    };
  }
  if (five && five.utilization > GUARDS.fiveHourWaitAbove) {
    const untilMs = five.resetsAt * 1000 + GUARDS.waitSlackMs;
    if (untilMs <= nowMs) return { action: 'go', note: 'five-hour reading is stale: its reset time has passed' };
    if (stopAtMs != null && untilMs >= stopAtMs) {
      return { action: 'stop', reason: 'stop-at', detail: `five-hour window at ${Math.round(five.utilization * 100)}% and it resets ${new Date(five.resetsAt * 1000).toISOString()}, after --stop-at`, resetsAt: five.resetsAt };
    }
    return { action: 'wait', untilMs, detail: `five-hour window at ${Math.round(five.utilization * 100)}% (wait above ${Math.round(GUARDS.fiveHourWaitAbove * 100)}%), resets ${new Date(five.resetsAt * 1000).toISOString()}` };
  }
  return { action: 'go' };
}

/** Two breaches in a row stop the round. A clean scored run resets the count. */
export class BreachStreak {
  constructor(limit = GUARDS.breachStreakStops) { this.limit = limit; this.count = 0; }
  breach() { this.count += 1; return this.count >= this.limit; }
  clean() { this.count = 0; }
}

/** The kinds of ending a scored run can have, kept apart so a 0 from a timeout never reads like a 0 from bad code. */
export const ENDED_KINDS = ['completed', 'max_turns', 'timeout', 'turn-cap-runner'];
