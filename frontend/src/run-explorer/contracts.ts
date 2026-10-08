import type {
  FilterBar,
  FilterChipGroup,
  FilterCycleToggle,
  FilterEntityCombobox,
} from "@hollis-labs/kit-dashboard/data"
import type { OperationsTablePage } from "@hollis-labs/kit-dashboard/layout"
import type { ComponentProps } from "react"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineFilterBar = Assert<NotAny<ComponentProps<typeof FilterBar>>>
export type GenuineChipGroup = Assert<NotAny<ComponentProps<typeof FilterChipGroup>>>
export type GenuineCycle = Assert<NotAny<ComponentProps<typeof FilterCycleToggle<string>>>>
export type GenuineEntity = Assert<NotAny<ComponentProps<typeof FilterEntityCombobox>>>
export type GenuineOperationsPage = Assert<
  NotAny<ComponentProps<typeof OperationsTablePage<{ id: string }>>>
>
const emptyCycle: ComponentProps<typeof FilterCycleToggle<string>> = {
  // @ts-expect-error published cycle options require a nonempty tuple
  options: [],
  value: "all",
  onChange: () => {},
  ariaLabel: "Review",
}
// @ts-expect-error entities require an actual stable ID, not arbitrary labels
const missingId: ComponentProps<typeof FilterEntityCombobox>["items"] = [{ name: "Unadmitted" }]
void emptyCycle
void missingId
