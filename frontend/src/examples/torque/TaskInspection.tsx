import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useControlledRecordNavigation,
} from "@hollis-labs/design-components"
import { useRef } from "react"
import type { OperationsModel, RunDetail } from "../../operations/model"
import { ResourceNotice, RunDetailBody } from "../../operations/Views"
import { operationsMetadata } from "./operations-metadata"
import type { TorqueState } from "./routes"

// The record controller consumes only the board's admitted, loaded order.
export function TaskInspection({
  open,
  detail,
  model,
  state,
  cursor,
  onSelect,
  onClose,
  returnTarget,
  onIntent,
  intent,
}: {
  open: boolean
  detail: RunDetail | null
  model: OperationsModel
  state: TorqueState
  cursor: { identity: string; ids: string[] }
  onSelect: (id: string) => void
  onClose: () => void
  returnTarget: () => HTMLElement | null
  onIntent: (action: string, id: string) => void
  intent: string
}) {
  const title = useRef<HTMLHeadingElement>(null)
  const identity = JSON.stringify([
    state.profile,
    state.scenario,
    state.cutoff,
    state.override,
    state.query,
  ])
  const ids = model.accessible && cursor.identity === identity ? cursor.ids : []
  const navigation = useControlledRecordNavigation({
    orderedIds: ids,
    selectedId: detail?.task.id ?? null,
    active: open,
    accessible: model.accessible,
    sourceGeneration: identity,
    boundaryPolicy: "wrap",
    onSelect,
  })
  const position = navigation.position
  const metadata = detail ? operationsMetadata[detail.task.id] : undefined
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className="torque-task-inspection"
        widthClassName="torque-task-inspection-width"
        initialFocus={title}
        finalFocus={returnTarget}
        {...navigation.popupHandlers}
      >
        <header className="torque-inspection-header">
          <DialogTitle ref={title} tabIndex={-1}>
            Task and run inspection
          </DialogTitle>
          <p aria-live="polite">
            {detail ? `${detail.task.id} / ${detail.run.id}` : "No admitted selection"}
          </p>
        </header>
        <nav className="torque-inspection-navigation" aria-label="Inspection record navigation">
          <Button
            variant="outline"
            size="sm"
            disabled={!navigation.availability.previous}
            onClick={() => navigation.navigate(-1)}
            aria-keyshortcuts="ArrowLeft"
          >
            Previous task
          </Button>
          <span>
            {position >= 0
              ? `${position + 1} of ${ids.length} loaded tasks`
              : "Outside loaded board order"}{" "}
            · wraps · ← previous / → next
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!navigation.availability.next}
            onClick={() => navigation.navigate(1)}
            aria-keyshortcuts="ArrowRight"
          >
            Next task
          </Button>
        </nav>
        {/* Named overflow region supports native keyboard scrolling. */}
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: Named evidence scroll owner. */}
        <section className="torque-inspection-body" aria-label="Task evidence scroll" tabIndex={0}>
          {!model.accessible ? (
            <ResourceNotice model={model} />
          ) : detail ? (
            <>
              <RunDetailBody
                key={`${identity}/${detail.task.id}`}
                detail={detail}
                onIntent={onIntent}
              />
              <dl className="torque-inspection-metadata">
                <dt>Fictional board status</dt>
                <dd>
                  {model.scenario === "unknown-status"
                    ? detail.task.status
                    : (metadata?.status ?? "Unknown")}
                </dd>
                <dt>Priority / executor</dt>
                <dd>
                  {metadata ? `P${metadata.priority} / ${metadata.executor}` : "Not provided"}
                </dd>
                <dt>Project / epic / sprint</dt>
                <dd>
                  {metadata
                    ? `${metadata.project} / ${metadata.epic} / ${metadata.sprint}`
                    : "Not provided"}
                </dd>
                <dt>Tag / mode</dt>
                <dd>
                  {metadata
                    ? `${metadata.tag} / ${metadata.manual ? "manual" : "auto"}`
                    : "Not provided"}
                </dd>
              </dl>
            </>
          ) : (
            <p>No selected admitted task at this context. Close to choose a current task or run.</p>
          )}
        </section>
        <footer className="torque-inspection-footer">
          <span role="status">{intent || "Read-only fixture inspection"}</span>
          <Button size="sm" onClick={onClose}>
            Close record inspection
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
