import {
  Button,
  Callout,
  DetailDialog,
  EmptyState,
  JsonViewer,
  MetaList,
} from "@hollis-labs/design-components"
import {
  AccountPreferences,
  AccountProfile,
  type AccountProfileValue,
  type ApiTokenDraft,
  ApiTokenManager,
  ConnectedAccounts,
  WhoamiBadge,
} from "@hollis-labs/kit-account"
import { useEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import {
  type AccountAppearance,
  type AccountMode,
  type AccountReviewModel,
  accountAppearances,
  accountCandidate,
  accountModes,
  accountReviewModel,
  type CandidateIntent,
} from "./model"
export function AccountReview({
  context = "populated",
  initialState = "recorded",
  initialMode = "profile",
}: {
  context?: string
  initialState?: AccountAppearance
  initialMode?: AccountMode
}) {
  const [state, setState] = useState(initialState),
    [mode, setMode] = useState(initialMode),
    [principal, setPrincipal] = useState("USER-001"),
    [copy, setCopy] = useState(false),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const retire = useRef(() => {}),
    queue = useRef<(() => void)[]>([])
  const data = accountReviewModel(state, context, principal, copy)
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
  }
  function release() {
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  return (
    <section className="account-review" aria-label="Controlled account review">
      <div className="gallery-controls">
        <label>
          Account appearance{" "}
          <select
            aria-label="Account appearance"
            value={state}
            onChange={(e) => {
              setState(e.target.value as AccountAppearance)
              reset()
            }}
          >
            {accountAppearances.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Account composition{" "}
          <select
            aria-label="Account composition"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as AccountMode)
              reset()
            }}
          >
            {accountModes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Fixture principal{" "}
          <select
            aria-label="Fixture principal"
            value={principal}
            onChange={(e) => {
              setPrincipal(e.target.value)
              reset()
            }}
          >
            {data.fixture.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} · {u.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reviewed account source{" "}
          <select
            aria-label="Reviewed account source"
            value={copy ? "copy" : "original"}
            onChange={(e) => {
              setCopy(e.target.value === "copy")
              reset()
            }}
          >
            <option value="original">Original fixture</option>
            <option value="copy">Reviewed copy (same records)</option>
          </select>
        </label>
        <Button variant="outline" onClick={reset}>
          Reset account review
        </Button>
        <Button variant="outline" disabled={!queued} onClick={release}>
          Release oldest scripted inspection ({queued})
        </Button>
      </div>
      <Callout tone="info" title="Local candidate intents only">
        Save/Create/Revoke/Connect/Disconnect labels belong to the candidate. Every admitted
        callback only opens a local inspection; no records, status, identity, permissions or
        connections change. “Saving/Creating” are selected busy appearances, never execution. No
        credential exists or is disclosed. Built-in “will stop granting access” confirmation wording
        describes the upstream action, which this host does not execute.
      </Callout>
      <p className="muted">
        Unfiltered full snapshot {data.fixture.version} at {data.fixture.clock}; playback paused.
        Token/provider metadata is separately authored, not observed access evidence.
      </p>
      <Instance
        key={`${data.source}/${state}/${mode}/${revision}`}
        data={data}
        mode={mode}
        retireRef={retire}
        enqueue={(producer) => {
          queue.current.push(producer)
          setQueued(queue.current.length)
        }}
        release={release}
        reset={reset}
      />
    </section>
  )
}
function Instance({
  data,
  mode,
  retireRef,
  enqueue,
  release,
  reset,
}: {
  data: AccountReviewModel
  mode: AccountMode
  retireRef: React.MutableRefObject<() => void>
  enqueue: (producer: () => void) => void
  release: () => void
  reset: () => void
}) {
  const [profile, setProfile] = useState(data.profile),
    [preferences, setPreferences] = useState({ density: "comfortable", annotations: false }),
    [draft, setDraft] = useState(data.draft),
    [revoke, setRevoke] = useState<string | null>(null),
    [plan, setPlan] = useState<CandidateIntent | null>(null),
    [result, setResult] = useState(""),
    [, rerender] = useState(0)
  const source = `${data.source}/${data.state}/${mode}`,
    current = useRef({
      alive: false,
      lease: 0,
      source,
      profile: data.profile,
      preferences: { density: "comfortable", annotations: false },
      draft: data.draft,
      revoke: null as string | null,
      plan: null as CandidateIntent | null,
    }),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    ticket = useRef<AdminPresentationTicket | null>(null),
    origin = useRef<HTMLElement | null>(null),
    raf = useRef<number | null>(null)
  current.current.source = source
  const captured = current.current.lease
  const admitted = () =>
    current.current.alive && current.current.source === source && current.current.lease === captured
  function cancelFocus() {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = null
  }
  function retire() {
    current.current.lease++
    current.current.plan = null
    current.current.revoke = null
    ticket.current?.cancel()
    ticket.current = null
    session.current?.reset(source, `${source}/${current.current.lease}`)
    cancelFocus()
    setPlan(null)
    setResult("")
    setRevoke(null)
  }
  useEffect(() => {
    const active = createAdminPresentationSession(source, source, ["inspect"])
    session.current = active
    current.current.alive = true
    current.current.lease++
    rerender((n) => n + 1)
    const stop = () => {
      current.current.alive = false
      current.current.lease++
      current.current.plan = null
      current.current.revoke = null
      ticket.current?.cancel()
      active.dispose()
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      raf.current = null
    }
    retireRef.current = stop
    return () => {
      stop()
      if (retireRef.current === stop) retireRef.current = () => {}
    }
  }, [source, retireRef])
  function editProfile(value: AccountProfileValue) {
    if (!admitted() || !data.editable) return
    retire()
    current.current.profile = value
    setProfile(value)
  }
  function editDraft(value: ApiTokenDraft) {
    if (!admitted() || !data.editable) return
    retire()
    current.current.draft = { name: value.name, scopes: [...value.scopes] }
    setDraft(current.current.draft)
  }
  function editPreference(value: typeof preferences) {
    if (!admitted() || !data.editable) return
    retire()
    current.current.preferences = value
    setPreferences(value)
  }
  function selectTarget(id: string | null) {
    if (!admitted()) return
    if (
      id !== null &&
      !accountCandidate(
        data,
        "revoke",
        current.current.profile,
        current.current.preferences,
        current.current.draft,
        id,
      )
    )
      return
    retire()
    current.current.revoke = id
    setRevoke(id)
  }
  function inspect(kind: CandidateIntent["kind"], target = "", submitted?: unknown) {
    if (!admitted() || current.current.plan) return
    const now = current.current
    if (kind === "revoke" && now.revoke !== target) return
    const candidate = accountCandidate(data, kind, now.profile, now.preferences, now.draft, target)
    if (
      !candidate ||
      (submitted !== undefined && JSON.stringify(submitted) !== JSON.stringify(candidate.value))
    )
      return
    cancelFocus()
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    current.current.lease++
    const lease = current.current.lease
    current.current.revoke = null
    setRevoke(null)
    current.current.plan = candidate
    setPlan(candidate)
    setResult("Held local inspection. Release oldest scripted outcome; nothing is executed.")
    const active = session.current?.begin("inspect")
    if (!active) return
    ticket.current = active
    enqueue(() => {
      const fresh = accountCandidate(
        data,
        kind,
        current.current.profile,
        current.current.preferences,
        current.current.draft,
        target,
      )
      if (
        !current.current.alive ||
        current.current.source !== source ||
        current.current.lease !== lease ||
        current.current.plan !== candidate ||
        !fresh ||
        JSON.stringify(fresh) !== JSON.stringify(candidate)
      ) {
        active.cancel()
        return
      }
      active.commit(() =>
        setResult(
          "Candidate intent inspected locally. Supplied principal, metadata, permissions and status unchanged.",
        ),
      )
    })
  }
  function close() {
    if (!admitted() || !current.current.plan) return
    retire()
    const lease = current.current.lease,
      target = origin.current
    raf.current = requestAnimationFrame(() => {
      raf.current = null
      if (
        current.current.alive &&
        current.current.source === source &&
        current.current.lease === lease &&
        !current.current.plan &&
        target === origin.current &&
        target?.isConnected
      )
        target.focus()
    })
  }
  return (
    <>
      <WhoamiBadge identity={data.identity} />
      <p data-testid="account-review-source" className="muted">
        Source: {data.source}. Profile edits never assert identity or assurance.
      </p>
      {data.denied ? (
        <EmptyState
          variant="error"
          title="Account evidence withheld"
          description="Denied presentation policy; no principal details, drafts or access metadata are mounted."
        />
      ) : !data.identified ? (
        <p role="status">
          No identified fixture principal. Profile/preferences and token/provider metadata are
          withheld.
        </p>
      ) : (
        <>
          <MetaList
            items={[
              { label: "Principal", value: data.principal.id },
              { label: "Fixture roles", value: data.principal.roleIds.join(", ") },
              {
                label: "Presentation policy",
                value: data.editable
                  ? "Local draft enabled; no evaluator"
                  : "Read-only / busy; candidate intents withheld",
              },
            ]}
          />
          {mode === "profile" ? (
            <div className="admin-columns">
              <AccountProfile
                value={profile}
                onValueChange={editProfile}
                onSave={(value) => inspect("profile", "", value)}
                readOnly={!data.editable && !data.busy}
                saving={data.busy}
                canSave={!!accountCandidate(data, "profile", profile, preferences, draft, "")}
                error={
                  !accountCandidate(data, "profile", profile, preferences, draft, "") &&
                  data.editable
                    ? "Enter a nonempty display name and a valid optional email; native validity and host guard refuse inspection"
                    : undefined
                }
                notice="Local alias draft only; fictional identity badge remains unchanged."
              />
              <AccountPreferences
                description="Controlled review preferences only. Save opens a local intent inspection."
                onSave={() => inspect("preferences")}
                readOnly={!data.editable && !data.busy}
                saving={data.busy}
                canSave={data.editable}
              >
                <label>
                  Review density{" "}
                  <select
                    aria-label="Review density"
                    value={preferences.density}
                    onChange={(e) => editPreference({ ...preferences, density: e.target.value })}
                  >
                    <option>comfortable</option>
                    <option>compact</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.annotations}
                    onChange={(e) =>
                      editPreference({ ...preferences, annotations: e.target.checked })
                    }
                  />{" "}
                  Show authored annotations
                </label>
              </AccountPreferences>
            </div>
          ) : (
            <div className="admin-columns">
              <ApiTokenManager
                tokens={data.tokens}
                scopeOptions={data.scopes}
                draft={draft}
                onDraftChange={editDraft}
                onCreate={(value) => inspect("create", "", value)}
                canCreate={data.editable || data.busy}
                creating={data.busy}
                loading={data.state === "metadata-loading"}
                error={
                  data.state === "metadata-error"
                    ? "Authored metadata failure; retained fixture snapshot"
                    : undefined
                }
                revokeTargetId={revoke}
                onRevokeTargetChange={selectTarget}
                onRevoke={(id) => inspect("revoke", id)}
                revoking={data.busy}
              />
              <ConnectedAccounts
                loading={data.state === "metadata-loading"}
                error={
                  data.state === "metadata-error"
                    ? "Authored provider metadata failure; no request made"
                    : undefined
                }
                accounts={data.providers}
                disabled={!data.editable}
                onConnect={(id) => inspect("connect", id)}
                onDisconnect={(id) => inspect("disconnect", id)}
              />
            </div>
          )}
        </>
      )}
      <DetailDialog
        open={plan !== null}
        onClose={close}
        title="Local account candidate intent"
        widthClassName="settings-plan-dialog"
        footer={
          <div className="gallery-controls settings-plan-footer">
            <Button variant="outline" onClick={release}>
              Release oldest scripted inspection
            </Button>
            <Button variant="outline" onClick={close}>
              Close inspection
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset account review
            </Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          <MetaList
            items={[
              { label: "Source", value: data.source },
              { label: "Fixed UTC", value: data.fixture.clock },
              { label: "Principal", value: data.principal.id },
            ]}
          />
          <p role="status">{result}</p>
          <JsonViewer value={plan} className="evidence-json" />
        </div>
      </DetailDialog>
    </>
  )
}
