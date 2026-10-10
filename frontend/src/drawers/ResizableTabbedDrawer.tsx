import { GripHorizontal, X } from "lucide-react"
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react"
import { ChatDrawerTabStrip } from "./ChatDrawerTabStrip"
import { DRAWER_GEOMETRY } from "./geometry"
import type { ChatDrawerTab, DrawerPlacement, DrawerTabStripVariant } from "./types"

export interface ResizableTabbedDrawerProps {
  placement?: DrawerPlacement
  open: boolean
  onOpenChange: (open: boolean) => void
  height: number
  onHeightChange: (height: number) => void
  defaultHeight?: number
  minHeight?: number
  maxHeight?: number
  tabs?: ChatDrawerTab[]
  activeTab?: string
  onSelectTab?: (id: string) => void
  onCloseTab?: (id: string) => void
  onTogglePinTab?: (id: string) => void
  tabStripVariant?: DrawerTabStripVariant
  showTabStrip?: boolean
  showCloseButton?: boolean
  headerActions?: ReactNode
  children: ReactNode
  sidebar?: ReactNode
  alert?: ReactNode
  isAlertActive?: boolean
  className?: string
  title?: string
  ariaLabel?: string
}

export function ResizableTabbedDrawer({
  placement = "bottom",
  open,
  onOpenChange,
  height,
  onHeightChange,
  defaultHeight = placement === "top"
    ? DRAWER_GEOMETRY.primaryDefault
    : DRAWER_GEOMETRY.workingDefault,
  minHeight = DRAWER_GEOMETRY.minimum,
  maxHeight = DRAWER_GEOMETRY.maximum,
  tabs = [],
  activeTab,
  onSelectTab,
  onCloseTab,
  onTogglePinTab,
  tabStripVariant = "card",
  showTabStrip = true,
  showCloseButton = true,
  headerActions,
  children,
  sidebar,
  alert,
  isAlertActive = false,
  className = "",
  title = placement === "top" ? "Primary Drawer" : "Working Drawer",
  ariaLabel,
}: ResizableTabbedDrawerProps) {
  const dragRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const previousOpenRef = useRef(open)
  useLayoutEffect(() => {
    if (previousOpenRef.current && !open && document.activeElement === document.body) {
      handleRef.current?.focus()
    }
    previousOpenRef.current = open
  }, [open])

  const effectiveHeight = Math.max(minHeight, Math.min(maxHeight, height || defaultHeight))

  // Drag mechanics
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isAlertActive) return
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.focus()
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: open ? effectiveHeight : defaultHeight,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!open) onOpenChange(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isAlertActive) return
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    if ((e.buttons & 1) !== 1) {
      dragRef.current = null
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      return
    }

    const deltaY = e.clientY - d.startY
    // For top drawer: dragging DOWN increases height (+deltaY)
    // For bottom drawer: dragging UP increases height (-deltaY)
    const rawNext = placement === "top" ? d.startHeight + deltaY : d.startHeight - deltaY
    const clamped = Math.max(0, Math.min(maxHeight, rawNext))
    onHeightChange(clamped)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (isAlertActive) return

    // Auto-close if shrunk below threshold
    if (height < DRAWER_GEOMETRY.collapseThreshold) {
      onOpenChange(false)
      onHeightChange(defaultHeight)
    }
  }

  const onLostPointerCapture = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null
    }
  }

  const onDoubleClick = () => {
    if (isAlertActive) return
    const nextOpen = !open
    onOpenChange(nextOpen)
    if (nextOpen && height < minHeight) {
      onHeightChange(defaultHeight)
    }
  }

  // Keyboard resizing mechanics
  const onKeyDownHandle = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isAlertActive) return
    if (e.defaultPrevented || e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.altKey || e.ctrlKey || e.metaKey) return

    const step = DRAWER_GEOMETRY.keyboardStep
    const largeStep = DRAWER_GEOMETRY.keyboardPageStep

    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar" || e.code === "Space") {
      e.preventDefault()
      onDoubleClick()
      return
    }

    if (e.key === "Home") {
      e.preventDefault()
      if (!open) onOpenChange(true)
      onHeightChange(minHeight)
      return
    }

    if (e.key === "End") {
      e.preventDefault()
      if (!open) onOpenChange(true)
      onHeightChange(maxHeight)
      return
    }

    let delta = 0
    if (placement === "top") {
      if (e.key === "ArrowDown") delta = step
      else if (e.key === "ArrowUp") delta = -step
      else if (e.key === "PageDown") delta = largeStep
      else if (e.key === "PageUp") delta = -largeStep
    } else {
      if (e.key === "ArrowUp") delta = step
      else if (e.key === "ArrowDown") delta = -step
      else if (e.key === "PageUp") delta = largeStep
      else if (e.key === "PageDown") delta = -largeStep
    }

    if (delta !== 0) {
      e.preventDefault()
      if (!open && delta > 0) {
        onOpenChange(true)
        onHeightChange(defaultHeight)
        return
      }
      const next = Math.max(0, Math.min(maxHeight, effectiveHeight + delta))
      if (next < DRAWER_GEOMETRY.collapseThreshold) {
        onOpenChange(false)
        onHeightChange(defaultHeight)
      } else {
        if (!open) onOpenChange(true)
        onHeightChange(next)
      }
    }
  }

  const handleClose = useCallback(() => {
    onOpenChange(false)
    handleRef.current?.focus()
  }, [onOpenChange])

  const tabsWithActive = activeTab ? tabs.map((t) => ({ ...t, active: t.id === activeTab })) : tabs

  const dragHandleElement = (
    // biome-ignore lint/a11y/useSemanticElements: interactive draggable separator
    <div
      ref={handleRef}
      data-testid={`drawer-handle-${placement}`}
      className={`relative flex items-center justify-center h-5 shrink-0 overflow-hidden bg-bg-elevated border-x border-border ${
        placement === "top"
          ? "border-b border-border rounded-b-panel"
          : "border-t border-border rounded-t-panel"
      } cursor-row-resize select-none touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onLostPointerCapture}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDownHandle}
      role="separator"
      tabIndex={isAlertActive ? -1 : 0}
      aria-disabled={isAlertActive ? true : undefined}
      aria-orientation="horizontal"
      aria-valuenow={open ? Math.round(effectiveHeight) : 0}
      aria-valuemin={0}
      aria-valuemax={maxHeight}
      aria-label={
        ariaLabel ??
        `${title} resize handle: drag or use arrow keys to resize, Space to toggle open`
      }
    >
      <GripHorizontal className="size-3 text-fg-muted pointer-events-none" />
    </div>
  )

  const tabStripElement = showTabStrip && tabsWithActive.length > 0 && (
    <div className="flex items-center justify-between gap-2 px-2 py-0.5 shrink-0 border-x border-border bg-bg-elevated min-w-0">
      <div className="min-w-0 flex-1">
        <ChatDrawerTabStrip
          tabs={tabsWithActive}
          dock={placement === "top" ? "bottom" : "top"}
          variant={tabStripVariant}
          onSelect={onSelectTab ?? (() => {})}
          onClose={onCloseTab}
          onTogglePin={onTogglePinTab}
          aria-label={`${title} tabs`}
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {headerActions}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-sm text-fg-muted hover:text-fg hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label={`Close ${title}`}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <section
      data-testid={`drawer-${placement}`}
      className={`w-full max-w-3xl mx-auto relative min-w-0 ${className}`}
      aria-label={title}
    >
      {/* For bottom drawer: drag handle is at TOP */}
      {placement === "bottom" && dragHandleElement}

      {/* Drawer Body region when open */}
      {open && (
        <section
          data-testid={`drawer-body-${placement}`}
          className="overflow-hidden border-x border-border bg-bg-elevated relative min-w-0 flex flex-col"
          style={{ height: `${effectiveHeight}px` }}
          id={`drawer-panel-${placement}`}
          aria-label={`${title} content`}
        >
          {/* Main content + optional sidebar */}
          <div
            inert={isAlertActive}
            aria-hidden={isAlertActive || undefined}
            className={`flex h-full min-h-0 min-w-0 flex-1 transition-opacity duration-200 ${
              isAlertActive ? "opacity-30 pointer-events-none select-none" : "opacity-100"
            }`}
          >
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
            {sidebar && (
              <aside className="w-36 shrink-0 border-l border-border bg-surface/30 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sidebar}
              </aside>
            )}
          </div>

          {/* Alert / Banner overlay */}
          {isAlertActive && alert && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
              <div className="absolute inset-1.5 rounded-control bg-bg/80 backdrop-blur-xs" />
              <div className="relative w-full max-w-md z-10">{alert}</div>
            </div>
          )}
        </section>
      )}

      {/* For top drawer: tab strip is docked to bottom of body, then drag handle is at very bottom */}
      {open && placement === "top" && tabStripElement}
      {placement === "top" && dragHandleElement}

      {/* For bottom drawer: tab strip can appear above body if configured */}
      {open && placement === "bottom" && !sidebar && tabStripElement}
    </section>
  )
}
