import type { KeyboardEvent } from "react"
import { useLayoutEffect, useState } from "react"
import { PanelHeader, SCard } from "../primitives"
import { plainKey, useAdmission } from "./admission"
import { agents, formFixture, plugins, providers } from "./model"
import { type FormDiagnostics, ScalarForm } from "./ScalarForm"

export type ManagerKind = "providers" | "agents" | "plugins"
export interface ManagerDiagnostics {
  select: (id: string) => boolean
  selected: string | null
}
export function Manager({
  kind,
  live: parent,
  readOnly: _readOnly,
  empty,
  publish,
  publishForm,
}: {
  kind: ManagerKind
  live: () => boolean
  readOnly: boolean
  empty: boolean
  publish: (frame: ManagerDiagnostics) => void
  publishForm: (frame: FormDiagnostics) => void
}) {
  const readOnly = true
  const records = empty
    ? []
    : kind === "providers"
      ? providers
      : kind === "agents"
        ? agents
        : plugins
  const [selected, setSelected] = useState<string | null>(records[0]?.id ?? null)
  const [filter, setFilter] = useState("")
  const [notice, setNotice] = useState("")
  const { root, live } = useAdmission(parent)
  const visible = records.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
  const record = records.find((r) => r.id === selected)
  function select(id: string) {
    if (!live() || !visible.some((r) => r.id === id)) return false
    setSelected(id)
    setNotice("")
    return true
  }
  function keys(e: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (!live() || !plainKey(e) || e.target !== e.currentTarget) return
    const i = visible.findIndex((r) => r.id === id)
    const next =
      e.key === "ArrowDown"
        ? Math.min(i + 1, visible.length - 1)
        : e.key === "ArrowUp"
          ? Math.max(i - 1, 0)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? visible.length - 1
              : -1
    if (next < 0 || !visible[next]) return
    e.preventDefault()
    e.stopPropagation()
    if (select(visible[next].id))
      root.current?.querySelectorAll<HTMLButtonElement>("[data-record-id]")[next]?.focus()
  }
  useLayoutEffect(() => {
    publish({ select, selected })
  })
  const selectedAgent = kind === "agents" ? agents.find((a) => a.id === selected) : undefined
  const selectedProvider =
    kind === "providers" ? providers.find((p) => p.id === selected) : undefined
  const selectedPlugin = kind === "plugins" ? plugins.find((p) => p.id === selected) : undefined
  return (
    <section ref={root} data-section={kind}>
      <PanelHeader
        title={kind === "agents" ? "Agents" : kind === "plugins" ? "Plugins" : "Providers"}
        description="Independent fictional records; metadata inspection only; mutation and preview actions are unavailable."
      />
      <div className="flux-manager">
        <div>
          <label>
            Filter {kind}
            <input
              aria-label={`Filter ${kind}`}
              value={filter}
              onChange={(e) => {
                if (live()) setFilter(e.target.value)
              }}
            />
          </label>
          <fieldset aria-label={`${kind} records`} className="flux-records">
            {visible.map((r) => (
              <button
                key={r.id}
                type="button"
                data-record-id={r.id}
                aria-pressed={selected === r.id}
                onClick={() => select(r.id)}
                onKeyDown={(e) => keys(e, r.id)}
              >
                <strong>{r.name}</strong>
                <span>{r.status}</span>
              </button>
            ))}
            {!visible.length && <p role="status">No {kind} match this fixture view.</p>}
          </fieldset>
        </div>
        <section className="flux-record-detail" aria-label={`${kind} detail`}>
          {!record ? (
            <p>Select a record to inspect.</p>
          ) : (
            <SCard title={record.name} meta={`ID: ${record.id}`}>
              <div className="flux-detail-body">
                {selectedProvider && (
                  <>
                    <dl>
                      <dt>Type</dt>
                      <dd>{selectedProvider.type}</dd>
                      <dt>Status</dt>
                      <dd>{selectedProvider.status}</dd>
                      <dt>Credential presence</dt>
                      <dd>{selectedProvider.credential}</dd>
                      <dt>Models</dt>
                      <dd>{selectedProvider.models}</dd>
                    </dl>
                    <p>Credentials are metadata only. No key entry or connection check.</p>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        if (live() && !readOnly)
                          setNotice("Local provider preview selected; no connection attempted.")
                      }}
                    >
                      Preview provider fixture
                    </button>
                  </>
                )}
                {selectedAgent && (
                  <>
                    <p>{selectedAgent.description}</p>
                    <dl>
                      <dt>Source</dt>
                      <dd>{selectedAgent.source}</dd>
                      <dt>Model</dt>
                      <dd>
                        {selectedAgent.model === "" ? "Explicitly unset" : selectedAgent.model}
                      </dd>
                      <dt>Skills</dt>
                      <dd>{selectedAgent.skills.join(", ") || "Known empty"}</dd>
                      <dt>System prompt</dt>
                      <dd>{selectedAgent.prompt || "Explicitly empty"}</dd>
                    </dl>
                    <ScalarForm
                      key={selectedAgent.id}
                      fixture={formFixture(
                        `agent/${selectedAgent.id}`,
                        "Agent fixture configuration",
                        {
                          name: { title: "Agent name", value: selectedAgent.name },
                          description: { title: "Description", value: selectedAgent.description },
                          enabled: {
                            title: "Enabled in fixture",
                            value: selectedAgent.status === "enabled",
                          },
                        },
                        !readOnly,
                      )}
                      live={live}
                      readOnly={readOnly}
                      publish={publishForm}
                    />
                  </>
                )}
                {selectedPlugin && (
                  <>
                    <p>{selectedPlugin.description}</p>
                    <dl>
                      <dt>Version</dt>
                      <dd>{selectedPlugin.version}</dd>
                      <dt>Status</dt>
                      <dd>{selectedPlugin.status}</dd>
                      <dt>Tools</dt>
                      <dd>{selectedPlugin.tools}</dd>
                    </dl>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        if (live() && !readOnly)
                          setNotice(
                            "Install/reload preview recorded locally; no plugin was loaded.",
                          )
                      }}
                    >
                      Preview install fixture
                    </button>
                    <p>
                      Plugin policy is fictional. No package import, installation, or transport.
                    </p>
                    {selectedPlugin.config ? (
                      <ScalarForm
                        key={selectedPlugin.id}
                        fixture={formFixture(
                          `plugin/${selectedPlugin.id}`,
                          "Plugin fixture configuration",
                          {
                            title: { title: "Notebook title", value: "Fixture notebook" },
                            row_limit: { title: "Row limit", value: 0 },
                            annotations: { title: "Show annotations", value: false },
                            directory: { title: "Optional directory" },
                            credential: {
                              title: "Credential presence",
                              secret: true,
                              readOnly: true,
                            },
                          },
                          !readOnly,
                        )}
                        live={live}
                        readOnly={readOnly}
                        publish={publishForm}
                      />
                    ) : (
                      <p role="status">
                        Configuration unavailable for this disabled plugin specimen.
                      </p>
                    )}
                  </>
                )}
                <p role="status">{notice}</p>
              </div>
            </SCard>
          )}
        </section>
      </div>
    </section>
  )
}
