import type { ReactNode } from "react"

/**
 * The lab's frame inside the app-shell page: the header controls and the content, with no second `main`
 * (the kit AppShell always renders one, and the app-shell already has one). It keeps the AppShell's root
 * classes so the host sizing in index.css and the theme lookups of the tests still find it. The Layouts page,
 * which demonstrates the kit AppShell's own aside and navigation variants, keeps the real AppShell.
 */
export function LabFrame({ header, children }: { header?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-bg text-fg">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <section aria-label="Lab content" data-lab-body className="flex min-h-0 flex-1 flex-col">
          {children}
        </section>
      </div>
    </div>
  )
}
