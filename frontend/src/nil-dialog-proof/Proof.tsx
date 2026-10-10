import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  CommandDialog,
  ConfirmDialog,
  CycleModeToggle,
  DetailDialog,
  Dialog,
  DialogContent,
  DialogTitle,
  FormDialog,
  InspectionDialog,
  JsonModal,
  OverlaySidebar,
  SearchAddToggle,
  SearchPalette,
  Sheet,
  SheetContent,
  SheetTitle,
  useControlledRecordNavigation,
  useQuickSearchShortcut,
} from "@hollis-labs/design-components"
import { Activity, type ReactNode, StrictMode, useRef, useState } from "react"

const evidenceRows = Array.from({ length: 12 }, (_, i) => ({
  id: `seed-4421-evidence-${i + 1}`,
  label: `Evidence row ${i + 1}: bounded chrome and editable draft.`,
}))
const records = [
  { id: "nil-4421", label: "Review +design @desk", type: "todo" },
  { id: "nil-4422", label: "Notes from the studio", type: "notes" },
  { id: "nil-4423", label: "Plan the next specimen", type: "todo" },
]
const boardColumns = [[records[0], records[2]], [records[1]]]
const variants = [
  "detail",
  "form",
  "confirm",
  "inspection",
  "command",
  "dialog",
  "alert",
  "json",
  "sheet",
  "sidebar",
  "legacy-sidebar",
] as const
type Variant = (typeof variants)[number]

function Specimen({ idiom = "nil" }: { idiom?: "nil" | "torque" }) {
  const [sheetSide, setSheetSide] = useState<"top" | "right" | "bottom" | "left">("right")
  const [variant, setVariant] = useState<Variant>("inspection")
  const [open, setOpen] = useState(false),
    [palette, setPalette] = useState(false)
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all")
  const [mode, setMode] = useState("todo"),
    [inputMode, setInputMode] = useState<"search" | "add">("search")
  const [selected, setSelected] = useState(records[0].id),
    [source, setSource] = useState(1)
  const [admitted, setAdmitted] = useState(true),
    [nested, setNested] = useState(false)
  const [hidden, setHidden] = useState(false),
    [mounted, setMounted] = useState(true)
  const [persist, setPersist] = useState(false),
    [status, setStatus] = useState("Local inert specimen")
  const boardRefs = useRef(new Map<string, HTMLButtonElement>())
  const recordOrigin = useRef<HTMLButtonElement | null>(null)
  const origin = useRef<HTMLButtonElement>(null),
    anchor = useRef<HTMLButtonElement>(null)
  const initial = useRef<HTMLInputElement>(null),
    popup = useRef<HTMLDivElement>(null)
  const nav = useControlledRecordNavigation({
    orderedIds: records.map((r) => r.id),
    selectedId: selected,
    active: open,
    accessible: admitted,
    sourceGeneration: source,
    boundaryPolicy: "stop",
    onSelect: setSelected,
  })
  useQuickSearchShortcut({ enabled: !palette, onOpen: () => setPalette(true) })
  const focus = {
    initialFocus: initial,
    showFullscreenToggle: true,
    fullscreenSessionKey: persist ? "nil-proof.fullscreen" : undefined,
    returnFocus: {
      trigger: () => recordOrigin.current ?? origin.current,
      isAdmitted: () => admitted,
      fallbackTarget: () => anchor.current,
      isFallbackAdmitted: () => true,
    },
  }
  const body = (
    <div className="space-y-3 p-4">
      <p>Seed 4421 · 2026-10-04T14:30Z · {selected}</p>
      <label className="block">
        Draft
        <input
          ref={initial}
          aria-label="Draft"
          defaultValue="Keep this dirty draft"
          className="block w-full rounded-md border border-border bg-bg p-2"
        />
      </label>
      <Button onClick={() => setNested(true)}>Open nested confirmation</Button>
      <Button
        onClick={() => {
          setAdmitted(false)
          setSource((s) => s + 1)
        }}
      >
        Retire opener
      </Button>
      <p>Body owns vertical scrolling; inspection owns Left and Right. All actions stay local.</p>
      {evidenceRows.map((row) => (
        <p key={row.id}>{row.label}</p>
      ))}
      <ConfirmDialog
        open={nested}
        onOpenChange={setNested}
        title="Nested confirmation"
        description="No data will be changed."
        onConfirm={() => setNested(false)}
        showFullscreenToggle
      />
    </div>
  )
  const shared = { open, title: `${idiom === "nil" ? "Nil" : "Torque"} dialog specimen`, ...focus }
  let modal: ReactNode
  switch (variant) {
    case "detail":
      modal = (
        <DetailDialog {...shared} onClose={() => setOpen(false)}>
          {body}
        </DetailDialog>
      )
      break
    case "form":
      modal = (
        <FormDialog
          {...shared}
          onClose={() => setOpen(false)}
          onSubmit={() => setStatus("Local save intent")}
        >
          {body}
        </FormDialog>
      )
      break
    case "confirm":
      modal = (
        <ConfirmDialog
          {...shared}
          onOpenChange={setOpen}
          description={body}
          onConfirm={() => setOpen(false)}
        />
      )
      break
    case "command":
      modal = (
        <CommandDialog {...shared} onOpenChange={setOpen} showCloseButton>
          {body}
        </CommandDialog>
      )
      break
    case "dialog":
      modal = (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent {...focus}>
            <DialogTitle>{shared.title}</DialogTitle>
            {body}
          </DialogContent>
        </Dialog>
      )
      break
    case "alert":
      modal = (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent {...focus}>
            <AlertDialogTitle>{shared.title}</AlertDialogTitle>
            {body}
            <Button onClick={() => setOpen(false)}>Close alert</Button>
          </AlertDialogContent>
        </AlertDialog>
      )
      break
    case "json":
      modal = (
        <JsonModal
          {...shared}
          onClose={() => setOpen(false)}
          raw='{"seed":4421,"clock":"2026-10-04T14:30:00Z"}'
          initialFocus={undefined}
        />
      )
      break
    case "sheet":
      modal = (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent {...focus} side={sheetSide}>
            <SheetTitle>{shared.title}</SheetTitle>
            {body}
          </SheetContent>
        </Sheet>
      )
      break
    case "legacy-sidebar":
      modal = (
        <OverlaySidebar
          open={open}
          title={shared.title}
          onOpenChange={setOpen}
          trigger={<Button>Legacy sidebar opener</Button>}
          focusReturn={{
            isAdmitted: () => admitted,
            fallbackTarget: () => anchor.current,
            isFallbackAdmitted: () => true,
          }}
        >
          {body}
        </OverlaySidebar>
      )
      break
    case "sidebar":
      modal = (
        <OverlaySidebar
          {...shared}
          onOpenChange={setOpen}
          trigger={<Button>Sidebar opener</Button>}
        >
          {body}
        </OverlaySidebar>
      )
      break
    default:
      modal = (
        <InspectionDialog
          {...shared}
          ref={popup}
          onOpenChange={setOpen}
          {...nav.popupHandlers}
          navigation={
            <>
              <Button disabled={!nav.availability.previous} onClick={() => nav.navigate(-1)}>
                Previous
              </Button>
              <span>{selected}</span>
              <Button disabled={!nav.availability.next} onClick={() => nav.navigate(1)}>
                Next
              </Button>
            </>
          }
          navigationLabel="Record navigation"
        >
          {body}
        </InspectionDialog>
      )
  }
  const visible = records.filter(
    (r) =>
      (filter === "all" || r.type === filter) &&
      r.label.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <main className="min-h-dvh space-y-4 bg-bg p-4 text-fg">
      <h1 className="text-lg font-semibold">
        {idiom === "nil" ? "Nil focus workbench" : "Torque inspection workbench"}
      </h1>
      <p>Isolated primitives, seed 4421. No app recreation or live actions.</p>
      <div className="flex flex-wrap items-center gap-2">
        <label>
          Sheet side{" "}
          <select
            aria-label="Sheet side"
            value={sheetSide}
            onChange={(event) => setSheetSide(event.target.value as typeof sheetSide)}
          >
            {["top", "right", "bottom", "left"].map((side) => (
              <option key={side}>{side}</option>
            ))}
          </select>
        </label>
        <CycleModeToggle
          value={mode}
          modes={[
            { id: "todo", label: "Todos" },
            { id: "notes", label: "Notes" },
            { id: "all", label: "All" },
          ]}
          onValueChange={setMode}
          onSecondaryAction={() => setStatus("Local settings intent")}
        />
        <SearchAddToggle value={inputMode} onValueChange={setInputMode} />
        <Button onClick={() => setPalette(true)}>Quick search</Button>
        <label>
          Variant{" "}
          <select
            aria-label="Variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value as Variant)}
          >
            {variants.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} />{" "}
          Session fullscreen
        </label>
        <Button
          ref={origin}
          onClick={() => {
            recordOrigin.current = null
            setAdmitted(true)
            setOpen(true)
          }}
        >
          Open dialog
        </Button>
        <Button ref={anchor}>Admitted fallback</Button>
        <Button onClick={() => setHidden((v) => !v)}>Toggle Activity</Button>
        <Button onClick={() => setMounted((v) => !v)}>Toggle mount</Button>
      </div>
      <section aria-label="List navigation" className="space-y-2">
        {records.map((record, index) => (
          <button
            type="button"
            key={record.id}
            className="block w-full rounded-md border border-border bg-surface p-3 text-left focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(event) => {
              recordOrigin.current = event.currentTarget
              setSelected(record.id)
              setOpen(true)
            }}
            onKeyDown={(event) => {
              if (
                open ||
                event.target !== event.currentTarget ||
                event.nativeEvent.isComposing ||
                event.nativeEvent.keyCode === 229 ||
                event.ctrlKey ||
                event.altKey ||
                event.metaKey ||
                event.shiftKey ||
                !["ArrowUp", "ArrowDown"].includes(event.key)
              )
                return
              event.preventDefault()
              const next = Math.max(
                0,
                Math.min(records.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)),
              )
              ;(event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus()
            }}
          >
            {record.label}
          </button>
        ))}
      </section>
      <section aria-label="Board navigation" className="grid grid-cols-2 gap-3">
        {boardColumns.map((column, columnIndex) => (
          <div key={column[0].type} className="space-y-2 rounded-md border border-border p-3">
            <h2 className="text-sm font-semibold">
              {column[0].type === "todo" ? "Todos" : "Notes"}
            </h2>
            {column.map((record, rowIndex) => (
              <button
                key={record.id}
                type="button"
                aria-label={`Board ${record.label}`}
                className="block w-full rounded-md border border-border bg-surface p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring"
                ref={(node) => {
                  if (node) boardRefs.current.set(record.id, node)
                  else boardRefs.current.delete(record.id)
                }}
                onClick={(event) => {
                  recordOrigin.current = event.currentTarget
                  setSelected(record.id)
                  setOpen(true)
                }}
                onKeyDown={(event) => {
                  if (
                    open ||
                    event.target !== event.currentTarget ||
                    event.defaultPrevented ||
                    event.nativeEvent.isComposing ||
                    event.nativeEvent.keyCode === 229 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.altKey ||
                    event.shiftKey
                  )
                    return
                  const horizontal =
                    event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
                  const vertical = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
                  if (!horizontal && !vertical) return
                  event.preventDefault()
                  const nextColumn = Math.max(
                    0,
                    Math.min(boardColumns.length - 1, columnIndex + horizontal),
                  )
                  const nextRow = Math.max(
                    0,
                    Math.min(boardColumns[nextColumn].length - 1, rowIndex + vertical),
                  )
                  boardRefs.current.get(boardColumns[nextColumn][nextRow].id)?.focus()
                }}
              >
                {record.label}
              </button>
            ))}
          </div>
        ))}
      </section>
      <p role="status">{status}</p>
      {mounted && <Activity mode={hidden ? "hidden" : "visible"}>{modal}</Activity>}
      <SearchPalette
        open={palette}
        onOpenChange={setPalette}
        title={`${idiom} quick search`}
        query={query}
        onQueryChange={setQuery}
        options={visible}
        filters={[
          { id: "all", label: "All" },
          { id: "todo", label: "Todos" },
          { id: "notes", label: "Notes" },
        ]}
        filterId={filter}
        onFilterChange={setFilter}
        sourceGeneration={`${source}/${filter}`}
        onSearch={(q) => setStatus(`Local query: ${q}`)}
        onSelect={(id) => {
          setSelected(id)
          setPalette(false)
          setOpen(true)
        }}
        showFullscreenToggle
        returnFocus={{
          trigger: () => recordOrigin.current ?? origin.current,
          isAdmitted: () => admitted,
          fallbackTarget: () => anchor.current,
        }}
      />
    </main>
  )
}
export function NilDialogProof(props: { idiom?: "nil" | "torque" }) {
  return (
    <StrictMode>
      <Specimen {...props} />
    </StrictMode>
  )
}
