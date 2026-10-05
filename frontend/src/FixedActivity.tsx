import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Activity, Gauge } from "lucide-react"

import { activityBuckets, type Observation } from "./timeBuckets"
export function FixedActivity({
  records,
  clock,
  showCalendar = true,
  observedSince,
}: {
  records: Observation[]
  clock: string
  showCalendar?: boolean
  observedSince?: string
}) {
  const { hours: bins, days } = activityBuckets(records, clock)
  return (
    <div className="fixed-activity">
      <Panel
        title="24-hour execution pulse"
        icon={<Gauge className="size-4" />}
        meta={`${bins.reduce((s, b) => s + b.count, 0)} recorded starts`}
      >
        <div className="example-body">
          <div className="pulse" role="img" aria-label="Fixed-clock hourly run counts">
            {bins.map((b) => (
              <div
                key={b.label}
                title={`${b.label} UTC: ${observedSince && b.from < Date.parse(observedSince) ? "unavailable full-hour coverage" : `${b.count} runs`}`}
                className={
                  observedSince && b.from < Date.parse(observedSince)
                    ? "pulse-cell"
                    : b.count
                      ? "pulse-cell observed"
                      : "pulse-cell"
                }
              >
                <span>
                  {observedSince && b.from < Date.parse(observedSince) ? "—" : b.count || "·"}
                </span>
              </div>
            ))}
          </div>
          <p className="muted">
            Window ends {clock.slice(11, 16)} UTC · counts derive from run start times
            {observedSince && " · — means full-hour coverage is unavailable"}
          </p>
        </div>
      </Panel>
      {showCalendar && (
        <Panel title="Activity calendar" icon={<Activity className="size-4" />} meta="28 days">
          <div className="example-body">
            <div className="calendar" role="img" aria-label="Fixed-clock daily run counts">
              {days.map((d) => (
                <div
                  className={d.count ? "calendar-cell observed" : "calendar-cell"}
                  key={d.date}
                  title={`${d.date}: ${d.count} runs`}
                >
                  {d.count || "·"}
                </div>
              ))}
            </div>
            <p className="muted">{records.length} correlated fixture observations</p>
          </div>
        </Panel>
      )}
    </div>
  )
}
