import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  type HealthAppearance,
  healthAppearances,
  type ObservationAppearance,
  observationAppearances,
  type ReviewClock,
  type ReviewedResource,
  reviewClocks,
  reviewedResources,
} from "./model"
import { ObservationReview } from "./Review"

function Story({
  state = "recorded",
  resource = "health",
  clock = "reference",
  health = "derived",
  context = "populated",
}: {
  state?: ObservationAppearance
  resource?: ReviewedResource
  clock?: ReviewClock
  health?: HealthAppearance
  context?: string
}) {
  return (
    <div className="review-surface">
      <ObservationReview
        key={`${state}/${resource}/${clock}/${health}/${context}`}
        context={context}
        initialState={state}
        initialResource={resource}
        initialClock={clock}
        initialHealth={health}
      />
    </div>
  )
}
const meta = {
  title: "Observation/Controlled observation review",
  component: Story,
  args: {
    state: "recorded",
    resource: "health",
    clock: "reference",
    health: "derived",
    context: "populated",
  },
  argTypes: {
    state: { control: "select", options: observationAppearances },
    resource: { control: "select", options: reviewedResources },
    clock: { control: "select", options: reviewClocks },
    health: { control: "select", options: healthAppearances },
    context: { control: "select", options: ["populated", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Recorded: S = {}
export const Idle: S = { args: { state: "idle" } }
export const InitialLoading: S = { args: { state: "initial-loading" } }
export const InitialError: S = { args: { state: "initial-error" } }
export const RefreshLoading: S = { args: { state: "refresh-loading" } }
export const RefreshError: S = { args: { state: "refresh-error" } }
export const ThresholdEquality: S = { args: { clock: "at-threshold" } }
export const Stale: S = { args: { clock: "after-threshold" } }
export const FutureAge: S = { args: { clock: "future-age" } }
export const InvalidClock: S = { args: { clock: "invalid-clock" } }
export const InvalidThreshold: S = { args: { clock: "invalid-threshold" } }
export const InvalidReceipt: S = { args: { state: "invalid-receipt" } }
export const Paused: S = { args: { state: "paused" } }
export const Unsupported: S = { args: { state: "unsupported" } }
export const Empty: S = { args: { state: "empty" } }
export const LongContent: S = { args: { state: "long" } }
export const Gap: S = { args: { state: "gap", resource: "token-series" } }
export const Truncated: S = { args: { state: "truncated", resource: "token-series" } }
export const NonfiniteStat: S = { args: { state: "nonfinite", resource: "stats" } }
export const DurationGauge: S = { args: { resource: "duration-series" } }
export const EmptyBoundedWindow: S = { args: { state: "bounded-window", resource: "token-series" } }
export const Denied: S = { args: { state: "denied" } }
export const LockedRetry: S = { args: { state: "locked" } }
export const Healthy: S = { args: { health: "healthy" } }
export const Unhealthy: S = { args: { health: "unhealthy" } }
export const UnknownHealth: S = { args: { health: "unknown" } }
