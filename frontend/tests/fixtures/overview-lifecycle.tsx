import { Activity, StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import {
  createTetherSysopMockApi,
  type OverviewInfo,
  type OverviewVariantKey,
  overviewModel,
} from "../../src/tether-sysop/model"
import { OverviewPage } from "../../src/tether-sysop/OverviewPage"

export async function overviewLifecycleExercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)

  let setActivityMode: (mode: "visible" | "hidden") => void = () => {}
  let setVariantProp: (v: OverviewVariantKey) => void = () => {}

  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    const [variant, setVariant] = useState<OverviewVariantKey>("standard")

    setActivityMode = setMode
    setVariantProp = setVariant

    return (
      <Activity mode={mode}>
        <OverviewPage variant={variant} />
      </Activity>
    )
  }

  const settle = async () => {
    await Promise.resolve()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await Promise.resolve()
  }

  flushSync(() => {
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    )
  })
  await settle()

  const getHandlers = () => {
    const w = window as unknown as {
      __tetherOverviewActiveRefreshHandler?: () => boolean
      __tetherOverviewActiveVariantHandler?: (next: OverviewVariantKey) => boolean
      __tetherOverviewActivationLease?: number
      __tetherOverviewLoading?: boolean
    }
    return w
  }

  // 1. Current-positive activation on live frame
  const initialRefresh = getHandlers().__tetherOverviewActiveRefreshHandler
  if (!initialRefresh) throw new Error("Missing initial refresh handler")
  const initialLease = getHandlers().__tetherOverviewActivationLease
  const positiveInitial = initialRefresh() === true
  await settle()

  // 2. Retained-old refusal when Activity mode="hidden"
  flushSync(() => setActivityMode("hidden"))
  await settle()
  const refusedWhileHidden = initialRefresh() === false

  // 3. Reactivated mode="visible": old retained callback remains retired
  flushSync(() => setActivityMode("visible"))
  await settle()
  const retainedRemainsRetired = initialRefresh() === false

  // Fresh frame activation recovers cleanly
  const freshRefresh = getHandlers().__tetherOverviewActiveRefreshHandler
  if (!freshRefresh) throw new Error("Missing fresh refresh handler")
  const freshLease = getHandlers().__tetherOverviewActivationLease
  const leaseAdvanced = (freshLease ?? 0) > (initialLease ?? 0)
  const freshRecovery = freshRefresh() === true
  await settle()

  // 4. Competing overlay guards using SAME real captured handlers
  // 4a. Visible competing dialog vetoes
  const competingDialog = document.createElement("div")
  competingDialog.setAttribute("role", "dialog")
  competingDialog.style.width = "200px"
  competingDialog.style.height = "100px"
  competingDialog.textContent = "Modal dialog overlay"
  document.body.append(competingDialog)
  const competingDialogVeto = freshRefresh() === false
  competingDialog.remove()

  // 4b. Visible competing menu vetoes
  const competingMenu = document.createElement("div")
  competingMenu.setAttribute("role", "menu")
  competingMenu.style.width = "200px"
  competingMenu.style.height = "100px"
  competingMenu.textContent = "Visible Menu"
  document.body.append(competingMenu)
  const competingMenuVeto = freshRefresh() === false
  competingMenu.remove()

  // 4c. Visible competing listbox vetoes
  const competingListbox = document.createElement("div")
  competingListbox.setAttribute("role", "listbox")
  competingListbox.style.width = "200px"
  competingListbox.style.height = "100px"
  competingListbox.textContent = "Visible Listbox"
  document.body.append(competingListbox)
  const competingListboxVeto = freshRefresh() === false
  competingListbox.remove()

  // 4d. Fresh recovery after overlay removal
  const competingRemovedRecovery = freshRefresh() === true
  await settle()

  // 4e. Dialog with [data-closed] marker admits (current positive)
  const closedDialog = document.createElement("div")
  closedDialog.setAttribute("role", "dialog")
  closedDialog.setAttribute("data-closed", "")
  closedDialog.style.width = "200px"
  closedDialog.style.height = "100px"
  document.body.append(closedDialog)
  const dataClosedAdmitted = freshRefresh() === true
  await settle()
  closedDialog.remove()

  // 4f. Dialog with data-closed ancestor admits (current positive)
  const closedAncestor = document.createElement("div")
  closedAncestor.setAttribute("data-closed", "")
  const nestedDialog = document.createElement("div")
  nestedDialog.setAttribute("role", "dialog")
  nestedDialog.style.width = "200px"
  nestedDialog.style.height = "100px"
  closedAncestor.append(nestedDialog)
  document.body.append(closedAncestor)
  const dataClosedAncestorAdmitted = freshRefresh() === true
  await settle()
  closedAncestor.remove()

  // 4g. Dialog with [hidden] ancestor admits (current positive)
  const hiddenAncestor = document.createElement("div")
  hiddenAncestor.setAttribute("hidden", "")
  const hiddenNestedDialog = document.createElement("div")
  hiddenNestedDialog.setAttribute("role", "dialog")
  hiddenNestedDialog.style.width = "200px"
  hiddenNestedDialog.style.height = "100px"
  hiddenAncestor.append(hiddenNestedDialog)
  document.body.append(hiddenAncestor)
  const hiddenAncestorAdmitted = freshRefresh() === true
  await settle()
  hiddenAncestor.remove()

  // 4h. Dialog with display:none ancestor does not veto (negative visibility control)
  const displayNoneAncestor = document.createElement("div")
  displayNoneAncestor.style.display = "none"
  const nestedNoneDialog = document.createElement("div")
  nestedNoneDialog.setAttribute("role", "dialog")
  nestedNoneDialog.style.width = "200px"
  nestedNoneDialog.style.height = "100px"
  displayNoneAncestor.append(nestedNoneDialog)
  document.body.append(displayNoneAncestor)
  const displayNoneAncestorAdmitted = freshRefresh() === true
  await settle()
  displayNoneAncestor.remove()

  // 4i. Dialog with opacity:0 ancestor does not veto (negative visibility control)
  const opacityZeroAncestor = document.createElement("div")
  opacityZeroAncestor.style.opacity = "0"
  const nestedOpacityDialog = document.createElement("div")
  nestedOpacityDialog.setAttribute("role", "dialog")
  nestedOpacityDialog.style.width = "200px"
  nestedOpacityDialog.style.height = "100px"
  opacityZeroAncestor.append(nestedOpacityDialog)
  document.body.append(opacityZeroAncestor)
  const opacityZeroAncestorAdmitted = freshRefresh() === true
  await settle()
  opacityZeroAncestor.remove()

  // 4j. Dialog with 0x0 geometry does not veto (negative visibility control)
  const zeroRectDialog = document.createElement("div")
  zeroRectDialog.setAttribute("role", "dialog")
  zeroRectDialog.style.width = "0px"
  zeroRectDialog.style.height = "0px"
  document.body.append(zeroRectDialog)
  const zeroRectDialogAdmitted = freshRefresh() === true
  await settle()
  zeroRectDialog.remove()

  // 5. Source replacement (variant change) retirement
  const heldBeforeVariantChange = getHandlers().__tetherOverviewActiveRefreshHandler!
  flushSync(() => setVariantProp("degraded-reliability"))
  await settle()
  const refusedAfterVariantChange = heldBeforeVariantChange() === false
  const freshAfterVariantChange = getHandlers().__tetherOverviewActiveRefreshHandler!() === true
  await settle()

  // Unmount initial harness
  flushSync(() => root.unmount())
  element.remove()

  // 6. Outstanding mock request with competing overlay:
  // While request is in flight, overlay is opened. User actions must be vetoed,
  // but when request completes, settled loading must be truthful (false).
  const pendingElement = document.createElement("div")
  document.body.append(pendingElement)
  const pendingRoot = createRoot(pendingElement)

  let resolveDeferred!: (val: OverviewInfo) => void
  const deferredPromise = new Promise<OverviewInfo>((resolve) => {
    resolveDeferred = resolve
  })

  const customApi = {
    ...createTetherSysopMockApi("standard"),
    getOverview: () => deferredPromise,
  }

  flushSync(() => {
    pendingRoot.render(
      <StrictMode>
        <OverviewPage api={customApi} />
      </StrictMode>,
    )
  })
  await settle()

  // Snapshot the retained callback to test veto under competing overlay
  const retainedPendingRefresh = getHandlers().__tetherOverviewActiveRefreshHandler!
  flushSync(() => {
    retainedPendingRefresh()
  })
  const initialPendingLoading =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === true

  // Insert competing overlay while request is in flight
  const inFlightOverlay = document.createElement("div")
  inFlightOverlay.setAttribute("role", "dialog")
  inFlightOverlay.style.width = "200px"
  inFlightOverlay.style.height = "100px"
  inFlightOverlay.textContent = "In flight overlay"
  document.body.append(inFlightOverlay)

  // Verify background user action is vetoed while overlay is active using retained callback
  const backgroundEventVetoed = retainedPendingRefresh() === false

  // Now resolve the in-flight request
  resolveDeferred(overviewModel("standard"))
  await settle()
  await new Promise((r) => setTimeout(r, 20))

  // Settled loading must be truthful (false) despite the presence of the overlay!
  const settledLoadingTruthful =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === false

  // Remove overlay
  inFlightOverlay.remove()
  // Explicitly acquire fresh callback after overlay removed
  const freshAfterOverlayRemoved = getHandlers().__tetherOverviewActiveRefreshHandler!
  const recoveredAfterOverlayRemoved = freshAfterOverlayRemoved() === true

  flushSync(() => pendingRoot.unmount())
  pendingElement.remove()

  // 7. Stale request resolving while newer request is pending:
  // Start A, commit variant/source lease replacement and start B,
  // resolve A first, assert B remains loading/Refresh disabled;
  // then resolve B, fresh current settles false.
  const dualElement = document.createElement("div")
  document.body.append(dualElement)
  const dualRoot = createRoot(dualElement)

  let resolveA!: (val: OverviewInfo) => void
  const promiseA = new Promise<OverviewInfo>((resolve) => {
    resolveA = resolve
  })
  let resolveB!: (val: OverviewInfo) => void
  const promiseB = new Promise<OverviewInfo>((resolve) => {
    resolveB = resolve
  })

  let requestCount = 0
  const dualApi = {
    ...createTetherSysopMockApi("standard"),
    getOverview: () => {
      requestCount++
      if (requestCount === 1) return promiseA
      return promiseB
    },
  }

  let setDualVariant: (v: OverviewVariantKey) => void = () => {}

  function DualHarness() {
    const [variant, setVariant] = useState<OverviewVariantKey>("standard")
    setDualVariant = setVariant
    return <OverviewPage variant={variant} api={dualApi} />
  }

  flushSync(() => {
    dualRoot.render(
      <StrictMode>
        <DualHarness />
      </StrictMode>,
    )
  })
  await settle()

  // Start request A and snapshot retained callback A
  const retainedRefreshA = getHandlers().__tetherOverviewActiveRefreshHandler!
  flushSync(() => {
    retainedRefreshA()
  })
  const loadingAfterAStarted =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === true

  // Commit variant/source lease replacement
  flushSync(() => {
    setDualVariant("degraded-reliability")
  })
  await settle()

  // Retained callback A must refuse execution on superseded source/lease
  const retainedRefreshARefused = retainedRefreshA() === false

  // Trigger request B on new committed lease/variant
  flushSync(() => {
    getHandlers().__tetherOverviewActiveRefreshHandler?.()
  })
  const loadingAfterBStarted =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === true

  // Real DOM Refresh button query
  const domRefreshBtn = dualElement.querySelector<HTMLButtonElement>(
    'button[aria-label="Refresh overview dashboard"]',
  )
  const domRefreshDisabledWhileBPending = domRefreshBtn?.disabled === true

  // Resolve A first (stale/superseded request)
  resolveA(overviewModel("standard"))
  await settle()
  await new Promise((r) => setTimeout(r, 25))

  // While request B remains pending:
  // Stale request A's finally must NOT clear loading or re-enable refresh!
  const bRemainsLoadingAfterAResolves =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === true

  const domRefreshStillDisabledWhileBPending = domRefreshBtn?.disabled === true
  const refreshRefusedWhileBPending =
    getHandlers().__tetherOverviewActiveRefreshHandler?.() === false

  // Now resolve B (current active request)
  resolveB(overviewModel("degraded-reliability"))
  await settle()
  await new Promise((r) => setTimeout(r, 25))

  // Fresh current request B settles loading = false and DOM Refresh re-enabled
  const bSettledLoadingFalse =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === false
  const domRefreshEnabledAfterB = domRefreshBtn?.disabled === false

  // Explicitly acquire fresh callback after loading settles for fresh-positive recovery
  const freshRefreshAfterB = getHandlers().__tetherOverviewActiveRefreshHandler!
  const refreshRecoveredAfterB = freshRefreshAfterB() === true

  flushSync(() => dualRoot.unmount())
  dualElement.remove()

  return {
    positiveInitial,
    refusedWhileHidden,
    retainedRemainsRetired,
    freshRecovery,
    leaseAdvanced,
    competingDialogVeto,
    competingMenuVeto,
    competingListboxVeto,
    competingRemovedRecovery,
    dataClosedAdmitted,
    dataClosedAncestorAdmitted,
    hiddenAncestorAdmitted,
    displayNoneAncestorAdmitted,
    opacityZeroAncestorAdmitted,
    zeroRectDialogAdmitted,
    refusedAfterVariantChange,
    freshAfterVariantChange,
    initialPendingLoading,
    backgroundEventVetoed,
    settledLoadingTruthful,
    recoveredAfterOverlayRemoved,
    loadingAfterAStarted,
    retainedRefreshARefused,
    loadingAfterBStarted,
    domRefreshDisabledWhileBPending,
    bRemainsLoadingAfterAResolves,
    domRefreshStillDisabledWhileBPending,
    refreshRefusedWhileBPending,
    bSettledLoadingFalse,
    domRefreshEnabledAfterB,
    refreshRecoveredAfterB,
  }
}
