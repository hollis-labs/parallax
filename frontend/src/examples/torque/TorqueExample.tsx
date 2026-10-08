import { AppShell, Button, DetailDialog, OverlaySidebar } from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { operationsModel, runDetail, scenarios } from "../../operations/model"
import { ResourceNotice, RunDetailBody } from "../../operations/Views"
import { OpsDashboard } from "../../ops-dashboard/Dashboard"
import { resourceOverrides, sourceDataset, timelineFrames } from "../../playback/model"
import { RunExplorer } from "../../run-explorer/Explorer"
import { exampleContext, torqueDefinition } from "../contracts"
import { FixtureContracts } from "../FixtureContracts"
import { type TorqueState, torqueHref } from "./routes"
import "./torque.css"

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
  const model = operationsModel(state.scenario, state.query, {
      cutoff: state.cutoff,
      override: state.override,
    }),
    detail = runDetail(model, state.selected),
    artifact = sourceDataset(state.scenario),
    frames = timelineFrames(artifact),
    context = exampleContext(torqueDefinition, artifact, state.cutoff, frames)
  const [navOpen, setNavOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [inspection, setInspection] = useState(false),
    [intent, setIntent] = useState(""),
    [, fresh] = useState(0)
  const source = JSON.stringify([
      context.source,
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
          {d.label}
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
      <p>Local fixture review; no live collection or business effects.</p>
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
                cutoff: sourceDataset(next).clock,
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
            cutoff: sourceDataset(state.scenario).clock,
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
      className="torque-example"
      nav={
        <aside className="torque-sidebar">
          <a
            className="torque-brand"
            href={torqueHref(state, { route: "dashboard" })}
            onClick={(e) => {
              e.preventDefault()
              change({ route: "dashboard" })
            }}
          >
            Torque<span>Fixture example</span>
          </a>
          {links}
          <footer>
            <a href="/?view=Review+Workbench">Back to review lab</a>
            <p>Readonly recorded evidence</p>
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
              <a href="/?view=Review+Workbench">Back to review lab</a>
            </OverlaySidebar>
          </div>
          <div className="torque-heading">
            <strong>{title}</strong>
            <span>
              {state.cutoff.slice(11, 19)} UTC · {model.resource}
            </span>
          </div>
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
        <section className="torque-page" ref={pageRoot} aria-label={`${title} page scroll`}>
          {state.route === "dashboard" ? (
            <OpsDashboard
              model={model}
              controlledTab={state.tab}
              onTabSelect={(tab) => change({ tab }, true)}
              query={state.query}
              onQuery={(query) => change({ query, selected: null }, true)}
              onSelect={select}
            />
          ) : state.route === "tasks" ? (
            <section>
              <h1>Tasks</h1>
              <p>Current admitted tasks and distinct run lifecycle, through {state.cutoff}.</p>
              <label>
                Filter supplied tasks
                <input
                  aria-label="Example task filter"
                  value={state.query}
                  onChange={(e) => change({ query: e.target.value, selected: null }, true)}
                />
              </label>
              {!model.accessible ? (
                <ResourceNotice model={model} />
              ) : model.tasks.length ? (
                <div className="torque-task-list">
                  {model.tasks.map((t) => (
                    <a
                      key={t.id}
                      href={torqueHref(state, { route: "task", selected: t.id })}
                      onClick={(e) => {
                        e.preventDefault()
                        select(t.id)
                      }}
                    >
                      <strong>{t.title}</strong>
                      <span>
                        {t.id} · {t.runId} · {t.owner ?? "Owner unknown"}
                      </span>
                      <StatusBadge status={t.status} />
                    </a>
                  ))}
                </div>
              ) : (
                <p>No admitted matching tasks. Known count 0.</p>
              )}
            </section>
          ) : state.route === "task" ? (
            <section>
              <h1>Task and run inspection</h1>
              {detail ? (
                <>
                  <p>
                    {detail.task.id} / {detail.run.id} · selected admitted record
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
            <section>
              <h1>About this example</h1>
              <p>
                One standalone application shell, using operations/v2 fixed fixtures and current
                reviewed presentation components.
              </p>
              <p>
                Activity/Mission/Usage charts remain labelled fixed-clock adaptations until separate
                parity tasks. No Torque API, SSE, providers or execution.
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
              <FixtureContracts />
              {contributions ?? <p>Portable composition: plugin delivery is not mounted.</p>}
            </section>
          )}
          {intent && <p role="status">{intent}</p>}
          <footer className="torque-page-footer">
            {state.selected && detail
              ? `Selected ${detail.task.id} / ${detail.run.id}`
              : "No admitted selection"}{" "}
            · {model.dataset.version} · readonly fixture
          </footer>
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
