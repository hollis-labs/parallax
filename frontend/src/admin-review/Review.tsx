import {
  Button,
  Callout,
  DetailDialog,
  EmptyState,
  JsonViewer,
  MetaList,
} from "@hollis-labs/design-components"
import {
  AdminContent,
  type AdminContentProps,
  AdminNavigation,
  type AdminPage,
  type AdminSelection,
  AdminShell,
  type AdminTarget,
} from "@hollis-labs/kit-admin"
import { SampleSeriesView } from "@hollis-labs/kit-observe/charts"
import { useCallback, useEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../chimera/admin-session"
import {
  type AdminAppearance,
  type AdminReviewModel,
  adminAppearances,
  adminDestinationIntent,
  adminReviewModel,
  admittedTarget,
} from "./model"
export function AdminReview({
  context = "populated",
  initialState,
  initialPage,
  initialGroup,
  standalone = false,
  portable = false,
  initialSeries,
}: {
  context?: string
  initialState?: AdminAppearance
  initialPage?: AdminPage
  initialGroup?: "workspace" | "appearance"
  standalone?: boolean
  portable?: boolean
  initialSeries?: boolean
}) {
  const params = new URLSearchParams(location.search)
  const [appearance, setAppearance] = useState(
      initialState ??
        adminAppearances.find((s) => s === params.get("adminAppearance")) ??
        "recorded",
    ),
    [selection, setSelection] = useState<AdminSelection>({
      page:
        initialPage ??
        (["dashboard", "settings", "status", "diagnostics"] as const).find(
          (p) => p === params.get("adminPage"),
        ) ??
        "dashboard",
      ...(initialGroup
        ? { groupId: initialGroup }
        : ["workspace", "appearance"].includes(params.get("adminGroup") ?? "")
          ? { groupId: params.get("adminGroup")! }
          : {}),
    }),
    [series, setSeries] = useState(initialSeries ?? params.get("adminSeries") === "1"),
    [href, setHref] = useState(params.get("adminHref") === "1"),
    [copy, setCopy] = useState(params.get("adminCopy") === "1"),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const queue = useRef<(() => void)[]>([]),
    retire = useRef(() => {})
  const data = adminReviewModel(appearance, context, copy)
  const actual: AdminSelection =
    appearance === "unknown-group"
      ? { page: "settings", groupId: "unlisted" }
      : appearance === "unknown-page"
        ? { page: "unlisted" as AdminPage }
        : selection
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
  }
  function change(target: AdminTarget) {
    retire.current()
    if (appearance === "unknown-group" || appearance === "unknown-page") setAppearance("recorded")
    setSelection(target)
  }
  const controls = (
    <div className="admin-review-controls">
      <details open={!standalone}>
        <summary>Admin review controls · fixed snapshot</summary>
        <div className="gallery-controls">
          <label>
            Admin appearance{" "}
            <select
              aria-label="Admin appearance"
              value={appearance}
              onChange={(e) => {
                setAppearance(e.target.value as AdminAppearance)
                reset()
              }}
            >
              {adminAppearances.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Admin page{" "}
            <select
              aria-label="Admin page"
              value={selection.page}
              onChange={(e) => change({ page: e.target.value as AdminPage })}
            >
              {["dashboard", "settings", "status", "diagnostics"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Selected settings group{" "}
            <select
              aria-label="Selected settings group"
              value={selection.groupId ?? ""}
              onChange={(e) =>
                change({ page: "settings", ...(e.target.value ? { groupId: e.target.value } : {}) })
              }
            >
              <option value="">Choose group</option>
              {data.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id}
                </option>
              ))}
            </select>
          </label>
          {!portable && (
            <label>
              Destination mode{" "}
              <select
                aria-label="Destination mode"
                value={href ? "href" : "local"}
                onChange={(e) => {
                  setHref(e.target.value === "href")
                  reset()
                }}
              >
                <option value="local">Local navigation</option>
                <option value="href">Same-origin review link</option>
              </select>
            </label>
          )}
          <label>
            Series renderer{" "}
            <select
              aria-label="Series renderer"
              value={series ? "present" : "absent"}
              onChange={(e) => {
                setSeries(e.target.value === "present")
                reset()
              }}
            >
              <option value="absent">Absent</option>
              <option value="present">Present · bounded UTC samples</option>
            </select>
          </label>
          <label>
            Admin source{" "}
            <select
              aria-label="Admin source"
              value={copy ? "copy" : "original"}
              onChange={(e) => {
                setCopy(e.target.value === "copy")
                reset()
              }}
            >
              <option value="original">Original fixture</option>
              <option value="copy">Reviewed copy</option>
            </select>
          </label>
          <Button onClick={reset}>Reset admin review</Button>
          <Button
            onClick={() => {
              queue.current.shift()?.()
              setQueued(queue.current.length)
            }}
          >
            Release oldest destination inspection ({queued})
          </Button>
        </div>
      </details>
      <p className="muted">
        Read-only declared views · {data.administration.clock} ·{" "}
        {standalone
          ? "Standalone AdminShell owns viewport and content scroll"
          : "Inner navigation/content uses host page scroll"}
        .
      </p>
      {!portable && admittedTarget(data, actual) ? (
        <a href={reviewHref(data, actual, { standalone: !standalone, series, href })}>
          {standalone ? "Return to Admin Review" : "Open standalone AdminShell"}
        </a>
      ) : (
        <p className="muted">
          {portable
            ? "Portable local navigation; app href destinations are not supplied."
            : "Standalone destination unavailable for this authored selection."}
        </p>
      )}
    </div>
  )
  return (
    <div className={standalone ? "admin-review-standalone" : "admin-review"}>
      {controls}
      <AdminInstance
        key={`${data.source}/${actual.page}/${actual.groupId}/${series}/${href}/${revision}`}
        data={data}
        selection={actual}
        series={series}
        href={href && !portable}
        standalone={standalone}
        select={change}
        retire={retire}
        release={() => {
          queue.current.shift()?.()
          setQueued(queue.current.length)
        }}
        hold={(release) => {
          queue.current.push(release)
          setQueued(queue.current.length)
        }}
      />
    </div>
  )
}
type Candidate = NonNullable<ReturnType<typeof adminDestinationIntent>>
function AdminInstance({
  data,
  selection,
  series,
  href,
  standalone,
  select,
  retire,
  hold,
  release,
}: {
  data: AdminReviewModel
  selection: AdminSelection
  series: boolean
  href: boolean
  standalone: boolean
  select: (target: AdminTarget) => void
  retire: React.MutableRefObject<() => void>
  hold: (release: () => void) => void
  release: () => void
}) {
  const [plan, setPlan] = useState<Candidate | null>(null),
    [result, setResult] = useState(""),
    [, rerender] = useState(0)
  const current = useRef({
      alive: false,
      lease: 0,
      data,
      selection,
      plan: null as Candidate | null,
    }),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    ticket = useRef<ReturnType<NonNullable<typeof session.current>["begin"]> | null>(null),
    frame = useRef<number | null>(null),
    origin = useRef<HTMLElement | null>(null)
  current.current.data = data
  current.current.selection = selection
  const cancelFocus = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])
  const clear = useCallback(() => {
    cancelFocus()
    current.current.lease++
    ticket.current?.cancel()
    ticket.current = null
    current.current.plan = null
    setPlan(null)
    setResult("")
  }, [cancelFocus])
  useEffect(() => {
    const active = createAdminPresentationSession(data.contextKey, data.source, ["destination"])
    session.current = active
    current.current.alive = true
    current.current.lease++
    retire.current = clear
    rerender((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
      cancelFocus()
      ticket.current?.cancel()
      active.dispose()
      if (session.current === active) session.current = null
      retire.current = () => {}
    }
  }, [data.contextKey, data.source, clear, cancelFocus, retire])
  const lease = current.current.lease
  const admitted = () =>
    current.current.alive &&
    current.current.lease === lease &&
    current.current.data.source === data.source
  function navigate(target: AdminTarget) {
    if (!admitted() || !admittedTarget(current.current.data, target)) return
    clear()
    select(target)
  }
  function destination(target: AdminTarget): ReturnType<AdminContentProps["destination"]> {
    if (href && admittedTarget(data, target)) {
      return { href: reviewHref(data, target, { standalone, series, href: true }) }
    }
    return { onSelect: () => navigate(target) }
  }
  function inspect() {
    if (!admitted() || current.current.plan || !session.current) return
    const candidate = adminDestinationIntent(current.current.data, current.current.selection)
    if (!candidate) return
    cancelFocus()
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const active = session.current.begin("destination")
    ticket.current = active
    current.current.plan = candidate
    setPlan(candidate)
    setResult("")
    hold(() => {
      const now = current.current
      if (
        !admitted() ||
        now.plan !== candidate ||
        JSON.stringify(adminDestinationIntent(now.data, now.selection)) !==
          JSON.stringify(candidate)
      )
        return
      active.commit(() => {
        setResult(
          "Locally inspected only. Manifest, settings, observations and destination records remain unchanged.",
        )
      })
    })
  }
  function close() {
    if (!admitted() || !current.current.plan) return
    clear()
    const stamp = current.current.lease,
      target = origin.current
    frame.current = requestAnimationFrame(() => {
      if (
        current.current.alive &&
        current.current.lease === stamp &&
        !current.current.plan &&
        target?.isConnected
      )
        target.focus()
      frame.current = null
    })
  }
  const props: AdminContentProps = {
    contextKey: data.contextKey,
    discovery: data.discovery,
    selection,
    destination,
    settings: data.settings,
    observations: data.observations,
    nowMs: data.nowMs,
    ...(series ? { renderSeries: (p) => <SampleSeriesView {...p} /> } : {}),
  }
  const body = !data.accessible ? (
    <EmptyState
      variant="empty"
      title="Admin evidence withheld"
      description="The current host review policy does not admit these fixture records."
    />
  ) : standalone ? (
    <AdminShell {...props} />
  ) : (
    <div className="admin-inner-composition">
      <div className="admin-inner-navigation">
        <AdminNavigation {...props} />
      </div>
      <AdminContent {...props} />
    </div>
  )
  return (
    <>
      <div className={standalone ? "admin-shell-body" : "admin-inner-body"}>{body}</div>
      <div className="admin-inspection-control">
        <Button disabled={!adminDestinationIntent(data, selection)} onClick={inspect}>
          Inspect selected destination
        </Button>
        <span className="muted">Finite local intent; navigation is a separate view change.</span>
      </div>
      <DetailDialog
        open={!!plan}
        onClose={close}
        title="Admin destination inspection"
        widthClassName="settings-plan-dialog"
        footer={
          <div className="gallery-controls settings-plan-footer">
            <Button
              onClick={() => {
                if (admitted() && current.current.plan) release()
              }}
            >
              Release oldest destination inspection
            </Button>
            <Button onClick={close}>Close inspection</Button>
            <Button
              onClick={() => {
                if (admitted() && current.current.plan) clear()
              }}
            >
              Reset inspection
            </Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          <Callout tone="info" title="Local inspection only">
            No settings save, setup, collection or backend action.
          </Callout>
          {plan && (
            <>
              <MetaList
                items={[
                  { label: "Page", value: plan.page },
                  { label: "Group", value: plan.group ?? "none" },
                  { label: "Revision", value: plan.revision },
                  { label: "Fixed UTC", value: plan.fixedUtc },
                ]}
              />
              <JsonViewer value={plan} className="evidence-json" />
            </>
          )}
          {result && <p role="status">{result}</p>}
        </div>
      </DetailDialog>
    </>
  )
}
export function StandaloneAdminReview() {
  const params = new URLSearchParams(location.search)
  const theme = params.get("theme") ?? "p4-white",
    mode = params.get("mode") ?? "dark"
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = mode
  }, [theme, mode])
  return (
    <AdminReview
      standalone
      context={
        [
          "populated",
          "empty",
          "large",
          "sparse",
          "degraded",
          "permission-denied",
          "unavailable",
        ].includes(params.get("adminContext") ?? "")
          ? params.get("adminContext")!
          : "populated"
      }
      initialState={adminAppearances.find((s) => s === params.get("adminAppearance")) ?? "recorded"}
      initialPage={
        (["dashboard", "settings", "status", "diagnostics"] as const).find(
          (p) => p === params.get("adminPage"),
        ) ?? "dashboard"
      }
      initialSeries={params.get("adminSeries") === "1"}
    />
  )
}

function reviewHref(
  data: AdminReviewModel,
  target: AdminTarget,
  flags: { standalone: boolean; series: boolean; href: boolean },
) {
  const params = new URLSearchParams({
    ...(flags.standalone ? { adminShellReview: "1" } : { view: "Admin Review" }),
    adminPage: target.page,
    adminAppearance: data.appearance,
    adminContext: data.contextKey.slice("admin-review/".length),
    scenario: data.contextKey.slice("admin-review/".length),
    ...(target.groupId ? { adminGroup: target.groupId } : {}),
    ...(data.copy ? { adminCopy: "1" } : {}),
    ...(flags.series ? { adminSeries: "1" } : {}),
    ...(flags.href ? { adminHref: "1" } : {}),
    theme: document.documentElement.dataset.theme ?? "p4-white",
    mode: document.documentElement.dataset.mode ?? "dark",
  })
  return `/?${params}`
}
