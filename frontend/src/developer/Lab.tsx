import { Button } from "@hollis-labs/design-components"
import {
  CodeBlock,
  Commit,
  CommitContent,
  CommitHash,
  CommitHeader,
  CommitMessage,
  CommitTimestamp,
  FileTree,
  FileTreeFile,
  FileTreeFolder,
  Snippet,
  SnippetInput,
  StackTrace,
  StackTraceContent,
  StackTraceFrames,
  StackTraceHeader,
  Test,
  TestResults,
  TestResultsContent,
  TestResultsSummary,
} from "@hollis-labs/kit-code"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Code2 } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { type DeveloperState, developerModel, developerStates } from "./model"
import "./developer.css"

const Output = lazy(() => import("./Output"))
const Workflow = lazy(() => import("./Workflow"))
export function DeveloperLab({
  initialState = "normal",
  initialView = "Source",
  onInspect,
  onIntent,
}: {
  initialState?: DeveloperState
  initialView?: string
  onInspect: (id: string) => void
  onIntent: (s: string) => void
}) {
  const [state, setState] = useState<DeveloperState>(initialState),
    [view, setView] = useState(initialView),
    [path, setPath] = useState("src/review.ts"),
    [draft, setDraft] = useState<string | null>(null),
    [selection, setSelection] = useState(""),
    [query, setQuery] = useState(""),
    [expanded, setExpanded] = useState(new Set(["src", "fixtures"]))
  const model = developerModel(state),
    file = model.files.find((f) => f.path === path),
    node = model.nodes.find((n) => n.id === selection),
    edge = model.edges.find((e) => e.id === selection)
  function reset(next: DeveloperState) {
    setState(next)
    setPath("src/review.ts")
    setDraft(null)
    setSelection("")
    setQuery("")
    setExpanded(new Set(["src", "fixtures"]))
    onIntent("")
  }
  function choose(next: string) {
    setPath(next)
    setDraft(null)
    onIntent("")
  }
  return (
    <div className="administration-lab developer-lab">
      <fieldset className="control-group">
        <legend>Developer review</legend>
        <label>
          Evidence state{" "}
          <select
            aria-label="Developer state"
            value={state}
            onChange={(e) => reset(e.target.value as DeveloperState)}
          >
            {developerStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {["Source", "Diff", "Records", "Output", "Workflow"].map((v) => (
          <Button key={v} size="sm" aria-pressed={view === v} onClick={() => setView(v)}>
            {v}
          </Button>
        ))}
      </fieldset>
      <p className="muted">
        {model.fixture.version} · seed{model.fixture.seed} · {model.fixture.recordedAt} UTC · joins{" "}
        {model.run.id}/{model.tool.id}/{model.run.traceId}. Authored proposal and output, not
        repository files.
      </p>
      {!model.accessible ? (
        <div role="status" className="notice">
          {state === "loading"
            ? "Loading authored developer evidence"
            : state === "denied"
              ? "Developer evidence denied; content withheld"
              : "Developer evidence failed to load; no retained content"}
        </div>
      ) : state === "empty" ? (
        <p role="status">No developer files or workflow records.</p>
      ) : (
        <>
          <Suspense fallback={<p role="status">Loading reviewed presentation…</p>}>
            {view === "Workflow" ? (
              <>
                <Workflow key={state} model={model} selection={selection} onSelect={setSelection} />
                <Panel icon={<Code2 className="size-4" />} title="Nodes and relationships">
                  <div className="inspection-records">
                    {model.nodes.map((n) => (
                      <Button
                        key={n.id}
                        aria-pressed={selection === n.id}
                        onClick={() => setSelection(n.id)}
                      >
                        {n.id} · {n.label}
                      </Button>
                    ))}
                    {model.edges.map((e) => (
                      <Button
                        key={e.id}
                        aria-pressed={selection === e.id}
                        onClick={() => setSelection(e.id)}
                      >
                        {e.id} · {e.source} → {e.target}
                      </Button>
                    ))}
                  </div>
                  {node ? (
                    <div>
                      <h3>{node.label}</h3>
                      <p>
                        {node.id} · kind {node.kind}
                      </p>
                      <p>
                        {node.runId} / {node.spanId || "No span for result summary"} /{" "}
                        {node.toolId || "No tool for this node"}
                      </p>
                      {node.kind === "tool" ? (
                        <>
                          <p>
                            {model.tool.status}: {model.tool.output}
                          </p>
                          <p>
                            {model.usage.id} · {model.usage.tokens} recorded tokens
                          </p>
                        </>
                      ) : null}
                      <Button onClick={() => onInspect(model.run.taskId)}>
                        Inspect related run (full snapshot)
                      </Button>
                    </div>
                  ) : edge ? (
                    <div>
                      <h3>{edge.id}</h3>
                      <p>
                        {edge.source} → {edge.target} · {edge.label}
                      </p>
                    </div>
                  ) : (
                    <p>Select a node or relationship to inspect its fixture links.</p>
                  )}
                  <Button
                    variant="outline"
                    onClick={() =>
                      onIntent(
                        "Workflow run intent refused: this review cannot execute or save a graph.",
                      )
                    }
                  >
                    Inspect workflow run intent
                  </Button>
                </Panel>
              </>
            ) : view === "Output" ? (
              <Output />
            ) : view === "Records" ? (
              <>
                <Panel icon={<Code2 className="size-4" />} title="Authored commit proposal">
                  <Commit defaultOpen>
                    <CommitHeader>
                      <CommitHash>{model.fixture.commitHash.slice(0, 8)}</CommitHash>
                      <CommitMessage>Fixture proposal: inspect mode</CommitMessage>
                    </CommitHeader>
                    <CommitContent>
                      <p>Synthetic proposal hash; no Git commit was applied.</p>
                      <CommitTimestamp date={new Date(model.fixture.recordedAt)}>
                        {model.fixture.recordedAt} UTC
                      </CommitTimestamp>
                      {model.files.map((f) => (
                        <p key={f.id}>
                          {f.path} · modified · {f.id}
                        </p>
                      ))}
                    </CommitContent>
                  </Commit>
                </Panel>
                <Panel icon={<Code2 className="size-4" />} title="Recorded refusal stack">
                  <StackTrace
                    trace={model.fixture.stack}
                    defaultOpen
                    onFilePathClick={(p) => {
                      choose(p)
                      setView("Source")
                    }}
                  >
                    <StackTraceHeader>Fixture refusal stack</StackTraceHeader>
                    <StackTraceContent maxHeight="none">
                      <StackTraceFrames />
                    </StackTraceContent>
                  </StackTrace>
                </Panel>
                <Panel icon={<Code2 className="size-4" />} title="Authored test results">
                  <TestResults
                    summary={{ passed: 1, failed: 1, skipped: 1, total: 3, duration: 0 }}
                  >
                    <TestResultsSummary />
                    <TestResultsContent>
                      <Test name="Fixture join IDs" status="passed" duration={0} />
                      <Test name="Application effect denied" status="failed" duration={0} />
                      <Test name="Provider execution unavailable" status="skipped" />
                    </TestResultsContent>
                  </TestResults>
                  <p className="muted">
                    Authored demonstration results, not tests executed by this UI.
                  </p>
                  <Snippet code="review-fixture --inspect-only">
                    <SnippetInput aria-label="Static command example" />
                  </Snippet>
                </Panel>
              </>
            ) : (
              <>
                <label>
                  Filter fixture files{" "}
                  <input
                    aria-label="Filter developer files"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <FileTree
                  expanded={expanded}
                  onExpandedChange={setExpanded}
                  selectedPath={path}
                  onSelect={choose}
                >
                  {["src", "fixtures"].map((folder) => (
                    <FileTreeFolder key={folder} path={folder} name={folder}>
                      {model.files
                        .filter((f) => f.path.startsWith(`${folder}/`) && f.path.includes(query))
                        .map((f) => (
                          <FileTreeFile
                            key={f.id}
                            path={f.path}
                            name={f.path.split("/").at(-1) ?? f.path}
                          />
                        ))}
                    </FileTreeFolder>
                  ))}
                  {model.files
                    .filter((f) => !f.path.includes("/") && f.path.includes(query))
                    .map((f) => (
                      <FileTreeFile key={f.id} path={f.path} name={f.path} />
                    ))}
                </FileTree>
                {!model.files.some((f) => f.path.includes(query)) ? (
                  <p>No matching fixture files.</p>
                ) : null}
                {file ? (
                  <Panel
                    icon={<Code2 className="size-4" />}
                    title={view === "Diff" ? "Before and proposed text" : "Source review"}
                    meta={file.path}
                  >
                    {view === "Diff" ? (
                      <>
                        <p className="muted">
                          App-owned before/after composition; no diff engine or applied change.
                        </p>
                        <h3>Before</h3>
                        <CodeBlock code={file.before} language={file.language} />
                        <h3>Proposed</h3>
                        <CodeBlock code={draft ?? file.after} language={file.language} />
                      </>
                    ) : (
                      <>
                        <CodeBlock code={draft ?? file.after} language={file.language} />
                        <label>
                          Transient source draft
                          <textarea
                            aria-label="Transient source draft"
                            value={draft ?? file.after}
                            disabled={!model.editable}
                            maxLength={8192}
                            onChange={(e) => {
                              setDraft(e.target.value)
                              onIntent("")
                            }}
                          />
                        </label>
                        <p className="muted">
                          {model.editable
                            ? "Local draft only; file selection/context retirement discards it."
                            : "Read-only presentation; unknown/locked state cannot draft."}
                        </p>
                        <Button
                          onClick={() =>
                            onIntent(
                              `Source save intent refused for ${file.path}; no file is written.`,
                            )
                          }
                          disabled={!model.editable}
                        >
                          Inspect source save intent
                        </Button>
                      </>
                    )}
                  </Panel>
                ) : (
                  <p>Choose a fixture file.</p>
                )}
              </>
            )}
          </Suspense>
        </>
      )}
    </div>
  )
}
export default DeveloperLab
