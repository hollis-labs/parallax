import type { ReactNode } from "react"

export interface ChatDrawerTab {
  id: string
  label: string
  /** True for the currently selected tab. */
  active: boolean
  /** Optional pulsing-pip indicator (e.g. Tools tab during a stream). */
  runningPip?: boolean
  /** Closeable tabs render an `×` on hover/focus. Used for dynamic card-tabs. */
  closeable?: boolean
  /** Pinnable tabs render a Pin / PinOff toggle on hover/focus. */
  pinnable?: boolean
  pinned?: boolean
  /** Optional badge count. */
  count?: number
  /** Optional leading icon. */
  icon?: ReactNode
}

export interface DynamicCardTab {
  id: string
  label: string
  payload: Record<string, unknown>
  focused?: boolean
  pinned?: boolean
  createdAt: number
}

export interface DrawerPinnedCard {
  id: string
  card_type: string
  content_ref: string
  title: string
  payload: string
}

export type DrawerPlacement = "top" | "bottom"
export type DrawerTabStripVariant = "card" | "inline"

export interface ChatDrawerState {
  open: boolean
  height: number
  activeTab: string
}

export interface ChatPrimaryDrawerSessionState extends ChatDrawerState {
  pinnedCards: DrawerPinnedCard[]
}

export interface ChatWorkingDrawerSessionState extends ChatDrawerState {
  cardTabs: DynamicCardTab[]
}

export interface DrawerSessionState {
  primaryDrawer: ChatPrimaryDrawerSessionState
  workingDrawer: ChatWorkingDrawerSessionState
}
