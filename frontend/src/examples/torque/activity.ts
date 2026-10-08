import type { OperationsModel } from "../../operations/model"
import { torqueReferenceModel } from "./reference"

export function referencePulseCount(
  events: readonly { time: string }[],
  from: string,
  to: string,
  cutoff: string,
) {
  return events.filter(
    (e) =>
      e.time > from.replace(".000Z", "Z") && e.time <= to.replace(".000Z", "Z") && e.time <= cutoff,
  ).length
}

/** Reference age bins (from,to], anchored to the supplied original UTC clock. */
export function torqueActivityModel(model: OperationsModel) {
  const reference = torqueReferenceModel(model)
  const pulse = reference.pulse.map((bin) => ({
    ...bin,
    count: bin.known ? referencePulseCount(reference.starts, bin.from, bin.to, model.cutoff) : null,
  }))
  const maximum = Math.max(0, ...reference.calendar.map((c) => c.count ?? 0))
  const pulseMaximum = Math.max(0, ...pulse.map((b) => b.count ?? 0))
  return {
    ...reference,
    pulse,
    maximum,
    pulseMaximum,
    calendarTotal:
      reference.available && reference.calendar.some((c) => c.known)
        ? reference.calendar.reduce((n, c) => n + (c.count ?? 0), 0)
        : null,
    pulseTotal:
      reference.available && pulse.some((b) => b.known)
        ? pulse.reduce((n, c) => n + (c.count ?? 0), 0)
        : null,
    unknownDays: reference.calendar.filter((c) => c.count === null).length,
    unknownHours: pulse.filter((c) => c.count === null).length,
  }
}
export function activityLevel(count: number | null, maximum: number) {
  if (count === null) return "unknown"
  if (!count || !maximum) return "0"
  const ratio = count / maximum
  return ratio < 0.15 ? "1" : ratio < 0.4 ? "2" : ratio < 0.7 ? "3" : "4"
}
