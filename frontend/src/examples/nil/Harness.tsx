import { InspectionDialog, RadialMenu } from "@hollis-labs/design-components"
import { Activity, useLayoutEffect, useRef, useState } from "react"
import { NilExample, type NilProofFrame } from "./NilExample"

interface NilHarness {
  current?: NilProofFrame
  held?: NilProofFrame
  retired: NilProofFrame[]
  source: number
  mounted: boolean
  hidden: boolean
  accessible: boolean
}
declare global {
  interface Window {
    __nil: NilHarness
  }
}
export function NilHarness() {
  const [source, setSource] = useState(1),
    [hidden, setHidden] = useState(false),
    [mounted, setMounted] = useState(true),
    [accessible, setAccessible] = useState(true)
  const [owner, setOwner] = useState<"dialog" | "menu" | null>(null)
  const state = useRef<NilHarness>({ retired: [], source, mounted, hidden, accessible })
  useLayoutEffect(() => {
    Object.assign(state.current, { source, mounted, hidden, accessible })
    window.__nil = state.current
  })
  return (
    <>
      <div className="flex flex-wrap gap-2 bg-bg-elevated p-2 text-fg">
        <button type="button" onClick={() => setSource((v) => v + 1)}>
          Replace Nil source
        </button>
        <button type="button" onClick={() => setAccessible((v) => !v)}>
          Toggle Nil access
        </button>
        <button type="button" onClick={() => setHidden((v) => !v)}>
          Toggle Nil Activity
        </button>
        <button type="button" onClick={() => setMounted((v) => !v)}>
          Toggle Nil root
        </button>
        <button
          type="button"
          onClick={() => {
            if (state.current.current) state.current.retired.push(state.current.current)
          }}
        >
          Retain Nil actions
        </button>
        <input aria-label="Newer plain owner" />
        <button type="button" onClick={() => setOwner("dialog")}>
          Open newer dialog
        </button>
        <button type="button" onClick={() => setOwner("menu")}>
          Open newer menu
        </button>
      </div>
      <InspectionDialog
        open={owner === "dialog"}
        onOpenChange={(v) => {
          if (!v) setOwner(null)
        }}
        title="Newer dialog owner"
      >
        <input aria-label="Newer dialog input" />
      </InspectionDialog>
      {owner === "menu" && (
        <RadialMenu
          label="Newer menu owner"
          open
          sourceGeneration={source}
          activationGeneration="newer"
          isAdmitted={() => owner === "menu"}
          focusReturn={{}}
          position={{ x: 180, y: 180 }}
          items={[{ id: "keep", label: "Keep", angle: 0 }]}
          onAction={() => setOwner(null)}
          onOpenChange={(v) => {
            if (!v) setOwner(null)
          }}
        />
      )}
      {mounted && (
        <Activity mode={hidden ? "hidden" : "visible"}>
          <NilExample
            source={source}
            accessible={accessible}
            onProof={(frame) => {
              state.current.current = frame
              window.__nil = state.current
            }}
          />
        </Activity>
      )}
    </>
  )
}
