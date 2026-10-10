import {
  Button,
  InspectionDialog,
  SearchPalette,
  useControlledRecordNavigation,
} from "@hollis-labs/design-components"
import { useRef, useState } from "react"
import { torqueSource } from "../examples/torque/reference"
import { operationsModel } from "../operations/model"
import { TorqueModalProof } from "../operations-list-proof/Proof"

const source = operationsModel("populated", "", { source: torqueSource("populated", "torque-16w") })
/** Second source and dashboard idiom: fictional Torque projection + landed list shell. */
export function TorqueSearchProof() {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const origin = useRef<HTMLButtonElement>(null),
    title = useRef<HTMLHeadingElement>(null)
  const matches = source.tasks
    .filter((task) => `${task.id} ${task.title}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12)
  const nav = useControlledRecordNavigation({
    orderedIds: source.tasks.map((task) => task.id),
    selectedId: selected,
    active: selected !== null,
    accessible: source.accessible,
    sourceGeneration: source.cutoff,
    boundaryPolicy: "stop",
    onSelect: setSelected,
  })
  const task = source.tasks.find((row) => row.id === selected)
  return (
    <div className="bg-bg text-fg">
      <div className="flex flex-wrap gap-3 border-b border-border p-3">
        <Button ref={origin} onClick={() => setOpen(true)}>
          Search Torque projection
        </Button>
        <span className="text-caption text-fg-muted">
          Seed 4421 · Fixed source 2026-10-04T14:30Z · local inert intents
        </span>
      </div>
      <TorqueModalProof />
      <SearchPalette
        open={open}
        onOpenChange={setOpen}
        title="Search Torque operations"
        query={query}
        onQueryChange={setQuery}
        options={matches.map((task) => ({
          id: task.id,
          label: (
            <span>
              <span className="font-mono text-caption">{task.id}</span> · {task.title} ·{" "}
              {task.status}
            </span>
          ),
        }))}
        sourceGeneration={source.cutoff}
        accessible={source.accessible}
        onSelect={(id) => {
          setOpen(false)
          setSelected(id)
        }}
        showFullscreenToggle
        returnFocus={{ trigger: () => origin.current, isAdmitted: () => source.accessible }}
      />
      <InspectionDialog
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelected(null)
        }}
        title={task?.title ?? "No current task"}
        titleProps={{ ref: title, tabIndex: -1 }}
        initialFocus={title}
        returnFocus={{ trigger: () => origin.current, isAdmitted: () => source.accessible }}
        showFullscreenToggle
        meta={
          <span>
            {task?.id} · {task?.status}
          </span>
        }
        {...nav.popupHandlers}
        navigation={
          <>
            <Button onClick={() => nav.navigate(-1)} disabled={!nav.availability.previous}>
              Previous task
            </Button>
            <Button onClick={() => nav.navigate(1)} disabled={!nav.availability.next}>
              Next task
            </Button>
          </>
        }
        navigationLabel="Torque task order"
      >
        <div className="space-y-3 p-4">
          <p>
            Read-only task inspection; the title owns initial focus and horizontal record
            navigation.
          </p>
          <p>Owner: {task?.owner ?? "Unassigned"}</p>
          <p>Fixed projection: {source.cutoff}</p>
        </div>
      </InspectionDialog>
    </div>
  )
}
