import type { Metric } from "@hollis-labs/design-components"
import type {
  DonutChart,
  MiniTrend,
  RecentList,
  SignalBars,
  Sparkbars,
} from "@hollis-labs/kit-dashboard/widgets"
import type { ComponentProps } from "react"

type IsAny<T> = 0 extends 1 & T ? true : false
type NotAny<T extends false> = T
export type SignalTyped = NotAny<IsAny<ComponentProps<typeof SignalBars>>>
export type SparkTyped = NotAny<IsAny<ComponentProps<typeof Sparkbars>>>
export type DonutTyped = NotAny<IsAny<ComponentProps<typeof DonutChart>>>
export type MiniTyped = NotAny<IsAny<ComponentProps<typeof MiniTrend>>>
export type RecentTyped = NotAny<IsAny<ComponentProps<typeof RecentList>>>
export type MetricTyped = NotAny<IsAny<ComponentProps<typeof Metric>>>
// @ts-expect-error: numeric-only public samples cannot encode unavailable observations.
export const unsupportedSample: ComponentProps<typeof Sparkbars>["data"] = [null]
// @ts-expect-error: Metric accent is a bounded token contract, not arbitrary CSS.
export const unsupportedMetricAccent: ComponentProps<typeof Metric>["accent"] = "external-status"
