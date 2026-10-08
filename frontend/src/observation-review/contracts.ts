import type {
  HealthSummaryProps,
  ObservationState,
  ObservationStatusProps,
  StatCollectionProps,
} from "@hollis-labs/kit-observe"
import type { SampleSeriesViewProps } from "@hollis-labs/kit-observe/charts"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type ObservationTypes = [
  Assert<NotAny<ObservationStatusProps>>,
  Assert<NotAny<HealthSummaryProps>>,
  Assert<NotAny<StatCollectionProps>>,
  Assert<NotAny<SampleSeriesViewProps>>,
]
// @ts-expect-error availability phase has a closed published vocabulary
const bad: ObservationState["phase"] = "healthy"
// @ts-expect-error currency is not a supported observation unit
const unit: SampleSeriesViewProps["unit"] = "USD"
void bad
void unit
