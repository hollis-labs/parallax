import { Button, OverlaySidebar } from "@hollis-labs/design-components"
import { NavRail } from "@hollis-labs/kit-dashboard"
import { Layers } from "lucide-react"
import { type ReactNode, useState } from "react"
export type NavigationMode = "rail" | "header" | "drawer"
export type NavigationItem = {
  key: string
  label: string
  icon: ReactNode
  active: boolean
  onSelect: () => void
}
export function Navigation({ mode, items }: { mode: NavigationMode; items: NavigationItem[] }) {
  const [open, setOpen] = useState(false)
  const links = (
    <nav
      aria-label="Page navigation"
      className={`comparison-navigation comparison-navigation-${mode}`}
    >
      {items.map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={item.active ? "secondary" : "ghost"}
          aria-current={item.active ? "page" : undefined}
          onClick={() => {
            item.onSelect()
            setOpen(false)
          }}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  )
  return mode === "rail" ? (
    <div className="navigation-scroll">
      <NavRail logo={<Layers className="size-5" />} logoLabel="Parallax" items={items} />
    </div>
  ) : mode === "header" ? (
    links
  ) : (
    <OverlaySidebar
      side="left"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" variant="outline">
          Open navigation
        </Button>
      }
      title="Parallax navigation"
    >
      {links}
    </OverlaySidebar>
  )
}
