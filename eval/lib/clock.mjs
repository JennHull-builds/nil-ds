/**
 * Clock helpers for --start-at and --stop-at.
 *
 * The trap: a runner that reads "--stop-at 04:00" as the next 04:00 after NOW can get it wrong when
 * the round starts later (--start-at 14:35) and the command is typed in the small hours, because the
 * 04:00 it picks has already passed by the time the round starts. It then exits at once with zero
 * runs and looks finished. So the stop time is always "the next 04:00 after the START".
 */

/** The first moment strictly after `afterMs` at which the local clock reads HH:MM. */
export function nextOccurrence(hhmm, afterMs) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) throw new Error(`"${hhmm}" is not HH:MM, for example 04:00`);
  const hours = Number(m[1]), minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) throw new Error(`"${hhmm}" is not a valid time`);
  const t = new Date(afterMs);
  t.setHours(hours, minutes, 0, 0);
  if (t.getTime() <= afterMs) t.setDate(t.getDate() + 1);
  return t.getTime();
}

/** Resolve --start-at and --stop-at together. The stop is the next HH:MM after the effective start. */
export function resolveWindow({ startAt, stopAt, nowMs }) {
  const startMs = startAt ? nextOccurrence(startAt, nowMs) : nowMs;
  const stopMs = stopAt ? nextOccurrence(stopAt, startMs) : null;
  return { startMs, stopMs };
}
