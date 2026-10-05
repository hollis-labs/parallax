import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { operationsModel, runDetail } from "../operations/model"
import {
  ActivityView,
  MissionView,
  OperationsSummary,
  ResourceNotice,
  RunDetailBody,
  UsageView,
} from "../operations/Views"
import { PlaybackControls } from "./Controls"
import type { ResourceOverride } from "./model"
import { usePlayback } from "./usePlayback"

function Frame({
  scenario = "populated",
  view = "Activity",
  cutoff = "2026-10-04T14:14:15Z",
  override = "scenario",
}: {
  scenario?: string
  view?: string
  cutoff?: string
  override?: ResourceOverride
}) {
  const review = usePlayback(scenario, { cutoff, override }),
    [selection, setSelection] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [intent, setIntent] = useState("")
  const model = operationsModel(scenario, query, {
      cutoff: review.cutoff,
      override: review.override,
    }),
    detail = runDetail(model, selection)
  const selectionVisible = model.accessible && model.allTasks.some((t) => t.id === selection)
  useEffect(() => {
    if (!selectionVisible) setSelection(null)
  }, [selectionVisible])
  const context = `${review.cutoff}/${review.epoch}/${review.override}`
  useEffect(() => {
    if (context) setIntent("")
  }, [context])
  return (
    <div className="review-surface">
      <h1>Portable recorded frame</h1>
      <PlaybackControls
        review={{
          ...review,
          reset: () => {
            review.reset()
            setSelection(null)
            setQuery("")
          },
        }}
      />
      <OperationsSummary model={model} />
      {!model.accessible ? (
        <ResourceNotice model={model} />
      ) : view === "Mission Control" ? (
        <MissionView model={model} onSelect={setSelection} />
      ) : view === "Usage" ? (
        <UsageView model={model} query={query} onQuery={setQuery} onSelect={setSelection} />
      ) : (
        <ActivityView model={model} query={query} onQuery={setQuery} onSelect={setSelection} />
      )}{" "}
      {detail && (
        <section aria-label="Playback selected run">
          <RunDetailBody
            detail={detail}
            onIntent={(a, id) => setIntent(`${a} → ${id}. Local intent only.`)}
          />
        </section>
      )}
      {intent && <p role="status">{intent}</p>}
    </div>
  )
}
function Portable(args: Parameters<typeof Frame>[0]) {
  return <Frame key={`${args.scenario}/${args.cutoff}/${args.override}/${args.view}`} {...args} />
}
const meta = {
  title: "Playback/Recorded frames",
  component: Portable,
  args: {
    scenario: "populated",
    cutoff: "2026-10-04T14:14:15Z",
    view: "Activity",
    override: "scenario",
  },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const BeforeOutcome: Story = {}
export const RunFinishedTaskPending: Story = { args: { cutoff: "2026-10-04T14:15:30Z" } }
export const TaskBlocked: Story = { args: { cutoff: "2026-10-04T14:15:35Z" } }
export const Usage: Story = { args: { view: "Usage", cutoff: "2026-10-04T14:15:15Z" } }
export const Mission: Story = { args: { view: "Mission Control" } }
export const Loading: Story = { args: { override: "loading" } }
export const Failure: Story = { args: { override: "error" } }
export const Degraded: Story = { args: { override: "degraded" } }
export const Unavailable: Story = { args: { override: "unavailable" } }
