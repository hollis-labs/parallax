import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react"
import { type ReactNode, useId } from "react"
import type { WidgetId } from "./model"
/** Local controlled candidate: host owns validation/persistence and admission. */
export function Widget({
  id,
  title,
  icon: Icon,
  meta,
  open,
  onOpenChange,
  children,
}: {
  id: WidgetId
  title: string
  icon: LucideIcon
  meta?: ReactNode
  open: boolean
  onOpenChange: (id: WidgetId, open: boolean) => void
  children: ReactNode
}) {
  const bodyId = useId()
  return (
    <section
      className="overflow-hidden rounded-panel border border-border-subtle bg-bg-elevated"
      data-widget={id}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => onOpenChange(id, !open)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface focus-visible:outline focus-visible:outline-ring"
        >
          <Icon className="size-3 shrink-0 text-fg-muted" aria-hidden="true" />
          <span className="flex-1 font-mono text-label font-semibold uppercase tracking-wide text-fg-muted">
            {title}
          </span>
          {meta != null && <span className="font-mono text-caption text-fg-faint">{meta}</span>}
          {open ? (
            <ChevronDown className="size-3 text-fg-faint" />
          ) : (
            <ChevronRight className="size-3 text-fg-faint" />
          )}
        </button>
      </h3>
      <div id={bodyId} hidden={!open} className="border-t border-divider px-3 pb-3 pt-2.5">
        {open && children}
      </div>
    </section>
  )
}
export function WidgetRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-5 items-start justify-between gap-2.5 text-xs">
      <span className="shrink-0 text-fg-muted">{label}</span>
      <span className="min-w-0 text-right font-mono text-label text-fg-secondary [overflow-wrap:anywhere]">
        {children}
      </span>
    </div>
  )
}
