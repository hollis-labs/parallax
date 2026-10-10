import { useCallback, useSyncExternalStore } from "react"
import type {
  ChatPrimaryDrawerSessionState,
  ChatWorkingDrawerSessionState,
  DrawerPinnedCard,
  DrawerSessionState,
  DynamicCardTab,
} from "./types"

const STORAGE_KEY = "parallax_drawers_layout_v1"

export const DEFAULT_PRIMARY_DRAWER: ChatPrimaryDrawerSessionState = {
  open: true,
  height: 240,
  activeTab: "documents",
  pinnedCards: [],
}

export const DEFAULT_WORKING_DRAWER: ChatWorkingDrawerSessionState = {
  open: true,
  height: 200,
  activeTab: "scratchpad",
  cardTabs: [],
}

function emptySessionState(): DrawerSessionState {
  return {
    primaryDrawer: { ...DEFAULT_PRIMARY_DRAWER, pinnedCards: [] },
    workingDrawer: { ...DEFAULT_WORKING_DRAWER, cardTabs: [] },
  }
}

type StoreData = Record<string, DrawerSessionState>

let memoryStore: StoreData = {}
const listeners = new Set<() => void>()

function loadInitialStore(): StoreData {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoreData
      if (parsed && typeof parsed === "object") {
        return parsed
      }
    }
  } catch {
    // localStorage unavailable or security restricted
  }
  return {}
}

memoryStore = loadInitialStore()

function saveStore(next: StoreData) {
  memoryStore = next
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  } catch {
    // quota exceeded or blocked
  }
  listeners.forEach((listener) => {
    listener()
  })
}

export function getDrawerSessionState(sessionId: string): DrawerSessionState {
  if (!sessionId) return emptySessionState()
  const found = memoryStore[sessionId]
  if (!found) {
    return emptySessionState()
  }
  return {
    primaryDrawer: {
      ...DEFAULT_PRIMARY_DRAWER,
      ...found.primaryDrawer,
      pinnedCards: found.primaryDrawer?.pinnedCards ?? [],
    },
    workingDrawer: {
      ...DEFAULT_WORKING_DRAWER,
      ...found.workingDrawer,
      cardTabs: found.workingDrawer?.cardTabs ?? [],
    },
  }
}

export function setPrimaryDrawerState(
  sessionId: string,
  patch: Partial<ChatPrimaryDrawerSessionState>,
) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      ...patch,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function setWorkingDrawerState(
  sessionId: string,
  patch: Partial<ChatWorkingDrawerSessionState>,
) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      ...patch,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function appendWorkingDrawerCardTab(sessionId: string, tab: DynamicCardTab) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const existing = current.workingDrawer.cardTabs.filter((t) => t.id !== tab.id)
  const nextTabs = [...existing, tab]
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
      activeTab: tab.focused ? tab.id : current.workingDrawer.activeTab,
      open: true,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function removeWorkingDrawerCardTab(sessionId: string, tabId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const nextTabs = current.workingDrawer.cardTabs.filter((t) => t.id !== tabId)
  const nextPrimaryPinned = current.primaryDrawer.pinnedCards.filter((c) => c.id !== tabId)
  const activeWas = current.workingDrawer.activeTab === tabId
  const nextActive = activeWas ? DEFAULT_WORKING_DRAWER.activeTab : current.workingDrawer.activeTab
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
      activeTab: nextActive,
    },
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextPrimaryPinned,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function togglePinWorkingDrawerCardTab(sessionId: string, tabId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const target = current.workingDrawer.cardTabs.find((t) => t.id === tabId)
  if (!target) return
  const nextPinned = !target.pinned
  const nextTabs = current.workingDrawer.cardTabs.map((t) =>
    t.id === tabId ? { ...t, pinned: nextPinned } : t,
  )

  let nextPrimaryPinnedCards = current.primaryDrawer.pinnedCards
  if (nextPinned) {
    if (!nextPrimaryPinnedCards.some((c) => c.id === target.id)) {
      nextPrimaryPinnedCards = [
        ...nextPrimaryPinnedCards,
        {
          id: target.id,
          title: target.label,
          card_type: "dynamic-card",
          content_ref: target.id,
          payload:
            typeof target.payload === "string"
              ? target.payload
              : JSON.stringify(target.payload ?? {}),
        },
      ]
    }
  } else {
    nextPrimaryPinnedCards = nextPrimaryPinnedCards.filter((c) => c.id !== target.id)
  }

  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
    },
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextPrimaryPinnedCards,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function pinPrimaryDrawerCard(sessionId: string, card: DrawerPinnedCard) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const existing = current.primaryDrawer.pinnedCards.filter((c) => c.id !== card.id)
  const nextCards = [...existing, card]
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextCards,
      activeTab: `pin:${card.id}`,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function unpinPrimaryDrawerCard(sessionId: string, cardId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const nextCards = current.primaryDrawer.pinnedCards.filter((c) => c.id !== cardId)
  const activeWas = current.primaryDrawer.activeTab === `pin:${cardId}`
  const nextActive = activeWas ? DEFAULT_PRIMARY_DRAWER.activeTab : current.primaryDrawer.activeTab
  const nextWorkingTabs = current.workingDrawer.cardTabs.map((t) =>
    t.id === cardId ? { ...t, pinned: false } : t,
  )
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextCards,
      activeTab: nextActive,
    },
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextWorkingTabs,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function resetDrawerSession(sessionId: string) {
  if (!sessionId) return
  saveStore({
    ...memoryStore,
    [sessionId]: emptySessionState(),
  })
}

export function clearAllDrawerSessions() {
  saveStore({})
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDrawerSession(sessionId: string) {
  const getSnapshot = useCallback(() => {
    return JSON.stringify(getDrawerSessionState(sessionId))
  }, [sessionId])

  const rawState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const state: DrawerSessionState = rawState ? JSON.parse(rawState) : emptySessionState()

  const setPrimary = useCallback(
    (patch: Partial<ChatPrimaryDrawerSessionState>) => {
      setPrimaryDrawerState(sessionId, patch)
    },
    [sessionId],
  )

  const setWorking = useCallback(
    (patch: Partial<ChatWorkingDrawerSessionState>) => {
      setWorkingDrawerState(sessionId, patch)
    },
    [sessionId],
  )

  const appendCard = useCallback(
    (tab: DynamicCardTab) => {
      appendWorkingDrawerCardTab(sessionId, tab)
    },
    [sessionId],
  )

  const removeCard = useCallback(
    (tabId: string) => {
      removeWorkingDrawerCardTab(sessionId, tabId)
    },
    [sessionId],
  )

  const togglePinCard = useCallback(
    (tabId: string) => {
      togglePinWorkingDrawerCardTab(sessionId, tabId)
    },
    [sessionId],
  )

  const pinCard = useCallback(
    (card: DrawerPinnedCard) => {
      pinPrimaryDrawerCard(sessionId, card)
    },
    [sessionId],
  )

  const unpinCard = useCallback(
    (cardId: string) => {
      unpinPrimaryDrawerCard(sessionId, cardId)
    },
    [sessionId],
  )

  const reset = useCallback(() => {
    resetDrawerSession(sessionId)
  }, [sessionId])

  return {
    primaryDrawer: state.primaryDrawer,
    workingDrawer: state.workingDrawer,
    setPrimaryDrawer: setPrimary,
    setWorkingDrawer: setWorking,
    appendCardTab: appendCard,
    removeCardTab: removeCard,
    togglePinCardTab: togglePinCard,
    pinPrimaryCard: pinCard,
    unpinPrimaryCard: unpinCard,
    resetSession: reset,
  }
}
