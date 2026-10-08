import type {
  Connection,
  Edge,
  NodeAction,
  NodeDescription,
  NodeFooter,
  Panel,
  Toolbar,
} from "@hollis-labs/kit-workflow/canvas"
import type { ComponentProps } from "react"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineDescription = Assert<NotAny<ComponentProps<typeof NodeDescription>>>
export type GenuineAction = Assert<NotAny<ComponentProps<typeof NodeAction>>>
export type GenuineFooter = Assert<NotAny<ComponentProps<typeof NodeFooter>>>
export type GenuineToolbar = Assert<NotAny<ComponentProps<typeof Toolbar>>>
export type GenuinePanel = Assert<NotAny<ComponentProps<typeof Panel>>>
export type GenuineConnection = Assert<NotAny<ComponentProps<typeof Connection>>>
export type GenuineAnimated = Assert<NotAny<ComponentProps<typeof Edge.Animated>>>
export type GenuineTemporary = Assert<NotAny<ComponentProps<typeof Edge.Temporary>>>
const bad: ComponentProps<typeof Connection> = {
  fromX: 0,
  fromY: 0,
  toX: 1,
  toY: 1,
  // @ts-expect-error raw unknown cannot masquerade as a supported connection validation
  connectionStatus: "success",
}
void bad
