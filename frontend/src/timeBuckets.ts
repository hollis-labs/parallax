export type Observation = { started: string; tokens: number; status: string }
export function activityBuckets(records: Observation[], clock: string) {
  const now = Date.parse(clock),
    hour = 3600000
  const hours = Array.from({ length: 24 }, (_, i) => {
    const from = now - (24 - i) * hour,
      to = from + hour
    return {
      label: new Date(to).toISOString().slice(11, 16),
      count: records.filter((r) => Date.parse(r.started) > from && Date.parse(r.started) <= to)
        .length,
    }
  })
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date(now - (27 - i) * 86400000).toISOString().slice(0, 10)
    return {
      date,
      count: records.filter((r) => r.started.startsWith(date) && Date.parse(r.started) <= now)
        .length,
    }
  })
  return { hours, days }
}
