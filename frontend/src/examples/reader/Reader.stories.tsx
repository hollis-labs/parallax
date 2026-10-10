import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { defaultReaderState, type ReaderExampleState } from "./model"
import { ReaderExample } from "./ReaderExample"

function Portable({ state: initial = defaultReaderState }: { state?: ReaderExampleState }) {
  const [state, setState] = useState(initial)
  useEffect(() => {
    const root = document.documentElement
    const oldTheme = root.dataset.theme
    const oldMode = root.dataset.mode
    applyTheme(state.theme as any)
    root.dataset.mode = state.mode
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])
  return <ReaderExample state={state} onChange={setState} />
}

const meta = {
  title: "App Examples/Reader",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { state: defaultReaderState },
} satisfies Meta<typeof Portable>

export default meta

export const Inbox: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, scope: "inbox" } },
}

export const Library: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, scope: "library" } },
}

export const All: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, scope: "all" } },
}

export const Empty: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, appearance: "empty" } },
}

export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, appearance: "loading" } },
}

export const ErrorState: StoryObj<typeof meta> = {
  args: { state: { ...defaultReaderState, appearance: "error" } },
}

export const InlineError: StoryObj<typeof meta> = {
  args: {
    state: {
      ...defaultReaderState,
      scope: "library",
      appearance: "inline-error",
    },
  },
}
