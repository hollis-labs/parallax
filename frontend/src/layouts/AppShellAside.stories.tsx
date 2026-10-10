import {
  type AppShellAsidePreference,
  createAppShellAsideStore,
  createMemoryStorage,
  useAppShellAside,
} from "@hollis-labs/design-app-runtime"
import { AppShell, type AsideWidth, Button } from "@hollis-labs/design-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Layers, PanelRight, PanelRightClose, PanelRightOpen } from "lucide-react"
import { useId, useState } from "react"

function MockAside({
  onCollapse,
  itemCount = 20,
}: {
  onCollapse?: () => void
  itemCount?: number
}) {
  return (
    <div className="flex h-full flex-col bg-surface p-4 text-fg" data-testid="aside-companion">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <strong className="text-sm font-semibold">Operations Companion</strong>
        {onCollapse && (
          <Button size="sm" variant="ghost" aria-label="Collapse aside" onClick={onCollapse}>
            <PanelRightClose className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2 text-xs" data-testid="aside-scroll-container">
        <p className="font-mono text-fg-muted">Seed: 4421 · 2026-10-04T14:30:00Z</p>
        <div className="mt-2 space-y-2">
          {Array.from({ length: itemCount }, (_, i) => {
            const asideId = `aside-record-${i + 1}`
            return (
              <div
                key={asideId}
                className="rounded border border-border p-2 text-xs"
                data-testid={`aside-item-${i}`}
              >
                <strong className="text-fg">Companion record #{i + 1}</strong>
                <p className="text-fg-muted">
                  Independent aside scroll item verification without transport.
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MockMain({
  itemCount = 30,
  onExpandAside,
  isCollapsed,
}: {
  itemCount?: number
  onExpandAside?: () => void
  isCollapsed?: boolean
}) {
  return (
    <div className="p-6 text-fg" data-testid="main-body-content">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Main Operations Workstream</h2>
          <p className="text-sm text-fg-muted">
            Independent body scroll container verified against fixed shell bounds.
          </p>
        </div>
        {isCollapsed && onExpandAside && (
          <Button
            size="sm"
            variant="outline"
            aria-label="Expand aside companion"
            onClick={onExpandAside}
          >
            <PanelRightOpen className="size-4 mr-1" />
            Expand aside
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {Array.from({ length: itemCount }, (_, i) => {
          const taskId = `TASK-${String(i + 1).padStart(3, "0")}`
          return (
            <div
              key={taskId}
              className="rounded border border-border p-3 text-sm bg-surface"
              data-testid={`body-item-${i}`}
            >
              <span className="font-mono text-xs text-fg-muted">{taskId}</span>
              <p className="mt-1">
                Primary workload row #{i + 1} verifying body scroll ownership independent of aside.
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ShellDemo({
  width = "regular",
  collapsed = false,
  emptyAside = false,
  short = false,
}: {
  width?: AsideWidth
  collapsed?: boolean
  emptyAside?: boolean
  short?: boolean
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const asideTriggerId = useId()

  const asideContent = emptyAside ? (
    <div className="p-4 text-xs text-fg-muted" data-testid="empty-aside">
      Empty aside slot placeholder
    </div>
  ) : (
    <MockAside onCollapse={() => setIsCollapsed(true)} />
  )

  const containerStyle = short ? { height: 420 } : { height: 700 }

  return (
    <div style={containerStyle} className="border border-border rounded-lg overflow-hidden">
      <AppShell
        header={
          <header className="flex items-center justify-between p-3 border-b border-border bg-surface">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-accent" />
              <strong className="text-sm font-semibold">Parallax Shell Aside Review</strong>
            </div>
            {isCollapsed && !emptyAside && (
              <Button
                id={asideTriggerId}
                size="sm"
                variant="outline"
                aria-label="Expand aside companion"
                onClick={() => setIsCollapsed(false)}
              >
                <PanelRightOpen className="size-4 mr-1" />
                Open aside
              </Button>
            )}
          </header>
        }
        aside={asideContent}
        asideWidth={width}
        asideCollapsed={isCollapsed}
        onAsideCollapsedChange={setIsCollapsed}
        asideLabel="Operations aside slot"
        asideTrigger={
          <Button
            size="sm"
            variant="outline"
            aria-label="Open aside"
            data-slot="app-shell-aside-trigger"
            data-testid="app-shell-aside-trigger"
          >
            <PanelRight className="size-4" />
            <span className="sr-only">Open aside</span>
          </Button>
        }
      >
        <MockMain isCollapsed={isCollapsed} onExpandAside={() => setIsCollapsed(false)} />
        <footer
          className="p-2 border-t border-border bg-surface text-center text-xs text-fg-muted"
          data-testid="shell-footer"
        >
          Pinned footer · Fixed reference 2026-10-04T14:30:00Z · deterministic seed 4421
        </footer>
      </AppShell>
    </div>
  )
}

function HookInteractiveDemo() {
  const [store] = useState(() =>
    createAppShellAsideStore({
      appNamespace: "storybook-demo",
      defaultWidth: "compact",
      defaultCollapsed: false,
      storage: createMemoryStorage<AppShellAsidePreference>({ width: "compact", collapsed: false }),
    }),
  )
  const { width, collapsed, setWidth, setCollapsed } = useAppShellAside({ store })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded bg-surface border border-border text-sm">
        <label className="flex items-center gap-2">
          <span>Width preset:</span>
          <select
            value={width}
            onChange={(e) => setWidth(e.target.value as AsideWidth)}
            aria-label="Aside width selector"
          >
            <option value="compact">compact (w-80 / 20rem)</option>
            <option value="regular">regular (w-96 / 24rem)</option>
            <option value="wide">wide (w-112 / 28rem)</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={collapsed}
            onChange={(e) => setCollapsed(e.target.checked)}
            aria-label="Collapse toggle"
          />
          <span>Collapsed</span>
        </label>
      </div>
      <div style={{ height: 600 }} className="border border-border rounded-lg overflow-hidden">
        <AppShell
          header={
            <header className="p-3 border-b border-border bg-surface flex items-center justify-between">
              <strong>Hook-driven AppShell Aside</strong>
              {collapsed && (
                <Button size="sm" variant="outline" onClick={() => setCollapsed(false)}>
                  Expand aside
                </Button>
              )}
            </header>
          }
          aside={<MockAside onCollapse={() => setCollapsed(true)} />}
          asideWidth={width}
          asideCollapsed={collapsed}
          onAsideCollapsedChange={setCollapsed}
          asideLabel="Hook-driven aside slot"
        >
          <MockMain isCollapsed={collapsed} onExpandAside={() => setCollapsed(false)} />
        </AppShell>
      </div>
    </div>
  )
}

const meta = {
  title: "Layouts/AppShell Aside",
  component: ShellDemo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ShellDemo>

export default meta
type Story = StoryObj<typeof meta>

export const RegularWidth: Story = {
  args: { width: "regular", collapsed: false },
}

export const CompactWidth: Story = {
  args: { width: "compact", collapsed: false },
}

export const WideWidth: Story = {
  args: { width: "wide", collapsed: false },
}

export const CollapsedAsideNoSliver: Story = {
  args: { width: "regular", collapsed: true },
}

export const EmptyAsideAdoption: Story = {
  args: { emptyAside: true, collapsed: false },
}

export const ShortHeightOwnership: Story = {
  args: { short: true, width: "regular", collapsed: false },
}

export const WithAsideHook: Story = {
  render: () => <HookInteractiveDemo />,
}
