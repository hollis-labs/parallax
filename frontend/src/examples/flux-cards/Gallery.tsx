import {
  Button,
  DetailDialog,
  JsonViewer,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@hollis-labs/design-components"
import { BUILTIN_THEMES } from "@hollis-labs/design-tokens"
import { ChatInput, type ChatItem, ChatStream, type ChatTrigger } from "@hollis-labs/kit-chat"
import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { FluxCard } from "./Cards"
import {
  type AccessState,
  accessStates,
  type CardState,
  cardStates,
  commands,
  envelopeFor,
  files,
  identities,
  loopCodes,
  referenceTime,
  type ToolMode,
  toolModes,
} from "./model"
import { StreamBanner, ThinkingIndicator, ToolDisplay } from "./StreamStates"
import "./flux-cards.css"

export type GalleryProps = {
  type?: string
  state?: CardState
  access?: AccessState
  mode?: ToolMode
}
export function FluxCardsGallery({
  type: initialType = "approval-card",
  state: initialState = "complete",
  access: initialAccess = "ready",
  mode: initialMode = "compact",
}: GalleryProps) {
  const [type, setType] = useState(initialType),
    [state, setState] = useState(initialState),
    [access, setAccess] = useState(initialAccess)
  const [toolMode, setToolMode] = useState(initialMode),
    [risk, setRisk] = useState("low"),
    [code, setCode] = useState("max_turns")
  const [generation, setGeneration] = useState(0),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false)
  const [theme, setTheme] = useState("nanite-default"),
    [palette, setPalette] = useState<"light" | "dark">("light")
  const [inspection, setInspection] = useState<{ label: string; value: unknown } | null>(null)
  const layerOpen = useRef(false),
    currentDraft = useRef(draft),
    currentBusy = useRef(busy)
  layerOpen.current = !!inspection
  currentDraft.current = draft
  currentBusy.current = busy
  const inputRef = useRef<HTMLTextAreaElement>(null),
    origin = useRef<HTMLElement | null>(null)
  const heading = useRef<HTMLHeadingElement>(null),
    layerRevision = useRef(0),
    current = useRef("")
  const [activation, setActivation] = useState<{ active: boolean } | null>(null)
  const identity = `${type}/${state}/${access}/${risk}/${code}/${generation}/${theme}/${palette}`
  current.current = identity
  const renderedLayerRevision = layerRevision.current
  const editable = access === "ready",
    accessible = access === "ready" || access === "locked"
  useLayoutEffect(() => {
    const lease = { active: true }
    setActivation(lease)
    return () => {
      lease.active = false
      layerRevision.current += 1
    }
  }, [])
  useEffect(() => {
    const root = document.documentElement,
      oldTheme = root.dataset.theme,
      oldMode = root.dataset.mode
    applyTheme(theme as Parameters<typeof applyTheme>[0])
    root.dataset.mode = palette
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [theme, palette])
  function retire() {
    layerRevision.current += 1
    current.current = "retired"
    setInspection(null)
    setDraft("")
    setBusy(false)
    setGeneration((value) => value + 1)
  }
  function inspect(label: string, value: unknown) {
    if (!activation?.active || current.current !== identity || !accessible) return
    layerRevision.current += 1
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setInspection({ label, value })
  }
  function effect(label: string, value: unknown) {
    if (editable && !layerOpen.current) inspect(label, value)
  }
  function close() {
    if (
      !activation?.active ||
      current.current !== identity ||
      !layerOpen.current ||
      renderedLayerRevision !== layerRevision.current
    )
      return
    const revision = ++layerRevision.current
    layerOpen.current = false
    const closingDialog = document.querySelector('[role="dialog"]')
    let competingFocus = false
    const target = origin.current
    const observeFocus = (event: FocusEvent) => {
      if (event.target !== target && !closingDialog?.contains(event.target as Node)) {
        competingFocus = true
      }
    }
    document.addEventListener("focusin", observeFocus)
    setInspection(null)
    const captured = identity
    requestAnimationFrame(() => {
      document.removeEventListener("focusin", observeFocus)
      if (
        !activation.active ||
        current.current !== captured ||
        layerRevision.current !== revision ||
        layerOpen.current ||
        competingFocus
      )
        return
      const focused = document.activeElement
      if (focused !== document.body && focused !== target && !closingDialog?.contains(focused))
        return
      if (target?.isConnected && target.getClientRects().length) target.focus()
      else heading.current?.focus()
    })
  }
  const triggers: ChatTrigger[] = [
    {
      id: "slash",
      kind: "command",
      char: "/",
      atLineStart: true,
      items: commands,
      emptyLabel: "No matching local commands",
      onSelect: (item) => effect("Slash command candidate", item),
    },
    {
      id: "files",
      kind: "reference",
      char: "@",
      items: files,
      emptyLabel: "No matching fictional files",
    },
  ]
  const envelope = envelopeFor(type, state, risk, code)
  const items: ChatItem[] = accessible
    ? [
        {
          id: "message-17",
          kind: "message",
          role: "user",
          content: <p>Inspect the fictional card. No action is sent or saved.</p>,
          timestamp: referenceTime,
        },
        {
          id: envelope.id ?? "unaddressed-card",
          kind: "message",
          role: "assistant",
          content: (
            <FluxCard key={identity} envelope={envelope} editable={editable} inspect={effect} />
          ),
        },
      ]
    : []
  return (
    <main className="flux-cards-gallery">
      <header>
        <h1 ref={heading} tabIndex={-1}>
          Flux stream candidates
        </h1>
        <p>Local inert specimens · seed 4421 · {referenceTime}. Owner visual approval pending.</p>
      </header>
      <section className="flux-controls" aria-label="Flux fixture controls">
        <label>
          Envelope
          <select
            aria-label="Envelope identity"
            value={type}
            onChange={(e) => {
              retire()
              setType(e.target.value)
            }}
          >
            {identities.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Card state
          <select
            aria-label="Card state"
            value={state}
            onChange={(e) => {
              retire()
              setState(e.target.value as CardState)
            }}
          >
            {cardStates.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Access
          <select
            aria-label="Fixture access"
            value={access}
            onChange={(e) => {
              retire()
              setAccess(e.target.value as AccessState)
            }}
          >
            {accessStates.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Risk
          <select
            aria-label="Approval risk"
            value={risk}
            onChange={(e) => {
              retire()
              setRisk(e.target.value)
            }}
          >
            {["low", "medium", "high"].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Loop code
          <select
            aria-label="Loop code"
            value={code}
            onChange={(e) => {
              retire()
              setCode(e.target.value)
            }}
          >
            {loopCodes.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Tools
          <select
            aria-label="Tool display mode"
            value={toolMode}
            onChange={(e) => setToolMode(e.target.value as ToolMode)}
          >
            {toolModes.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Theme
          <select
            aria-label="Flux theme"
            value={theme}
            onChange={(e) => {
              retire()
              setTheme(e.target.value)
            }}
          >
            {BUILTIN_THEMES.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Palette
          <select
            aria-label="Flux palette"
            value={palette}
            onChange={(e) => {
              retire()
              setPalette(e.target.value as "light" | "dark")
            }}
          >
            <option>light</option>
            <option>dark</option>
          </select>
        </label>
        <Button variant="outline" onClick={retire}>
          Replace fixture source
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            retire()
            setType("approval-card")
            setState("complete")
            setAccess("ready")
          }}
        >
          Reset local specimen
        </Button>
      </section>
      <div className="flux-stream-layout" key={identity}>
        <section className="flux-conversation" aria-label="Flux card conversation">
          <ChatStream
            className="flux-transcript"
            viewportClassName="scroll-mt-4"
            aria-label="Flux candidate transcript"
            items={items}
            loading={access === "loading"}
            status={{ status: "idle" }}
            empty={
              <p>
                {access === "denied"
                  ? "Access denied; card payload withheld."
                  : access === "unknown"
                    ? "Source unknown; no card count inferred."
                    : "Card source unavailable; no successful empty result inferred."}
              </p>
            }
          />
          <section
            className="flux-composer-scope"
            data-theme={theme}
            data-mode={theme === "nanite-default" ? "dark" : palette}
            aria-label="Local inert composer"
          >
            <p>
              Local draft inspection only. Slash commands inspect; @ inserts a fictional reference.
            </p>
            <fieldset
              aria-label="Composer keyboard scope"
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || event.keyCode === 229) return
                if (
                  event.key === "Escape" &&
                  event.target === inputRef.current &&
                  inputRef.current?.getAttribute("aria-expanded") === "true"
                )
                  event.stopPropagation()
              }}
            >
              <ChatInput
                key={identity}
                value={draft}
                textareaRef={inputRef}
                aria-label="Flux local draft"
                onValueChange={(value) => {
                  if (activation?.active && current.current === identity && editable)
                    setDraft(value)
                }}
                onSubmit={(value) => {
                  if (!currentBusy.current && value === currentDraft.current.trim())
                    effect("Draft candidate", { text: value })
                }}
                disabled={!editable}
                busy={busy}
                showSubmitButton={false}
                triggers={editable ? triggers : []}
                history={["Fictional previous review"]}
                menuSide="top"
                toolbarStart={<span>Native kit input · plaintext references</span>}
                toolbarEnd={
                  <>
                    <Button
                      disabled={!editable || busy || !draft.trim()}
                      onClick={() => {
                        if (
                          !currentBusy.current &&
                          draft.trim() === currentDraft.current.trim() &&
                          draft.trim()
                        )
                          effect("Draft candidate", { text: draft.trim() })
                      }}
                    >
                      Inspect send candidate
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!editable}
                      onClick={() => {
                        if (activation?.active && current.current === identity && editable)
                          setBusy(!busy)
                      }}
                    >
                      {busy ? "Stop local preview" : "Start busy preview"}
                    </Button>
                  </>
                }
              />
            </fieldset>
          </section>
        </section>
        <aside className="flux-state-gallery" aria-label="Stream state specimens">
          <ThinkingIndicator state={busy ? "thinking" : "idle"} />
          <ToolDisplay key={toolMode} mode={toolMode} empty={state === "empty"} />
          {["recovery", "compaction", "tool-warning", "critical-warning", "text-only"].map(
            (kind) => (
              <StreamBanner key={kind} kind={kind} editable={editable} inspect={effect} />
            ),
          )}
        </aside>
      </div>
      {inspection && (
        <DetailDialog
          title={inspection.label}
          meta="Local inspection · no effect committed"
          open
          onClose={close}
          footer={<Button onClick={close}>Close candidate inspection</Button>}
        >
          <div className="flux-inspection">
            <p>
              Nothing sent, approved, rejected, retried or saved. Supplied card receipt unchanged.
            </p>
            <JsonViewer value={inspection.value} />
            <Popover>
              <PopoverTrigger render={<Button variant="outline" />}>
                Inspect nested local detail
              </PopoverTrigger>
              <PopoverContent>
                <p>Nested local inspection only.</p>
                <JsonViewer value={inspection.value} />
              </PopoverContent>
            </Popover>
          </div>
        </DetailDialog>
      )}
    </main>
  )
}
