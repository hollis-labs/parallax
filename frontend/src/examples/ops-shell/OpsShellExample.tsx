import {
  createAppShellAsideStore,
  createMemoryStorage,
  useAppShellAside,
} from "@hollis-labs/design-app-runtime"
import {
  AppShell,
  Button,
  type ColumnDef,
  InspectionDialog,
  OverlaySidebar,
} from "@hollis-labs/design-components"
import { ChatInput, ChatStream } from "@hollis-labs/kit-chat"
import { type OperationsActionScope, OperationsListPage } from "@hollis-labs/kit-dashboard/layout"
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { type OperationsModel, runDetail } from "../../operations/model"
import { RunDetailBody } from "../../operations/Views"
import {
  explorerProjection,
  type RunRow,
  type UsageFilter,
  usageFilters,
} from "../../run-explorer/model"
import { appearances, messages, reference, shellModel } from "./model"

export interface OpsShellDiagnostics {
  scopes: OperationsActionScope[]
  actions: string[]
  asideHandles: ReturnType<typeof useAppShellAside>[]
  replace?: () => void
  access?: () => void
  layer?: () => void
  remount?: () => void
  drafts: ((value: string) => void)[]
  openCompeting?: () => void
  resizeBoundary?: (boundary: "source" | "access" | "layer" | "competing" | "closed") => void
}
export const diagnostics: OpsShellDiagnostics = {
  scopes: [],
  actions: [],
  asideHandles: [],
  drafts: [],
}
function Evidence({
  row,
  model,
  scope,
}: {
  row: RunRow
  model: OperationsModel
  scope: OperationsActionScope
}) {
  const [intent, setIntent] = useState(""),
    [nested, setNested] = useState(false)
  useLayoutEffect(() => {
    diagnostics.scopes.push(scope)
  }, [scope])
  const detail = runDetail(model, row.id)
  return (
    <div className="space-y-4 p-4 [overflow-wrap:anywhere]">
      <p>Supplied fictional run evidence. Local inspection only.</p>
      <label className="block">
        Local evidence note
        <textarea
          className="block w-full border border-border bg-bg p-2"
          aria-label="Local evidence note"
        />
      </label>
      <Button
        onClick={() =>
          scope.run(() => {
            diagnostics.actions.push(row.id)
            setIntent(`Inspected ${row.id}; records unchanged.`)
          })
        }
      >
        Inspect current evidence
      </Button>
      <Button onClick={() => scope.run(() => setNested(true))}>Open nested evidence</Button>
      <InspectionDialog
        open={nested}
        onOpenChange={setNested}
        title="Nested evidence"
        footer={<Button onClick={() => setNested(false)}>Finish nested inspection</Button>}
      >
        <div className="p-4">
          <label>
            Nested evidence editor
            <input aria-label="Nested evidence editor" />
          </label>
        </div>
      </InspectionDialog>
      <p role="status">{intent}</p>
      {detail && (
        <RunDetailBody
          detail={detail}
          onIntent={(action, id) =>
            scope.run(() => setIntent(`${action} → ${id}. Local candidate only; no mutation.`))
          }
        />
      )}
    </div>
  )
}
/** Generic Run Explorer projection/facets, composed with the public operations template. */
function RunList({
  scenario,
  epoch,
  accessible,
  active,
  mode,
  fallback,
  density,
  onDensity,
}: {
  scenario: string
  epoch: number
  accessible: boolean
  active: boolean
  mode: "inline" | "modal"
  density: "compact" | "comfortable"
  onDensity: (value: "compact" | "comfortable") => void
  fallback: React.RefObject<HTMLElement | null>
}) {
  const model = useMemo(() => shellModel(scenario), [scenario])
  const [query, setQuery] = useState(""),
    [statuses, setStatuses] = useState<readonly string[]>([]),
    [owner, setOwner] = useState<string | null>(null),
    [usage, setUsage] = useState<UsageFilter>("all")
  const [checked, setChecked] = useState<string[]>([]),
    [opened, setOpened] = useState<string | null>(null)
  const projection = useMemo(
    () => explorerProjection(model, query, statuses, owner, usage),
    [model, query, statuses, owner, usage],
  )
  const owners = useMemo(
    () =>
      explorerProjection(model, query, statuses, null, usage).owners.map((o) => ({
        ...o,
        count: explorerProjection(model, query, statuses, o.id, usage).matches.length,
      })),
    [model, query, statuses, usage],
  )
  const statusOptions = useMemo(
    () =>
      [...new Set(projection.admitted.map((r) => r.run.status))].map((value) => ({
        value,
        label: value,
        count: explorerProjection(model, query, [value], owner, usage).matches.length,
      })),
    [model, query, owner, usage, projection.admitted],
  )
  const columns: ColumnDef<RunRow>[] = [
    {
      key: "utc",
      header: "Run evidence · newest first",
      width: "fill",
      cell: (r) => (
        <span className="block min-w-0 whitespace-normal [overflow-wrap:anywhere]">
          {r.task.title}
          <small className="block">
            {r.id} · {r.run.status} · {r.task.owner ?? "Unspecified"}
          </small>
          <small className="block">
            {r.tokens === null ? "No receipt" : `${r.tokens} recorded tokens`} · {r.run.started}
          </small>
        </span>
      ),
      sortValue: (r) => r.run.started,
    },
  ]
  return (
    <OperationsListPage
      title="Run Explorer"
      admittedItems={projection.admitted}
      matchedItems={projection.matches}
      sourceGeneration={`${projection.source}/${epoch}/${accessible}/${mode}`}
      accessible={accessible && model.accessible}
      active={active}
      searchQuery={query}
      onSearchChange={setQuery}
      searchAriaLabel="Search admitted runs"
      columns={columns}
      getRowId={(r) => r.id}
      rowAriaLabel={(r) => `Inspect ${r.run.id}`}
      selectedIds={checked}
      onSelectionChange={setChecked}
      selectable
      pageSize={50}
      initialSort={{ key: "utc", dir: "desc" }}
      density={density}
      filterActions={
        <label className="hidden md:block">
          Density{" "}
          <select
            aria-label="Row density"
            value={density}
            onChange={(e) =>
              onDensity(e.target.value === "comfortable" ? "comfortable" : "compact")
            }
          >
            <option>compact</option>
            <option>comfortable</option>
          </select>
        </label>
      }
      facets={[
        {
          id: "status",
          kind: "chips",
          label: "Run status",
          options: statusOptions,
          value: statuses,
          onChange: setStatuses,
        },
        {
          id: "usage",
          kind: "cycle",
          label: "Usage evidence",
          options: usageFilters.map((value) => ({ value, label: value })) as [
            { value: string; label: string },
            ...{ value: string; label: string }[],
          ],
          value: usage,
          onChange: (value) => setUsage(value as UsageFilter),
        },
        {
          id: "owner",
          kind: "entity",
          label: "Run owner",
          allLabel: "All owners",
          options: owners,
          value: owner,
          onChange: setOwner,
        },
      ]}
      onClear={() => {
        setQuery("")
        setStatuses([])
        setOwner(null)
        setUsage("all")
      }}
      loading={model.resource === "loading"}
      errorState={
        !accessible || ["error", "permission-denied", "unavailable"].includes(model.resource) ? (
          <p role="alert">Evidence unavailable; counts withheld.</p>
        ) : undefined
      }
      emptyState={<p>No matching admitted runs</p>}
      inspector={{
        mode,
        selectedId: opened,
        onSelect: setOpened,
        boundaryPolicy: "stop",
        fallbackFocus: fallback,
        title: (r) => `Run ${r.run.id}`,
        meta: (r) => `${r.id} · ${r.evidence}`,
        renderBody: (r, scope) => (
          <Evidence key={`${epoch}/${r.id}`} row={r} model={model} scope={scope} />
        ),
        footer: (r) => (
          <p className="p-2 [overflow-wrap:anywhere]">
            {r.tokens === null ? "No receipt" : `${r.tokens} recorded tokens`} · {reference}
          </p>
        ),
      }}
      footer={
        <p className="hidden px-4 text-caption md:block">
          Seed 4421 · {reference} · fictional bounded records · no transport
        </p>
      }
    />
  )
}
function OpsShellFrame({
  initialScenario = "populated",
  initialMode = "inline",
  asideContent = "fixture-chat",
  portable = false,
}: {
  initialScenario?: string
  initialMode?: "inline" | "modal"
  asideContent?: "absent" | "empty" | "fixture-chat"
  portable?: boolean
}) {
  const [scenario, setScenario] = useState(initialScenario),
    [mode, setMode] = useState(initialMode),
    [epoch, setEpoch] = useState(0),
    [access, setAccess] = useState(true),
    [layer, setLayer] = useState(true),
    [draft, setDraft] = useState(""),
    [candidate, setCandidate] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)
  const [forceDesktop, setForceDesktop] = useState(false)
  const [competing, setCompeting] = useState(false)
  const [density, setDensity] = useState<"compact" | "comfortable">("compact")
  const heading = useRef<HTMLHeadingElement>(null)
  const [store] = useState(() =>
    createAppShellAsideStore({
      appNamespace: "parallax-example",
      defaultCollapsed: asideContent === "empty",
      storage: portable ? createMemoryStorage() : undefined,
    }),
  )
  const lifetime = useRef({ alive: false, epoch: 0, frame: {} })
  const [effectEpoch, setEffectEpoch] = useState(0)
  const frame = useMemo(
    () => ({
      epoch,
      access,
      layer,
      scenario,
      mode,
      reviewOpen,
      competing,
      draft,
      candidate,
      effectEpoch,
    }),
    [epoch, access, layer, scenario, mode, reviewOpen, competing, draft, candidate, effectEpoch],
  )
  useLayoutEffect(() => {
    lifetime.current.alive = true
    lifetime.current.epoch++
    setEffectEpoch(lifetime.current.epoch)
    return () => {
      lifetime.current.alive = false
      lifetime.current.epoch++
    }
  }, [])
  useLayoutEffect(() => {
    lifetime.current.frame = frame
  })
  const admitted = useCallback(
    () =>
      lifetime.current.alive &&
      lifetime.current.epoch === effectEpoch &&
      lifetime.current.frame === frame &&
      access &&
      layer &&
      !reviewOpen &&
      !competing,
    [effectEpoch, frame, access, layer, reviewOpen, competing],
  )
  const aside = useAppShellAside({
    store,
    isNarrow: forceDesktop ? false : undefined,
    sourceGeneration: `${epoch}/${access}/${layer}/${scenario}/${mode}/${reviewOpen}`,
    focusFallbackTarget: () => heading.current,
    isTriggerAdmitted: () => access && layer,
    isFallbackAdmitted: () => access && layer,
  })
  useLayoutEffect(() => {
    diagnostics.asideHandles.push(aside)
    diagnostics.drafts.push((value) => {
      if (admitted()) setDraft(value)
    })
    diagnostics.openCompeting = () => setCompeting(true)
    diagnostics.resizeBoundary = (boundary) => {
      setForceDesktop(true)
      if (boundary === "source") setEpoch((n) => n + 1)
      if (boundary === "access") setAccess(false)
      if (boundary === "layer") setLayer(false)
      if (boundary === "competing") setCompeting(true)
    }
    diagnostics.replace = () => {
      setEpoch((n) => n + 1)
      setDraft("")
      setCandidate("")
    }
    diagnostics.access = () => setAccess((v) => !v)
    diagnostics.layer = () => setLayer((v) => !v)
    return () => {
      diagnostics.replace = undefined
      diagnostics.access = undefined
      diagnostics.layer = undefined
      diagnostics.openCompeting = undefined
      diagnostics.resizeBoundary = undefined
    }
  }, [aside, admitted])
  return (
    <>
      <AppShell
        className="ops-shell-example"
        {...aside.asideProps}
        aside={
          asideContent === "absent" ? undefined : asideContent === "empty" ? null : (
            <ChatStream
              items={messages}
              autoScroll={false}
              className="flex-none"
              viewportClassName="flex-none overflow-visible"
              aria-label="Assistant transcript"
            />
          )
        }
        asideLabel="Assistant region"
        asideTitle="Assistant region"
        asideDescription="Fictional review transcript; no transport."
        asideTrigger={<Button aria-label="Open assistant">Assistant</Button>}
        asideHeader={
          <div className="flex flex-wrap items-center gap-2 p-2">
            <strong>Assistant</strong>
            <Button
              size="sm"
              onClick={() =>
                aside.isNarrow ? aside.setOverlayOpen(false) : aside.setCollapsed(true)
              }
            >
              Collapse assistant
            </Button>
          </div>
        }
        asideFooter={
          asideContent === "fixture-chat" ? (
            <div className="p-2">
              <ChatInput
                aria-label="Assistant draft"
                value={draft}
                disabled={!access || !layer}
                onValueChange={(value) => {
                  if (admitted()) setDraft(value)
                }}
                showSubmitButton={false}
                onSubmit={(value) => {
                  if (admitted()) setCandidate(`Draft candidate: ${value}. Nothing sent.`)
                }}
              />
              <p role="status" className="text-caption [overflow-wrap:anywhere]">
                {candidate || "Draft inspection only"}
              </p>
            </div>
          ) : undefined
        }
        header={
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-2">
            <h1 ref={heading} tabIndex={-1} className="mr-auto text-body font-semibold">
              Operations shell
            </h1>
            <OverlaySidebar
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              title="Operations fixture review"
              trigger={<Button size="sm">Review</Button>}
            >
              <div className="space-y-4 p-4">
                <label>
                  Density{" "}
                  <select
                    aria-label="Review row density"
                    value={density}
                    onChange={(e) =>
                      setDensity(e.target.value === "comfortable" ? "comfortable" : "compact")
                    }
                  >
                    <option>compact</option>
                    <option>comfortable</option>
                  </select>
                </label>
                <select
                  aria-label="Aside width"
                  value={aside.width}
                  onChange={(e) => aside.setWidth(e.target.value as "compact" | "regular" | "wide")}
                >
                  <option>compact</option>
                  <option>regular</option>
                  <option>wide</option>
                </select>

                <label>
                  Inspector{" "}
                  <select
                    aria-label="Inspector mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value === "modal" ? "modal" : "inline")}
                  >
                    <option>inline</option>
                    <option>modal</option>
                  </select>
                </label>
                <label>
                  Source{" "}
                  <select
                    aria-label="Fixture source"
                    value={scenario}
                    onChange={(e) => {
                      setScenario(e.target.value)
                      setDraft("")
                      setCandidate("")
                    }}
                  >
                    {appearances.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <Button size="sm" onClick={() => diagnostics.replace?.()}>
                  Replace source
                </Button>
              </div>
            </OverlaySidebar>
            {asideContent !== "absent" && (
              <Button
                ref={(node) => {
                  aside.triggerRef.current = node
                }}
                aria-label="Toggle assistant"
                aria-expanded={aside.isNarrow ? aside.overlayOpen : !aside.collapsed}
                onClick={() => (aside.isNarrow ? aside.toggleOverlay() : aside.toggleCollapsed())}
              >
                Assistant
              </Button>
            )}
          </header>
        }
      >
        <div className="min-h-0 min-w-0 flex-1" data-ops-pane="main">
          <RunList
            scenario={scenario}
            epoch={epoch}
            accessible={access}
            active={layer && !aside.overlayOpen && !reviewOpen && !competing}
            mode={mode}
            fallback={heading}
            density={density}
            onDensity={setDensity}
          />
        </div>
      </AppShell>
      <InspectionDialog open={competing} onOpenChange={setCompeting} title="Competing review layer">
        <div className="p-4">
          <input aria-label="Competing layer editor" />
        </div>
      </InspectionDialog>
    </>
  )
}

export function OpsShellExample(props: React.ComponentProps<typeof OpsShellFrame>) {
  const [frame, setFrame] = useState(0)
  useLayoutEffect(() => {
    diagnostics.remount = () => setFrame((n) => n + 1)
    return () => {
      diagnostics.remount = undefined
    }
  }, [])
  return <OpsShellFrame key={frame} {...props} />
}
