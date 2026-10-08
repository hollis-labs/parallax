import type { Meta, StoryObj } from "@storybook/react-vite"
import { type AccountAppearance, type AccountMode, accountAppearances, accountModes } from "./model"
import { AccountReview } from "./Review"

function Story({
  state = "recorded",
  mode = "profile",
  context = "populated",
}: {
  state?: AccountAppearance
  mode?: AccountMode
  context?: string
}) {
  return (
    <div className="review-surface">
      <AccountReview
        key={`${state}/${mode}/${context}`}
        initialState={state}
        initialMode={mode}
        context={context}
      />
    </div>
  )
}
const meta = {
  title: "Account/Controlled account review",
  component: Story,
  args: { state: "recorded", mode: "profile", context: "populated" },
  argTypes: {
    state: { control: "select", options: accountAppearances },
    mode: { control: "select", options: accountModes },
    context: { control: "select", options: ["populated", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Profile: S = {}
export const Metadata: S = { args: { mode: "metadata" } }
export const Empty: S = { args: { mode: "metadata", state: "empty" } }
export const LoadingIdentity: S = { args: { state: "loading" } }
export const IdentityError: S = { args: { state: "error" } }
export const Denied: S = { args: { state: "denied" } }
export const ReadOnly: S = { args: { state: "read-only" } }
export const LongContent: S = { args: { mode: "metadata", state: "long" } }
export const UnknownIdentity: S = { args: { state: "unknown-identity" } }
export const UnknownStatus: S = { args: { mode: "metadata", state: "unknown-status" } }
export const Busy: S = { args: { state: "busy" } }
export const BusyMetadata: S = { args: { mode: "metadata", state: "busy" } }
export const InvalidProfile: S = { args: { state: "invalid-profile" } }
export const UnavailableScope: S = { args: { mode: "metadata", state: "unavailable-scope" } }
export const MetadataLoading: S = { args: { mode: "metadata", state: "metadata-loading" } }
export const MetadataError: S = { args: { mode: "metadata", state: "metadata-error" } }
