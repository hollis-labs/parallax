import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { VoiceLab } from "./Lab"
import type { VoiceState } from "./model"

function Review({ state, view }: { state: VoiceState; view: string }) {
  const [result, setResult] = useState("")
  return (
    <div className="storybook-lab">
      <h1>Voice controlled review</h1>
      <VoiceLab
        initialState={state}
        initialView={view}
        onInspect={(id) => setResult(`Related fixture task selected: ${id}`)}
        onIntent={setResult}
      />
      <p role="status">{result || "No review intent"}</p>
    </div>
  )
}
function Story(props: { state: VoiceState; view: string }) {
  return <Review key={JSON.stringify(props)} {...props} />
}
const meta = {
  title: "Voice/Controlled review",
  component: Story,
  args: { state: "normal", view: "Transcript" },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Transcript: S = {}
export const LocalAudio: S = { args: { view: "Audio" } }
export const RecordingAppearance: S = { args: { state: "recording" } }
export const TranscribingAppearance: S = { args: { state: "transcribing" } }
export const PlaybackReview: S = { args: { state: "playback", view: "Audio" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const MediaFailure: S = { args: { state: "error" } }
export const PermissionUnavailable: S = { args: { state: "permission-unavailable" } }
export const Denied: S = { args: { state: "denied" } }
export const LongContent: S = { args: { state: "long-content" } }
export const Unknown: S = { args: { state: "unknown" } }
