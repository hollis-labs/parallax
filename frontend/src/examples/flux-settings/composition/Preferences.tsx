import { useLayoutEffect, useRef, useState } from "react"
import { PanelHeader, SCard } from "../primitives"
import { plainKey, useAdmission } from "./admission"
import { defaultChain, formFixture, providers, validatedChain } from "./model"
import { type FormDiagnostics, ScalarForm } from "./ScalarForm"

export interface ReorderDiagnostics {
  chain: readonly string[]
  reorder: (id: string, target: number) => boolean
}
export function Preferences({
  live: parent,
  readOnly,
  malformed,
  publish,
  publishForm,
}: {
  live: () => boolean
  readOnly: boolean
  malformed: boolean
  publish: (frame: ReorderDiagnostics) => void
  publishForm: (frame: FormDiagnostics) => void
}) {
  const [initial] = useState(() => {
    let stored: unknown = [...defaultChain]
    try {
      const raw = localStorage.getItem("parallax:flux-settings:4421:provider-chain")
      if (raw !== null) stored = JSON.parse(raw)
    } catch {
      stored = null
    }
    return validatedChain(malformed ? ["unknown", 0] : stored)
  })
  const [chain, setChain] = useState(initial.chain)
  const [notice, setNotice] = useState(initial.problem ?? "")
  const dragging = useRef<{ id: string; admitted: () => boolean } | null>(null)
  const { root, live } = useAdmission(parent)
  function reorder(id: string, target: number) {
    if (
      !live() ||
      readOnly ||
      !chain.includes(id) ||
      !Number.isInteger(target) ||
      target < 0 ||
      target >= chain.length
    )
      return false
    const next = chain.filter((p) => p !== id)
    next.splice(target, 0, id)
    setChain(next)
    setNotice("Fallback order changed in this local fixture only.")
    return true
  }
  useLayoutEffect(() => {
    publish({ chain, reorder })
  })
  return (
    <section ref={root} data-section="preferences">
      <PanelHeader
        title="Preferences"
        description="Session defaults and ordered provider fallback. All values are fixture proposals."
      />
      <ScalarForm
        fixture={formFixture(
          "session-defaults",
          "Session Defaults",
          {
            default_provider: {
              title: "Provider",
              value: "Local Studio",
              options: providers.filter((p) => p.enabled).map((p) => p.name),
            },
            default_model: {
              title: "Model",
              value: "local-text",
              options: ["local-text", "atlas-small"],
            },
            default_agent: {
              title: "Agent",
              value: "Researcher",
              options: ["Researcher", "Writer"],
            },
            utility_provider: { title: "Utility provider", value: "" },
            tool_call_display_mode: {
              title: "Tool call display",
              value: "compact",
              options: ["indicator", "minimal", "compact", "full"],
            },
            drawer_retention: {
              title: "Drawer retention",
              value: "15 minutes",
              options: ["5 minutes", "15 minutes", "30 minutes", "Until refresh"],
            },
          },
          !readOnly,
        )}
        live={live}
        readOnly={readOnly}
        publish={publishForm}
      />
      <SCard
        title="Provider Fallback Chain"
        description="Drag a row or use Alt-free Arrow Up / Down on its Move button. Zero-like provider IDs retain identity."
      >
        <ol className="flux-reorder" aria-label="Provider fallback order">
          {chain.map((id, index) => (
            <li
              key={id}
              data-provider-id={id}
              draggable={!readOnly}
              onDragStart={(e) => {
                if (!live() || readOnly) {
                  e.preventDefault()
                  return
                }
                dragging.current = { id, admitted: live }
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", id)
              }}
              onDragOver={(e) => {
                if (live() && !readOnly && dragging.current?.admitted()) e.preventDefault()
              }}
              onDrop={(e) => {
                if (!live() || readOnly || !dragging.current?.admitted()) return
                e.preventDefault()
                reorder(dragging.current.id, index)
                dragging.current = null
              }}
              onDragEnd={() => {
                if (live()) dragging.current = null
              }}
            >
              <span>{index + 1}.</span>
              <strong>{providers.find((p) => p.id === id)?.name ?? id}</strong>
              <button
                type="button"
                aria-label={`Move ${providers.find((p) => p.id === id)?.name}`}
                disabled={readOnly}
                onKeyDown={(e) => {
                  if (
                    !live() ||
                    readOnly ||
                    !plainKey(e) ||
                    e.target !== e.currentTarget ||
                    !["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)
                  )
                    return
                  const target =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? chain.length - 1
                        : index + (e.key === "ArrowUp" ? -1 : 1)
                  if (target < 0 || target >= chain.length) return
                  e.preventDefault()
                  e.stopPropagation()
                  const button = e.currentTarget
                  if (reorder(id, target)) button.focus()
                }}
              >
                Move ↕
              </button>
              <button
                type="button"
                aria-label={`Move ${providers.find((p) => p.id === id)?.name} up`}
                disabled={readOnly || index === 0}
                onClick={() => reorder(id, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${providers.find((p) => p.id === id)?.name} down`}
                disabled={readOnly || index === chain.length - 1}
                onClick={() => reorder(id, index + 1)}
              >
                ↓
              </button>
            </li>
          ))}
        </ol>
        <div className="flux-form-actions">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!live() || readOnly) return
              try {
                localStorage.setItem(
                  "parallax:flux-settings:4421:provider-chain",
                  JSON.stringify(chain),
                )
                setNotice("Saved fixture order to this browser only.")
              } catch {
                setNotice("Fixture persistence unavailable; order remains local.")
              }
            }}
          >
            Save fixture order
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (live() && !readOnly) {
                setChain(initial.chain)
                setNotice("Order restored to its recorded fixture.")
              }
            }}
          >
            Cancel reorder
          </button>
          <p role="status">{notice}</p>
        </div>
      </SCard>
    </section>
  )
}
