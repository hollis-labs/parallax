import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InspectionDialog,
} from "@hollis-labs/design-components"
import { Bot, LayoutGrid, MoreHorizontal } from "lucide-react"
import { type Ref, useRef } from "react"
import { type Preset, presets, type SessionRow } from "./model"

export function FluxHeader({
  row,
  chips,
  editable,
  onIntent,
  layout,
  onLayout,
  layoutOpen,
  onLayoutOpen,
  finalFocus,
  popupRef,
  onLayer,
}: {
  row: SessionRow | undefined
  chips: boolean
  editable: boolean
  onIntent: (action: string) => void
  layout: Preset
  onLayout: (preset: Preset) => void
  layoutOpen: boolean
  onLayoutOpen: (open: boolean) => void
  finalFocus: () => HTMLElement | false
  popupRef: Ref<HTMLDivElement>
  onLayer: (open: boolean) => void
}) {
  const presetGroup = useRef<HTMLFieldSetElement>(null)
  return (
    <>
      <div className="flux-header-brand" aria-hidden="true">
        A
      </div>
      <div className="flux-header-agent">
        <DropdownMenu onOpenChange={onLayer}>
          <DropdownMenuTrigger disabled={!editable} render={<Button size="sm" variant="ghost" />}>
            <Bot className="size-3.5" />
            Alex · fixture agent
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Alex", "Morgan", "Sam"].map((agent) => (
              <DropdownMenuItem key={agent} onClick={() => onIntent(`Switch agent to ${agent}`)}>
                {agent} · local specimen
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {chips && (
          <div className="flux-header-meta">
            <span className="flux-source-badge">{row?.kind ?? "Unknown source"}</span>
            <span title="Authored fictional model and tool">model · 1 tool</span>
          </div>
        )}
      </div>
      {chips && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onIntent("Context inspection")}
          disabled={!row}
          className="flux-header-context"
          title="8,000 / 32,000 tokens · fictional context operand"
        >
          8K / 32K
        </Button>
      )}
      <DropdownMenu onOpenChange={onLayer}>
        <DropdownMenuTrigger
          aria-label="More session options"
          disabled={!editable}
          render={<Button variant="ghost" size="sm" />}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[
            "Session details",
            "View agents",
            "Stop",
            "Resume",
            "Reboot",
            "Restart as new session",
            "Fork with history",
            "Plugin action",
          ].map((action) => (
            <DropdownMenuItem key={action} onClick={() => onIntent(action)}>
              {action} specimen
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        aria-label="Layout presets"
        size="sm"
        variant="ghost"
        onClick={() => onLayoutOpen(true)}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <InspectionDialog
        ref={popupRef}
        open={layoutOpen}
        onOpenChange={onLayoutOpen}
        title="Layout presets"
        meta="Local presentation preference · Mod Backslash opens this menu"
        initialFocus={() => presetGroup.current?.querySelector<HTMLInputElement>("input:checked")}
        finalFocus={finalFocus}
        className="h-auto"
        widthClassName="max-w-2xl"
        bodyProps={{ className: "p-4" }}
        footer={<Button onClick={() => onLayoutOpen(false)}>Close layout menu</Button>}
      >
        <div className="flux-layout-preview" aria-hidden="true" data-preset={layout}>
          {presets[layout].left && <div className="flux-preview-rail">Left rail</div>}
          <div className="flux-preview-main">
            <span>Agent {presets[layout].chips ? "· source · context" : ""}</span>
            <div className="flex-1" />
            <span>Conversation</span>
            <div className="flex-1" />
            <span>Native composer</span>
          </div>
          {presets[layout].right && <div className="flux-preview-rail">Evidence</div>}
        </div>
        <fieldset ref={presetGroup} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <legend className="mb-2 text-xs text-fg-muted">Preset (arrow keys switch)</legend>
          {(Object.keys(presets) as Preset[]).map((preset) => (
            <label className="flux-preset" key={preset}>
              <input
                type="radio"
                name="flux-layout"
                value={preset}
                checked={preset === layout}
                onChange={() => onLayout(preset)}
              />
              {preset}
            </label>
          ))}
        </fieldset>
        <p className="mt-3 text-caption text-fg-muted">
          Only the validated preset is stored. Drafts, search, active session, and open layers are
          transient.
        </p>
      </InspectionDialog>
    </>
  )
}
