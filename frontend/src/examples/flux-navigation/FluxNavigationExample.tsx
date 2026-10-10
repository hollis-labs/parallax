import { createMemoryStorage, type ScopedStorage } from "@hollis-labs/design-app-runtime"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  InspectionDialog,
  resolveAdmittedFocusTarget,
  useShortcut,
} from "@hollis-labs/design-components"
import { BUILTIN_THEMES, setMode, setTheme } from "@hollis-labs/design-tokens"
import { Activity, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChatExample, defaultChatState } from "../chat/ChatExample"
import type { ChatExampleState } from "../chat/routes"
import { navigationDiagnostics, useAdmission } from "./admission"
import { FluxHeader } from "./Header"
import {
  type LayoutPreference,
  layoutStorage,
  navigationIdentity,
  type Preset,
  presets,
  type SessionRow,
  sessions,
} from "./model"
import { FluxSidebar } from "./Sidebar"
import "./navigation.css"

export type NavigationFixture = "ready" | "empty" | "loading" | "unavailable" | "denied" | "locked"
export const fixtures: NavigationFixture[] = [
  "ready",
  "empty",
  "loading",
  "unavailable",
  "denied",
  "locked",
]
export function FluxNavigationExample({
  state: supplied = defaultChatState,
  onChange,
  storage: suppliedStorage,
  fixture: initialFixture = "ready",
}: {
  state?: ChatExampleState
  onChange?: (state: ChatExampleState) => void
  storage?: ScopedStorage<LayoutPreference>
  fixture?: NavigationFixture
}) {
  const [local, setLocal] = useState(supplied)
  const state = onChange ? supplied : local
  const change = onChange ?? setLocal
  const [storage] = useState(() => suppliedStorage ?? createMemoryStorage<LayoutPreference>())
  const [layout, setLayout] = useState<Preset>(() => storage.read()?.preset ?? "default")
  const [fixture, setFixture] = useState(initialFixture)
  const [selected, setSelected] = useState(
    sessions.find((row) => row.companion === state.session)?.id ?? sessions[0].id,
  )
  useLayoutEffect(() => {
    const companion =
      sessions.find((item) => item.id === selected)?.companion ?? "CHAT-AUTHORED-EMPTY"
    if (companion !== state.session) {
      setSelected(sessions.find((item) => item.companion === state.session)?.id ?? sessions[0].id)
    }
  }, [state.session, selected])
  const [scope, setScope] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [revision, setRevision] = useState(0)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [specimen, setSpecimen] = useState<{ action: string; row?: SessionRow } | null>(null)
  const [rename, setRename] = useState("")
  const [outcome, setOutcome] = useState("")
  const [theme, chooseTheme] = useState("nanite-default")
  const [mode, chooseMode] = useState<"light" | "dark">("dark")
  useEffect(() => {
    const documentRoot = document.documentElement,
      oldTheme = documentRoot.dataset.theme,
      oldMode = documentRoot.dataset.mode,
      wasLight = documentRoot.classList.contains("light")
    setTheme(theme)
    setMode(mode)
    return () => {
      if (oldTheme) documentRoot.dataset.theme = oldTheme
      else delete documentRoot.dataset.theme
      if (oldMode) documentRoot.dataset.mode = oldMode
      else delete documentRoot.dataset.mode
      documentRoot.classList.toggle("light", wasLight)
    }
  }, [theme, mode])
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const origin = useRef<HTMLElement | null>(null)
  const layoutPopup = useRef<HTMLDivElement>(null)
  const specimenPopup = useRef<HTMLDivElement>(null)
  const deletePopup = useRef<HTMLDivElement>(null)
  const scopeRoot = useCallback(() => root.current, [])
  const accessible =
    !["loading", "unavailable", "denied"].includes(fixture) &&
    !["loading", "error", "denied", "unknown"].includes(state.appearance)
  const editable = accessible && fixture !== "locked" && state.appearance !== "locked"
  const source = JSON.stringify([
    navigationIdentity,
    selected,
    scope,
    query,
    showArchived,
    fixture,
    revision,
    state.session,
    state.appearance,
  ])
  const focusOwner = specimen ?? (layoutOpen ? "layout" : menuOpen ? "menu" : null)
  const focusActivation = useRef<{ owner: typeof focusOwner; ticket: number }>({
    owner: null,
    ticket: 0,
  })
  if (focusActivation.current.owner !== focusOwner) {
    if (focusOwner !== null) focusActivation.current.ticket++
    focusActivation.current.owner = focusOwner
  }
  const focusTicket = focusActivation.current.ticket
  const focusAdmission = useAdmission(source, accessible, "focus return", scopeRoot)
  const frame = useAdmission(
    source,
    accessible,
    JSON.stringify([layoutOpen, menuOpen, specimen, rename, outcome, layout]),
    scopeRoot,
  )
  const admitted = () => frame.run(() => {})
  const row = sessions.find((item) => item.id === selected)
  const rows =
    accessible && fixture !== "empty"
      ? sessions.filter(
          (item) =>
            (!scope || item.project === scope) &&
            (showArchived || item.activity !== "archived") &&
            `${item.title} ${item.kind} ${item.activity}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
      : []
  function inspect(action: string, target = row) {
    frame.run(() => {
      if (!editable && action !== "Context inspection") return
      origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setRename(target?.title ?? "")
      setOutcome("")
      setSpecimen({ action, row: target })
    })
  }
  function returnFocus(closingPopup: HTMLElement | null): HTMLElement | false {
    let target: HTMLElement | false = false
    if (focusActivation.current.ticket !== focusTicket) return false
    focusAdmission.run(() => {
      const visible = (owner: HTMLElement) =>
        !!owner.getClientRects().length &&
        getComputedStyle(owner).visibility !== "hidden" &&
        !owner.closest("[inert], [aria-hidden=true]")
      const active = document.activeElement
      if (
        active instanceof HTMLElement &&
        active !== document.body &&
        active !== origin.current &&
        visible(active) &&
        !closingPopup?.contains(active)
      )
        return
      target =
        resolveAdmittedFocusTarget({
          trigger: origin.current,
          isAdmitted: visible,
          fallbackTarget: root.current?.querySelector<HTMLElement>(".chat-example-header h1"),
          isFallbackAdmitted: () => true,
        }) ?? false
    })
    return target
  }
  function applyPreset(preset: Preset) {
    frame.run(() => {
      if (!Object.hasOwn(presets, preset)) return
      storage.write({ version: 1, preset })
      setLayout(preset)
    })
  }
  const shortcut = useShortcut({
    key: "\\",
    modifiers: { mod: true },
    scopeElement: scopeRoot,
    sourceGeneration: source,
    accessible,
    enabled: !layoutOpen && !specimen && !menuOpen,
    isAdmitted: admitted,
    onTrigger: () =>
      frame.run(() => {
        origin.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        setLayoutOpen(true)
      }),
  })
  useShortcut({
    key: "n",
    modifiers: { mod: true },
    scopeElement: scopeRoot,
    sourceGeneration: source,
    accessible: editable,
    enabled: !layoutOpen && !specimen && !menuOpen,
    isAdmitted: admitted,
    onTrigger: () => inspect("New chat"),
  })
  useShortcut({
    key: "k",
    modifiers: { mod: true },
    scopeElement: scopeRoot,
    sourceGeneration: source,
    accessible,
    enabled: !layoutOpen && !specimen && !menuOpen,
    isAdmitted: admitted,
    onTrigger: () =>
      frame.run(() =>
        root.current
          ?.querySelector<HTMLInputElement>(
            ".chat-example-sidebar input[aria-label='Search chat sessions']",
          )
          ?.focus(),
      ),
  })
  useLayoutEffect(() => {
    navigationDiagnostics.handles.push({ run: (effect) => shortcut.trigger() && frame.run(effect) })
  }, [shortcut, frame])
  const appearance =
    fixture === "loading"
      ? "loading"
      : fixture === "unavailable"
        ? "error"
        : fixture === "denied"
          ? "denied"
          : fixture === "locked"
            ? "locked"
            : state.appearance
  function select(target: SessionRow) {
    frame.run(() => {
      if (!rows.some((item) => item.id === target.id)) return
      setSelected(target.id)
      setSpecimen(null)
      change({
        ...state,
        session: target.companion ?? "CHAT-AUTHORED-EMPTY",
        appearance: "recorded",
      })
    })
  }
  function configure(next: NavigationFixture) {
    setFixture(next)
    setSpecimen(null)
    setLayoutOpen(false)
    setMenuOpen(false)
    setOutcome("")
  }
  return (
    <div ref={root} className="flux-navigation-host">
      <div className="flux-review-bar">
        <label>
          Theme{" "}
          <select
            aria-label="Flux navigation theme"
            value={theme}
            onChange={(event) => chooseTheme(event.target.value)}
          >
            {BUILTIN_THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mode{" "}
          <select
            aria-label="Flux navigation mode"
            value={mode}
            onChange={(event) => chooseMode(event.target.value as "light" | "dark")}
          >
            <option>dark</option>
            <option>light</option>
          </select>
        </label>
        <span>Flux navigation candidate · local specimens</span>
        <label>
          Navigation fixture{" "}
          <select
            aria-label="Navigation fixture"
            value={fixture}
            onChange={(event) => configure(event.target.value as NavigationFixture)}
          >
            {fixtures.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRevision((value) => value + 1)
            setSpecimen(null)
            setLayoutOpen(false)
            setMenuOpen(false)
            setOutcome("")
          }}
        >
          Replace fixture source
        </Button>
      </div>
      <ChatExample
        key={`${selected}:${scope}:${revision}`}
        state={{ ...state, appearance }}
        onChange={change}
        chrome={{
          className: "flux-chat",
          layout,
          navigation: () => (
            <FluxSidebar
              key={`${scope}:${fixture}:${revision}`}
              rows={rows}
              selected={selected}
              query={query}
              scope={scope}
              showArchived={showArchived}
              status={
                !accessible
                  ? fixture === "denied" || state.appearance === "denied"
                    ? "denied"
                    : fixture === "loading" || state.appearance === "loading"
                      ? "loading"
                      : "unavailable"
                  : fixture === "empty"
                    ? "empty"
                    : "ready"
              }
              editable={editable}
              admitted={admitted}
              onQuery={(value) =>
                frame.run(() => {
                  setQuery(value)
                  setSpecimen(null)
                })
              }
              onScope={(value) =>
                frame.run(() => {
                  setScope(value)
                  setSpecimen(null)
                  setMenuOpen(false)
                })
              }
              onSelect={select}
              onArchiveVisibility={() => frame.run(() => setShowArchived((value) => !value))}
              onIntent={inspect}
              onLayer={(open) => frame.run(() => setMenuOpen(open))}
            />
          ),
          header: () => (
            <FluxHeader
              row={accessible ? row : undefined}
              chips={presets[layout].chips}
              editable={editable}
              onIntent={inspect}
              layout={layout}
              onLayout={applyPreset}
              layoutOpen={layoutOpen}
              onLayoutOpen={(open) =>
                frame.run(() => {
                  if (open)
                    origin.current =
                      document.activeElement instanceof HTMLElement ? document.activeElement : null
                  setLayoutOpen(open)
                })
              }
              finalFocus={() => returnFocus(layoutPopup.current)}
              popupRef={layoutPopup}
              onLayer={(open) => frame.run(() => setMenuOpen(open))}
            />
          ),
        }}
      />
      <InspectionDialog
        ref={specimenPopup}
        open={!!specimen && specimen.action !== "Delete"}
        onOpenChange={(open) => {
          if (!open) frame.run(() => setSpecimen(null))
        }}
        title={`${specimen?.action ?? "Action"} · local specimen`}
        meta={
          specimen?.row
            ? `${specimen.row.id} · ${specimen.row.companion ? `Explicit companion ${specimen.row.companion}` : "No supplied transcript relation"}`
            : navigationIdentity
        }
        initialFocus={specimen?.action === "Rename" ? input : undefined}
        finalFocus={() => returnFocus(specimenPopup.current)}
        bodyProps={{ className: "p-4 space-y-4" }}
        footer={<Button onClick={() => frame.run(() => setSpecimen(null))}>Close specimen</Button>}
      >
        <p>No provider, model, plugin or session action runs. Supplied records stay unchanged.</p>
        {specimen?.action === "Rename" && (
          <label className="block">
            Candidate title
            <input
              ref={input}
              aria-label="Candidate title"
              value={rename}
              onChange={(event) => frame.run(() => setRename(event.target.value))}
              className="mt-2 block w-full"
            />
          </label>
        )}
        <Button
          disabled={!editable || (specimen?.action === "Rename" && !rename.trim())}
          onClick={() =>
            frame.run(() => {
              if (!editable || !specimen || (specimen.action === "Rename" && !rename.trim())) return
              navigationDiagnostics.effects.push(`${source}:${specimen.action}`)
              setOutcome(
                `Inspected ${specimen.action}${specimen.action === "Rename" ? `: ${rename.trim()}` : ""}; local specimen only.`,
              )
            })
          }
        >
          Inspect intent
        </Button>
        <p role="status">{outcome || "No effect requested."}</p>
      </InspectionDialog>
      <AlertDialog
        open={specimen?.action === "Delete"}
        onOpenChange={(open) => {
          if (!open) frame.run(() => setSpecimen(null))
        }}
      >
        <AlertDialogContent ref={deletePopup} finalFocus={() => returnFocus(deletePopup.current)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat specimen?</AlertDialogTitle>
            <AlertDialogDescription>
              Fictional {specimen?.row?.title}. Confirm inspects an inert delete intent; no chat or
              messages are removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!editable}
              onClick={() =>
                frame.run(() => {
                  if (!editable || specimen?.action !== "Delete") return
                  navigationDiagnostics.effects.push(`${source}:Delete`)
                  setOutcome("Delete intent inspected; supplied session unchanged.")
                  setSpecimen({ action: "Delete intent inspected", row: specimen.row })
                })
              }
            >
              Inspect delete intent
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
export function StandaloneFluxNavigation({
  state,
  onChange,
}: {
  state: ChatExampleState
  onChange: (state: ChatExampleState) => void
}) {
  const [storage] = useState(layoutStorage)
  const candidate = <FluxNavigationExample state={state} onChange={onChange} storage={storage} />
  return new URLSearchParams(location.search).get("lifecycle") === "replay" ? (
    <NavigationLifecycle>{candidate}</NavigationLifecycle>
  ) : (
    candidate
  )
}
export function PortableFluxNavigation({ fixture = "ready" }: { fixture?: NavigationFixture }) {
  return <FluxNavigationExample fixture={fixture} />
}

export function NavigationLifecycle({ children }: { children: import("react").ReactNode }) {
  const [visible, setVisible] = useState(true)
  return (
    <>
      <Button onClick={() => setVisible((value) => !value)}>
        {visible ? "Hide candidate activation" : "Show candidate activation"}
      </Button>
      <Button>External foreground focus owner</Button>
      <Activity mode={visible ? "visible" : "hidden"}>{children}</Activity>
    </>
  )
}
