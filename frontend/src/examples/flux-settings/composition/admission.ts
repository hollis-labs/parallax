import { isComposingEvent } from "@hollis-labs/design-components"
import { useRef } from "react"
import { useCommittedFrame } from "../committed-frame"
import { hasVisibleCompetingOverlay } from "../FluxSettingsShell"

export const closedMarkers =
  "[hidden], [inert], [aria-hidden='true'], [data-closed], [data-state='closed'], [data-ending]"
export function useAdmission(parent: () => boolean = () => true) {
  const root = useRef<HTMLElement | null>(null)
  const { frameToken, checkToken } = useCommittedFrame()
  function live() {
    return (
      checkToken(frameToken) &&
      parent() &&
      !!root.current?.isConnected &&
      !root.current.closest(closedMarkers) &&
      !hasVisibleCompetingOverlay()
    )
  }
  return { root, live, frameToken }
}
export function plainKey(event: React.KeyboardEvent | KeyboardEvent) {
  const native = "nativeEvent" in event ? event.nativeEvent : event
  return (
    !isComposingEvent(native) &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  )
}
