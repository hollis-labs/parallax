import { Activity, createElement, StrictMode } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { getDrawerSessionState, useDrawerSession } from "../../src/drawers/useDrawerSessionStore"

export function exerciseRetirement() {
  const host = document.createElement("div")
  document.body.append(host)
  const root = createRoot(host)
  let current: ReturnType<typeof useDrawerSession> | undefined
  const read = () => {
    if (!current) throw new Error("Witness not mounted")
    return current
  }
  function Witness({ sessionId }: { sessionId: string }) {
    current = useDrawerSession(sessionId)
    return null
  }
  const render = (sessionId: string) =>
    flushSync(() => root.render(createElement(Witness, { sessionId })))
  const snapshot = () =>
    JSON.stringify([getDrawerSessionState("REPLAY-A"), getDrawerSessionState("REPLAY-B")])
  const mutate = (held: ReturnType<typeof useDrawerSession>) => {
    const actions = [
      ["setPrimary", () => held.setPrimaryDrawer({ height: 600, activeTab: "tools" })],
      ["setWorking", () => held.setWorkingDrawer({ height: 600 })],
      [
        "appendCard",
        () =>
          held.appendCardTab({
            id: "card:retired",
            label: "Retired",
            payload: {},
            focused: true,
            pinned: false,
            createdAt: 1791124200000,
          }),
      ],
      ["togglePin", () => held.togglePinCardTab("card:retired")],
      [
        "pinPrimary",
        () =>
          held.pinPrimaryCard({
            id: "retired-pin",
            title: "Retired",
            card_type: "dynamic-card",
            content_ref: "retired-pin",
            payload: "{}",
          }),
      ],
      ["unpinPrimary", () => held.unpinPrimaryCard("retired-pin")],
      ["removeCard", () => held.removeCardTab("card:retired")],
      ["reset", () => held.resetSession()],
    ] as const
    return actions.map(([action, invoke]) => {
      const before = snapshot()
      flushSync(invoke)
      return { action, before, after: snapshot() }
    })
  }
  try {
    render("REPLAY-A")
    const oldA = read()
    flushSync(() => {
      oldA.appendCardTab({
        id: "card:retired",
        label: "Existing",
        payload: {},
        pinned: false,
        createdAt: 1791124200000,
      })
      oldA.pinPrimaryCard({
        id: "retired-pin",
        title: "Existing",
        card_type: "dynamic-card",
        content_ref: "retired-pin",
        payload: "{}",
      })
      oldA.setPrimaryDrawer({ height: 320 })
    })
    render("REPLAY-B")
    flushSync(() => read().setWorkingDrawer({ height: 256 }))
    const beforeSwitch = snapshot()
    const switchActions = mutate(oldA)
    const afterSwitch = snapshot()
    render("REPLAY-A")
    const newA = read()
    const beforeReturn = snapshot()
    const returnActions = mutate(oldA)
    const afterReturn = snapshot()
    flushSync(() => newA.setPrimaryDrawer({ height: 400 }))
    const admittedHeight = getDrawerSessionState("REPLAY-A").primaryDrawer.height
    flushSync(() => root.unmount())
    const beforeUnmount = snapshot()
    const unmountActions = mutate(newA)
    const afterUnmount = snapshot()
    return {
      switchActions,
      returnActions,
      unmountActions,
      beforeSwitch,
      afterSwitch,
      beforeReturn,
      afterReturn,
      admittedHeight,
      beforeUnmount,
      afterUnmount,
    }
  } finally {
    host.remove()
  }
}

export function exerciseReactivation() {
  const host = document.createElement("div")
  document.body.append(host)
  const root = createRoot(host)
  let current: ReturnType<typeof useDrawerSession> | undefined
  const read = () => {
    if (!current) throw new Error("Witness not mounted")
    return current
  }
  function Witness() {
    current = useDrawerSession("REPLAY-LEASE")
    return null
  }
  const render = (mode: "visible" | "hidden") =>
    flushSync(() =>
      root.render(
        createElement(StrictMode, null, createElement(Activity, { mode }, createElement(Witness))),
      ),
    )
  const snapshot = () => JSON.stringify(getDrawerSessionState("REPLAY-LEASE"))
  const mutate = (held: ReturnType<typeof useDrawerSession>) => {
    const actions = [
      ["setPrimary", () => held.setPrimaryDrawer({ height: 600, activeTab: "tools" })],
      ["setWorking", () => held.setWorkingDrawer({ height: 600 })],
      [
        "appendCard",
        () =>
          held.appendCardTab({
            id: "card:lease",
            label: "Retired",
            payload: {},
            focused: true,
            pinned: false,
            createdAt: 1791124200000,
          }),
      ],
      ["removeCard", () => held.removeCardTab("card:lease")],
      ["togglePin", () => held.togglePinCardTab("card:lease")],
      [
        "pinPrimary",
        () =>
          held.pinPrimaryCard({
            id: "lease-pin",
            title: "Retired",
            card_type: "dynamic-card",
            content_ref: "lease-pin",
            payload: "{}",
          }),
      ],
      ["unpinPrimary", () => held.unpinPrimaryCard("lease-pin")],
      ["reset", () => held.resetSession()],
    ] as const
    return actions.map(([action, invoke]) => {
      const before = snapshot()
      flushSync(invoke)
      return { action, before, after: snapshot() }
    })
  }
  try {
    render("visible")
    const old = read()
    flushSync(() => {
      old.setPrimaryDrawer({ height: 320 })
      old.appendCardTab({
        id: "card:lease",
        label: "Existing",
        payload: {},
        pinned: false,
        createdAt: 1791124200000,
      })
      old.pinPrimaryCard({
        id: "lease-pin",
        title: "Existing",
        card_type: "dynamic-card",
        content_ref: "lease-pin",
        payload: "{}",
      })
    })
    const onceWorking = getDrawerSessionState("REPLAY-LEASE").primaryDrawer.height
    render("hidden")
    const hiddenActions = mutate(old)
    render("visible")
    const live = read()
    flushSync(() => live.setPrimaryDrawer({ height: 400 }))
    const currentWorking = getDrawerSessionState("REPLAY-LEASE").primaryDrawer.height
    const reactivatedActions = mutate(old)
    const afterOld = getDrawerSessionState("REPLAY-LEASE").primaryDrawer.height
    flushSync(() => root.unmount())
    const unmountActions = mutate(live)
    return {
      onceWorking,
      currentWorking,
      afterOld,
      hiddenActions,
      reactivatedActions,
      unmountActions,
    }
  } finally {
    host.remove()
  }
}
