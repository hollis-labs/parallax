import { Activity, StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { diagnostics, FluxRailReview } from "../../src/flux-rail/Review"

function currentFrame() {
  const frame = diagnostics.frames.at(-1)
  if (!frame) throw new Error("No committed rail frame")
  return frame
}
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing native focus fixture operand")
  return value
}
function keyboardHandler(element: Element) {
  const key = required(Object.keys(element).find((k) => k.startsWith("__reactProps$")))
  // Capture the actual React DOM onKeyDown prop, not a duplicate implementation.
  return required((element as unknown as Record<string, { onKeyDown: (e: object) => void }>)[key])
    .onKeyDown
}
export async function focusExercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)
  let hide: (mode: "visible" | "hidden") => void = () => {}
  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    hide = setMode
    return (
      <Activity mode={mode}>
        <FluxRailReview />
      </Activity>
    )
  }
  const settle = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  flushSync(() =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  )
  await settle()
  const actualInspect = required(
    [...element.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => b.textContent === "Inspect context",
    ),
  )
  flushSync(() => actualInspect.click())
  await settle()
  const close = required(
    [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => b.textContent === "Close inspection",
    ),
  )
  flushSync(() => close.click())
  await settle()
  const retainedFocus = currentFrame().finalFocus
  const positiveFocus = retainedFocus() === actualInspect
  flushSync(() => hide("hidden"))
  await settle()
  const hiddenFocus = retainedFocus() !== false
  flushSync(() => hide("visible"))
  await settle()
  const reactivatedFocus = retainedFocus() !== false
  const freshFocus = currentFrame().finalFocus() === actualInspect
  flushSync(() => root.unmount())
  element.remove()

  const railElement = document.createElement("div")
  document.body.append(railElement)
  const railRoot = createRoot(railElement)
  flushSync(() =>
    railRoot.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  )
  await settle()
  const held = keyboardHandler(required(railElement.querySelector('[role="tab"]')))
  const event = () => ({
    key: "ArrowRight",
    nativeEvent: { isComposing: false },
    preventDefault() {},
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  })
  flushSync(() => held(event()))
  await settle()
  const positiveRove =
    document.activeElement?.getAttribute("role") === "tab" &&
    document.activeElement?.textContent === "Plan"
  const beforeHideHeld = keyboardHandler(required(railElement.querySelector('[role="tab"]')))
  const beforeHideLive = currentFrame().shortcut.isLive()
  flushSync(() => hide("hidden"))
  await settle()
  flushSync(() => hide("visible"))
  await settle()
  const heading = required(railElement.querySelector<HTMLElement>("h1"))
  heading.focus()
  flushSync(() => beforeHideHeld(event()))
  const staleRove = document.activeElement !== heading
  const fresh = keyboardHandler(required(railElement.querySelector('[role="tab"]')))
  flushSync(() => fresh(event()))
  const freshRove = document.activeElement?.textContent === "Plan"
  flushSync(() => railRoot.unmount())
  railElement.remove()
  return {
    positiveFocus,
    hiddenFocus,
    reactivatedFocus,
    freshFocus,
    positiveRove,
    beforeHideLive,
    staleRove,
    freshRove,
  }
}
export async function exercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)
  let hide: (mode: "visible" | "hidden") => void = () => {}
  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    hide = setMode
    return (
      <Activity mode={mode}>
        <FluxRailReview />
      </Activity>
    )
  }
  flushSync(() =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  )
  const settle = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await settle()
  const retained = currentFrame()
  const positive = retained.signal({ action: "open", panel_id: "widgets" })
  await settle()
  const beforeHide = currentFrame()
  flushSync(() => hide("hidden"))
  await settle()
  const hidden = beforeHide.signal({ action: "open", panel_id: "work" })
  flushSync(() => hide("visible"))
  await settle()
  const reactivated = beforeHide.signal({ action: "open", panel_id: "work" })
  const latest = currentFrame()
  const current = latest.signal({ action: "open", panel_id: "inbox" })
  await settle()
  const beforeUnmount = currentFrame()
  flushSync(() => root.unmount())
  element.remove()
  const unmounted = beforeUnmount.signal({ action: "open", panel_id: "work" })
  return { positive, hidden, reactivated, current, unmounted }
}
