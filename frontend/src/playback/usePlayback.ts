import { useCallback, useEffect, useRef, useState } from "react"
import { type ResourceOverride, sourceDataset, timelineFrames } from "./model"
export function usePlayback(
  scenario: string,
  initial?: { cutoff?: string; override?: ResourceOverride },
  onRetire?: () => void,
) {
  const source = sourceDataset(scenario),
    frames = timelineFrames(source),
    [position, setPosition] = useState<number | null>(
      initial?.cutoff ? Math.max(0, frames.indexOf(initial.cutoff)) : null,
    ),
    [playing, setPlaying] = useState(false),
    [override, setOverride] = useState<ResourceOverride>(initial?.override ?? "scenario"),
    [epoch, setEpoch] = useState(0),
    generation = useRef(0),
    sourceKey = useRef(scenario),
    committedSource = useRef(scenario),
    retired = useRef(onRetire),
    controller = useRef(new AbortController())
  retired.current = onRetire
  const sourceChanged = sourceKey.current !== scenario
  if (sourceChanged) {
    sourceKey.current = scenario
    generation.current++
  }
  const index =
      sourceChanged || position === null
        ? frames.length - 1
        : Math.min(position, frames.length - 1),
    cutoff = frames[index]
  const retire = useCallback(() => {
    controller.current.abort()
    controller.current = new AbortController()
    retired.current?.()
    generation.current++
    setEpoch(generation.current)
  }, [])
  function seek(next: number) {
    retire()
    setPlaying(false)
    setPosition(Math.max(0, Math.min(next, frames.length - 1)))
  }
  function reset() {
    seek(0)
    setOverride("scenario")
  }
  function changeOverride(next: ResourceOverride) {
    retire()
    setPlaying(false)
    setOverride(next)
  }
  useEffect(() => {
    if (committedSource.current !== scenario) {
      committedSource.current = scenario
      retire()
      setPlaying(false)
      setPosition(null)
      setOverride("scenario")
    }
  }, [scenario, retire])
  useEffect(() => {
    if (!playing || sourceChanged) return
    if (index === frames.length - 1) {
      setPlaying(false)
      return
    }
    const stamp = generation.current,
      abort = new AbortController()
    const timer = setTimeout(() => {
      if (!abort.signal.aborted && generation.current === stamp) {
        retire()
        setPosition(index + 1)
      }
    }, 750)
    return () => {
      abort.abort()
      clearTimeout(timer)
    }
  }, [playing, index, frames.length, sourceChanged, retire])
  useEffect(
    () => () => {
      generation.current++
      controller.current.abort()
    },
    [],
  )
  return {
    source,
    signal: controller.current.signal,
    frames,
    index,
    cutoff,
    playing: sourceChanged ? false : playing,
    override: sourceChanged ? ("scenario" as const) : override,
    epoch,
    seek,
    reset,
    changeOverride,
    step: () => seek(index + 1),
    snapshot: () => seek(frames.length - 1),
    toggle: () => {
      retire()
      if (!playing && index === frames.length - 1) setPosition(0)
      setPlaying((p) => !p)
    },
  }
}
