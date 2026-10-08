import { Button, EmptyState } from "@hollis-labs/design-components"
import {
  Commit,
  CommitContent,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFiles,
  CommitHash,
  CommitHeader,
  CommitMessage,
  StackTrace,
  StackTraceContent,
  StackTraceFrames,
  StackTraceHeader,
  Test,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
} from "@hollis-labs/kit-code"
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import {
  admittedFile,
  developerEvidenceModel,
  type EvidenceModel,
  type EvidenceState,
  evidenceStates,
} from "./model"
import "./review.css"
export function DeveloperEvidence({
  operations,
  initialState = "recorded",
  epoch = 0,
}: {
  operations: OperationsModel
  initialState?: EvidenceState
  epoch?: number
}) {
  return (
    <ReviewFrame
      key={`${developerEvidenceModel(operations, initialState).source}/${epoch}`}
      operations={operations}
      initialState={initialState}
    />
  )
}
function ReviewFrame({
  operations,
  initialState,
}: {
  operations: OperationsModel
  initialState: EvidenceState
}) {
  const [state, setState] = useState(initialState),
    [copy, setCopy] = useState(0)
  const data = developerEvidenceModel(operations, state)
  return (
    <section className="developer-evidence">
      <div className="evidence-review-controls">
        <label>
          Developer appearance{" "}
          <select
            aria-label="Developer evidence appearance"
            value={state}
            onChange={(e) => {
              if (evidenceStates.includes(e.target.value as EvidenceState))
                setState(e.target.value as EvidenceState)
            }}
          >
            {evidenceStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Button onClick={() => setCopy((c) => c + 1)}>Reset developer evidence</Button>
        <Button onClick={() => setCopy((c) => c + 1)}>Replace review source copy</Button>
      </div>
      <p className="muted">
        {data.fixture.version} · recorded {data.fixture.recordedAt} · review cutoff {data.cutoff}.
        Test ledger is an authored presentation example, not executed CI. Files and commit are
        fictional supplied proposal evidence.
      </p>
      <EvidenceInstance key={`${data.source}/${copy}`} data={data} />
    </section>
  )
}
function EvidenceInstance({ data }: { data: EvidenceModel }) {
  const [suite, setSuite] = useState(true),
    [stack, setStack] = useState(true),
    [commit, setCommit] = useState(true),
    [selection, setSelection] = useState<{ id: string; line: number; column: number } | null>(null)
  const [navigationNote, setNavigationNote] = useState("")
  const current = useRef({ alive: false, lease: 0 }),
    [, refresh] = useState(0)
  useLayoutEffect(() => {
    current.current.alive = true
    current.current.lease++
    refresh((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
    }
  }, [])
  const lease = current.current.lease,
    allowed = () => current.current.alive && current.current.lease === lease && data.available
  function select(id: string, line = 1, column = 1) {
    if (!allowed()) return
    if (!admittedFile(data, id, line, column)) {
      setNavigationNote("File or line unavailable in supplied source")
      return
    }
    setNavigationNote("")
    current.current.lease++
    setSelection({ id, line, column })
  }
  if (!data.available)
    return (
      <EmptyState
        variant={data.state === "loading" ? "empty" : "error"}
        title={data.blockedReason}
        description="No test, stack, file or commit payload is admitted here. Change the bounded fixture frame, source or appearance; no collection occurs."
      />
    )
  const selected = selection
    ? admittedFile(data, selection.id, selection.line, selection.column)
    : null
  const completed = data.summary.passed + data.summary.failed
  return (
    <>
      <div className="developer-evidence-grid">
        <section aria-label="Authored test ledger">
          <h2>Authored test review</h2>
          <p className="muted">
            {data.summary.total} supplied examples · {completed} passed or failed ·{" "}
            {data.summary.skipped} skipped ·{" "}
            {data.cases.filter((c) => c.status === "running").length} passive running. Durations are
            authored milliseconds; missing duration is not zero.
          </p>
          <TestResults summary={data.summary}>
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsDuration />
            </TestResultsHeader>
            <TestResultsContent>
              <TestResultsProgress />
              <p className="muted">
                Passed-or-failed progress: {completed}/{data.summary.total}; skipped/running remain
                outside completion.{" "}
                {data.summary.total === 0
                  ? "Observed empty ledger; zero denominator, no completion assertion."
                  : "Finite authored denominator."}
              </p>
              {data.cases.length ? (
                <TestSuite
                  name="Recorded review examples"
                  status={data.state === "running" ? "running" : "failed"}
                  open={suite}
                  onOpenChange={(open) => {
                    if (allowed()) setSuite(open)
                  }}
                >
                  <TestSuiteName />
                  <TestSuiteContent>
                    {data.cases.map((c) => (
                      <div key={c.id}>
                        <Test name={c.name} status={c.status} duration={c.duration} />
                        <p className="developer-case-meta">
                          {c.id} · {c.fileId} ·{" "}
                          {c.duration === undefined
                            ? "Duration unavailable"
                            : `${c.duration}ms authored`}{" "}
                          <Button size="sm" variant="ghost" onClick={() => select(c.fileId)}>
                            Inspect case file {c.fileId}
                          </Button>
                        </p>
                        {c.error && (
                          <TestError>
                            <TestErrorMessage>{c.error}</TestErrorMessage>
                            <TestErrorStack>
                              {data.fixture.stack +
                                (data.state === "long-content"
                                  ? "\n" + "Authored long error text. ".repeat(80)
                                  : "")}
                            </TestErrorStack>
                          </TestError>
                        )}
                      </div>
                    ))}
                  </TestSuiteContent>
                </TestSuite>
              ) : (
                <p>Observed empty ledger · no suites.</p>
              )}
            </TestResultsContent>
          </TestResults>
        </section>
        <section aria-label="Recorded stack and commit">
          <h2>Recorded stack / proposal</h2>
          <p className="muted">
            {data.run?.id} · run {data.run?.status ?? "unavailable"} · {data.tool?.id} · tool{" "}
            {data.tool?.status ?? "unavailable"} ·{" "}
            {data.usage ? `${data.usage.tokens} recorded tokens` : "Usage receipt unavailable"}.
            Native file links only admit declared bounded lines.
          </p>
          <StackTrace
            trace={data.trace}
            open={stack}
            onOpenChange={(open) => {
              if (allowed()) setStack(open)
            }}
            onFilePathClick={(path, line, column) => {
              if (!allowed()) return
              const f = data.files.find((f) => f.path === path)
              if (f) select(f.id, line ?? 1, column ?? 1)
              else setNavigationNote("File or line unavailable in supplied source")
            }}
          >
            <StackTraceHeader>
              {data.trace.split("\n")[0] || "Observed empty stack"}
            </StackTraceHeader>
            <StackTraceContent maxHeight="none">
              <StackTraceFrames />
            </StackTraceContent>
          </StackTrace>
          {data.state === "unknown" && (
            <p>
              Appended authored unclassified frame remains raw text; authoritative FixtureRefusal
              header is unchanged.
            </p>
          )}
          <Commit
            open={commit}
            onOpenChange={(open) => {
              if (allowed()) setCommit(open)
            }}
          >
            <CommitHeader>
              <CommitHash>{data.fixture.commitHash.slice(0, 8)}</CommitHash>
              <CommitMessage>Fictional inspect-mode proposal</CommitMessage>
            </CommitHeader>
            <CommitContent>
              <p className="developer-commit-caption">
                Recorded UTC{" "}
                <time dateTime={data.fixture.recordedAt}>{data.fixture.recordedAt}</time> ·{" "}
                {data.files.length} declared files · whole-line replacement counts; no repository
                write
              </p>
              <CommitFiles>
                {data.files.map((f) => {
                  const before = f.before.trimEnd().split("\n"),
                    after = f.after.trimEnd().split("\n"),
                    same = before.filter((line) => after.includes(line)).length
                  return (
                    <CommitFile key={f.id}>
                      <CommitFileInfo>
                        <CommitFileStatus status="modified" />
                        <CommitFilePath>
                          <Button variant="ghost" size="sm" onClick={() => select(f.id)}>
                            Inspect proposal {f.path}
                          </Button>
                        </CommitFilePath>
                      </CommitFileInfo>
                      <CommitFileChanges>
                        <CommitFileAdditions count={after.length - same} />
                        <CommitFileDeletions count={before.length - same} />
                      </CommitFileChanges>
                    </CommitFile>
                  )
                })}
              </CommitFiles>
            </CommitContent>
          </Commit>
        </section>
      </div>
      {navigationNote && <p role="status">{navigationNote}</p>}
      <section aria-label="Selected developer file" className="developer-file-evidence">
        <h2>
          {selected
            ? `${selected.file.id} · ${selected.file.path}:${selected.line}:${selected.column}`
            : "Select declared file evidence"}
        </h2>
        {selected ? (
          <>
            <p>
              {selected.file.runId} · {selected.file.toolId} · immutable supplied source; local
              selection only.
            </p>
            <div className="developer-evidence-grid">
              <section>
                <h3>Before</h3>
                <pre>{selected.file.before}</pre>
              </section>
              <section>
                <h3>Proposal</h3>
                <pre>{selected.file.after}</pre>
                {data.state === "long-content" && (
                  <pre data-testid="authored-long-source">
                    {"// Authored rendering sample, not additional supplied source. ".repeat(80)}
                  </pre>
                )}
              </section>
            </div>
            <Button
              onClick={() => {
                if (allowed()) {
                  current.current.lease++
                  setSelection(null)
                }
              }}
            >
              Clear file inspection
            </Button>
          </>
        ) : (
          <p>
            No source opened; native stack links, case buttons and proposal rows inspect the same
            three declared files.
          </p>
        )}
      </section>
    </>
  )
}
export default DeveloperEvidence
