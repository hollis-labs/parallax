import { Activity, StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { AIGatewayPage, type AITabKey, type DetailView } from "../../src/tether-sysop/AIGatewayPage"
import type { AIProviderSettingsInfo, OverviewVariantKey } from "../../src/tether-sysop/model"

export async function aiLifecycleExercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)

  let setActivityMode: (mode: "visible" | "hidden") => void = () => {}
  let setVariantProp: (v: OverviewVariantKey) => void = () => {}
  let setTabProp: (tab: AITabKey) => void = () => {}

  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    const [variant, setVariant] = useState<OverviewVariantKey>("standard")
    const [tab, setTab] = useState<AITabKey>("config")

    setActivityMode = setMode
    setVariantProp = setVariant
    setTabProp = setTab

    return (
      <Activity mode={mode}>
        <AIGatewayPage
          variant={variant}
          tab={tab}
          onTabChange={setTab}
          onVariantChange={setVariant}
          showIdentityLinks={true}
          showVariantSelector={true}
        />
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
      __tetherAIActiveRefreshHandler?: () => boolean
      __tetherAIActiveVariantHandler?: (next: OverviewVariantKey) => boolean
      __tetherAIActiveTabHandler?: (next: AITabKey) => boolean
      __tetherAIActiveLoadHandler?: () => boolean
      __tetherAIActiveOpenDetail?: (view: DetailView) => boolean
      __tetherAIActiveOpenProvider?: () => boolean
      __tetherAIActiveOpenRoute?: () => boolean
      __tetherAIActiveSaveConfig?: () => boolean
      __tetherAIActiveReloadDaemon?: () => boolean
      __tetherAIActivationLease?: number
      __tetherAIActiveCloseDetail?: () => boolean
      __tetherAIActiveEditProvider?: (p: AIProviderSettingsInfo) => boolean
      __tetherAIActiveCloseProvider?: () => boolean
      __tetherAIActiveSaveProvider?: () => boolean
      __tetherAIActiveCloseRoute?: () => boolean
      __tetherAIActiveSaveRoute?: () => boolean
      __tetherAIDetailTicket?: number
      __tetherAIDetailEntityId?: string
      __tetherAIProviderTicket?: number
      __tetherAIProviderEntityId?: string
      __tetherAIRouteTicket?: number
      __tetherAIRouteEntityId?: string
    }
    return w
  }

  // 1. Current-positive activation on live frame
  const initialRefresh = getHandlers().__tetherAIActiveRefreshHandler
  const initialLoad = getHandlers().__tetherAIActiveLoadHandler
  const initialSaveConfig = getHandlers().__tetherAIActiveSaveConfig
  const initialReloadDaemon = getHandlers().__tetherAIActiveReloadDaemon
  const initialOpenProvider = getHandlers().__tetherAIActiveOpenProvider
  const initialOpenRoute = getHandlers().__tetherAIActiveOpenRoute
  const initialLease = getHandlers().__tetherAIActivationLease

  if (
    !initialRefresh ||
    !initialLoad ||
    !initialSaveConfig ||
    !initialReloadDaemon ||
    !initialOpenProvider ||
    !initialOpenRoute
  ) {
    throw new Error("Missing initial AI gateway active handlers")
  }

  const positiveInitial =
    initialRefresh() === true &&
    initialLoad() === true &&
    initialSaveConfig() === true &&
    initialReloadDaemon() === true
  await settle()

  // 2. Retained-old refusal when Activity mode="hidden"
  flushSync(() => setActivityMode("hidden"))
  await settle()
  const refusedWhileHidden =
    initialRefresh() === false &&
    initialLoad() === false &&
    initialSaveConfig() === false &&
    initialReloadDaemon() === false &&
    initialOpenProvider() === false &&
    initialOpenRoute() === false

  // 3. Reactivated mode="visible": old retained callbacks remain permanently retired
  flushSync(() => setActivityMode("visible"))
  await settle()
  const retainedRemainsRetired =
    initialRefresh() === false &&
    initialLoad() === false &&
    initialSaveConfig() === false &&
    initialReloadDaemon() === false &&
    initialOpenProvider() === false &&
    initialOpenRoute() === false

  // Fresh frame activation recovers cleanly
  const freshRefresh = getHandlers().__tetherAIActiveRefreshHandler
  const freshLoad = getHandlers().__tetherAIActiveLoadHandler
  if (!freshRefresh || !freshLoad) {
    throw new Error("Missing fresh handlers after Activity reactivate")
  }
  const freshLease = getHandlers().__tetherAIActivationLease
  const leaseAdvanced = (freshLease ?? 0) > (initialLease ?? 0)
  const freshRecovery = freshRefresh() === true && freshLoad() === true
  await settle()

  // 4. Competing overlay guards using real captured handlers
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

  // 4e. Dialog with [data-closed] marker admits
  const closedDialog = document.createElement("div")
  closedDialog.setAttribute("role", "dialog")
  closedDialog.setAttribute("data-closed", "")
  closedDialog.style.width = "200px"
  closedDialog.style.height = "100px"
  document.body.append(closedDialog)
  const dataClosedAdmitted = freshRefresh() === true
  await settle()
  closedDialog.remove()

  // 4f. Dialog with data-closed ancestor admits
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

  // 4g. Dialog with [hidden] ancestor admits
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

  // 4h. Dialog with display:none ancestor does not veto
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

  // 4i. Dialog with opacity:0 ancestor does not veto
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

  // 4j. Dialog with 0x0 geometry does not veto
  const zeroRectDialog = document.createElement("div")
  zeroRectDialog.setAttribute("role", "dialog")
  zeroRectDialog.style.width = "0px"
  zeroRectDialog.style.height = "0px"
  document.body.append(zeroRectDialog)
  const zeroRectDialogAdmitted = freshRefresh() === true
  await settle()
  zeroRectDialog.remove()

  // 5. Source replacement (variant change) retirement for open and load callbacks
  const heldRefreshBeforeVariantChange = getHandlers().__tetherAIActiveRefreshHandler
  const heldLoadBeforeVariantChange = getHandlers().__tetherAIActiveLoadHandler
  const heldOpenProviderBeforeVariantChange = getHandlers().__tetherAIActiveOpenProvider
  const heldSaveConfigBeforeVariantChange = getHandlers().__tetherAIActiveSaveConfig

  if (
    !heldRefreshBeforeVariantChange ||
    !heldLoadBeforeVariantChange ||
    !heldOpenProviderBeforeVariantChange ||
    !heldSaveConfigBeforeVariantChange
  ) {
    throw new Error("Missing pre-variant active handlers")
  }

  flushSync(() => setVariantProp("blocked-health"))
  await settle()

  const refusedAfterVariantChange =
    heldRefreshBeforeVariantChange() === false &&
    heldLoadBeforeVariantChange() === false &&
    heldOpenProviderBeforeVariantChange() === false &&
    heldSaveConfigBeforeVariantChange() === false

  const freshAfterVariantChange =
    getHandlers().__tetherAIActiveRefreshHandler?.() === true &&
    getHandlers().__tetherAIActiveLoadHandler?.() === true
  await settle()

  // 6. Monotonic ticket progression and entity separation across popup transitions
  flushSync(() => {
    setVariantProp("standard")
    setTabProp("providers")
  })
  await settle()

  // Open detail dialog (popupA)
  const openDetail = getHandlers().__tetherAIActiveOpenDetail
  if (!openDetail) throw new Error("Missing active openDetail handler")
  flushSync(() => {
    openDetail({
      kind: "provider",
      item: {
        id: "anthropic",
        type: "anthropic",
        enabled: true,
        model: "claude-3-7-sonnet",
        models: ["claude-3-7-sonnet"],
        default_model: "claude-3-7-sonnet",
        policy: {},
      },
    })
  })
  await settle()

  const ticketA = getHandlers().__tetherAIDetailTicket
  const entityA = getHandlers().__tetherAIDetailEntityId
  const heldDetailClose = getHandlers().__tetherAIActiveCloseDetail
  const heldDetailEdit = getHandlers().__tetherAIActiveEditProvider
  if (!heldDetailClose || !heldDetailEdit) {
    throw new Error("Missing detail popup handlers")
  }

  // Close popupA normally via active handler
  flushSync(() => {
    getHandlers().__tetherAIActiveCloseDetail?.()
  })
  await settle()

  // Open popupB (ProviderDialog "Add provider specimen")
  flushSync(() => {
    getHandlers().__tetherAIActiveOpenProvider?.()
  })
  await settle()

  const ticketB = getHandlers().__tetherAIProviderTicket
  const entityB = getHandlers().__tetherAIProviderEntityId
  const activeCloseProvider = getHandlers().__tetherAIActiveCloseProvider
  if (!activeCloseProvider) {
    throw new Error("Missing provider form close handler")
  }

  // Monotonic ticket check: ticketB must be strictly greater than ticketA
  const ticketBAdvanced = (ticketB ?? 0) > (ticketA ?? 0)
  const distinctEntities = entityA !== entityB

  // Crucial check: Invoke held popupA close callback while popupB is open
  // Must refuse because ticket and entity do not match popupB!
  const retainedCloseRefusedOnForeignPopup = heldDetailClose() === false
  const popupBRemainsOpenAfterRetainedClose =
    getHandlers().__tetherAIActiveCloseProvider !== undefined

  // Fresh positive: active close handler on popupB succeeds
  const freshPopupBCloseSucceeds = activeCloseProvider() === true
  await settle()
  const popupBClosedAfterFreshClose = getHandlers().__tetherAIActiveCloseProvider === undefined

  // Retained popupA callback still refuses when everything is closed
  const retainedCloseStillRefused = heldDetailClose() === false

  // Unmount fixture
  flushSync(() => root.unmount())
  element.remove()

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
    ticketBAdvanced,
    distinctEntities,
    retainedCloseRefusedOnForeignPopup,
    popupBRemainsOpenAfterRetainedClose,
    freshPopupBCloseSucceeds,
    popupBClosedAfterFreshClose,
    retainedCloseStillRefused,
  }
}
