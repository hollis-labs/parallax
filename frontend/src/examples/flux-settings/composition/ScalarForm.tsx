import {
  evaluateSettings,
  inspectSettingsGroup,
  type SettingsDraft,
  SettingsGroupForm,
  SettingsProvenanceRenderer,
  type SettingsProvenanceState,
  SettingsRenderer,
  SettingsWizard,
} from "@hollis-labs/kit-settings"
import { useLayoutEffect, useState } from "react"
import { useAdmission } from "./admission"
import type { formFixture } from "./model"

export interface FormDiagnostics {
  edit: (next: SettingsDraft) => boolean
  save: () => boolean
  cancel: () => boolean
  state: SettingsProvenanceState
}
export function ScalarForm({
  fixture,
  live: parent,
  readOnly = false,
  publish,
}: {
  fixture: ReturnType<typeof formFixture>
  live: () => boolean
  readOnly?: boolean
  publish?: (frame: FormDiagnostics) => void
}) {
  const [state, setState] = useState(fixture.state)
  const [mode, setMode] = useState("form")
  const [step, setStep] = useState(0)
  const [notice, setNotice] = useState("")
  const { root, live } = useAdmission(parent)
  const profile = inspectSettingsGroup(fixture.group)
  const evaluated =
    typeof profile === "string" ? null : evaluateSettings(profile, state.values, state.draft)
  const dirty = Object.keys(state.draft ?? {}).length > 0
  function edit(next: SettingsDraft) {
    if (
      !live() ||
      readOnly ||
      typeof profile === "string" ||
      Object.keys(next).some(
        (key) => !profile.fields.some((f) => f.key === key && f.editable && !f.secret),
      )
    )
      return false
    setState({ ...state, draft: next })
    setNotice("")
    return true
  }
  function save() {
    if (!live() || readOnly || !dirty || !evaluated || evaluated.errors.length) return false
    const values = { ...state.values }
    for (const [key, value] of Object.entries(evaluated.changes.set)) {
      values[key] = {
        ...values[key],
        present: true,
        value,
        has_override: true,
        source: { kind: "override", label: "Local fixture specimen" },
      }
    }
    for (const key of evaluated.changes.unset) values[key] = fixture.state.values[key]
    setState({ ...state, values, draft: {} })
    setNotice("Saved to this local fixture only.")
    return true
  }
  function cancel() {
    if (!live() || readOnly) return false
    setState({ ...state, draft: {} })
    setNotice("Draft discarded locally.")
    return true
  }
  useLayoutEffect(() => {
    publish?.({ edit, save, cancel, state })
  })
  const footer = (
    <div className="flux-form-actions">
      <button
        type="button"
        disabled={readOnly || !dirty || !!evaluated?.errors.length}
        onClick={save}
      >
        Save fixture
      </button>
      <button type="button" disabled={readOnly || !dirty} onClick={cancel}>
        Cancel draft
      </button>
      <span role="status">
        {notice || (dirty ? "Unsaved local draft" : "Recorded fixture values")}
      </span>
    </div>
  )
  const grouped = {
    contractVersion: 1,
    groups: [fixture.group],
    states: { [fixture.group.id]: state },
    onDraftChange: (_id: string, next: SettingsDraft) => edit(next),
    readOnlyContext: true,
    groupFooter: () => footer,
  }
  return (
    <section ref={root} className="flux-scalar-form" aria-label={fixture.group.label}>
      <label>
        Field presentation{" "}
        <select
          aria-label="Field presentation"
          value={mode}
          onChange={(e) => {
            if (live()) setMode(e.target.value)
          }}
        >
          <option value="form">Group form</option>
          <option value="grouped">Grouped renderer</option>
          <option value="provenance">Source provenance</option>
          <option value="wizard">Setup preview</option>
        </select>
      </label>
      {mode === "form" ? (
        <SettingsGroupForm
          group={fixture.group}
          {...state}
          readOnlyContext
          onDraftChange={edit}
          footer={footer}
        />
      ) : mode === "grouped" ? (
        <SettingsRenderer {...grouped} />
      ) : mode === "provenance" ? (
        <SettingsProvenanceRenderer {...grouped} />
      ) : (
        <>
          <p>Submit setup inspects a local plan; it does not install or configure a service.</p>
          <SettingsWizard
            {...grouped}
            step={step}
            onStepChange={(next) => {
              if (live() && Number.isInteger(next) && next >= 0 && next <= 1) setStep(next)
            }}
            onComplete={() => {
              if (live() && !readOnly && step === 1)
                setNotice("Local plan inspected; no configuration applied.")
            }}
          />
          {footer}
        </>
      )}
    </section>
  )
}
