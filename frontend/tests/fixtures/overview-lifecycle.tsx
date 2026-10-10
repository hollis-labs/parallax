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
  document.body.append(competingDialog)
  const competingDialogVeto = freshRefresh() === false
  competingDialog.remove()

  // 4b. Visible competing menu vetoes
  const competingMenu = document.createElement("div")
  competingMenu.setAttribute("role", "menu")
  document.body.append(competingMenu)
  const competingMenuVeto = freshRefresh() === false
  competingMenu.remove()

  // 4c. Visible competing listbox vetoes
  const competingListbox = document.createElement("div")
  competingListbox.setAttribute("role", "listbox")
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
  document.body.append(closedDialog)
  const dataClosedAdmitted = freshRefresh() === true
  await settle()
  closedDialog.remove()

  // 4f. Dialog with data-closed ancestor admits (current positive)
  const closedAncestor = document.createElement("div")
  closedAncestor.setAttribute("data-closed", "")
  const nestedDialog = document.createElement("div")
  nestedDialog.setAttribute("role", "dialog")
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
  hiddenAncestor.append(hiddenNestedDialog)
  document.body.append(hiddenAncestor)
  const hiddenAncestorAdmitted = freshRefresh() === true
  await settle()
  hiddenAncestor.remove()

  // 5. Source replacement (variant change) retirement
  const heldBeforeVariantChange = getHandlers().__tetherOverviewActiveRefreshHandler!
  flushSync(() => setVariantProp("degraded"))
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

  const pendingHandlers = getHandlers()
  flushSync(() => {
    pendingHandlers.__tetherOverviewActiveRefreshHandler?.()
  })
  const initialPendingLoading =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === true

  // Insert competing overlay while request is in flight
  const inFlightOverlay = document.createElement("div")
  inFlightOverlay.setAttribute("role", "dialog")
  document.body.append(inFlightOverlay)

  // Verify background user action is vetoed while overlay is active
  const backgroundEventVetoed = pendingHandlers.__tetherOverviewActiveRefreshHandler?.() === false

  // Now resolve the in-flight request
  resolveDeferred(overviewModel("standard"))
  await settle()
  await new Promise((r) => setTimeout(r, 20))

  // Settled loading must be truthful (false) despite the presence of the overlay!
  const settledLoadingTruthful =
    (window as unknown as { __tetherOverviewLoading?: boolean }).__tetherOverviewLoading === false

  // Remove overlay
  inFlightOverlay.remove()
  const recoveredAfterOverlayRemoved =
    pendingHandlers.__tetherOverviewActiveRefreshHandler?.() === true

  flushSync(() => pendingRoot.unmount())
  pendingElement.remove()

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
    refusedAfterVariantChange,
    freshAfterVariantChange,
    initialPendingLoading,
    backgroundEventVetoed,
    settledLoadingTruthful,
    recoveredAfterOverlayRemoved,
  }
}
