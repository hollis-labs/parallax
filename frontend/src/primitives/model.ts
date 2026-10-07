import type { Callout, Pill } from "@hollis-labs/design-components"
import type { ComponentProps } from "react"
import type { OperationsModel } from "../operations/model"
export const galleryStates = [
  "normal",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long",
  "unknown",
] as const
export type GalleryState = (typeof galleryStates)[number]
export function galleryModel(model: OperationsModel, state: GalleryState) {
  const readable = model.accessible && !["loading", "error", "denied"].includes(state)
  const editable = readable && !["locked", "empty"].includes(state)
  const tone: NonNullable<ComponentProps<typeof Pill>["tone"]> =
    state === "error"
      ? "danger"
      : state === "denied" || state === "locked"
        ? "warning"
        : state === "normal"
          ? "success"
          : state === "loading"
            ? "info"
            : "neutral"
  const items =
    readable && state !== "empty"
      ? model.tasks.map((task) => ({
          value: task.id,
          label: `${task.id} · ${task.title}${state === "long" ? " — bounded authored review context across regional environments and nested presentation details".repeat(3) : ""}`,
        }))
      : []
  const message =
    state === "unknown"
      ? "Unknown presentation status: future-review-phase. Neutral tone; recorded task state is unchanged."
      : state === "loading"
        ? "Scripted loading appearance; no request is made and records are withheld."
        : state === "error"
          ? "Scripted read failure; no previous record or draft is retained."
          : state === "denied"
            ? "Fixture access policy denies record presentation and actions."
            : state === "locked"
              ? "Recorded fields are readable; local intent and draft controls are locked."
              : state === "empty"
                ? "No records in this controlled gallery state."
                : "Fixed recorded snapshot. Selections, drafts and inspection outcomes exist only in this presentation."
  const calloutTone: ComponentProps<typeof Callout>["tone"] = tone
  const completed = readable
    ? state === "empty"
      ? 0
      : model.tasks.filter((task) => task.status === "done").length
    : null
  const total = readable ? (state === "empty" ? 0 : model.tasks.length) : null
  return {
    state,
    readable,
    editable,
    tone,
    calloutTone,
    items,
    message,
    completed,
    total,
    progress: readable ? (total ? ((completed ?? 0) / total) * 100 : 0) : null,
    source: `${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.cutoff}/${model.tasks.map((t) => t.id).join(",")}`,
    clock: model.referenceClock,
  }
}
