import type { AdminPage } from "@hollis-labs/kit-admin"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type AdminAppearance, adminAppearances } from "./model"
import { AdminReview } from "./Review"

function Story({
  appearance = "recorded",
  page = "dashboard",
  standalone = false,
  series = false,
}: {
  appearance?: AdminAppearance
  page?: AdminPage
  standalone?: boolean
  series?: boolean
}) {
  return (
    <div className={standalone ? "admin-story-fullheight" : "review-surface"}>
      <AdminReview
        portable
        key={`${appearance}/${page}/${standalone}/${series}`}
        initialState={appearance}
        initialPage={page}
        initialGroup={page === "settings" ? "workspace" : undefined}
        standalone={standalone}
        initialSeries={series}
      />
    </div>
  )
}
const meta = {
  title: "Admin/Controlled admin review",
  component: Story,
  args: { appearance: "recorded", page: "dashboard", standalone: false, series: false },
  parameters: { layout: "fullscreen" },
  argTypes: {
    appearance: { control: "select", options: adminAppearances },
    page: { control: "select", options: ["dashboard", "settings", "status", "diagnostics"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Recorded: S = {}
export const InitialLoading: S = { args: { appearance: "initial-loading" } }
export const InitialError: S = { args: { appearance: "initial-error" } }
export const RetainedLoading: S = { args: { appearance: "retained-loading" } }
export const RetainedError: S = { args: { appearance: "retained-error" } }
export const ContextMismatch: S = { args: { appearance: "context-mismatch" } }
export const Unsupported: S = { args: { appearance: "unsupported" } }
export const Malformed: S = { args: { appearance: "malformed" } }
export const Contradictory: S = { args: { appearance: "contradictory" } }
export const Duplicate: S = { args: { appearance: "duplicate" } }
export const Empty: S = { args: { appearance: "empty" } }
export const UnknownGroup: S = { args: { appearance: "unknown-group" } }
export const UnknownPage: S = { args: { appearance: "unknown-page" } }
export const MissingSnapshot: S = { args: { appearance: "missing-snapshot", page: "settings" } }
export const GroupLoading: S = { args: { appearance: "group-loading", page: "settings" } }
export const GroupError: S = { args: { appearance: "group-error", page: "settings" } }
export const RetainedGroupError: S = {
  args: { appearance: "retained-group-error", page: "settings" },
}
export const MissingObservation: S = { args: { appearance: "missing-observation", page: "status" } }
export const Status: S = { args: { page: "status" } }
export const SeriesAbsent: S = { args: { page: "diagnostics" } }
export const SeriesPresent: S = { args: { page: "diagnostics", series: true } }
export const Denied: S = { args: { appearance: "denied" } }
export const Long: S = { args: { appearance: "long" } }
export const Standalone: S = { args: { standalone: true } }
export const StandaloneSeries: S = { args: { standalone: true, page: "diagnostics", series: true } }

export const ReadOnlySettings: S = { args: { page: "settings" } }
