import { applyTheme } from "@hollis-labs/kit-dashboard"
import { PluginHostProvider } from "@hollis-labs/plugin-host-ui/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Contributions } from "../../App"
import { createOperationsExample } from "../../chimera/example"
import { operationsModel } from "../../operations/model"
import { admitTorqueState, initialTorqueState, type TorqueState, torqueHref } from "./routes"
import { TorqueExample } from "./TorqueExample"
export function StandaloneTorqueExample() {
  const [state, setState] = useState(() =>
      initialTorqueState(new URLSearchParams(location.search)),
    ),
    [host, setHost] = useState<ReturnType<typeof createOperationsExample> | null>(null),
    [status, setStatus] = useState<"loading" | "ready" | "error" | "unloaded">("loading")
  const stateRef = useRef(state)
  stateRef.current = state
  const navigate = useRef<(patch: Partial<TorqueState>, replace?: boolean) => void>(() => {})
  function change(patch: Partial<TorqueState>, replace = false) {
    const next = admitTorqueState({ ...stateRef.current, ...patch })
    host?.resetContext({ ...host.context.getSnapshot(), retiredExample: true })
    setState(next)
    history[replace ? "replaceState" : "pushState"]({}, "", torqueHref(next))
  }
  navigate.current = change
  useEffect(() => {
    history.replaceState({}, "", torqueHref(stateRef.current))
  }, [])
  useEffect(() => {
    const pop = () => {
      host?.resetContext({ ...host.context.getSnapshot(), retiredExample: true })
      const next = initialTorqueState(new URLSearchParams(location.search))
      history.replaceState({}, "", torqueHref(next))
      setState(next)
    }
    addEventListener("popstate", pop)
    return () => removeEventListener("popstate", pop)
  }, [host])
  useEffect(() => {
    const abort = new AbortController(),
      current = createOperationsExample((route) =>
        navigate.current({ route: "dashboard", tab: route === "usage" ? "Usage" : "Activity" }),
      )
    setHost(current)
    setStatus("loading")
    void current
      .load(undefined, abort.signal)
      .then((r) => {
        if (!abort.signal.aborted) setStatus(r.planning.accepted ? "ready" : "error")
      })
      .catch(() => {
        if (!abort.signal.aborted) setStatus("error")
      })
    return () => {
      abort.abort()
      void current.dispose()
    }
  }, [])
  const model = operationsModel(state.scenario, state.query, {
    cutoff: state.cutoff,
    override: state.override,
  })
  useLayoutEffect(() => {
    host?.resetContext({
      fixture: true,
      example: "torque",
      view: state.route,
      scenario: state.scenario,
      query: state.query,
      cutoff: state.cutoff,
      resource: model.resource,
      count: model.stats.count,
      done: model.stats.done,
      contextId: JSON.stringify(state),
    })
  }, [host, state, model.resource, model.stats.count, model.stats.done])
  useEffect(() => {
    applyTheme(state.theme as Parameters<typeof applyTheme>[0])
    document.documentElement.dataset.mode = state.mode
  }, [state.theme, state.mode])
  const shell = (
    <TorqueExample
      state={state}
      onChange={change}
      contributions={
        host ? (
          <Contributions host={host} status={status} onUnload={() => setStatus("unloaded")} />
        ) : (
          <p>Loading admitted plugin presentation…</p>
        )
      }
    />
  )
  return host ? <PluginHostProvider runtime={host.runtime}>{shell}</PluginHostProvider> : shell
}
