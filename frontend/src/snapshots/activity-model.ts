import type { FleetRecord } from "./console-model"

export interface ActivitySegment {
  state: FleetRecord["state"] | null
  from: number
  to: number
}

// Time is frozen at the capture receipt, never the review browser's clock.
// The strip uses Tachyon's 1–30 minute viewing window; uncaptured lead-in stays blank.
export function observedActivity(agent: FleetRecord, clock: string) {
  const entries = agent.history
  const end = Date.parse(clock)
  if (!entries?.length || !Number.isFinite(end)) return null
  const first = Date.parse(entries[0].at)
  const windowMs = Math.min(30 * 60_000, Math.max(60_000, end - first))
  const start = end - windowMs
  const segments: ActivitySegment[] = []
  if (first > start) segments.push({ state: null, from: start, to: Math.min(first, end) })
  for (const [i, entry] of entries.entries()) {
    const from = Math.max(start, Date.parse(entry.at))
    const to = Math.min(end, entries[i + 1] ? Date.parse(entries[i + 1].at) : end)
    if (to > from) segments.push({ state: entry.state, from, to })
  }
  const observedMs = segments.filter((s) => s.state !== null).reduce((n, s) => n + s.to - s.from, 0)
  const busyMs = segments.filter((s) => s.state === "busy").reduce((n, s) => n + s.to - s.from, 0)
  const series = Array.from({ length: 24 }, (_, i) => {
    const lo = start + (windowMs * i) / 24
    const hi = start + (windowMs * (i + 1)) / 24
    const overlap = (s: ActivitySegment) => Math.max(0, Math.min(s.to, hi) - Math.max(s.from, lo))
    if (!segments.some((s) => s.state !== null && overlap(s) > 0)) return null
    return (
      (segments.filter((s) => s.state === "busy").reduce((n, s) => n + overlap(s), 0) / (hi - lo)) *
      100
    )
  })
  return {
    series,
    start,
    end,
    windowMs,
    segments,
    observedMs,
    workingShare: observedMs > 0 ? Math.round((busyMs / observedMs) * 100) : null,
    changes: entries.filter((e) => e.kind === "state").length,
    entries: [...entries].reverse(),
  }
}

export function activityDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return minutes < 60
    ? `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
