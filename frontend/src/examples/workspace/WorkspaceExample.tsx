import {
  AppShell,
  Button,
  DetailDialog,
  JsonViewer,
  OverlaySidebar,
} from "@hollis-labs/design-components"
import { FileTree, FileTreeFile, FileTreeFolder } from "@hollis-labs/kit-code"
import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../../chimera/admin-session"
import {
  defaultWorkspaceState,
  normalizeWorkspaceState,
  type WorkspaceState,
  workspaceAppearances,
  workspaceHref,
  workspaceModel,
  workspacePanels,
} from "./model"
import "./workspace.css"

const DeveloperEvidence = lazy(() => import("../../developer-evidence/Review"))
const WorkflowReview = lazy(() => import("../../workflow-review/Review"))
const titles = {
  source: "Source",
  diagnostics: "Diagnostics",
  tool: "Tool evidence",
  graph: "Inspection graph",
}
export function WorkspaceExample({
  state: provided = defaultWorkspaceState,
  onChange,
}: {
  state?: WorkspaceState
  onChange?: (s: WorkspaceState) => void
}) {
  const [local, setLocal] = useState(provided),
    [revision, setRevision] = useState(0)
  const state = onChange ? provided : local,
    data = workspaceModel(state),
    file = data.file,
    identity = JSON.stringify([data.source, revision])
  const [navOpen, setNavOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [expanded, setExpanded] = useState(new Set(["src", "fixtures"])),
    [lease, setLease] = useState(0),
    [queued, setQueued] = useState(0)
  const [inspection, setInspection] = useState<{ value: unknown; outcome: string } | null>(null)
  const life = useRef({ alive: false, lease: 0 }),
    rendered = useRef(identity),
    previous = useRef({ state, revision }),
    heading = useRef<HTMLHeadingElement>(null),
    body = useRef<HTMLElement>(null),
    origin = useRef<HTMLElement | null>(null),
    raf = useRef<number | null>(null),
    navigation = useRef(false),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    queue = useRef<(() => void)[]>([])
  rendered.current = identity
  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])
  useLayoutEffect(() => {
    const owned = createAdminPresentationSession(identity, identity, ["inspect"])
    session.current = owned
    life.current.alive = true
    life.current.lease++
    setLease(life.current.lease)
    setInspection(null)
    const old = previous.current
    const queryOnly =
      !navigation.current &&
      old.state.query !== state.query &&
      old.revision === revision &&
      old.state.panel === state.panel &&
      old.state.appearance === state.appearance &&
      old.state.theme === state.theme &&
      old.state.mode === state.mode
    previous.current = { state, revision }
    if (!queryOnly) setNavOpen(false)
    setReviewOpen(false)
    if (navigation.current || document.activeElement === document.body) {
      navigation.current = false
      heading.current?.focus()
      if (body.current) body.current.scrollTop = 0
    }
    return () => {
      life.current.alive = false
      life.current.lease++
      owned.dispose()
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [identity, state, revision])
  const admitted = () =>
    life.current.alive && life.current.lease === lease && rendered.current === identity
  function transition(fn: () => void) {
    if (!admitted()) return
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    session.current?.reset(identity, `${identity}:${++life.current.lease}`)
    setLease(life.current.lease)
    setInspection(null)
    fn()
  }
  function change(patch: Partial<WorkspaceState>, focus = false) {
    if (!admitted()) return
    const next = normalizeWorkspaceState(new URLSearchParams({ ...state, ...patch }))
    navigation.current = focus
    if (onChange) onChange(next)
    else setLocal(next)
  }
  function select(id: string, line = 1, column = 1) {
    if (!admitted()) return
    const f = data.files.find((f) => f.id === id),
      max = f
        ? Math.max(f.before.trimEnd().split("\n").length, f.after.trimEnd().split("\n").length)
        : 0
    if (
      !f ||
      !Number.isInteger(line) ||
      line < 1 ||
      line > max ||
      !Number.isInteger(column) ||
      column < 1 ||
      column >
        Math.max(
          f?.before.trimEnd().split("\n")[line - 1]?.length ?? 0,
          f?.after.trimEnd().split("\n")[line - 1]?.length ?? 0,
        ) +
          1
    )
      return
    change({ file: id, line: String(line), query: "", panel: "source" }, true)
  }
  function sheet(kind: "nav" | "review", next: boolean) {
    if (!admitted() || next === (kind === "nav" ? navOpen : reviewOpen)) return
    transition(() => {
      if (kind === "nav") setNavOpen(next)
      else setReviewOpen(next)
    })
  }
  function inspect() {
    if (!admitted() || !data.file || !data.run || !data.tool || !session.current) return
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    transition(() =>
      setInspection({
        value: {
          file: file?.id,
          path: file?.path,
          run: data.run,
          tool: data.tool,
          span: data.span ?? null,
          usage: data.usage ?? null,
          snapshot: data.fixture.clock,
        },
        outcome: "Held local metadata inspection; no code or tool executes.",
      }),
    )
    const stamp = life.current.lease,
      ticket = session.current.begin("inspect"),
      fileId = file?.id
    queue.current.push(() => {
      if (
        !life.current.alive ||
        life.current.lease !== stamp ||
        rendered.current !== identity ||
        data.file?.id !== fileId ||
        !data.tool ||
        !data.run
      )
        return
      ticket.commit(() =>
        setInspection((prev) =>
          prev
            ? {
                ...prev,
                outcome: "Metadata inspected locally. Supplied files, tool and graph unchanged.",
              }
            : null,
        ),
      )
    })
    setQueued(queue.current.length)
  }
  function release() {
    if (!admitted()) return
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  function close() {
    if (!admitted() || !inspection) return
    const target = origin.current
    transition(() => setInspection(null))
    const stamp = life.current.lease
    raf.current = requestAnimationFrame(() => {
      if (!life.current.alive || life.current.lease !== stamp || rendered.current !== identity)
        return
      if (target?.isConnected && target.getClientRects().length) target.focus()
      else heading.current?.focus()
    })
  }
  const fileTree = (
    <section className="workspace-files" aria-label="Project files">
      <h2>Review fixture</h2>
      <p className="muted">App-authored project grouping · supplied proposal files</p>
      <label>
        Find a file
        <input
          aria-label="Search project files"
          value={state.query}
          onChange={(e) => change({ query: e.target.value })}
        />
      </label>
      <p>
        {data.accessible
          ? `${data.matches.length} matched / ${data.files.length} supplied files`
          : "File count Unknown"}
      </p>
      <FileTree
        selectedPath={data.file?.path}
        expanded={expanded}
        onExpandedChange={(next) => {
          if (admitted()) setExpanded(next)
        }}
        onSelect={(path) => {
          const f = data.matches.find((f) => f.path === path)
          if (f) select(f.id)
        }}
      >
        {["src", "fixtures"].map((folder) => (
          <FileTreeFolder key={folder} path={folder} name={folder}>
            {data.matches
              .filter((f) => f.path.startsWith(`${folder}/`))
              .map((f) => (
                <FileTreeFile key={f.id} path={f.path} name={f.path.split("/").at(-1) ?? f.path} />
              ))}
          </FileTreeFolder>
        ))}
        {data.matches
          .filter((f) => !f.path.includes("/"))
          .map((f) => (
            <FileTreeFile key={f.id} path={f.path} name={f.path} />
          ))}
      </FileTree>
      <a href="/?view=Review+Workbench">Back to review lab</a>
    </section>
  )
  const controls = (
    <section className="workspace-review-controls" aria-label="Workspace fixture controls">
      <h2>Fixture review</h2>
      <p>
        {data.fixture.version} · snapshot {data.fixture.clock} · recorded {data.fixture.recordedAt}.
        Independent legacy records-8 snapshot; no Torque cutoff.
      </p>
      <label>
        Appearance
        <select
          aria-label="Workspace appearance"
          value={state.appearance}
          onChange={(e) =>
            change({ appearance: e.target.value as WorkspaceState["appearance"] }, true)
          }
        >
          {workspaceAppearances.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <label>
        Theme
        <select
          aria-label="Workspace theme"
          value={state.theme}
          onChange={(e) => change({ theme: e.target.value as WorkspaceState["theme"] }, true)}
        >
          {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Mode
        <select
          aria-label="Workspace mode"
          value={state.mode}
          onChange={(e) => change({ mode: e.target.value as WorkspaceState["mode"] }, true)}
        >
          <option>light</option>
          <option>dark</option>
        </select>
      </label>
      <Button
        onClick={() => {
          if (!admitted()) return
          navigation.current = true
          setRevision((n) => n + 1)
          change({ ...defaultWorkspaceState, theme: state.theme, mode: state.mode }, true)
        }}
      >
        Reset workspace context
      </Button>
      <Button onClick={release}>Release oldest metadata outcome ({queued})</Button>
    </section>
  )
  return (
    <AppShell
      className="workspace-example"
      header={
        <header className="workspace-header">
          <div className="workspace-mobile">
            <OverlaySidebar
              open={navOpen}
              onOpenChange={(next) => sheet("nav", next)}
              title="Project files"
              side="left"
              trigger={<Button variant="outline">Files</Button>}
            >
              {fileTree}
            </OverlaySidebar>
          </div>
          <div>
            <h1 ref={heading} tabIndex={-1}>
              Developer workspace
            </h1>
            <small>Snapshot · Read only</small>
          </div>
          <OverlaySidebar
            open={reviewOpen}
            onOpenChange={(next) => sheet("review", next)}
            title="Workspace review context"
            trigger={<Button variant="outline">Review context</Button>}
          >
            {controls}
          </OverlaySidebar>
        </header>
      }
      nav={<aside className="workspace-sidebar">{fileTree}</aside>}
    >
      <nav className="workspace-tabs" aria-label="Workspace panels">
        {workspacePanels.map((panel) => (
          <a
            key={panel}
            href={workspaceHref({ ...state, panel })}
            aria-current={state.panel === panel ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault()
              change({ panel }, true)
            }}
          >
            {titles[panel]}
          </a>
        ))}
      </nav>
      <main className="workspace-page" ref={body} aria-label="Workspace content">
        <p className="workspace-current">
          {data.file ? `${file?.id} · ${file?.path}:${state.line}` : "No admitted file selected"}
        </p>
        {!data.accessible ? (
          <p role="status">{state.appearance}: developer records withheld; count Unknown.</p>
        ) : !data.files.length ? (
          <p role="status">Observed empty workspace · 0 supplied files, nodes and relationships.</p>
        ) : (
          <>
            {state.appearance === "locked" && (
              <p>
                Locked source: read-only navigation and local metadata inspection remain available.
                No editor or execution actions.
              </p>
            )}
            {state.appearance === "degraded" && (
              <p role="status">
                Retained supplied snapshot; authored degraded-resource appearance. No refreshed
                records.
              </p>
            )}
            {state.panel === "source" && (
              <section aria-label="Readonly file evidence">
                <h2>{data.file?.path ?? "Select a matching file"}</h2>
                <p>
                  Before and Proposal are supplied fictional source evidence, not a saved patch. No
                  editor is mounted.
                </p>
                {data.file && (
                  <>
                    <div className="workspace-source-grid">
                      {(["before", "after"] as const).map((kind) => (
                        <section key={kind}>
                          <h3>{kind === "before" ? "Before" : "Proposal"}</h3>
                          <section
                            className="workspace-code"
                            aria-label={`${kind === "before" ? "Before" : "Proposal"} source`}
                            // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scroll for immutable source lines.
                            tabIndex={0}
                          >
                            <pre>
                              {file?.[kind]
                                .trimEnd()
                                .split("\n")
                                .map((line, i) => (
                                  <span
                                    className="workspace-code-line"
                                    key={`${kind}:${line}`}
                                    data-line={i + 1}
                                  >
                                    <span aria-hidden="true">{i + 1} </span>
                                    {line || " "}
                                    {"\n"}
                                  </span>
                                ))}
                            </pre>
                          </section>
                        </section>
                      ))}
                    </div>
                    <Button onClick={() => change({ panel: "diagnostics" }, true)}>
                      Review diagnostics for {file?.id}
                    </Button>
                    <Button onClick={() => change({ panel: "tool" }, true)}>
                      Open linked tool evidence
                    </Button>
                    {state.appearance === "long" && (
                      <section>
                        <h3>Authored long-content rendering sample</h3>
                        <p>
                          Separate from the three unchanged supplied files. Native region scroll
                          reaches the final line and literal horizontal endpoint.
                        </p>
                        <section
                          className="workspace-code workspace-long-code"
                          aria-label="Authored long source sample"
                          // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scroll for the separate authored long literal.
                          tabIndex={0}
                        >
                          <pre>
                            {Array.from(
                              { length: 40 },
                              (_, i) =>
                                `// Sample ${String(i + 1).padStart(2, "0")} ${i === 39 ? "<script>neverExecute()</script> https://example.invalid/not-a-link " + "literal ".repeat(55) + "END-OF-LITERAL" : "Read-only authored annotation, not additional repository source."}`,
                            ).join("\n")}
                          </pre>
                        </section>
                      </section>
                    )}
                  </>
                )}
              </section>
            )}
            <Suspense fallback={<p role="status">Loading local evidence presentation…</p>}>
              {state.panel === "diagnostics" && (
                <>
                  <p>
                    Project-wide diagnostic and proposal evidence. Opening a declared file clears
                    the local file search.
                  </p>
                  <DeveloperEvidence
                    key={`${identity}/${lease}`}
                    operations={data.operations}
                    embedded={{ onFileSelect: select }}
                  />
                </>
              )}
              {state.panel === "graph" && (
                <>
                  <p>
                    Project-wide graph: three supplied nodes and two authored inspection-order
                    relationships; no workflow executes. Opening the declared tool clears the local
                    file search.
                  </p>
                  <WorkflowReview
                    key={`${identity}/${lease}`}
                    operations={data.operations}
                    embedded
                  />
                  <Button
                    onClick={() => {
                      if (!admitted() || !data.files.length) return
                      change(
                        {
                          panel: "tool",
                          file: data.file?.id ?? data.files[0].id,
                          line: "1",
                          query: "",
                        },
                        true,
                      )
                    }}
                  >
                    Open declared tool from graph
                  </Button>
                </>
              )}
            </Suspense>
            {state.panel === "tool" && (
              <section aria-label="Declared tool evidence">
                <h2>{data.tool?.id ?? "Select a matching file to view its tool"}</h2>
                {data.tool && (
                  <>
                    <dl>
                      <dt>Run</dt>
                      <dd>
                        {data.run?.id} · {data.run?.status}
                      </dd>
                      <dt>Span</dt>
                      <dd>{data.span?.id ?? "No supplied span"}</dd>
                      <dt>Tool status</dt>
                      <dd>{data.tool.status}</dd>
                      <dt>Receipt</dt>
                      <dd>
                        {data.usage
                          ? `${data.usage.id} · ${data.usage.tokens} tokens · USD ${data.usage.cost}`
                          : "Unknown"}
                      </dd>
                    </dl>
                    <h3>Supplied input</h3>
                    <p>{data.tool.input}</p>
                    <h3>Supplied output</h3>
                    <p>{data.tool.output ?? "Outcome unavailable"}</p>
                    <Button onClick={inspect}>Inspect linked metadata</Button>
                    <Button onClick={() => change({ panel: "graph" }, true)}>
                      Review declared inspection graph
                    </Button>
                    <Button onClick={() => change({ panel: "source" }, true)}>
                      Return to selected file
                    </Button>
                  </>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <footer className="workspace-footer">
        Read-only review fixture · snapshot {data.fixture.clock} · evidence recorded{" "}
        {data.fixture.recordedAt} · no execution or saved edits
      </footer>
      <DetailDialog
        open={!!inspection}
        onClose={close}
        title="Linked developer metadata"
        meta={
          <span>
            {data.file?.id} · {data.run?.id} · {data.tool?.id}
          </span>
        }
        footer={<Button onClick={close}>Close metadata inspection</Button>}
      >
        {inspection && (
          <div className="workspace-inspection">
            <p>{inspection.outcome}</p>
            <Button onClick={release}>Release oldest metadata outcome ({queued})</Button>
            <div className="evidence-json">
              <JsonViewer value={inspection.value} />
            </div>
          </div>
        )}
      </DetailDialog>
    </AppShell>
  )
}
