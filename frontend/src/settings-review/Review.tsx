import { Button, Callout, DetailDialog, JsonViewer, MetaList } from "@hollis-labs/design-components"
import {
  inspectSettingsGroup,
  type SettingsDraft,
  SettingsGroupForm,
  SettingsProvenanceRenderer,
  SettingsRenderer,
  SettingsWizard,
  type SettingsWizardIntent,
  settingsWizardEvaluation,
  settingsWizardGroups,
} from "@hollis-labs/kit-settings"
import { useEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import {
  type FieldMode,
  type FieldState,
  fieldModes,
  fieldStates,
  groupEvaluation,
  replaceDraft,
  settingsReviewModel,
} from "./model"
export function SettingsReview({
  context = "populated",
  initialState = "recorded",
  initialMode = "provenance",
}: {
  context?: string
  initialState?: FieldState
  initialMode?: FieldMode
}) {
  const [state, setState] = useState(initialState),
    [mode, setMode] = useState(initialMode),
    [revision, setRevision] = useState(0),
    [copy, setCopy] = useState(false),
    [queued, setQueued] = useState(0)
  const controls = useRef<HTMLSelectElement>(null),
    retire = useRef<() => void>(() => {}),
    queue = useRef<(() => void)[]>([])
  const data = settingsReviewModel(state, context, copy)
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
    controls.current?.focus()
  }
  function release() {
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  function enqueue(producer: () => void) {
    queue.current.push(producer)
    setQueued(queue.current.length)
  }
  return (
    <section className="settings-review" aria-label="Controlled settings review">
      <div className="gallery-controls">
        <label>
          Settings appearance{" "}
          <select
            ref={controls}
            aria-label="Settings appearance"
            value={state}
            onChange={(e) => {
              setState(e.target.value as FieldState)
              reset()
            }}
          >
            {fieldStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Settings composition{" "}
          <select
            aria-label="Settings composition"
            value={mode}
            onChange={(e) => {
              retire.current()
              setMode(e.target.value as FieldMode)
              setRevision((n) => n + 1)
            }}
          >
            {fieldModes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Reviewed settings source{" "}
          <select
            aria-label="Reviewed settings source"
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
          Reset settings review
        </Button>
        <Button variant="outline" disabled={!queued} onClick={release}>
          Release oldest scripted inspection ({queued})
        </Button>
      </div>
      <p className="muted">
        Unfiltered full snapshot {data.fixture.version} at {data.fixture.clock}; playback is paused.
        Review controls are separately authored form-only examples. Reviewed copy changes source
        identity, not observations.
      </p>
      <Callout tone="info" title="Presentation only">
        No save, restart or connectivity callbacks are provided. Wizard “Submit setup” and its
        upstream saving explanation only request a local candidate-plan inspection here; no values
        are applied and no saved results are reported. Presence metadata contains no secret value or
        replacement input.
      </Callout>
      <ReviewInstance
        key={`${data.source}/${state}/${mode}/${revision}`}
        data={data}
        mode={mode}
        retireRef={retire}
        reset={reset}
        enqueue={enqueue}
        release={release}
        queued={queued}
      />
    </section>
  )
}
function ReviewInstance({
  data,
  mode,
  retireRef,
  reset,
  enqueue,
  release,
  queued,
}: {
  data: ReturnType<typeof settingsReviewModel>
  mode: FieldMode
  retireRef: React.MutableRefObject<() => void>
  reset: () => void
  enqueue: (producer: () => void) => void
  release: () => void
  queued: number
}) {
  const [states, setStates] = useState(data.states),
    [groupId, setGroupId] = useState(data.groups[0]?.id ?? ""),
    [step, setStep] = useState(0),
    [open, setOpen] = useState(false),
    [plan, setPlan] = useState<readonly SettingsWizardIntent[]>([]),
    [result, setResult] = useState(""),
    [, setLifetimeRevision] = useState(0)
  const source = `${data.source}/${data.state}/${mode}`,
    current = useRef({
      alive: false,
      lease: 0,
      source,
      open: false,
      states: data.states,
      groupId: data.groups[0]?.id ?? "",
      step: 0,
      mode,
    }),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    ticket = useRef<AdminPresentationTicket | null>(null),
    origin = useRef<HTMLElement | null>(null),
    focusFrame = useRef<number | null>(null)
  current.current.source = source
  const captured = current.current.lease
  function cancelFocus() {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = null
  }
  function admitted() {
    return (
      current.current.alive &&
      current.current.source === source &&
      current.current.lease === captured
    )
  }
  function retirePresentation() {
    current.current.lease++
    current.current.open = false
    ticket.current?.cancel()
    ticket.current = null
    session.current?.reset(source, `${source}/${current.current.lease}`)
    cancelFocus()
    setOpen(false)
    setPlan([])
    setResult("")
  }
  useEffect(() => {
    const activeSession = createAdminPresentationSession(source, source, ["inspect"])
    session.current = activeSession
    current.current.lease++
    current.current.alive = true
    setLifetimeRevision((n) => n + 1)
    const stop = () => {
      current.current.alive = false
      current.current.lease++
      current.current.open = false
      activeSession.dispose()
      if (session.current === activeSession) session.current = null
      ticket.current?.cancel()
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      focusFrame.current = null
    }
    retireRef.current = stop
    return () => {
      stop()
      if (retireRef.current === stop) retireRef.current = () => {}
    }
  }, [retireRef, source])
  function draft(id: string, next: SettingsDraft) {
    if (
      !admitted() ||
      !data.editable ||
      current.current.open ||
      !data.groups.some((g) => g.id === id)
    )
      return
    const g = data.groups.find((g) => g.id === id)!,
      before = current.current.states[id],
      after = replaceDraft(current.current.states, id, next),
      checked = groupEvaluation(g, after[id], mode === "provenance")
    if (!before || before.busy || checked.problem) return
    const profile = inspectSettingsGroup(g)
    if (
      typeof profile === "string" ||
      Object.keys(next).some((key) => {
        const field = profile.fields.find((f) => f.key === key)
        return !field || field.secret || !field.editable || !before.values[key]?.editable
      })
    )
      return
    retirePresentation()
    current.current.states = after
    setStates(after)
  }
  function choose(id: string) {
    if (!admitted() || !data.groups.some((g) => g.id === id)) return
    retirePresentation()
    current.current.groupId = id
    setGroupId(id)
  }
  function move(next: number) {
    if (
      !admitted() ||
      current.current.open ||
      !Number.isInteger(next) ||
      next < 0 ||
      next > data.groups.length
    )
      return
    retirePresentation()
    current.current.step = next
    setStep(next)
  }
  function inspect(candidate: readonly SettingsWizardIntent[], wizard = false) {
    if (!admitted() || data.denied || !data.editable || current.current.open) return
    if (
      wizard &&
      (current.current.mode !== "wizard" || current.current.step !== data.groups.length)
    )
      return
    const groups = wizard
      ? settingsWizardGroups(data.groups)
      : data.groups.filter((g) => g.id === current.current.groupId)
    const evaluation = settingsWizardEvaluation(groups, current.current.states)
    if (
      !evaluation.complete ||
      groups.some((g) => current.current.states[g.id]?.busy) ||
      JSON.stringify(candidate) !== JSON.stringify(evaluation.plan)
    )
      return
    cancelFocus()
    current.current.lease++
    const lease = current.current.lease
    current.current.open = true
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPlan(candidate)
    setOpen(true)
    setResult("Held local inspection; release the oldest scripted outcome. No saving or execution.")
    const active = session.current?.begin("inspect")
    if (!active) return
    ticket.current = active
    enqueue(() => {
      const fresh = settingsWizardEvaluation(groups, current.current.states)
      if (
        !current.current.alive ||
        current.current.source !== source ||
        current.current.lease !== lease ||
        !current.current.open ||
        (wizard &&
          (current.current.mode !== "wizard" || current.current.step !== data.groups.length)) ||
        !fresh.complete ||
        groups.some((g) => current.current.states[g.id]?.busy) ||
        JSON.stringify(candidate) !== JSON.stringify(fresh.plan)
      ) {
        active.cancel()
        return
      }
      active.commit(() =>
        setResult(
          "Candidate plan inspected locally. Source values unchanged; no save, restart or connectivity occurred.",
        ),
      )
    })
  }
  function close() {
    if (!admitted() || !current.current.open) return
    retirePresentation()
    const lease = current.current.lease,
      target = origin.current
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null
      if (
        current.current.alive &&
        current.current.source === source &&
        current.current.lease === lease &&
        !current.current.open &&
        origin.current === target &&
        target?.isConnected
      )
        target.focus()
    })
  }
  const group = data.groups.find((g) => g.id === groupId),
    groupState = group ? states[group.id] : undefined,
    local = group ? groupEvaluation(group, states[group.id], mode === "provenance") : undefined
  function inspectGroup(id: string) {
    if (!admitted()) return
    const g = data.groups.find((g) => g.id === id)
    if (!g) return
    current.current.groupId = id
    setGroupId(id)
    inspect(settingsWizardEvaluation([g], current.current.states).plan)
  }
  const footer = (id: string) => (
    <div className="settings-inspection-footer">
      <p className="muted">
        Inspect only; changing or discarding a draft never changes the supplied source values.
      </p>
      <Button
        variant="outline"
        disabled={
          !data.editable ||
          !!groupEvaluation(
            data.groups.find((g) => g.id === id)!,
            states[id],
            mode === "provenance",
          ).problem ||
          !!groupEvaluation(
            data.groups.find((g) => g.id === id)!,
            states[id],
            mode === "provenance",
          ).evaluated?.errors.length
        }
        onClick={() => inspectGroup(id)}
      >
        Inspect draft for {id}
      </Button>
    </div>
  )
  const groupedProps = {
    contractVersion: 1,
    groups: data.groups,
    states,
    onDraftChange: draft,
    readOnlyContext: true,
    groupFooter: footer,
  }
  return (
    <>
      <p data-testid="settings-source" className="muted">
        Source: {data.source}. {data.groups.length} configured groups; mode {mode}. No observed
        status or telemetry is inferred from desired settings.
      </p>
      {data.groups.length === 0 ? (
        <p role="status">Known empty settings manifest: zero supplied groups. No fields or plan.</p>
      ) : (
        <>
          {mode === "group form" && (
            <label className="settings-group-choice">
              Reviewed group{" "}
              <select
                aria-label="Reviewed group"
                value={groupId}
                onChange={(e) => choose(e.target.value)}
              >
                {data.groups.map((g) => (
                  <option value={g.id} key={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode === "group form" ? (
            group && groupState ? (
              <SettingsGroupForm
                group={group}
                {...groupState}
                readOnlyContext
                onDraftChange={(next) => draft(group.id, next)}
                footer={footer(group.id)}
              />
            ) : (
              <p role="status">Waiting for a settings snapshot.</p>
            )
          ) : mode === "grouped" ? (
            <SettingsRenderer {...groupedProps} />
          ) : mode === "provenance" ? (
            <SettingsProvenanceRenderer {...groupedProps} />
          ) : (
            <div className="settings-wizard">
              <p className="notice">
                “Submit setup” inspects the current valid plan locally. Nothing is saved;
                connectivity checks are not provided.
              </p>
              <SettingsWizard
                contractVersion={1}
                groups={data.groups}
                states={states}
                step={step}
                onStepChange={move}
                onDraftChange={draft}
                onComplete={(candidate) => inspect(candidate, true)}
              />
            </div>
          )}
          {local?.evaluated && (
            <p className="muted" data-testid="settings-validation">
              Selected group {groupId}: {local.evaluated.errors.length} local schema errors; draft
              scalars retain zero, false and empty-string distinctions.
            </p>
          )}
        </>
      )}
      <DetailDialog
        open={open}
        onClose={close}
        title="Settings candidate-plan inspection"
        widthClassName="settings-plan-dialog"
        footer={
          <div className="gallery-controls settings-plan-footer">
            <Button variant="outline" disabled={!queued} onClick={release}>
              Release oldest scripted inspection ({queued})
            </Button>
            <Button variant="outline" onClick={close}>
              Close plan inspection
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset settings context
            </Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          <MetaList
            columns={1}
            items={[
              { label: "Source", value: data.source },
              { label: "Fixed UTC", value: data.fixture.clock },
              { label: "Effects", value: "None: local inspection only" },
            ]}
          />
          <p role="status">{result}</p>
          <JsonViewer value={plan} className="evidence-json" />
          <p>
            Presence-only fields cannot appear as replacement values. No source settings were
            changed.
          </p>
        </div>
      </DetailDialog>
    </>
  )
}
