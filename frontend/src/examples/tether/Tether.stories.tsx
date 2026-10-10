import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { OverviewPage } from "../../tether-sysop/OverviewPage"
import { defaultTetherState, type TetherExampleState } from "./model"

function PortableTetherOverview({
  state: initial = defaultTetherState,
}: {
  state?: TetherExampleState
}) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const root = document.documentElement
    const oldTheme = root.dataset.theme
    const oldMode = root.dataset.mode
    applyTheme(state.theme as Parameters<typeof applyTheme>[0])
    root.dataset.mode = state.mode
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])

  return (
    <OverviewPage
      variant={state.variant}
      onVariantChange={(variant) => setState((prev) => ({ ...prev, variant }))}
      forcedAppearance={state.appearance}
      showIdentityLinks={true}
      showVariantSelector={true}
    />
  )
}

const meta = {
  title: "App Examples/Tether Sysop Overview",
  component: PortableTetherOverview,
  parameters: { layout: "fullscreen" },
  args: { state: defaultTetherState },
} satisfies Meta<typeof PortableTetherOverview>

export default meta

export const Overview: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, variant: "standard" } },
}

export const BlockedHealth: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, variant: "blocked-health" } },
}

export const DegradedReliability: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, variant: "degraded-reliability" } },
}

export const CombinedAdverse: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, variant: "combined-adverse" } },
}

export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, appearance: "loading" } },
}

export const ErrorState: StoryObj<typeof meta> = {
  args: { state: { ...defaultTetherState, appearance: "error" } },
}
