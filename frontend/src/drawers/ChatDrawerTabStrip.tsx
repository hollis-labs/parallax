import { ChevronLeft, ChevronRight, Pin, PinOff, X } from "lucide-react"
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type { ChatDrawerTab, DrawerPlacement, DrawerTabStripVariant } from "./types"

export interface ChatDrawerTabStripProps {
  tabs: ChatDrawerTab[]
  dock?: DrawerPlacement
  variant?: DrawerTabStripVariant
  onSelect: (id: string) => void
  onClose?: (id: string) => void
  onTogglePin?: (id: string) => void
  className?: string
  "aria-label"?: string
}

const TAB_LABEL_MAX = 16

function truncate(s: string): string {
  return s.length > TAB_LABEL_MAX ? `${s.slice(0, TAB_LABEL_MAX - 1)}…` : s
}

export function ChatDrawerTabStrip({
  tabs,
  dock = "top",
  variant = "card",
  onSelect,
  onClose,
  onTogglePin,
  className = "",
  "aria-label": ariaLabel = "Drawer tabs",
}: ChatDrawerTabStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [overflow, setOverflow] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  })

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const left = el.scrollLeft > 0
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setOverflow({ left, right })
  }, [])

  useLayoutEffect(() => {
    if (tabs.length >= 0) {
      measure()
    }
  }, [measure, tabs.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => measure()
    el.addEventListener("scroll", handler, { passive: true })
    window.addEventListener("resize", handler)
    return () => {
      el.removeEventListener("scroll", handler)
      window.removeEventListener("resize", handler)
    }
  }, [measure])

  const paginate = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    const target = e.target as HTMLElement | null
    if (target?.getAttribute("role") !== "tab") return

    if (tabs.length === 0) return
    const activeIndex = tabs.findIndex((t) => t.active)
    let nextIndex = -1

    if (e.key === "ArrowRight") {
      e.preventDefault()
      nextIndex = activeIndex < tabs.length - 1 ? activeIndex + 1 : 0
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      nextIndex = activeIndex > 0 ? activeIndex - 1 : tabs.length - 1
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = tabs.length - 1
    }

    if (nextIndex >= 0 && nextIndex < tabs.length) {
      const nextTab = tabs[nextIndex]
      onSelect(nextTab.id)
      const btn = tabButtonRefs.current.get(nextTab.id)
      btn?.focus()
    }
  }

  const pendingFocusTabIdRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      pendingFocusTabIdRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (!isMountedRef.current) return
    void tabs
    const targetId = pendingFocusTabIdRef.current
    if (!targetId) return
    const btn = tabButtonRefs.current.get(targetId)
    if (btn) {
      pendingFocusTabIdRef.current = null
      btn.focus()
    }
  }, [tabs])

  const handleCloseTab = (id: string, index: number) => {
    if (!onClose) return
    // Return focus to adjacent tab after committed update if closed tab was active
    const activeTab = tabs.find((t) => t.active)
    if (activeTab?.id === id) {
      const nextTab = tabs[index + 1] ?? tabs[index - 1]
      if (nextTab) {
        pendingFocusTabIdRef.current = nextTab.id
        onSelect(nextTab.id)
      }
    }
    onClose(id)
  }

  return (
    <div
      className={`flex items-center gap-1 px-1 min-w-0 max-w-full ${
        variant === "inline"
          ? "border-b border-border bg-surface/40"
          : dock === "bottom"
            ? "border-t border-border bg-bg-elevated"
            : "border-b border-border bg-bg-elevated"
      } ${className}`}
      role="toolbar"
      aria-label={ariaLabel}
    >
      {overflow.left && (
        <button
          type="button"
          onClick={() => paginate(-1)}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-sm text-fg-muted hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="size-3.5" />
        </button>
      )}

      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="flex flex-1 items-center gap-1 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t, index) => {
          const isActive = t.active
          return (
            <div
              key={t.id}
              className={`group relative shrink-0 flex items-center gap-1 px-2.5 py-1 font-mono text-caption tracking-wide transition-colors ${
                variant === "inline"
                  ? isActive
                    ? "bg-bg-elevated text-fg rounded-control shadow-sm"
                    : "text-fg-muted hover:bg-bg-elevated/60 hover:text-fg-secondary rounded-control"
                  : isActive
                    ? "bg-surface text-fg rounded-t-control border-x border-border shadow-sm z-10"
                    : "text-fg-muted hover:bg-surface/60 hover:text-fg-secondary rounded-control"
              }`}
            >
              <button
                ref={(el) => {
                  if (el) tabButtonRefs.current.set(t.id, el)
                  else tabButtonRefs.current.delete(t.id)
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(t.id)}
                title={t.label}
                className="flex items-center gap-1.5 outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
              >
                {t.icon && <span className="shrink-0">{t.icon}</span>}
                <span className="truncate">{truncate(t.label)}</span>
                {t.runningPip && (
                  <span
                    role="status"
                    className="inline-block size-1.5 rounded-full bg-warning animate-pulse shrink-0"
                    aria-label="Running activity"
                  />
                )}
                {t.count !== undefined && (
                  <span className="rounded-sm bg-surface px-1 text-micro font-medium tabular-nums text-fg-muted">
                    {t.count}
                  </span>
                )}
              </button>

              {t.pinnable && onTogglePin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePin(t.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-fg-muted hover:text-fg p-0.5 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={t.pinned ? `Unpin tab ${t.label}` : `Pin tab ${t.label}`}
                >
                  {t.pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                </button>
              )}

              {t.closeable && onClose && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseTab(t.id, index)
                  }}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-fg-muted hover:text-fg p-0.5 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={`Close tab ${t.label}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {overflow.right && (
        <button
          type="button"
          onClick={() => paginate(1)}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded-sm text-fg-muted hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  )
}
