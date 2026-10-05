import {
  Button,
  type ColumnDef,
  DetailPageLayout,
  OverlaySidebar,
} from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { DataTable } from "@hollis-labs/kit-dashboard/data"
import { DetailHeader, ListPageLayout, TabStrip } from "@hollis-labs/kit-dashboard/layout"
import { type ReactNode, type RefObject, useEffect, useState } from "react"
import { type OperationsModel, runDetail, type TaskView } from "../operations/model"
import { ResourceNotice, RunDetailBody, RunList } from "../operations/Views"
export const layouts = ["list", "table", "split", "drawer"] as const
export type Layout = (typeof layouts)[number]
export function Comparison({
  model,
  selection,
  onSelect,
  query,
  onQuery,
  layout,
  onLayout,
  scrollRef,
  contribution,
  viewport = "full",
}: {
  model: OperationsModel
  selection: string | null
  onSelect: (id: string) => void
  query: string
  onQuery: (value: string) => void
  layout: Layout
  onLayout: (layout: Layout) => void
  scrollRef: RefObject<HTMLDivElement | null>
  viewport?: string
  contribution?: ReactNode
}) {
  const [open, setOpen] = useState(false),
    [width, setWidth] = useState(24),
    [narrow, setNarrow] = useState(false),
    [intent, setIntent] = useState("")
  const compact = narrow || viewport !== "full"
  const detail = runDetail(model, selection)
  useEffect(() => {
    const media = matchMedia("(max-width: 900px)")
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    setOpen(false)
    setIntent("")
    if (scrollRef.current) {
      scrollRef.current.tabIndex = -1
      scrollRef.current.setAttribute("role", "region")
      scrollRef.current.setAttribute("aria-label", "Comparison content")
      scrollRef.current.dataset.testid = "layout-scroll"
      scrollRef.current.dataset.context = `${model.scenario}/${layout}`
      scrollRef.current.scrollTo({ top: 0 })
    }
  }, [model.scenario, layout, scrollRef])
  useEffect(() => {
    setIntent("")
    if (scrollRef.current)
      scrollRef.current.dataset.selectionContext = `${selection}/${query}/${model.dataset.profile}`
  }, [selection, query, model.dataset.profile, scrollRef])
  const inspect = (id: string) => {
    onSelect(id)
    if (layout === "drawer" || (layout === "split" && compact)) setOpen(true)
  }
  const evidence = detail ? (
    <section aria-label="Comparison selected record" className="comparison-evidence">
      <strong>
        {detail.task.id} / {detail.run.id}
      </strong>
      <RunDetailBody
        detail={detail}
        onIntent={(action, id) =>
          setIntent(`${action} → ${id}. Local inspection; fixture unchanged.`)
        }
      />
      {intent && <p role="status">{intent}</p>}
    </section>
  ) : (
    <p className="muted">Select a linked run to inspect its session, tools, trace and usage.</p>
  )
  const drawer = (
    <OverlaySidebar
      open={open && !!detail}
      onOpenChange={setOpen}
      title="Comparison run detail"
      description={`Evidence through ${model.cutoff}; no business effects.`}
      trigger={
        <Button size="sm" disabled={!detail}>
          Open detail drawer
        </Button>
      }
    >
      {evidence}
    </OverlaySidebar>
  )
  const controls = (
    <div className="comparison-controls">
      <TabStrip
        tabs={layouts.map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) }))}
        value={layout}
        onChange={onLayout}
      />
      <div className="comparison-tools">
        <Button size="sm" variant="ghost" onClick={() => scrollRef.current?.focus()}>
          Focus record content
        </Button>
        <span>
          {model.stats.count ?? "Unavailable"} linked tasks · {selection ?? "No selection"}
        </span>
        {drawer}
        {layout === "split" && !compact && (
          <label>
            Detail width
            <input
              aria-label="Detail width"
              type="range"
              min="18"
              max="32"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            {width} rem
          </label>
        )}
      </div>
    </div>
  )
  const columns: ColumnDef<TaskView>[] = [
    { key: "id", header: "Task", cell: (t) => t.id, sortValue: (t) => t.id },
    {
      key: "title",
      header: "Review",
      cell: (t) => t.title,
      width: "fill",
      sortValue: (t) => t.title,
    },
    {
      key: "status",
      header: "Run",
      cell: (t) => (
        <StatusBadge status={model.runs.find((r) => r.id === t.runId)?.status ?? "unavailable"} />
      ),
    },
    {
      key: "started",
      header: "Recorded UTC",
      cell: (t) => t.started.replace("T", " ").replace("Z", ""),
      sortValue: (t) => t.started,
    },
  ]
  const records = !model.accessible ? (
    <ResourceNotice model={model} />
  ) : layout === "table" ? (
    <>
      <label className="comparison-filter">
        Filter tasks
        <input aria-label="Filter tasks" value={query} onChange={(e) => onQuery(e.target.value)} />
      </label>
      <DataTable
        items={model.tasks}
        columns={columns}
        getRowId={(t) => t.id}
        onRowOpen={inspect}
        rowAriaLabel={(t) => `Inspect ${t.id}`}
        scrollRootRef={scrollRef}
        emptyState={<p>No linked records in this view.</p>}
      />
    </>
  ) : (
    <RunList model={model} query={query} onQuery={onQuery} onSelect={inspect} />
  )
  const body = (
    <div className="comparison-body">
      {records}
      {(layout === "list" || layout === "table") && detail && evidence}
      {contribution && (
        <details className="comparison-contribution">
          <summary>Reviewed plugin widget and panel</summary>
          {contribution}
        </details>
      )}
    </div>
  )
  return (
    <section
      className="comparison-page"
      data-viewport={viewport}
      style={{ "--comparison-aside": `${width}rem` } as React.CSSProperties}
      aria-label="Layout comparison"
    >
      <div className="comparison-heading">
        <h1>Layouts</h1>
        <p className="muted">
          Same {model.dataset.version} · {model.dataset.clock} · local presentation only
        </p>
      </div>
      {layout === "split" ? (
        <DetailPageLayout
          header={
            <>
              <DetailHeader
                title="Split review"
                backLabel="List layout"
                onBack={() => onLayout("list")}
              />
              {controls}
            </>
          }
          scrollRef={scrollRef}
          aside={
            !compact ? (
              <section className="comparison-aside" aria-label="Independent detail scroll">
                {evidence}
              </section>
            ) : undefined
          }
          asideClassName="comparison-aside-owner"
        >
          {body}
        </DetailPageLayout>
      ) : (
        <ListPageLayout
          header={controls}
          scrollRef={scrollRef}
          footer={
            <p className="comparison-footer">
              Main list/table body owns page scrolling; modal detail owns its temporary scroll
              region.
            </p>
          }
        >
          {body}
        </ListPageLayout>
      )}
    </section>
  )
}
