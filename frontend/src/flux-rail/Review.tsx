import { Menu } from "@base-ui/react/menu"
import { Popover as BasePopover } from "@base-ui/react/popover"
import {
  AppShell,
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InspectionDialog,
  resolveAdmittedFocusTarget,
  useShortcut,
} from "@hollis-labs/design-components"
import {
  Context,
  ContextContentBody,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
} from "@hollis-labs/kit-chat"
import { type RefObject, useLayoutEffect, useRef, useState } from "react"
import { themes } from "../examples/ops-shell/model"
import {
  applySignal,
  costLabel,
  type FixtureSession,
  metric,
  operand,
  type PanelId,
  type PanelSignal,
  type Preferences,
  panels,
  readPreferences,
  reference,
  resolvePanel,
  type Scenario,
  type SignalState,
  scenarios,
  seed,
  sessions,
  type WidgetId,
  widgets,
  writePreferences,
} from "./model"
import { Rail, RailHeader } from "./Rail"
import { WidgetRow } from "./Widget"
export interface RailActions {
  source: string
  select: (id: PanelId) => boolean
  collapse: (id: WidgetId, open: boolean) => boolean
  signal: (signal: PanelSignal) => boolean
  inspect: (kind: "context" | "session", trigger: HTMLElement) => boolean
  shortcut: ReturnType<typeof useShortcut>
}
export const diagnostics: { frames: RailActions[]; admitted: string[] } = {
  frames: [],
  admitted: [],
}
export function FluxRailReview({
  initialScenario = "populated",
  initialSession = "fixture-session-1",
}: {
  initialScenario?: Scenario
  initialSession?: FixtureSession
}) {
  const [scenario, setScenario] = useState(initialScenario),
    [session, setSession] = useState(initialSession),
    [access, setAccess] = useState(true),
    [layer, setLayer] = useState(true),
    [epoch, setEpoch] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const controls = (
    <fieldset className="flex flex-wrap gap-3 p-4 text-xs" aria-label="Rail review controls">
      <label>
        Fixture session{" "}
        <select
          aria-label="Fixture session"
          className="bg-surface"
          value={session}
          onChange={(e) => setSession(e.target.value as FixtureSession)}
        >
          {sessions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Evidence state{" "}
        <select
          aria-label="Evidence state"
          className="bg-surface"
          value={scenario}
          onChange={(e) => setScenario(e.target.value as Scenario)}
        >
          {scenarios.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        <input type="checkbox" checked={access} onChange={(e) => setAccess(e.target.checked)} />{" "}
        Access admitted
      </label>
      <label>
        <input type="checkbox" checked={layer} onChange={(e) => setLayer(e.target.checked)} /> Layer
        active
      </label>
      <Button size="sm" variant="outline" onClick={() => setEpoch((n) => n + 1)}>
        Replace source
      </Button>
    </fieldset>
  )
  return (
    <ReviewFrame
      key={`${session}/${scenario}/${access}/${layer}/${epoch}`}
      session={session}
      scenario={scenario}
      access={access}
      layer={layer}
      source={`${session}/${scenario}/${access}/${layer}/${epoch}`}
      heading={heading}
      controls={controls}
    />
  )
}
function ReviewFrame({
  session,
  scenario,
  access,
  layer,
  source,
  heading,
  controls,
}: {
  session: FixtureSession
  scenario: Scenario
  access: boolean
  layer: boolean
  source: string
  heading: RefObject<HTMLHeadingElement | null>
  controls: React.ReactNode
}) {
  const [prefs, setPrefs] = useState(() => readPreferences(session))
  const [state, setState] = useState<SignalState>(() => ({
    active: prefs.defaultPanel,
    collapsed: false,
    dismissed: {},
    sources: {},
  }))
  const [overlay, setOverlay] = useState(false),
    [inspection, setInspection] = useState<"context" | "session" | "settings" | null>(null),
    [nested, setNested] = useState(false),
    [competing, setCompeting] = useState(false)
  const trigger = useRef<HTMLElement | null>(null),
    inspectTitle = useRef<HTMLHeadingElement>(null),
    desktopTrigger = useRef<HTMLButtonElement>(null),
    inspectionRoot = useRef<HTMLDivElement>(null)
  const admitted = () => shortcut.isLive() && access && layer && !competing && !nested
  const active = resolvePanel(prefs, state.active)
  const apply = (job: () => void) => {
    if (!admitted()) return false
    job()
    diagnostics.admitted.push(source)
    return true
  }
  const persist = (next: Preferences) => {
    setPrefs(next)
    writePreferences(session, next)
  }
  const select = (id: PanelId) =>
    !inspection &&
    prefs.enabled[id] &&
    apply(() => {
      setState((s) =>
        applySignal(
          {
            ...s,
            dismissed: { ...s.dismissed, ...(active && active !== id ? { [active]: true } : {}) },
          },
          prefs,
          { action: "open", panel_id: id, source: "user" },
        ),
      )
    })
  const collapse = (id: WidgetId, open: boolean) =>
    !inspection &&
    widgets.includes(id) &&
    apply(() => persist({ ...prefs, open: { ...prefs.open, [id]: open } }))
  const signal = (sig: PanelSignal) =>
    !inspection && !overlay && apply(() => setState((s) => applySignal(s, prefs, sig)))
  const inspect = (kind: "context" | "session" | "settings", target: HTMLElement) =>
    validTarget(target) &&
    !target.matches(":disabled") &&
    target.closest("[data-flux-rail-source]")?.getAttribute("data-flux-rail-source") === source &&
    apply(() => {
      trigger.current = target
      setInspection(kind)
    })
  const shortcut = useShortcut({
    key: "/",
    modifiers: { mod: true },
    enabled: access && layer,
    sourceGeneration: source,
    isAdmitted: () => access && layer,
    onTrigger: () => {
      setState((s) => ({ ...s, collapsed: !s.collapsed }))
      setOverlay((value) => !value)
    },
  })
  useLayoutEffect(() => {
    diagnostics.frames.push({
      source,
      select,
      collapse,
      signal,
      inspect: (kind, target) => inspect(kind, target),
      shortcut,
    })
  })
  const validTarget = (target: HTMLElement) =>
    access &&
    layer &&
    target.isConnected &&
    !target.closest('[hidden], [inert], [aria-hidden="true"]')
  const data = operand(scenario)
  const closeRail = () =>
    apply(() => {
      if (active)
        setState((s) =>
          applySignal(s, prefs, { action: "close", panel_id: active, source: "user" }),
        )
      setOverlay(false)
    })
  return (
    <AppShell
      header={
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-elevated px-4 py-3">
          <h1 ref={heading} tabIndex={-1} className="text-sm font-semibold">
            Flux right rail candidate
          </h1>
          <Button
            ref={desktopTrigger}
            size="sm"
            variant="outline"
            onClick={() =>
              apply(() => {
                setState((s) => ({ ...s, collapsed: !s.collapsed }))
                setOverlay(!overlay)
              })
            }
          >
            Toggle rail
          </Button>
        </header>
      }
      aside={
        access && layer ? (
          <Rail
            source={source}
            prefs={prefs}
            active={active}
            scenario={scenario}
            collapse={collapse}
            inspect={inspect}
          />
        ) : (
          <p className="p-3 text-sm">{access ? "Rail layer inactive" : "Rail access withheld"}</p>
        )
      }
      asideHeader={
        access && layer ? (
          <RailHeader
            source={source}
            prefs={prefs}
            active={active}
            select={select}
            settings={(target) => inspect("settings", target)}
            close={closeRail}
          />
        ) : undefined
      }
      asideLabel="Flux right rail"
      asideTitle="Flux right rail"
      asideDescription="Local fictional candidate panels"
      asideWidth="regular"
      asideCollapsed={state.collapsed}
      onAsideCollapsedChange={(value) => apply(() => setState((s) => ({ ...s, collapsed: value })))}
      asideOverlayOpen={overlay}
      onAsideOverlayOpenChange={(value) => apply(() => setOverlay(value))}
      asideTrigger={
        <Button size="sm" variant="outline" aria-label="Open Flux right rail">
          Open rail
        </Button>
      }
      asideSourceGeneration={source}
      asideFocusReturnTarget={() => desktopTrigger.current}
      asideFocusFallbackTarget={() => heading.current}
      isAsideTriggerAdmitted={validTarget}
      isAsideFallbackAdmitted={validTarget}
    >
      <section className="min-h-0 flex-1 overflow-y-auto p-4" aria-label="Rail candidate review">
        <p className="text-sm text-fg-secondary">
          Fictional local inspection. Seed {seed} · {reference}. Owner visual approval pending.
        </p>
        {controls}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => signal({ action: "open", panel_id: "work" })}
          >
            panel_signal open Plan · local specimen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => signal({ action: "close", panel_id: "work" })}
          >
            panel_signal close Plan · local specimen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => signal({ action: "mode", mode: "planning" })}
          >
            panel_signal planning · local specimen
          </Button>
          <Button size="sm" variant="outline" onClick={() => apply(() => setCompeting(true))}>
            Open competing review
          </Button>
        </div>
        <p className="py-3 text-xs text-fg-muted">
          Mod+/ toggles the desktop rail when the current source, access, layer and focus permit it.
        </p>
        <nav className="flex flex-wrap gap-3 text-xs" aria-label="Existing examples">
          <a href="/?example=chat" className="underline">
            Chat
          </a>
          <a href="/?example=messaging" className="underline">
            Messaging
          </a>
          <a href="/?example=ops-shell" className="underline">
            Operations
          </a>
          <a href="/?example=drawers" className="underline">
            Drawers
          </a>
        </nav>
        <p className="mt-4 rounded-panel border border-border bg-surface p-3 text-sm">
          The candidate is isolated from the existing applications. Send, stop, resume and approve
          are inert fixture specimens.
        </p>
        <p className="text-xs text-fg-muted" data-testid="rail-source">
          {source}
        </p>
      </section>
      <InspectionDialog
        open={inspection !== null}
        onOpenChange={(open) => {
          if (!open)
            apply(() => {
              setInspection(null)
              setNested(false)
            })
        }}
        title={
          inspection === "settings"
            ? "Rail settings"
            : inspection === "context"
              ? "Context inspection"
              : "Session details"
        }
        ref={inspectionRoot}
        titleProps={{ ref: inspectTitle, tabIndex: -1 }}
        initialFocus={() => inspectTitle.current}
        finalFocus={() =>
          resolveAdmittedFocusTarget({
            trigger: () => trigger.current,
            isAdmitted: validTarget,
            fallbackTarget: () => heading.current,
            isFallbackAdmitted: validTarget,
          }) ?? false
        }
        meta="Fictional local specimen · no provider"
        bodyProps={{ "aria-label": "Rail inspection body", tabIndex: 0 }}
        footer={
          <div className="flex flex-wrap items-center gap-2 p-3">
            <Button size="sm" variant="outline" onClick={() => apply(() => setInspection(null))}>
              Close inspection
            </Button>
            <span className="text-xs text-fg-muted">Layout preferences only are persisted.</span>
          </div>
        }
      >
        <div className="space-y-3 p-4 [overflow-wrap:anywhere]">
          {inspection === "settings" ? (
            <>
              <label className="block text-xs">
                Default panel{" "}
                <select
                  aria-label="Default panel"
                  className="bg-surface"
                  value={prefs.defaultPanel}
                  onChange={(e) =>
                    apply(() => persist({ ...prefs, defaultPanel: e.target.value as PanelId }))
                  }
                >
                  {panels.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              {prefs.order.map((id, index) => (
                <div
                  key={id}
                  className="flex flex-wrap items-center gap-2 rounded-control border border-border p-2 text-xs"
                >
                  <label className="flex-1">
                    <input
                      type="checkbox"
                      checked={prefs.enabled[id]}
                      onChange={(e) =>
                        apply(() =>
                          persist({
                            ...prefs,
                            enabled: { ...prefs.enabled, [id]: e.target.checked },
                          }),
                        )
                      }
                      aria-label={`Enable ${panels.find((p) => p.id === id)?.label}`}
                    />{" "}
                    {panels.find((p) => p.id === id)?.label}
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                    aria-label={`Move ${id} up`}
                    onClick={() =>
                      apply(() => {
                        const order = [...prefs.order]
                        ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
                        persist({ ...prefs, order })
                      })
                    }
                  >
                    Up
                  </Button>
                </div>
              ))}
              <p className="text-xs text-fg-muted">
                Plugin panel is disabled by default. Local enabled/order/default specimens; no
                settings endpoint.
              </p>
            </>
          ) : inspection === "context" ? (
            <>
              <WidgetRow label="Context window">
                {metric(data.total)} / {metric(data.ceiling)}
              </WidgetRow>
              <WidgetRow label="Input">{metric(data.input)}</WidgetRow>
              <WidgetRow label="Output">{metric(data.output)}</WidgetRow>
              <WidgetRow label="Estimated cost">{costLabel(data.cost)}</WidgetRow>
              {data.total !== null &&
                data.ceiling !== null &&
                data.input !== null &&
                data.output !== null &&
                data.cost !== null && (
                  <Context
                    usedTokens={data.total}
                    maxTokens={data.ceiling}
                    usage={{ inputTokens: data.input, outputTokens: data.output }}
                    cost={{ totalUSD: data.cost }}
                  >
                    <ContextTrigger>Usage breakdown</ContextTrigger>
                    <BasePopover.Portal container={inspectionRoot}>
                      <BasePopover.Positioner className="z-70" side="bottom" align="start">
                        <BasePopover.Popup className="min-w-60 rounded-panel border border-border bg-popover text-popover-foreground">
                          <ContextContentHeader>Fictional usage</ContextContentHeader>
                          <ContextContentBody>
                            <ContextInputUsage />
                            <ContextOutputUsage />
                          </ContextContentBody>
                        </BasePopover.Popup>
                      </BasePopover.Positioner>
                    </BasePopover.Portal>
                  </Context>
                )}
              <p className="text-xs text-fg-muted">
                System prompt, tool breakdown and cache fields are unknown; no invented allocation.
              </p>
            </>
          ) : (
            <>
              <WidgetRow label="Session">{session}</WidgetRow>
              <WidgetRow label="Title">{data.name}</WidgetRow>
              <WidgetRow label="Provider / model">{data.model ?? "Unknown"}</WidgetRow>
              <WidgetRow label="Boot source">Unknown</WidgetRow>
              <WidgetRow label="Persona">Fictional agent</WidgetRow>
              <WidgetRow label="Runtime">Unavailable</WidgetRow>
              <WidgetRow label="Durable agent">Unknown</WidgetRow>
              <WidgetRow label="Checkpoint">Unknown</WidgetRow>
              <WidgetRow label="Tokens">{metric(data.total)}</WidgetRow>
              <Button size="sm" disabled>
                Restart · inert fixture
              </Button>
              <Button size="sm" disabled>
                Approve · inert fixture
              </Button>
            </>
          )}
          {inspection !== "settings" && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
                Inspection menu
              </DropdownMenuTrigger>
              <Menu.Portal container={inspectionRoot}>
                <Menu.Positioner className="z-70" side="bottom" align="start">
                  <Menu.Popup className="rounded-control border border-border bg-popover p-1 text-popover-foreground">
                    <DropdownMenuItem onClick={() => apply(() => setNested(true))}>
                      Open nested source note
                    </DropdownMenuItem>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </DropdownMenu>
          )}
          <InspectionDialog
            open={nested}
            onOpenChange={setNested}
            title="Nested source note"
            footer={<Button onClick={() => setNested(false)}>Close source note</Button>}
          >
            <div className="p-4 text-sm">
              Read-only fictional operand. No wire, record or delivery claim.
            </div>
          </InspectionDialog>
        </div>
      </InspectionDialog>
      <InspectionDialog open={competing} onOpenChange={setCompeting} title="Competing review layer">
        <div className="p-4">
          <label>
            Competing editor
            <input aria-label="Competing editor" className="border border-border bg-surface" />
          </label>
        </div>
      </InspectionDialog>
    </AppShell>
  )
}
export function StandaloneFluxRailReview() {
  const params = new URLSearchParams(location.search)
  const theme = themes.find((t) => t === params.get("theme")) ?? "nanite-default"
  const mode = params.get("mode") === "light" ? "light" : "dark"
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = mode
    Object.assign(window, { fluxRail: diagnostics })
  }, [theme, mode])
  return <FluxRailReview initialScenario={scenarios.find((s) => s === params.get("scenario"))} />
}
