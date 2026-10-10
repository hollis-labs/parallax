import {
  Button,
  InspectionDialog,
  JsonViewer,
  resolveAdmittedFocusTarget,
  useShiftShift,
  useShortcut,
} from "@hollis-labs/design-components"
import { BUILTIN_THEMES, getBuiltinTheme } from "@hollis-labs/design-tokens"
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import {
  defaults,
  type PanelId,
  type Preferences,
  type Scenario,
  scenarios,
} from "../../flux-rail/model"
import { Rail, RailHeader } from "../../flux-rail/Rail"
import { ChatExample } from "../chat/ChatExample"
import { chatPackModel, chatPackStates } from "../chat/model"
import { type CardState, cardStates, type ToolMode, toolModes } from "../flux-cards/model"
import { useAdmission } from "../flux-navigation/admission"
import { FluxHeader } from "../flux-navigation/Header"
import { type Preset, presets, type SessionRow, sessions } from "../flux-navigation/model"
import { FluxSidebar } from "../flux-navigation/Sidebar"
import { FluxConversation } from "./Conversation"
import { diagnostics, type FluxState, fluxState, sourceIdentity } from "./model"
import "../flux-navigation/navigation.css"
import "../flux-cards/flux-cards.css"
import "./flux-chat.css"

export function FluxChat({
  state: supplied,
  onChange,
}: {
  state?: FluxState
  onChange?: (next: FluxState) => void
}) {
  const [local, setLocal] = useState(() => supplied ?? fluxState())
  const state = onChange && supplied ? supplied : local
  const change = onChange ?? setLocal
  const [revision, setRevision] = useState(0)
  // The source key retires drafts and all held producers synchronously on source/access transitions.
  const source = JSON.stringify([
    sourceIdentity,
    state.chat.session,
    state.chat.appearance,
    state.card,
    state.tools,
    state.rail,
    state.theme,
    state.mode,
    revision,
  ])
  return (
    <FluxHost
      key={source}
      state={state}
      source={source}
      change={change}
      replace={() => setRevision((n) => n + 1)}
    />
  )
}
function FluxHost({
  state,
  source,
  change,
  replace,
}: {
  state: FluxState
  source: string
  change: (next: FluxState) => void
  replace: () => void
}) {
  const model = chatPackModel(state.chat.appearance)
  const row = sessions.find((item) => item.companion === state.chat.session)
  const accessible =
    model.accessible && model.sessions.some((item) => item.id === state.chat.session)
  const editable = accessible && model.editable
  const [left, setLeft] = useState(presets[state.layout].left as boolean)
  const [right, setRight] = useState(presets[state.layout].right as boolean)
  const [chips, setChips] = useState(presets[state.layout].chips as boolean)
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<string | null>(null)
  const [archived, setArchived] = useState(false)
  const [menu, setMenu] = useState(false)
  const [asideOpen, setAsideOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelId>("widgets")
  const [prefs, setPrefs] = useState<Preferences>(defaults)
  const [popup, setPopup] = useState<"search" | "palette" | "review" | "inspect" | "layout" | null>(
    null,
  )
  const [inspection, setInspection] = useState<{ label: string; value: unknown } | null>(null)
  const [filter, setFilter] = useState("")
  const [pending, setPending] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const origin = useRef<HTMLElement | null>(null)
  const popupRoot = useRef<HTMLDivElement>(null)
  const layoutRoot = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const railButton = useRef<HTMLButtonElement>(null)
  const popupSerial = useRef(0)
  const rootScope = useCallback(() => root.current, [])
  const layer = popup ?? (menu ? "menu" : asideOpen ? "aside" : "base")
  const frame = useAdmission(
    source,
    true,
    JSON.stringify([
      layer,
      popupSerial.current,
      state.layout,
      left,
      right,
      chips,
      query,
      scope,
      archived,
      activePanel,
      prefs,
    ]),
    rootScope,
  )
  const focusFrame = useAdmission(source, true, `focus:${state.layout}`, rootScope)
  const focusTicket = popupSerial.current
  const base = () => layer === "base" && !foreignLayer(root.current)
  const run = (job: () => void) => base() && frame.run(job)
  function open(kind: typeof popup, label?: string, value?: unknown) {
    return run(() => {
      origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      popupSerial.current++
      setPending(null)
      setFilter("")
      setInspection(label ? { label, value } : null)
      setPopup(kind)
    })
  }
  const inspect = (label: string, value: unknown) => {
    if (!accessible || popup || (layer !== "base" && layer !== "menu" && layer !== "aside"))
      return false
    if (layer === "base") return open("inspect", label, value)
    const foreground = document.activeElement
    if (!(foreground instanceof HTMLElement) || !visible(foreground)) return false
    const owner = foreground.closest('[data-flux-rail-source],.flux-context-menu,[role="menu"]')
    if (!owner) return false
    return frame.run(() => {
      origin.current = foreground
      popupSerial.current++
      setInspection({ label, value })
      setPopup("inspect")
    })
  }
  function finalFocus(): HTMLElement | false {
    let target: HTMLElement | false = false
    if (popupSerial.current !== focusTicket) return false
    focusFrame.run(() => {
      const current = document.activeElement
      if (
        current instanceof HTMLElement &&
        current !== document.body &&
        current !== origin.current &&
        !popupRoot.current?.contains(current) &&
        !layoutRoot.current?.contains(current) &&
        visible(current)
      )
        return
      const admitted = (item: HTMLElement) =>
        visible(item) &&
        (!!root.current?.contains(item) ||
          item.closest("[data-flux-rail-source]")?.getAttribute("data-flux-rail-source") === source)
      target =
        resolveAdmittedFocusTarget({
          trigger: origin.current,
          isAdmitted: admitted,
          fallbackTarget: root.current?.querySelector<HTMLElement>(".chat-example-header h1"),
          isFallbackAdmitted: admitted,
        }) ?? false
    })
    return target
  }
  function close() {
    frame.run(() => setPopup(null))
  }
  function select(target: SessionRow) {
    if (!accessible || !rows.some((item) => item.id === target.id)) return
    frame.run(() => {
      setPopup(null)
      change({
        ...state,
        welcome: false,
        chat: { ...state.chat, session: target.companion ?? target.id, appearance: "recorded" },
      })
    })
  }
  const rows = accessible
    ? sessions.filter(
        (item) =>
          (!scope || item.project === scope) &&
          (archived || item.activity !== "archived") &&
          `${item.title} ${item.id}`.toLowerCase().includes(query.toLowerCase()),
      )
    : []
  function preset(value: Preset) {
    if (!Object.hasOwn(presets, value)) return
    frame.run(() => {
      setLeft(presets[value].left)
      setRight(presets[value].right)
      setChips(presets[value].chips)
      setAsideOpen(false)
      change({ ...state, layout: value })
    })
  }
  const common = {
    scopeElement: rootScope,
    sourceGeneration: source,
    accessible,
    enabled: layer === "base",
    isAdmitted: () => base() && frame.run(() => {}),
  }
  const paletteShortcut = useShortcut({
    ...common,
    key: "k",
    modifiers: { mod: true },
    onTrigger: () => open("palette"),
  })
  useShortcut({ ...common, key: "\\", modifiers: { mod: true }, onTrigger: () => open("layout") })
  useShortcut({
    ...common,
    key: "b",
    modifiers: { mod: true },
    onTrigger: () => run(() => setLeft(!left)),
  })
  useShortcut({
    ...common,
    key: "h",
    modifiers: { mod: true, shift: true },
    onTrigger: () => run(() => setChips(!chips)),
  })
  useShortcut({
    ...common,
    key: "/",
    modifiers: { mod: true },
    onTrigger: () =>
      run(() => {
        setRight(!right)
        setAsideOpen(!asideOpen)
      }),
  })
  useShortcut({
    ...common,
    key: "l",
    modifiers: { mod: true },
    onTrigger: () =>
      run(() =>
        root.current
          ?.querySelector<HTMLTextAreaElement>("textarea[aria-label='Flux local draft']")
          ?.focus(),
      ),
  })
  useShortcut({
    ...common,
    key: "n",
    modifiers: { mod: true },
    accessible: editable,
    onTrigger: () => inspect("New chat specimen", { noSessionCreated: true }),
  })
  useShortcut({
    ...common,
    key: ".",
    modifiers: { mod: true },
    onTrigger: () =>
      run(() => {
        setActivePanel("artifacts")
        setRight(true)
        setAsideOpen(true)
      }),
  })
  useShortcut({
    ...common,
    key: "d",
    modifiers: { mod: true },
    onTrigger: () => inspect("Bookmark specimen", { noBookmarkSaved: true }),
  })
  useShortcut({
    ...common,
    key: "]",
    modifiers: { mod: true },
    onTrigger: () => {
      const index = rows.findIndex((item) => item.id === row?.id)
      if (index >= 0 && rows[index + 1]) select(rows[index + 1])
    },
  })
  useShortcut({
    ...common,
    key: "[",
    modifiers: { mod: true },
    onTrigger: () => {
      const index = rows.findIndex((item) => item.id === row?.id)
      if (index > 0) select(rows[index - 1])
    },
  })
  useShortcut({
    ...common,
    key: "Escape",
    allowInEditable: true,
    onTrigger: (event) => {
      const target = event.target
      if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
        if (target.getAttribute("aria-expanded") !== "true") run(() => root.current?.focus())
      }
    },
  })
  useShiftShift({
    ...common,
    thresholdMs: 250,
    getTime: () => performance.now(),
    onTrigger: () => open("search"),
  })
  useLayoutEffect(() => {
    diagnostics.frames.push({ source, run, focus: finalFocus, inspect })
  })
  useLayoutEffect(() => {
    const host = root.current
    if (!host) return
    // Scoped attributes and token variables flow to descendants; no document theme mutation.
    host.dataset.theme = state.theme
    host.dataset.mode = state.mode
  }, [state.theme, state.mode])
  const railScenario: Scenario = !accessible
    ? state.chat.appearance === "loading"
      ? "loading"
      : "unavailable"
    : state.chat.appearance === "empty"
      ? "known-empty"
      : state.rail
  const themeValues =
    getBuiltinTheme(state.theme)?.tokens[state.mode] ?? getBuiltinTheme(state.theme)?.tokens.dark
  const themeStyle = Object.fromEntries(
    Object.entries(themeValues ?? {}).map(([key, value]) => [`--color-${key}`, value]),
  ) as CSSProperties
  const railRun = (job: () => void) => {
    if (layer !== "aside") return run(job)
    const foreground = document.activeElement
    if (
      !(foreground instanceof HTMLElement) ||
      foreground.closest("[data-flux-rail-source]")?.getAttribute("data-flux-rail-source") !==
        source
    )
      return false
    return frame.run(job)
  }
  const configure = (next: FluxState) => {
    if (popup === "review" && popupRoot.current?.contains(document.activeElement))
      frame.run(() => change(next))
  }
  useLayoutEffect(() => {
    if (popup !== "layout") return
    const element = layoutRoot.current
    if (!element) return
    element.dataset.theme = state.theme
    element.dataset.mode = state.mode
    for (const [key, value] of Object.entries(themeStyle))
      element.style.setProperty(key, String(value))
  }, [popup, state.theme, state.mode, themeStyle])
  const results = rows.filter((item) =>
    `${item.title} ${item.id}`.toLowerCase().includes(filter.toLowerCase()),
  )
  const paletteCommands = [
    "Focus composer",
    "Search chats",
    "Toggle sidebar",
    "Toggle widgets",
    "Top drawer",
    "Bottom drawer",
    "Welcome screen",
  ].filter((name) => name.toLowerCase().includes(filter.toLowerCase()))
  function command(name: string) {
    frame.run(() => {
      setPopup(null)
      if (name === "Search chats") {
        popupSerial.current++
        setFilter("")
        setPopup("search")
        return
      }
      if (name === "Toggle sidebar") setLeft(!left)
      if (name === "Toggle widgets") {
        setRight(!right)
        setAsideOpen(true)
      }
      if (name === "Welcome screen") change({ ...state, welcome: true })
      if (["Top drawer", "Bottom drawer", "Focus composer"].includes(name)) setPending(name)
    })
  }
  useEffect(() => {
    if (!pending || layer !== "base") return
    let request = 0
    const selectedCommand = pending
    const settle = () => {
      // Wait for the native closing layer to release ownership. This lease is
      // cancelled on every committed source/layer/root change.
      if (!frame.run(() => {})) return
      const editor = root.current?.querySelector<HTMLTextAreaElement>(
        "textarea[aria-label='Flux local draft']",
      )
      if (popupRoot.current) {
        request = requestAnimationFrame(settle)
        return
      }
      setPending(null)
      if (foreignLayer(root.current) || (editor && !visible(editor))) return
      if (selectedCommand === "Focus composer") {
        popupSerial.current++
        root.current
          ?.querySelector<HTMLTextAreaElement>("textarea[aria-label='Flux local draft']")
          ?.focus()
      } else {
        root.current
          ?.querySelector<HTMLButtonElement>(
            `.flux-drawer-controls button:nth-child(${selectedCommand === "Top drawer" ? 1 : 2})`,
          )
          ?.click()
      }
    }
    request = requestAnimationFrame(settle)
    return () => cancelAnimationFrame(request)
  }, [pending, frame, layer])
  return (
    <div
      ref={root}
      className="flux-composed-host"
      data-theme={state.theme}
      data-mode={state.mode}
      style={themeStyle}
      data-source={source}
      tabIndex={-1}
    >
      <ChatExample
        state={state.chat}
        onChange={(chat) => change({ ...state, chat })}
        chrome={{
          compact: true,
          className: `flux-chat flux-composed ${left ? "" : "flux-left-hidden"}`,
          layout: state.layout,
          navigation: () => (
            <FluxSidebar
              rows={rows}
              selected={row?.id ?? ""}
              query={query}
              scope={scope}
              showArchived={archived}
              status={
                accessible
                  ? rows.length
                    ? "ready"
                    : "empty"
                  : state.chat.appearance === "denied"
                    ? "denied"
                    : state.chat.appearance === "loading"
                      ? "loading"
                      : "unavailable"
              }
              editable={editable}
              admitted={() => base() && frame.run(() => {})}
              onQuery={(value) => run(() => setQuery(value))}
              onScope={(value) => run(() => setScope(value))}
              onSelect={select}
              onArchiveVisibility={() => run(() => setArchived(!archived))}
              onIntent={(label, target) =>
                label === "Search chats"
                  ? open("search")
                  : inspect(`${label} · local specimen`, target)
              }
              onLayer={setMenu}
            />
          ),
          header: () => (
            <>
              <FluxHeader
                row={accessible ? row : undefined}
                chips={chips}
                editable={editable}
                onIntent={(label) => inspect(`${label} · local specimen`, row)}
                layout={state.layout}
                onLayout={preset}
                layoutOpen={popup === "layout"}
                onLayoutOpen={(value) => (value ? open("layout") : close())}
                popupRef={layoutRoot}
                finalFocus={finalFocus}
                onLayer={setMenu}
              />
              <Button
                size="sm"
                variant="ghost"
                aria-label="Search chats"
                disabled={!accessible}
                onClick={() => open("search")}
              >
                Search
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Command palette"
                disabled={!accessible}
                onClick={() => open("palette")}
              >
                Commands
              </Button>
              <Button
                ref={railButton}
                size="sm"
                variant="ghost"
                onClick={() =>
                  run(() => {
                    setRight(!right)
                    setAsideOpen(!asideOpen)
                  })
                }
              >
                Widgets
              </Button>
              <Button size="sm" variant="ghost" onClick={() => open("review")}>
                Review fixture
              </Button>
            </>
          ),
          conversation: () => (
            <FluxConversation
              key={`${source}:${state.welcome}`}
              source={source}
              state={state}
              layer={layer}
              generation={JSON.stringify([
                state.layout,
                left,
                right,
                chips,
                query,
                scope,
                archived,
              ])}
              inspect={inspect}
              launch={() => change({ ...state, welcome: false })}
            />
          ),
          aside: {
            aside: (
              <RailTheme theme={state.theme} mode={state.mode} style={themeStyle}>
                <Rail
                  source={source}
                  prefs={prefs}
                  active={activePanel}
                  scenario={railScenario}
                  collapse={(id, value) =>
                    railRun(() => setPrefs({ ...prefs, open: { ...prefs.open, [id]: value } }))
                  }
                  inspect={(kind, target) => {
                    if (layer === "base" || layer === "aside") {
                      origin.current = target
                      inspect(`${kind} inspection`, {
                        scenario: railScenario,
                        session: state.chat.session,
                      })
                    }
                  }}
                />
              </RailTheme>
            ),
            asideHeader: (
              <RailTheme theme={state.theme} mode={state.mode} style={themeStyle}>
                <RailHeader
                  source={source}
                  prefs={prefs}
                  active={activePanel}
                  select={(id) => railRun(() => setActivePanel(id))}
                  settings={() => inspect("Rail settings specimen", prefs)}
                  close={() =>
                    railRun(() => {
                      setRight(false)
                      setAsideOpen(false)
                    })
                  }
                />
              </RailTheme>
            ),
            asideLabel: "Flux right rail",
            asideTitle: "Flux right rail",
            asideDescription: "Fictional local widget specimens",
            asideWidth: "compact",
            asideCollapsed: !right,
            asideOverlayOpen: asideOpen,
            onAsideOverlayOpenChange: (value) => frame.run(() => setAsideOpen(value)),
            onAsideCollapsedChange: (value) => run(() => setRight(!value)),
            asideSourceGeneration: `${source}:${layer}`,
            asideTrigger: (
              <Button size="sm" variant="ghost">
                Open widgets
              </Button>
            ),
            asideFocusReturnTarget: () => railButton.current,
            asideFocusFallbackTarget: () =>
              root.current?.querySelector<HTMLElement>(".chat-example-header h1") ?? null,
            isAsideTriggerAdmitted: (target) => focusFrame.run(() => {}) && visible(target),
            isAsideFallbackAdmitted: (target) => focusFrame.run(() => {}) && visible(target),
          },
        }}
      />
      <InspectionDialog
        ref={popupRoot}
        data-theme={state.theme}
        data-mode={state.mode}
        style={themeStyle}
        open={!!popup && popup !== "layout"}
        onOpenChange={(value) => {
          if (!value) close()
        }}
        title={
          popup === "search"
            ? "Search chats"
            : popup === "palette"
              ? "Command palette"
              : popup === "review"
                ? "Flux fixture review"
                : (inspection?.label ?? "Local inspection")
        }
        meta="Local specimen · seed 4421 · no provider or delivery"
        initialFocus={popup === "search" || popup === "palette" ? searchInput : undefined}
        finalFocus={finalFocus}
        bodyProps={{ className: "flux-popup-body" }}
        footer={
          <Button onClick={close}>Close {popup === "inspect" ? "inspection" : "panel"}</Button>
        }
      >
        {(popup === "search" || popup === "palette") && (
          <>
            <label>
              Filter {popup}
              <input
                ref={searchInput}
                aria-label={popup === "search" ? "Search chat fixtures" : "Filter commands"}
                value={filter}
                onChange={(event) => frame.run(() => setFilter(event.target.value))}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return
                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    popupRoot.current
                      ?.querySelector<HTMLButtonElement>(".flux-search-results button")
                      ?.focus()
                  }
                  if (event.key === "Enter") {
                    event.preventDefault()
                    if (popup === "search" && results[0]) select(results[0])
                    else if (popup === "palette" && paletteCommands[0]) command(paletteCommands[0])
                  }
                }}
              />
            </label>
            <div
              className="flux-search-results"
              role="toolbar"
              aria-label="Filtered local results"
              onKeyDown={(event) => {
                if (
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229 ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.altKey ||
                  event.shiftKey
                )
                  return
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
                const controls = Array.from(
                  event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
                )
                const index = controls.indexOf(event.target as HTMLButtonElement)
                if (index < 0) return
                event.preventDefault()
                controls[
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? controls.length - 1
                      : (index + (event.key === "ArrowDown" ? 1 : -1) + controls.length) %
                        controls.length
                ]?.focus()
              }}
            >
              {popup === "search"
                ? results.map((item) => (
                    <Button key={item.id} variant="ghost" onClick={() => select(item)}>
                      {item.title}
                      <small>
                        {item.id} ·{" "}
                        {item.companion ? `Companion ${item.companion}` : "No transcript relation"}
                      </small>
                    </Button>
                  ))
                : paletteCommands.map((name) => (
                    <Button key={name} variant="ghost" onClick={() => command(name)}>
                      {name}
                    </Button>
                  ))}
              {!(popup === "search" ? results : paletteCommands).length && (
                <p>No matching local {popup === "search" ? "sessions" : "commands"}.</p>
              )}
            </div>
          </>
        )}
        {popup === "inspect" && (
          <>
            <p>Local inert candidate. Nothing sent, approved, rejected, retried or saved.</p>
            <JsonViewer value={inspection?.value} />
            <Button
              onClick={() => {
                if (popupRoot.current?.contains(document.activeElement))
                  frame.run(() => diagnostics.effects.push(source))
              }}
            >
              Inspect local intent
            </Button>
          </>
        )}
        {popup === "review" && (
          <>
            <label>
              Appearance
              <select
                aria-label="Flux appearance"
                value={state.chat.appearance}
                onChange={(e) =>
                  configure({
                    ...state,
                    chat: {
                      ...state.chat,
                      appearance: e.target.value as FluxState["chat"]["appearance"],
                    },
                  })
                }
              >
                {chatPackStates.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Card state
              <select
                aria-label="Composed card state"
                value={state.card}
                onChange={(e) => configure({ ...state, card: e.target.value as CardState })}
              >
                {cardStates.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Tool mode
              <select
                aria-label="Composed tool mode"
                value={state.tools}
                onChange={(e) => configure({ ...state, tools: e.target.value as ToolMode })}
              >
                {toolModes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Rail operands
              <select
                aria-label="Composed rail state"
                value={state.rail}
                onChange={(e) => configure({ ...state, rail: e.target.value as Scenario })}
              >
                {scenarios.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Theme
              <select
                aria-label="Composed theme"
                value={state.theme}
                onChange={(e) => configure({ ...state, theme: e.target.value })}
              >
                {BUILTIN_THEMES.map((value) => (
                  <option key={value.id} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mode
              <select
                aria-label="Composed mode"
                value={state.mode}
                onChange={(e) => configure({ ...state, mode: e.target.value as "light" | "dark" })}
              >
                <option>dark</option>
                <option>light</option>
              </select>
            </label>
            <Button onClick={() => frame.run(replace)}>Replace fixture source</Button>
            <Button onClick={() => configure({ ...state, welcome: !state.welcome })}>
              Toggle welcome screen
            </Button>
            <p>
              Owner visual approval pending. Fixed reference 2026-10-04T14:30:00Z. Layout only
              persists in drawer storage; no transport.
            </p>
          </>
        )}
      </InspectionDialog>
      <span className="sr-only" data-shortcut-live={paletteShortcut.isLive()}>
        Composed source {source}
      </span>
    </div>
  )
}
export function visible(target: HTMLElement) {
  return (
    target.isConnected &&
    !!target.getClientRects().length &&
    getComputedStyle(target).visibility !== "hidden" &&
    !target.closest('[inert],[aria-hidden="true"]')
  )
}
function foreignLayer(host: HTMLElement | null) {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"], [role="menu"]'),
  ).some((item) => item.hasAttribute("data-open") && visible(item) && !host?.contains(item))
}

function RailTheme({
  theme,
  mode,
  style,
  children,
}: {
  theme: string
  mode: string
  style: CSSProperties
  children: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    // This content mounts inside the AppShell portal after its native dialog
    // exists. Its own committed scope includes that dialog's header/body chrome.
    const dialog = root.current?.closest<HTMLElement>('[role="dialog"]')
    if (!dialog) return
    dialog.dataset.theme = theme
    dialog.dataset.mode = mode
    for (const [key, value] of Object.entries(style)) dialog.style.setProperty(key, String(value))
  }, [theme, mode, style])
  return (
    <div ref={root} data-theme={theme} data-mode={mode} style={{ ...style, display: "contents" }}>
      {children}
    </div>
  )
}
