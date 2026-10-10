import { Button } from "@hollis-labs/design-components"
import { Activity, StrictMode, useLayoutEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import "./reader.css"
import { readerFixture } from "./model"
import { ReaderDetailPage } from "./ReaderDetailPage"
import type { ReaderItem } from "./types"

const allItems = [
  ...(readerFixture.inboxItems as ReaderItem[]),
  ...(readerFixture.pageOneItems as ReaderItem[]),
]

const FRAGMENTS: Record<string, ReaderItem> = Object.fromEntries(
  allItems.map((item) => [item.fragment_id, item]),
)

export function ReaderLifecycleSpecimen() {
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [currentId, setCurrentId] = useState("FRAG-002")

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = "nanite-default"
    document.documentElement.dataset.mode = "dark"
  }, [])

  const currentItem = FRAGMENTS[currentId] ?? allItems[0]
  const admittedIds = Object.keys(FRAGMENTS)

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-panel p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            setVisible((v) => !v)
            e.currentTarget.blur()
          }}
        >
          Toggle fixture Activity
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            setMounted((m) => !m)
            e.currentTarget.blur()
          }}
        >
          Toggle fixture root
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            setCurrentId((id) => (id === "FRAG-002" ? "FRAG-003" : "FRAG-002"))
            e.currentTarget.blur()
          }}
        >
          Toggle fixture source
        </Button>
        <span
          data-testid="current-fragment-id"
          className="rounded bg-panel-2 px-2 py-1 font-mono text-xs text-text-subtle"
        >
          {currentItem.fragment_id}
        </span>
        <span
          data-testid="current-fragment-revision"
          className="rounded bg-panel-2 px-2 py-1 font-mono text-xs text-text-subtle"
        >
          {currentItem.fragment_revision_id}
        </span>
        <input
          aria-label="New plain foreground owner"
          className="rounded border border-border bg-bg px-2 py-1 text-xs text-fg"
          placeholder="Plain foreground target"
        />
      </div>

      <Activity mode={visible ? "visible" : "hidden"}>
        {mounted && (
          <ReaderDetailPage
            item={currentItem}
            scope="inbox"
            admittedIds={admittedIds}
            onBack={() => {}}
            onRefresh={() => {}}
            onNavigate={(id) => setCurrentId(id)}
            onCommand={() => {}}
          />
        )}
      </Activity>
    </div>
  )
}

const root = document.getElementById("root")
if (!root) throw new Error("Fixture root missing")
createRoot(root).render(
  <StrictMode>
    <ReaderLifecycleSpecimen />
  </StrictMode>,
)
