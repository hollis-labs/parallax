import type { RadialMenuItem } from "@hollis-labs/design-components"
import {
  isComposingEvent,
  RadialMenu,
  useLayeredEscape,
  useLongPress,
  useShortcut,
} from "@hollis-labs/design-components"
import {
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CheckSquare,
  Copy,
  FileEdit,
  FileText,
  MoreHorizontal,
  Pin,
  Tag,
  Trash2,
} from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Titles from Nil app_demo.go; identities are isolated deterministic Nil records,
// not Torque task IDs. Note is a labelled local fixture, not a source seed claim.
const fixtures = [
  {
    id: "nil-demo-4421-101",
    title: "Welcome to NIL! Click me to see notes",
    kind: "todo",
    section: "now",
  },
  {
    id: "nil-demo-4421-307",
    title: "Explore Now/Soon/Anytime scope views",
    kind: "todo",
    section: "soon",
  },
  {
    id: "nil-note-4421-911",
    title: "Local note: keyboard and radial behavior",
    kind: "note",
    section: "anytime",
  },
] as const
const todo: RadialMenuItem[] = [
  { id: "now", label: "NOW", angle: 0 },
  { id: "soon", label: "SOON", angle: 45 },
  { id: "anytime", label: "ANY", angle: 90 },
  { id: "delete", label: "DEL", angle: 135 },
  { id: "edit", label: "EDIT", angle: 180 },
  { id: "complete", label: "DONE", angle: 225 },
  {
    id: "more",
    label: "MORE",
    angle: 270,
    children: [
      { id: "archive", label: "ARCH", angle: 90 },
      { id: "clone", label: "COPY", angle: 150 },
      { id: "meta", label: "META", angle: 210 },
      { id: "convertType", label: "→NOTE", angle: 270 },
    ],
  },
  { id: "pin", label: "PIN", angle: 315 },
]
const note: RadialMenuItem[] = [
  { id: "edit", label: "EDIT", angle: 0 },
  { id: "convertType", label: "→TODO", angle: 60 },
  { id: "delete", label: "DEL", angle: 120 },
  { id: "pin", label: "PIN", angle: 180 },
  { id: "clone", label: "COPY", angle: 270 },
]
const actionIcons = {
  now: ArrowUp,
  soon: ArrowRight,
  anytime: ArrowDown,
  delete: Trash2,
  edit: FileEdit,
  complete: CheckCircle2,
  more: MoreHorizontal,
  pin: Pin,
  archive: Archive,
  clone: Copy,
  meta: Tag,
  convertType: FileText,
}
function withIcons(items: readonly RadialMenuItem[], isNote: boolean): RadialMenuItem[] {
  return items.map((item) => {
    const Icon =
      isNote && item.id === "convertType"
        ? CheckSquare
        : actionIcons[item.id as keyof typeof actionIcons]
    return {
      ...item,
      icon: Icon ? <Icon className="size-3" aria-hidden="true" /> : undefined,
      children: item.children ? withIcons(item.children, isNote) : undefined,
    }
  })
}
export const controls: {
  current?: ReturnType<typeof useLongPress>
  retained: ReturnType<typeof useLongPress>[]
} = { retained: [] }

function Row({
  record,
  revision,
  accessible,
  onOpen,
  onInspect,
}: {
  record: (typeof fixtures)[number]
  revision: number
  accessible: boolean
  onOpen: (record: (typeof fixtures)[number], target: HTMLElement, x: number, y: number) => void
  onInspect: () => void
}) {
  const press = useLongPress({
    sourceGeneration: revision,
    activationGeneration: record.id,
    accessible,
    isAdmitted: () => accessible,
    onLongPress: (gesture) => onOpen(record, gesture.target, gesture.clientX, gesture.clientY),
  })
  const rowRef = useRef<HTMLButtonElement>(null)
  const openFromKey = () => {
    const target = rowRef.current
    if (!target) return
    const r = target.getBoundingClientRect()
    onOpen(record, target, r.x + r.width / 2, r.y + r.height / 2)
  }
  useShortcut({
    key: "F10",
    modifiers: { shift: true },
    scopeElement: () => rowRef.current,
    isAdmitted: () => accessible && document.activeElement === rowRef.current,
    sourceGeneration: revision,
    onTrigger: openFromKey,
  })
  useShortcut({
    key: "ContextMenu",
    scopeElement: () => rowRef.current,
    isAdmitted: () => accessible && document.activeElement === rowRef.current,
    sourceGeneration: revision,
    onTrigger: openFromKey,
  })
  const frame = useShortcut({ key: "", enabled: false, onTrigger: () => {} }).isLive
  useLayoutEffect(() => {
    controls.current = press
  })
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!accessible}
        ref={rowRef}
        data-testid={record.id}
        aria-label={record.title}
        aria-haspopup="menu"
        tabIndex={0}
        className="rounded-control border border-border-subtle bg-surface p-3 text-fg"
        {...press.bindings}
        onKeyDown={(e) => {
          if (
            !frame() ||
            !accessible ||
            e.target !== e.currentTarget ||
            e.defaultPrevented ||
            isComposingEvent(e.nativeEvent)
          )
            return
          if (
            (e.key === "Enter" || e.key === " ") &&
            !e.shiftKey &&
            !e.altKey &&
            !e.ctrlKey &&
            !e.metaKey
          ) {
            e.preventDefault()
            onInspect()
          }
        }}
        onClick={onInspect}
      >
        {record.title}
      </button>
      <input
        aria-label={`Select ${record.title}`}
        type="checkbox"
        className="ml-3"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
function Nested({ onClose }: { onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  useLayeredEscape({
    active: true,
    rootElement: () => root.current,
    onEscape: () => {
      onClose()
      return "closed"
    },
  })
  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Nested local popup"
      className="fixed inset-8 z-50 bg-bg-elevated p-4"
    >
      <input
        ref={(node) => {
          node?.focus()
        }}
        aria-label="Nested editable"
      />
      <button type="button" onClick={onClose}>
        Close nested
      </button>
    </div>,
    document.body,
  )
}
function SecondaryHold() {
  const [holds, setHolds] = useState(0)
  const [clicks, setClicks] = useState(0)
  const hold = useLongPress({
    sourceGeneration: "secondary-source",
    activationGeneration: "secondary-button",
    isAdmitted: () => true,
    onLongPress: () => setHolds((value) => value + 1),
  })
  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        data-testid="secondary-hold"
        {...hold.bindings}
        onClick={() => setClicks((value) => value + 1)}
        className="rounded-control bg-surface p-2"
      >
        <span>Secondary action hold</span>
      </button>
      <output data-testid="secondary-holds">{holds}</output>
      <output data-testid="secondary-clicks">{clicks}</output>
    </div>
  )
}
export function NilRadialSpecimen({ idiom = "nil" }: { idiom?: "nil" | "message" }) {
  const [revision, setRevision] = useState(0)
  const [accessible, setAccessible] = useState(true)
  const [nested, setNested] = useState(false)
  const [inspections, setInspections] = useState(0)
  const [otherClicks, setOtherClicks] = useState(0)
  const [actions, setActions] = useState<string[]>([])
  const [menu, setMenu] = useState<{
    record: (typeof fixtures)[number]
    target: HTMLElement
    position: { x: number; y: number }
    source: number
  } | null>(null)
  const anchor = useRef<HTMLFieldSetElement>(null)
  const open = (record: (typeof fixtures)[number], target: HTMLElement, x: number, y: number) =>
    setMenu({ record, target, position: { x, y }, source: revision })
  return (
    <main className="min-h-screen bg-bg p-4 text-fg" data-testid="nil-radial-specimen">
      <h1 className="text-lg">
        {idiom === "nil" ? "Nil radial behavior" : "Message actions: second idiom"}
      </h1>
      <p className="text-caption text-fg-muted">
        Seed 4421 · 2026-10-04T14:30:00Z · local inert actions · hold 1000 ms or Shift+F10
      </p>
      <div className="my-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (controls.current) controls.retained.push(controls.current)
            setRevision((r) => r + 1)
          }}
        >
          Replace source
        </button>
        <button type="button" onClick={() => setAccessible((a) => !a)}>
          Toggle access
        </button>
        <button
          type="button"
          data-testid="reposition-menu"
          onClick={() =>
            setMenu((current) => (current ? { ...current, position: { x: 0, y: 0 } } : current))
          }
        >
          Move admitted menu
        </button>
        <button
          type="button"
          data-testid="replace-menu-source"
          onClick={() => {
            const next = revision + 1
            setRevision(next)
            setMenu((current) => (current ? { ...current, source: next } : current))
          }}
        >
          Replace admitted menu source
        </button>
        <button type="button" onClick={() => setNested(true)}>
          Nested popup
        </button>
        <button type="button" data-testid="unrelated" onClick={() => setOtherClicks((n) => n + 1)}>
          Unrelated click
        </button>
        <button
          type="button"
          onClick={() => {
            const target = anchor.current
            if (!target) return
            open(fixtures[0], target, 0, 0)
          }}
        >
          Top left edge
        </button>
        <button
          type="button"
          onClick={() => {
            const target = anchor.current
            if (!target) return
            open(fixtures[2], target, window.innerWidth, window.innerHeight)
          }}
        >
          Bottom right edge
        </button>
      </div>
      <input aria-label="Background query" defaultValue="+tutorial" />
      <fieldset
        ref={anchor}
        tabIndex={-1}
        aria-label="Fixture list"
        className="mt-3 flex min-w-0 flex-col gap-2 border-0"
      >
        {fixtures.map((record) => (
          <Row
            key={record.id}
            record={record}
            revision={revision}
            accessible={accessible}
            onOpen={open}
            onInspect={() => setInspections((n) => n + 1)}
          />
        ))}
      </fieldset>
      <SecondaryHold />
      <output data-testid="inspections">{inspections}</output>
      <output data-testid="other-clicks">{otherClicks}</output>
      <output data-testid="actions">{actions.join(",")}</output>
      {menu && (
        <RadialMenu
          open
          label="Nil actions"
          position={menu.position}
          sourceGeneration={revision}
          activationGeneration={menu.record.id}
          accessible={accessible}
          isAdmitted={() => menu.source === revision}
          focusReturn={{
            trigger: menu.target,
            isAdmitted: () => accessible && menu.source === revision,
            fallbackTarget: () => anchor.current,
          }}
          items={
            idiom === "message"
              ? [
                  { id: "reply", label: "Reply to this unusually long message label", angle: 0 },
                  { id: "__center", label: "Copy", angle: 120 },
                  { id: "disabled-message", label: "Unavailable", disabled: true, angle: 240 },
                ]
              : menu.record.kind === "note"
                ? withIcons(note, true)
                : withIcons(todo, false).map((item) => ({
                    ...item,
                    disabled: item.id === menu.record.section,
                  }))
          }
          onAction={(id) => setActions((a) => [...a, `${menu.record.id}:${id}`])}
          onOpenChange={(value) => {
            if (!value) setMenu(null)
          }}
        />
      )}
      {nested && <Nested onClose={() => setNested(false)} />}
    </main>
  )
}
