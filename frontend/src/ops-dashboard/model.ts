import type { OperationsModel } from "../operations/model"
export function dashboardMetrics(model: OperationsModel) {
  const rows = model.usage.filter((u) =>
    model.runs.some((r) => r.usageId === u.id && r.id === u.runId),
  )
  const receiptsKnown = model.accessible && (!model.runs.length || rows.length > 0)
  return {
    source: `${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.resource}/${model.cutoff}/${model.tasks.map((t) => t.id).join(",")}`,
    total: model.accessible ? model.tasks.length : null,
    activeTasks: model.accessible
      ? model.tasks.filter((t) => !["archived", "done"].includes(t.status)).length
      : null,
    done: model.accessible ? model.tasks.filter((t) => t.status === "done").length : null,
    runs: model.accessible ? model.runs.length : null,
    receipts: model.accessible ? rows.length : null,
    tokens: receiptsKnown ? rows.reduce((sum, u) => sum + u.tokens, 0) : null,
    cost: receiptsKnown ? rows.reduce((sum, u) => sum + u.cost, 0) : null,
  }
}
