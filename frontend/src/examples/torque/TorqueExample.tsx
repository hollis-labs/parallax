import { AppShell, Button, DetailDialog, OverlaySidebar } from "@hollis-labs/design-components"
import { Activity, Cog, FileText, LayoutList, PanelLeft, Radio } from "lucide-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { operationsModel, runDetail, scenarios } from "../../operations/model"
import { RunDetailBody } from "../../operations/Views"
import { OpsDashboard } from "../../ops-dashboard/Dashboard"
import { resourceOverrides, timelineFrames } from "../../playback/model"
import { RunExplorer } from "../../run-explorer/Explorer"
import { exampleContext, torqueDefinition } from "../contracts"
import { FixtureContracts } from "../FixtureContracts"
import { TorqueActivity } from "./Activity"
import { TorqueMission } from "./Mission"
import { TorqueOperations } from "./Operations"
import { operationsMetadata } from "./operations-metadata"
import { TorqueReferenceEvidence } from "./ReferenceEvidence"
import { torqueProfiles, torqueReferenceModel, torqueSource } from "./reference"
import { type TorqueState, torqueHref } from "./routes"
import "./torque.css"
import "./operations.css"

const destinations = torqueDefinition.destinations
  .filter((d) => d.id !== "task")
  .map((d) => ({ route: d.id, label: d.label }))
export function TorqueExample({
  state,
  onChange,
  contributions,
}: {
  state: TorqueState
  onChange: (patch: Partial<TorqueState>, replace?: boolean) => void
  contributions?: ReactNode
}) {
  const artifact = torqueSource(state.scenario, state.profile)
  const model = operationsModel(state.scenario, state.query, {
      source: artifact,
      cutoff: state.cutoff,
      override: state.override,
    }),
    detail = runDetail(model, state.selected),
    frames = timelineFrames(artifact),
    context = exampleContext(torqueDefinition, artifact, state.cutoff, frames),
    reference = torqueReferenceModel(model)
  const [navOpen, setNavOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [inspection, setInspection] = useState(false),
    [intent, setIntent] = useState(""),
    [, fresh] = useState(0)
  const source = JSON.stringify([
      context.source,
      reference.source,
      state.profile,
      state.scenario,
      state.cutoff,
      state.query,
      state.override,
      state.route,
      state.tab,
      state.selected,
      state.theme,
      state.mode,
    ]),
    currentSource = useRef(source)
  currentSource.current = source
  const life = useRef({ alive: false, lease: 0 })
  useLayoutEffect(() => {
    const current = { alive: true, lease: 0 }
    life.current = current
    fresh((x) => x + 1)
    return () => {
      current.alive = false
      current.lease++
    }
  }, [])
  const lifetime = life.current,
    lease = lifetime.lease,
    admitted = () =>
      lifetime.alive &&
      life.current === lifetime &&
      lease === lifetime.lease &&
      currentSource.current === source
  const retired = useRef(source)
  useLayoutEffect(() => {
    if (retired.current !== source) {
      retired.current = source
      life.current.lease++
      fresh((x) => x + 1)
      setNavOpen(false)
      setReviewOpen(false)
      setIntent("")
      if (!detail) setInspection(false)
    }
  }, [source, detail])
  const pageRoot = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (pageRoot.current) {
      pageRoot.current.dataset.route = state.route
      pageRoot.current.scrollTo({ top: 0 })
    }
  }, [state.route])
  function change(patch: Partial<TorqueState>, replace = false) {
    if (!admitted() || JSON.stringify({ ...state, ...patch }) === JSON.stringify(state)) return
    lifetime.lease++
    onChange(patch, replace)
  }
  function surface(before: boolean, next: boolean, setter: (v: boolean) => void) {
    if (admitted() && before !== next) {
      lifetime.lease++
      setter(next)
    }
  }
  function select(id: string) {
    if (admitted() && model.tasks.some((t) => t.id === id)) {
      change({ selected: id, route: "task" })
      setInspection(false)
    }
  }
  const links = (
    <nav className="torque-navigation" aria-label="Torque application navigation">
      {destinations.map((d) => (
        <a
          key={d.route}
          href={torqueHref(state, { route: d.route })}
          aria-current={state.route === d.route ? "page" : undefined}
          onClick={(e) => {
            if (admitted() && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
              e.preventDefault()
              change({ route: d.route })
              setNavOpen(false)
            }
          }}
        >
          <span className="torque-nav-icon">
            {d.route === "tasks" ? (
              <LayoutList size={16} />
            ) : d.route === "dashboard" ? (
              <Activity size={16} />
            ) : d.route === "runs" ? (
              <Radio size={16} />
            ) : (
              <FileText size={16} />
            )}
          </span>
          <span className="torque-nav-label">{d.label}</span>
        </a>
      ))}
    </nav>
  )
  const title =
    state.route === "task"
      ? "Task and run"
      : (destinations.find((d) => d.route === state.route)?.label ?? "Dashboard")
  const review = (
    <div className="torque-review-controls">
      <label>
        Fixture profile
        <select
          aria-label="Torque fixture profile"
          value={state.profile}
          onChange={(e) => {
            const p = torqueProfiles.find((p) => p === e.target.value)
            if (p)
              change({ profile: p, cutoff: torqueSource(state.scenario, p).clock, selected: null })
          }}
        >
          <option value="legacy">Legacy operations review</option>
          <option value="torque-16w">Torque 16-week reference</option>
        </select>
      </label>
      <p>Local fixture review; no live collection or business effects.</p>
      <p>
        Operations board status, priority, scopes, tags and executor are fictional annotations.
        Dates and usage come from admitted records; detail preserves original task/run status.
      </p>
      <label>
        Scenario
        <select
          aria-label="Example scenario"
          value={state.scenario}
          onChange={(e) => {
            const next = scenarios.find((s) => s === e.target.value)
            if (next)
              change({
                scenario: next,
                cutoff: torqueSource(next, state.profile).clock,
                selected: null,
                query: "",
                override: "scenario",
              })
          }}
        >
          {scenarios.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Review position
        <input
          type="range"
          aria-label="Example review position"
          min={0}
          max={frames.length - 1}
          value={Math.max(0, frames.indexOf(state.cutoff))}
          onChange={(e) => change({ cutoff: frames[Number(e.target.value)] }, true)}
        />
      </label>
      <time>{state.cutoff}</time>
      <label>
        Resource
        <select
          aria-label="Example resource"
          value={state.override}
          onChange={(e) => {
            const v = resourceOverrides.find((v) => v === e.target.value)
            if (v) change({ override: v }, true)
          }}
        >
          {resourceOverrides.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        Theme
        <select
          aria-label="Example theme"
          value={state.theme}
          onChange={(e) => change({ theme: e.target.value }, true)}
        >
          {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Mode
        <select
          aria-label="Example mode"
          value={state.mode}
          onChange={(e) => change({ mode: e.target.value === "dark" ? "dark" : "light" }, true)}
        >
          <option>light</option>
          <option>dark</option>
        </select>
      </label>
      <Button
        onClick={() =>
          change({
            query: torqueDefinition.reset.query,
            selected: torqueDefinition.reset.selected,
            cutoff: artifact.clock,
            override: torqueDefinition.reset.override,
          })
        }
      >
        Reset example context
      </Button>
    </div>
  )
  return (
    <AppShell
      className={`torque-example ${state.route === "tasks" ? "torque-operations-shell" : ""}`}
      nav={
        <aside className="torque-sidebar">
          <a
            className="torque-brand"
            href={torqueHref(state, { route: "tasks" })}
            onClick={(e) => {
              e.preventDefault()
              change({ route: "tasks" })
            }}
          >
            <Cog size={20} />
            <span>Torque</span>
          </a>
          {links}
          <footer>
            <a href="/?view=Review+Workbench">
              <PanelLeft size={16} />
              <span className="torque-nav-label">Back to review lab</span>
            </a>
          </footer>
        </aside>
      }
      header={
        <header className="torque-header">
          <div className="torque-mobile-nav">
            <OverlaySidebar
              side="left"
              open={navOpen}
              onOpenChange={(v) => {
                surface(navOpen, v, setNavOpen)
              }}
              title="Torque navigation"
              trigger={
                <Button variant="outline" size="sm">
                  Open app navigation
                </Button>
              }
            >
              {links}
              <a href="/?view=Review+Workbench">
                <PanelLeft size={16} />
                <span className="torque-nav-label">Back to review lab</span>
              </a>
            </OverlaySidebar>
          </div>
          <div className="torque-heading">
            <h1>{title}</h1>
            <span>
              {state.cutoff.slice(11, 19)} UTC · {model.resource}
            </span>
          </div>
          {state.route === "tasks" && (
            <div className="torque-header-scopes">
              {["Projects", "Sprints", "Epics", "Scope"].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    if (admitted())
                      pageRoot.current
                        ?.querySelector<HTMLSelectElement>(
                          `select[aria-label="Filter by ${label === "Scope" ? "tag" : label.toLowerCase().slice(0, -1)}"]`,
                        )
                        ?.focus()
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <OverlaySidebar
            side="right"
            open={reviewOpen}
            onOpenChange={(v) => {
              surface(reviewOpen, v, setReviewOpen)
            }}
            title="Torque fixture review"
            trigger={
              <Button variant="outline" size="sm">
                Review fixtures
              </Button>
            }
          >
            {review}
          </OverlaySidebar>
        </header>
      }
    >
      {state.route === "runs" ? (
        <div className="torque-runs">
          <RunExplorer model={model} onInspectRecord={select} />
        </div>
      ) : (
        <section
          className="torque-page"
          ref={pageRoot}
          aria-label={`${title} page scroll`}
          data-operations={state.route === "tasks"}
        >
          {state.route === "dashboard" ? (
            <>
              {state.profile === "legacy" && (
                <p>
                  Legacy dashboard adaptation.{" "}
                  <Button
                    variant="outline"
                    onClick={() =>
                      change({
                        profile: "torque-16w",
                        tab: "Activity",
                        cutoff: torqueSource(state.scenario, "torque-16w").clock,
                        selected: null,
                        query: "",
                      })
                    }
                  >
                    Open Torque Activity reference
                  </Button>
                </p>
              )}
              <OpsDashboard
                referenceMission={
                  state.profile === "torque-16w" ? (
                    <TorqueMission model={model} onSelect={select} />
                  ) : undefined
                }
                referenceUsage={
                  state.profile === "torque-16w" ? (
                    <TorqueMission model={model} onSelect={select} usage />
                  ) : undefined
                }
                model={model}
                referenceActivity={
                  state.profile === "torque-16w" ? (
                    <TorqueActivity model={model} onSelect={select} />
                  ) : undefined
                }
                controlledTab={state.tab}
                onTabSelect={(tab) => change({ tab }, true)}
                query={state.query}
                onQuery={(query) => change({ query, selected: null }, true)}
                onSelect={select}
              />
            </>
          ) : state.route === "tasks" ? (
            <TorqueOperations
              model={model}
              state={state}
              onQuery={(query) => change({ query, selected: null }, true)}
              onSelect={select}
            />
          ) : state.route === "task" ? (
            <section>
              <h1>Task and run inspection</h1>
              {detail ? (
                <>
                  <p>
                    {detail.task.id} / {detail.run.id} · selected admitted record · Fictional board
                    status: {operationsMetadata[detail.task.id]?.status ?? "Unknown"}· Recorded task
                    status: {detail.task.status}
                  </p>
                  <Button
                    onClick={() => {
                      surface(inspection, true, setInspection)
                    }}
                  >
                    Open bounded record details
                  </Button>
                  <RunDetailBody
                    detail={detail}
                    onIntent={(action, id) => {
                      if (admitted())
                        setIntent(
                          `${action} / ${id}: local intent inspection only; supplied records unchanged.`,
                        )
                    }}
                  />
                </>
              ) : (
                <p>No selected admitted task at this context. Choose a current task or run.</p>
              )}
            </section>
          ) : (
            <section className="torque-about">
              <h1>About this example</h1>
              <p>
                Operations uses fixed fictional task-board annotations for status, priority and
                scope. Cutoff admits original graph evidence, not authored status history. Original
                task/run status is preserved in detail.
              </p>
              <p>
                One standalone application shell, using operations/v2 fixed fixtures and current
                reviewed presentation components.
              </p>
              <p>
                The torque-16w profile provides reviewed Activity/Mission/Usage reference
                presentations. Legacy records-8/80 retain labelled fixed-clock adaptations. No
                Torque API, SSE, providers or execution.
              </p>
              <dl>
                <dt>Source</dt>
                <dd>
                  {model.dataset.version} / {model.dataset.profile}
                </dd>
                <dt>Seed</dt>
                <dd>{model.dataset.seed}</dd>
                <dt>Reference</dt>
                <dd>{context.referenceClock ?? "Unknown"}</dd>
                <dt>Cutoff</dt>
                <dd>{model.cutoff}</dd>
              </dl>
              <TorqueReferenceEvidence model={model} onSelect={select} />
              <FixtureContracts />
              {contributions ?? <p>Portable composition: plugin delivery is not mounted.</p>}
            </section>
          )}
          {intent && <p role="status">{intent}</p>}
          {state.route !== "tasks" && (
            <footer className="torque-page-footer">
              {state.selected && detail
                ? `Selected ${detail.task.id} / ${detail.run.id}`
                : "No admitted selection"}{" "}
              · {model.dataset.version} · readonly fixture
            </footer>
          )}
        </section>
      )}
      <DetailDialog
        open={inspection && !!detail}
        onClose={() => {
          surface(inspection, false, setInspection)
        }}
        title="Torque record inspection"
        meta={detail ? `${detail.task.id} / ${detail.run.id} · ${state.cutoff}` : ""}
        footer={
          <Button
            onClick={() => {
              surface(inspection, false, setInspection)
            }}
          >
            Close record inspection
          </Button>
        }
      >
        {detail && (
          <RunDetailBody
            detail={detail}
            onIntent={(action, id) => {
              if (admitted()) setIntent(`${action} / ${id}: inspected locally, no execution.`)
            }}
          />
        )}
      </DetailDialog>
    </AppShell>
  )
}
