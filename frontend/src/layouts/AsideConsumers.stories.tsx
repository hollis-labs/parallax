import {
  createAppShellAsideStore,
  createMemoryStorage,
  useAppShellAside,
} from "@hollis-labs/design-app-runtime"
import { Button, InspectionDialog } from "@hollis-labs/design-components"
import { ChatInput, type ChatItem, ChatStream } from "@hollis-labs/kit-chat"
import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useLayoutEffect, useState } from "react"
import { AdministrationExample } from "../examples/administration/AdministrationExample"
import { MessagingExample } from "../examples/messaging/MessagingExample"

const messages: ChatItem[] = Array.from({ length: 25 }, (_, i) => ({
  kind: "message",
  id: `fixture-4421-${i}`,
  role: i % 2 ? "assistant" : "user",
  content: `Fictional review message ${i + 1}. Reference 2026-10-04T14:30:00Z. No delivery or transport.`,
}))

function AsideConsumer({
  idiom = "messaging",
  empty = false,
}: {
  idiom?: "messaging" | "administration"
  empty?: boolean
}) {
  useLayoutEffect(() => {
    const params = new URLSearchParams(location.search)
    applyTheme((params.get("theme") ?? "nanite-default") as Parameters<typeof applyTheme>[0])
    document.documentElement.dataset.mode = params.get("mode") === "light" ? "light" : "dark"
  }, [])
  const [store] = useState(() =>
    createAppShellAsideStore({
      appNamespace: `aside-review-${idiom}`,
      storage: createMemoryStorage(),
      defaultCollapsed: empty,
    }),
  )
  const [generation, setGeneration] = useState(0)
  const [admitted, setAdmitted] = useState(true)
  const [draft, setDraft] = useState("")
  const [nested, setNested] = useState(false)
  const [held, setHeld] = useState<ReturnType<typeof useAppShellAside> | null>(null)
  const aside = useAppShellAside({
    store,
    sourceGeneration: `${generation}/${admitted}`,
    isTriggerAdmitted: () => admitted,
  })
  const toggle = (
    <Button
      ref={(node) => {
        aside.triggerRef.current = node
      }}
      aria-label="Toggle companion"
      aria-expanded={aside.isNarrow ? aside.overlayOpen : !aside.collapsed}
      onClick={() => (aside.isNarrow ? aside.toggleOverlay() : aside.toggleCollapsed())}
    >
      Companion
    </Button>
  )
  const shellAside = {
    ...aside.asideProps,
    asideLabel: `${idiom} companion`,
    asideTrigger: <Button aria-label="Open companion">Open companion</Button>,
    asideHeader: (
      <div className="flex flex-wrap gap-2 p-2">
        <Button onClick={() => aside.setCollapsed(true)}>Collapse companion</Button>
        <Button onClick={() => setHeld(aside)}>Capture current callbacks</Button>
        <Button
          onClick={() => {
            setGeneration((v) => v + 1)
            setDraft("")
          }}
        >
          Replace source
        </Button>
        <Button onClick={() => setAdmitted(false)}>Revoke access</Button>
        <Button onClick={() => setNested(true)}>Inspect specimen</Button>
      </div>
    ),
    aside: empty ? null : idiom === "messaging" ? (
      <ChatStream
        items={messages}
        autoScroll={false}
        className="flex-none"
        viewportClassName="flex-none overflow-visible"
        aria-label="Companion transcript"
      />
    ) : (
      <div className="space-y-3 p-4">
        {Array.from({ length: 30 }, (_, i) => {
          const id = `permission-${i}`
          return (
            <dl key={id} className="border border-border p-3">
              <dt>Fixture permission {i + 1}</dt>
              <dd>Desired value: read-only. Provenance: fictional seed 4421.</dd>
            </dl>
          )
        })}
      </div>
    ),
    asideFooter: empty ? undefined : idiom === "messaging" ? (
      <ChatInput
        value={draft}
        onValueChange={setDraft}
        onSubmit={() => {}}
        aria-label="Companion draft"
        showSubmitButton={false}
      />
    ) : (
      <p className="p-2 text-caption">Inspection only · no authorization changes</p>
    ),
  }
  return (
    <>
      {idiom === "messaging" ? (
        <MessagingExample shellAside={shellAside} asideToggle={toggle} />
      ) : (
        <AdministrationExample shellAside={shellAside} asideToggle={toggle} />
      )}
      {held && (
        <Button
          className="fixed bottom-2 left-2"
          onClick={() => {
            held.setWidth("wide")
            held.setCollapsed(false)
            held.setOverlayOpen(true)
            held.restoreFocus()
          }}
        >
          Replay held callbacks
        </Button>
      )}
      <InspectionDialog
        open={nested}
        onOpenChange={setNested}
        title="Nested specimen"
        footer={<Button onClick={() => setNested(false)}>Finish inspection</Button>}
      >
        <p>Local fixture. No writes.</p>
      </InspectionDialog>
    </>
  )
}
const meta = {
  title: "Layouts/Aside Consumers",
  component: AsideConsumer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AsideConsumer>
export default meta
type Story = StoryObj<typeof meta>
export const MessagingCompanion: Story = { args: { idiom: "messaging" } }
export const AdministrationInspector: Story = { args: { idiom: "administration" } }
export const EmptyAdoption: Story = { args: { idiom: "administration", empty: true } }
