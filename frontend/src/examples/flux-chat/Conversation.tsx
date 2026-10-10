import { Button } from "@hollis-labs/design-components"
import { getBuiltinTheme } from "@hollis-labs/design-tokens"
import { ChatInput, type ChatItem, ChatStream, type ChatTrigger } from "@hollis-labs/kit-chat"
import { type CSSProperties, useCallback, useLayoutEffect, useRef, useState } from "react"
import { ChatPrimaryDrawer } from "../../drawers/ChatPrimaryDrawer"
import { ChatWorkingDrawer } from "../../drawers/ChatWorkingDrawer"
import { useDrawerSession } from "../../drawers/useDrawerSessionStore"
import { chatPackDetail, chatPackModel } from "../chat/model"
import { FluxCard } from "../flux-cards/Cards"
import { commands, envelopeFor, files, identities, referenceTime } from "../flux-cards/model"
import { StreamBanner, ThinkingIndicator, ToolDisplay } from "../flux-cards/StreamStates"
import { useAdmission } from "../flux-navigation/admission"
import { diagnostics, type FluxState } from "./model"

export function FluxConversation({
  state,
  source,
  layer,
  generation,
  inspect,
  launch,
}: {
  state: FluxState
  source: string
  layer: string
  generation: string
  inspect: (label: string, value: unknown) => boolean
  launch: () => void
}) {
  const model = chatPackModel(state.chat.appearance)
  const detail = chatPackDetail(model, state.chat.session)
  const accessible = model.accessible && !!detail
  const editable = accessible && model.editable
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(detail?.session.initialCount ?? 0)
  const root = useRef<HTMLElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const scope = useCallback(() => root.current, [])
  const frame = useAdmission(source, accessible, `${layer}:${generation}`, scope)
  const session = useDrawerSession(state.chat.session)
  const [hasRetainedLayout] = useState(() => {
    try {
      return Object.hasOwn(
        JSON.parse(localStorage.getItem("parallax_drawers_layout_v1") ?? "{}"),
        state.chat.session,
      )
    } catch {
      return false
    }
  })
  const seeded = useRef(hasRetainedLayout)
  useLayoutEffect(() => {
    if (seeded.current || !frame.run(() => {})) return
    if (!session.primaryDrawer.open && !session.workingDrawer.open) {
      seeded.current = true
      return
    }
    session.setPrimaryDrawer({ open: false })
    session.setWorkingDrawer({ open: false })
  }, [frame, session])
  const currentDraft = useRef(draft)
  currentDraft.current = draft
  const currentBusy = useRef(busy)
  currentBusy.current = busy
  const canAct = (effect: () => void) =>
    layer === "base" &&
    !Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"],[role="alertdialog"],[role="menu"]'),
    ).some(
      (owner) =>
        owner.hasAttribute("data-open") &&
        !!owner.getClientRects().length &&
        getComputedStyle(owner).visibility !== "hidden",
    ) &&
    frame.run(effect)
  const candidate = (label: string, value: unknown) => {
    if (!editable) return false
    return canAct(() => inspect(label, value))
  }
  useLayoutEffect(() => {
    diagnostics.frames.push({ source, run: canAct, focus: () => false, inspect: candidate })
  })
  const triggers: ChatTrigger[] = [
    {
      id: "slash",
      kind: "command",
      char: "/",
      atLineStart: true,
      items: commands,
      onSelect: (item) => candidate("Slash command candidate", item),
    },
    { id: "reference", kind: "reference", char: "@", items: files },
  ]
  const recorded: ChatItem[] =
    detail?.turns.slice(Math.max(0, detail.turns.length - count)).map((turn) => ({
      id: turn.id,
      kind: "message",
      role:
        turn.role === "user" || turn.role === "assistant" || turn.role === "tool"
          ? turn.role
          : "system",
      author: turn.role,
      content: <p className="chat-turn-text">{turn.text}</p>,
      timestamp: turn.time ? `${turn.time} · Recorded` : "Authored history · untimed",
    })) ?? []
  const specimens: ChatItem[] = identities.map((type) => {
    const envelope = envelopeFor(type, state.card)
    return {
      id: `flux-specimen:${type}`,
      kind: "card",
      wireKind: type,
      role: "assistant",
      author: "Authored local specimen",
      content: (
        <FluxCard envelope={envelope} editable={editable && layer === "base"} inspect={candidate} />
      ),
    }
  })
  const items: ChatItem[] =
    !accessible || state.welcome || state.chat.appearance === "empty"
      ? []
      : [
          ...recorded,
          {
            id: "flux-tool-specimen",
            kind: "message",
            role: "tool",
            content: <ToolDisplay key={state.tools} mode={state.tools} />,
          },
          ...specimens,
          ...["recovery", "compaction", "text-only", "tool-warning", "critical-warning"].map(
            (kind): ChatItem => ({
              id: `flux-banner:${kind}`,
              kind: "message",
              role: "system",
              content: (
                <StreamBanner
                  kind={kind}
                  inspect={candidate}
                  editable={editable && layer === "base"}
                />
              ),
            }),
          ),
        ]
  return (
    <section ref={root} className="flux-composed-conversation" aria-label="Flux conversation">
      {accessible && (
        <div className="flux-drawer-controls">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              canAct(() => session.setPrimaryDrawer({ open: !session.primaryDrawer.open }))
            }
          >
            Top drawer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              canAct(() => session.setWorkingDrawer({ open: !session.workingDrawer.open }))
            }
          >
            Bottom drawer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              canAct(() =>
                session.appendCardTab({
                  id: `card:flux:${state.chat.session}:info`,
                  label: "Info specimen",
                  payload: envelopeFor("info-card", state.card),
                  focused: true,
                  pinned: false,
                  createdAt: Date.parse(referenceTime),
                }),
              )
            }
          >
            Open card in working drawer
          </Button>
        </div>
      )}
      <div className="flux-drawer-stack">
        {accessible && (
          <ChatPrimaryDrawer
            sessionId={state.chat.session}
            open={session.primaryDrawer.open}
            height={session.primaryDrawer.height}
            activeTab={session.primaryDrawer.activeTab}
            pinnedCards={session.primaryDrawer.pinnedCards}
            onOpenChange={(open) => canAct(() => session.setPrimaryDrawer({ open }))}
            onHeightChange={(height) => canAct(() => session.setPrimaryDrawer({ height }))}
            onSelectTab={(activeTab) => canAct(() => session.setPrimaryDrawer({ activeTab }))}
            onUnpinCard={(id) => canAct(() => session.unpinPrimaryCard(id))}
          />
        )}
        <ChatStream
          className="flux-composed-transcript"
          aria-label="Flux composed transcript"
          items={items}
          loading={state.chat.appearance === "loading"}
          status={
            busy
              ? { status: "streaming", role: "assistant", content: <ThinkingIndicator /> }
              : { status: "idle" }
          }
          history={
            detail && !state.welcome
              ? {
                  hasOlder: count < detail.turns.length,
                  loading: false,
                  onLoadOlder: () =>
                    canAct(() =>
                      setCount((n) =>
                        Math.min(n + detail.session.historyPageSize, detail.turns.length),
                      ),
                    ),
                }
              : undefined
          }
          empty={
            state.welcome && accessible ? (
              <div className="flux-welcome">
                <h2>Welcome to Flux</h2>
                <p>Choose a local review. No session or model is created.</p>
                {[
                  "Inspect supplied conversation",
                  "Review card candidates",
                  "Explore workspace",
                ].map((label) => (
                  <Button key={label} variant="outline" onClick={() => canAct(launch)}>
                    {label}
                  </Button>
                ))}
              </div>
            ) : (
              <p>
                {!detail && model.accessible
                  ? `Session unavailable: ${state.chat.session}. No transcript relation supplied.`
                  : model.problem || "Known empty conversation · 0 supplied turns."}
              </p>
            )
          }
        />
        {accessible && (
          <ChatWorkingDrawer
            sessionId={state.chat.session}
            open={session.workingDrawer.open}
            height={session.workingDrawer.height}
            activeTab={session.workingDrawer.activeTab}
            cardTabs={session.workingDrawer.cardTabs}
            onOpenChange={(open) => canAct(() => session.setWorkingDrawer({ open }))}
            onHeightChange={(height) => canAct(() => session.setWorkingDrawer({ height }))}
            onSelectTab={(activeTab) => canAct(() => session.setWorkingDrawer({ activeTab }))}
            onRemoveCardTab={(id) => canAct(() => session.removeCardTab(id))}
            onTogglePinCardTab={(id) => canAct(() => session.togglePinCardTab(id))}
          />
        )}
      </div>
      <section
        className="flux-composer-scope flux-composed-composer"
        data-theme={state.theme}
        data-mode={state.theme === "nanite-default" ? "dark" : state.mode}
        style={
          Object.fromEntries(
            Object.entries(
              getBuiltinTheme(state.theme)?.tokens[
                state.theme === "nanite-default" ? "dark" : state.mode
              ] ?? {},
            ).map(([key, value]) => [`--color-${key}`, value]),
          ) as CSSProperties
        }
        aria-label="Local inert composer"
      >
        <fieldset
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (
              event.key === "Escape" &&
              event.target === input.current &&
              input.current?.getAttribute("aria-expanded") === "true"
            )
              event.stopPropagation()
          }}
        >
          <ChatInput
            value={draft}
            textareaRef={input}
            aria-label="Flux local draft"
            disabled={!editable}
            busy={busy}
            onValueChange={(value) => {
              if (editable) canAct(() => setDraft(value))
            }}
            onSubmit={(value) => {
              if (!currentBusy.current && value && value === currentDraft.current.trim())
                candidate("Draft candidate", { session: state.chat.session, text: value })
            }}
            onStop={() => canAct(() => setBusy(false))}
            showSubmitButton={false}
            triggers={editable ? triggers : []}
            history={detail?.history}
            menuSide="top"
            placeholder="Write a local review draft…"
            toolbarStart={<span>Local inert specimen · no delivery</span>}
            toolbarEnd={
              <>
                <Button
                  size="sm"
                  disabled={!editable || busy || !draft.trim()}
                  onClick={() => {
                    if (!currentBusy.current && draft.trim() && draft === currentDraft.current)
                      candidate("Draft candidate", {
                        session: state.chat.session,
                        text: draft.trim(),
                      })
                  }}
                >
                  Inspect send candidate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!editable}
                  onClick={() => canAct(() => setBusy(!currentBusy.current))}
                >
                  {busy ? "Stop local preview" : "Resume local preview"}
                </Button>
              </>
            }
          />
        </fieldset>
      </section>
    </section>
  )
}
