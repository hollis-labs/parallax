import { useLayoutEffect, useMemo, useRef, useState } from "react"

export type NavigationHandle = { run: (effect: () => void) => boolean }
export const navigationDiagnostics: { handles: NavigationHandle[]; effects: string[] } = {
  handles: [],
  effects: [],
}

/** Render and commit ownership both matter: retained callbacks cannot cross a source/access/layer or root lifetime. */
export function useAdmission(
  source: string,
  accessible: boolean,
  layer: string,
  root: () => HTMLElement | null,
) {
  const [activation, setActivation] = useState(0)
  const frame = useMemo(
    () => ({ source, accessible, layer, activation, live: false, activated: false }),
    [source, accessible, layer, activation],
  )
  const rendered = useRef(frame)
  rendered.current = frame
  const committed = useRef<typeof frame | null>(null)
  const handle = useMemo<NavigationHandle>(
    () => ({
      run(effect) {
        if (
          !frame.live ||
          !frame.accessible ||
          rendered.current !== frame ||
          committed.current !== frame ||
          !root()?.isConnected
        )
          return false
        effect()
        return true
      },
    }),
    [frame, root],
  )
  useLayoutEffect(() => {
    // An effect replay cannot reuse an activation already retired by cleanup.
    // Schedule a fresh render/handle; the old handle stays permanently refused.
    if (frame.activated) {
      setActivation((value) => value + 1)
      return
    }
    frame.activated = true
    committed.current = frame
    frame.live = true
    navigationDiagnostics.handles.push(handle)
    return () => {
      frame.live = false
      if (committed.current === frame) committed.current = null
    }
  }, [frame, handle])
  return handle
}
