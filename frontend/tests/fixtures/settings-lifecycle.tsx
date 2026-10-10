import { Activity, StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { FluxSettingsShell } from "../../src/examples/flux-settings/FluxSettingsShell"

function currentDiagnostics() {
  const diag = (window as unknown as { fluxSettings?: any }).fluxSettings
  if (!diag) throw new Error("No fluxSettings diagnostics published on window")
  return diag
}

function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("Missing native fixture operand")
  return value
}

function keyboardHandler(element: Element) {
  const key = required(Object.keys(element).find((k) => k.startsWith("__reactProps$")))
  return required((element as unknown as Record<string, { onKeyDown: (e: object) => void }>)[key])
    .onKeyDown
}

export async function settingsLifecycleExercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)

  let setActivityMode: (mode: "visible" | "hidden") => void = () => {}
  let setSourceProp: (src: string) => void = () => {}
  let setAccessProp: (acc: boolean) => void = () => {}

  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    const [source, setSource] = useState("fixture-source-0")
    const [access, setAccess] = useState(true)

    setActivityMode = setMode
    setSourceProp = setSource
    setAccessProp = setAccess

    return (
      <Activity mode={mode}>
        <FluxSettingsShell source={source} access={access} />
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

  // 1. Current-positive activation on live frame
  const initialFrame = currentDiagnostics().currentFrame
  const heldActivate = initialFrame.activateSection
  const positiveInitial = heldActivate("permissions") === true

  // 2. Retained-old refusal when Activity mode="hidden"
  flushSync(() => setActivityMode("hidden"))
  await settle()
  const refusedWhileHidden = heldActivate("appearance") === false

  // 3. Reactivated mode="visible": old retained callback remains retired
  flushSync(() => setActivityMode("visible"))
  await settle()
  const retainedRemainsRetired = heldActivate("layout") === false
  // Fresh frame activation recovers cleanly
  const freshFrame = currentDiagnostics().currentFrame
  const freshRecovery = freshFrame.activateSection("layout") === true

  // 4. Source replacement retirement
  const frameBeforeReplace = currentDiagnostics().currentFrame
  const heldBeforeReplace = frameBeforeReplace.activateSection
  flushSync(() => setSourceProp("fixture-source-1"))
  await settle()
  const refusedAfterSourceReplace = heldBeforeReplace("shortcuts") === false
  const freshAfterSourceReplace =
    currentDiagnostics().currentFrame.activateSection("shortcuts") === true

  // 5. Access denial retirement
  const frameBeforeAccessDeny = currentDiagnostics().currentFrame
  const heldBeforeAccessDeny = frameBeforeAccessDeny.activateSection
  flushSync(() => setAccessProp(false))
  await settle()
  const refusedWhenAccessDenied = heldBeforeAccessDeny("permissions") === false

  // 6. Sidebar roving navigation keyboard handler guards
  flushSync(() => setAccessProp(true))
  await settle()

  const navButton = required(element.querySelector('button[role="tab"]'))
  const onKeyDown = keyboardHandler(navButton)

  let prevented = false
  const createKeyEvent = (overrides: Partial<any> = {}) => ({
    key: "ArrowDown",
    nativeEvent: { isComposing: false },
    currentTarget: navButton,
    target: navButton,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => {
      prevented = true
    },
    stopPropagation: () => {},
    ...overrides,
  })

  // Guard test: IME composition ignores and does not consume
  prevented = false
  flushSync(() => onKeyDown(createKeyEvent({ nativeEvent: { isComposing: true } })))
  const imeIgnored = !prevented

  // Guard test: Modifier keys (Ctrl) ignore and do not consume
  prevented = false
  flushSync(() => onKeyDown(createKeyEvent({ ctrlKey: true })))
  const modifierIgnored = !prevented

  // Guard test: When access=false, ignores and does not consume
  flushSync(() => setAccessProp(false))
  await settle()
  prevented = false
  flushSync(() => onKeyDown(createKeyEvent()))
  const accessDeniedIgnored = !prevented

  // Guard test: Competing popup in document refutes liveness and ignores roving
  flushSync(() => setAccessProp(true))
  await settle()
  const currentNavButton = required(element.querySelector('button[role="tab"]'))
  const currentOnKeyDown = keyboardHandler(currentNavButton)
  const createCurrentKeyEvent = (overrides: Partial<any> = {}) => ({
    key: "ArrowDown",
    nativeEvent: { isComposing: false },
    currentTarget: currentNavButton,
    target: currentNavButton,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => {
      prevented = true
    },
    stopPropagation: () => {},
    ...overrides,
  })

  const competingPopup = document.createElement("div")
  competingPopup.setAttribute("role", "dialog")
  document.body.append(competingPopup)
  prevented = false
  flushSync(() => currentOnKeyDown(createCurrentKeyEvent()))
  const competingPopupIgnored = !prevented
  competingPopup.remove()

  // Guard test: Fresh recovery after competing popup removal
  prevented = false
  flushSync(() => currentOnKeyDown(createCurrentKeyEvent()))
  const competingPopupRecovered = prevented

  // Guard test: Retained roving handler refuses after source replacement
  const heldRoving = currentOnKeyDown
  flushSync(() => setSourceProp("fixture-source-2"))
  await settle()
  prevented = false
  flushSync(() => heldRoving(createCurrentKeyEvent()))
  const retainedRovingRetired = !prevented

  // Guard test: Root detachment / target outside nav root
  const freshOnKeyDown = keyboardHandler(required(element.querySelector('button[role="tab"]')))
  prevented = false
  flushSync(() =>
    freshOnKeyDown(createKeyEvent({ currentTarget: document.body, target: document.body })),
  )
  const rootDetachedIgnored = !prevented

  // Cleanup
  flushSync(() => root.unmount())
  element.remove()

  return {
    positiveInitial,
    refusedWhileHidden,
    retainedRemainsRetired,
    freshRecovery,
    refusedAfterSourceReplace,
    freshAfterSourceReplace,
    refusedWhenAccessDenied,
    imeIgnored,
    modifierIgnored,
    accessDeniedIgnored,
    competingPopupIgnored,
    competingPopupRecovered,
    retainedRovingRetired,
    rootDetachedIgnored,
  }
}
