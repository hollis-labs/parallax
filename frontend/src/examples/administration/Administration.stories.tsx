import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { AdministrationExample } from "./AdministrationExample"
import { type AdministrationState, defaultAdministrationState } from "./model"

function Portable({
  state: initial = defaultAdministrationState,
}: {
  state?: AdministrationState
}) {
  const [state, setState] = useState(initial)
  useEffect(() => {
    const root = document.documentElement,
      theme = root.dataset.theme,
      mode = root.dataset.mode
    applyTheme(state.theme)
    root.dataset.mode = state.mode
    return () => {
      if (theme) root.dataset.theme = theme
      else delete root.dataset.theme
      if (mode) root.dataset.mode = mode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])
  return <AdministrationExample state={state} onChange={setState} />
}
const meta = {
  title: "App Examples/Administration",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { state: defaultAdministrationState },
} satisfies Meta<typeof Portable>
export default meta
export const Directory: StoryObj<typeof meta> = {}
export const Profile: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "profile", user: "USER-001" } },
}
export const Roles: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "roles", user: "USER-001" } },
}
export const Permissions: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "permissions", user: "USER-001" } },
}
export const CurrentAccount: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "account", user: "USER-003" } },
}
export const DesiredSettings: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "settings" } },
}
export const SetupPreview: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "setup" } },
}
export const Empty: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "empty" } },
}
export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "loading" } },
}
export const ResourceError: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "error" } },
}
export const Denied: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "denied" } },
}
export const Unknown: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "unknown" } },
}
export const Locked: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, page: "account", appearance: "locked" } },
}
export const LongProfile: StoryObj<typeof meta> = {
  args: {
    state: { ...defaultAdministrationState, page: "profile", user: "USER-001", appearance: "long" },
  },
}
export const MissingRelationship: StoryObj<typeof meta> = {
  args: {
    state: {
      ...defaultAdministrationState,
      page: "permissions",
      user: "USER-001",
      appearance: "missing",
    },
  },
}
export const RetainedDegraded: StoryObj<typeof meta> = {
  args: { state: { ...defaultAdministrationState, appearance: "degraded" } },
}
