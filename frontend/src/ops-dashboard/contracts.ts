import type { PageHeader } from "@hollis-labs/kit-dashboard"
import type { IntelligenceRow, Kpi } from "@hollis-labs/kit-dashboard/widgets"
import type { ComponentProps } from "react"

const header: ComponentProps<typeof PageHeader> = {
  title: "Recorded review",
  children: "Local control",
}
const amount: ComponentProps<typeof Kpi> = { label: "Exact amount", value: 0, sub: "Observed0" }
const row: ComponentProps<typeof IntelligenceRow> = {
  label: "Supplied",
  value: "Unknown",
  status: "unavailable",
}
// @ts-expect-error PageHeader requires a supplied title.
const missing: ComponentProps<typeof PageHeader> = { children: "No title" }
void [header, amount, row, missing]
